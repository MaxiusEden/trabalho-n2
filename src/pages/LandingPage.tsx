import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { cursoService } from '../services/cursoService';
import { getLoggedUser } from '../services/api';
import type { Curso, Trilha } from '../model';

export const LandingPage = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const user = getLoggedUser();

  useEffect(() => {
    cursoService.getCursos().then(setCursos).catch(console.error);
    cursoService.getTrilhas().then(setTrilhas).catch(console.error);
  }, []);

  const destaques = cursos.slice(0, 3);

  return (
    <div>
      {/* ==================== HERO ==================== */}
      <section className="bg-dark text-white py-5">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1 className="display-3 fw-bold mb-3">
                Transforme sua carreira com a <span className="text-primary">Perero Cursos</span>
              </h1>
              <p className="lead mb-4 text-secondary">
                Acesse mais de {cursos.length} cursos de tecnologia com os melhores instrutores do mercado. 
                Aprenda no seu ritmo, de qualquer lugar.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/cursos" className="btn btn-primary btn-lg px-4">
                  Ver Cursos <ChevronRight size={20} />
                </Link>
                {!user && (
                  <Link to="/register" className="btn btn-outline-light btn-lg px-4">
                    Criar Conta Grátis
                  </Link>
                )}
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block text-center">
              <BookOpen size={200} className="text-primary opacity-25" />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STATS ==================== */}
      <section className="py-4 bg-primary text-white">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3 col-6 py-2">
              <h3 className="fw-bold mb-0">{cursos.length}+</h3>
              <small>Cursos Disponíveis</small>
            </div>
            <div className="col-md-3 col-6 py-2">
              <h3 className="fw-bold mb-0">{trilhas.length}</h3>
              <small>Trilhas de Carreira</small>
            </div>
            <div className="col-md-3 col-6 py-2">
              <h3 className="fw-bold mb-0">500+</h3>
              <small>Alunos Ativos</small>
            </div>
            <div className="col-md-3 col-6 py-2">
              <h3 className="fw-bold mb-0">98%</h3>
              <small>Satisfação</small>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CURSOS EM DESTAQUE ==================== */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold">Cursos em Destaque</h2>
            <p className="text-muted">Comece sua jornada com nossos cursos mais populares</p>
          </div>
          <div className="row g-4">
            {destaques.length === 0 ? (
              <div className="col-12">
                <div className="alert alert-info text-center mb-0">
                  Nenhum curso cadastrado ainda.
                </div>
              </div>
            ) : null}

            {destaques.map(curso => (
              <div key={curso.id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm border-0">
                  <img src={curso.imagem || 'https://placehold.co/600x400/212529/FFF?text=Curso'} className="card-img-top" alt={curso.titulo} />
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-primary">{curso.nivel}</span>
                      <small className="text-muted">{curso.totalHoras}h de conteúdo</small>
                    </div>
                    <h5 className="card-title">{curso.titulo}</h5>
                    <p className="card-text text-muted small flex-grow-1">{curso.descricao}</p>
                    <Link to={`/curso/${curso.id}`} className="btn btn-outline-primary w-100 mt-2">
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/cursos" className="btn btn-primary btn-lg">
              Ver Todos os Cursos <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== TRILHAS ==================== */}
      <section className="py-5 bg-body-tertiary">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold">Trilhas de Carreira</h2>
            <p className="text-muted">Siga um caminho estruturado e domine uma área completa</p>
          </div>
          <div className="row g-4">
            {trilhas.length === 0 ? (
              <div className="col-12">
                <div className="alert alert-info text-center mb-0">
                  Nenhuma trilha cadastrada ainda.
                </div>
              </div>
            ) : null}

            {trilhas.map(trilha => (
              <div key={trilha.id} className="col-md-4">
                <div className="card h-100 border-0 shadow-sm text-center p-4">
                  <div className="card-body">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                      <TrendingUp size={32} className="text-primary" />
                    </div>
                    <h5 className="card-title">{trilha.titulo}</h5>
                    <p className="card-text text-muted">{trilha.descricao}</p>
                    <Link to={`/trilha/${trilha.id}`} className="btn btn-outline-primary">
                      Ver Trilha
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== POR QUE ESCOLHER ==================== */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold">Por que escolher a Perero Cursos?</h2>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                  <Award size={32} className="text-success" />
                </div>
                <h5>Certificado Reconhecido</h5>
                <p className="text-muted">Receba um certificado com código de verificação único ao concluir cada curso.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                  <Users size={32} className="text-warning" />
                </div>
                <h5>Comunidade Ativa</h5>
                <p className="text-muted">Faça parte de uma comunidade de mais de 500 alunos e compartilhe conhecimento.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                  <Star size={32} className="text-info" />
                </div>
                <h5>Conteúdo Atualizado</h5>
                <p className="text-muted">Cursos sempre atualizados com as tecnologias mais recentes do mercado.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== DEPOIMENTOS ==================== */}
      <section className="py-5 bg-body-tertiary">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold">O que nossos alunos dizem</h2>
          </div>
          <div className="row g-4">
            {[
              { nome: 'Maria Silva', texto: 'A trilha de Frontend mudou minha carreira! Consegui meu primeiro emprego como desenvolvedora em 3 meses.', estrelas: 5 },
              { nome: 'Carlos Santos', texto: 'Os cursos de Data Science são incríveis. O conteúdo é prático e direto ao ponto.', estrelas: 5 },
              { nome: 'Ana Costa', texto: 'A plataforma é muito intuitiva e os certificados são um diferencial no currículo.', estrelas: 4 },
            ].map((depoimento, idx) => (
              <div key={idx} className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="mb-2">
                      {[...Array(depoimento.estrelas)].map((_, i) => (
                        <Star key={i} size={16} className="text-warning" fill="currentColor" />
                      ))}
                    </div>
                    <p className="card-text fst-italic">"{depoimento.texto}"</p>
                    <p className="fw-bold mb-0">— {depoimento.nome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="py-5 bg-dark text-white text-center">
        <div className="container py-4">
          <h2 className="display-6 fw-bold mb-3">Pronto para começar?</h2>
          <p className="lead text-secondary mb-4">Assine agora e tenha acesso a todos os cursos da plataforma.</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/checkout" className="btn btn-primary btn-lg px-5">
              Ver Planos
            </Link>
            <Link to="/cursos" className="btn btn-outline-light btn-lg px-5">
              Explorar Cursos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
