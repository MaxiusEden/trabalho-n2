import Link from 'next/link';

/** Mostrado em `/admin` para quem está logado sem o perfil ADMIN. A API também recusa (403). */
export function AccessDenied() {
  return (
    <div>
      <h1 className="admin-title">Acesso negado</h1>
      <p className="text-muted mb-4">
        A administração é só para contas com perfil de administrador. A sua conta pode ver os
        cursos e se matricular.
      </p>
      <Link href="/" className="btn btn-primary">
        Ver os cursos
      </Link>
    </div>
  );
}
