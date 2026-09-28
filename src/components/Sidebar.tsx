'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
}

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/trilhas', label: 'Trilhas' },
] as const;

const ADMIN_NAV = [
  { href: '/admin/usuarios', label: 'Usuários' },
  { href: '/admin/cursos', label: 'Cursos' },
  { href: '/admin/trilhas', label: 'Trilhas' },
  { href: '/admin/matriculas', label: 'Matrículas' },
] as const;

export const Sidebar = ({ isOpen }: SidebarProps) => {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `nav-link text-white ${pathname === href ? 'active' : ''}`;

  return (
    <div
      className={`flex-column bg-dark p-3 text-white vh-100 overflow-auto d-lg-flex ${isOpen ? 'd-flex' : 'd-none'}`}
      style={{ width: '250px', minWidth: '250px' }}
    >
      <p className="text-center mb-4 fs-4">Painel</p>

      <ul className="nav nav-pills flex-column mb-3">
        {NAV.map((item) => (
          <li key={item.href} className="nav-item mb-2">
            <Link href={item.href} className={linkClass(item.href)}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <hr />

      <p className="text-uppercase text-white-50 small px-2 mb-2">Administração</p>
      <ul className="nav nav-pills flex-column mb-auto">
        {ADMIN_NAV.map((item) => (
          <li key={item.href} className="nav-item mb-2">
            <Link href={item.href} className={linkClass(item.href)}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <hr />
      <div>
        <a
          href="http://localhost:5555"
          className="nav-link text-white"
          target="_blank"
          rel="noreferrer"
        >
          Banco de dados
        </a>
        <Link href="/api" className="nav-link text-white">
          Documentação da API
        </Link>
        <Link href="/login" className="nav-link text-white">
          Login
        </Link>
      </div>
    </div>
  );
};
