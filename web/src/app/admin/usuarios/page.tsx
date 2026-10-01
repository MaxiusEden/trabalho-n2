import { usersApi } from '@/lib/api';
import { handlePageError, requireAdminToken } from '@/lib/server-session';
import { AccessDenied } from '@/components/admin/AccessDenied';
import { UsersManager } from '@/components/admin/UsersManager';

export const dynamic = 'force-dynamic';

export default async function AdminUsuariosPage() {
  // Só ADMIN; o servidor do Next repassa o token do cookie ao Nest.
  const token = await requireAdminToken();
  if (!token) return <AccessDenied />;
  const users = await usersApi.list(token).catch(handlePageError);

  return (
    <div>
      <h1 className="admin-title">Usuários</h1>
      <p className="text-muted mb-4">Cadastre, edite e exclua quem usa a plataforma.</p>

      <UsersManager users={users} />
    </div>
  );
}
