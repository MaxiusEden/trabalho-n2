'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch, toMessages } from '@/lib/api-client';
import { formatCount, formatDate } from '@/lib/format';
import { FormErrors } from './FormErrors';

export type AdminUser = {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date | string;
  updateAt: Date | string;
  _count?: { enrollments: number };
};

const EMPTY_FORM = { email: '', name: '', password: '' };

/** CRUD de usuários — a entidade especificada no PDF. */
export function UsersManager({ users }: { users: AdminUser[] }) {
  const router = useRouter();

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErrors([]);
  }

  function startEdit(user: AdminUser) {
    setEditingId(user.id);
    setForm({ email: user.email, name: user.name ?? '', password: '' });
    setErrors([]);
    setNotice(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrors([]);
    setNotice(null);

    try {
      if (editingId === null) {
        await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(form) });
        setNotice('Usuário criado com sucesso.');
      } else {
        // Senha em branco na edição significa "manter a atual".
        const payload: Record<string, string> = { email: form.email, name: form.name };
        if (form.password !== '') payload.password = form.password;

        await apiFetch(`/api/users/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setNotice('Usuário atualizado com sucesso.');
      }

      resetForm();
      router.refresh();
    } catch (caught) {
      setErrors(toMessages(caught));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(user: AdminUser) {
    if (!window.confirm(`Excluir o usuário "${user.email}"? As matrículas dele serão removidas.`))
      return;

    setBusy(true);
    setErrors([]);
    setNotice(null);

    try {
      await apiFetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (editingId === user.id) resetForm();
      setNotice('Usuário excluído com sucesso.');
      router.refresh();
    } catch (caught) {
      setErrors(toMessages(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="row g-4">
      <div className="col-12 col-xl-4">
        <div className="card">
          <div className="card-body">
            <h2 className="h5 card-title mb-3">
              {editingId === null ? 'Novo usuário' : `Editando usuário #${editingId}`}
            </h2>

            <FormErrors messages={errors} />

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="user-email">
                  E-mail
                </label>
                <input
                  id="user-email"
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="joao@email.com"
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="user-name">
                  Nome
                </label>
                <input
                  id="user-name"
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="João Silva"
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="user-password">
                  Senha
                </label>
                <input
                  id="user-password"
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder={editingId === null ? 'Mínimo 6 caracteres' : 'Deixe vazio para manter'}
                />
                <div className="form-text">Mínimo de 6 caracteres.</div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary flex-grow-1" disabled={busy}>
                  {editingId === null ? 'Criar' : 'Salvar'}
                </button>
                {editingId !== null && (
                  <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-8">
        {notice && <div className="alert alert-success">{notice}</div>}

        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover table-stack align-middle mb-0">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center text-muted py-4">
                      Nenhum usuário cadastrado.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        {user.name ?? <span className="text-muted">Sem nome</span>}
                        <div className="small text-muted text-break">{user.email}</div>
                        <ul className="meta-list">
                          <li>#{user.id}</li>
                          <li>
                            {formatCount(user._count?.enrollments ?? 0, 'matrícula', 'matrículas')}
                          </li>
                          <li>Criado em {formatDate(user.createdAt)}</li>
                          <li>Atualizado em {formatDate(user.updateAt)}</li>
                        </ul>
                      </td>
                      <td className="text-end text-nowrap">
                        <Link
                          href={`/admin/matriculas?userId=${user.id}`}
                          className="btn btn-sm btn-outline-secondary me-2"
                        >
                          Matrículas
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => startEdit(user)}
                          disabled={busy}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(user)}
                          disabled={busy}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
