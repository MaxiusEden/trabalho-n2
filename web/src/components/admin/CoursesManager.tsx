'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toMessages } from '@/lib/api-client';
import { coursesApi, type Course, type CourseInput } from '@/lib/api';
import { formatCount } from '@/lib/format';
import { FormErrors } from './FormErrors';
import { CourseForm, type TrilhaOption } from './courses/CourseForm';
import type { Option } from './courses/CourseMetaFields';
import { CoursesTable } from './courses/CoursesTable';
import { ModulesEditor } from './courses/ModulesEditor';

/**
 * CRUD de cursos: o formulário (criar/editar), a tabela e, para o curso em
 * edição, o editor de módulos e aulas.
 */
export function CoursesManager({
  courses,
  trilhas,
  categories,
  instructors,
}: {
  courses: Course[];
  trilhas: TrilhaOption[];
  categories: Option[];
  instructors: Option[];
}) {
  const router = useRouter();

  // Guarda só o id: o curso em si vem da lista, que o `router.refresh()` atualiza
  // depois de cada escrita (inclusive os totais recalculados pela API).
  const [editingId, setEditingId] = useState<number | null>(null);
  const editing = courses.find((course) => course.id === editingId) ?? null;
  // Trocar a `key` recomeça o formulário (ao cancelar ou ao editar outro curso).
  const [formKey, setFormKey] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function openForm(courseId: number | null) {
    setEditingId(courseId);
    setFormKey((key) => key + 1);
  }

  function startEdit(course: Course) {
    openForm(course.id);
    setErrors([]);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave(input: CourseInput) {
    setNotice(null);
    if (editing === null) {
      // O curso novo já abre em edição, para receber módulos e aulas.
      const created = await coursesApi.create(input);
      openForm(created.id);
      setNotice('Curso criado. Agora cadastre os módulos e as aulas abaixo.');
    } else {
      await coursesApi.update(editing.id, input);
      setNotice('Curso atualizado com sucesso.');
    }
    router.refresh();
  }

  async function handleDelete(course: Course) {
    if (
      !window.confirm(
        `Excluir o curso "${course.title}"? Os módulos, as aulas e ${formatCount(course._count.enrollments, 'matrícula', 'matrículas')} também serão removidas.`,
      )
    )
      return;

    setBusy(true);
    setErrors([]);
    setNotice(null);

    try {
      await coursesApi.remove(course.id);
      if (editingId === course.id) openForm(null);
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
          // Muda quando o curso recém-criado chega na lista, para o formulário nascer dele.
          key={`${formKey}-${editing?.id ?? 'novo'}`}
          course={editing}
          trilhas={trilhas}
          categories={categories}
          instructors={instructors}
          onSave={handleSave}
          onCancel={() => openForm(null)}
        />
      </div>

      <div className="col-12 col-xl-7">
        <FormErrors messages={errors} />
        {notice && <div className="alert alert-success">{notice}</div>}

        <CoursesTable courses={courses} busy={busy} onEdit={startEdit} onDelete={handleDelete} />
      </div>

      {editing && (
        <div className="col-12">
          <ModulesEditor course={editing} />
        </div>
      )}
    </div>
  );
}
