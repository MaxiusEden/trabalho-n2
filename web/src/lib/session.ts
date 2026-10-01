'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  clearBrowserToken,
  decodeToken,
  readBrowserToken,
  subscribeToken,
  writeBrowserToken,
  type Role,
} from './token';

/**
 * Quem está logado, segundo o token: `id` é o `sub` do JWT. O `role` serve só
 * para a interface (mostrar ou esconder); quem barra de verdade é a API.
 */
export type SessionUser = {
  id: number;
  email: string;
  role: Role;
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
    return payload ? { id: payload.sub, email: payload.email, role: payload.role } : null;
  }, [token]);

  const signIn = useCallback((accessToken: string) => writeBrowserToken(accessToken), []);
  const signOut = useCallback(() => clearBrowserToken(), []);

  return { user, signIn, signOut };
}
