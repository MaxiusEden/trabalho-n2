import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Curso, Modulo, Aula } from '../../model';
import { cursoService } from '../../services/cursoService';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { ArrowLeft, Plus } from 'lucide-react';

export const ManageModulesAndClasses = () => {
  const { id } = useParams<{ id: string }>();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<Record<string, Aula[]>>({});

  // States para Módulo
  const [moduloTitulo, setModuloTitulo] = useState('');
  const [moduloOrdem, setModuloOrdem] = useState(1);

  // States para Aula
  const [activeModuloId, setActiveModuloId] = useState('');
  const [aulaTitulo, setAulaTitulo] = useState('');
  const [aulaTipo, setAulaTipo] = useState('Vídeo');
  const [aulaUrl, setAulaUrl] = useState('');
  const [aulaDuracao, setAulaDuracao] = useState(10);
  const [aulaOrdem, setAulaOrdem] = useState(1);

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
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddModulo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    await cursoService.createModulo({ idCurso: id, titulo: moduloTitulo, ordem: moduloOrdem });
    setModuloTitulo('');
    setModuloOrdem(modulos.length + 2);
    document.getElementById('closeModalModuloBtn')?.click();
    loadData();
  };

  const handleAddAula = async (e: React.FormEvent) => {
    e.preventDefault();
    await cursoService.createAula({
      idModulo: activeModuloId,
      titulo: aulaTitulo,
      tipoConteudo: aulaTipo,
      urlConteudo: aulaUrl,
      duracaoMinutos: aulaDuracao,
      ordem: aulaOrdem
    });
    setAulaTitulo('');
    setAulaUrl('');
    document.getElementById('closeModalAulaBtn')?.click();
    loadData();
  };

  if (!curso) return <div>Carregando...</div>;

  return (
    <div className="container-fluid py-4">
      <div className="mb-3">
        <Link to="/admin/cursos" className="text-decoration-none text-secondary d-flex align-items-center gap-2">
          <ArrowLeft size={20} /> Voltar
        </Link>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{curso.titulo} - Módulos e Aulas</h2>
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#moduloModal">
          <Plus size={20} /> Novo Módulo
        </button>
      </div>

      <div className="row g-4">
        {modulos.map(modulo => (
          <div key={modulo.id} className="col-12">
            <Card>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="m-0">Módulo {modulo.ordem}: {modulo.titulo}</h4>
                <button 
                  className="btn btn-sm btn-outline-success" 
                  data-bs-toggle="modal" 
                  data-bs-target="#aulaModal"
                  onClick={() => {
                    setActiveModuloId(modulo.id);
                    setAulaOrdem((aulas[modulo.id]?.length || 0) + 1);
                  }}
                >
                  <Plus size={16} /> Adicionar Aula
                </button>
              </div>
              
              {aulas[modulo.id] && aulas[modulo.id].length > 0 ? (
                <ul className="list-group list-group-flush">
                  {aulas[modulo.id].map(aula => (
                    <li key={aula.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Aula {aula.ordem}:</strong> {aula.titulo} <span className="badge bg-secondary ms-2">{aula.tipoConteudo}</span>
                      </div>
                      <span className="text-muted">{aula.duracaoMinutos} min</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">Nenhuma aula cadastrada neste módulo.</p>
              )}
            </Card>
          </div>
        ))}
      </div>

      {/* Modal Módulo */}
      <Modal id="moduloModal" title="Cadastrar Módulo">
        <form onSubmit={handleAddModulo}>
          <div className="mb-3">
            <label className="form-label">Título do Módulo</label>
            <input type="text" className="form-control" value={moduloTitulo} onChange={e => setModuloTitulo(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Ordem</label>
            <input type="number" className="form-control" value={moduloOrdem} onChange={e => setModuloOrdem(Number(e.target.value))} required />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" id="closeModalModuloBtn" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" className="btn btn-success">Salvar</button>
          </div>
        </form>
      </Modal>

      {/* Modal Aula */}
      <Modal id="aulaModal" title="Cadastrar Aula">
        <form onSubmit={handleAddAula}>
          <div className="mb-3">
            <label className="form-label">Título da Aula</label>
            <input type="text" className="form-control" value={aulaTitulo} onChange={e => setAulaTitulo(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Tipo de Conteúdo</label>
            <select className="form-select" value={aulaTipo} onChange={e => setAulaTipo(e.target.value)}>
              <option value="Vídeo">Vídeo</option>
              <option value="Texto">Texto</option>
              <option value="Quiz">Quiz</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">URL do Conteúdo</label>
            <input type="text" className="form-control" value={aulaUrl} onChange={e => setAulaUrl(e.target.value)} />
          </div>
          <div className="row">
            <div className="col-6 mb-3">
              <label className="form-label">Duração (min)</label>
              <input type="number" className="form-control" value={aulaDuracao} onChange={e => setAulaDuracao(Number(e.target.value))} required />
            </div>
            <div className="col-6 mb-3">
              <label className="form-label">Ordem</label>
              <input type="number" className="form-control" value={aulaOrdem} onChange={e => setAulaOrdem(Number(e.target.value))} required />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" id="closeModalAulaBtn" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" className="btn btn-success">Salvar</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
