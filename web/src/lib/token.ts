/**
 * O `access_token` devolvido pelo `POST /auth/login` do Nest fica num cookie, e
 * não no localStorage, porque as páginas são server components: o cookie vai
 * junto em toda navegação e o servidor do Next consegue repassar o token ao Nest.
 *
 * O cookie é gravado pelo JavaScript da página, então não é `httpOnly`. A
 * proteção não depende dele: o token é assinado com o `JWT_SECRET` e quem
 * confere é o Nest. Alterar o cookie só faz a API responder 401.
 */
export const TOKEN_COOKIE = 'perero_token';

export type Role = 'USER' | 'ADMIN';

/** O que o `AuthService.login` do Nest põe no token, mais o `exp` do `expiresIn: '1h'`. */
export type TokenPayload = { sub: number; email: string; role: Role; exp: number };

/** Lê o payload sem conferir a assinatura (isso é papel do Nest). Token vencido vira `null`. */
export function decodeToken(token: string): TokenPayload | null {
  const [, encoded] = token.split('.');
  if (!encoded) return null;
  try {
    const part = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(part), (char) => char.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as TokenPayload;
    if (typeof payload.sub !== 'number' || typeof payload.exp !== 'number') return null;
    return payload.exp * 1000 > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

// Avisa a sessão (`useSession`) quando o token muda nesta aba.
const listeners = new Set<() => void>();

export function subscribeToken(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Token do navegador; no servidor é sempre `null` (lá o token vem de `cookies()`). */
export function readBrowserToken(): string | null {
  if (typeof document === 'undefined') return null;
  const entry = document.cookie.split('; ').find((item) => item.startsWith(`${TOKEN_COOKIE}=`));
  if (!entry) return null;
  const token = decodeURIComponent(entry.slice(TOKEN_COOKIE.length + 1));
  return decodeToken(token) ? token : null;
}

/** Grava o token com a mesma validade dele, para o cookie não sobreviver ao JWT. */
export function writeBrowserToken(token: string) {
  const payload = decodeToken(token);
  if (!payload) return;
  const maxAge = Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`;
  for (const listener of listeners) listener();
}

export function clearBrowserToken() {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`;
  for (const listener of listeners) listener();
}
