import { useState, type FormEvent } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { Arrow, Win } from '@/components/hud';
import { TechnologyMark } from '@/components/marks';
import { api } from '@/lib/api';
import { pageTitle, useTitle } from '@/lib/hooks';
import { Link, navigate, safeNext } from '@/lib/router';
import { setToken } from '@/lib/auth';


export default function Login() {
  useTitle(pageTitle('Sign in'));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const { token } = await api<{ token: string }>('/auth/login', {
        method: 'POST',
        json: { email: String(data.get('email') ?? '').trim(), password: String(data.get('password') ?? '') },
      });
      setToken(token);
      navigate(safeNext(window.location.search), { replace: true });
    } catch (caught) {
      setError((caught as Error).message);
      setBusy(false);
    }
  };

  return (
    <main id="main" className="split">
      <div style={{ position: 'relative', minHeight: 360, borderRight: '1px solid var(--line)', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px solid var(--line)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', borderLeft: '1px solid var(--line)' }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <TechnologyMark size={320} />
        </div>
        <Link className="brand" href="/" style={{ position: 'absolute', left: 40, top: 20 }}>
          Ralph de Vinca <span className="m mu">Group</span>
        </Link>
        <p className="m mu" style={{ position: 'absolute', left: 40, bottom: 28, margin: 0 }}>Fig. 00 · Admin · messages and case studies</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px clamp(16px, 6vw, 96px)' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <p className="m" style={{ margin: '0 0 14px' }}>[ Admin ]</p>
          <h1 className="h1" style={{ fontSize: 'clamp(56px, 6vw, 96px)', marginBottom: 14 }}>Sign in</h1>
          <p className="p" style={{ marginBottom: 36 }}>To read messages and edit case studies.</p>
          {error && (
            <p className="note bad" role="alert" style={{ marginBottom: 28 }}>{error}</p>
          )}
          <form onSubmit={submit}>
            <Win title="Credentials" bodyClass="win-c lg stack">
              <div>
                <label className="lbl" htmlFor="email">Email</label>
                <input className="field" id="email" name="email" type="email" autoComplete="username" required aria-invalid={error ? true : undefined} />
              </div>
              <div>
                <label className="lbl" htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="field"
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    aria-invalid={error ? true : undefined}
                    style={{ paddingRight: 52 }}
                  />
                  <button
                    type="button"
                    className="qb"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    style={{ position: 'absolute', right: 0, top: 2, minWidth: 44, justifyContent: 'center', textDecoration: 'none' }}
                  >
                    {showPassword ? <EyeSlash size={22} aria-hidden="true" /> : <Eye size={22} aria-hidden="true" />}
                  </button>
                </div>
              </div>
              <button className="btn full" type="submit" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign in'} <Arrow />
              </button>
            </Win>
          </form>
        </div>
      </div>
    </main>
  );
}
