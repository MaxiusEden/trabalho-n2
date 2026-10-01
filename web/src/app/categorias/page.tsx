import Link from 'next/link';
import { categoriesApi } from '@/lib/api';
import { formatCount } from '@/lib/format';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

/** Categorias (LAB03, item A1): cada card leva aos cursos e trilhas dela. */
export default async function CategoriasPage() {
  const categories = await categoriesApi.list();

  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Categorias</h1>
        <p className="page-lead">Áreas do catálogo. Abra uma categoria para ver os cursos e as trilhas dela.</p>
      </header>

      {categories.length === 0 ? (
        <EmptyState>Nenhuma categoria cadastrada ainda.</EmptyState>
      ) : (
        <div className="row g-4">
          {categories.map((category) => {
            const titleId = `category-title-${category.id}`;
            return (
              <div key={category.id} className="col-12 col-md-6">
                <Link
                  href={`/categorias/${category.id}`}
                  className="card course-card h-100"
                  aria-labelledby={titleId}
                >
                  <div className="card-body d-flex flex-column">
                    <h2 id={titleId} className="course-card__title">
                      {category.name}
                    </h2>
                    <p className="course-card__description">{category.description}</p>
                    <div className="course-card__footer">
                      <span className="text-muted small">
                        {formatCount(category._count.courses, 'curso', 'cursos')}
                      </span>
                      <span className="text-muted small">
                        {formatCount(category._count.trilhas, 'trilha', 'trilhas')}
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
