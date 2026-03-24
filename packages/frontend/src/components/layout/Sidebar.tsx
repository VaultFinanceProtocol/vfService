import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Wallet, AlertTriangle, History } from 'lucide-react';
import { cn } from '@lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: BarChart3, label: 'Markets', path: '/markets' },
  { icon: Wallet, label: 'My Positions', path: '/positions' },
  { icon: AlertTriangle, label: 'Liquidations', path: '/liquidations' },
  { icon: History, label: 'History', path: '/history' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-[calc(100vh-64px)] border-r bg-card p-4">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
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
