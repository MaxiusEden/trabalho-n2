'use client';

/**
 * Erro ao montar uma página. O caso comum é a API NestJS fora do ar: a
 * mensagem do `api-client` diz o endereço que ele tentou.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Não foi possível carregar a página</h1>
        <p className="page-lead">{error.message}</p>
      </header>
      <button type="button" className="btn btn-primary" onClick={() => retry()}>
        Tentar de novo
      </button>
    </div>
  );
}
