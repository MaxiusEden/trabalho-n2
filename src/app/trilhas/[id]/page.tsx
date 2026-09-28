import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { trilhasService } from '@/lib/trilhas/trilhas.service';
import { NotFoundError } from '@/lib/http/errors';
import { CourseCard } from '@/components/CourseCard';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

/** Cursos que compõem uma trilha — destino do card da página de trilhas. */
export default async function TrilhaDetailsPage({ params }: PageProps<'/trilhas/[id]'>) {
  const { id } = await params;
  const trilhaId = Number(id);
  if (!Number.isInteger(trilhaId) || trilhaId < 1) notFound();

  const trilha = await trilhasService.findOne(trilhaId).catch((error) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

  const total = trilha._count.courses;

  return (
    <div className="container">
      <Link href="/trilhas" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Todas as trilhas
      </Link>

      <header className="page-header">
        <h1 className="page-title">{trilha.title}</h1>
        <p className="page-lead">{trilha.description}</p>
        <p className="page-meta">
          {total} {total === 1 ? 'curso' : 'cursos'}
        </p>
      </header>

      {trilha.courses.length === 0 ? (
        <EmptyState>
          Esta trilha ainda não tem cursos. Vincule cursos em{' '}
          <Link href="/admin/cursos">Administração → Cursos</Link>.
        </EmptyState>
      ) : (
        <div className="row g-4">
          {trilha.courses.map((course) => (
            <div key={course.id} className="col-12 col-md-6 col-lg-4">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
