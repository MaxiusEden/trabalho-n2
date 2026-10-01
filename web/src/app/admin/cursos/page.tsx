import { coursesApi, trilhasApi } from '@/lib/api';
import { handlePageError, requireAdminToken } from '@/lib/server-session';
import { AccessDenied } from '@/components/admin/AccessDenied';
import { CoursesManager } from '@/components/admin/CoursesManager';

export const dynamic = 'force-dynamic';

export default async function AdminCursosPage() {
  // Só ADMIN: a leitura é pública, mas criar, editar e excluir exigem o perfil.
  if (!(await requireAdminToken())) return <AccessDenied />;
  const [courses, trilhas] = await Promise.all([coursesApi.list(), trilhasApi.list()]).catch(
    handlePageError,
  );

  return (
    <div>
      <h1 className="admin-title">Cursos</h1>
      <p className="text-muted mb-4">Cadastre cursos com preço, trilha e a lista de aulas.</p>

      <CoursesManager
        courses={courses}
        trilhas={trilhas.map((trilha) => ({ id: trilha.id, title: trilha.title }))}
      />
    </div>
  );
}
