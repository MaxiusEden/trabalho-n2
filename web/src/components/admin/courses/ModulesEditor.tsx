'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toMessages } from '@/lib/api-client';
import { modulesApi, type Course } from '@/lib/api';
import { formatHours } from '@/lib/format';
import { FormErrors } from '../FormErrors';
import { ModuleCard } from './ModuleCard';

/**
 * Módulos e aulas do curso em edição. Os totais (TotalAulas e TotalHoras) são
 * só leitura: a API recalcula e grava ao salvar cada módulo ou aula, e a tela
 * mostra o valor gravado depois do `router.refresh()`.
 */
export function ModulesEditor({ course }: { course: Course }) {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', order: '' });
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors([]);
    setBusy(true);
    try {
      await modulesApi.create(course.id, {
        title: form.title,
        order: form.order === '' ? undefined : Number(form.order),
      });
      setForm({ title: '', order: '' });
      router.refresh();
    } catch (caught) {
      setErrors(toMessages(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="h5 card-title mb-1">Módulos e aulas de &ldquo;{course.title}&rdquo;</h2>
        <p className="small text-muted mb-3">
          Cada módulo e cada aula é salvo sozinho. Os totais abaixo são calculados pela API ao
          salvar.
        </p>

        <dl className="course-totals">
          <div>
            <dt>Total de aulas</dt>
            <dd data-testid="total-lessons">{course.totalLessons}</dd>
          </div>
          <div>
            <dt>Total de horas</dt>
            <dd data-testid="total-hours">{formatHours(course.totalHours)}</dd>
          </div>
        </dl>

        {course.modules.length === 0 && (
          <p className="text-muted">Este curso ainda não tem módulos.</p>
        )}
        {course.modules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}

        <form className="module-editor module-editor--new" onSubmit={handleSubmit}>
          <FormErrors messages={errors} />
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-7">
              <label className="form-label small mb-1" htmlFor="new-module-title">
                Novo módulo
              </label>
              <input
                id="new-module-title"
                type="text"
                className="form-control"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Fundamentos"
              />
            </div>
            <div className="col-4 col-md-2">
              <label className="form-label small mb-1" htmlFor="new-module-order">
                Ordem
              </label>
              <input
                id="new-module-order"
                type="number"
                min={1}
                className="form-control"
                value={form.order}
                onChange={(event) => setForm({ ...form, order: event.target.value })}
                placeholder="fim"
              />
            </div>
            <div className="col-8 col-md-3">
              <button type="submit" className="btn btn-primary w-100" disabled={busy}>
                Adicionar módulo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
