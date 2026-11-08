import { useState } from 'react';
import { supabase } from './supabase';

export default function NewPassword({ onDone }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 10) { setError('Şifre en az 10 karakter olmalı.'); return; }
    if (pw !== pw2) { setError('Şifreler eşleşmiyor.'); return; }
    setBusy(true); setError('');
    const { error: err } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (err) setError(err.message);
    else { alert('Şifreniz güncellendi.'); onDone(); }
  };

  return (
    <div className="a-center a-login-bg">
      <form className="a-card a-narrow" onSubmit={submit}>
        <h1 className="a-brand">Yeni şifre</h1>
        <label className="a-field"><span>Yeni şifre</span>
          <input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} required />
        </label>
        <label className="a-field"><span>Yeni şifre (tekrar)</span>
          <input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
        </label>
        {error && <p className="a-error">{error}</p>}
        <button className="a-btn a-btn-block" disabled={busy}>{busy ? 'Kaydediliyor…' : 'Şifreyi kaydet'}</button>
        <button type="button" className="a-link a-forgot" onClick={onDone}>Vazgeç</button>
      </form>
    </div>
  );
}
