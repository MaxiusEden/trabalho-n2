'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toMessages } from '@/lib/api-client';
import { authApi, usersApi } from '@/lib/api';
import { useSession } from '@/lib/session';
import { FormErrors } from '@/components/admin/FormErrors';

const EMPTY_FORM = { name: '', email: '', password: '' };

/** Cadastro: `POST /users` (rota pública do Nest) e, em seguida, o login com a mesma senha. */
export default function CadastroPage() {
  const { signIn } = useSession();
  const router = useRouter();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrors([]);

    try {
      await usersApi.create(form);
      const { access_token } = await authApi.login({ email: form.email, password: form.password });
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
            <h1 className="admin-title mb-1">Criar conta</h1>
            <p className="text-muted small mb-4">Com a conta você se matricula nos cursos.</p>

            <form onSubmit={handleSubmit}>
              <FormErrors messages={errors} />

              <div className="mb-3">
                <label className="form-label" htmlFor="signup-name">
                  Nome
                </label>
                <input
                  id="signup-name"
                  type="text"
                  className="form-control"
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="signup-email">
                  E-mail
                </label>
                <input
                  id="signup-email"
                  type="email"
                  className="form-control"
                  placeholder="nome@email.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="signup-password">
                  Senha
                </label>
                <input
                  id="signup-password"
                  type="password"
                  className="form-control"
                  autoComplete="new-password"
                  minLength={6}
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  required
                />
                <div className="form-text">Mínimo de 6 caracteres.</div>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={busy}>
                {busy ? 'Criando...' : 'Criar conta'}
              </button>
            </form>

            <p className="small text-muted mt-3 mb-0">
              Já tem conta? <Link href="/login">Entrar</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
