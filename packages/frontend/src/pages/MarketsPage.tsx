import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { usePools } from "@hooks/usePools";
import { useProtocolStats } from "@hooks/useProtocol";
import { formatUSD, formatAPY } from "@utils/format";
import { Link } from "react-router-dom";
import { cn } from "@lib/utils";

const ASSET_PRICES: Record<string, number> = {
  '0000000000000000000000000000000000000000000000000000000000000000': 65000,
  'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456': 1,
  'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1': 0.1,
};

// Asset icon with gradient background
function AssetIcon({ symbol, className }: { symbol: string; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center font-bold text-white shadow-lg",
        className
      )}
      style={{
        background: 'var(--gradient-primary)',
        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
      }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}

// Stats Card Component
function StatCard({ 
  title, 
  value, 
  subtitle, 
  trend,
  gradient = false,
  delay = 0 
}: { 
  title: string;
  value: string | number;
  subtitle: string;
  trend?: 'up' | 'down';
  gradient?: boolean;
  delay?: number;
}) {
  return (
    <Card 
      className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        gradient && "relative"
      )}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {gradient && (
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'var(--gradient-primary)' }}
        />
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-[var(--fg-muted)]">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold text-[var(--fg)]">{value}</div>
          {trend && (
            <span className={cn(
              "text-xs font-medium",
              trend === 'up' ? "text-[var(--success)]" : "text-[var(--danger)]"
            )}>
              {trend === 'up' ? '+' : '-'}{Math.floor(Math.random() * 10 + 1)}%
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--fg-muted)] mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export function MarketsPage() {
  const { pools, isLoading } = usePools(0, 100);
  const { stats, isLoading: statsLoading } = useProtocolStats();

  const isPageLoading = isLoading || statsLoading;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--fg)]">
            Markets
          </h1>
          <p className="text-[var(--fg-muted)] mt-1">
            Browse all available lending markets and earn yields
          </p>
        </div>
      </div>

      {/* Protocol Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Value Locked"
          value={isPageLoading ? "..." : formatUSD(stats?.totalValueLocked)}
          subtitle="Protocol TVL"
          gradient
          delay={0}
        />
        <StatCard
          title="Total Supplied"
          value={isPageLoading ? "..." : formatUSD(stats?.totalSupplied)}
          subtitle="Across all pools"
          trend="up"
          delay={50}
        />
        <StatCard
          title="Total Borrowed"
          value={isPageLoading ? "..." : formatUSD(stats?.totalBorrowed)}
          subtitle="Active loans"
          delay={100}
        />
        <StatCard
          title="Active Pools"
          value={isPageLoading ? "..." : stats?.poolCount || 0}
          subtitle="Available markets"
          delay={150}
        />
      </div>

      {/* Markets Table */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Markets</CardTitle>
            <div className="text-sm text-[var(--fg-muted)]">
              {pools.length} assets available
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-[var(--fg-muted)]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading markets...</span>
              </div>
            </div>
          ) : pools.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                      Asset
                    </th>
                    <th className="text-right py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] hidden sm:table-cell">
                      Total Supplied
                    </th>
                    <th className="text-right py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                      Supply APY
                    </th>
                    <th className="text-right py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] hidden md:table-cell">
                      Borrow APY
                    </th>
                    <th className="text-right py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] hidden lg:table-cell">
                      Liquidity
                    </th>
                    <th className="text-center py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pools.map((pool, index) => {
                    const price = ASSET_PRICES[pool.asset] || 0;
                    const suppliedUSD = (parseFloat(pool.totalSupplied) / 10 ** pool.decimals) * price;
                    const liquidityUSD = (parseFloat(pool.liquidity) / 10 ** pool.decimals) * price;

                    return (
                      <tr 
                        key={pool.asset} 
                        className="group border-b border-[var(--border)] transition-colors hover:bg-[var(--bg-hover)]"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="py-4 px-4 sm:px-6">
                          <Link to={`/markets/${pool.asset}`} className="flex items-center gap-3">
                            <AssetIcon 
                              symbol={pool.symbol} 
                              className="w-10 h-10 text-sm flex-shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors">
                                {pool.symbol}
                              </div>
                              <div className="text-sm text-[var(--fg-muted)] hidden sm:block">
                                {pool.name}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="text-right py-4 px-4 sm:px-6 hidden sm:table-cell">
                          <div className="font-medium text-[var(--fg)]">{formatUSD(suppliedUSD)}</div>
                        </td>
                        <td className="text-right py-4 px-4 sm:px-6">
                          <span className="font-semibold text-[var(--success)]">
                            {formatAPY(pool.supplyAPY)}
                          </span>
                        </td>
                        <td className="text-right py-4 px-4 sm:px-6 hidden md:table-cell">
                          <span className="font-medium text-[var(--warning)]">
                            {formatAPY(pool.borrowAPY)}
                          </span>
                        </td>
                        <td className="text-right py-4 px-4 sm:px-6 hidden lg:table-cell">
                          <div className="font-medium text-[var(--fg)]">{formatUSD(liquidityUSD)}</div>
                        </td>
                        <td className="text-center py-4 px-4 sm:px-6">
                          <Link to={`/markets/${pool.asset}`}>
                            <Button 
                              size="sm" 
                              className="rounded-lg font-medium transition-all hover:scale-105"
                              style={{
                                background: 'var(--gradient-primary)',
                                color: 'white',
                              }}
                            >
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-[var(--fg-muted)]">
              <div className="text-lg font-medium text-[var(--fg)]">No markets available</div>
              <p className="text-sm mt-1">Check back later for new pools</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="group overflow-hidden">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[var(--fg)] mb-1">Earn Yield</h3>
            <p className="text-sm text-[var(--fg-muted)] mb-4">
              Supply assets to earn passive income
            </p>
            <Link to="/earn">
              <Button 
                className="rounded-lg font-medium"
                style={{
                  background: 'var(--gradient-success)',
                  color: 'white',
                }}
              >
                Start Earning
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[var(--fg)] mb-1">Borrow Assets</h3>
            <p className="text-sm text-[var(--fg-muted)] mb-4">
              Use your collateral to borrow funds
            </p>
            <Link to="/borrow">
              <Button 
                className="rounded-lg font-medium"
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white',
                }}
              >
                Borrow Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
