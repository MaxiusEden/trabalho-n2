'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  clearBrowserToken,
  decodeToken,
  readBrowserToken,
  subscribeToken,
  writeBrowserToken,
} from './token';

/** Quem está logado, segundo o token: `id` é o `sub` do JWT. */
export type SessionUser = {
  id: number;
  email: string;
};

function getServerSnapshot(): string | null {
  return null;
}

export type SessionValue = {
  user: SessionUser | null;
  signIn: (accessToken: string) => void;
  signOut: () => void;
};

/**
 * Sessão do navegador. Guarda só o `access_token` do Nest (ver `token.ts`);
 * o usuário é lido do próprio token. Sair é apagar o token.
 *
 * O cookie é uma fonte externa ao React, então é lido com
 * `useSyncExternalStore`. Na renderização do servidor o snapshot é `null`, e o
 * valor real entra logo após a hidratação, sem divergência de HTML.
 */
export function useSession(): SessionValue {
  const token = useSyncExternalStore(subscribeToken, readBrowserToken, getServerSnapshot);

  const user = useMemo<SessionUser | null>(() => {
    const payload = token ? decodeToken(token) : null;
    return payload ? { id: payload.sub, email: payload.email } : null;
  }, [token]);

  const signIn = useCallback((accessToken: string) => writeBrowserToken(accessToken), []);
  const signOut = useCallback(() => clearBrowserToken(), []);

  return { user, signIn, signOut };
}
