export const siteConfig = {
  name: 'VaultFinance',
  defaultTitle: 'VaultFinance Lending Markets',
  defaultDescription:
    'Track VaultFinance lending markets, compare borrow and supply rates, review liquidity, and inspect collateral risk parameters.',
  defaultPath: '/markets',
} as const;

export function getSiteUrl() {
  const configuredUrl = import.meta.env.VITE_SITE_URL?.trim().replace(/\/+$/, '');

  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
}

export function buildAbsoluteUrl(path = '/') {
  const siteUrl = getSiteUrl();

  if (!siteUrl) {
    return '';
  }

  return new URL(path, `${siteUrl}/`).toString();
}
