import { categoriesApi } from '@/lib/api';
import { handlePageError, requireAdminToken } from '@/lib/server-session';
import { AccessDenied } from '@/components/admin/AccessDenied';
import { CategoriesManager } from '@/components/admin/CategoriesManager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriasPage() {
  // Só ADMIN: a leitura é pública, mas criar, editar e excluir exigem o perfil.
  if (!(await requireAdminToken())) return <AccessDenied />;
  const categories = await categoriesApi.list().catch(handlePageError);

  return (
    <div>
      <h1 className="admin-title">Categorias</h1>
      <p className="text-muted mb-4">
        Agrupe cursos e trilhas por área. A categoria de cada curso e de cada trilha é escolhida
        no formulário deles.
      </p>

      <CategoriesManager categories={categories} />
    </div>
  );
}
