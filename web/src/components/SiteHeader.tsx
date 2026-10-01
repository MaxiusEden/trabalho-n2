'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { BookOpen, Menu, X } from 'lucide-react';
import { useSession } from '@/lib/session';

type NavItem = { href: string; label: string; match: (path: string) => boolean };

const NAV: NavItem[] = [
  { href: '/', label: 'Cursos', match: (path) => path === '/' || path.startsWith('/curso/') },
  { href: '/categorias', label: 'Categorias', match: (path) => path.startsWith('/categorias') },
  { href: '/trilhas', label: 'Trilhas', match: (path) => path.startsWith('/trilhas') },
];

/** Só aparece para ADMIN. Esconder o link é conveniência: quem barra é a API (403). */
const ADMIN_NAV: NavItem = {
  href: '/admin/usuarios',
  label: 'Administração',
  match: (path) => path.startsWith('/admin'),
};

/** Barra única de navegação. Abaixo de `md` os links vão para um menu recolhível. */
export function SiteHeader() {
  const pathname = usePathname();
  const { user, signOut } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // Sem o token, as páginas de /admin mandam para o login na nova renderização.
  function handleSignOut() {
    signOut();
    setMenuOpen(false);
    router.refresh();
  }

  const items = user?.role === 'ADMIN' ? [...NAV, ADMIN_NAV] : NAV;

  const links = (
    <ul className="site-nav">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={item.match(pathname) ? 'page' : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  const account = user ? (
    <>
      <span className="small text-muted text-truncate">{user.email}</span>
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleSignOut}>
        Sair
      </button>
    </>
  ) : (
    <Link href="/login" className="btn btn-sm btn-primary" onClick={() => setMenuOpen(false)}>
      Entrar
    </Link>
  );

  return (
    <header className="site-header">
      <div className="container">
        <div className="site-header__bar">
          <Link href="/" className="site-logo" onClick={() => setMenuOpen(false)}>
            <BookOpen size={22} aria-hidden="true" />
            Perero Cursos
          </Link>

          <nav className="d-none d-md-block" aria-label="Principal">
            {links}
          </nav>
          <div className="site-account d-none d-md-flex">{account}</div>

          <button
            type="button"
            className="btn btn-outline-secondary site-menu-button d-md-none"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="site-mobile-nav"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>

        {menuOpen && (
          <div id="site-mobile-nav" className="site-mobile-nav d-md-none">
            <nav aria-label="Principal">{links}</nav>
            <div className="d-flex align-items-center gap-3 mt-2">{account}</div>
          </div>
        )}
      </div>
    </header>
  );
}
