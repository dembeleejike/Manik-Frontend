// Runs automatically before every build (see package.json "prebuild").
// Fetches the live product list and writes a real sitemap.xml into
// public/ — so every product actually gets its own URL indexed,
// without needing a server-rendering setup.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = "https://manik-woad.vercel.app";
const API_URL = process.env.VITE_API_URL || "http://localhost:5000";

async function generate() {
  let products = [];
  try {
    const res = await fetch(`${API_URL}/api/products`);
    if (res.ok) products = await res.json();
  } catch (err) {
    console.warn("Sitemap: couldn't reach the API, generating with static pages only.", err.message);
  }

  const staticPages = ["", "products", "services", "projects", "about", "contact"];
  const urls = [
    ...staticPages.map(p => `${SITE_URL}/${p}`),
    ...products.map(p => `${SITE_URL}/products/${p.ref}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>
`;

  fs.writeFileSync(path.join(__dirname, "..", "public", "sitemap.xml"), xml);
  console.log(`Sitemap generated with ${urls.length} URLs (${products.length} products).`);
}

generate();
