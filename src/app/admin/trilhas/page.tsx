import { trilhasService } from '@/lib/trilhas/trilhas.service';
import { TrilhasManager } from '@/components/admin/TrilhasManager';

export const dynamic = 'force-dynamic';

export default async function AdminTrilhasPage() {
  const trilhas = await trilhasService.findAll();

  return (
    <div>
      <h1 className="admin-title">Trilhas</h1>
      <p className="text-muted mb-4">
        O total de cursos vem dos cursos vinculados à trilha — não é um campo editável.
      </p>

      <TrilhasManager trilhas={trilhas} />
    </div>
  );
}
