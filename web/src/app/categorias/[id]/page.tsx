import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { categoriesApi } from '@/lib/api';
import { handlePageError } from '@/lib/server-session';
import { formatCount } from '@/lib/format';
import { CourseCard } from '@/components/CourseCard';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

/** Cursos e trilhas de uma categoria (`GET /categories/:id`, público). */
export default async function CategoriaDetailsPage({ params }: PageProps<'/categorias/[id]'>) {
  const { id } = await params;
  const categoryId = Number(id);
  if (!Number.isInteger(categoryId) || categoryId < 1) notFound();

  const category = await categoriesApi.get(categoryId).catch(handlePageError);

  return (
    <div className="container">
      <Link href="/categorias" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Todas as categorias
      </Link>

      <header className="page-header">
        <h1 className="page-title">{category.name}</h1>
        <p className="page-lead">{category.description}</p>
        <ul className="meta-list">
          <li>{formatCount(category._count.courses, 'curso', 'cursos')}</li>
          <li>{formatCount(category._count.trilhas, 'trilha', 'trilhas')}</li>
        </ul>
      </header>

      <h2 className="section-title">Cursos</h2>
      {category.courses.length === 0 ? (
        <EmptyState>Nenhum curso nesta categoria.</EmptyState>
      ) : (
        <div className="row g-4 mb-5">
          {category.courses.map((course) => (
            <div key={course.id} className="col-12 col-md-6 col-lg-4">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">Trilhas</h2>
      {category.trilhas.length === 0 ? (
        <EmptyState>Nenhuma trilha nesta categoria.</EmptyState>
      ) : (
        <ul className="category-trilhas">
          {category.trilhas.map((trilha) => (
            <li key={trilha.id}>
              <Link href={`/trilhas/${trilha.id}`}>{trilha.title}</Link>
              <span className="text-muted small">
                {formatCount(trilha._count.courses, 'curso', 'cursos')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
