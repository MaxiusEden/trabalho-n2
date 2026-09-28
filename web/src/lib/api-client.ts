/** Cliente HTTP dos formulários. Traduz o corpo de erro da API em mensagens. */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly messages: string[],
  ) {
    super(messages[0] ?? 'Erro inesperado');
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers:
      init.body === undefined
        ? init.headers
        : { 'Content-Type': 'application/json', ...init.headers },
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, extractMessages(body));
  }

  return body as T;
}

function extractMessages(body: unknown): string[] {
  if (body && typeof body === 'object' && 'message' in body) {
    const { message } = body as { message: unknown };
    if (Array.isArray(message)) return message.map(String);
    if (typeof message === 'string') return [message];
  }
  return ['Não foi possível completar a operação'];
}

/** Extrai a lista de mensagens de qualquer erro capturado num formulário. */
export function toMessages(error: unknown): string[] {
  if (error instanceof ApiError) return error.messages;
  if (error instanceof Error) return [error.message];
  return ['Erro inesperado'];
}
