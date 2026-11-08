import { useEffect, useState, useCallback } from 'react';
import { supabase, isConfigured } from './supabase';
import Login from './Login';
import PostList from './PostList';
import PostEditor from './PostEditor';
import NewPassword from './NewPassword';

// Basit hash yönlendirme: #/  #/new  #/edit/<id>
function useHashRoute() {
  const read = () => window.location.hash.replace(/^#/, '') || '/';
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const go = useCallback((path) => { window.location.hash = path; }, []);
  return [route, go];
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = yükleniyor
  const [adminCheck, setAdminCheck] = useState({ uid: null, ok: false });
  const [recovery, setRecovery] = useState(false);
  const [route, go] = useHashRoute();

  useEffect(() => {
    if (!isConfigured) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const uid = session?.user?.id || null;
  useEffect(() => {
    if (!uid) return;
    supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', uid)
      .maybeSingle()
      .then(({ data }) => setAdminCheck({ uid, ok: Boolean(data) }));
  }, [uid]);
  // null = henüz kontrol edilmedi
  const isAdmin = uid && adminCheck.uid === uid ? adminCheck.ok : null;

  if (!isConfigured) {
    return (
      <div className="a-center">
        <div className="a-card a-narrow">
          <h1 className="a-brand">Kurulum eksik</h1>
          <p>Vercel’de <code>VITE_SUPABASE_URL</code> ve <code>VITE_SUPABASE_ANON_KEY</code> ortam değişkenleri tanımlanmamış. KURULUM.md dosyasına bakın.</p>
        </div>
      </div>
    );
  }

  if (session === undefined) return <div className="a-center"><div className="a-spinner" /></div>;
  if (!session) return <Login />;
  if (recovery) return <NewPassword onDone={() => setRecovery(false)} />;
  if (isAdmin === null) return <div className="a-center"><div className="a-spinner" /></div>;

  const logout = () => supabase.auth.signOut();

  if (!isAdmin) {
    return (
      <div className="a-center">
        <div className="a-card a-narrow">
          <h1 className="a-brand">Yetki yok</h1>
          <p><strong>{session.user.email}</strong> hesabının blog yönetme yetkisi yok. Site yöneticisine başvurun.</p>
          <button className="a-btn" onClick={logout}>Çıkış yap</button>
        </div>
      </div>
    );
  }

  const editMatch = route.match(/^\/edit\/([0-9a-f-]+)$/);

  return (
    <div className="a-shell">
      <header className="a-top">
        <a href="#/" className="a-logo">
          <img src="/brands/eray-logo.png" alt="" />
          <span>ERAY <em>Blog Yönetimi</em></span>
        </a>
        <div className="a-top-right">
          <a href="/blog" target="_blank" rel="noreferrer" className="a-link">Blogu görüntüle ↗</a>
          <span className="a-user">{session.user.email}</span>
          <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setRecovery(true)}>Şifre değiştir</button>
          <button className="a-btn a-btn-ghost a-btn-sm" onClick={logout}>Çıkış</button>
        </div>
      </header>
      <main className="a-main">
        {route === '/new' && <PostEditor key="new" onDone={() => go('/')} onSaved={(id) => go(`/edit/${id}`)} userId={session.user.id} />}
        {editMatch && <PostEditor key={editMatch[1]} id={editMatch[1]} onDone={() => go('/')} userId={session.user.id} />}
        {route !== '/new' && !editMatch && <PostList onNew={() => go('/new')} onEdit={(id) => go(`/edit/${id}`)} />}
      </main>
    </div>
  );
}
