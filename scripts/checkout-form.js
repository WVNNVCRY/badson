import { getCart, calcSubtotalUSD } from "./cart-store.js";

const FORM_STORAGE_KEY = "badson_checkout_form_v1";
const ORDER_STORAGE_KEY = "badson_last_order_v1";
const CART_STORAGE_KEY = "badson_cart_v1";

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function digitsOnly(s) {
  return String(s || "").replace(/\D/g, "");
}

function clampStr(s, max) {
  const v = String(s || "");
  return v.length > max ? v.slice(0, max) : v;
}

function normalizeCardNumber(value) {
  const d = clampStr(digitsOnly(value), 19);
  return d.replace(/(.{4})/g, "$1 ").trim();
}

function normalizeExp(value) {
  const d = clampStr(digitsOnly(value), 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

function normalizeCvc(value) {
  return clampStr(digitsOnly(value), 4);
}

function normalizeCardName(value) {
  return String(value || "").toUpperCase();
}

function isValidEmail(email) {
  const v = String(email || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v);
}

function luhnCheck(numStr) {
  const s = digitsOnly(numStr);
  if (s.length < 13 || s.length > 19) return false;

  let sum = 0;
  let alt = false;

  for (let i = s.length - 1; i >= 0; i--) {
    let n = Number(s[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }

  return sum % 10 === 0;
}

function parseExp(exp) {
  const v = normalizeExp(exp);
  const m = v.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return null;

  const mm = Number(m[1]);
  const yy = Number(m[2]);
  if (mm < 1 || mm > 12) return null;

  const now = new Date();
  const year = 2000 + yy;
  const monthIndex = mm - 1;

  const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
  if (end.getTime() < now.getTime()) return null;

  return { mm, yy };
}

function getField(field) {
  const el = qs(`[data-field="${field}"]`);
  if (!el) return "";
  return String(el.value || "").trim();
}

function setField(field, value) {
  const el = qs(`[data-field="${field}"]`);
  if (!el) return;
  el.value = value == null ? "" : String(value);
}

function clearErrors() {
  qsa("[data-field]").forEach((el) => {
    el.removeAttribute("aria-invalid");
    el.removeAttribute("title");
    el.setCustomValidity("");
  });
}

function setError(field, message) {
  const el = qs(`[data-field="${field}"]`);
  if (!el) return;

  el.setAttribute("aria-invalid", "true");
  el.setAttribute("title", message);
  el.setCustomValidity(message);
}

function readFormData() {
  return {
    email: getField("email"),
    country: getField("country"),
    firstName: getField("firstName"),
    lastName: getField("lastName"),
    address1: getField("address1"),
    address2: getField("address2"),
    city: getField("city"),
    state: getField("state"),
    zip: getField("zip"),
    phone: getField("phone"),
    cardNumber: getField("cardNumber"),
    cardExp: getField("cardExp"),
    cardCvc: getField("cardCvc"),
    cardName: getField("cardName"),
  };
}

function saveFormDraft() {
  const data = readFormData();
  localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
}

function restoreFormDraft() {
  const raw = localStorage.getItem(FORM_STORAGE_KEY);
  if (!raw) return;

  let data = null;
  try {
    data = JSON.parse(raw);
  } catch {
    data = null;
  }
  if (!data || typeof data !== "object") return;

  Object.keys(data).forEach((k) => setField(k, data[k]));
}

function validate(data) {
  clearErrors();

  let ok = true;

  if (!isValidEmail(data.email)) {
    setError("email", "Enter a valid email (example: name@example.com).");
    ok = false;
  }

  if (!data.country) {
    setError("country", "Select your country.");
    ok = false;
  }

  if (!data.firstName || data.firstName.length < 2) {
    setError("firstName", "Enter your first name (min 2 characters).");
    ok = false;
  }

  if (!data.lastName || data.lastName.length < 2) {
    setError("lastName", "Enter your last name (min 2 characters).");
    ok = false;
  }

  if (!data.address1 || data.address1.length < 5) {
    setError("address1", "Enter your address (min 5 characters).");
    ok = false;
  }

  if (!data.city || data.city.length < 2) {
    setError("city", "Enter your city.");
    ok = false;
  }

  if (!data.state) {
    setError("state", "Select a state.");
    ok = false;
  }

  const zip = String(data.zip || "").trim();
  if (!/^[A-Za-z0-9\- ]{3,10}$/.test(zip)) {
    setError("zip", "Enter a valid ZIP code.");
    ok = false;
  }

  const phoneDigits = digitsOnly(data.phone);
  if (phoneDigits.length < 7) {
    setError("phone", "Enter a valid phone number.");
    ok = false;
  }

  const cardDigits = digitsOnly(data.cardNumber);
  if (!luhnCheck(cardDigits)) {
    setError("cardNumber", "Card number looks invalid.");
    ok = false;
  }

  if (!parseExp(data.cardExp)) {
    setError("cardExp", "Enter expiration date as MM/YY (and it must be in the future).");
    ok = false;
  }

  const cvc = digitsOnly(data.cardCvc);
  if (!(cvc.length === 3 || cvc.length === 4)) {
    setError("cardCvc", "Security code must be 3–4 digits.");
    ok = false;
  }

  const name = String(data.cardName || "").trim();
  if (!name || name.length < 2) {
    setError("cardName", "Enter the name on card.");
    ok = false;
  }

  return ok;
}

function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rnd = Math.floor(Math.random() * 1e6).toString().padStart(6, "0");
  return `BSN-${stamp}-${rnd}`;
}

function clearCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event("cart:change"));
}

function buildOrderPayload(formData) {
  const cart = getCart();
  const subtotalUSD = calcSubtotalUSD(cart);

  return {
    orderNumber: generateOrderNumber(),
    createdAt: new Date().toISOString(),
    form: {
      email: formData.email,
      country: formData.country,
      firstName: formData.firstName,
      lastName: formData.lastName,
      address1: formData.address1,
      address2: formData.address2,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      phone: formData.phone,
      cardName: formData.cardName,
      cardLast4: digitsOnly(formData.cardNumber).slice(-4),
      cardExp: normalizeExp(formData.cardExp),
    },
    cart,
    subtotalUSD,
  };
}

function focusFirstErrorAndShowNative() {
  const first = qsa("[data-field]").find((el) => el.getAttribute("aria-invalid") === "true");
  if (!first) return;
  first.focus();
  first.reportValidity();
}

function wireFormatters(form) {
  const cardNumber = qs('[data-field="cardNumber"]', form);
  const cardExp = qs('[data-field="cardExp"]', form);
  const cardCvc = qs('[data-field="cardCvc"]', form);
  const cardName = qs('[data-field="cardName"]', form);

  if (cardNumber) {
    cardNumber.addEventListener("input", () => {
      cardNumber.value = normalizeCardNumber(cardNumber.value);
      saveFormDraft();
    });
  }

  if (cardExp) {
    cardExp.addEventListener("input", () => {
      cardExp.value = normalizeExp(cardExp.value);
      saveFormDraft();
    });
  }

  if (cardCvc) {
    cardCvc.addEventListener("input", () => {
      cardCvc.value = normalizeCvc(cardCvc.value);
      saveFormDraft();
    });
  }

  if (cardName) {
    cardName.addEventListener("input", () => {
      cardName.value = normalizeCardName(cardName.value);
      saveFormDraft();
    });
  }

  qsa('[data-field]', form).forEach((el) => {
    el.addEventListener("input", () => {
      el.removeAttribute("aria-invalid");
      el.removeAttribute("title");
      el.setCustomValidity("");
      saveFormDraft();
    });
    el.addEventListener("change", saveFormDraft);
    el.addEventListener("blur", saveFormDraft);
  });
}

function init() {
  const form = qs("#checkoutForm");
  if (!form) return;

  restoreFormDraft();
  wireFormatters(form);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const cart = getCart();
    if (!cart.length) {
      alert("Cart is empty.");
      return;
    }

    const data = readFormData();
    data.cardNumber = normalizeCardNumber(data.cardNumber);
    data.cardExp = normalizeExp(data.cardExp);
    data.cardCvc = normalizeCvc(data.cardCvc);
    data.cardName = normalizeCardName(data.cardName);

    setField("cardNumber", data.cardNumber);
    setField("cardExp", data.cardExp);
    setField("cardCvc", data.cardCvc);
    setField("cardName", data.cardName);

    const ok = validate(data);
    if (!ok) {
      focusFirstErrorAndShowNative();
      return;
    }

    const order = buildOrderPayload(data);
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
    localStorage.removeItem(FORM_STORAGE_KEY);

    clearCart();

    const base = location.pathname.includes("/pages/") ? "./" : "./pages/";
    location.href = `${base}order-success.html`;
  });
}

init();