import { enrollmentsApi } from '@/lib/api';
import { handlePageError, requireToken } from '@/lib/server-session';
import { EnrollmentsManager } from '@/components/admin/EnrollmentsManager';

export const dynamic = 'force-dynamic';

export default async function AdminMatriculasPage({
  searchParams,
}: PageProps<'/admin/matriculas'>) {
  const { userId: userIdParam } = await searchParams;

  const parsed = Number(Array.isArray(userIdParam) ? userIdParam[0] : userIdParam);
  const filterUserId = Number.isInteger(parsed) && parsed > 0 ? parsed : null;

  // `GET /enrollments` é protegido: o servidor do Next repassa o token do cookie.
  const token = await requireToken();
  const enrollments = await enrollmentsApi
    .list(filterUserId === null ? {} : { userId: filterUserId }, token)
    .catch(handlePageError);

  return (
    <div>
      <h1 className="admin-title">Matrículas</h1>
      <p className="text-muted mb-4">
        Cada aluno se matricula pela página do curso. Aqui dá para consultar e cancelar.
      </p>

      <EnrollmentsManager enrollments={enrollments} filterUserId={filterUserId} />
    </div>
  );
}
