import { AdminNav } from '@/components/admin/AdminNav';

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <div className="container">
      <div className="admin-layout">
        <AdminNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
