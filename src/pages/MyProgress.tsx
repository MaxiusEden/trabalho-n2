import { useEffect, useState } from 'react';
import { getLoggedUser } from '../services/api';
import { usuarioService } from '../services/usuarioService';
import { cursoService } from '../services/cursoService';
import type { Matricula, ProgressoAula, Certificado, Usuario, Curso } from '../model';
import { Card } from '../components/ui/Card';
import { Link, useNavigate } from 'react-router-dom';

export const MyProgress = () => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [progressos, setProgressos] = useState<ProgressoAula[]>([]);
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [cursosMap, setCursosMap] = useState<Record<string, Curso>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const loggedUser = getLoggedUser();
    if (!loggedUser) {
      navigate('/login');
      return;
    }
    setUser(loggedUser);

    const loadDashboard = async () => {
      try {
        const [matData, progData, certData, cursosData] = await Promise.all([
          usuarioService.getMatriculasByUsuarioId(loggedUser.id),
          usuarioService.getProgressoByUsuarioId(loggedUser.id),
          usuarioService.getCertificadosByUsuarioId(loggedUser.id),
          cursoService.getCursos(),
        ]);
        setMatriculas(usuarioService.deduplicarMatriculas(matData));
        setProgressos(progData);
        setCertificados(certData);
        setCursosMap(Object.fromEntries(cursosData.map(c => [c.id, c])));
      } catch (err) {
        console.error(err);
      }
    };
    loadDashboard();
  }, [navigate]);

  if (!user) return <div>Carregando...</div>;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Painel do Aluno - {user.nomeCompleto}</h2>

      <div className="row g-4">
        <div className="col-lg-8">
          <Card title="Meus Cursos e Matrículas" className="mb-4">
            {matriculas.length === 0 ? (
              <p>
                Nenhuma matrícula encontrada.{' '}
                <Link to="/cursos">Navegue pelos cursos.</Link>
              </p>
            ) : (
              <ul className="list-group list-group-flush">
                {matriculas.map(mat => {
                  const curso = cursosMap[mat.idCurso];
                  const cert = certificados.find(c => c.idCurso === mat.idCurso);
                  const concluido = !!mat.dataConclusao;

                  return (
                    <li
                      key={mat.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{curso?.titulo ?? `Curso #${mat.idCurso}`}</strong>
                        <br />
                        <small className="text-muted">
                          Matriculado em: {new Date(mat.dataMatricula).toLocaleDateString('pt-BR')}
                        </small>
                        {concluido && (
                          <>
                            <br />
                            <span className="badge bg-success mt-1">
                              Concluído em {new Date(mat.dataConclusao!).toLocaleDateString('pt-BR')}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="d-flex gap-2">
                        <Link to={`/curso/${mat.idCurso}`} className="btn btn-sm btn-primary">
                          {concluido ? 'Revisar' : 'Continuar'}
                        </Link>
                        {cert && (
                          <span className="badge bg-success align-self-center">
                            Certificado emitido
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title="Aulas Concluídas">
            {progressos.length === 0 ? (
              <p>Nenhum progresso registrado.</p>
            ) : (
              <ul className="list-group list-group-flush">
                {progressos.map(prog => (
                  <li key={prog.id} className="list-group-item">
                    Aula #{prog.idAula} —{' '}
                    <span className="badge bg-success">Concluída</span> em{' '}
                    {new Date(prog.dataConclusao).toLocaleDateString('pt-BR')}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="col-lg-4">
          <Card title="Meus Certificados">
            {certificados.length === 0 ? (
              <p>Você ainda não possui certificados emitidos. Conclua um curso para receber o seu.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {certificados.map(cert => {
                  const curso = cursosMap[cert.idCurso];
                  return (
                    <div key={cert.id} className="border p-3 rounded text-center bg-body-secondary">
                      <h5 className="text-success">Certificado de Conclusão</h5>
                      <p className="mb-1">{curso?.titulo ?? `Curso #${cert.idCurso}`}</p>
                      <small className="text-muted d-block">Código: {cert.codigoVerificacao}</small>
                      <small className="text-muted">
                        Emitido em: {new Date(cert.dataEmissao).toLocaleDateString('pt-BR')}
                      </small>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
