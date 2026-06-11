import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cursoService } from '../services/cursoService';
import type { Trilha } from '../model';

export const Trilhas = () => {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);

  useEffect(() => {
    cursoService.getTrilhas().then(setTrilhas).catch(console.error);
  }, []);

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-5 fw-bold">Trilhas de Aprendizado</h1>
          <p className="lead text-muted">Siga um percurso estruturado para atingir seus objetivos.</p>
        </div>
      </div>

      <div className="row g-4">
        {trilhas.length === 0 ? <p>Nenhuma trilha encontrada.</p> : null}
        {trilhas.map(trilha => (
          <div key={trilha.id} className="col-12 col-md-6">
            <div className="card h-100 shadow-sm border-primary">
              <div className="card-body">
                <h4 className="card-title text-primary">{trilha.titulo}</h4>
                <p className="card-text">{trilha.descricao}</p>
                <Link to={`/trilha/${trilha.id}`} className="btn btn-outline-primary w-100">
                  Explorar Trilha
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
