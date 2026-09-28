import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-5 text-black mb-3">Página não encontrada</h1>
      <p className="lead text-muted mb-4">O endereço que você tentou acessar não existe.</p>
      <Link href="/" className="btn btn-primary">
        Voltar para a Home
      </Link>
    </div>
  );
}
