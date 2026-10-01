'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toMessages } from '@/lib/api-client';
import { categoriesApi, type Category } from '@/lib/api';
import { formatCount } from '@/lib/format';
import { FormErrors } from './FormErrors';

const EMPTY_FORM = { name: '', description: '' };

/** CRUD de categorias (LAB03, Categorias). Só ADMIN; a API também barra (403). */
export function CategoriesManager({ categories }: { categories: Category[] }) {
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

  function startEdit(category: Category) {
    setEditingId(category.id);
    setForm({ name: category.name, description: category.description });
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
        await categoriesApi.create(form);
        setNotice('Categoria criada com sucesso.');
      } else {
        await categoriesApi.update(editingId, form);
        setNotice('Categoria atualizada com sucesso.');
      }

      resetForm();
      router.refresh();
    } catch (caught) {
      setErrors(toMessages(caught));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(category: Category) {
    const { courses, trilhas } = category._count;
    const aviso =
      courses + trilhas > 0
        ? ` ${formatCount(courses, 'curso', 'cursos')} e ${formatCount(trilhas, 'trilha', 'trilhas')} ficarão sem categoria (não serão excluídos).`
        : '';

    if (!window.confirm(`Excluir a categoria "${category.name}"?${aviso}`)) return;

    setBusy(true);
    setErrors([]);
    setNotice(null);

    try {
      await categoriesApi.remove(category.id);
      if (editingId === category.id) resetForm();
      setNotice('Categoria excluída com sucesso.');
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
              {editingId === null ? 'Nova categoria' : `Editando categoria #${editingId}`}
            </h2>

            <FormErrors messages={errors} />

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="category-name">
                  Nome
                </label>
                <input
                  id="category-name"
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Desenvolvimento Web"
                />
                <div className="form-text">Não pode repetir o nome de outra categoria.</div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="category-description">
                  Descrição
                </label>
                <textarea
                  id="category-description"
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Frontend, backend e tudo o que roda no navegador."
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
                  <th>Categoria</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center text-muted py-4">
                      Nenhuma categoria cadastrada.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        {category.name}
                        <div className="small text-muted">{category.description}</div>
                        <ul className="meta-list">
                          <li>#{category.id}</li>
                          <li>{formatCount(category._count.courses, 'curso', 'cursos')}</li>
                          <li>{formatCount(category._count.trilhas, 'trilha', 'trilhas')}</li>
                        </ul>
                      </td>
                      <td className="text-end text-nowrap">
                        <Link
                          href={`/categorias/${category.id}`}
                          className="btn btn-sm btn-outline-secondary me-2"
                        >
                          Ver
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => startEdit(category)}
                          disabled={busy}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(category)}
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
