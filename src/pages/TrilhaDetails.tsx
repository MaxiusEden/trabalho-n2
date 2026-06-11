import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpenCheck } from 'lucide-react';
import { cursoService } from '../services/cursoService';
import type { Curso, Trilha, TrilhaCurso } from '../model';

export const TrilhaDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [trilha, setTrilha] = useState<Trilha | null>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [trilhaCursos, setTrilhaCursos] = useState<TrilhaCurso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const [trilhaData, cursosData, vinculosData] = await Promise.all([
          cursoService.getTrilhaById(id),
          cursoService.getCursos(),
          cursoService.getTrilhaCursosByTrilhaId(id),
        ]);

        setTrilha(trilhaData);
        setCursos(cursosData);
        setTrilhaCursos(vinculosData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const cursosDaTrilha = useMemo(() => {
    return trilhaCursos
      .map(vinculo => ({
        vinculo,
        curso: cursos.find(curso => String(curso.id) === String(vinculo.idCurso)),
      }))
      .filter((item): item is { vinculo: TrilhaCurso; curso: Curso } => Boolean(item.curso));
  }, [cursos, trilhaCursos]);

  if (loading) return <div className="container py-5">Carregando trilha...</div>;

  if (!trilha) {
    return (
      <div className="container py-5">
        <Link to="/trilhas" className="text-decoration-none d-inline-flex align-items-center gap-2 mb-4">
          <ArrowLeft size={20} />
          Voltar para trilhas
        </Link>
        <div className="alert alert-warning">Trilha não encontrada.</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Link to="/trilhas" className="text-decoration-none d-inline-flex align-items-center gap-2 mb-4">
        <ArrowLeft size={20} />
        Voltar para trilhas
      </Link>

      <div className="row mb-4">
        <div className="col-lg-9">
          <h1 className="display-5 fw-bold">{trilha.titulo}</h1>
          <p className="lead text-muted">{trilha.descricao}</p>
        </div>
      </div>

      <div className="row g-4">
        {cursosDaTrilha.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info">Nenhum curso vinculado a esta trilha ainda.</div>
          </div>
        ) : null}

        {cursosDaTrilha.map(({ curso, vinculo }) => (
          <div key={vinculo.id} className="col-12 col-md-6 col-xl-4">
            <div className="card h-100 shadow-sm">
              <img
                src={curso.imagem || 'https://placehold.co/600x400/212529/FFF?text=Curso'}
                className="card-img-top"
                alt={curso.titulo}
              />
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center gap-2 text-primary mb-2">
                  <BookOpenCheck size={18} />
                  <span className="fw-semibold">Etapa {vinculo.ordem}</span>
                </div>
                <h5 className="card-title">{curso.titulo}</h5>
                <p className="card-text text-muted">{curso.descricao}</p>
                <div className="mt-auto d-flex justify-content-between align-items-center gap-2">
                  <span className="badge bg-secondary">{curso.nivel}</span>
                  <Link to={`/curso/${curso.id}`} className="btn btn-primary">
                    Ver Curso
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
