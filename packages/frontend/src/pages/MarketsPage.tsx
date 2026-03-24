import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { usePools } from "@hooks/usePools";
import { formatUSD, formatAPY, formatAmount } from "@utils/format";
import { Link } from "react-router-dom";

const ASSET_PRICES: Record<string, number> = {
  '0000000000000000000000000000000000000000000000000000000000000000': 65000,
  'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456': 1,
  'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1': 0.1,
};

export function MarketsPage() {
  const { pools, isLoading } = usePools(0, 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Markets</h2>
          <p className="text-muted-foreground">
            Browse all available lending markets
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Markets</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading markets...
            </div>
          ) : pools.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Asset</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total Supplied</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Supply APY</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Borrow APY</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Utilization</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Liquidity</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pools.map((pool) => {
                    const price = ASSET_PRICES[pool.asset] || 0;
                    const suppliedUSD = (parseFloat(pool.totalSupplied) / 10 ** pool.decimals) * price;
                    const liquidityUSD = (parseFloat(pool.liquidity) / 10 ** pool.decimals) * price;

                    return (
                      <tr key={pool.asset} className="border-b hover:bg-muted/50">
                        <td className="py-4 px-4">
                          <Link to={`/markets/${pool.asset}`} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                              {pool.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-medium">{pool.symbol}</div>
                              <div className="text-sm text-muted-foreground">{pool.name}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className="font-medium">{formatUSD(suppliedUSD)}</div>
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className="flex items-center justify-end gap-1 text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            {formatAPY(pool.supplyAPY)}
                          </div>
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className="flex items-center justify-end gap-1 text-orange-600">
                            <TrendingDown className="h-4 w-4" />
                            {formatAPY(pool.borrowAPY)}
                          </div>
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className="font-medium">{formatAPY(pool.utilization)}</div>
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className="font-medium">{formatUSD(liquidityUSD)}</div>
                        </td>
                        <td className="text-center py-4 px-4">
                          <Link to={`/markets/${pool.asset}`}>
                            <Button size="sm">View</Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No markets available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
