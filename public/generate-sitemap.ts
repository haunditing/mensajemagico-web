import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore - tsx maneja la importación de archivos TS directamente
import { OCCASIONS, RELATIONSHIPS } from '../constants';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.mensajemagico.com';

const staticPages = [
  { url: '/', changefreq: 'daily', priority: '1.0' },
  { url: '/pricing', changefreq: 'weekly', priority: '0.9' },
  { url: '/faq', changefreq: 'weekly', priority: '0.8' },
  { url: '/login', changefreq: 'monthly', priority: '0.5' },
  { url: '/signup', changefreq: 'monthly', priority: '0.6' },
  { url: '/contacto', changefreq: 'monthly', priority: '0.4' },
  { url: '/privacidad', changefreq: 'yearly', priority: '0.3' },
  { url: '/terminos', changefreq: 'yearly', priority: '0.3' },
];

const generateSitemap = () => {
  console.log('🗺️  Generando sitemap.xml...');

  let urls = '';

  // 1. Páginas Estáticas
  staticPages.forEach((page) => {
    urls += `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  // 2. Ocasiones (Categorías)
  OCCASIONS.forEach((occasion: any) => {
    urls += `
  <url>
    <loc>${BASE_URL}/mensajes/${occasion.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

    // 3. Relaciones (Long-tail)
    RELATIONSHIPS.forEach((rel: any) => {
      urls += `
  <url>
    <loc>${BASE_URL}/mensajes/${occasion.slug}/${rel.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  const publicDir = path.resolve(__dirname, '../public');
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log('✅ Sitemap generado correctamente en public/sitemap.xml');
};

generateSitemap();