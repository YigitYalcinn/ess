// Supabase REST (PostgREST) üzerinden yalnızca YAYINDAKİ yazıları okur.
// Anon anahtarı kullanılır; taslakları satır güvenliği (RLS) zaten gizler.

import { LANGS, POSTS_PER_PAGE } from './config.js';

function env() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_ANON_KEY tanımlı değil');
  return { url: url.replace(/\/+$/, ''), key };
}

async function rest(path, { count = false } = {}) {
  const { url, key } = env();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      ...(count ? { Prefer: 'count=exact' } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Supabase ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  let total = null;
  if (count) {
    const range = res.headers.get('content-range'); // örn. "0-11/37"
    const m = range && range.match(/\/(\d+)$/);
    total = m ? Number(m[1]) : null;
  }
  return { data, total };
}

const SLUG_COLS = LANGS.map((l) => `slug_${l}`).join(',');

export async function listPosts(lang, page = 1) {
  const offset = (page - 1) * POSTS_PER_PAGE;
  const cols = `id,cover_url,published_at,updated_at,${SLUG_COLS},title_${lang},excerpt_${lang},content_${lang}`;
  const q = new URLSearchParams({
    select: cols,
    status: 'eq.published',
    [`slug_${lang}`]: 'not.is.null',
    [`title_${lang}`]: 'not.is.null',
    order: 'published_at.desc',
    limit: String(POSTS_PER_PAGE),
    offset: String(offset),
  });
  const { data, total } = await rest(`posts?${q}`, { count: true });
  return { posts: data, total: total ?? data.length };
}

export async function getPost(lang, slug) {
  const q = new URLSearchParams({
    select: '*',
    status: 'eq.published',
    [`slug_${lang}`]: `eq.${slug}`,
    limit: '1',
  });
  const { data } = await rest(`posts?${q}`);
  return data[0] || null;
}

// Yazı başka bir dildeki slug ile açılmışsa doğru adrese yönlendirebilmek için
export async function findPostByAnySlug(slug) {
  const or = `(${LANGS.map((l) => `slug_${l}.eq.${slug}`).join(',')})`;
  const q = new URLSearchParams({ select: '*', status: 'eq.published', or, limit: '1' });
  const { data } = await rest(`posts?${q}`);
  return data[0] || null;
}

export async function allPublishedForSitemap() {
  const cols = `updated_at,published_at,cover_url,${SLUG_COLS}`;
  const q = new URLSearchParams({
    select: cols,
    status: 'eq.published',
    order: 'published_at.desc',
    limit: '5000',
  });
  const { data } = await rest(`posts?${q}`);
  return data;
}
