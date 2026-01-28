const KEY = "badson_cart_v1";

export function readCart() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? { items: [] };
  } catch {
    return { items: [] };
  }
}

export function writeCart(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart));
}

export function addToCart({ slug, size, qty = 1 }) {
  const cart = readCart();
  const id = `${slug}__${size}`;

  const existing = cart.items.find(i => i.id === id);
  if (existing) existing.qty += qty;
  else cart.items.push({ id, slug, size, qty });

  writeCart(cart);
  return cart;
}

export function setQty(id, qty) {
  const cart = readCart();
  const item = cart.items.find(i => i.id === id);
  if (!item) return cart;

  item.qty = Math.max(1, qty);
  writeCart(cart);
  return cart;
}

export function removeItem(id) {
  const cart = readCart();
  cart.items = cart.items.filter(i => i.id !== id);
  writeCart(cart);
  return cart;
}

export function clearCart() {
  writeCart({ items: [] });
}