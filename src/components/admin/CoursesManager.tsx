'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { apiFetch, toMessages } from '@/lib/api-client';
import { formatPrice, parsePriceToCents } from '@/lib/format';
import { FormErrors } from './FormErrors';

export type AdminCourse = {
  id: number;
  title: string;
  description: string;
  image: string;
  priceCents: number;
  trilhaId: number | null;
  trilha: { id: number; title: string } | null;
  lessons: { id: number; title: string; duration: number; order: number }[];
  _count: { enrollments: number };
};

export type TrilhaOption = { id: number; title: string };

/** `key` identifica a linha do formulário; não vai para a API. */
type LessonField = { key: string; title: string; duration: string };

let lessonKeySeq = 0;
const newLessonKey = () => `aula-${++lessonKeySeq}`;

const EMPTY_FORM = {
  title: '',
  description: '',
  image: '',
  price: '',
  trilhaId: '',
};

export function CoursesManager({
  courses,
  trilhas,
}: {
  courses: AdminCourse[];
  trilhas: TrilhaOption[];
}) {
  const router = useRouter();

  const [form, setForm] = useState(EMPTY_FORM);
  const [lessons, setLessons] = useState<LessonField[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function resetForm() {
    setForm(EMPTY_FORM);
    setLessons([]);
    setEditingId(null);
    setErrors([]);
  }

  function startEdit(course: AdminCourse) {
    setEditingId(course.id);
    setForm({
      title: course.title,
      description: course.description,
      image: course.image,
      price: (course.priceCents / 100).toFixed(2),
      trilhaId: course.trilhaId === null ? '' : String(course.trilhaId),
    });
    setLessons(
      course.lessons.map((lesson) => ({
        key: newLessonKey(),
        title: lesson.title,
        duration: String(lesson.duration),
      })),
    );
    setErrors([]);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateLesson(index: number, patch: Partial<LessonField>) {
    setLessons(lessons.map((lesson, i) => (i === index ? { ...lesson, ...patch } : lesson)));
  }

  /**
   * Monta o corpo da requisição. As checagens de formato feitas aqui existem só
   * para dar retorno imediato — quem decide o que é válido continua sendo o
   * DTO no servidor, que roda de novo em cima do mesmo payload.
   */
  function buildPayload(): Record<string, unknown> | null {
    const priceCents = parsePriceToCents(form.price);
    if (priceCents === null) {
      setErrors(['Preço deve ser um valor como 97,00']);
      return null;
    }

    const parsedLessons = [];
    for (const [index, lesson] of lessons.entries()) {
      const duration = Number(lesson.duration);
      if (!Number.isInteger(duration) || duration < 1) {
        setErrors([`A duração da aula ${index + 1} deve ser um número inteiro de minutos`]);
        return null;
      }
      parsedLessons.push({ title: lesson.title, duration });
    }

    return {
      title: form.title,
      description: form.description,
      image: form.image,
      priceCents,
      trilhaId: form.trilhaId === '' ? null : Number(form.trilhaId),
      lessons: parsedLessons,
    };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors([]);
    setNotice(null);

    const payload = buildPayload();
    if (!payload) return;

    setBusy(true);
    try {
      if (editingId === null) {
        await apiFetch('/api/courses', { method: 'POST', body: JSON.stringify(payload) });
        setNotice('Curso criado com sucesso.');
      } else {
        await apiFetch(`/api/courses/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setNotice('Curso atualizado com sucesso.');
      }

      resetForm();
      router.refresh();
    } catch (caught) {
      setErrors(toMessages(caught));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(course: AdminCourse) {
    if (
      !window.confirm(
        `Excluir o curso "${course.title}"? As aulas e as ${course._count.enrollments} matrícula(s) dele também serão removidas.`,
      )
    )
      return;

    setBusy(true);
    setErrors([]);
    setNotice(null);

    try {
      await apiFetch(`/api/courses/${course.id}`, { method: 'DELETE' });
      if (editingId === course.id) resetForm();
      setNotice('Curso excluído com sucesso.');
      router.refresh();
    } catch (caught) {
      setErrors(toMessages(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="row g-4">
      <div className="col-12 col-xl-5">
        <div className="card">
          <div className="card-body">
            <h2 className="h5 card-title mb-3">
              {editingId === null ? 'Novo curso' : `Editando curso #${editingId}`}
            </h2>

            <FormErrors messages={errors} />

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="course-title">
                  Título
                </label>
                <input
                  id="course-title"
                  type="text"
                  className="form-control"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="React para Iniciantes"
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="course-description">
                  Descrição
                </label>
                <textarea
                  id="course-description"
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Aprenda os fundamentos do React, hooks e muito mais."
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="course-image">
                  URL da capa
                </label>
                <input
                  id="course-image"
                  type="text"
                  className="form-control"
                  value={form.image}
                  onChange={(event) => setForm({ ...form, image: event.target.value })}
                  placeholder="/covers/react.svg"
                />
              </div>

              <div className="row">
                <div className="col-6 mb-3">
                  <label className="form-label" htmlFor="course-price">
                    Preço (R$)
                  </label>
                  <input
                    id="course-price"
                    type="text"
                    inputMode="decimal"
                    className="form-control"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                    placeholder="97,00"
                  />
                </div>

                <div className="col-6 mb-3">
                  <label className="form-label" htmlFor="course-trilha">
                    Trilha
                  </label>
                  <select
                    id="course-trilha"
                    className="form-select"
                    value={form.trilhaId}
                    onChange={(event) => setForm({ ...form, trilhaId: event.target.value })}
                  >
                    <option value="">Sem trilha</option>
                    {trilhas.map((trilha) => (
                      <option key={trilha.id} value={trilha.id}>
                        {trilha.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3" role="group" aria-labelledby="course-lessons-label">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span id="course-lessons-label" className="form-label mb-0">
                    Conteúdo programático
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                    onClick={() =>
                      setLessons([...lessons, { key: newLessonKey(), title: '', duration: '' }])
                    }
                  >
                    <Plus size={16} aria-hidden="true" />
                    Aula
                  </button>
                </div>

                {lessons.length === 0 && (
                  <p className="small text-muted mb-0">Nenhuma aula adicionada.</p>
                )}

                {lessons.map((lesson, index) => (
                  <div key={lesson.key} className="input-group mb-2">
                    <span className="input-group-text">{index + 1}</span>
                    <input
                      type="text"
                      className="form-control"
                      value={lesson.title}
                      onChange={(event) => updateLesson(index, { title: event.target.value })}
                      placeholder="Introdução à Tecnologia"
                      aria-label={`Título da aula ${index + 1}`}
                    />
                    <input
                      type="number"
                      min={1}
                      className="form-control"
                      style={{ maxWidth: '6rem' }}
                      value={lesson.duration}
                      onChange={(event) => updateLesson(index, { duration: event.target.value })}
                      placeholder="min"
                      aria-label={`Duração da aula ${index + 1} em minutos`}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => setLessons(lessons.filter((_, i) => i !== index))}
                      aria-label={`Remover aula ${index + 1}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                ))}
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

      <div className="col-12 col-xl-7">
        {notice && <div className="alert alert-success">{notice}</div>}

        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover table-stack align-middle mb-0">
              <thead>
                <tr>
                  <th>Curso</th>
                  <th className="d-none d-sm-table-cell">Preço</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-muted py-4">
                      Nenhum curso cadastrado.
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id}>
                      <td>
                        {course.title}
                        <div className="small text-muted">
                          #{course.id} · {course.trilha ? course.trilha.title : 'Sem trilha'} ·{' '}
                          {course.lessons.length} aula(s) · {course._count.enrollments} matrícula(s)
                          <span className="d-sm-none"> · {formatPrice(course.priceCents)}</span>
                        </div>
                      </td>
                      <td className="price d-none d-sm-table-cell">{formatPrice(course.priceCents)}</td>
                      <td className="text-end text-nowrap">
                        <Link
                          href={`/curso/${course.id}`}
                          className="btn btn-sm btn-outline-secondary me-2"
                        >
                          Ver
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => startEdit(course)}
                          disabled={busy}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(course)}
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
