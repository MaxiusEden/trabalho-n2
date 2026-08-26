import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { trilhasService } from '@/lib/trilhas/trilhas.service';
import { NotFoundError } from '@/lib/http/errors';
import { formatPrice } from '@/lib/format';

export const dynamic = 'force-dynamic';

/** Cursos que compõem uma trilha — destino do botão "Explorar Trilha". */
export default async function TrilhaDetailsPage({ params }: PageProps<'/trilhas/[id]'>) {
  const { id } = await params;
  const trilhaId = Number(id);
  if (!Number.isInteger(trilhaId) || trilhaId < 1) notFound();

  const trilha = await trilhasService.findOne(trilhaId).catch((error) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

  return (
    <div className="container pb-5">
      <div className="mb-4">
        <Link
          href="/trilhas"
          className="text-decoration-none d-inline-flex align-items-center gap-2"
        >
          <ArrowLeft size={20} />
          Voltar para as trilhas
        </Link>
      </div>

      <h1 className="display-5 text-black">{trilha.title}</h1>
      <p className="lead text-muted">{trilha.description}</p>
      <p className="fw-bold">Módulos: {trilha._count.courses}</p>

      {trilha.courses.length === 0 ? (
        <div className="alert alert-info mt-4">
          Esta trilha ainda não tem cursos vinculados. Vincule cursos em{' '}
          <Link href="/admin/cursos">Administração → Cursos</Link>.
        </div>
      ) : (
        <div className="row g-4 mt-1">
          {trilha.courses.map((course) => (
            <div key={course.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element -- a capa é uma URL livre cadastrada pelo admin */}
                <img src={course.image} className="card-img-top course-cover" alt={course.title} />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{course.title}</h5>
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
