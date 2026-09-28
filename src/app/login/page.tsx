'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch, toMessages } from '@/lib/api-client';
import { useSession, type SessionUser } from '@/lib/session';

/** Porte de `Login.tsx` — agora o formulário confere as credenciais no banco. */
export default function LoginPage() {
  const { user, signIn, signOut } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrors([]);

    try {
      const authenticated = await apiFetch<SessionUser>('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      signIn(authenticated);
      router.push('/');
    } catch (caught) {
      setErrors(toMessages(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <div className="auth-card mx-auto">
        <div className="card">
          <div className="card-body p-4">
            <h1 className="admin-title mb-1">Entrar</h1>
            <p className="text-muted small mb-4">Use o e-mail e a senha cadastrados.</p>

            {user ? (
              <>
                <p>
                  Você já está conectado como <strong>{user.name ?? user.email}</strong>.
                </p>
                <button className="btn btn-outline-secondary w-100 mb-3" onClick={signOut}>
                  Sair
                </button>
                <Link href="/" className="small">
                  Ver os cursos
                </Link>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                {errors.length > 0 && (
                  <div className="alert alert-danger">
                    <ul className="mb-0 ps-3">
                      {errors.map((message) => (
                        <li key={message}>{message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label" htmlFor="login-email">
                    E-mail
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    className="form-control"
                    placeholder="nome@email.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="login-password">
                    Senha
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    className="form-control"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={busy}>
                  {busy ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
