import { trilhasApi } from '@/lib/api';
import { handlePageError, requireToken } from '@/lib/server-session';
import { TrilhasManager } from '@/components/admin/TrilhasManager';

export const dynamic = 'force-dynamic';

export default async function AdminTrilhasPage() {
  // A leitura é pública, mas criar, editar e excluir exigem login.
  await requireToken();
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
