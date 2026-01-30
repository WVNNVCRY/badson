import { getCart, incQty, decQty, removeFromCart, calcSubtotalUSD } from "./cart-store.js";

function assetUrl(path) {
  if (!path) return "";
  const clean = String(path).replace(/^(\.\/|\/)/, "");
  return location.pathname.includes("/pages/") ? `../${clean}` : `./${clean}`;
}

function moneyTemplate(usdValue) {
  const n = Number(usdValue) || 0;
  return `<span data-money data-usd="${n.toFixed(2)}">$${n.toFixed(2)}</span>`;
}

function renderEmpty(root) {
  root.innerHTML = `
    <div class="cart-empty">
      <p style="font-weight:900; text-transform:uppercase; letter-spacing:.06em;">Cart is empty</p>
      <p style="margin-top:12px;">
        <a class="link" href="${location.pathname.includes("/pages/") ? "../index.html" : "./index.html"}">Continue shopping</a>
      </p>
    </div>
  `;
}

function render(root) {
  const cart = getCart();

  if (!cart.length) {
    renderEmpty(root);
    if (window.Currency?.apply) window.Currency.apply();
    return;
  }

  const subtotalUSD = calcSubtotalUSD(cart);

  root.innerHTML = `
    <section class="cart">
      <div class="cart-head">
        <div style="font-weight:900; text-transform:uppercase; letter-spacing:.06em;">Cart</div>

        <div class="cart-sub">
          <div>Subtotal  ${moneyTemplate(subtotalUSD)}</div>
        </div>

        <button class="checkout" type="button">Checkout</button>
      </div>

      <div class="cart-list">
        ${cart
      .map((item) => {
        const img = assetUrl(item.img);
        const lineUSD = (Number(item.price) || 0) * (Number(item.qty) || 1);

        return `
              <div class="cart-row" data-row data-id="${item.id}">
                <img class="cart-img" src="${img}" alt="">
                <div>
                  <div class="cart-name">${item.title || ""}</div>
                  ${item.subtitle ? `<div class="cart-size">${item.subtitle}</div>` : ""}
                  <div class="cart-size">Size: ${item.size}</div>

                  <div class="qty">
                    <button class="qty-btn" type="button" data-dec>-</button>
                    <div style="font-weight:900;">${item.qty}</div>
                    <button class="qty-btn" type="button" data-inc>+</button>
                  </div>

                  <button class="remove" type="button" data-remove>Remove</button>
                </div>

                <div class="cart-price">
                  ${moneyTemplate(lineUSD)}
                </div>
              </div>
            `;
      })
      .join("")}
      </div>

      <div class="cart-sub">
        <div>Subtotal</div>
        <div>${moneyTemplate(subtotalUSD)}</div>
      </div>
    </section>
  `;

  if (window.Currency?.apply) window.Currency.apply();
}

(function initCartPage() {
  const root = document.getElementById("cartRoot");
  if (!root) return;

  render(root);

  root.addEventListener("click", (e) => {
    const row = e.target.closest("[data-row]");
    if (!row) return;

    const id = row.dataset.id;
    if (!id) return;

    if (e.target.closest("[data-inc]")) {
      incQty(id, 1);
      render(root);
      return;
    }

    if (e.target.closest("[data-dec]")) {
      decQty(id, 1);
      render(root);
      return;
    }

    if (e.target.closest("[data-remove]")) {
      removeFromCart(id);
      render(root);
      return;
    }
  });

  window.addEventListener("cart:change", () => render(root));
})();