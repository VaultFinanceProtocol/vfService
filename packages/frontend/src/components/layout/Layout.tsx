import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6" style={{ color: 'var(--fg)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
