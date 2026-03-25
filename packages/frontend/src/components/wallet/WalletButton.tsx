import { Loader2 } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { useWallet } from '@contexts/wallet-context';
import { openCatenaDownloadPage } from '@utils/catenaWallet';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/Dialog';

export function WalletButton() {
  const { isConnected, isConnecting, formattedAddress, connect, disconnect, isInstalled } = useWallet();
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (isConnected) {
      await disconnect();
      return;
    }

    if (!isInstalled) {
      setShowInstallDialog(true);
      return;
    }

    setError(null);
    try {
      await connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };

  return (
    <>
      <Button
        className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: 'var(--gradient-primary)',
          color: 'white',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
        }}
        onClick={handleClick}
        disabled={isConnecting}
      >
        {isConnecting && <Loader2 className="h-4 w-4 animate-spin" />}
        <span className="hidden md:inline">
          {isConnected ? formattedAddress : 'Connect Wallet'}
        </span>
        <span className="md:hidden">
          {isConnected ? formattedAddress.slice(0, 6) : 'Connect'}
        </span>
      </Button>

      {/* Mobile Button */}
      <Button
        className="sm:hidden flex items-center gap-2 h-10 px-4 rounded-lg font-medium transition-all duration-200"
        style={{
          background: 'var(--gradient-primary)',
          color: 'white',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
        }}
        onClick={handleClick}
        disabled={isConnecting}
      >
        {isConnecting && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{isConnected ? formattedAddress.slice(0, 6) : 'Connect'}</span>
      </Button>

      {/* Install Dialog */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="sm:max-w-[400px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[var(--fg)]">Install Catena Wallet</DialogTitle>
            <DialogDescription className="text-[var(--fg-muted)]">
              Catena Wallet extension is required to connect your wallet
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <div className="p-4 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)]">
              <p className="text-sm text-[var(--fg-muted)]">
                Catena Wallet is a browser extension for Bitcoin and OPCAT assets. 
                Install it from the Chrome Web Store to continue.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-lg h-11"
                onClick={() => setShowInstallDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-lg h-11 font-medium"
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white',
                }}
                onClick={() => {
                  openCatenaDownloadPage();
                  setShowInstallDialog(false);
                }}
              >
                Install Wallet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={!!error} onOpenChange={() => setError(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[var(--danger)]">Connection Failed</DialogTitle>
            <DialogDescription className="text-[var(--fg-muted)]">
              {error}
            </DialogDescription>
          </DialogHeader>
          <Button
            className="w-full mt-4 rounded-lg h-11"
            onClick={() => setError(null)}
          >
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
