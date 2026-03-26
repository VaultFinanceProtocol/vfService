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
      {/* Desktop Button */}
      <Button
        variant="primary"
        className="hidden sm:flex items-center gap-2 h-10 px-4"
        onClick={handleClick}
        isLoading={isConnecting}
      >
        <span className="hidden md:inline">
          {isConnected ? formattedAddress : 'Connect Wallet'}
        </span>
        <span className="md:hidden">
          {isConnected ? formattedAddress.slice(0, 6) : 'Connect'}
        </span>
      </Button>

      {/* Mobile Button */}
      <Button
        variant="primary"
        className="sm:hidden flex items-center gap-2 h-10 px-4"
        onClick={handleClick}
        isLoading={isConnecting}
      >
        <span>{isConnected ? formattedAddress.slice(0, 6) : 'Connect'}</span>
      </Button>

      {/* Install Dialog */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Install Catena Wallet</DialogTitle>
            <DialogDescription>
              Catena Wallet extension is required to connect your wallet
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <div className="p-4 rounded-lg bg-background-tertiary border border-border">
              <p className="text-sm text-foreground-secondary">
                Catena Wallet is a browser extension for Bitcoin and OPCAT assets. 
                Install it from the Chrome Web Store to continue.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1 h-11"
                onClick={() => setShowInstallDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 h-11"
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
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-danger">Connection Failed</DialogTitle>
            <DialogDescription>
              {error}
            </DialogDescription>
          </DialogHeader>
          <Button
            variant="secondary"
            className="w-full mt-4 h-11"
            onClick={() => setError(null)}
          >
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
