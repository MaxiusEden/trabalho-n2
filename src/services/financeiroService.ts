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
  getAssinaturas: async () => {
    const response = await api.get<Assinatura[]>('/assinaturas');
    return response.data;
  },
  createPlano: async (plano: Omit<Plano, 'id'>) => {
    const response = await api.post<Plano>('/planos', plano);
    return response.data;
  },
  updatePlano: async (id: string, plano: Partial<Omit<Plano, 'id'>>) => {
    const response = await api.patch<Plano>(`/planos/${id}`, plano);
    return response.data;
  },
  updateAssinatura: async (id: string, assinatura: Partial<Omit<Assinatura, 'id'>>) => {
    const response = await api.patch<Assinatura>(`/assinaturas/${id}`, assinatura);
    return response.data;
  },
  createPagamento: async (pagamento: Omit<Pagamento, 'id'>) => {
    const response = await api.post<Pagamento>('/pagamentos', pagamento);
    return response.data;
  }
};
