// /sitemap.xml — ana sayfa, blog listeleri ve tüm yayındaki yazılar (hreflang ile)

import { LANGS, DEFAULT_LANG, blogBase, postPath, siteUrl } from './_lib/config.js';
import { allPublishedForSitemap } from './_lib/db.js';

const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function urlEntry(loc, { lastmod, alternates = [], image } = {}) {
  const alt = alternates
    .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${xml(a.href)}"/>`)
    .join('\n');
  return `  <url>
    <loc>${xml(loc)}</loc>${lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}
${alt}${image ? `\n    <image:image><image:loc>${xml(image)}</image:loc></image:image>` : ''}
  </url>`;
}

export default async function handler(req, res) {
  const base = siteUrl();
  const entries = [urlEntry(`${base}/`)];

  const blogAlts = LANGS.map((l) => ({ lang: l, href: `${base}${blogBase(l)}` }));
  blogAlts.push({ lang: 'x-default', href: `${base}${blogBase(DEFAULT_LANG)}` });

  let posts = [];
  try {
    posts = await allPublishedForSitemap();
  } catch (err) {
    console.error('[sitemap]', err);
  }
  const latest = posts[0]?.updated_at;

  for (const l of LANGS) entries.push(urlEntry(`${base}${blogBase(l)}`, { lastmod: latest, alternates: blogAlts }));

  for (const p of posts) {
    const langs = LANGS.filter((l) => p[`slug_${l}`]);
    const alts = langs.map((l) => ({ lang: l, href: `${base}${postPath(l, p[`slug_${l}`])}` }));
    if (p.slug_tr) alts.push({ lang: 'x-default', href: `${base}${postPath(DEFAULT_LANG, p.slug_tr)}` });
    for (const l of langs) {
      entries.push(urlEntry(`${base}${postPath(l, p[`slug_${l}`])}`, {
        lastmod: p.updated_at || p.published_at,
        alternates: alts,
        image: p.cover_url,
      }));
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join('\n')}
</urlset>
`;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
  res.end(body);
}
