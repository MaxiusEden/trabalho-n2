'use client';

import { useState } from 'react';
import { toMessages } from '@/lib/api-client';
import type { Course, CourseInput } from '@/lib/api';
import { parsePriceToCents } from '@/lib/format';
import { FormErrors } from '../FormErrors';
import { LessonsFields } from './LessonsFields';
import { newLessonKey, type LessonField } from './lesson-field';
import { CourseMetaFields, type CourseMeta, type Option } from './CourseMetaFields';

export type TrilhaOption = { id: number; title: string };

function initialForm(course: Course | null) {
  return {
    title: course?.title ?? '',
    description: course?.description ?? '',
    image: course?.image ?? '',
    price: course ? (course.priceCents / 100).toFixed(2) : '',
    trilhaId: course?.trilhaId == null ? '' : String(course.trilhaId),
  };
}

/** ISO → `YYYY-MM-DD` no fuso local (o que o `<input type="date">` mostra). */
function toDateInput(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function initialMeta(course: Course | null): CourseMeta {
  return {
    categoryId: course?.categoryId == null ? '' : String(course.categoryId),
    level: course?.level ?? 'INICIANTE',
    instructorId: course?.instructorId == null ? '' : String(course.instructorId),
    publishedAt: course ? toDateInput(course.publishedAt) : '',
  };
}

const toId = (value: string) => (value === '' ? null : Number(value));

function initialLessons(course: Course | null): LessonField[] {
  return (course?.lessons ?? []).map((lesson) => ({
    key: newLessonKey(),
    title: lesson.title,
    duration: String(lesson.duration),
  }));
}

/**
 * Formulário de criar ou editar curso. O estado nasce do `course` recebido;
 * quem usa troca a `key` para recomeçar o formulário.
 */
export function CourseForm({
  course,
  trilhas,
  categories,
  instructors,
  onSave,
  onCancel,
}: {
  course: Course | null;
  trilhas: TrilhaOption[];
  categories: Option[];
  instructors: Option[];
  onSave: (input: CourseInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(() => initialForm(course));
  const [meta, setMeta] = useState(() => initialMeta(course));
  const [lessons, setLessons] = useState(() => initialLessons(course));
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  /**
   * Monta o corpo da requisição. As checagens de formato feitas aqui existem só
   * para dar retorno imediato; quem decide o que é válido continua sendo o
   * DTO do Nest, que roda de novo em cima do mesmo payload.
   */
  function buildInput(): CourseInput | null {
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
      trilhaId: toId(form.trilhaId),
      categoryId: toId(meta.categoryId),
      instructorId: toId(meta.instructorId),
      level: meta.level,
      // Meio-dia local: a data não muda de dia ao virar UTC.
      publishedAt:
        meta.publishedAt === '' ? undefined : new Date(`${meta.publishedAt}T12:00:00`).toISOString(),
      lessons: parsedLessons,
    };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors([]);

    const input = buildInput();
    if (!input) return;

    setBusy(true);
    try {
      await onSave(input);
    } catch (caught) {
      setErrors(toMessages(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="h5 card-title mb-3">
          {course === null ? 'Novo curso' : `Editando curso #${course.id}`}
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

          <CourseMetaFields
            value={meta}
            onChange={setMeta}
            categories={categories}
            instructors={instructors}
          />

          <LessonsFields lessons={lessons} onChange={setLessons} />

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary flex-grow-1" disabled={busy}>
              {course === null ? 'Criar' : 'Salvar'}
            </button>
            {course !== null && (
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
