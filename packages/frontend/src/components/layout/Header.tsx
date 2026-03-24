import { Wallet, Bell, Settings } from 'lucide-react';
import { Button } from '@components/ui/Button';

export function Header() {
  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">VF</span>
        </div>
        <h1 className="text-xl font-bold">VaultFinance</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        <Button className="gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </div>
    </header>
  );
}
