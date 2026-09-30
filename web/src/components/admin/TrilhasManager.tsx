'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toMessages } from '@/lib/api-client';
import { trilhasApi, type Trilha as AdminTrilha } from '@/lib/api';
import { formatCount } from '@/lib/format';
import { FormErrors } from './FormErrors';

const EMPTY_FORM = { title: '', description: '' };

export function TrilhasManager({ trilhas }: { trilhas: AdminTrilha[] }) {
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

  function startEdit(trilha: AdminTrilha) {
    setEditingId(trilha.id);
    setForm({ title: trilha.title, description: trilha.description });
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
        await trilhasApi.create(form);
        setNotice('Trilha criada com sucesso.');
      } else {
        await trilhasApi.update(editingId, form);
        setNotice('Trilha atualizada com sucesso.');
      }

      resetForm();
      router.refresh();
    } catch (caught) {
      setErrors(toMessages(caught));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(trilha: AdminTrilha) {
    const aviso =
      trilha._count.courses > 0
        ? trilha._count.courses === 1
          ? ' O curso dela ficará sem trilha (não será excluído).'
          : ` Os ${trilha._count.courses} cursos dela ficarão sem trilha (não serão excluídos).`
        : '';

    if (!window.confirm(`Excluir a trilha "${trilha.title}"?${aviso}`)) return;

    setBusy(true);
    setErrors([]);
    setNotice(null);

    try {
      await trilhasApi.remove(trilha.id);
      if (editingId === trilha.id) resetForm();
      setNotice('Trilha excluída com sucesso.');
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
              {editingId === null ? 'Nova trilha' : `Editando trilha #${editingId}`}
            </h2>

            <FormErrors messages={errors} />

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="trilha-title">
                  Título
                </label>
                <input
                  id="trilha-title"
                  type="text"
                  className="form-control"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Trilha Frontend"
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="trilha-description">
                  Descrição
                </label>
                <textarea
                  id="trilha-description"
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="HTML, CSS, JS, React e muito mais."
                />
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
                  <th>Trilha</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {trilhas.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center text-muted py-4">
                      Nenhuma trilha cadastrada.
                    </td>
                  </tr>
                ) : (
                  trilhas.map((trilha) => (
                    <tr key={trilha.id}>
                      <td>
                        {trilha.title}
                        <div className="small text-muted">{trilha.description}</div>
                        <ul className="meta-list">
                          <li>#{trilha.id}</li>
                          <li>{formatCount(trilha._count.courses, 'curso', 'cursos')}</li>
                        </ul>
                      </td>
                      <td className="text-end text-nowrap">
                        <Link
                          href={`/trilhas/${trilha.id}`}
                          className="btn btn-sm btn-outline-secondary me-2"
                        >
                          Ver
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => startEdit(trilha)}
                          disabled={busy}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(trilha)}
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
