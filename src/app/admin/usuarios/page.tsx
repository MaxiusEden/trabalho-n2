import { usersService } from '@/lib/users/users.service';
import { UsersManager } from '@/components/admin/UsersManager';

export const dynamic = 'force-dynamic';

export default async function AdminUsuariosPage() {
  const users = await usersService.findAll();

  return (
    <div className="container-fluid">
      <h1 className="h3 text-black mb-1">Usuários</h1>
      <p className="text-muted">
        CRUD completo da entidade <code>User</code> — criar, listar, atualizar e excluir.
      </p>

      <UsersManager users={users} />
    </div>
  );
}
