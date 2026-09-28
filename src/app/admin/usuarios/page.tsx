import { usersService } from '@/lib/users/users.service';
import { UsersManager } from '@/components/admin/UsersManager';

export const dynamic = 'force-dynamic';

export default async function AdminUsuariosPage() {
  const users = await usersService.findAll();

  return (
    <div>
      <h1 className="admin-title">Usuários</h1>
      <p className="text-muted mb-4">
        CRUD completo da entidade <code>User</code> — criar, listar, atualizar e excluir.
      </p>

      <UsersManager users={users} />
    </div>
  );
}
