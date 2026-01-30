const STORAGE_KEY = "badson_cart_v1";

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function normalizeToArray(raw) {
  if (Array.isArray(raw)) return raw;

  if (raw && typeof raw === "object") {
    if (Array.isArray(raw.items)) return raw.items;
    if (Array.isArray(raw.cart)) return raw.cart;
  }

  return [];
}

function loadCart() {
  const str = localStorage.getItem(STORAGE_KEY);
  if (!str) return [];

  const parsed = safeParse(str);
  const arr = normalizeToArray(parsed);

  if (!Array.isArray(parsed)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  return arr;
}

function saveCart(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  window.dispatchEvent(new Event("cart:change"));
}

function clampQty(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 1;
  return Math.max(1, Math.floor(x));
}

export function getCart() {
  return loadCart();
}

export function calcSubtotalUSD(items) {
  const arr = Array.isArray(items) ? items : loadCart();
  return arr.reduce(
    (sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0),
    0
  );
}

export function incQty(id, step = 1) {
  const cart = loadCart();
  const idx = cart.findIndex((x) => x.id === id);
  if (idx < 0) return cart;

  const next = [...cart];
  const add = clampQty(step);

  next[idx] = {
    ...next[idx],
    qty: Number(next[idx].qty || 0) + add,
  };

  saveCart(next);
  window.dispatchEvent(new Event("cart:change"));
  return next;
}

export function decQty(id, step = 1) {
  const cart = loadCart();
  const idx = cart.findIndex((x) => x.id === id);
  if (idx < 0) return cart;

  const next = [...cart];
  const sub = clampQty(step);
  const cur = Number(next[idx].qty || 0);
  const newQty = cur - sub;

  if (newQty <= 0) {
    const filtered = next.filter((x) => x.id !== id);
    saveCart(filtered);
    return filtered;
  }

  next[idx] = { ...next[idx], qty: newQty };
  saveCart(next);
  window.dispatchEvent(new Event("cart:change"));
  return next;
}

export function addToCart({ slug, size, qty = 1, title = "", subtitle = "", price = 0, currency = "USD", img = "" }) {
  const cart = loadCart();

  const safeSlug = String(slug || "").trim();
  const safeSize = String(size || "").trim();
  if (!safeSlug || !safeSize) return cart;

  const id = `${safeSlug}__${safeSize}`;
  const add = Math.max(1, Number(qty) || 1);

  const idx = cart.findIndex((x) => x.id === id);

  if (idx >= 0) {
    const next = [...cart];
    next[idx] = {
      ...next[idx],
      qty: Number(next[idx].qty || 0) + add,
    };
    saveCart(next);
    window.dispatchEvent(new Event("cart:change"));
    return next;
  }

  const next = [
    ...cart,
    {
      id,
      slug: safeSlug,
      size: safeSize,
      qty: add,
      title,
      subtitle,
      price: Number(price || 0),
      currency,
      img,
    },
  ];

  saveCart(next);
  return next;
}

export function removeFromCart(id) {
  const cart = loadCart();
  const next = cart.filter((x) => x.id !== id);
  saveCart(next);
  window.dispatchEvent(new Event("cart:change"));
  return next;
}