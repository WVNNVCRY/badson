import { getCart } from "./cart-store.js";

function calcCount(items) {
  return items.reduce((sum, it) => sum + Number(it.qty || 0), 0);
}

export function updateCartBadge() {
  const badge = document.querySelector("[data-cart-badge]");
  if (!badge) return;

  const cart = getCart();
  const count = calcCount(cart);

  if (count > 0) {
    badge.textContent = String(count);
    badge.classList.add("is-visible");
    badge.setAttribute("aria-label", `Cart items: ${count}`);
  } else {
    badge.textContent = "";
    badge.classList.remove("is-visible");
    badge.removeAttribute("aria-label");
  }
}

// авто-обновление
updateCartBadge();
window.addEventListener("cart:change", updateCartBadge);
window.addEventListener("storage", (e) => {
  if (e.key === "badson_cart_v1") updateCartBadge();
});