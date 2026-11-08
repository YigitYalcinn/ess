import { useEffect, useState } from 'react';
import { supabase } from './supabase';

const fmt = (iso) =>
  iso ? new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)) : '—';

export default function PostList({ onNew, onEdit }) {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    supabase
      .from('posts')
      .select('id,status,title_tr,slug_tr,title_en,title_ru,cover_url,published_at,updated_at')
      .order('updated_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setPosts(data);
      });
  }, []);

  const remove = async (p) => {
    if (!window.confirm(`“${p.title_tr}” kalıcı olarak silinsin mi? Bu işlem geri alınamaz.`)) return;
    const { error: err } = await supabase.from('posts').delete().eq('id', p.id);
    if (err) alert(err.message);
    else setPosts((list) => list.filter((x) => x.id !== p.id));
  };

  const shown = (posts || []).filter((p) => filter === 'all' || p.status === filter);
  const counts = {
    all: posts?.length || 0,
    published: posts?.filter((p) => p.status === 'published').length || 0,
    draft: posts?.filter((p) => p.status === 'draft').length || 0,
  };

  return (
    <section>
      <div className="a-page-head">
        <div>
          <h1 className="a-h1">Yazılar</h1>
          <p className="a-muted">Türkçe yazın, tek tıkla İngilizce ve Rusçaya çevirin.</p>
        </div>
        <button className="a-btn" onClick={onNew}>+ Yeni yazı</button>
      </div>

      <div className="a-tabs a-tabs-sm">
        {[['all', 'Tümü'], ['published', 'Yayında'], ['draft', 'Taslak']].map(([k, label]) => (
          <button key={k} className={filter === k ? 'active' : ''} onClick={() => setFilter(k)}>
            {label} <span className="a-count">{counts[k]}</span>
          </button>
        ))}
      </div>

      {error && <p className="a-error">{error}</p>}
      {posts === null && !error && <div className="a-spinner" />}

      {posts && shown.length === 0 && (
        <div className="a-card a-empty">
          <p>Henüz yazı yok.</p>
          <button className="a-btn" onClick={onNew}>İlk yazıyı oluştur</button>
        </div>
      )}

      {shown.length > 0 && (
        <div className="a-list">
          {shown.map((p) => (
            <article key={p.id} className="a-row" onClick={() => onEdit(p.id)}>
              <div className="a-thumb">{p.cover_url ? <img src={p.cover_url} alt="" /> : <span>ESS</span>}</div>
              <div className="a-row-main">
                <h2>{p.title_tr || '(başlıksız)'}</h2>
                <p className="a-muted a-small">/blog/{p.slug_tr}</p>
              </div>
              <div className="a-langs" title="Çeviri durumu">
                <span className="on">TR</span>
                <span className={p.title_en ? 'on' : ''}>EN</span>
                <span className={p.title_ru ? 'on' : ''}>RU</span>
              </div>
              <span className={`a-badge ${p.status}`}>{p.status === 'published' ? 'Yayında' : 'Taslak'}</span>
              <span className="a-muted a-small a-date">{p.status === 'published' ? fmt(p.published_at) : `Düzenlendi ${fmt(p.updated_at)}`}</span>
              <div className="a-row-actions" onClick={(e) => e.stopPropagation()}>
                {p.status === 'published' && (
                  <a className="a-btn a-btn-ghost a-btn-sm" href={`/blog/${p.slug_tr}`} target="_blank" rel="noreferrer">Gör</a>
                )}
                <button className="a-btn a-btn-ghost a-btn-sm a-danger" onClick={() => remove(p)}>Sil</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
