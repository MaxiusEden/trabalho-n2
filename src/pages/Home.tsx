import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cursoService } from '../services/cursoService';
import type { Curso } from '../model';

export function Cursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);

  useEffect(() => {
    cursoService.getCursos().then(setCursos).catch(console.error);
  }, []);

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-5 fw-bold">Cursos Disponíveis</h1>
          <p className="lead text-muted">Aprenda as tecnologias mais demandadas no mercado.</p>
        </div>
      </div>

      <div className="row g-4">
        {cursos.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info">
              Nenhum curso cadastrado ainda. Crie uma categoria e um curso na área administrativa.
            </div>
          </div>
        ) : null}

        {cursos.map(course => (
          <div key={course.id} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm">
              <img src={course.imagem || 'https://placehold.co/600x400/212529/FFF?text=Curso'} className="card-img-top" alt={course.titulo} />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{course.titulo}</h5>
                <p className="card-text text-truncate">{course.descricao}</p>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <span className="badge bg-primary">Assinatura</span>
                  <Link to={`/curso/${course.id}`} className="btn btn-primary">
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
