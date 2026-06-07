import { api } from './api';
import type { Curso, Categoria, Modulo, Aula, Trilha } from '../model';

export const cursoService = {
  getCursos: async () => {
    const response = await api.get<Curso[]>('/cursos');
    return response.data;
  },
  getCursoById: async (id: string) => {
    const response = await api.get<Curso>(`/cursos/${id}`);
    return response.data;
  },
  createCurso: async (curso: Omit<Curso, 'id'>) => {
    const response = await api.post<Curso>('/cursos', curso);
    return response.data;
  },
  
  getCategorias: async () => {
    const response = await api.get<Categoria[]>('/categorias');
    return response.data;
  },
  createCategoria: async (categoria: Omit<Categoria, 'id'>) => {
    const response = await api.post<Categoria>('/categorias', categoria);
    return response.data;
  },

  getModulosByCursoId: async (idCurso: string) => {
    const response = await api.get<Modulo[]>('/modulos');
    return response.data
      .filter(m => String(m.idCurso) === String(idCurso))
      .sort((a, b) => a.ordem - b.ordem);
  },
  createModulo: async (modulo: Omit<Modulo, 'id'>) => {
    const response = await api.post<Modulo>('/modulos', modulo);
    return response.data;
  },

  getAulasByModuloId: async (idModulo: string) => {
    const response = await api.get<Aula[]>('/aulas');
    return response.data
      .filter(a => String(a.idModulo) === String(idModulo))
      .sort((a, b) => a.ordem - b.ordem);
  },
  createAula: async (aula: Omit<Aula, 'id'>) => {
    const response = await api.post<Aula>('/aulas', aula);
    return response.data;
  },

  getTrilhas: async () => {
    const response = await api.get<Trilha[]>('/trilhas');
    return response.data;
  },
};
