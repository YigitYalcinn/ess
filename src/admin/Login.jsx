import { useState } from 'react';
import { supabase } from './supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(''); setInfo('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) setError(err.message === 'Invalid login credentials' ? 'E-posta veya şifre hatalı.' : err.message);
    setBusy(false);
  };

  const forgot = async () => {
    if (!email.trim()) { setError('Önce e-posta adresinizi yazın.'); return; }
    setBusy(true); setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin`,
    });
    setBusy(false);
    if (err) setError(err.message);
    else setInfo('Şifre sıfırlama bağlantısı e-postanıza gönderildi.');
  };

  return (
    <div className="a-center a-login-bg">
      <form className="a-card a-narrow" onSubmit={submit}>
        <img src="/brands/eray-logo.png" alt="Eray Ship Supply" className="a-login-logo" />
        <h1 className="a-brand">Blog Yönetimi</h1>
        <p className="a-muted">Eray Ship Supply yönetim paneline giriş yapın.</p>

        <label className="a-field">
          <span>E-posta</span>
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="a-field">
          <span>Şifre</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        {error && <p className="a-error">{error}</p>}
        {info && <p className="a-ok">{info}</p>}

        <button className="a-btn a-btn-block" disabled={busy}>{busy ? 'Giriş yapılıyor…' : 'Giriş yap'}</button>
        <button type="button" className="a-link a-forgot" onClick={forgot} disabled={busy}>Şifremi unuttum</button>
      </form>
    </div>
  );
}
