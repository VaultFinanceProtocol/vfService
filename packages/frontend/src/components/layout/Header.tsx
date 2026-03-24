import { Wallet, Bell } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { ThemeToggle } from '@components/theme/theme-toggle';

export function Header() {
  return (
    <header
      className="h-16 px-6 flex items-center justify-between border-b"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-contrast)',
          }}
        >
          <span className="font-bold text-sm">VF</span>
        </div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--fg)' }}>
          VaultFinance
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-4 w-4" />
        </Button>
        <ThemeToggle />
        <Button
          className="gap-2 h-9"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-contrast)',
          }}
        >
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </div>
    </header>
  );
}
