import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { trilhasService } from '@/lib/trilhas/trilhas.service';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

/** Porte de `Trilhas.tsx`. O total é a contagem real de cursos da trilha. */
export default async function TrilhasPage() {
  const trilhas = await trilhasService.findAll();

  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Trilhas</h1>
        <p className="page-lead">Cursos agrupados em uma sequência, do primeiro ao último.</p>
      </header>

      {trilhas.length === 0 ? (
        <EmptyState>
          Nenhuma trilha cadastrada ainda.{' '}
          <Link href="/admin/trilhas">Cadastrar a primeira trilha</Link>.
        </EmptyState>
      ) : (
        <div className="row g-4">
          {trilhas.map((trilha) => (
            <div key={trilha.id} className="col-12 col-md-6">
              <article className="card course-card h-100">
                <div className="card-body d-flex flex-column">
                  <h2 className="course-card__title">
                    <Link href={`/trilhas/${trilha.id}`} className="stretched-link">
                      {trilha.title}
                    </Link>
                  </h2>
                  <p className="course-card__description">{trilha.description}</p>
                  <div className="course-card__footer">
                    <span className="text-muted small">
                      {trilha._count.courses} {trilha._count.courses === 1 ? 'curso' : 'cursos'}
                    </span>
                    <span className="course-card__cta" aria-hidden="true">
                      Ver trilha
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
