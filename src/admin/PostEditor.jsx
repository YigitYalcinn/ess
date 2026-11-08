import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from './supabase';
import RichEditor from './RichEditor';
import { uploadImage, pickImage } from './image';
import { slugify, isValidSlug } from '../../api/_lib/slug.js';

const LANGS = ['tr', 'en', 'ru'];
const LANG_LABEL = { tr: 'Türkçe', en: 'English', ru: 'Русский' };
const FIELDS = ['slug', 'title', 'excerpt', 'meta_title', 'meta_desc', 'content'];
const SITE = 'erayshipsupply.com';
// Otomatik çeviri sadece Vercel'de VITE_TRANSLATION=on ve bir çeviri anahtarı tanımlıysa görünür
const TRANSLATE_ENABLED = import.meta.env.VITE_TRANSLATION === 'on';

const emptyForm = () => {
  const f = { status: 'draft', cover_url: '', published_at: null };
  for (const l of LANGS) for (const k of FIELDS) f[`${k}_${l}`] = '';
  return f;
};

const pathFor = (lang, slug) => `${lang === 'tr' ? '' : `/${lang}`}/blog/${slug || '…'}`;
const plain = (html) => (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

function Counter({ value, ideal, max }) {
  const n = (value || '').length;
  const cls = n === 0 ? '' : n > max ? 'bad' : n >= ideal ? 'good' : 'warn';
  return <span className={`a-counter ${cls}`}>{n}/{max}</span>;
}

function SeoPanel({ form, lang }) {
  const title = form[`meta_title_${lang}`] || (form[`title_${lang}`] ? `${form[`title_${lang}`]} | Eray Ship Supply` : '');
  const desc = form[`meta_desc_${lang}`] || form[`excerpt_${lang}`] || plain(form[`content_${lang}`]).slice(0, 155);
  const html = form[`content_${lang}`] || '';
  const words = plain(html).split(' ').filter(Boolean).length;
  const imgs = (html.match(/<img\b[^>]*>/g) || []);
  const imgsNoAlt = imgs.filter((t) => !/alt="[^"]+"/.test(t)).length;

  const checks = [
    [Boolean(form[`title_${lang}`]), 'Başlık yazıldı'],
    [title.length > 0 && title.length <= 60, `SEO başlığı 60 karakteri geçmiyor (${title.length})`],
    [desc.length >= 120 && desc.length <= 160, `Meta açıklama 120–160 karakter (${desc.length})`],
    [/<h2\b/.test(html), 'Yazıda en az bir H2 ara başlık var'],
    [words >= 300, `En az 300 kelime (${words})`],
    [imgsNoAlt === 0, imgs.length ? `Tüm görsellerde alt metin var (${imgs.length - imgsNoAlt}/${imgs.length})` : 'Görsel alt metinleri (görsel yok)'],
    [Boolean(form.cover_url), 'Kapak görseli eklendi'],
  ];

  return (
    <aside className="a-card a-seo">
      <h3>Google önizlemesi</h3>
      <div className="a-serp">
        <div className="a-serp-url">{SITE} › {pathFor(lang, form[`slug_${lang}`]).split('/').filter(Boolean).join(' › ')}</div>
        <div className="a-serp-title">{title || 'Sayfa başlığı'}</div>
        <div className="a-serp-desc">{desc ? (desc.length > 160 ? `${desc.slice(0, 157)}…` : desc) : 'Meta açıklama burada görünecek.'}</div>
      </div>
      <h3>SEO kontrol listesi</h3>
      <ul className="a-checks">
        {checks.map(([ok, label]) => (
          <li key={label} className={ok ? 'ok' : ''}>{ok ? '✓' : '○'} {label}</li>
        ))}
      </ul>
    </aside>
  );
}

export default function PostEditor({ id, onDone, onSaved, userId }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(Boolean(id));
  const [tab, setTab] = useState('tr');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [manual, setManual] = useState({ en: false, ru: false }); // çeviri yerine elle yazılıyor
  const [stale, setStale] = useState(false); // TR çeviriden sonra değişti mi
  const slugTouched = useRef({ tr: Boolean(id), en: Boolean(id), ru: Boolean(id) });

  useEffect(() => {
    if (!id) return;
    supabase.from('posts').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error) setMsg({ type: 'error', text: error.message });
      else {
        const f = emptyForm();
        for (const k of Object.keys(f)) if (data[k] !== null && data[k] !== undefined) f[k] = data[k];
        setForm(f);
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    const warn = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (key, value) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      const m = key.match(/^title_(tr|en|ru)$/);
      if (m && !slugTouched.current[m[1]]) next[`slug_${m[1]}`] = slugify(value);
      return next;
    });
    setDirty(true);
    if (key.endsWith('_tr') && (form.title_en || form.title_ru)) setStale(true);
  };

  const hasTranslations = Boolean(form.title_en || form.title_ru);

  // ---------------------------------------------------------- çeviri
  const translate = async (current = form, { ask = true } = {}) => {
    if (!current.title_tr.trim()) { setMsg({ type: 'error', text: 'Önce Türkçe başlığı yazın.' }); return null; }
    if (ask && (current.title_en || current.title_ru) &&
        !window.confirm('Mevcut İngilizce ve Rusça metinlerin üzerine yeni çeviri yazılacak. Devam edilsin mi?')) return null;

    setBusy('translate'); setMsg(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          title: current.title_tr,
          excerpt: current.excerpt_tr,
          meta_title: current.meta_title_tr,
          meta_desc: current.meta_desc_tr,
          content: current.content_tr,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Çeviri başarısız (${res.status})`);

      const next = { ...current };
      for (const l of ['en', 'ru']) {
        const t = data[l] || {};
        for (const k of ['title', 'excerpt', 'meta_title', 'meta_desc', 'content']) next[`${k}_${l}`] = t[k] || '';
        if (!slugTouched.current[l] || !next[`slug_${l}`]) next[`slug_${l}`] = t.slug || slugify(t.title || '');
      }
      setForm(next);
      setDirty(true);
      setStale(false);
      setMsg({ type: 'ok', text: 'Çeviri hazır. EN ve RU sekmelerinden kontrol edip düzeltebilirsiniz.' });
      return next;
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
      return null;
    } finally {
      setBusy('');
    }
  };

  // ---------------------------------------------------------- kaydet
  const save = async (status) => {
    let current = { ...form, status };
    if (!current.title_tr.trim()) { setTab('tr'); setMsg({ type: 'error', text: 'Türkçe başlık zorunlu.' }); return; }
    if (!current.slug_tr) current.slug_tr = slugify(current.title_tr);

    // Yayınlarken çeviri yoksa otomatik çevir; çeviri yapılamazsa sadece dolu dillerde yayınla
    if (TRANSLATE_ENABLED && status === 'published' && (!current.title_en || !current.title_ru)) {
      const translated = await translate(current, { ask: false });
      if (translated) current = { ...translated, status };
      else if (!window.confirm('Otomatik çeviri yapılamadı. Yazı sadece doldurulmuş dillerde yayınlansın mı?')) return;
    }

    for (const l of LANGS) {
      const s = current[`slug_${l}`];
      if (current[`title_${l}`] && !s) current[`slug_${l}`] = slugify(current[`title_${l}`]);
      if (current[`slug_${l}`] && !isValidSlug(current[`slug_${l}`])) {
        setTab(l);
        setMsg({ type: 'error', text: `${LANG_LABEL[l]} URL (slug) sadece küçük harf, rakam ve tire içerebilir.` });
        return;
      }
    }

    const payload = { status: current.status, cover_url: current.cover_url || null };
    for (const l of LANGS) {
      for (const k of FIELDS) {
        const v = String(current[`${k}_${l}`] || '').trim();
        payload[`${k}_${l}`] = l === 'tr' && k === 'content' ? v : v || null;
      }
    }
    payload.title_tr = current.title_tr.trim();
    payload.slug_tr = current.slug_tr;

    setBusy(status); setMsg(null);
    const query = id
      ? supabase.from('posts').update(payload).eq('id', id).select().single()
      : supabase.from('posts').insert({ ...payload, created_by: userId }).select().single();
    const { data, error } = await query;
    setBusy('');

    if (error) {
      const text = error.code === '23505'
        ? 'Bu URL (slug) başka bir yazıda kullanılıyor. Lütfen farklı bir URL yazın.'
        : error.message;
      setMsg({ type: 'error', text });
      return;
    }
    setForm((f) => ({ ...f, ...current, published_at: data.published_at, status: data.status }));
    setDirty(false);
    setMsg({ type: 'ok', text: status === 'published' ? 'Yayınlandı! Sitede birkaç saniye içinde görünür.' : 'Taslak kaydedildi.' });
    if (!id && onSaved) onSaved(data.id);
  };

  const unpublish = () => save('draft');

  const setCover = async () => {
    const file = await pickImage();
    if (!file) return;
    setBusy('cover');
    try { set('cover_url', await uploadImage(file)); }
    catch (err) { setMsg({ type: 'error', text: `Kapak yüklenemedi: ${err.message}` }); }
    finally { setBusy(''); }
  };

  const back = () => {
    if (dirty && !window.confirm('Kaydedilmemiş değişiklikler var. Çıkılsın mı?')) return;
    onDone();
  };

  const publicUrl = useMemo(
    () => (form.status === 'published' && form[`slug_${tab}`] ? pathFor(tab, form[`slug_${tab}`]) : null),
    [form, tab],
  );

  if (loading) return <div className="a-spinner" />;

  const l = tab;
  const isTr = l === 'tr';

  return (
    <section className="a-editor-page">
      <div className="a-page-head">
        <div>
          <button className="a-link" onClick={back}>← Yazılar</button>
          <h1 className="a-h1">{id ? 'Yazıyı düzenle' : 'Yeni yazı'}</h1>
          <p className="a-muted">
            Durum: <span className={`a-badge ${form.status}`}>{form.status === 'published' ? 'Yayında' : 'Taslak'}</span>
            {dirty && <span className="a-unsaved"> • Kaydedilmemiş değişiklikler</span>}
          </p>
        </div>
        <div className="a-actions">
          {publicUrl && <a className="a-btn a-btn-ghost" href={publicUrl} target="_blank" rel="noreferrer">Sitede gör ↗</a>}
          {TRANSLATE_ENABLED && <button className="a-btn a-btn-ghost" onClick={() => translate()} disabled={Boolean(busy)}>
            {busy === 'translate' ? 'Çevriliyor…' : hasTranslations ? '↻ Yeniden çevir' : '🌐 EN + RU çevir'}
          </button>}
          {form.status === 'published' ? (
            <>
              <button className="a-btn a-btn-ghost" onClick={unpublish} disabled={Boolean(busy)}>Yayından kaldır</button>
              <button className="a-btn" onClick={() => save('published')} disabled={Boolean(busy)}>{busy === 'published' ? 'Kaydediliyor…' : 'Güncelle'}</button>
            </>
          ) : (
            <>
              <button className="a-btn a-btn-ghost" onClick={() => save('draft')} disabled={Boolean(busy)}>{busy === 'draft' ? 'Kaydediliyor…' : 'Taslak kaydet'}</button>
              <button className="a-btn" onClick={() => save('published')} disabled={Boolean(busy)}>{busy === 'published' ? 'Yayınlanıyor…' : 'Yayınla'}</button>
            </>
          )}
        </div>
      </div>

      {msg && <p className={msg.type === 'error' ? 'a-error' : 'a-ok'}>{msg.text}</p>}
      {stale && (
        <p className="a-warn">
          Türkçe metni çeviriden sonra değiştirdiniz. İngilizce ve Rusça sürümleri güncellemek için “Yeniden çevir”e basın.
        </p>
      )}

      <div className="a-tabs">
        {LANGS.map((x) => (
          <button key={x} className={tab === x ? 'active' : ''} onClick={() => setTab(x)}>
            {x.toUpperCase()} <small>{LANG_LABEL[x]}</small>
            {x !== 'tr' && <span className={`a-dot ${form[`title_${x}`] ? 'on' : ''}`} />}
          </button>
        ))}
      </div>

      {TRANSLATE_ENABLED && !isTr && !form[`title_${l}`] && !manual[l] && (
        <div className="a-card a-empty">
          <p>Bu dilde henüz çeviri yok. Türkçe yazıyı bitirdikten sonra çevirin. Yayınla’ya bastığınızda da otomatik çevrilir.</p>
          <div className="a-actions" style={{ justifyContent: 'center' }}>
            <button className="a-btn" onClick={() => translate()} disabled={Boolean(busy)}>🌐 EN + RU çevir</button>
            <button className="a-btn a-btn-ghost" onClick={() => setManual((m) => ({ ...m, [l]: true }))}>Elle yaz</button>
          </div>
        </div>
      )}

      {(isTr || !TRANSLATE_ENABLED || form[`title_${l}`] || manual[l]) && (
        <div className="a-grid">
          <div className="a-col-main">
            <div className="a-card">
              {!isTr && (
                <p className="a-note">
                  {TRANSLATE_ENABLED
                    ? 'Otomatik çeviriyi kontrol edip gerekirse düzeltebilirsiniz. '
                    : `${LANG_LABEL[l]} çevirisini buraya yazın veya yapıştırın. `}
                  Bu sekme boş kalırsa yazı bu dilde yayınlanmaz, diğer dillerde görünmeye devam eder.
                </p>
              )}
              <label className="a-field">
                <span>Başlık {isTr && <em>*</em>}</span>
                <input className="a-input-lg" value={form[`title_${l}`]} onChange={(e) => set(`title_${l}`, e.target.value)}
                  placeholder={isTr ? 'Örn: Tuzla’da Gemi Tedariki Nasıl Yapılır?' : ''} />
              </label>
              <label className="a-field">
                <span>URL (slug)</span>
                <div className="a-slug">
                  <span>{SITE}{l === 'tr' ? '' : `/${l}`}/blog/</span>
                  <input value={form[`slug_${l}`]} onChange={(e) => { slugTouched.current[l] = true; set(`slug_${l}`, e.target.value.toLowerCase()); }}
                    onBlur={(e) => set(`slug_${l}`, slugify(e.target.value))} />
                </div>
                {form.status === 'published' && <small className="a-muted">Yayındaki bir yazının URL’sini değiştirmek eski bağlantıları bozar ve SEO’ya zarar verebilir.</small>}
              </label>
              <label className="a-field">
                <span>Kısa özet <small className="a-muted">— liste sayfasında görünür</small></span>
                <textarea rows={2} value={form[`excerpt_${l}`]} onChange={(e) => set(`excerpt_${l}`, e.target.value)} />
              </label>
            </div>

            <div className="a-card a-card-flush">
              <RichEditor
                key={l}
                value={form[`content_${l}`]}
                onChange={(html) => set(`content_${l}`, html)}
                placeholder={isTr ? 'Yazınızı buraya yazın. Bölümleri H2 / H3 ara başlıklarla ayırın.' : `${LANG_LABEL[l]} metni…`}
              />
            </div>
          </div>

          <div className="a-col-side">
            <div className="a-card">
              <h3>Kapak görseli</h3>
              {form.cover_url ? (
                <div className="a-cover">
                  <img src={form.cover_url} alt="" />
                  <div className="a-cover-actions">
                    <button className="a-btn a-btn-ghost a-btn-sm" onClick={setCover} disabled={Boolean(busy)}>Değiştir</button>
                    <button className="a-btn a-btn-ghost a-btn-sm a-danger" onClick={() => set('cover_url', '')}>Kaldır</button>
                  </div>
                </div>
              ) : (
                <button className="a-dropzone" onClick={setCover} disabled={Boolean(busy)}>
                  {busy === 'cover' ? 'Yükleniyor…' : '+ Kapak görseli yükle'}
                  <small>Önerilen: 1600×900, yatay</small>
                </button>
              )}
              <small className="a-muted">Kapak görseli tüm dillerde ortaktır.</small>
            </div>

            <div className="a-card">
              <h3>SEO ayarları <small className="a-muted">({LANG_LABEL[l]})</small></h3>
              <label className="a-field">
                <span>SEO başlığı <Counter value={form[`meta_title_${l}`]} ideal={40} max={60} /></span>
                <input value={form[`meta_title_${l}`]} onChange={(e) => set(`meta_title_${l}`, e.target.value)}
                  placeholder="Boş bırakılırsa: Başlık | Eray Ship Supply" />
              </label>
              <label className="a-field">
                <span>Meta açıklama <Counter value={form[`meta_desc_${l}`]} ideal={120} max={160} /></span>
                <textarea rows={3} value={form[`meta_desc_${l}`]} onChange={(e) => set(`meta_desc_${l}`, e.target.value)}
                  placeholder="Boş bırakılırsa özetten veya yazının başından alınır" />
              </label>
            </div>

            <SeoPanel form={form} lang={l} />
          </div>
        </div>
      )}
    </section>
  );
}
