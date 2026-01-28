import { PRODUCTS } from "./products.js";

const grid = document.getElementById("catalogGrid");

grid.innerHTML = PRODUCTS.map(p => {
  const title = `${p.title} ${p.subtitle}`;
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