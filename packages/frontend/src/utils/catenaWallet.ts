// Catena Wallet utilities
// Reference: https://docs.opcatlabs.io/api/opcat-wallet

const CATENA_DOWNLOAD_URL = 'https://chromewebstore.google.com/detail/catena-wallet/jjjjbhackagenhoidaapdaloghfkckda';

/**
 * Check if Catena Wallet extension is installed
 */
export function isCatenaInstalled(): boolean {
  return typeof window.opcat !== 'undefined';
}

/**
 * Check if user has already connected their wallet
 */
export async function isCatenaConnected(): Promise<boolean> {
  if (!isCatenaInstalled()) {
    return false;
  }

  try {
    const accounts = await window.opcat!.getAccounts();
    return accounts.length > 0;
  } catch (error) {
    console.error('Error checking Catena connection:', error);
    return false;
  }
}

/**
 * Get connected accounts
 */
export async function getCatenaAccounts(): Promise<string[]> {
  if (!isCatenaInstalled()) {
    throw new Error('Catena Wallet is not installed');
  }

  return await window.opcat!.getAccounts();
}

/**
 * Request user to connect their wallet
 */
export async function requestCatenaAccounts(): Promise<string[]> {
  if (!isCatenaInstalled()) {
    throw new Error('Catena Wallet is not installed');
  }

  return await window.opcat!.requestAccounts();
}

/**
 * Disconnect wallet
 */
export async function disconnectCatena(): Promise<void> {
  if (!isCatenaInstalled()) {
    throw new Error('Catena Wallet is not installed');
  }

  return await window.opcat!.disconnect();
}

/**
 * Open Catena Wallet download page
 */
export function openCatenaDownloadPage(): void {
  window.open(CATENA_DOWNLOAD_URL, '_blank');
}

/**
 * Get Catena wallet object
 */
export function getCatenaObj(): NonNullable<typeof window.opcat> {
  if (!isCatenaInstalled()) {
    throw new Error('Catena Wallet is not installed');
  }
  return window.opcat!;
}

/**
 * Format address for display (shorten)
 */
export function formatAddress(address: string | null, chars = 6): string {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
