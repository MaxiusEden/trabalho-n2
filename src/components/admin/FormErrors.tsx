/** Lista de mensagens de erro vindas da API (validação, conflito, etc.). */
export function FormErrors({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;

  return (
    <div className="alert alert-danger">
      <ul className="mb-0 ps-3">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
