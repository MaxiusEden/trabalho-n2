import Link from 'next/link';
import { trilhasService } from '@/lib/trilhas/trilhas.service';

export const dynamic = 'force-dynamic';

/** Porte de `Trilhas.tsx`. "Módulos" é a contagem real de cursos da trilha. */
export default async function TrilhasPage() {
  const trilhas = await trilhasService.findAll();

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-5 text-black">Trilhas de Aprendizado</h1>
          <p className="lead text-muted">
            Siga um percurso estruturado para atingir seus objetivos.
          </p>
        </div>
      </div>

      {trilhas.length === 0 ? (
        <div className="alert alert-info">
          Nenhuma trilha cadastrada ainda.{' '}
          <Link href="/admin/trilhas">Cadastre a primeira trilha</Link>.
        </div>
      ) : (
        <div className="row g-4">
          {trilhas.map((trilha) => (
            <div key={trilha.id} className="col-12 col-md-6">
              <div className="card h-100 shadow-sm border-primary">
                <div className="card-body d-flex flex-column">
                  <h4 className="card-title text-primary">{trilha.title}</h4>
                  <p className="card-text">{trilha.description}</p>
                  <p className="fw-bold">Módulos: {trilha._count.courses}</p>
                  <Link
                    href={`/trilhas/${trilha.id}`}
                    className="btn btn-outline-primary w-100 mt-auto"
                  >
                    Explorar Trilha
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
