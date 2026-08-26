'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

export type SessionUser = {
  id: number;
  name: string | null;
  email: string;
};

const STORAGE_KEY = 'perero.user';

/**
 * O localStorage é uma fonte de dados externa ao React, então é lido com
 * `useSyncExternalStore`. Na renderização do servidor o snapshot é `null`, e o
 * valor real entra logo após a hidratação — sem divergência de HTML.
 */
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function getSnapshot(): string | null {
  return window.localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

export type SessionValue = {
  user: SessionUser | null;
  signIn: (user: SessionUser) => void;
  signOut: () => void;
};

/**
 * Guarda quem está usando a plataforma. É o mínimo necessário para a matrícula
 * saber a qual usuário ela pertence — não é um sistema de autenticação
 * (não há cookie de sessão nem token; as rotas da API não são protegidas).
 */
export function useSession(): SessionValue {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const user = useMemo<SessionUser | null>(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SessionUser;
    } catch {
      return null;
    }
  }, [raw]);

  const signIn = useCallback((next: SessionUser) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    notify();
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    notify();
  }, []);

  return { user, signIn, signOut };
}
