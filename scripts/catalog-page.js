import { fetchProducts } from "./cms.js";

const grid = document.getElementById("catalogGrid");

function renderSkeletons(count = 6) {
  return Array.from({ length: count })
    .map(
      () => `
      <div class="product-card skeleton" aria-hidden="true">
        <div class="product-card__imgwrap">
          <div class="skeleton-box skeleton-img"></div>
        </div>

        <div class="product-card__meta">
          <div class="skeleton-box skeleton-title"></div>
          <div class="skeleton-box skeleton-subtitle"></div>
        </div>
      </div>
    `
    )
    .join("");
}

function renderError(message = "Failed to load products.") {
  return `
    <div class="catalog-error">
      <div class="catalog-error__title">Products unavailable</div>
      <div class="catalog-error__text">${message}</div>
      <button class="catalog-error__btn" type="button" data-action="retry">
        Retry
      </button>
    </div>
  `;
}

function renderProducts(products) {
  return products
    .map((p) => {
      const title = `${p.title} ${p.subtitle}`.trim();

      return `
        <a class="product-card"
           href="./pages/product.html?slug=${encodeURIComponent(p.slug)}"
           aria-label="${title}">
          <div class="product-card__imgwrap">
            <img
              class="product-card__img"
              src="${p.img}"
              alt="${title}"
              loading="lazy"
              decoding="async"
            >
          </div>

          <div class="product-card__meta">
            <div class="product-card__title">${p.title}</div>
            <div class="product-card__subtitle">${p.subtitle}</div>
          </div>
        </a>
      `;
    })
    .join("");
}

async function loadCatalog() {
  if (!grid) return;

  grid.innerHTML = renderSkeletons(6);

  try {
    const products = await fetchProducts();

    const active = products
      .filter((p) => p.isActive)
      .sort((a, b) => a.order - b.order);

    grid.innerHTML = active.length
      ? renderProducts(active)
      : `<p class="catalog-empty">No products.</p>`;

    if (window.Currency?.apply) window.Currency.apply();
  } catch (e) {
    console.error(e);
    grid.innerHTML = renderError(e?.message);
  }
}

grid?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action='retry']");
  if (!btn) return;
  loadCatalog();
});

loadCatalog();