/**
 * Cliente HTTP da API NestJS. É o único lugar do `web/` que chama `fetch`
 * (regra da costura): trocar o backend ou o jeito de autenticar mexe só aqui.
 *
 * Roda no navegador e no servidor do Next. No navegador o token sai do cookie
 * sozinho; no servidor a página passa o token lido de `cookies()`.
 */
import { clearBrowserToken, readBrowserToken } from './token';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly messages: string[],
  ) {
    super(messages[0] ?? 'Erro inesperado');
    this.name = 'ApiError';
  }
}

type ApiInit = Omit<RequestInit, 'body'> & {
  /** Corpo JSON. Mande só os campos do DTO: o Nest recusa campo a mais com 400. */
  json?: unknown;
  /** Token explícito, para chamadas feitas no servidor. */
  token?: string | null;
};

export async function apiFetch<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { json, token, ...rest } = init;
  const bearer = token ?? readBrowserToken();

  const headers = new Headers(rest.headers);
  if (json !== undefined) headers.set('Content-Type', 'application/json');
  if (bearer) headers.set('Authorization', `Bearer ${bearer}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers,
      body: json === undefined ? undefined : JSON.stringify(json),
      cache: 'no-store',
    });
  } catch {
    // `fetch` só rejeita quando não há resposta nenhuma: a API está fora do ar.
    throw new ApiError(0, [`Não foi possível falar com a API em ${API_URL}. O Nest está rodando?`]);
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    // Token vencido ou ausente numa rota protegida: volta para o login. No
    // login em si, 401 é só "senha errada" e a mensagem aparece no formulário.
    if (response.status === 401 && typeof window !== 'undefined' && path !== '/auth/login') {
      clearBrowserToken();
      // Fora de componente não há `useRouter`; e a recarga completa descarta o
      // estado das telas montadas com a sessão que acabou.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign('/login');
    }
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
