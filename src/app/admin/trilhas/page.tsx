import { trilhasService } from '@/lib/trilhas/trilhas.service';
import { TrilhasManager } from '@/components/admin/TrilhasManager';

export const dynamic = 'force-dynamic';

export default async function AdminTrilhasPage() {
  const trilhas = await trilhasService.findAll();

  return (
    <div className="container-fluid">
      <h1 className="h3 text-black mb-1">Trilhas</h1>
      <p className="text-muted">
        O número de módulos é a contagem de cursos vinculados — não é um campo editável.
      </p>

      <TrilhasManager trilhas={trilhas} />
    </div>
  );
}
