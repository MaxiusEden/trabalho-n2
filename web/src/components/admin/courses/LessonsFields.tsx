'use client';

import { Plus, Trash2 } from 'lucide-react';
import { newLessonKey, type LessonField } from './lesson-field';

/** Conteúdo programático do curso: uma linha por aula, na ordem em que aparecem. */
export function LessonsFields({
  lessons,
  onChange,
}: {
  lessons: LessonField[];
  onChange: (lessons: LessonField[]) => void;
}) {
  function updateLesson(index: number, patch: Partial<LessonField>) {
    onChange(lessons.map((lesson, i) => (i === index ? { ...lesson, ...patch } : lesson)));
  }

  return (
    <div className="mb-3" role="group" aria-labelledby="course-lessons-label">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span id="course-lessons-label" className="form-label mb-0">
          Conteúdo programático
        </span>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
          onClick={() => onChange([...lessons, { key: newLessonKey(), title: '', duration: '' }])}
        >
          <Plus size={16} aria-hidden="true" />
          Aula
        </button>
      </div>

      {lessons.length === 0 && <p className="small text-muted mb-0">Nenhuma aula adicionada.</p>}

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
            onClick={() => onChange(lessons.filter((_, i) => i !== index))}
            aria-label={`Remover aula ${index + 1}`}
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
