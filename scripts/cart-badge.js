import { getCart } from "./cart-store.js";

function calcCount(items) {
  return (items || []).reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
}

function renderBadge() {
  const badge = document.querySelector("[data-cart-badge]");
  if (!badge) return;

  const count = calcCount(getCart());

  if (count > 0) {
    badge.textContent = String(count);
    badge.classList.add("is-visible");
  } else {
    badge.textContent = "";
    badge.classList.remove("is-visible");
  }
}

renderBadge();
window.addEventListener("cart:change", renderBadge);

window.addEventListener("storage", (e) => {
  if (e.key === "badson_cart_v1") renderBadge();
});