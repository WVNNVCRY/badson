import { readCart, setQty, removeItem } from "./cart-store.js";
import { getProductBySlug, formatMoney } from "./products.js";

const root = document.getElementById("cartRoot");

function calcSubtotal(items) {
  return items.reduce((sum, i) => {
    const p = getProductBySlug(i.slug);
    if (!p) return sum;
    return sum + p.price * i.qty;
  }, 0);
}

function render() {
  const cart = readCart();

  if (cart.items.length === 0) {
    root.innerHTML = `
      <div class="cart-empty">
        <h2>CART</h2>
        <p>YOUR CART IS CURRENTLY EMPTY.</p>
        <a href="./index.html" class="link">CONTINUE BROWSING</a>
      </div>
    `;
    return;
  }

  const subtotal = calcSubtotal(cart.items);

  root.innerHTML = `
    <div class="cart-head">
      <div class="cart-title">Shopping Bag</div>
      <div class="cart-total-label">Total</div>
      <button class="checkout" type="button">CHECK OUT</button>
    </div>

    <div class="cart-list">
      ${cart.items.map(i => {
    const p = getProductBySlug(i.slug);
    if (!p) return "";
    return `
          <div class="cart-row" data-id="${i.id}">
            <img class="cart-img" src="${p.img}" alt="">
            <div class="cart-meta">
              <div class="cart-name">${p.titleTop} ${p.titleBottom}</div>
              <div class="cart-size">${i.size}</div>

              <div class="qty">
                <button class="qty-btn" data-act="minus" type="button">—</button>
                <div class="qty-val">${i.qty}</div>
                <button class="qty-btn" data-act="plus" type="button">+</button>
              </div>

              <button class="remove" data-act="remove" type="button">REMOVE</button>
            </div>

            <div class="cart-price">${formatMoney(p.price * i.qty, p.currency)}</div>
          </div>
        `;
  }).join("")}
    </div>

    <div class="cart-sub">
      <div>Subtotal</div>
      <div>${formatMoney(subtotal, "USD")}</div>
    </div>
  `;

  root.querySelectorAll(".cart-row").forEach(row => {
    const id = row.dataset.id;
    row.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;

      const cartNow = readCart();
      const item = cartNow.items.find(x => x.id === id);
      if (!item) return;

      if (btn.dataset.act === "minus") setQty(id, item.qty - 1);
      if (btn.dataset.act === "plus") setQty(id, item.qty + 1);
      if (btn.dataset.act === "remove") removeItem(id);

      render();
    });
  });

  root.querySelector(".checkout").addEventListener("click", () => {
    alert("Checkout пока заглушка 🙂");
  });
}

render();