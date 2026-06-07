import { api } from './api';
import type { Usuario, Matricula, ProgressoAula, Certificado } from '../model';

export const usuarioService = {
  getUsuarios: async () => {
    const response = await api.get<Usuario[]>('/usuarios');
    return response.data;
  },
  getUsuarioByEmail: async (email: string) => {
    const response = await api.get<Usuario[]>(`/usuarios?email=${email}`);
    return response.data[0]; // Retorna o primeiro usuário (ou undefined se não existir)
  },
  createUsuario: async (usuario: Omit<Usuario, 'id'>) => {
    const response = await api.post<Usuario>('/usuarios', usuario);
    return response.data;
  },

  getMatriculasByUsuarioId: async (idUsuario: string) => {
    const response = await api.get<Matricula[]>(`/matriculas?idUsuario=${idUsuario}`);
    return response.data;
  },
  createMatricula: async (matricula: Omit<Matricula, 'id'>) => {
    const responseCheck = await api.get<Matricula[]>(`/matriculas?idUsuario=${matricula.idUsuario}`);
    const duplicate = responseCheck.data.find(
      m => String(m.idCurso) === String(matricula.idCurso)
    );
    if (duplicate) {
      throw new Error('Usuário já matriculado neste curso.');
    }
    const response = await api.post<Matricula>('/matriculas', matricula);
    return response.data;
  },
  updateMatricula: async (id: string, matricula: Partial<Matricula>) => {
    const response = await api.patch<Matricula>(`/matriculas/${id}`, matricula);
    return response.data;
  },
  getMatriculaByUsuarioAndCurso: async (idUsuario: string, idCurso: string) => {
    const response = await api.get<Matricula[]>(`/matriculas?idUsuario=${idUsuario}`);
    return response.data.find(m => String(m.idCurso) === String(idCurso)) ?? null;
  },
  deduplicarMatriculas: (matriculas: Matricula[]): Matricula[] => {
    const porCurso = new Map<string, Matricula>();
    for (const mat of matriculas) {
      const existente = porCurso.get(mat.idCurso);
      if (!existente) {
        porCurso.set(mat.idCurso, mat);
        continue;
      }
      if (existente.dataConclusao && !mat.dataConclusao) continue;
      if (mat.dataConclusao && !existente.dataConclusao) {
        porCurso.set(mat.idCurso, mat);
        continue;
      }
      if (new Date(mat.dataMatricula) > new Date(existente.dataMatricula)) {
        porCurso.set(mat.idCurso, mat);
      }
    }
    return Array.from(porCurso.values());
  },

  getProgressoByUsuarioId: async (idUsuario: string) => {
    const response = await api.get<ProgressoAula[]>(`/progressoAulas?idUsuario=${idUsuario}`);
    return response.data;
  },
  updateProgresso: async (progresso: Omit<ProgressoAula, 'id'> | ProgressoAula) => {
    // Para simplificar, estamos adicionando um registro de progresso para a aula
    const response = await api.post<ProgressoAula>('/progressoAulas', progresso);
    return response.data;
  },

  getCertificadosByUsuarioId: async (idUsuario: string) => {
    const response = await api.get<Certificado[]>(`/certificados?idUsuario=${idUsuario}`);
    return response.data;
  },
  createCertificado: async (certificado: Omit<Certificado, 'id'>) => {
    const response = await api.post<Certificado>('/certificados', certificado);
    return response.data;
  }
};
