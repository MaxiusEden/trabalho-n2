'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toMessages } from '@/lib/api-client';
import { enrollmentsApi } from '@/lib/api';
import { useSession } from '@/lib/session';

/**
 * Botão "Matricular-se". Cria (e cancela) o registro de `Enrollment`,
 * que é a ponta da relação User ↔ Course. O Nest tira o usuário do token.
 */
export function EnrollButton({ courseId }: { courseId: number }) {
  const { user } = useSession();

  if (!user) {
    return (
      <>
        <Link href="/login" className="btn btn-primary w-100 mb-2">
          Matricular-se
        </Link>
        <p className="small text-muted mb-3">Entre com sua conta para se matricular.</p>
      </>
    );
  }

  // A `key` reinicia o estado da consulta quando outro usuário entra.
  return <EnrollmentControl key={user.id} userId={user.id} courseId={courseId} />;
}

function EnrollmentControl({ userId, courseId }: { userId: number; courseId: number }) {
  const router = useRouter();

  const [enrollmentId, setEnrollmentId] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    enrollmentsApi
      .list({ userId, courseId })
      .then((enrollments) => {
        if (active) setEnrollmentId(enrollments[0]?.id ?? null);
      })
      .catch(() => {
        // Falha ao consultar não impede tentar se matricular: o índice único
        // do banco continua sendo quem barra a duplicata.
      })
      .finally(() => {
        if (active) setChecked(true);
      });

    return () => {
      active = false;
    };
  }, [userId, courseId]);

  async function enroll() {
    setBusy(true);
    setError(null);
    try {
      const enrollment = await enrollmentsApi.create(courseId);
      setEnrollmentId(enrollment.id);
      router.refresh();
    } catch (caught) {
      setError(toMessages(caught).join(' '));
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (enrollmentId === null) return;
    setBusy(true);
    setError(null);
    try {
      await enrollmentsApi.remove(enrollmentId);
      setEnrollmentId(null);
      router.refresh();
    } catch (caught) {
      setError(toMessages(caught).join(' '));
    } finally {
      setBusy(false);
    }
  }

  if (!checked) {
    return (
      <button className="btn btn-primary w-100 mb-3" disabled>
        Carregando...
      </button>
    );
  }

  return (
    <>
      {enrollmentId === null ? (
        <button className="btn btn-primary w-100 mb-3" onClick={enroll} disabled={busy}>
          {busy ? 'Matriculando...' : 'Matricular-se'}
        </button>
      ) : (
        <>
          <div className="alert alert-success py-2">Você está matriculado neste curso.</div>
          <button className="btn btn-outline-danger w-100 mb-3" onClick={cancel} disabled={busy}>
            {busy ? 'Cancelando...' : 'Cancelar matrícula'}
          </button>
        </>
      )}

      {error && <div className="alert alert-danger py-2">{error}</div>}
    </>
  );
}
