import { AdminNav, AdminTools } from '@/components/admin/AdminNav';
import { requireAdminToken } from '@/lib/server-session';

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  // Sem perfil ADMIN, nada do menu da administração aparece; a página mostra o
  // acesso negado (cada página confere de novo antes de buscar dados).
  const isAdmin = (await requireAdminToken()) !== null;

  if (!isAdmin) return <div className="container">{children}</div>;

  return (
    <div className="container">
      <div className="admin-layout">
        <AdminNav />
        <div>
          {children}
          <AdminTools className="d-lg-none mt-5" />
        </div>
      </div>
    </div>
  );
}
