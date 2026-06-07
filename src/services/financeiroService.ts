import { api } from './api';
import type { Plano, Assinatura, Pagamento } from '../model';

export const financeiroService = {
  getPlanos: async () => {
    const response = await api.get<Plano[]>('/planos');
    return response.data;
  },
  getPlanoById: async (id: string) => {
    const response = await api.get<Plano>(`/planos/${id}`);
    return response.data;
  },
  createAssinatura: async (assinatura: Omit<Assinatura, 'id'>) => {
    const response = await api.post<Assinatura>('/assinaturas', assinatura);
    return response.data;
  },
  createPagamento: async (pagamento: Omit<Pagamento, 'id'>) => {
    const response = await api.post<Pagamento>('/pagamentos', pagamento);
    return response.data;
  }
};
