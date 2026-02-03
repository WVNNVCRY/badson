import { getCart, calcSubtotalUSD } from "./cart-store.js";

const SHIPPING_USD_BY_COUNTRY = {
  "United States": 12,
  Canada: 18,
  France: 28,
  Germany: 28,
  Spain: 30,
  Italy: 30,
  China: 29,
  Japan: 32,
  "South Korea": 32,
  "United Kingdom": 26,
  Australia: 34,
  "New Zealand": 36,
};

const SHIPPING_STORAGE_KEY = "badson_shipping_country_v1";
const PROMO_STORAGE_KEY = "badson_promo_v1";

const PROMOS = {
  BADSON10: { type: "percent", value: 10, minSubtotal: 0, label: "10% off" },
  WELCOME15: { type: "percent", value: 15, minSubtotal: 120, label: "15% off orders $120+" },
  FREESHIP: { type: "freeship", value: 0, minSubtotal: 0, label: "Free shipping" },
  TAKE20: { type: "fixed", value: 20, minSubtotal: 150, label: "$20 off orders $150+" },
};

const CMS_URL = "http://localhost:1337";

function assetUrl(path) {
  if (!path) return "";
  const p = String(path);

  if (/^https?:\/\//i.test(p)) return p;
  if (p.startsWith("/uploads/")) return `${CMS_URL}${p}`;

  const clean = p.replace(/^(\.\/|\/)/, "");
  return location.pathname.includes("/pages/") ? `../${clean}` : `./${clean}`;
}

function moneyTemplate(usdValue) {
  const v = Number(usdValue) || 0;
  return `<span data-money data-usd="${v.toFixed(2)}">$${v.toFixed(2)}</span>`;
}

function getSelectedCountry() {
  const select = document.querySelector("[data-country-select]");
  if (!select) return null;
  return select.value?.trim() || null;
}

function setSelectedCountry(country) {
  const select = document.querySelector("[data-country-select]");
  if (!select || !country) return;
  select.value = country;
}

function calcShippingUSD(country) {
  if (!country) return 0;
  return Number(SHIPPING_USD_BY_COUNTRY[country] ?? 0);
}

function setMoney(el, usd) {
  if (!el) return;

  const moneyEl = el.matches("[data-money]") ? el : el.querySelector("[data-money]");
  if (!moneyEl) return;

  const v = Number(usd) || 0;
  moneyEl.dataset.usd = v.toFixed(2);
  moneyEl.textContent = `$${v.toFixed(2)}`;
}

function getPromoCode() {
  const saved = localStorage.getItem(PROMO_STORAGE_KEY);
  const code = String(saved || "").trim().toUpperCase();
  return code || null;
}

function setPromoCode(code) {
  const v = String(code || "").trim().toUpperCase();
  if (!v) {
    localStorage.removeItem(PROMO_STORAGE_KEY);
    return null;
  }
  localStorage.setItem(PROMO_STORAGE_KEY, v);
  return v;
}

function computeDiscountUSD({ subtotalUSD, shippingUSD, promoCode }) {
  if (!promoCode) return { discountUSD: 0, shippingUSD, ok: false, reason: "" };

  const rule = PROMOS[promoCode];
  if (!rule) return { discountUSD: 0, shippingUSD, ok: false, reason: "Invalid code" };

  if (subtotalUSD < (Number(rule.minSubtotal) || 0)) {
    return {
      discountUSD: 0,
      shippingUSD,
      ok: false,
      reason: `Minimum subtotal is $${Number(rule.minSubtotal).toFixed(2)}`,
    };
  }

  if (rule.type === "percent") {
    const d = (subtotalUSD * (Number(rule.value) || 0)) / 100;
    return { discountUSD: Math.min(subtotalUSD, d), shippingUSD, ok: true, reason: rule.label || "" };
  }

  if (rule.type === "fixed") {
    const d = Number(rule.value) || 0;
    return { discountUSD: Math.min(subtotalUSD, d), shippingUSD, ok: true, reason: rule.label || "" };
  }

  if (rule.type === "freeship") {
    return { discountUSD: 0, shippingUSD: 0, ok: true, reason: rule.label || "" };
  }

  return { discountUSD: 0, shippingUSD, ok: false, reason: "Invalid code" };
}

function renderTotals(extra = {}) {
  const cart = getCart();
  const subtotalUSD = calcSubtotalUSD(cart);

  const country = getSelectedCountry();
  const shippingBaseUSD = calcShippingUSD(country);

  const promoCode = extra.promoCode ?? getPromoCode();
  const computed = computeDiscountUSD({
    subtotalUSD,
    shippingUSD: shippingBaseUSD,
    promoCode,
  });

  const shippingUSD = computed.shippingUSD;
  const discountUSD = computed.discountUSD;
  const totalUSD = Math.max(0, subtotalUSD - discountUSD + shippingUSD);

  setMoney(document.querySelector("[data-subtotal-usd]"), subtotalUSD);
  setMoney(document.querySelector("[data-shipping-usd]"), shippingUSD);
  setMoney(document.querySelector("[data-discount-usd]"), discountUSD);
  setMoney(document.querySelector("[data-total-usd]"), totalUSD);

  const shippingHint = document.querySelector("[data-shipping-hint]");
  if (shippingHint) {
    shippingHint.textContent = country ? "" : "Enter shipping address";
  }

  const discountRow = document.querySelector("[data-discount-row]");
  if (discountRow) {
    discountRow.hidden = !(discountUSD > 0);
  }

  const promoMsg = document.querySelector("[data-promo-msg]");
  if (promoMsg) {
    promoMsg.textContent = computed.ok ? (computed.reason || "") : (promoCode ? computed.reason : "");
  }

  const promoInput = document.querySelector("[data-promo-input]");
  if (promoInput) {
    promoInput.value = promoCode || "";
  }

  if (window.Currency?.apply) window.Currency.apply();
}

function initShipping() {
  const select = document.querySelector("[data-country-select]");
  if (!select) return;

  const saved = localStorage.getItem(SHIPPING_STORAGE_KEY);
  if (saved && SHIPPING_USD_BY_COUNTRY[saved]) {
    setSelectedCountry(saved);
  }

  select.addEventListener("change", () => {
    localStorage.setItem(SHIPPING_STORAGE_KEY, select.value);
    renderTotals();
  });
}

function renderEmpty(root) {
  root.innerHTML = `
    <div class="summary-empty">
      <div class="summary-empty__title">Cart is empty</div>
      <a class="summary-empty__link" href="${location.pathname.includes("/pages/") ? "../index.html" : "./index.html"}">
        Continue shopping
      </a>
    </div>
  `;
}

function renderSummary(root) {
  const cart = getCart();

  if (!cart.length) {
    renderEmpty(root);
    if (window.Currency?.apply) window.Currency.apply();
    return;
  }

  const subtotalUSD = calcSubtotalUSD(cart);
  const country = getSelectedCountry();
  const shippingBaseUSD = calcShippingUSD(country);

  const promoCode = getPromoCode();
  const computed = computeDiscountUSD({
    subtotalUSD,
    shippingUSD: shippingBaseUSD,
    promoCode,
  });

  const shippingUSD = computed.shippingUSD;
  const discountUSD = computed.discountUSD;
  const totalUSD = Math.max(0, subtotalUSD - discountUSD + shippingUSD);

  root.innerHTML = `
    <div class="summary">
      <div class="summary__list">
        ${cart
      .map((it) => {
        const img = assetUrl(it.img);
        const qty = Number(it.qty) || 1;
        const lineUSD = (Number(it.price) || 0) * qty;

        return `
              <div class="summary-item">
                <div class="summary-item__imgwrap">
                  <img class="summary-item__img" src="${img}" alt="" />
                  <span class="summary-item__qty">${qty}</span>
                </div>

                <div class="summary-item__meta">
                  <div class="summary-item__title">${it.title || ""}</div>
                  <div class="summary-item__sub">${it.subtitle || ""}</div>
                  <div class="summary-item__sub">Size: ${it.size || ""}</div>
                </div>

                <div class="summary-item__price">${moneyTemplate(lineUSD)}</div>
              </div>
            `;
      })
      .join("")}
      </div>

      <div class="summary__discount">
        <input class="summary__code" type="text" placeholder="Discount code or gift card" data-promo-input />
        <button class="summary__apply" type="button" data-promo-apply>Apply</button>
      </div>

      <div class="summary__totals">
        <div class="summary-row">
          <span>Subtotal</span>
          <b data-subtotal-usd>${moneyTemplate(subtotalUSD)}</b>
        </div>

        <div class="summary-row" data-discount-row ${discountUSD > 0 ? "" : "hidden"}>
          <span>Discount</span>
          <b data-discount-usd>${moneyTemplate(discountUSD)}</b>
        </div>

        <div class="summary-row">
          <span>Shipping</span>
          <span class="muted" data-shipping-hint>${country ? "" : "Enter shipping address"}</span>
          <b data-shipping-usd>${moneyTemplate(shippingUSD)}</b>
        </div>

        <div class="summary-row summary-row--total">
          <span>Total</span>
          <b>USD <span data-total-usd>${moneyTemplate(totalUSD)}</span></b>
        </div>

        <div class="summary-row">
          <span></span>
          <span class="muted" data-promo-msg>${computed.ok ? (computed.reason || "") : (promoCode ? computed.reason : "")}</span>
        </div>
      </div>
    </div>
  `;

  if (window.Currency?.apply) window.Currency.apply();
}

(function initCheckout() {
  const summaryRoot = document.getElementById("checkoutSummary");
  if (!summaryRoot) return;

  initShipping();
  renderSummary(summaryRoot);
  renderTotals();

  window.addEventListener("cart:change", () => {
    renderSummary(summaryRoot);
    renderTotals();
  });

  summaryRoot.addEventListener("click", (e) => {
    if (e.target.closest("[data-promo-apply]")) {
      const input = summaryRoot.querySelector("[data-promo-input]");
      const code = input ? input.value : "";
      const saved = setPromoCode(code);
      renderSummary(summaryRoot);
      renderTotals({ promoCode: saved });
    }
  });
})();