import { categoriesApi, coursesApi, trilhasApi, usersApi } from '@/lib/api';
import { handlePageError, requireAdminToken } from '@/lib/server-session';
import { AccessDenied } from '@/components/admin/AccessDenied';
import { CoursesManager } from '@/components/admin/CoursesManager';

export const dynamic = 'force-dynamic';

export default async function AdminCursosPage() {
  // Só ADMIN. A lista de usuários (para escolher o instrutor) exige o token.
  const token = await requireAdminToken();
  if (!token) return <AccessDenied />;
  const [courses, trilhas, categories, users] = await Promise.all([
    coursesApi.list(),
    trilhasApi.list(),
    categoriesApi.list(),
    usersApi.list(token),
  ]).catch(handlePageError);

  return (
    <div>
      <h1 className="admin-title">Cursos</h1>
      <p className="text-muted mb-4">
        Cadastre cursos com preço, trilha, categoria, nível, instrutor e a lista de aulas.
      </p>

      <CoursesManager
        courses={courses}
        trilhas={trilhas.map((trilha) => ({ id: trilha.id, title: trilha.title }))}
        categories={categories.map((category) => ({ id: category.id, label: category.name }))}
        instructors={users.map((user) => ({
          id: user.id,
          label: user.name ? `${user.name} (${user.email})` : user.email,
        }))}
      />
    </div>
  );
}
