import { useState, type FormEvent } from 'react';
import { PerfumeryMark } from '@/components/marks';
import { api } from '@/lib/api';
import { pageTitle, useTitle } from '@/lib/hooks';
import { Link, navigate, safeNext } from '@/lib/router';
import { supabase } from '@/lib/supabase';

export default function Login() {
  useTitle(pageTitle('Sign in'));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');
    if (!email || !password) {
      setError('Enter both your email and your password.');
      return;
    }
    setBusy(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setBusy(false);
      setError('That email and password don’t match. Check both and try again.');
      return;
    }
    try {
      // Signing in proves the password; the server decides whether this account may use the admin.
      await api('/admin/me');
      navigate(safeNext(window.location.search), { replace: true });
    } catch (caught) {
      await supabase.auth.signOut();
      setError((caught as Error).message);
      setBusy(false);
    }
  };

  return (
    <main id="main" className="login">
      <div className="login-card">
        <Link href="/" aria-label="Ralph de Vinca Group, back to the site" style={{ display: 'inline-flex' }}>
          <PerfumeryMark size={44} className="gold" />
        </Link>
        <h1 className="disp">Sign in</h1>
        <p className="mu" style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>Ralph de Vinca Group admin, to read messages and edit case studies.</p>
        <form className="stack" style={{ marginTop: 22 }} onSubmit={submit} noValidate>
          <div>
            <label className="lbl" htmlFor="email">Email</label>
            <input className="field" id="email" name="email" type="email" autoComplete="username" required aria-invalid={error ? true : undefined} aria-describedby={error ? 'login-error' : undefined} />
          </div>
          <div>
            <label className="lbl" htmlFor="password">Password</label>
            <div className="pw">
              <input
                className="field"
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'login-error' : undefined}
              />
              <button type="button" className="btn line" onClick={() => setShowPassword(!showPassword)} aria-pressed={showPassword} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {error && <p className="err" id="login-error" role="alert" style={{ margin: 0 }}>{error}</p>}
          <button className="btn ink full" type="submit" disabled={busy}>{busy ? 'Signing in' : 'Sign in'}</button>
        </form>
      </div>
    </main>
  );
}
