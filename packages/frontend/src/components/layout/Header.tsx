import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { ThemeToggle } from '@components/theme/theme-toggle';
import { WalletButton } from '@components/wallet/WalletButton';
import { cn } from '@lib/utils';

const navItems = [
  { label: 'Markets', path: '/markets' },
  { label: 'Positions', path: '/positions' },
  { label: 'History', path: '/history' },
];

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/markets') {
      return location.pathname === path || location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background-page/95 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/markets" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-sm transition-transform duration-150 group-hover:scale-105">
                VF
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold tracking-tight text-foreground">
                  VaultFinance
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                      active
                        ? 'text-brand bg-brand-light'
                        : 'text-foreground-secondary hover:text-foreground hover:bg-background-hover'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <WalletButton />
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-foreground-secondary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'lg:hidden border-t border-border overflow-hidden transition-all duration-200 bg-background-page',
            mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'text-brand bg-brand-light'
                      : 'text-foreground-secondary hover:text-foreground hover:bg-background-hover'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background-page/95 backdrop-blur-md pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]',
                  active ? 'text-brand' : 'text-foreground-secondary'
                )}
              >
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
