export function formatAmount(amount: string | number | undefined, decimals = 8): string {
  if (amount === undefined || amount === null) return '0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return (num / 10 ** decimals).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function formatUSD(amount: string | number | undefined): string {
  if (amount === undefined || amount === null) return '$0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatPercent(value: string | number | undefined): string {
  if (value === undefined || value === null) return '0.00%';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.00%';
  return `${(num * 100).toFixed(2)}%`;
}

export function formatAPY(value: string | number | undefined): string {
  if (value === undefined || value === null) return '0.00%';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.00%';
  return `${(num * 100).toFixed(2)}%`;
}

export function formatAddress(address: string | undefined, start = 6, end = 4): string {
  if (!address) return '';
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatHealthFactor(hf: string | undefined): { value: string; color: string } {
  if (!hf) return { value: '∞', color: 'text-green-500' };
  const num = parseFloat(hf);
  if (isNaN(num)) return { value: '∞', color: 'text-green-500' };

  if (num >= 1.5) return { value: num.toFixed(2), color: 'text-green-500' };
  if (num >= 1.1) return { value: num.toFixed(2), color: 'text-yellow-500' };
  if (num >= 1.0) return { value: num.toFixed(2), color: 'text-orange-500' };
  return { value: num.toFixed(2), color: 'text-red-500' };
}

export function formatLTV(ltv: number | undefined): string {
  if (ltv === undefined) return '0%';
  return `${(ltv / 100).toFixed(0)}%`;
}
