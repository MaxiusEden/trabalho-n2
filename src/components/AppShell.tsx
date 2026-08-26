'use client';

import { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

/** Porte do `App.tsx` do trabalho-n2: sidebar retrátil + navbar + conteúdo. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="d-flex vh-100 bg-light">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="d-flex flex-column flex-grow-1 overflow-auto">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-3">{children}</main>
      </div>
    </div>
  );
}
