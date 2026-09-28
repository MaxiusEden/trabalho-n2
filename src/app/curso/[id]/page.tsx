import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Award, Clock, PlayCircle } from 'lucide-react';
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

  return (
    <div className="container pb-5">
      <div className="mb-4">
        <Link href="/" className="text-decoration-none d-inline-flex align-items-center gap-2">
          <ArrowLeft size={20} />
          Voltar para os cursos
        </Link>
      </div>

      <div className="row mb-5">
        <div className="col-lg-8">
          {/* eslint-disable-next-line @next/next/no-img-element -- a capa é uma URL livre cadastrada pelo admin */}
          <img
            src={course.image}
            alt={course.title}
            className="rounded mb-4 course-cover w-100"
          />

          <h1 className="display-5 text-black">{course.title}</h1>
          {course.trilha && (
            <p className="mb-2">
              Parte da{' '}
              <Link href={`/trilhas/${course.trilha.id}`}>{course.trilha.title}</Link>
            </p>
          )}
          <p className="lead">{course.description}</p>

          <h4 className="mt-5 mb-3">Conteúdo Programático</h4>
          {course.lessons.length === 0 ? (
            <p className="text-muted">Este curso ainda não tem aulas cadastradas.</p>
          ) : (
            <ul className="list-group list-group-flush mb-4">
              {course.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {lesson.title}
                  <span className="badge bg-secondary rounded-pill">
                    {formatDuration(lesson.duration)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm sticky-top" style={{ top: '2rem' }}>
            <div className="card-body">
              <h3 className="card-title fw-bold text-success mb-3">
                {formatPrice(course.priceCents)}
              </h3>

              <EnrollButton courseId={course.id} />

              <hr />

              <ul className="list-unstyled mb-0">
                <li className="mb-3 d-flex align-items-center gap-2 text-muted">
                  <Clock size={20} />
                  <span>Acesso Vitalício</span>
                </li>
                <li className="mb-3 d-flex align-items-center gap-2 text-muted">
                  <Award size={20} />
                  <span>Certificado de Conclusão</span>
                </li>
                <li className="d-flex align-items-center gap-2 text-muted">
                  <PlayCircle size={20} />
                  <span>
                    {course.lessons.length} aulas · {formatDuration(totalMinutes)} de conteúdo
                  </span>
                </li>
              </ul>

              <hr />
              <p className="small text-muted mb-0">
                {course._count.enrollments} aluno(s) matriculado(s)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
