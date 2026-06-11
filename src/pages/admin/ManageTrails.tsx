import { useEffect, useMemo, useState } from 'react';
import type { Categoria, Curso, Trilha, TrilhaCurso } from '../../model';
import { cursoService } from '../../services/cursoService';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';

export const ManageTrails = () => {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [vinculos, setVinculos] = useState<TrilhaCurso[]>([]);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [idCategoria, setIdCategoria] = useState('');

  const [activeTrilhaId, setActiveTrilhaId] = useState('');
  const [idCurso, setIdCurso] = useState('');
  const [ordem, setOrdem] = useState(1);

  const loadData = async () => {
    try {
      const [trilhasData, categoriasData, cursosData] = await Promise.all([
        cursoService.getTrilhas(),
        cursoService.getCategorias(),
        cursoService.getCursos(),
      ]);

      const vinculosData = (
        await Promise.all(trilhasData.map(trilha => cursoService.getTrilhaCursosByTrilhaId(trilha.id)))
      ).flat();

      setTrilhas(trilhasData);
      setCategorias(categoriasData);
      setCursos(cursosData);
      setVinculos(vinculosData);

      if (!idCategoria && categoriasData[0]) setIdCategoria(categoriasData[0].id);
      if (!idCurso && cursosData[0]) setIdCurso(cursosData[0].id);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const cursosPorId = useMemo(() => new Map(cursos.map(curso => [String(curso.id), curso])), [cursos]);
  const categoriasPorId = useMemo(
    () => new Map(categorias.map(categoria => [String(categoria.id), categoria])),
    [categorias]
  );

  const handleCreateTrilha = async (e: React.FormEvent) => {
    e.preventDefault();
    await cursoService.createTrilha({ titulo, descricao, idCategoria });
    setTitulo('');
    setDescricao('');
    document.getElementById('closeModalTrilhaBtn')?.click();
    loadData();
  };

  const handleCreateVinculo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrilhaId || !idCurso) return;

    const vinculoExistente = vinculos.find(
      vinculo => String(vinculo.idTrilha) === String(activeTrilhaId) && String(vinculo.idCurso) === String(idCurso)
    );

    if (vinculoExistente) {
      await cursoService.updateTrilhaCurso(vinculoExistente.id, { ordem });
    } else {
      await cursoService.createTrilhaCurso({ idTrilha: activeTrilhaId, idCurso, ordem });
    }

    document.getElementById('closeModalVinculoBtn')?.click();
    loadData();
  };

  const columns = [
    { header: 'Título', accessor: 'titulo' as keyof Trilha },
    {
      header: 'Categoria',
      accessor: (row: Trilha) => categoriasPorId.get(String(row.idCategoria))?.nome ?? row.idCategoria,
    },
    {
      header: 'Cursos',
      accessor: (row: Trilha) => {
        const cursosDaTrilha = vinculos
          .filter(vinculo => String(vinculo.idTrilha) === String(row.id))
          .sort((a, b) => a.ordem - b.ordem);

        return cursosDaTrilha.length > 0
          ? cursosDaTrilha.map(vinculo => cursosPorId.get(String(vinculo.idCurso))?.titulo).filter(Boolean).join(', ')
          : 'Nenhum curso vinculado';
      },
    },
    {
      header: 'Ações',
      accessor: (row: Trilha) => (
        <button
          className="btn btn-sm btn-outline-primary"
          data-bs-toggle="modal"
          data-bs-target="#vinculoModal"
          onClick={() => {
            const quantidadeCursos = vinculos.filter(vinculo => String(vinculo.idTrilha) === String(row.id)).length;
            setActiveTrilhaId(row.id);
            setOrdem(quantidadeCursos + 1);
          }}
        >
          Vincular Curso
        </button>
      ),
    },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestão de Trilhas</h2>
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#trilhaModal">
          Nova Trilha
        </button>
      </div>

      <Card>
        <Table columns={columns} data={trilhas} keyExtractor={trilha => trilha.id} />
      </Card>

      <Modal id="trilhaModal" title="Cadastrar Trilha">
        <form onSubmit={handleCreateTrilha}>
          <div className="mb-3">
            <label className="form-label">Título</label>
            <input className="form-control" value={titulo} onChange={e => setTitulo(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Descrição</label>
            <textarea className="form-control" value={descricao} onChange={e => setDescricao(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Categoria</label>
            <select className="form-select" value={idCategoria} onChange={e => setIdCategoria(e.target.value)} required>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
              ))}
            </select>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" id="closeModalTrilhaBtn" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" className="btn btn-success">Salvar</button>
          </div>
        </form>
      </Modal>

      <Modal id="vinculoModal" title="Vincular Curso à Trilha">
        <form onSubmit={handleCreateVinculo}>
          <div className="mb-3">
            <label className="form-label">Curso</label>
            <select className="form-select" value={idCurso} onChange={e => setIdCurso(e.target.value)} required>
              {cursos.map(curso => (
                <option key={curso.id} value={curso.id}>{curso.titulo}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Ordem na trilha</label>
            <input
              type="number"
              min={1}
              className="form-control"
              value={ordem}
              onChange={e => setOrdem(Number(e.target.value))}
              required
            />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" id="closeModalVinculoBtn" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" className="btn btn-success">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
