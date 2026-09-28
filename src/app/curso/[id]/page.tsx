import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Award, Clock, Users } from 'lucide-react';
import { coursesService } from '@/lib/courses/courses.service';
import { NotFoundError } from '@/lib/http/errors';
import { formatDuration, formatPrice } from '@/lib/format';
import { EnrollButton } from '@/components/EnrollButton';

export const dynamic = 'force-dynamic';

/** Detalhe do curso — porte de `CourseDetails.tsx`, com dados reais do banco. */
export default async function CourseDetailsPage({ params }: PageProps<'/curso/[id]'>) {
  const { id } = await params;
  const courseId = Number(id);
  if (!Number.isInteger(courseId) || courseId < 1) notFound();

  const course = await coursesService.findOne(courseId).catch((error) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

  const totalMinutes = course.lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
  const enrolled = course._count.enrollments;

  return (
    <div className="container">
      <Link href="/" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Todos os cursos
      </Link>

      <div className="row g-4 g-lg-5">
        <div className="col-lg-8">
          <header>
            {course.trilha && (
              <p className="mb-2">
                <Link href={`/trilhas/${course.trilha.id}`} className="tag text-decoration-none">
                  {course.trilha.title}
                </Link>
              </p>
            )}
            <h1 className="page-title">{course.title}</h1>
            <p className="page-lead">{course.description}</p>
          </header>

          <h2 className="section-title">Conteúdo programático</h2>
          <p className="text-muted small mb-0">
            {course.lessons.length} {course.lessons.length === 1 ? 'aula' : 'aulas'} ·{' '}
            {formatDuration(totalMinutes)} no total
          </p>

          {course.lessons.length === 0 ? (
            <p className="text-muted mt-3">Este curso ainda não tem aulas cadastradas.</p>
          ) : (
            <ol className="lesson-list">
              {course.lessons.map((lesson, index) => (
                <li key={lesson.id}>
                  <span className="lesson-list__index">{index + 1}</span>
                  <span>{lesson.title}</span>
                  <span className="lesson-list__duration">{formatDuration(lesson.duration)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="col-lg-4">
          <aside className="card purchase-card sticky-lg-top" aria-label="Matrícula">
            {/* eslint-disable-next-line @next/next/no-img-element -- a capa é uma URL livre cadastrada pelo admin */}
            <img src={course.image} alt="" className="card-img-top course-cover" />
            <div className="card-body">
              <p className="price price--large mb-3">{formatPrice(course.priceCents)}</p>

              <EnrollButton courseId={course.id} />

              <ul className="fact-list">
                <li>
                  <Clock size={16} aria-hidden="true" />
                  Acesso vitalício
                </li>
                <li>
                  <Award size={16} aria-hidden="true" />
                  Certificado de conclusão
                </li>
                <li>
                  <Users size={16} aria-hidden="true" />
                  {enrolled} {enrolled === 1 ? 'aluno matriculado' : 'alunos matriculados'}
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
