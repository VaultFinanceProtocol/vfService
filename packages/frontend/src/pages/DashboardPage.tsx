import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { TrendingUp, Wallet, PiggyBank, BarChart3, ArrowRight } from "lucide-react";
import { useProtocolStats } from "@hooks/useProtocol";
import { usePools } from "@hooks/usePools";
import { formatUSD } from "@utils/format";
import { Link } from "react-router-dom";

export function DashboardPage() {
  const { stats, isLoading: statsLoading } = useProtocolStats();
  const { pools, isLoading: poolsLoading } = usePools(0, 5);

  const isLoading = statsLoading || poolsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          VaultFinance lending protocol overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : formatUSD(stats?.totalValueLocked)}
            </div>
            <p className="text-xs text-muted-foreground">Protocol TVL</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supplied</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : formatUSD(stats?.totalSupplied)}
            </div>
            <p className="text-xs text-muted-foreground">Across all pools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : formatUSD(stats?.totalBorrowed)}
            </div>
            <p className="text-xs text-muted-foreground">Active loans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pools</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.poolCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Available markets</p>
          </CardContent>
        </Card>
      </div>

      {/* Markets Overview */}
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top Markets</CardTitle>
          <Link to="/markets">
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : pools.length > 0 ? (
            <div className="space-y-2">
              {pools.map((pool) => (
                <Link
                  key={pool.asset}
                  to={`/markets/${pool.asset}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                      {pool.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium">{pool.symbol}</div>
                      <div className="text-sm text-muted-foreground">{pool.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">
                      {(parseFloat(pool.supplyAPY) * 100).toFixed(2)}% APY
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${(parseFloat(pool.totalSupplied) / 1e8 * (pool.symbol === 'BTC' ? 65000 : pool.symbol === 'USDT' ? 1 : 0.1)).toLocaleString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No markets available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
