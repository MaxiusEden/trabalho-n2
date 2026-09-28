/** Aviso de lista vazia, com o próximo passo como link. */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="empty-state">
      <p>{children}</p>
    </div>
  );
}
