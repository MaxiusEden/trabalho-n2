import { trilhasService } from '@/lib/trilhas/trilhas.service';
import { TrilhasManager } from '@/components/admin/TrilhasManager';

export const dynamic = 'force-dynamic';

export default async function AdminTrilhasPage() {
  const trilhas = await trilhasService.findAll();

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
