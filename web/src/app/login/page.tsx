'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toMessages } from '@/lib/api-client';
import { authApi } from '@/lib/api';
import { useSession } from '@/lib/session';
import { FormErrors } from '@/components/admin/FormErrors';

/** Login: `POST /auth/login` do Nest devolve o `access_token`, que fica na sessão. */
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
      const { access_token } = await authApi.login({ email, password });
      signIn(access_token);
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
                  Você já está conectado como <strong>{user.email}</strong>.
                </p>
                <button className="btn btn-outline-secondary w-100 mb-3" onClick={signOut}>
                  Sair
                </button>
                <Link href="/" className="small">
                  Ver os cursos
                </Link>
              </>
            ) : (
              <>
                <form onSubmit={handleSubmit}>
                  <FormErrors messages={errors} />

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

                <p className="small text-muted mt-3 mb-0">
                  Ainda não tem conta? <Link href="/cadastro">Criar conta</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
