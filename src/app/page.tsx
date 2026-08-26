import Link from 'next/link';
import { coursesService } from '@/lib/courses/courses.service';
import { formatPrice } from '@/lib/format';

export const dynamic = 'force-dynamic';

/** Home — porte de `Home.tsx`, agora lendo os cursos do banco via Prisma. */
export default async function HomePage() {
  const courses = await coursesService.findAll();

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-5 text-black">Cursos Disponíveis</h1>
          <p className="lead text-muted">Aprenda as tecnologias mais demandadas no mercado.</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="alert alert-info">
          Nenhum curso cadastrado ainda.{' '}
          <Link href="/admin/cursos">Cadastre o primeiro curso</Link>.
        </div>
      ) : (
        <div className="row g-4">
          {courses.map((course) => (
            <div key={course.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element -- a capa é uma URL livre cadastrada pelo admin */}
                <img
                  src={course.image}
                  className="card-img-top course-cover"
                  alt={course.title}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{course.title}</h5>
                  {course.trilha && (
                    <span className="badge bg-primary-subtle text-primary-emphasis align-self-start mb-2">
                      {course.trilha.title}
                    </span>
                  )}
                  <p className="card-text">{course.description}</p>
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <span className="fw-bold fs-5 text-success">
                      {formatPrice(course.priceCents)}
                    </span>
                    <Link href={`/curso/${course.id}`} className="btn btn-primary">
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
