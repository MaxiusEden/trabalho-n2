/** Sessão vista pelo servidor do Next (server components). */
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { ApiError } from './api-client';
import { decodeToken, TOKEN_COOKIE } from './token';

/** Token do cookie, ou `/login` se não houver token válido. */
export async function requireToken(): Promise<string> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token || !decodeToken(token)) redirect('/login');
  return token;
}

/** Traduz o erro da API na resposta da página: 404 vira a página de não encontrado, 401 vai para o login. */
export function handlePageError(error: unknown): never {
  if (error instanceof ApiError) {
    if (error.status === 404) notFound();
    if (error.status === 401) redirect('/login');
  }
  throw error;
}
