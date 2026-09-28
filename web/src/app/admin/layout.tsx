import { AdminNav, AdminTools } from '@/components/admin/AdminNav';

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
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
