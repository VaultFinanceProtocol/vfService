import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  isCatenaInstalled,
  isCatenaConnected,
  getCatenaAccounts,
  disconnectCatena,
  requestCatenaAccounts,
  formatAddress,
} from '@utils/catenaWallet';

export interface WalletContextType {
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Whether wallet is being connected */
  isConnecting: boolean;
  /** Connected wallet address */
  address: string | null;
  /** Formatted address for display */
  formattedAddress: string;
  /** Connect wallet function */
  connect: () => Promise<void>;
  /** Disconnect wallet function */
  disconnect: () => Promise<void>;
  /** Whether Catena wallet is installed */
  isInstalled: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

export interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check if wallet is installed and connected on mount
  useEffect(() => {
    setMounted(true);
    
    const checkWallet = async () => {
      // Wait a bit for wallet extension to initialize
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const installed = isCatenaInstalled();
      setIsInstalled(installed);

      if (installed) {
        try {
          const connected = await isCatenaConnected();
          if (connected) {
            const accounts = await getCatenaAccounts();
            if (accounts.length > 0) {
              setAddress(accounts[0]);
              setIsConnected(true);
            }
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkWallet();
  }, []);

  const connect = async () => {
    if (!isCatenaInstalled()) {
      throw new Error('Catena Wallet is not installed');
    }

    setIsConnecting(true);
    try {
      // First check if already connected
      const accounts = await getCatenaAccounts();
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        return;
      }

      // Request connection
      const newAccounts = await requestCatenaAccounts();
      if (newAccounts.length > 0) {
        setAddress(newAccounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      if (isCatenaInstalled()) {
        await disconnectCatena();
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    } finally {
      setIsConnected(false);
      setAddress(null);
    }
  };

  const value: WalletContextType = {
    isConnected,
    isConnecting,
    address,
    formattedAddress: formatAddress(address),
    connect,
    disconnect,
    isInstalled,
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <WalletContext.Provider
        value={{
          isConnected: false,
          isConnecting: false,
          address: null,
          formattedAddress: '',
          connect: async () => {},
          disconnect: async () => {},
          isInstalled: false,
        }}
      >
        {children}
      </WalletContext.Provider>
    );
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
