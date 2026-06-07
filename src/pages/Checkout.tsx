import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Plano, Usuario, Assinatura } from '../model';
import { financeiroService } from '../services/financeiroService';
import { getLoggedUser, getAssinaturaAtiva, calcularDiasRestantes } from '../services/api';
import { Card } from '../components/ui/Card';
import { Calendar, CheckCircle } from 'lucide-react';

export const Checkout = () => {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [selectedPlano, setSelectedPlano] = useState<Plano | null>(null);
  const [metodoPagamento, setMetodoPagamento] = useState('Cartao de Credito');
  const [loading, setLoading] = useState(false);
  const [assinaturaAtiva, setAssinaturaAtiva] = useState<Assinatura | null>(null);
  const [planoAtivo, setPlanoAtivo] = useState<Plano | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = getLoggedUser();
        if (user) {
          const assinatura = await getAssinaturaAtiva(user.id);
          if (assinatura) {
            setAssinaturaAtiva(assinatura);
            const plano = await financeiroService.getPlanoById(assinatura.idPlano);
            setPlanoAtivo(plano);
            return;
          }
        }
        const data = await financeiroService.getPlanos();
        setPlanos(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlano) return;

    const user: Usuario | null = getLoggedUser();
    if (!user) {
      alert('Por favor, faça login para continuar.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const dataInicio = new Date();
      const dataFim = new Date();
      dataFim.setMonth(dataInicio.getMonth() + selectedPlano.duracaoMeses);

      const assinatura = await financeiroService.createAssinatura({
        idUsuario: user.id,
        idPlano: selectedPlano.id,
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString(),
      });

      await financeiroService.createPagamento({
        idAssinatura: assinatura.id,
        valorPago: selectedPlano.preco,
        dataPagamento: dataInicio.toISOString(),
        metodoPagamento,
        idTransacaoGateway: `TXN-${Math.floor(Math.random() * 1000000)}`,
      });

      alert('Pagamento aprovado com sucesso! Sua assinatura está ativa e agora você pode se matricular em qualquer curso.');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Erro ao processar o pagamento.');
    } finally {
      setLoading(false);
    }
  };

  if (assinaturaAtiva && planoAtivo) {
    const diasRestantes = calcularDiasRestantes(assinaturaAtiva.dataFim);

    return (
      <div className="container py-5">
        <h2 className="mb-4">Minha Assinatura</h2>
        <Card className="p-4 mx-auto" style={{ maxWidth: '600px' }}>
          <div className="text-center mb-4">
            <CheckCircle size={48} className="text-success mb-3" />
            <h4 className="text-success">Assinatura Ativa</h4>
          </div>
          <hr />
          <p><strong>Plano:</strong> {planoAtivo.nome}</p>
          <p><strong>Descrição:</strong> {planoAtivo.descricao}</p>
          <p><strong>Valor:</strong> R$ {planoAtivo.preco.toFixed(2)}</p>
          <p>
            <strong>Início:</strong>{' '}
            {new Date(assinaturaAtiva.dataInicio).toLocaleDateString('pt-BR')}
          </p>
          <p>
            <strong>Válida até:</strong>{' '}
            {new Date(assinaturaAtiva.dataFim).toLocaleDateString('pt-BR')}
          </p>
          <div className="alert alert-info d-flex align-items-center gap-2 mt-3 mb-0">
            <Calendar size={20} />
            <span>
              <strong>{diasRestantes}</strong> dia{diasRestantes !== 1 ? 's' : ''} restante
              {diasRestantes !== 1 ? 's' : ''} da assinatura
            </span>
          </div>
          <div className="mt-4 d-flex gap-2 flex-wrap">
            <Link to="/cursos" className="btn btn-primary">
              Explorar Cursos
            </Link>
            <Link to="/dashboard" className="btn btn-outline-secondary">
              Meu Painel
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">Escolha seu Plano</h2>

      <div className="row g-4 mb-5">
        {planos.map(plano => (
          <div className="col-md-6" key={plano.id}>
            <div
              className={`card h-100 ${selectedPlano?.id === plano.id ? 'border-primary shadow' : ''}`}
              style={{ cursor: 'pointer', transition: '0.3s' }}
              onClick={() => setSelectedPlano(plano)}
            >
              <div className="card-body text-center">
                <h4 className="card-title">{plano.nome}</h4>
                <h2 className="card-subtitle mb-3 text-success">R$ {plano.preco.toFixed(2)}</h2>
                <p className="card-text text-muted">{plano.descricao}</p>
                <small className="text-muted">Duração: {plano.duracaoMeses} mês(es)</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPlano && (
        <Card className="p-4 mx-auto" style={{ maxWidth: '600px' }}>
          <h4>Resumo da Compra</h4>
          <hr />
          <p><strong>Plano Selecionado:</strong> {selectedPlano.nome}</p>
          <p><strong>Total:</strong> R$ {selectedPlano.preco.toFixed(2)}</p>

          <form onSubmit={handleCheckout} className="mt-4">
            <div className="mb-3">
              <label className="form-label">Método de Pagamento</label>
              <select
                className="form-select"
                value={metodoPagamento}
                onChange={e => setMetodoPagamento(e.target.value)}
              >
                <option value="Cartao de Credito">Cartão de Crédito</option>
                <option value="Pix">Pix</option>
                <option value="Boleto">Boleto Bancário</option>
              </select>
            </div>

            {metodoPagamento === 'Cartao de Credito' && (
              <div className="mb-3">
                <label className="form-label">Número do Cartão (Simulação)</label>
                <input type="text" className="form-control" placeholder="0000 0000 0000 0000" />
              </div>
            )}

            <button type="submit" className="btn btn-success w-100 btn-lg mt-3" disabled={loading}>
              {loading ? 'Processando...' : 'Confirmar Pagamento'}
            </button>
          </form>
        </Card>
      )}
    </div>
  );
};
