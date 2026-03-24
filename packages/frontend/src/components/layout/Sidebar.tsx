import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Wallet, TrendingUp, TrendingDown, AlertTriangle, History } from 'lucide-react';
import { cn } from '@lib/utils';

const navItems = [
  { icon: BarChart3, label: 'Markets', path: '/markets' },
  { icon: TrendingUp, label: 'Earn', path: '/earn' },
  { icon: TrendingDown, label: 'Borrow', path: '/borrow' },
  { icon: Wallet, label: 'My Positions', path: '/positions' },
  { icon: AlertTriangle, label: 'Liquidations', path: '/liquidations' },
  { icon: History, label: 'History', path: '/history' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside
      className="w-64 min-h-[calc(100vh-64px)] border-r p-4"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border)',
      }}
    >
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path)) ||
            (item.path === '/markets' && location.pathname === '/');

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-fast',
                isActive
                  ? 'font-semibold'
                  : 'hover:opacity-80'
              )}
              style={{
                backgroundColor: isActive ? 'var(--primary-muted)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--fg-muted)',
              }}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
