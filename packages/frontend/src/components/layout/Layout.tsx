import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ 
        backgroundColor: 'var(--bg)',
        backgroundImage: `radial-gradient(circle at 100% 0%, var(--primary-subtle) 0%, transparent 50%),
                          radial-gradient(circle at 0% 100%, var(--primary-subtle) 0%, transparent 50%)`,
      }}
    >
      <Header />
      <main 
        className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-28 lg:pb-8"
        style={{ color: 'var(--fg)' }}
      >
        <div className="max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
