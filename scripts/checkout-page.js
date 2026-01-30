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

function assetUrl(path) {
  if (!path) return "";
  const clean = String(path).replace(/^(\.\/|\/)/, "");
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

function renderTotals() {
  const cart = getCart();
  const subtotalUSD = calcSubtotalUSD(cart);

  const country = getSelectedCountry();
  const shippingUSD = calcShippingUSD(country);
  const totalUSD = subtotalUSD + shippingUSD;

  setMoney(document.querySelector("[data-subtotal-usd]"), subtotalUSD);
  setMoney(document.querySelector("[data-shipping-usd]"), shippingUSD);
  setMoney(document.querySelector("[data-total-usd]"), totalUSD);

  const shippingHint = document.querySelector("[data-shipping-hint]");
  if (shippingHint) {
    shippingHint.textContent = country ? "" : "Enter shipping address";
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
  const shippingUSD = calcShippingUSD(country);
  const totalUSD = subtotalUSD + shippingUSD;

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
        <input class="summary__code" type="text" placeholder="Discount code or gift card" />
        <button class="summary__apply" type="button">Apply</button>
      </div>

      <div class="summary__totals">
        <div class="summary-row">
          <span>Subtotal</span>
          <b data-subtotal-usd>${moneyTemplate(subtotalUSD)}</b>
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
    if (e.target.closest(".summary__apply")) {
      alert("Promo codes are disabled in this demo.");
    }
  });

  const form = document.getElementById("checkoutForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Demo checkout — payment is disabled.");
    });
  }
})();