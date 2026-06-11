import { useEffect, useMemo, useState } from 'react';
import type { Assinatura, Plano, Usuario } from '../../model';
import { financeiroService } from '../../services/financeiroService';
import { usuarioService } from '../../services/usuarioService';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';

export const ManageSubscriptions = () => {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState(0);
  const [duracaoMeses, setDuracaoMeses] = useState(1);

  const [idUsuario, setIdUsuario] = useState('');
  const [idPlano, setIdPlano] = useState('');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    try {
      const [planosData, assinaturasData, usuariosData] = await Promise.all([
        financeiroService.getPlanos(),
        financeiroService.getAssinaturas(),
        usuarioService.getUsuarios(),
      ]);

      setPlanos(planosData);
      setAssinaturas(assinaturasData);
      setUsuarios(usuariosData);

      if (!idPlano && planosData[0]) setIdPlano(planosData[0].id);
      if (!idUsuario && usuariosData[0]) setIdUsuario(usuariosData[0].id);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const planosPorId = useMemo(() => new Map(planos.map(plano => [String(plano.id), plano])), [planos]);
  const usuariosPorId = useMemo(() => new Map(usuarios.map(usuario => [String(usuario.id), usuario])), [usuarios]);

  const handleCreatePlano = async (e: React.FormEvent) => {
    e.preventDefault();
    await financeiroService.createPlano({ nome, descricao, preco, duracaoMeses });
    setNome('');
    setDescricao('');
    setPreco(0);
    setDuracaoMeses(1);
    document.getElementById('closeModalPlanoBtn')?.click();
    loadData();
  };

  const handleCreateAssinatura = async (e: React.FormEvent) => {
    e.preventDefault();
    const plano = planosPorId.get(String(idPlano));
    if (!plano) return;

    const inicio = new Date(`${dataInicio}T00:00:00`);
    const fim = new Date(inicio);
    fim.setMonth(fim.getMonth() + plano.duracaoMeses);

    await financeiroService.createAssinatura({
      idUsuario,
      idPlano,
      dataInicio: inicio.toISOString(),
      dataFim: fim.toISOString(),
    });

    document.getElementById('closeModalAssinaturaBtn')?.click();
    loadData();
  };

  const planoColumns = [
    { header: 'Nome', accessor: 'nome' as keyof Plano },
    { header: 'Descrição', accessor: 'descricao' as keyof Plano },
    {
      header: 'Preço',
      accessor: (row: Plano) => `R$ ${row.preco.toFixed(2)}`,
    },
    { header: 'Duração', accessor: (row: Plano) => `${row.duracaoMeses} mês(es)` },
  ];

  const assinaturaColumns = [
    {
      header: 'Usuário',
      accessor: (row: Assinatura) => usuariosPorId.get(String(row.idUsuario))?.nomeCompleto ?? row.idUsuario,
    },
    {
      header: 'Plano',
      accessor: (row: Assinatura) => planosPorId.get(String(row.idPlano))?.nome ?? row.idPlano,
    },
    {
      header: 'Início',
      accessor: (row: Assinatura) => new Date(row.dataInicio).toLocaleDateString('pt-BR'),
    },
    {
      header: 'Fim',
      accessor: (row: Assinatura) => new Date(row.dataFim).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2>Gestão de Assinaturas</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#planoModal">
            Novo Plano
          </button>
          <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#assinaturaModal">
            Nova Assinatura
          </button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <Card>
            <h4 className="mb-3">Planos</h4>
            <Table columns={planoColumns} data={planos} keyExtractor={plano => plano.id} />
          </Card>
        </div>
        <div className="col-12">
          <Card>
            <h4 className="mb-3">Assinaturas</h4>
            <Table columns={assinaturaColumns} data={assinaturas} keyExtractor={assinatura => assinatura.id} />
          </Card>
        </div>
      </div>

      <Modal id="planoModal" title="Cadastrar Plano">
        <form onSubmit={handleCreatePlano}>
          <div className="mb-3">
            <label className="form-label">Nome</label>
            <input className="form-control" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Descrição</label>
            <textarea className="form-control" value={descricao} onChange={e => setDescricao(e.target.value)} required />
          </div>
          <div className="row">
            <div className="col-6 mb-3">
              <label className="form-label">Preço</label>
              <input type="number" step="0.01" min={0} className="form-control" value={preco} onChange={e => setPreco(Number(e.target.value))} required />
            </div>
            <div className="col-6 mb-3">
              <label className="form-label">Duração em meses</label>
              <input type="number" min={1} className="form-control" value={duracaoMeses} onChange={e => setDuracaoMeses(Number(e.target.value))} required />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" id="closeModalPlanoBtn" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" className="btn btn-success">Salvar</button>
          </div>
        </form>
      </Modal>

      <Modal id="assinaturaModal" title="Cadastrar Assinatura">
        <form onSubmit={handleCreateAssinatura}>
          <div className="mb-3">
            <label className="form-label">Usuário</label>
            <select className="form-select" value={idUsuario} onChange={e => setIdUsuario(e.target.value)} required>
              {usuarios.map(usuario => (
                <option key={usuario.id} value={usuario.id}>{usuario.nomeCompleto} ({usuario.email})</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Plano</label>
            <select className="form-select" value={idPlano} onChange={e => setIdPlano(e.target.value)} required>
              {planos.map(plano => (
                <option key={plano.id} value={plano.id}>{plano.nome}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Data de início</label>
            <input type="date" className="form-control" value={dataInicio} onChange={e => setDataInicio(e.target.value)} required />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" id="closeModalAssinaturaBtn" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" className="btn btn-success">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
