const CMS_URL = "https://badson-cms-production.up.railway.app";

function cmsMediaUrl(path) {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  return `${CMS_URL}${path}`;
}

function mapProduct(p) {
  const firstImg =
    p.images?.[0]?.formats?.large?.url ||
    p.images?.[0]?.url ||
    p.images?.[0]?.formats?.medium?.url ||
    p.images?.[0]?.formats?.small?.url ||
    "";

  const sizing = p.sizing || null;

  return {
    id: p.id,
    title: p.title || "",
    subtitle: p.subtitle || "",
    slug: p.slug || "",

    price: Number(p.priceUSD || 0),
    currency: "USD",

    isActive: !!p.isActive,
    order: Number.isFinite(Number(p.order)) ? Number(p.order) : 999999,

    img: cmsMediaUrl(firstImg),
    images: (p.images || []).map((img) =>
      cmsMediaUrl(
        img.formats?.large?.url ||
        img.url ||
        img.formats?.medium?.url ||
        img.formats?.small?.url ||
        ""
      )
    ),

    sizes: p.sizes || [],
    cta: p.cta || "ADD",

    details: p.details || [],
    disclaimer: p.disclaimer || "",
    shippingList: p.shippingList || [],

    sizing: sizing
      ? {
        notes: sizing.notes || [],
        columns: sizing.columns || [],
        rows: (sizing.rows || []).map((r) => ({
          key: r.key || "",
          in: r.in || [],
        })),
      }
      : null,
  };
}

export async function fetchProducts() {
  const res = await fetch(
    `${CMS_URL}/api/products?sort=order:asc&populate[images]=true&populate[sizing][populate]=*`
  );

  if (!res.ok) throw new Error(`CMS error: ${res.status}`);

  const json = await res.json();
  return (json.data || []).map(mapProduct);
}

export async function fetchProductBySlug(slug) {
  const url =
    `${CMS_URL}/api/products` +
    `?filters[slug][$eq]=${encodeURIComponent(slug)}` +
    `&populate[images]=true` +
    `&populate[sizing][populate]=*`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`CMS error: ${res.status}`);

  const json = await res.json();
  const item = (json.data || [])[0];

  return item ? mapProduct(item) : null;
}