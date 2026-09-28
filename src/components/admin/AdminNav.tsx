'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookMarked, Database, FileText, GraduationCap, Route, Users } from 'lucide-react';

const SECTIONS = [
  { href: '/admin/usuarios', label: 'Usuários', icon: Users },
  { href: '/admin/cursos', label: 'Cursos', icon: BookMarked },
  { href: '/admin/trilhas', label: 'Trilhas', icon: Route },
  { href: '/admin/matriculas', label: 'Matrículas', icon: GraduationCap },
] as const;

/** Navegação da área administrativa: coluna em telas largas, linha com quebra no celular. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administração">
      <p className="admin-nav__title">Administração</p>
      <ul className="admin-nav__list">
        {SECTIONS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link href={href} aria-current={pathname === href ? 'page' : undefined}>
              <Icon size={16} aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <p className="admin-nav__title">Ferramentas</p>
      <ul className="admin-nav__list">
        <li>
          <a href="http://localhost:5555" target="_blank" rel="noreferrer">
            <Database size={16} aria-hidden="true" />
            Banco de dados
          </a>
        </li>
        <li>
          <Link href="/api">
            <FileText size={16} aria-hidden="true" />
            Documentação da API
          </Link>
        </li>
      </ul>
    </nav>
  );
}
