import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container">
      <header className="page-header">
        <p className="page-meta mt-0 mb-2">Erro 404</p>
        <h1 className="page-title">Página não encontrada</h1>
        <p className="page-lead">O endereço que você tentou acessar não existe ou foi removido.</p>
      </header>
      <Link href="/" className="btn btn-primary">
        Ver os cursos
      </Link>
    </div>
  );
}
