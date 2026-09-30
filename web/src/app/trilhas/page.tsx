import Link from 'next/link';
import { trilhasApi } from '@/lib/api';
import { formatCount } from '@/lib/format';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

/** Porte de `Trilhas.tsx`. O total é a contagem real de cursos da trilha. */
export default async function TrilhasPage() {
  const trilhas = await trilhasApi.list();

  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Trilhas</h1>
        <p className="page-lead">Cursos agrupados por área. Abra uma trilha para ver os cursos dela.</p>
      </header>

      {trilhas.length === 0 ? (
        <EmptyState>
          Nenhuma trilha cadastrada ainda.{' '}
          <Link href="/admin/trilhas">Cadastrar a primeira trilha</Link>.
        </EmptyState>
      ) : (
        <div className="row g-4">
          {trilhas.map((trilha) => {
            const titleId = `trilha-title-${trilha.id}`;
            return (
              <div key={trilha.id} className="col-12 col-md-6">
                <Link
                  href={`/trilhas/${trilha.id}`}
                  className="card course-card h-100"
                  aria-labelledby={titleId}
                >
                  <div className="card-body d-flex flex-column">
                    <h2 id={titleId} className="course-card__title">
                      {trilha.title}
                    </h2>
                    <p className="course-card__description">{trilha.description}</p>
                    <div className="course-card__footer">
                      <span className="text-muted small">
                        {formatCount(trilha._count.courses, 'curso', 'cursos')}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
