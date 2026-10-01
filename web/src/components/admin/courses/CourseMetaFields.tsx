'use client';

import type { CourseLevel } from '@/lib/api';
import { COURSE_LEVELS, formatLevel } from '@/lib/format';

export type Option = { id: number; label: string };

export type CourseMeta = {
  categoryId: string;
  level: CourseLevel;
  instructorId: string;
  /** `YYYY-MM-DD` do `<input type="date">`; vazio = a API usa a data de agora. */
  publishedAt: string;
};

/** Categoria, nível, instrutor e data de publicação do curso (LAB03, Cursos). */
export function CourseMetaFields({
  value,
  onChange,
  categories,
  instructors,
}: {
  value: CourseMeta;
  onChange: (value: CourseMeta) => void;
  categories: Option[];
  instructors: Option[];
}) {
  return (
    <>
      <div className="row">
        <div className="col-6 mb-3">
          <label className="form-label" htmlFor="course-category">
            Categoria
          </label>
          <select
            id="course-category"
            className="form-select"
            value={value.categoryId}
            onChange={(event) => onChange({ ...value, categoryId: event.target.value })}
          >
            <option value="">Sem categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-6 mb-3">
          <label className="form-label" htmlFor="course-level">
            Nível
          </label>
          <select
            id="course-level"
            className="form-select"
            value={value.level}
            onChange={(event) => onChange({ ...value, level: event.target.value as CourseLevel })}
          >
            {COURSE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {formatLevel(level)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        <div className="col-6 mb-3">
          <label className="form-label" htmlFor="course-instructor">
            Instrutor
          </label>
          <select
            id="course-instructor"
            className="form-select"
            value={value.instructorId}
            onChange={(event) => onChange({ ...value, instructorId: event.target.value })}
          >
            <option value="">Sem instrutor</option>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-6 mb-3">
          <label className="form-label" htmlFor="course-published">
            Publicação
          </label>
          <input
            id="course-published"
            type="date"
            className="form-control"
            value={value.publishedAt}
            onChange={(event) => onChange({ ...value, publishedAt: event.target.value })}
          />
        </div>
      </div>
    </>
  );
}
