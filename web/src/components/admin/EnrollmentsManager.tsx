'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toMessages } from '@/lib/api-client';
import { enrollmentsApi, type Enrollment as AdminEnrollment } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/format';
import { FormErrors } from './FormErrors';

/**
 * Lista e cancelamento de matrículas. Não há formulário para matricular outra
 * pessoa: no Nest a matrícula é sempre do dono do token (`POST /enrollments`).
 */
export function EnrollmentsManager({
  enrollments,
  filterUserId,
}: {
  enrollments: AdminEnrollment[];
  filterUserId: number | null;
}) {
  const router = useRouter();

  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      await enrollmentsApi.remove(enrollment.id);
      setNotice('Matrícula cancelada com sucesso.');
      router.refresh();
    } catch (caught) {
      setErrors(toMessages(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {filterUserId !== null && (
        <p className="small text-muted">
          Mostrando só as matrículas do usuário #{filterUserId}.{' '}
          <Link href="/admin/matriculas">Ver todas</Link>
        </p>
      )}

      <FormErrors messages={errors} />
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
    </>
  );
}
