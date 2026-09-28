'use client';

import { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

/** Porte do `App.tsx` do trabalho-n2: sidebar retrátil + navbar + conteúdo. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Em telas largas a sidebar já sai visível do servidor via `d-lg-flex`
  // (sem JS, sem flash). O botão só existe abaixo de lg (`d-lg-none` no
  // Navbar); esta checagem é defensiva contra clique disparado nesse
  // intervalo de resize.
  function toggleSidebar() {
    if (window.matchMedia('(min-width: 992px)').matches) return;
    setIsSidebarOpen((open) => !open);
  }

  return (
    <div className="d-flex vh-100 bg-light overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="d-flex flex-column flex-grow-1 overflow-auto">
        <Navbar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <main className="p-3">{children}</main>
      </div>
    </div>
  );
}
