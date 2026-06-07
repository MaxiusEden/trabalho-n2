import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, Map, User, CreditCard, FolderOpen, BookOpenCheck, LogOut, LogIn, LayoutDashboard } from 'lucide-react';
import { isAdmin, getLoggedUser } from '../services/api';

export const Sidebar = () => {
  const user = getLoggedUser();
  const showAdmin = isAdmin();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <div className="d-flex flex-column bg-dark p-3 text-white vh-100 flex-shrink-0" style={{ width: '250px' }}>
      {/* Logo / Título */}
      <Link to="/" className="d-flex align-items-center gap-2 text-white text-decoration-none mb-4 px-2">
        <BookOpen size={28} />
        <span className="fs-4 fw-bold">Perero Cursos</span>
      </Link>

      <hr className="my-0 mb-3" />

      {/* Navegação Principal */}
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item mb-1">
          <Link to="/" className={`nav-link text-white d-flex align-items-center gap-2 ${isActive('/')}`}>
            <Home size={18} /> Início
          </Link>
        </li>
        <li className="nav-item mb-1">
          <Link to="/cursos" className={`nav-link text-white d-flex align-items-center gap-2 ${isActive('/cursos')}`}>
            <LayoutDashboard size={18} /> Cursos
          </Link>
        </li>
        <li className="nav-item mb-1">
          <Link to="/trilhas" className={`nav-link text-white d-flex align-items-center gap-2 ${isActive('/trilhas')}`}>
            <Map size={18} /> Trilhas
          </Link>
        </li>

        {user && (
          <>
            <hr className="my-2" />
            <li className="nav-item mb-1">
              <Link to="/dashboard" className={`nav-link text-warning d-flex align-items-center gap-2 ${isActive('/dashboard')}`}>
                <User size={18} /> Área do Aluno
              </Link>
            </li>
            <li className="nav-item mb-1">
              <Link to="/checkout" className={`nav-link text-white d-flex align-items-center gap-2 ${isActive('/checkout')}`}>
                <CreditCard size={18} /> Minha Assinatura
              </Link>
            </li>
          </>
        )}

        {showAdmin && (
          <>
            <hr className="my-2" />
            <small className="text-muted d-block mb-2 px-3 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>Administração</small>
            <li className="nav-item mb-1">
              <Link to="/admin/categorias" className={`nav-link text-info d-flex align-items-center gap-2 ${isActive('/admin/categorias')}`}>
                <FolderOpen size={18} /> Categorias
              </Link>
            </li>
            <li className="nav-item mb-1">
              <Link to="/admin/cursos" className={`nav-link text-info d-flex align-items-center gap-2 ${isActive('/admin/cursos')}`}>
                <BookOpenCheck size={18} /> Cursos
              </Link>
            </li>
          </>
        )}
      </ul>

      {/* Footer: Login / Logout */}
      <hr />
      <div>
        {user ? (
          <button
            className="nav-link text-white bg-transparent border-0 w-100 text-start d-flex align-items-center gap-2"
            onClick={() => {
              localStorage.removeItem('loggedUser');
              window.location.href = '/login';
            }}
          >
            <LogOut size={18} />
            Sair ({user.nomeCompleto})
          </button>
        ) : (
          <Link to="/login" className="nav-link text-white d-flex align-items-center gap-2">
            <LogIn size={18} /> Login
          </Link>
        )}
      </div>
    </div>
  );
};
