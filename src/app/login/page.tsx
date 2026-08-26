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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="text-center text-black mb-4">Acesso</h2>

              {user ? (
                <>
                  <p className="text-center">
                    Você já está conectado como <strong>{user.name ?? user.email}</strong>.
                  </p>
                  <button className="btn btn-outline-danger w-100 mb-3" onClick={signOut}>
                    Sair
                  </button>
                  <div className="text-center">
                    <Link href="/" className="text-decoration-none">
                      Voltar para a Home
                    </Link>
                  </div>
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
                      placeholder="Seu e-mail"
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
                      placeholder="Sua senha"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mb-3" disabled={busy}>
                    {busy ? 'Entrando...' : 'Entrar'}
                  </button>

                  <div className="text-center">
                    <Link href="/" className="text-decoration-none">
                      Voltar para a Home
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
