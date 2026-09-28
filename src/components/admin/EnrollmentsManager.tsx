'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch, toMessages } from '@/lib/api-client';
import { formatDate, formatPrice } from '@/lib/format';
import { FormErrors } from './FormErrors';

export type AdminEnrollment = {
  id: number;
  createdAt: Date | string;
  user: { id: number; name: string | null; email: string };
  course: { id: number; title: string; priceCents: number };
};

export type UserOption = { id: number; name: string | null; email: string };
export type CourseOption = { id: number; title: string };

export function EnrollmentsManager({
  enrollments,
  users,
  courses,
  filterUserId,
}: {
  enrollments: AdminEnrollment[];
  users: UserOption[];
  courses: CourseOption[];
  filterUserId: number | null;
}) {
  const router = useRouter();

  const [userId, setUserId] = useState(filterUserId === null ? '' : String(filterUserId));
  const [courseId, setCourseId] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors([]);
    setNotice(null);

    if (userId === '' || courseId === '') {
      setErrors(['Selecione um usuário e um curso']);
      return;
    }

    setBusy(true);
    try {
      await apiFetch('/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({ userId: Number(userId), courseId: Number(courseId) }),
      });
      setNotice('Matrícula criada com sucesso.');
      setCourseId('');
      router.refresh();
    } catch (caught) {
      setErrors(toMessages(caught));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(enrollment: AdminEnrollment) {
    if (
      !window.confirm(
        `Cancelar a matrícula de "${enrollment.user.email}" em "${enrollment.course.title}"?`,
      )
    )
      return;

    setBusy(true);
    setErrors([]);
    setNotice(null);

    try {
      await apiFetch(`/api/enrollments/${enrollment.id}`, { method: 'DELETE' });
      setNotice('Matrícula cancelada com sucesso.');
      router.refresh();
    } catch (caught) {
      setErrors(toMessages(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="row g-4">
      <div className="col-12 col-xl-4">
        <div className="card">
          <div className="card-body">
            <h2 className="h5 card-title mb-3">Nova matrícula</h2>

            <FormErrors messages={errors} />

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="enrollment-user">
                  Usuário
                </label>
                <select
                  id="enrollment-user"
                  className="form-select"
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                >
                  <option value="">Selecione...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name ?? user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="enrollment-course">
                  Curso
                </label>
                <select
                  id="enrollment-course"
                  className="form-select"
                  value={courseId}
                  onChange={(event) => setCourseId(event.target.value)}
                >
                  <option value="">Selecione...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={busy}>
                Matricular
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-8">
        {notice && <div className="alert alert-success">{notice}</div>}

        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover table-stack align-middle mb-0">
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center text-muted py-4">
                      Nenhuma matrícula registrada.
                    </td>
                  </tr>
                ) : (
                  enrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>
                        {enrollment.user.name ?? enrollment.user.email} em{' '}
                        <span className="fw-semibold">{enrollment.course.title}</span>
                        <div className="small text-muted text-break">{enrollment.user.email}</div>
                        <ul className="meta-list">
                          <li>#{enrollment.id}</li>
                          <li>{formatPrice(enrollment.course.priceCents)}</li>
                          <li>{formatDate(enrollment.createdAt)}</li>
                        </ul>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(enrollment)}
                          disabled={busy}
                        >
                          Cancelar
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
