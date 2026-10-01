import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Award, Clock, Users } from 'lucide-react';
import { coursesApi } from '@/lib/api';
import { handlePageError } from '@/lib/server-session';
import {
  formatContentType,
  formatCount,
  formatDay,
  formatDuration,
  formatHours,
  formatLevel,
  formatPrice,
} from '@/lib/format';
import { EnrollButton } from '@/components/EnrollButton';

export const dynamic = 'force-dynamic';

/** Detalhe do curso: `GET /courses/:id` do Nest (público). */
export default async function CourseDetailsPage({ params }: PageProps<'/curso/[id]'>) {
  const { id } = await params;
  const courseId = Number(id);
  if (!Number.isInteger(courseId) || courseId < 1) notFound();

  const course = await coursesApi.get(courseId).catch(handlePageError);

  // Os totais vêm gravados pela API (TotalAulas, TotalHoras); a página não recalcula.
  // Os minutos só servem de base para a barra de cada aula.
  const totalMinutes = Number(course.totalHours) * 60;

  return (
    <div className="container">
      <Link href="/" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Todos os cursos
      </Link>

      <div className="row g-4 g-lg-5">
        <div className="col-lg-8">
          <header>
            <h1 className="page-title">{course.title}</h1>
            {course.trilha && (
              <p className="page-meta mt-0 mb-3">
                Parte da <Link href={`/trilhas/${course.trilha.id}`}>{course.trilha.title}</Link>
              </p>
            )}
            <p className="page-lead">{course.description}</p>
            <ul className="meta-list mt-2">
              <li>{formatLevel(course.level)}</li>
              {course.category && (
                <li>
                  <Link href={`/categorias/${course.category.id}`}>{course.category.name}</Link>
                </li>
              )}
              {course.instructor && (
                <li>Instrutor: {course.instructor.name ?? course.instructor.email}</li>
              )}
              <li>Publicado em {formatDay(course.publishedAt)}</li>
            </ul>
          </header>

          <h2 className="section-title">Conteúdo programático</h2>
          <ul className="meta-list">
            <li>{formatCount(course.modules.length, 'módulo', 'módulos')}</li>
            <li>{formatCount(course.totalLessons, 'aula', 'aulas')}</li>
            <li>{formatHours(course.totalHours)} no total</li>
          </ul>

          {course.modules.length === 0 ? (
            <p className="text-muted mt-3">Este curso ainda não tem aulas cadastradas.</p>
          ) : (
            course.modules.map((module, m) => (
              <section
                key={module.id}
                className="module-block"
                aria-labelledby={`modulo-${module.id}`}
              >
                <h3 id={`modulo-${module.id}`} className="module-block__title">
                  Módulo {m + 1}: {module.title}
                </h3>
                {module.lessons.length === 0 ? (
                  <p className="text-muted small mb-0">Este módulo ainda não tem aulas.</p>
                ) : (
                  <ol className="lesson-list">
                    {module.lessons.map((lesson, index) => (
                      <li key={lesson.id}>
                        <span className="lesson-list__index">{index + 1}</span>
                        <span>
                          {lesson.title}
                          <span className="lesson-list__type">{formatContentType(lesson.contentType)}</span>
                        </span>
                        <span className="lesson-list__duration">{formatDuration(lesson.duration)}</span>
                        {/* Complemento visual da duração escrita ao lado: parte da aula no total do curso. */}
                        <span className="lesson-list__bar" aria-hidden="true">
                          <span
                            style={{
                              width: `${totalMinutes > 0 ? Math.min(100, (lesson.duration / totalMinutes) * 100) : 0}%`,
                            }}
                          />
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            ))
          )}
        </div>

        <div className="col-lg-4">
          <aside className="card purchase-card sticky-lg-top" aria-label="Matrícula">
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
                  {formatCount(course._count.enrollments, 'aluno matriculado', 'alunos matriculados')}
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
