import { trilhasApi } from '@/lib/api';
import { handlePageError, requireAdminToken } from '@/lib/server-session';
import { AccessDenied } from '@/components/admin/AccessDenied';
import { TrilhasManager } from '@/components/admin/TrilhasManager';

export const dynamic = 'force-dynamic';

export default async function AdminTrilhasPage() {
  // Só ADMIN: a leitura é pública, mas criar, editar e excluir exigem o perfil.
  if (!(await requireAdminToken())) return <AccessDenied />;
  const trilhas = await trilhasApi.list().catch(handlePageError);

  return (
    <div>
      <h1 className="admin-title">Trilhas</h1>
      <p className="text-muted mb-4">
        Crie trilhas para agrupar cursos. Para colocar um curso numa trilha, edite o curso.
      </p>

      <TrilhasManager trilhas={trilhas} />
    </div>
  );
}
