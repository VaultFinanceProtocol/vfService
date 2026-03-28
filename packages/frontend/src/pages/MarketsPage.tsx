import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { usePools } from "@hooks/usePools";
import { useProtocolStats } from "@hooks/useProtocol";
import { formatUSD, formatAPY } from "@utils/format";
import { cn } from "@lib/utils";
import { X, TrendingUp } from "lucide-react";
import { AssetIcon } from "@components/protocol/asset-icon";
import { APYBadge } from "@components/protocol/apy-badge";
import { StatCard } from "@components/protocol/stat-card";

const ASSET_PRICES: Record<string, number> = {
  '0000000000000000000000000000000000000000000000000000000000000000': 3500,
  'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456': 1,
  'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1': 1,
  'c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1b2': 1,
  'd4e5f6789012345678901234567890abcdef1234567890abcdef123456a1b2c3': 3500,
};

const MOCK_ASSETS = [
  {
    asset: '0000000000000000000000000000000000000000000000000000000000000000',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    totalSupplied: '1250000000000000000000',
    liquidity: '950000000000000000000',
    supplyAPY: '0.0319',
    borrowAPY: '0.0528',
    canCollateral: true,
  },
  {
    asset: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    totalSupplied: '4500000000000',
    liquidity: '3800000000000',
    supplyAPY: '0.0245',
    borrowAPY: '0.0472',
    canCollateral: true,
  },
  {
    asset: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    totalSupplied: '3800000000000',
    liquidity: '2900000000000',
    supplyAPY: '0.0267',
    borrowAPY: '0.0512',
    canCollateral: false,
  },
  {
    asset: 'c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1b2',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    totalSupplied: '2100000000000000000000000',
    liquidity: '1750000000000000000000000',
    supplyAPY: '0.0218',
    borrowAPY: '0.0435',
    canCollateral: true,
  },
  {
    asset: 'd4e5f6789012345678901234567890abcdef1234567890abcdef123456a1b2c3',
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    decimals: 18,
    totalSupplied: '890000000000000000000',
    liquidity: '720000000000000000000',
    supplyAPY: '0.0302',
    borrowAPY: '0.0498',
    canCollateral: true,
  },
];

// Operation Modal Component
function OperationModal({ isOpen, onClose, pool, operation }: any) {
  const [amount, setAmount] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [useAsCollateral, setUseAsCollateral] = useState(true);
  
  if (!isOpen || !pool) return null;

  const isSupply = operation === 'supply';
  const apy = isSupply ? pool.supplyAPY : pool.borrowAPY;
  const colorClass = isSupply ? 'text-buy' : 'text-brand';
  const buttonColor = isSupply ? 'bg-buy hover:bg-buy/90' : 'bg-brand hover:bg-brand/90';

  const handlePreview = () => {
    if (amount) setShowPreview(true);
  };

  const resetAndClose = () => {
    setAmount("");
    setShowPreview(false);
    setUseAsCollateral(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={resetAndClose} />
      <div className="relative z-10 w-full max-w-md bg-background-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isSupply ? 'Supply' : 'Borrow'} {pool.symbol}
            </h2>
            <p className="text-sm text-foreground-muted">
              {isSupply ? 'Supply to earn yield' : 'Borrow against your collateral'}
            </p>
          </div>
          <button onClick={resetAndClose} className="p-2 rounded-lg hover:bg-background-elevated transition-colors">
            <X className="h-5 w-5 text-foreground-muted" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Asset Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-background-elevated">
            <AssetIcon symbol={pool.symbol} className="w-12 h-12" />
            <div>
              <div className="font-semibold text-foreground">{pool.name}</div>
              <div className="text-sm text-foreground-muted">{pool.symbol}</div>
            </div>
            <div className="ml-auto text-right">
              <div className={cn("font-bold", colorClass)}>{formatAPY(apy)}</div>
              <div className="text-xs text-foreground-muted">{isSupply ? 'Supply APY' : 'Borrow APY'}</div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Amount</label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                step="0.000001"
                placeholder="0.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setShowPreview(false); }}
                className="h-14 pr-20 text-xl font-semibold rounded-xl border-border focus:border-brand bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-foreground-muted">
                {pool.symbol}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-foreground-muted">Balance: 0.00</span>
              <button className="font-medium text-buy hover:underline">MAX</button>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {['25%', '50%', '75%', '100%'].map((pct) => (
              <button
                key={pct}
                onClick={() => setAmount('1000')}
                className="py-2 text-sm font-medium rounded-lg bg-background-elevated hover:bg-background-hover text-foreground-muted transition-colors"
              >
                {pct}
              </button>
            ))}
          </div>

          {/* Collateral Toggle - Only for Supply */}
          {isSupply && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-background-elevated border border-border">
              <div>
                <div className="font-medium text-foreground">Use as Collateral</div>
                <div className="text-xs text-foreground-muted">Enable to borrow against this asset</div>
              </div>
              <button
                onClick={() => setUseAsCollateral(!useAsCollateral)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  useAsCollateral ? "bg-brand" : "bg-background-hover"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    useAsCollateral ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          )}

          {/* Preview Button or Quote Preview */}
          {!showPreview ? (
            <button
              onClick={handlePreview}
              disabled={!amount || parseFloat(amount) <= 0}
              className={cn(
                "w-full h-12 rounded-xl font-semibold text-white transition-all",
                buttonColor,
                (!amount || parseFloat(amount) <= 0) && "opacity-50 cursor-not-allowed"
              )}
            >
              {!amount || parseFloat(amount) <= 0 ? 'Enter amount' : `Preview ${isSupply ? 'Supply' : 'Borrow'}`}
            </button>
          ) : (
            <div className="space-y-4">
              {/* Quote Preview Card */}
              <div className="p-4 rounded-xl bg-background-elevated border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-muted">You {isSupply ? 'Supply' : 'Borrow'}</span>
                  <span className="font-semibold text-foreground">{amount} {pool.symbol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-muted">{isSupply ? 'Supply APY' : 'Borrow APY'}</span>
                  <span className={cn("font-semibold", colorClass)}>{formatAPY(apy)}</span>
                </div>
                {isSupply && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground-muted">Collateral</span>
                    <span className={cn("font-medium", useAsCollateral ? "text-buy" : "text-foreground-muted")}>
                      {useAsCollateral ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-muted">Estimated Fee</span>
                  <span className="font-medium text-foreground">~0.001 ETH</span>
                </div>
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total {isSupply ? 'Value' : 'Debt'}</span>
                  <span className="font-bold text-foreground">${(parseFloat(amount || '0') * 3500).toFixed(2)}</span>
                </div>
              </div>

              <button
                className={cn(
                  "w-full h-12 rounded-xl font-semibold text-white transition-all",
                  buttonColor
                )}
              >
                Confirm {isSupply ? 'Supply' : 'Borrow'}
              </button>
            </div>
          )}

          {/* Info */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-brand/10">
            <TrendingUp className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
            <p className="text-xs text-brand">
              {isSupply 
                ? 'Supplying assets earns you passive yield while maintaining borrowing power.'
                : 'Borrowing requires collateral. Monitor your health factor to avoid liquidation.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MarketsPage() {
  const { pools: fetchedPools, isLoading } = usePools(0, 100);
  const { stats, isLoading: statsLoading } = useProtocolStats();
  const pools = fetchedPools.length > 0 ? fetchedPools : MOCK_ASSETS;
  const isPageLoading = isLoading && fetchedPools.length === 0;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [operation, setOperation] = useState<'supply' | 'borrow'>('supply');

  const openModal = (pool: any, op: 'supply' | 'borrow') => {
    setSelectedPool(pool);
    setOperation(op);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Markets</h1>
        <p className="text-foreground-muted mt-1">Browse all available lending markets and earn yields</p>
      </div>

      {/* Protocol Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Value Locked" value={isPageLoading ? "..." : formatUSD(stats?.totalValueLocked)} subtitle="Protocol TVL" />
        <StatCard title="Total Supplied" value={isPageLoading ? "..." : formatUSD(stats?.totalSupplied)} subtitle="Across all pools" trend="up" trendValue="12%" />
        <StatCard title="Total Borrowed" value={isPageLoading ? "..." : formatUSD(stats?.totalBorrowed)} subtitle="Active loans" />
        <StatCard title="Active Pools" value={isPageLoading ? "..." : pools.length} subtitle="Available markets" />
      </div>

      {/* Markets Table */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Markets</CardTitle>
            <div className="text-sm text-foreground-muted">{pools.length} assets available</div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Asset</th>
                  <th className="text-right py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider text-foreground-muted hidden sm:table-cell">Total Supplied</th>
                  <th className="text-right py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Supply APY</th>
                  <th className="text-right py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider text-foreground-muted hidden md:table-cell">Borrow APY</th>
                  <th className="text-right py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider text-foreground-muted hidden lg:table-cell">Liquidity</th>
                  <th className="text-center py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Action</th>
                </tr>
              </thead>
              <tbody>
                {pools.map((pool, index) => {
                  const price = ASSET_PRICES[pool.asset] || 0;
                  const suppliedUSD = (parseFloat(pool.totalSupplied) / 10 ** pool.decimals) * price;
                  const liquidityUSD = (parseFloat(pool.liquidity) / 10 ** pool.decimals) * price;
                  return (
                    <tr key={pool.asset} className="group border-b border-border transition-colors hover:bg-background-hover">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <AssetIcon symbol={pool.symbol} className="w-10 h-10 text-sm flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground">{pool.symbol}</div>
                            <div className="text-sm text-foreground-muted hidden sm:block">{pool.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4 sm:px-6 hidden sm:table-cell">
                        <div className="font-medium text-foreground">{formatUSD(suppliedUSD)}</div>
                      </td>
                      <td className="text-right py-4 px-4 sm:px-6">
                        <APYBadge value={parseFloat(pool.supplyAPY)} type="supply" size="sm" />
                      </td>
                      <td className="text-right py-4 px-4 sm:px-6 hidden md:table-cell">
                        <APYBadge value={parseFloat(pool.borrowAPY)} type="borrow" size="sm" />
                      </td>
                      <td className="text-right py-4 px-4 sm:px-6 hidden lg:table-cell">
                        <div className="font-medium text-foreground">{formatUSD(liquidityUSD)}</div>
                      </td>
                      <td className="text-center py-4 px-4 sm:px-6">
                        <div className="flex items-center justify-center gap-2">
                          <Button size="sm" variant="buy" className="rounded-lg font-medium" onClick={() => openModal(pool, 'supply')}>Supply</Button>
                          <Button size="sm" variant="outline" className="rounded-lg font-medium" onClick={() => openModal(pool, 'borrow')}>Borrow</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Operation Modal */}
      <OperationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} pool={selectedPool} operation={operation} />
    </div>
  );
}
