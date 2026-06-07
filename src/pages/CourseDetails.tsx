import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Award, PlayCircle, CheckCircle, FileText } from 'lucide-react';
import { cursoService } from '../services/cursoService';
import { usuarioService } from '../services/usuarioService';
import { getLoggedUser, checkAssinaturaAtiva } from '../services/api';
import type { Curso, Modulo, Aula, ProgressoAula, Matricula, Certificado } from '../model';

export function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<Record<string, Aula[]>>({});
  const [isMatriculado, setIsMatriculado] = useState(false);
  const [temAssinatura, setTemAssinatura] = useState(false);
  const [progressos, setProgressos] = useState<ProgressoAula[]>([]);
  const [matricula, setMatricula] = useState<Matricula | null>(null);
  const [certificado, setCertificado] = useState<Certificado | null>(null);
  const [aulaSelecionada, setAulaSelecionada] = useState<Aula | null>(null);
  const [finalizando, setFinalizando] = useState(false);
  const navigate = useNavigate();

  const todasAulas = useMemo(
    () => modulos.flatMap(m => aulas[m.id] ?? []),
    [modulos, aulas]
  );

  const aulasConcluidas = useMemo(() => {
    const idsCurso = new Set(todasAulas.map(a => a.id));
    return progressos
      .filter(p => p.status === 'Concluído' && idsCurso.has(p.idAula))
      .map(p => p.idAula);
  }, [progressos, todasAulas]);

  const progressoPercentual = useMemo(() => {
    if (todasAulas.length === 0) return 0;
    return Math.round((aulasConcluidas.length / todasAulas.length) * 100);
  }, [todasAulas, aulasConcluidas]);

  const cursoConcluido = matricula?.dataConclusao !== null && matricula?.dataConclusao !== undefined;
  const todasAulasConcluidas =
    todasAulas.length > 0 && todasAulas.every(a => aulasConcluidas.includes(a.id));

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const c = await cursoService.getCursoById(id);
        setCurso(c);

        const m = await cursoService.getModulosByCursoId(id);
        setModulos(m);

        const aulasData: Record<string, Aula[]> = {};
        for (const modulo of m) {
          aulasData[modulo.id] = await cursoService.getAulasByModuloId(modulo.id);
        }
        setAulas(aulasData);

        const user = getLoggedUser();
        if (user) {
          const mat = await usuarioService.getMatriculaByUsuarioAndCurso(user.id, id);
          setMatricula(mat ?? null);
          setIsMatriculado(!!mat);

          const prog = await usuarioService.getProgressoByUsuarioId(user.id);
          setProgressos(prog);

          const certs = await usuarioService.getCertificadosByUsuarioId(user.id);
          setCertificado(certs.find(c => c.idCurso === id) ?? null);

          const assinaturaAtiva = await checkAssinaturaAtiva(user.id);
          setTemAssinatura(assinaturaAtiva);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [id]);

  const handleMatricular = async () => {
    const user = getLoggedUser();
    if (!user) {
      alert('Você precisa estar logado para se matricular.');
      navigate('/login');
      return;
    }

    const matriculaExistente = await usuarioService.getMatriculaByUsuarioAndCurso(user.id, id!);
    if (matriculaExistente) {
      setMatricula(matriculaExistente);
      setIsMatriculado(true);
      if (matriculaExistente.dataConclusao) {
        alert('Você já concluiu este curso.');
      } else {
        alert('Você já está matriculado neste curso.');
      }
      return;
    }

    const assinaturaAtiva = await checkAssinaturaAtiva(user.id);
    if (!assinaturaAtiva) {
      alert('Você precisa ter uma assinatura ativa para se matricular. Assine um plano primeiro.');
      navigate('/checkout');
      return;
    }

    try {
      const novaMatricula = await usuarioService.createMatricula({
        idUsuario: user.id,
        idCurso: id!,
        dataMatricula: new Date().toISOString(),
        dataConclusao: null,
      });
      setMatricula(novaMatricula);
      setIsMatriculado(true);
      alert('Matrícula realizada com sucesso!');
    } catch (err) {
      console.error(err);
      const mensagem = err instanceof Error ? err.message : 'Erro ao realizar matrícula.';
      alert(mensagem);
    }
  };

  const handleMarcarAulaConcluida = async (aula: Aula) => {
    const user = getLoggedUser();
    if (!user || !isMatriculado) return;

    if (aulasConcluidas.includes(aula.id)) return;

    try {
      const novoProgresso = await usuarioService.updateProgresso({
        idUsuario: user.id,
        idAula: aula.id,
        dataConclusao: new Date().toISOString(),
        status: 'Concluído',
      });
      setProgressos(prev => [...prev, novoProgresso]);
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar progresso.');
    }
  };

  const handleFinalizarCurso = async () => {
    const user = getLoggedUser();
    if (!user || !matricula || !todasAulasConcluidas) return;

    setFinalizando(true);
    try {
      const matriculaAtualizada = await usuarioService.updateMatricula(matricula.id, {
        dataConclusao: new Date().toISOString(),
      });
      setMatricula(matriculaAtualizada);

      if (!certificado) {
        const cert = await usuarioService.createCertificado({
          idUsuario: user.id,
          idCurso: id!,
          idTrilha: null,
          codigoVerificacao: `CERT-${Date.now().toString(36).toUpperCase()}`,
          dataEmissao: new Date().toISOString(),
        });
        setCertificado(cert);
        alert(`Parabéns! Curso concluído. Certificado emitido: ${cert.codigoVerificacao}`);
      } else {
        alert('Parabéns! Curso concluído com sucesso.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao finalizar o curso.');
    } finally {
      setFinalizando(false);
    }
  };

  const renderMaterialAula = (aula: Aula) => (
    <div className="p-4 bg-body-secondary rounded border">
      <FileText size={24} className="text-primary mb-3" />
      <h5 className="mb-3">{aula.titulo}</h5>
      <div className="text-body" style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
        {aula.urlConteudo ||
          `Leia atentamente o conteúdo desta aula sobre ${aula.titulo} e marque como concluída ao terminar.`}
      </div>
    </div>
  );

  if (!curso) return <div className="container py-5">Carregando...</div>;

  return (
    <div className="container pb-5 py-4">
      <div className="mb-4">
        <Link to="/cursos" className="text-decoration-none d-inline-flex align-items-center gap-2">
          <ArrowLeft size={20} />
          Voltar para os cursos
        </Link>
      </div>

      <div className="row mb-5">
        <div className="col-lg-8">
          {aulaSelecionada && isMatriculado ? (
            <div className="mb-4">
              <h4 className="mb-3">{aulaSelecionada.titulo}</h4>
              {renderMaterialAula(aulaSelecionada)}
              <div className="d-flex gap-2 mt-3 flex-wrap">
                {!aulasConcluidas.includes(aulaSelecionada.id) ? (
                  <button
                    className="btn btn-success"
                    onClick={() => handleMarcarAulaConcluida(aulaSelecionada)}
                  >
                    Marcar como concluída
                  </button>
                ) : (
                  <span className="badge bg-success fs-6 d-flex align-items-center gap-1">
                    <CheckCircle size={16} /> Aula concluída
                  </span>
                )}
                <button className="btn btn-outline-secondary" onClick={() => setAulaSelecionada(null)}>
                  Fechar material
                </button>
              </div>
            </div>
          ) : (
            <div className="ratio ratio-16x9 bg-dark rounded mb-4 d-flex align-items-center justify-content-center text-white">
              <div className="text-center p-5">
                <PlayCircle size={64} className="mb-3 text-secondary mx-auto d-block" />
                <h3>{curso.titulo}</h3>
                <p className="text-muted mb-0">
                  {isMatriculado
                    ? 'Selecione uma aula abaixo para acessar o material.'
                    : 'Matricule-se para acessar o conteúdo.'}
                </p>
              </div>
            </div>
          )}

          <h1 className="display-5 fw-bold">{curso.titulo}</h1>
          <p className="lead">{curso.descricao}</p>

          {isMatriculado && (
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-1">
                <small className="text-muted">Progresso do curso</small>
                <small className="fw-bold">{progressoPercentual}%</small>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${progressoPercentual}%` }}
                />
              </div>
              {cursoConcluido && certificado && (
                <div className="alert alert-success mt-3 mb-0">
                  <Award size={18} className="me-1" />
                  Curso concluído! Certificado: <strong>{certificado.codigoVerificacao}</strong>
                </div>
              )}
            </div>
          )}

          <h4 className="mt-4 mb-3">Conteúdo Programático</h4>

          <div className="accordion" id="accordionModulos">
            {modulos.length === 0 ? <p>Nenhum módulo cadastrado ainda.</p> : null}
            {modulos.map(modulo => (
              <div className="accordion-item" key={modulo.id}>
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${modulo.id}`}
                  >
                    <strong>Módulo {modulo.ordem}: {modulo.titulo}</strong>
                  </button>
                </h2>
                <div
                  id={`collapse${modulo.id}`}
                  className="accordion-collapse collapse"
                  data-bs-parent="#accordionModulos"
                >
                  <div className="accordion-body p-0">
                    <ul className="list-group list-group-flush">
                      {aulas[modulo.id]?.length > 0 ? (
                        aulas[modulo.id].map(aula => {
                          const concluida = aulasConcluidas.includes(aula.id);
                          return (
                            <li
                              key={aula.id}
                              className="list-group-item d-flex justify-content-between align-items-center p-3"
                            >
                              <div className="d-flex align-items-center gap-2">
                                {concluida ? (
                                  <CheckCircle size={16} className="text-success" />
                                ) : (
                                  <PlayCircle size={16} className="text-primary" />
                                )}
                                <span>
                                  Aula {aula.ordem}: {aula.titulo}
                                  <small className="text-muted ms-2">({aula.tipoConteudo})</small>
                                </span>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-secondary rounded-pill">
                                  {aula.duracaoMinutos} min
                                </span>
                                {isMatriculado && (
                                  <button
                                    className={`btn btn-sm ${concluida ? 'btn-success' : 'btn-outline-primary'}`}
                                    onClick={() => setAulaSelecionada(aula)}
                                  >
                                    {concluida ? 'Revisar' : 'Acessar'}
                                  </button>
                                )}
                              </div>
                            </li>
                          );
                        })
                      ) : (
                        <li className="list-group-item text-muted p-3">Nenhuma aula neste módulo.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm sticky-top" style={{ top: '2rem' }}>
            <div className="card-body">
              <h5 className="card-title fw-bold text-primary mb-3">Acesso via Assinatura</h5>

              {cursoConcluido ? (
                <div className="alert alert-info text-center mb-3">
                  Curso concluído. Você pode revisar o conteúdo a qualquer momento.
                </div>
              ) : isMatriculado ? (
                <div className="alert alert-success text-center mb-3">
                  Você está matriculado neste curso.
                </div>
              ) : temAssinatura ? (
                <button className="btn btn-primary btn-lg w-100 mb-3" onClick={handleMatricular}>
                  Matricular-se Agora
                </button>
              ) : (
                <div>
                  <p className="text-muted text-center">Assine um plano para acessar este curso.</p>
                  <Link to="/checkout" className="btn btn-success btn-lg w-100 mb-3">
                    Ver Planos
                  </Link>
                </div>
              )}

              {isMatriculado && todasAulasConcluidas && !cursoConcluido && (
                <button
                  className="btn btn-warning btn-lg w-100 mb-3"
                  onClick={handleFinalizarCurso}
                  disabled={finalizando}
                >
                  {finalizando ? 'Finalizando...' : 'Finalizar Curso e Gerar Certificado'}
                </button>
              )}

              <hr />

              <ul className="list-unstyled mb-0">
                <li className="mb-3 d-flex align-items-center gap-2 text-muted">
                  <Clock size={20} />
                  <span>Acesso durante a assinatura</span>
                </li>
                <li className="mb-3 d-flex align-items-center gap-2 text-muted">
                  <Award size={20} />
                  <span>Certificado de Conclusão</span>
                </li>
                <li className="d-flex align-items-center gap-2 text-muted">
                  <PlayCircle size={20} />
                  <span>{curso.totalHoras || 20} horas de conteúdo</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
