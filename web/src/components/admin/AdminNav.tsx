'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useId } from 'react';
import { BookMarked, Database, FileText, GraduationCap, Route, Tags, Users } from 'lucide-react';
import { API_URL } from '@/lib/api-client';

const SECTIONS = [
  { href: '/admin/usuarios', label: 'Usuários', icon: Users },
  { href: '/admin/cursos', label: 'Cursos', icon: BookMarked },
  { href: '/admin/categorias', label: 'Categorias', icon: Tags },
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

/**
 * Links de apoio, separados das seções por uma linha: o Prisma Studio da `api/`
 * (`npm run db:studio`, porta 5555) e o Swagger do Nest.
 */
export function AdminTools({ className = '' }: { className?: string }) {
  // O componente aparece duas vezes (lateral e pé da página); o id da dica não pode repetir.
  const studioHintId = useId();

  return (
    <nav aria-label="Ferramentas" className={`admin-tools ${className}`}>
      <ul className="admin-nav__list">
        <li>
          <a
            href="http://localhost:5555"
            target="_blank"
            rel="noreferrer"
            aria-describedby={studioHintId}
          >
            <Database size={16} aria-hidden="true" />
            Banco de dados
          </a>
          <p id={studioHintId} className="admin-tools__hint">
            Antes, rode <code>npm run db:studio</code> em <code>api/</code>.
          </p>
        </li>
        <li>
          <a href={`${API_URL}/api`} target="_blank" rel="noreferrer">
            <FileText size={16} aria-hidden="true" />
            Documentação da API
          </a>
        </li>
      </ul>
    </nav>
  );
}
