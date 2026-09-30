import { usersApi } from '@/lib/api';
import { handlePageError, requireToken } from '@/lib/server-session';
import { UsersManager } from '@/components/admin/UsersManager';

export const dynamic = 'force-dynamic';

export default async function AdminUsuariosPage() {
  // `GET /users` é protegido: o servidor do Next repassa o token do cookie.
  const token = await requireToken();
  const users = await usersApi.list(token).catch(handlePageError);

  return (
    <div>
      <h1 className="admin-title">Usuários</h1>
      <p className="text-muted mb-4">Cadastre, edite e exclua quem usa a plataforma.</p>

      <UsersManager users={users} />
    </div>
  );
}
