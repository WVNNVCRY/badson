const ORDER_STORAGE_KEY = "badson_last_order_v1";

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function setText(el, v) {
  if (!el) return;
  el.textContent = v == null || v === "" ? "-" : String(v);
}

function init() {
  const raw = localStorage.getItem(ORDER_STORAGE_KEY);
  if (!raw) return;

  let order = null;
  try {
    order = JSON.parse(raw);
  } catch {
    order = null;
  }
  if (!order) return;

  setText(qs("[data-order-number]"), order.orderNumber || "-");
  setText(qs("[data-order-email]"), order?.form?.email || "-");

  const usd = Number(order.subtotalUSD || 0);
  setText(qs("[data-order-total]"), `$${usd.toFixed(2)}`);
}

init();