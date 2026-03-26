import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { ThemeToggle } from '@components/theme/theme-toggle';
import { WalletButton } from '@components/wallet/WalletButton';
import { cn } from '@lib/utils';

const navItems = [
  { label: 'Markets', path: '/markets' },
  { label: 'Earn', path: '/earn' },
  { label: 'Borrow', path: '/borrow' },
  { label: 'Positions', path: '/positions' },
  { label: 'Liquidations', path: '/liquidations' },
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
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background-secondary/95 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/markets" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary text-white font-bold text-sm transition-all duration-200 group-hover:scale-105">
                VF
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold tracking-tight text-foreground">
                  VaultFinance
                </h1>
                <p className="text-2xs -mt-0.5 font-medium text-foreground-secondary">
                  DeFi Lending Protocol
                </p>
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
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      active
                        ? 'text-primary bg-primary-light'
                        : 'text-foreground-secondary hover:text-foreground hover:bg-background-tertiary'
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
                className="lg:hidden h-10 w-10 text-foreground-secondary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={cn(
            'lg:hidden border-t border-border overflow-hidden transition-all duration-300 ease-out bg-background-secondary',
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
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    active
                      ? 'text-primary bg-primary-light'
                      : 'text-foreground-secondary hover:text-foreground hover:bg-background-tertiary'
                  )}
                >
                  <span>{item.label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
            <div className="pt-3 mt-3 border-t border-border flex items-center gap-3">
              <div className="flex-1">
                <WalletButton />
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background-secondary/95 backdrop-blur-xl safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 5).map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[64px]',
                  active ? 'text-primary' : 'text-foreground-secondary'
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
