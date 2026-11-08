// Blog sayfalarının sunucu tarafında üretilen HTML'i.
// Google içeriği JavaScript çalıştırmadan doğrudan görür.

import sanitizeHtml from 'sanitize-html';
import { LANGS, DEFAULT_LANG, UI, blogBase, postPath, siteUrl } from './config.js';

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// JSON-LD'yi <script> içine güvenle gömmek için
function jsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

export function cleanContent(html) {
  return sanitizeHtml(html || '', {
    allowedTags: [
      'h2', 'h3', 'h4', 'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'code', 'pre', 'span',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    // Yazıda H1 olmasın: sayfanın tek H1'i başlıktır (SEO)
    transformTags: {
      h1: 'h2',
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }),
      a: (tagName, attribs) => {
        const href = attribs.href || '';
        const external = /^https?:\/\//i.test(href) && !href.startsWith(siteUrl());
        return {
          tagName,
          attribs: external ? { ...attribs, target: '_blank', rel: 'noopener' } : attribs,
        };
      },
    },
  });
}

export function plainText(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

export function excerptOf(post, lang, max = 170) {
  const ex = post[`excerpt_${lang}`];
  if (ex) return ex;
  const text = plainText(post[`content_${lang}`]);
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, '')}…` : text;
}

export function readingMinutes(html) {
  const words = plainText(html).split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(iso, lang) {
  if (!iso) return '';
  return new Intl.DateTimeFormat(UI[lang].locale, {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul',
  }).format(new Date(iso));
}

function homeHref(lang, hash = '') {
  const q = lang === DEFAULT_LANG ? '' : `?lang=${lang}`;
  return `/${q}${hash}`;
}

function availableLangs(post) {
  return LANGS.filter((l) => post[`slug_${l}`] && post[`title_${l}`]);
}

// ---------------------------------------------------------------- layout

function layout({ lang, title, description, canonical, alternates = [], ogType = 'website', image, jsonLdBlocks = [], body, noindex = false }) {
  const t = UI[lang];
  const abs = (p) => (p.startsWith('http') ? p : `${siteUrl()}${p}`);
  const ogImage = image || `${siteUrl()}/brands/eray-logo.png`;

  const altLinks = alternates
    .map((a) => `<link rel="alternate" hreflang="${a.lang}" href="${esc(abs(a.href))}">`)
    .join('\n    ');
  const xDefault = alternates.find((a) => a.lang === DEFAULT_LANG);

  const switcher = LANGS.map((l) => {
    const alt = alternates.find((a) => a.lang === l);
    const href = alt ? alt.href : blogBase(l);
    return `<a href="${esc(href)}" hreflang="${l}" class="${l === lang ? 'active' : ''}"${l === lang ? ' aria-current="true"' : ''}>${l.toUpperCase()}</a>`;
  }).join('');

  return `<!doctype html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
    ${canonical ? `<link rel="canonical" href="${esc(abs(canonical))}">` : ''}
    ${altLinks}
    ${xDefault ? `<link rel="alternate" hreflang="x-default" href="${esc(abs(xDefault.href))}">` : ''}
    <meta property="og:type" content="${ogType}">
    <meta property="og:site_name" content="Eray Ship Supply">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:locale" content="${t.ogLocale}">
    ${canonical ? `<meta property="og:url" content="${esc(abs(canonical))}">` : ''}
    <meta property="og:image" content="${esc(ogImage)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${esc(ogImage)}">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/blog.css">
    ${jsonLdBlocks.map((b) => `<script type="application/ld+json">${jsonLd(b)}</script>`).join('\n    ')}
</head>
<body>
    <header class="b-header">
        <div class="b-container b-header-inner">
            <a class="b-logo" href="${homeHref(lang)}">
                <img src="/brands/eray-logo.png" alt="Eray Ship Supply" width="44" height="44">
                <span>ERAY SHIP SUPPLY</span>
            </a>
            <nav class="b-nav" aria-label="Main">
                <a href="${homeHref(lang, '#home')}">${esc(t.nav.home)}</a>
                <a href="${homeHref(lang, '#about')}">${esc(t.nav.about)}</a>
                <a href="${homeHref(lang, '#products')}">${esc(t.nav.products)}</a>
                <a href="${blogBase(lang)}" class="active">${esc(t.nav.blog)}</a>
                <a href="${homeHref(lang, '#contact')}">${esc(t.nav.contact)}</a>
            </nav>
            <div class="b-lang">${switcher}</div>
        </div>
    </header>
    <main>
${body}
    </main>
    <footer class="b-footer">
        <div class="b-container">
            <p class="b-footer-title">Eray Ship Supply</p>
            <p>${esc(t.footerDesc)}</p>
            <p class="b-footer-copy">&copy; ${new Date().getFullYear()} Eray Ship Supply. ${esc(t.rights)}</p>
        </div>
    </footer>
</body>
</html>`;
}

function cta(lang) {
  const t = UI[lang];
  return `
        <section class="b-cta">
            <h2>${esc(t.ctaTitle)}</h2>
            <p>${esc(t.ctaText)}</p>
            <a class="b-btn" href="${homeHref(lang, '#contact')}">${esc(t.ctaButton)}</a>
        </section>`;
}

// ---------------------------------------------------------------- list page

export function renderList({ lang, posts, page, totalPages }) {
  const t = UI[lang];
  const base = blogBase(lang);
  const pageHref = (l, p) => (p > 1 ? `${blogBase(l)}?page=${p}` : blogBase(l));
  const canonical = pageHref(lang, page);

  const cards = posts.map((p) => {
    const href = postPath(lang, p[`slug_${lang}`]);
    const title = p[`title_${lang}`];
    return `
            <article class="b-card">
                <a href="${esc(href)}" class="b-card-img" tabindex="-1" aria-hidden="true">
                    ${p.cover_url ? `<img src="${esc(p.cover_url)}" alt="" loading="lazy">` : '<span class="b-card-ph">ESS</span>'}
                </a>
                <div class="b-card-body">
                    <p class="b-meta"><time datetime="${esc(p.published_at)}">${esc(formatDate(p.published_at, lang))}</time> · ${esc(t.minRead(readingMinutes(p[`content_${lang}`])))}</p>
                    <h2><a href="${esc(href)}">${esc(title)}</a></h2>
                    <p>${esc(excerptOf(p, lang))}</p>
                    <a href="${esc(href)}" class="b-more">${esc(t.readMore)} →</a>
                </div>
            </article>`;
  }).join('');

  const pager = totalPages > 1 ? `
        <nav class="b-pager" aria-label="Pagination">
            ${page > 1 ? `<a href="${esc(pageHref(lang, page - 1))}" rel="prev">← ${esc(t.prev)}</a>` : '<span></span>'}
            <span>${esc(t.page(page))} / ${totalPages}</span>
            ${page < totalPages ? `<a href="${esc(pageHref(lang, page + 1))}" rel="next">${esc(t.next)} →</a>` : '<span></span>'}
        </nav>` : '';

  const body = `
        <section class="b-hero">
            <div class="b-container">
                <p class="b-eyebrow">Eray Ship Supply</p>
                <h1>${esc(t.blogHeading)}</h1>
                <p class="b-intro">${esc(t.blogIntro)}</p>
            </div>
        </section>
        <div class="b-container">
            ${posts.length ? `<div class="b-grid">${cards}</div>` : `<p class="b-empty">${esc(t.empty)}</p>`}
            ${pager}
            ${cta(lang)}
        </div>`;

  return layout({
    lang,
    title: page > 1 ? `${t.blogMetaTitle} — ${t.page(page)}` : t.blogMetaTitle,
    description: t.blogMetaDesc,
    canonical,
    alternates: page === 1 ? LANGS.map((l) => ({ lang: l, href: blogBase(l) })) : [{ lang, href: canonical }],
    jsonLdBlocks: [{
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: `Eray Ship Supply ${t.blogTitle}`,
      url: `${siteUrl()}${base}`,
      inLanguage: lang,
      publisher: { '@type': 'Organization', name: 'Eray Ship Supply', logo: { '@type': 'ImageObject', url: `${siteUrl()}/brands/eray-logo.png` } },
    }],
    body,
  });
}

// ---------------------------------------------------------------- post page

export function renderPost({ lang, post }) {
  const t = UI[lang];
  const title = post[`title_${lang}`];
  const content = cleanContent(post[`content_${lang}`]);
  const metaTitle = post[`meta_title_${lang}`] || `${title} | Eray Ship Supply`;
  const metaDesc = post[`meta_desc_${lang}`] || excerptOf(post, lang, 155);
  const path = postPath(lang, post[`slug_${lang}`]);
  const alternates = availableLangs(post).map((l) => ({ lang: l, href: postPath(l, post[`slug_${l}`]) }));

  const body = `
        <article class="b-post">
            <header class="b-post-head b-container b-narrow">
                <a href="${blogBase(lang)}" class="b-back">← ${esc(t.back)}</a>
                <h1>${esc(title)}</h1>
                <p class="b-meta">
                    <time datetime="${esc(post.published_at)}">${esc(formatDate(post.published_at, lang))}</time>
                    · ${esc(t.minRead(readingMinutes(post[`content_${lang}`])))}
                </p>
            </header>
            ${post.cover_url ? `<figure class="b-cover b-container"><img src="${esc(post.cover_url)}" alt="${esc(title)}"></figure>` : ''}
            <div class="b-content b-container b-narrow">
${content}
            </div>
            <div class="b-container b-narrow">${cta(lang)}</div>
        </article>`;

  return layout({
    lang,
    title: metaTitle,
    description: metaDesc,
    canonical: path,
    alternates,
    ogType: 'article',
    image: post.cover_url || undefined,
    jsonLdBlocks: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description: metaDesc,
        inLanguage: lang,
        datePublished: post.published_at,
        dateModified: post.updated_at || post.published_at,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl()}${path}` },
        ...(post.cover_url ? { image: [post.cover_url] } : {}),
        author: { '@type': 'Organization', name: 'Eray Ship Supply', url: siteUrl() },
        publisher: { '@type': 'Organization', name: 'Eray Ship Supply', logo: { '@type': 'ImageObject', url: `${siteUrl()}/brands/eray-logo.png` } },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.nav.home, item: `${siteUrl()}${homeHref(lang)}` },
          { '@type': 'ListItem', position: 2, name: t.blogTitle, item: `${siteUrl()}${blogBase(lang)}` },
          { '@type': 'ListItem', position: 3, name: title, item: `${siteUrl()}${path}` },
        ],
      },
    ],
    body,
  });
}

// ---------------------------------------------------------------- 404 / error

export function renderNotFound(lang) {
  const t = UI[lang] || UI[DEFAULT_LANG];
  const l = UI[lang] ? lang : DEFAULT_LANG;
  return layout({
    lang: l,
    title: `${t.notFoundTitle} | Eray Ship Supply`,
    description: t.notFoundText,
    noindex: true,
    body: `
        <section class="b-hero b-404">
            <div class="b-container">
                <h1>${esc(t.notFoundTitle)}</h1>
                <p class="b-intro">${esc(t.notFoundText)}</p>
                <a class="b-btn" href="${blogBase(l)}">${esc(t.back)}</a>
            </div>
        </section>`,
  });
}
