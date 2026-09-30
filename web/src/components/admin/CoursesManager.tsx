'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toMessages } from '@/lib/api-client';
import { coursesApi, type Course, type CourseInput } from '@/lib/api';
import { formatCount } from '@/lib/format';
import { FormErrors } from './FormErrors';
import { CourseForm, type TrilhaOption } from './courses/CourseForm';
import { CoursesTable } from './courses/CoursesTable';

/** CRUD de cursos: junta o formulário (criar/editar) e a tabela. */
export function CoursesManager({
  courses,
  trilhas,
}: {
  courses: Course[];
  trilhas: TrilhaOption[];
}) {
  const router = useRouter();

  const [editing, setEditing] = useState<Course | null>(null);
  // Trocar a `key` recomeça o formulário (depois de salvar, cancelar ou ao editar outro curso).
  const [formKey, setFormKey] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function openForm(course: Course | null) {
    setEditing(course);
    setFormKey((key) => key + 1);
  }

  function startEdit(course: Course) {
    openForm(course);
    setErrors([]);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave(input: CourseInput) {
    setNotice(null);
    if (editing === null) {
      await coursesApi.create(input);
      setNotice('Curso criado com sucesso.');
    } else {
      await coursesApi.update(editing.id, input);
      setNotice('Curso atualizado com sucesso.');
    }
    openForm(null);
    router.refresh();
  }

  async function handleDelete(course: Course) {
    if (
      !window.confirm(
        `Excluir o curso "${course.title}"? As aulas dele e ${formatCount(course._count.enrollments, 'matrícula', 'matrículas')} também serão removidas.`,
      )
    )
      return;

    setBusy(true);
    setErrors([]);
    setNotice(null);

    try {
      await coursesApi.remove(course.id);
      if (editing?.id === course.id) openForm(null);
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
        <CourseForm
          key={formKey}
          course={editing}
          trilhas={trilhas}
          onSave={handleSave}
          onCancel={() => openForm(null)}
        />
      </div>

      <div className="col-12 col-xl-7">
        <FormErrors messages={errors} />
        {notice && <div className="alert alert-success">{notice}</div>}

        <CoursesTable courses={courses} busy={busy} onEdit={startEdit} onDelete={handleDelete} />
      </div>
    </div>
  );
}
