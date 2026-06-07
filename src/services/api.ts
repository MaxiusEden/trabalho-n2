import axios from 'axios';
import type { Usuario, Assinatura } from '../model';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

// A simple utility to get current logged in user from localStorage
export const getLoggedUser = (): Usuario | null => {
  const userStr = localStorage.getItem('loggedUser');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

// Checks if the logged user has the admin role
export const isAdmin = (): boolean => {
  const user = getLoggedUser();
  return user?.role === 'admin';
};

// Returns the active subscription with the latest end date, or null
export const getAssinaturaAtiva = async (idUsuario: string): Promise<Assinatura | null> => {
  try {
    const response = await api.get<Assinatura[]>(`/assinaturas?idUsuario=${idUsuario}`);
    const agora = new Date();
    const ativas = response.data.filter(a => new Date(a.dataFim) > agora);
    if (ativas.length === 0) return null;
    return ativas.sort((a, b) => new Date(b.dataFim).getTime() - new Date(a.dataFim).getTime())[0];
  } catch {
    return null;
  }
};

// Checks if the logged user has an active subscription
export const checkAssinaturaAtiva = async (idUsuario: string): Promise<boolean> => {
  const assinatura = await getAssinaturaAtiva(idUsuario);
  return assinatura !== null;
};

export const calcularDiasRestantes = (dataFim: string): number => {
  const diffMs = new Date(dataFim).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};
