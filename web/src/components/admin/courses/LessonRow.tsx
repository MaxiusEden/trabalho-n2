'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toMessages } from '@/lib/api-client';
import { lessonsApi, type ContentType, type Lesson, type LessonInput } from '@/lib/api';
import { CONTENT_TYPES, formatContentType } from '@/lib/format';
import { FormErrors } from '../FormErrors';

const BLANK = { title: '', contentType: 'VIDEO' as ContentType, contentUrl: '', duration: '', order: '' };

function fromLesson(lesson: Lesson) {
  return {
    title: lesson.title,
    contentType: lesson.contentType,
    contentUrl: lesson.contentUrl ?? '',
    duration: String(lesson.duration),
    order: String(lesson.order),
  };
}

/**
 * Uma aula do módulo (LAB03, Aulas): título, tipo, URL, duração e ordem. Sem
 * `lesson`, é a linha de "nova aula". Cada linha salva sozinha na API, que
 * recalcula os totais do curso na mesma transação.
 */
export function LessonRow({ moduleId, lesson }: { moduleId: number; lesson?: Lesson }) {
  const router = useRouter();
  const [form, setForm] = useState(() => (lesson ? fromLesson(lesson) : BLANK));
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const id = lesson ? `lesson-${lesson.id}` : `new-lesson-${moduleId}`;

  // Retorno imediato para o óbvio; quem valida de verdade é o DTO do Nest.
  function buildInput(): LessonInput | null {
    const duration = Number(form.duration);
    if (!Number.isInteger(duration) || duration < 1) {
      setErrors(['A duração deve ser um número inteiro de minutos']);
      return null;
    }
    const order = form.order === '' ? undefined : Number(form.order);
    return {
      title: form.title,
      contentType: form.contentType,
      contentUrl: form.contentUrl.trim() === '' ? null : form.contentUrl.trim(),
      duration,
      order,
    };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors([]);
    const input = buildInput();
    if (!input) return;

    setBusy(true);
    try {
      if (lesson) {
        await lessonsApi.update(lesson.id, input);
      } else {
        await lessonsApi.create(moduleId, input);
        setForm(BLANK);
      }
      router.refresh();
    } catch (caught) {
      setErrors(toMessages(caught));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!lesson || !window.confirm(`Excluir a aula "${lesson.title}"?`)) return;
    setBusy(true);
    setErrors([]);
    try {
      await lessonsApi.remove(lesson.id);
      router.refresh();
    } catch (caught) {
      setErrors(toMessages(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="lesson-editor" onSubmit={handleSubmit} aria-label={lesson ? `Aula ${lesson.title}` : 'Nova aula'}>
      <FormErrors messages={errors} />
      <div className="row g-2 align-items-end">
        <div className="col-12 col-lg-4">
          <label className="form-label small mb-1" htmlFor={`${id}-title`}>
            {lesson ? 'Título' : 'Nova aula'}
          </label>
          <input
            id={`${id}-title`}
            type="text"
            className="form-control form-control-sm"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Introdução à Tecnologia"
          />
        </div>
        <div className="col-6 col-lg-2">
          <label className="form-label small mb-1" htmlFor={`${id}-type`}>
            Tipo
          </label>
          <select
            id={`${id}-type`}
            className="form-select form-select-sm"
            value={form.contentType}
            onChange={(event) =>
              setForm({ ...form, contentType: event.target.value as ContentType })
            }
          >
            {CONTENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {formatContentType(type)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-3 col-lg-1">
          <label className="form-label small mb-1" htmlFor={`${id}-duration`}>
            Min
          </label>
          <input
            id={`${id}-duration`}
            type="number"
            min={1}
            className="form-control form-control-sm"
            value={form.duration}
            onChange={(event) => setForm({ ...form, duration: event.target.value })}
          />
        </div>
        <div className="col-3 col-lg-1">
          <label className="form-label small mb-1" htmlFor={`${id}-order`}>
            Ordem
          </label>
          <input
            id={`${id}-order`}
            type="number"
            min={1}
            className="form-control form-control-sm"
            value={form.order}
            onChange={(event) => setForm({ ...form, order: event.target.value })}
            placeholder={lesson ? undefined : 'fim'}
          />
        </div>
        <div className="col-12 col-lg-4">
          <label className="form-label small mb-1" htmlFor={`${id}-url`}>
            URL do conteúdo
          </label>
          <div className="d-flex gap-2">
            <input
              id={`${id}-url`}
              type="url"
              className="form-control form-control-sm"
              value={form.contentUrl}
              onChange={(event) => setForm({ ...form, contentUrl: event.target.value })}
              placeholder="https://"
            />
            <button type="submit" className="btn btn-sm btn-primary" disabled={busy}>
              {lesson ? 'Salvar' : 'Adicionar'}
            </button>
            {lesson && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={handleDelete}
                disabled={busy}
                aria-label={`Excluir a aula ${lesson.title}`}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
