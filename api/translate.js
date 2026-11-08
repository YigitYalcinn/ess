// POST /api/translate — Türkçe yazıyı İngilizce ve Rusçaya çevirir.
// Sadece giriş yapmış ve admins tablosunda olan kullanıcılar kullanabilir.
//
// Sağlayıcı seçimi (Vercel ortam değişkenleri):
//   ANTHROPIC_API_KEY  varsa Claude kullanılır (varsayılan; ANTHROPIC_MODEL ile model değiştirilebilir)
//   DEEPL_API_KEY      Claude anahtarı yoksa DeepL kullanılır (yedek seçenek)

import { slugify } from './_lib/slug.js';

const TEXT_FIELDS = ['title', 'excerpt', 'meta_title', 'meta_desc'];
const TARGETS = ['en', 'ru'];
const MAX_CONTENT_CHARS = 120000;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

// ---------------------------------------------------------------- yetki

async function requireAdmin(req) {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
  const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anon) throw Object.assign(new Error('Supabase ayarları eksik'), { status: 500 });

  const auth = req.headers.authorization || req.headers.Authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) throw Object.assign(new Error('Giriş gerekli'), { status: 401 });

  const userRes = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
  if (!userRes.ok) throw Object.assign(new Error('Oturum geçersiz, tekrar giriş yapın'), { status: 401 });
  const user = await userRes.json();

  const adminRes = await fetch(`${url}/rest/v1/admins?select=user_id&user_id=eq.${encodeURIComponent(user.id)}`, {
    headers: { apikey: anon, Authorization: `Bearer ${token}` },
  });
  const rows = adminRes.ok ? await adminRes.json() : [];
  if (!rows.length) throw Object.assign(new Error('Bu hesabın yetkisi yok'), { status: 403 });
  return user;
}

// ---------------------------------------------------------------- DeepL

async function deeplCall(key, texts, target, html) {
  const endpoint = key.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com';
  const res = await fetch(`${endpoint}/v2/translate`, {
    method: 'POST',
    headers: { Authorization: `DeepL-Auth-Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: texts,
      source_lang: 'TR',
      target_lang: target === 'en' ? 'EN-GB' : 'RU',
      ...(html ? { tag_handling: 'html' } : {}),
      preserve_formatting: true,
    }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    if (res.status === 456) throw new Error('DeepL aylık karakter kotası doldu');
    throw new Error(`DeepL hatası (${res.status}): ${msg.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.translations.map((t) => t.text);
}

async function translateWithDeepL(key, src) {
  const textKeys = TEXT_FIELDS.filter((f) => src[f]);
  const out = {};
  for (const target of TARGETS) {
    const result = {};
    if (textKeys.length) {
      const translated = await deeplCall(key, textKeys.map((k) => src[k]), target, false);
      textKeys.forEach((k, i) => { result[k] = translated[i]; });
    }
    if (src.content) [result.content] = await deeplCall(key, [src.content], target, true);
    out[target] = result;
  }
  return out;
}

// ---------------------------------------------------------------- Claude

const LANG_NAMES = { en: 'English (British spelling)', ru: 'Russian' };

async function translateWithClaude(key, src) {
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
  const payload = {};
  for (const f of [...TEXT_FIELDS, 'content']) if (src[f]) payload[f] = src[f];

  const one = async (target) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 16000,
        system:
          'You are a professional translator for Eray Ship Supply, a ship chandler and marine hardware supplier in Tuzla, Istanbul. ' +
          `Translate the Turkish blog fields you receive into ${LANG_NAMES[target]}. ` +
          'Use correct maritime and hardware terminology, keep a natural, SEO-friendly tone, and keep brand and product names (Eray Ship Supply, Bosch, Stanley, etc.) unchanged. ' +
          'The "content" field is HTML: keep every tag and attribute exactly as it is and translate only the visible text (also translate img alt attributes). ' +
          'meta_title should stay under 60 characters and meta_desc under 160 characters where possible. ' +
          'Reply with ONLY a JSON object that has exactly the same keys as the input. No commentary, no code fences.',
        messages: [{ role: 'user', content: JSON.stringify(payload) }],
      }),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(`Claude API hatası (${res.status}): ${msg.slice(0, 200)}`);
    }
    const data = await res.json();
    const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('Çeviri yanıtı okunamadı');
    return JSON.parse(text.slice(start, end + 1));
  };

  const [en, ru] = await Promise.all(TARGETS.map(one));
  return { en, ru };
}

// ---------------------------------------------------------------- handler

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Sadece POST' });

  try {
    await requireAdmin(req);

    const body = await readBody(req);
    const src = {};
    for (const f of [...TEXT_FIELDS, 'content']) {
      if (typeof body[f] === 'string' && body[f].trim()) src[f] = body[f].trim();
    }
    if (!src.title) return json(res, 400, { error: 'Önce Türkçe başlığı yazın' });
    if ((src.content || '').length > MAX_CONTENT_CHARS) return json(res, 413, { error: 'Yazı çeviri için çok uzun' });

    let result;
    if (process.env.ANTHROPIC_API_KEY) result = await translateWithClaude(process.env.ANTHROPIC_API_KEY, src);
    else if (process.env.DEEPL_API_KEY) result = await translateWithDeepL(process.env.DEEPL_API_KEY, src);
    else return json(res, 503, { error: 'Çeviri anahtarı tanımlı değil (ANTHROPIC_API_KEY). EN/RU sekmelerini elle doldurabilirsiniz.' });

    for (const l of TARGETS) {
      result[l] = result[l] || {};
      result[l].slug = slugify(result[l].title || '');
    }
    return json(res, 200, result);
  } catch (err) {
    console.error('[translate]', err);
    return json(res, err.status || 502, { error: err.message || 'Çeviri başarısız' });
  }
}
