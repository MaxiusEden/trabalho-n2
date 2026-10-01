'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toMessages } from '@/lib/api-client';
import { modulesApi, type CourseModule } from '@/lib/api';
import { formatCount } from '@/lib/format';
import { FormErrors } from '../FormErrors';
import { LessonRow } from './LessonRow';

/** Um módulo do curso (LAB03, Modulos): título e ordem, e as aulas dele. */
export function ModuleCard({ module }: { module: CourseModule }) {
  const router = useRouter();
  const [form, setForm] = useState({ title: module.title, order: String(module.order) });
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const id = `module-${module.id}`;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors([]);
    const order = Number(form.order);
    if (!Number.isInteger(order) || order < 1) {
      setErrors(['A ordem deve ser um número inteiro a partir de 1']);
      return;
    }
    setBusy(true);
    try {
      await modulesApi.update(module.id, { title: form.title, order });
      router.refresh();
    } catch (caught) {
      setErrors(toMessages(caught));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    const aviso =
      module.lessons.length > 0
        ? ` ${formatCount(module.lessons.length, 'aula será excluída', 'aulas serão excluídas')} junto.`
        : '';
    if (!window.confirm(`Excluir o módulo "${module.title}"?${aviso}`)) return;
    setBusy(true);
    setErrors([]);
    try {
      await modulesApi.remove(module.id);
      router.refresh();
    } catch (caught) {
      setErrors(toMessages(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="module-editor" aria-labelledby={`${id}-heading`}>
      <h3 id={`${id}-heading`} className="visually-hidden">
        Módulo {module.order}: {module.title}
      </h3>
      <form onSubmit={handleSubmit}>
        <FormErrors messages={errors} />
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-7">
            <label className="form-label small mb-1" htmlFor={`${id}-title`}>
              Módulo
            </label>
            <input
              id={`${id}-title`}
              type="text"
              className="form-control"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </div>
          <div className="col-4 col-md-2">
            <label className="form-label small mb-1" htmlFor={`${id}-order`}>
              Ordem
            </label>
            <input
              id={`${id}-order`}
              type="number"
              min={1}
              className="form-control"
              value={form.order}
              onChange={(event) => setForm({ ...form, order: event.target.value })}
            />
          </div>
          <div className="col-8 col-md-3 d-flex gap-2">
            <button type="submit" className="btn btn-outline-primary flex-grow-1" disabled={busy}>
              Salvar módulo
            </button>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleDelete}
              disabled={busy}
            >
              Excluir
            </button>
          </div>
        </div>
      </form>

      <div className="module-editor__lessons">
        {module.lessons.length === 0 && (
          <p className="small text-muted mb-2">Nenhuma aula neste módulo.</p>
        )}
        {module.lessons.map((lesson) => (
          <LessonRow key={lesson.id} moduleId={module.id} lesson={lesson} />
        ))}
        <LessonRow moduleId={module.id} />
      </div>
    </section>
  );
}
