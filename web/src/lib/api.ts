/**
 * As rotas da API NestJS, com os tipos das respostas. Tudo passa pelo
 * `apiFetch` (regra da costura). O parâmetro `token` só é usado no servidor;
 * no navegador o token vem do cookie.
 */
import { apiFetch } from './api-client';
import type { Role } from './token';

type Token = string | null | undefined;

export type CourseLevel = 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO';

export type Category = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  _count: { courses: number; trilhas: number };
};

export type CategoryDetail = Category & {
  courses: {
    id: number;
    title: string;
    description: string;
    image: string;
    priceCents: number;
    level: CourseLevel;
  }[];
  trilhas: { id: number; title: string; description: string; _count: { courses: number } }[];
};

export type Trilha = {
  id: number;
  title: string;
  description: string;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
  category: { id: number; name: string } | null;
  _count: { courses: number };
};

export type TrilhaDetail = Trilha & {
  courses: {
    id: number;
    title: string;
    description: string;
    image: string;
    priceCents: number;
    lessons: { duration: number }[];
  }[];
};

export type Lesson = { id: number; title: string; duration: number; order: number };

export type Course = {
  id: number;
  title: string;
  description: string;
  image: string;
  priceCents: number;
  trilhaId: number | null;
  categoryId: number | null;
  instructorId: number | null;
  level: CourseLevel;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  trilha: { id: number; title: string } | null;
  category: { id: number; name: string } | null;
  instructor: { id: number; name: string | null; email: string } | null;
  lessons: Lesson[];
  _count: { enrollments: number };
};

/** O Nest nunca devolve `password` (etapa 5). */
export type User = {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
  updateAt: string;
  role: Role;
  _count: { enrollments: number };
};

export type Enrollment = {
  id: number;
  userId: number;
  courseId: number;
  createdAt: string;
  user: { id: number; name: string | null; email: string };
  course: { id: number; title: string; priceCents: number };
};

export type CategoryInput = { name: string; description: string };

export type TrilhaInput = { title: string; description: string; categoryId: number | null };

export type CourseInput = {
  title: string;
  description: string;
  image: string;
  priceCents: number;
  trilhaId: number | null;
  categoryId: number | null;
  instructorId: number | null;
  level: CourseLevel;
  /** ISO 8601. Omitido na criação, a API usa a data de agora. */
  publishedAt?: string;
  lessons: { title: string; duration: number }[];
};

export type UserInput = { email: string; name: string; password: string };

function query(params: Record<string, number | undefined>): string {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined);
  return entries.length === 0 ? '' : `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)]))}`;
}

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiFetch<{ access_token: string }>('/auth/login', { method: 'POST', json: credentials }),
};

export const usersApi = {
  list: (token?: Token) => apiFetch<User[]>('/users', { token }),
  create: (input: UserInput) => apiFetch<User>('/users', { method: 'POST', json: input }),
  update: (id: number, input: Partial<UserInput>) =>
    apiFetch<User>(`/users/${id}`, { method: 'PATCH', json: input }),
  remove: (id: number) => apiFetch<User>(`/users/${id}`, { method: 'DELETE' }),
};

export const categoriesApi = {
  list: () => apiFetch<Category[]>('/categories'),
  get: (id: number) => apiFetch<CategoryDetail>(`/categories/${id}`),
  create: (input: CategoryInput) =>
    apiFetch<Category>('/categories', { method: 'POST', json: input }),
  update: (id: number, input: CategoryInput) =>
    apiFetch<Category>(`/categories/${id}`, { method: 'PATCH', json: input }),
  remove: (id: number) => apiFetch<Category>(`/categories/${id}`, { method: 'DELETE' }),
};

export const trilhasApi = {
  list: () => apiFetch<Trilha[]>('/trilhas'),
  get: (id: number) => apiFetch<TrilhaDetail>(`/trilhas/${id}`),
  create: (input: TrilhaInput) => apiFetch<Trilha>('/trilhas', { method: 'POST', json: input }),
  update: (id: number, input: TrilhaInput) =>
    apiFetch<Trilha>(`/trilhas/${id}`, { method: 'PATCH', json: input }),
  remove: (id: number) => apiFetch<Trilha>(`/trilhas/${id}`, { method: 'DELETE' }),
};

export const coursesApi = {
  list: () => apiFetch<Course[]>('/courses'),
  get: (id: number) => apiFetch<Course>(`/courses/${id}`),
  create: (input: CourseInput) => apiFetch<Course>('/courses', { method: 'POST', json: input }),
  update: (id: number, input: CourseInput) =>
    apiFetch<Course>(`/courses/${id}`, { method: 'PATCH', json: input }),
  remove: (id: number) => apiFetch<Course>(`/courses/${id}`, { method: 'DELETE' }),
};

export const enrollmentsApi = {
  list: (filter: { userId?: number; courseId?: number } = {}, token?: Token) =>
    apiFetch<Enrollment[]>(`/enrollments${query(filter)}`, { token }),
  /** O dono da matrícula é o dono do token; o corpo leva só o curso. */
  create: (courseId: number) =>
    apiFetch<Enrollment>('/enrollments', { method: 'POST', json: { courseId } }),
  remove: (id: number) => apiFetch<Enrollment>(`/enrollments/${id}`, { method: 'DELETE' }),
};
