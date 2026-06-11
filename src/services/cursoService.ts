import { api } from './api';
import type { Curso, Categoria, Modulo, Aula, Trilha, TrilhaCurso } from '../model';

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
  updateCurso: async (id: string, curso: Partial<Omit<Curso, 'id'>>) => {
    const response = await api.patch<Curso>(`/cursos/${id}`, curso);
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
  updateCategoria: async (id: string, categoria: Partial<Omit<Categoria, 'id'>>) => {
    const response = await api.patch<Categoria>(`/categorias/${id}`, categoria);
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
  updateModulo: async (id: string, modulo: Partial<Omit<Modulo, 'id'>>) => {
    const response = await api.patch<Modulo>(`/modulos/${id}`, modulo);
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
  updateAula: async (id: string, aula: Partial<Omit<Aula, 'id'>>) => {
    const response = await api.patch<Aula>(`/aulas/${id}`, aula);
    return response.data;
  },

  getTrilhas: async () => {
    const response = await api.get<Trilha[]>('/trilhas');
    return response.data;
  },
  getTrilhaById: async (id: string) => {
    const response = await api.get<Trilha>(`/trilhas/${id}`);
    return response.data;
  },
  createTrilha: async (trilha: Omit<Trilha, 'id'>) => {
    const response = await api.post<Trilha>('/trilhas', trilha);
    return response.data;
  },
  updateTrilha: async (id: string, trilha: Partial<Omit<Trilha, 'id'>>) => {
    const response = await api.patch<Trilha>(`/trilhas/${id}`, trilha);
    return response.data;
  },
  getTrilhaCursosByTrilhaId: async (idTrilha: string) => {
    const response = await api.get<TrilhaCurso[]>(`/trilhasCursos?idTrilha=${idTrilha}`);
    return response.data.sort((a, b) => a.ordem - b.ordem);
  },
  createTrilhaCurso: async (trilhaCurso: Omit<TrilhaCurso, 'id'>) => {
    const response = await api.post<TrilhaCurso>('/trilhasCursos', trilhaCurso);
    return response.data;
  },
  updateTrilhaCurso: async (id: string, trilhaCurso: Partial<Omit<TrilhaCurso, 'id'>>) => {
    const response = await api.patch<TrilhaCurso>(`/trilhasCursos/${id}`, trilhaCurso);
    return response.data;
  },
  deleteTrilhaCurso: async (id: string) => {
    await api.delete(`/trilhasCursos/${id}`);
  },
};
