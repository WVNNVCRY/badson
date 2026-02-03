const CMS_URL = "http://localhost:1337";

function cmsMediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${CMS_URL}${path}`;
}

function mapProduct(p) {
  const firstImg =
    p.images?.[0]?.formats?.medium?.url ||
    p.images?.[0]?.formats?.small?.url ||
    p.images?.[0]?.url ||
    "";

  return {
    id: p.id,
    title: p.title || "",
    subtitle: p.subtitle || "",
    slug: p.slug || "",
    price: Number(p.priceUSD || 0),
    currency: "USD", // базово
    isActive: !!p.isActive,
    img: cmsMediaUrl(firstImg),
    images: (p.images || []).map((img) => cmsMediaUrl(img.url)),
  };
}

export async function fetchProducts() {
  const res = await fetch(`${CMS_URL}/api/products?populate=images`);
  if (!res.ok) throw new Error(`CMS error: ${res.status}`);
  const json = await res.json();
  return (json.data || []).map(mapProduct);
}

export async function fetchProductBySlug(slug) {
  const url = `${CMS_URL}/api/products?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=images`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CMS error: ${res.status}`);
  const json = await res.json();
  const item = (json.data || [])[0];
  return item ? mapProduct(item) : null;
}