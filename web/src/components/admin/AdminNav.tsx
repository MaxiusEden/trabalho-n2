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

/**
 * Seções da área administrativa: coluna com ícones em telas largas, uma linha
 * compacta no celular. As ferramentas ficam logo abaixo só a partir de `lg`;
 * no celular elas vão para o pé da página (ver `AdminTools` no layout).
 */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <div>
      <nav aria-label="Administração">
        <ul className="admin-nav__list">
          {SECTIONS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} aria-current={pathname === href ? 'page' : undefined}>
                <Icon size={16} aria-hidden="true" className="d-none d-lg-inline" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <AdminTools className="d-none d-lg-block" />
    </div>
  );
}

/** Links de apoio (Prisma Studio e documentação da API), separados das seções por uma linha. */
export function AdminTools({ className = '' }: { className?: string }) {
  return (
    <nav aria-label="Ferramentas" className={`admin-tools ${className}`}>
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
