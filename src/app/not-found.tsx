import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Página não encontrada</h1>
        <p className="page-lead">O endereço que você tentou acessar não existe ou foi removido.</p>
      </header>
      <Link href="/" className="btn btn-primary">
        Ver os cursos
      </Link>
    </div>
  );
}
