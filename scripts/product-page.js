// scripts/product-page.js
import { getProductBySlug, formatMoney } from "./products.js";
import { addToCart } from "./cart-store.js";

const root = document.getElementById("productRoot");
const params = new URLSearchParams(location.search);

const slug = params.get("slug");
const presetSize = params.get("SIZE");

function assetUrl(path) {
  if (!path) return "";
  const clean = String(path).replace(/^(\.\/|\/)/, "");
  return location.pathname.includes("/pages/") ? `../${clean}` : `./${clean}`;
}

if (!root) throw new Error("Не найден #productRoot в product.html");

if (!slug) {
  root.innerHTML = `
    <p>Нет slug.</p>
    <p>Открой так: <code>./product.html?slug=green-oxygen-heavy-jacket&SIZE=S</code></p>
  `;
  throw new Error("Missing slug");
}

const product = getProductBySlug(slug);

if (!product) {
  root.innerHTML = `<p>Товар не найден: <code>${slug}</code></p>`;
  throw new Error("Product not found");
}

// ====== SIZING HELPERS ======
function ensureCm(product) {
  const rows = product.sizing?.rows || [];
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
  if (!items.length) return "";
  return `<ul class="pdp-col__bullets">${items.map((t) => `<li>${t}</li>`).join("")}</ul>`;
}

function renderDetailsTab(product) {
  return `
    ${renderBullets(product.details || [])}
    ${product.disclaimer ? `<p class="pdp-col__note">${product.disclaimer}</p>` : ""}
  `;
}

function renderShippingTab(product) {
  return renderBullets(product.shippingList || []);
}

// ====== TABLE WITH ONE BUTTON ======
function renderSizingTable(product, unit = "in") {
  const sizing = product.sizing || {};
  const cols = sizing.columns || [];
  const rows = sizing.rows || [];

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
            <button
              type="button"
              class="pdp-unit-toggle ${unit === "cm" ? "is-active" : ""}"
              data-action="toggle-unit"
            >IN / CM</button>
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

// ====== PAGE STATE ======
ensureCm(product);

const titleMain = product.title ?? "";
const titleSub = product.subtitle ?? "";

const heroRaw = product.img || product.images?.[0] || "";
const thumbsRaw = [heroRaw, ...(product.images || [])].filter(Boolean);
const uniqThumbsRaw = Array.from(new Set(thumbsRaw));

const hero = assetUrl(heroRaw);
const thumbs = uniqThumbsRaw.map(assetUrl);

let selectedSize =
  presetSize && product.sizes?.includes(presetSize) ? presetSize : null;

let activeImg = hero || thumbs[0] || "";
let activeTab = "details";
let fitUnit = "in";

function setUrlSize(size) {
  const u = new URL(location.href);
  u.searchParams.set("SIZE", size);
  history.replaceState({}, "", u);
}

function getTabLabel(key) {
  if (key === "details") return "DETAILS";
  if (key === "fit") return "FIT / SIZING";
  if (key === "shipping") return "SHIPPING";
  return key.toUpperCase();
}

function render() {
  const priceStr = formatMoney(product.price, product.currency);

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

        <div class="pdp-col__price" data-money data-usd="${Number(product.price).toFixed(2)}">
          ${priceStr}
        </div>

        <div class="pdp-col__sizes">
          <div class="pdp-col__size-row">
            ${(product.sizes || [])
      .map(
        (s) => `
                  <button class="pdp-col__size ${selectedSize === s ? "is-active" : ""}"
                          type="button"
                          data-action="size"
                          data-size="${s}">
                    ${s}
                  </button>
                `
      )
      .join("")}
          </div>
        </div>

        <button class="pdp-col__cta" type="button" data-action="add" ${selectedSize ? "" : "disabled"}>
          ${product.cta ?? "ADD"}
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
  if (!btn) return;

  const action = btn.dataset.action;

  if (action === "thumb") {
    const idx = Number(btn.dataset.idx);
    activeImg = thumbs[idx] ?? activeImg;
    render();
    return;
  }

  if (action === "size") {
    selectedSize = btn.dataset.size;
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

    addToCart({
      slug: product.slug,
      size: selectedSize,
      qty: 1,
      title: product.title,
      subtitle: product.subtitle,
      price: product.price,
      currency: product.currency,
      img: product.img,
    });

    return;
  }
});

render();