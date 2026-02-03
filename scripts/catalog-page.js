import { fetchProducts } from "./cms.js";

const grid = document.getElementById("catalogGrid");

async function initCatalog() {
  try {
    const products = await fetchProducts();
    const active = products.filter(p => p.isActive);

    grid.innerHTML = active.map(p => {
      const title = `${p.title} ${p.subtitle}`.trim();
      return `
        <a class="product-card" href="./pages/product.html?slug=${encodeURIComponent(p.slug)}" aria-label="${title}">
          <div class="product-card__imgwrap">
            <img class="product-card__img" src="${p.img}" alt="${title}" loading="lazy">
          </div>

          <div class="product-card__meta">
            <div class="product-card__title">${p.title}</div>
            <div class="product-card__subtitle">${p.subtitle}</div>
          </div>
        </a>
      `;
    }).join("");

    if (window.Currency?.apply) window.Currency.apply();
  } catch (e) {
    grid.innerHTML = `<p>Failed to load products from CMS.</p>`;
    console.error(e);
  }
}

initCatalog();