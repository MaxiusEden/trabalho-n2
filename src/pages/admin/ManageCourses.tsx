import { useState, useEffect } from 'react';
import type { Curso, Categoria } from '../../model';
import { cursoService } from '../../services/cursoService';
import { Table } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Link } from 'react-router-dom';

export const ManageCourses = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
  // Form State
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [idCategoria, setIdCategoria] = useState('');
  const [nivel, setNivel] = useState('Iniciante');

  const loadData = async () => {
    try {
      const [cursosData, categoriasData] = await Promise.all([
        cursoService.getCursos(),
        cursoService.getCategorias()
      ]);
      setCursos(cursosData);
      setCategorias(categoriasData);
      if (categoriasData.length > 0) setIdCategoria(categoriasData[0].id);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const novoCurso = {
      titulo,
      descricao,
      idInstrutor: '1', // Fake admin instructor
      idCategoria,
      nivel,
      dataPublicacao: new Date().toISOString().split('T')[0],
      totalAulas: 0,
      totalHoras: 0
    };
    await cursoService.createCurso(novoCurso);
    setTitulo('');
    setDescricao('');
    document.getElementById('closeModalCursoBtn')?.click();
    loadData();
  };

  const columns = [
    { header: 'ID', accessor: 'id' as keyof Curso },
    { header: 'Título', accessor: 'titulo' as keyof Curso },
    { header: 'Nível', accessor: 'nivel' as keyof Curso },
    {
      header: 'Ações',
      accessor: (row: Curso) => (
        <Link to={`/admin/cursos/${row.id}/modulos`} className="btn btn-sm btn-outline-primary">
          Gerenciar Módulos
        </Link>
      )
    }
  ];

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestão de Cursos</h2>
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#cursoModal">
          Novo Curso
        </button>
      </div>

      <Card>
        <Table columns={columns} data={cursos} keyExtractor={(c) => c.id} />
      </Card>

      <Modal id="cursoModal" title="Cadastrar Curso">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Título</label>
            <input type="text" className="form-control" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Descrição</label>
            <textarea className="form-control" value={descricao} onChange={(e) => setDescricao(e.target.value)} required></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Categoria</label>
            <select className="form-select" value={idCategoria} onChange={(e) => setIdCategoria(e.target.value)}>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Nível</label>
            <select className="form-select" value={nivel} onChange={(e) => setNivel(e.target.value)}>
              <option value="Iniciante">Iniciante</option>
              <option value="Intermediário">Intermediário</option>
              <option value="Avançado">Avançado</option>
            </select>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" id="closeModalCursoBtn" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" className="btn btn-success">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
