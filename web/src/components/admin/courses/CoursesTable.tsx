import Link from 'next/link';
import type { Course } from '@/lib/api';
import { formatCount, formatPrice } from '@/lib/format';

/** Tabela de cursos do admin. Abaixo de 576px cada linha empilha (`table-stack`). */
export function CoursesTable({
  courses,
  busy,
  onEdit,
  onDelete,
}: {
  courses: Course[];
  busy: boolean;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}) {
  return (
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
                    <ul className="meta-list">
                      <li>#{course.id}</li>
                      <li>{course.trilha ? course.trilha.title : 'Sem trilha'}</li>
                      <li>{formatCount(course.lessons.length, 'aula', 'aulas')}</li>
                      <li>{formatCount(course._count.enrollments, 'matrícula', 'matrículas')}</li>
                      <li className="d-sm-none">{formatPrice(course.priceCents)}</li>
                    </ul>
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
                      onClick={() => onEdit(course)}
                      disabled={busy}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDelete(course)}
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
  );
}
