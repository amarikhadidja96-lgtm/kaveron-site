import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(rootDir, 'public');

const rawUrl = process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://kaveron.com';
const siteUrl = rawUrl.replace(/\/+$/, '');

const today = new Date().toISOString().split('T')[0];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${siteUrl}/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/" />
    <xhtml:link rel="alternate" hreflang="ar" href="${siteUrl}/?lang=ar" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/" />
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/contact</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/contact" />
    <xhtml:link rel="alternate" hreflang="ar" href="${siteUrl}/contact?lang=ar" />
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/privacy</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/privacy" />
    <xhtml:link rel="alternate" hreflang="ar" href="${siteUrl}/privacy?lang=ar" />
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/

Sitemap: ${siteUrl}/sitemap.xml
`;

fs.writeFileSync(path.resolve(publicDir, 'sitemap.xml'), sitemap, 'utf-8');
fs.writeFileSync(path.resolve(publicDir, 'robots.txt'), robots, 'utf-8');

console.log(`[SEO] Generated sitemap.xml and robots.txt for: ${siteUrl}`);

