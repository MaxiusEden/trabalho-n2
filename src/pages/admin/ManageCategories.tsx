import { useState, useEffect } from 'react';
import type { Categoria } from '../../model';
import { cursoService } from '../../services/cursoService';
import { Table } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';

export const ManageCategories = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const loadCategorias = async () => {
    try {
      const data = await cursoService.getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await cursoService.createCategoria({ nome, descricao });
    setNome('');
    setDescricao('');
    // Fechar modal via manipulacao do DOM para simplificar (Bootstrap behavior)
    document.getElementById('closeModalBtn')?.click();
    loadCategorias();
  };

  const columns = [
    { header: 'ID', accessor: 'id' as keyof Categoria },
    { header: 'Nome', accessor: 'nome' as keyof Categoria },
    { header: 'Descrição', accessor: 'descricao' as keyof Categoria },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestão de Categorias</h2>
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#categoriaModal">
          Nova Categoria
        </button>
      </div>

      <Card>
        <Table columns={columns} data={categorias} keyExtractor={(c) => c.id} />
      </Card>

      <Modal id="categoriaModal" title="Cadastrar Categoria">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nome da Categoria</label>
            <input 
              type="text" 
              className="form-control" 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Descrição</label>
            <textarea 
              className="form-control" 
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
              required 
            ></textarea>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" id="closeModalBtn" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" className="btn btn-success">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
