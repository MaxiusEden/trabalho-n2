'use client';

import Link from 'next/link';
import { BookOpen, Menu } from 'lucide-react';
import { useSession } from '@/lib/session';

interface NavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Navbar = ({ isSidebarOpen, onToggleSidebar }: NavbarProps) => {
  const { user, signOut } = useSession();

  return (
    <div className="d-flex justify-content-center align-items-center bg-dark p-3 mb-4 text-white w-100 position-relative">
      <button
        className="btn btn-dark position-absolute start-0 ms-3 d-lg-none"
        onClick={onToggleSidebar}
        aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={isSidebarOpen}
      >
        <Menu size={24} aria-hidden="true" />
      </button>
      <Link
        className="d-flex align-items-center gap-2 text-white text-decoration-none me-4 fs-4"
        href="/"
      >
        <BookOpen size={24} />
        Perero Cursos
      </Link>
      <ul className="nav">
        <li className="nav-item">
          <Link className="nav-link text-white" href="/">
            Cursos
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" href="/trilhas">
            Trilhas
          </Link>
        </li>
        {!user && (
          <li className="nav-item">
            <Link className="nav-link text-white" href="/login">
              Login
            </Link>
          </li>
        )}
      </ul>

      {user && (
        <div className="position-absolute end-0 me-3 d-flex align-items-center gap-2">
          <span className="small text-white-50 d-none d-md-inline">{user.name ?? user.email}</span>
          <button className="btn btn-sm btn-outline-light" onClick={signOut}>
            Sair
          </button>
        </div>
      )}
    </div>
  );
};
