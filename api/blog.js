// /blog, /blog/:slug, /en/blog, /en/blog/:slug, /ru/blog, /ru/blog/:slug
// vercel.json bu adresleri buraya ?lang=..&slug=.. ile yönlendirir.

import { LANGS, DEFAULT_LANG, POSTS_PER_PAGE, postPath } from './_lib/config.js';
import { listPosts, getPost, findPostByAnySlug } from './_lib/db.js';
import { renderList, renderPost, renderNotFound } from './_lib/render.js';
import { isValidSlug } from './_lib/slug.js';

const CACHE = 'public, max-age=0, s-maxage=60, stale-while-revalidate=600';

function send(res, status, html, cache = CACHE) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', cache);
  res.end(html);
}

function redirect(res, location) {
  res.statusCode = 301;
  res.setHeader('Location', location);
  res.setHeader('Cache-Control', CACHE);
  res.end();
}

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const lang = LANGS.includes(url.searchParams.get('lang')) ? url.searchParams.get('lang') : DEFAULT_LANG;
  const slug = url.searchParams.get('slug');

  try {
    if (slug) {
      if (!isValidSlug(slug)) return send(res, 404, renderNotFound(lang));

      const post = await getPost(lang, slug);
      if (post && post[`title_${lang}`]) return send(res, 200, renderPost({ lang, post }));

      // Başka dilin slug'ı ile gelinmişse doğru adrese yönlendir
      const other = await findPostByAnySlug(slug);
      if (other) {
        const target = other[`slug_${lang}`] && other[`title_${lang}`] ? lang : DEFAULT_LANG;
        return redirect(res, postPath(target, other[`slug_${target}`]));
      }
      return send(res, 404, renderNotFound(lang));
    }

    const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1);
    const { posts, total } = await listPosts(lang, page);
    const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
    if (page > totalPages) return send(res, 404, renderNotFound(lang));
    return send(res, 200, renderList({ lang, posts, page, totalPages }));
  } catch (err) {
    console.error('[blog]', err);
    return send(res, 500, renderNotFound(lang), 'no-store');
  }
}
