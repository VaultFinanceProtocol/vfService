// Catena Wallet types
// Reference: https://docs.opcatlabs.io/api/opcat-wallet

declare global {
  interface Window {
    opcat?: {
      /** Get connected accounts */
      getAccounts(): Promise<string[]>;
      /** Request user to connect their wallet */
      requestAccounts(): Promise<string[]>;
      /** Disconnect wallet */
      disconnect(): Promise<void>;
      /** Get current network */
      getNetwork(): Promise<{ network: string }>;
      /** Switch network */
      switchNetwork(network: string): Promise<void>;
      /** Sign message */
      signMessage(message: string): Promise<string>;
      /** Sign transaction (PSBT) */
      signPsbt(psbt: string, options?: { autoFinalized?: boolean }): Promise<string>;
      /** Sign multiple transactions (PSBTs) */
      signPsbts(psbts: string[], options?: { autoFinalized?: boolean }[]): Promise<string[]>;
      /** Push transaction */
      pushTx(txHex: string): Promise<string>;
    };
  }
}

export {};
