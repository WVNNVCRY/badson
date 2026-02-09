import { fetchProductBySlug } from "./cms.js";
import { addToCart } from "./cart-store.js";

function assetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const clean = String(path).replace(/^(\.\/|\/)/, "");
  return location.pathname.includes("/pages/") ? `../${clean}` : `./${clean}`;
}

function formatMoneyUSD(amount) {
  const n = Number(amount) || 0;
  return `$${n.toFixed(2)}`;
}

function ensureCm(product) {
  const rows = product?.sizing?.rows || [];
  rows.forEach((r) => {
    if (!r.cm && Array.isArray(r.in)) {
      r.cm = r.in.map((v) => {
        const n = Number(v);
        if (Number.isNaN(n)) return "";
        return Math.round(n * 2.54 * 10) / 10;
      });
    }
  });
}

function renderBullets(items = []) {
  if (!Array.isArray(items) || !items.length) {
    return `<div class="pdp-empty">No info yet.</div>`;
  }
  return `<ul class="pdp-col__bullets">${items.map((t) => `<li>${t}</li>`).join("")}</ul>`;
}

function renderDetailsTab(product) {
  const has = (product.details && product.details.length) || product.disclaimer;
  if (!has) return `<div class="pdp-empty">No details yet.</div>`;
  return `
    ${renderBullets(product.details || [])}
    ${product.disclaimer ? `<p class="pdp-col__note">${product.disclaimer}</p>` : ""}
  `;
}

function renderShippingTab(product) {
  return renderBullets(product.shippingList || []);
}

function renderSizingTable(product, unit = "in") {
  const sizing = product.sizing || {};
  const cols = sizing.columns || [];
  const rows = sizing.rows || [];

  if (!cols.length || !rows.length) {
    return `<div class="pdp-empty">No sizing yet.</div>`;
  }

  const head = cols.map((c) => `<th scope="col">${c}</th>`).join("");

  const body = rows
    .map((r) => {
      const values = (r[unit] || []).map((v) => `<td>${v}</td>`).join("");
      return `
        <tr>
          <th scope="row">${r.key}</th>
          ${values}
        </tr>
      `;
    })
    .join("");

  return `
    <table class="pdp-table" data-sizing-table data-unit="${unit}">
      <thead>
        <tr>
          <th scope="col" class="pdp-table__first">
            <button type="button" class="pdp-unit-toggle" data-action="toggle-unit">
              <span class="${unit === "in" ? "is-active" : ""}">IN</span> /
              <span class="${unit === "cm" ? "is-active" : ""}">CM</span>
            </button>
          </th>
          ${head}
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function renderFitTab(product, unit = "in") {
  const notes = product.sizing?.notes || [];
  return `
    ${renderBullets(notes)}
    <div class="pdp-table-wrap">
      ${renderSizingTable(product, unit)}
    </div>
  `;
}

function getTabLabel(key) {
  if (key === "details") return "DETAILS";
  if (key === "fit") return "FIT / SIZING";
  if (key === "shipping") return "SHIPPING";
  return String(key).toUpperCase();
}

function setUrlSize(size) {
  const u = new URL(location.href);
  u.searchParams.set("SIZE", size);
  history.replaceState({}, "", u);
}

function renderSkeleton(root) {
  root.innerHTML = `
    <section class="pdp-col skeleton" aria-hidden="true">
      <div class="pdp-col__wrap">
        <div class="pdp-col__hero"><div class="skeleton-box skeleton-hero"></div></div>
        <div class="pdp-col__thumbs">
          ${Array.from({ length: 5 }).map(() => `<div class="skeleton-box skeleton-thumb"></div>`).join("")}
        </div>
        <div class="skeleton-box skeleton-h1"></div>
        <div class="skeleton-box skeleton-price"></div>
        <div class="pdp-col__sizes">
          <div class="pdp-col__size-row">
            ${Array.from({ length: 5 }).map(() => `<div class="skeleton-box skeleton-chip"></div>`).join("")}
          </div>
        </div>
        <div class="skeleton-box skeleton-cta"></div>
        <div class="pdp-col__tabs">
          <div class="skeleton-box skeleton-tab"></div>
          <div class="skeleton-box skeleton-tab"></div>
          <div class="skeleton-box skeleton-tab"></div>
        </div>
        <div class="pdp-col__panel">
          ${Array.from({ length: 4 }).map(() => `<div class="skeleton-box skeleton-line"></div>`).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderError(root, msg) {
  root.innerHTML = `
    <div class="pdp-error">
      <div class="pdp-error__title">Error</div>
      <div class="pdp-error__text">${msg}</div>
      <a class="pdp-error__btn" href="../index.html">Back to catalog</a>
    </div>
  `;
}

const root = document.getElementById("productRoot");
if (!root) throw new Error("Missing #productRoot in product.html");

const params = new URLSearchParams(location.search);
const slug = params.get("slug");
const presetSize = params.get("SIZE");

if (!slug) {
  renderError(root, "Missing slug in URL.");
  throw new Error("Missing slug");
}

renderSkeleton(root);

let product = null;
let selectedSize = null;
let activeImg = "";
let activeTab = "details";
let fitUnit = "in";
let thumbs = [];

function getSizes() {
  return Array.isArray(product?.sizes) ? product.sizes : [];
}

function isSizeAvailable(s) {
  return s && !s.isSoldOut && Number(s.stock ?? 0) > 0;
}

function hasAnyAvailableSize() {
  return getSizes().some(isSizeAvailable);
}

function initSelectedSize() {
  const sizes = getSizes();
  const opt = sizes.find((s) => s.label === presetSize);
  if (opt && isSizeAvailable(opt)) return opt.label;
  return null;
}

function buildGallery() {
  const heroRaw = product.img || product.images?.[0] || "";
  const thumbsRaw = [heroRaw, ...(product.images || [])].filter(Boolean);
  const uniq = Array.from(new Set(thumbsRaw));
  thumbs = uniq.map(assetUrl);
  activeImg = assetUrl(heroRaw) || thumbs[0] || "";
}

function render() {
  const titleMain = product.title ?? "";
  const titleSub = product.subtitle ?? "";
  const priceValue = Number(product.price) || 0;
  const priceStr = formatMoneyUSD(priceValue);

  const sizes = getSizes();
  const anyAvailable = hasAnyAvailableSize();

  const ctaBase = product.cta ?? "ADD";
  const ctaLabel = anyAvailable ? ctaBase : "SOLD OUT";
  const ctaDisabled = !anyAvailable || !selectedSize;

  root.innerHTML = `
    <section class="pdp-col">
      <div class="pdp-col__wrap">

        <div class="pdp-col__hero">
          ${activeImg ? `<img class="pdp-col__hero-img" src="${activeImg}" alt="">` : ""}
        </div>

        <div class="pdp-col__thumbs">
          ${thumbs
      .map(
        (src, idx) => `
                <button class="pdp-col__thumb ${src === activeImg ? "is-active" : ""}"
                        type="button"
                        data-action="thumb"
                        data-idx="${idx}">
                  <img src="${src}" alt="">
                </button>
              `
      )
      .join("")}
        </div>

        <h1 class="pdp-col__title">
          ${titleMain}
          ${titleSub ? `<div class="pdp-col__subtitle">${titleSub}</div>` : ""}
        </h1>

        <div class="pdp-col__price" data-money data-usd="${priceValue.toFixed(2)}">
          ${priceStr}
        </div>

        <div class="pdp-col__sizes">
          <div class="pdp-col__size-row">
            ${sizes
      .map((s) => {
        const label = s.label || "";
        const sold = !isSizeAvailable(s);
        return `
                  <button class="pdp-col__size ${selectedSize === label ? "is-active" : ""} ${sold ? "is-soldout" : ""}"
                          type="button"
                          data-action="size"
                          data-size="${label}"
                          ${sold ? "disabled" : ""}>
                    ${label}
                  </button>
                `;
      })
      .join("")}
          </div>
          ${!sizes.length ? `<div class="pdp-empty">No sizes yet.</div>` : ""}
        </div>

        <button class="pdp-col__cta" type="button" data-action="add" ${ctaDisabled ? "disabled" : ""}>
          ${ctaLabel}
        </button>

        <div class="pdp-col__tabs">
          ${["details", "fit", "shipping"]
      .map(
        (k) => `
                <button class="pdp-col__tab ${activeTab === k ? "is-active" : ""}"
                        type="button"
                        data-action="tab"
                        data-tab="${k}">
                  ${getTabLabel(k)}
                </button>
              `
      )
      .join("")}
        </div>

        <div class="pdp-col__panel">
          ${activeTab === "details"
      ? renderDetailsTab(product)
      : activeTab === "fit"
        ? renderFitTab(product, fitUnit)
        : renderShippingTab(product)
    }
        </div>

      </div>
    </section>
  `;

  if (window.Currency?.apply) window.Currency.apply();
}

root.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn || !product) return;

  const action = btn.dataset.action;

  if (action === "thumb") {
    const idx = Number(btn.dataset.idx);
    activeImg = thumbs[idx] ?? activeImg;
    render();
    return;
  }

  if (action === "size") {
    const label = btn.dataset.size || null;
    const opt = getSizes().find((s) => s.label === label);
    if (!opt || !isSizeAvailable(opt)) return;
    selectedSize = label;
    setUrlSize(selectedSize);
    render();
    return;
  }

  if (action === "tab") {
    activeTab = btn.dataset.tab;
    render();
    return;
  }

  if (action === "toggle-unit") {
    if (activeTab !== "fit") return;
    fitUnit = fitUnit === "in" ? "cm" : "in";
    render();
    return;
  }

  if (action === "add") {
    if (!selectedSize) return;
    const opt = getSizes().find((s) => s.label === selectedSize);
    if (!opt || !isSizeAvailable(opt)) return;

    const sku = opt?.sku || `${product.slug}-${selectedSize}`;

    addToCart({
      sku,
      slug: product.slug,
      size: selectedSize,
      qty: 1,
      title: product.title,
      subtitle: product.subtitle,
      price: product.price,
      currency: product.currency || "USD",
      img: product.img || product.images?.[0] || "",
    });
  }
});

try {
  const base = await fetchProductBySlug(slug);
  if (!base) {
    renderError(root, `Product not found: ${slug}`);
    throw new Error("Product not found");
  }

  product = {
    ...base,
    price: Number(base.price ?? base.priceUSD ?? 0),
    currency: base.currency || "USD",
    images: base.images || [],
    img: base.img || "",
    slug: base.slug || slug,
    title: base.title || "",
    subtitle: base.subtitle || "",
  };

  ensureCm(product);
  buildGallery();
  selectedSize = initSelectedSize();
  render();
} catch (err) {
  console.error(err);
  renderError(root, "Failed to load product. Open console.");
}