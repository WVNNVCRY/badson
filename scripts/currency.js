const STORAGE_KEY = "badson_currency_v1";
const RATE_CACHE_KEY = "badson_rates_v1";
const RATE_TTL_MS = 1000 * 60 * 60 * 12; // 12 часов

const CURRENCIES = {
  USD: { symbol: "$", label: "US (USD $)" },
  CAD: { symbol: "$", label: "Canada (CAD $)" },
  EUR: { symbol: "€", label: "Europe (EUR €)" },
  CNY: { symbol: "¥", label: "China (CNY ¥)" },
  JPY: { symbol: "¥", label: "Japan (JPY ¥)" },
  KRW: { symbol: "₩", label: "South Korea (KRW ₩)" },
  GBP: { symbol: "£", label: "United Kingdom (GBP £)" },
  AUD: { symbol: "$", label: "Australia (AUD $)" },
  NZD: { symbol: "$", label: "New Zealand (NZD $)" },
};

function extractCurrencyCode(str) {
  if (!str) return null;
  const m = String(str).match(/\(([A-Z]{3})\s/);
  return m ? m[1] : null;
}

function getSavedCurrency() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw && CURRENCIES[raw] ? raw : "USD";
  } catch {
    return "USD";
  }
}

function saveCurrency(code) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch { }
}

function formatMoneyRound00(amountInUSD, code, rates) {
  const rate = code === "USD" ? 1 : (rates?.[code] ?? 1);
  const converted = Math.round(Number(amountInUSD) * rate);
  const sym = CURRENCIES[code]?.symbol ?? "";
  return `${sym}${converted.toFixed(2)}`;
}

async function getRatesUSD() {
  try {
    const cached = JSON.parse(localStorage.getItem(RATE_CACHE_KEY) || "null");
    if (cached?.ts && cached?.rates && (Date.now() - cached.ts) < RATE_TTL_MS) {
      return cached.rates;
    }
  } catch { }

  const url = "https://open.er-api.com/v6/latest/USD";

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    const rates = data?.rates;

    if (!rates || !rates.USD) throw new Error("No rates");

    const picked = {};
    Object.keys(CURRENCIES).forEach((code) => {
      picked[code] = rates[code];
    });

    try {
      localStorage.setItem(RATE_CACHE_KEY, JSON.stringify({ ts: Date.now(), rates: picked }));
    } catch { }

    return picked;
  } catch (e) {
    const fallback = {};
    Object.keys(CURRENCIES).forEach((code) => (fallback[code] = 1));
    return fallback;
  }
}

function collectMoneyNodes() {
  const selectors = [
    ".product-card__price",
    ".pdp-col__price",
    ".cart-price",
    "[data-money]",
  ];

  const nodes = new Set();
  selectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => nodes.add(el));
  });

  nodes.forEach((el) => {
    if (el.dataset.usd) return;

    const raw = (el.textContent || "").replace(/,/g, "").trim();
    const num = Number(raw.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(num)) return;

    el.dataset.usd = String(num);
  });

  return Array.from(nodes).filter((el) => el.dataset.usd);
}

async function applyCurrency(code) {
  const rates = await getRatesUSD();
  const moneyNodes = collectMoneyNodes();

  moneyNodes.forEach((el) => {
    const usd = Number(el.dataset.usd);
    if (!Number.isFinite(usd)) return;
    el.textContent = formatMoneyRound00(usd, code, rates);
  });
}

function hookFooterSelect() {
  const root = document.querySelector("[data-currency]");
  if (!root) return;

  root.addEventListener("click", (e) => {
    const opt = e.target.closest(".currency-select__opt");
    if (!opt) return;

    const label = opt.dataset.value || opt.textContent;
    const code = extractCurrencyCode(label);
    if (!code || !CURRENCIES[code]) return;

    saveCurrency(code);
    applyCurrency(code);
  });
}

function syncSelectUIToSavedCurrency() {
  const code = getSavedCurrency();
  const root = document.querySelector("[data-currency]");
  if (!root) return;

  const valueEl = root.querySelector("[data-currency-value]");
  if (valueEl) {
    const opts = root.querySelectorAll(".currency-select__opt");
    const match = Array.from(opts).find((o) => extractCurrencyCode(o.dataset.value || o.textContent) === code);
    if (match) valueEl.textContent = match.dataset.value || match.textContent.trim();
  }

  const opts = root.querySelectorAll(".currency-select__opt");
  opts.forEach((o) => {
    const c = extractCurrencyCode(o.dataset.value || o.textContent);
    const isSel = c === code;
    o.classList.toggle("is-selected", isSel);
    o.setAttribute("aria-selected", isSel ? "true" : "false");
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  hookFooterSelect();
  syncSelectUIToSavedCurrency();
  await applyCurrency(getSavedCurrency());
});

window.Currency = window.Currency || {};

window.Currency.apply = async function applyNow() {
  const code = getSavedCurrency();
  await applyCurrency(code);
};

window.Currency.set = async function setNow(code) {
  saveCurrency(code);
  await applyCurrency(code);
};