import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/Tabs";
import { Input } from "@components/ui/Input";
import { Switch } from "@components/ui/Switch";
import { Label } from "@components/ui/Label";
import { usePool } from "@hooks/usePools";
import { useQuote } from "@hooks/useQuotes";
import { formatUSD, formatAPY, formatAmount, formatLTV, formatHealthFactor } from "@utils/format";
import { ArrowLeft, Calculator, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@lib/utils";

const MOCK_USER = "user1234567890abcdef1234567890abcdef123456";
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

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  color = "primary",
  delay = 0 
}: { 
  title: string;
  value: React.ReactNode;
  color?: "primary" | "success" | "warning";
  delay?: number;
}) {
  const colorClasses = {
    primary: 'text-brand',
    success: 'text-buy',
    warning: 'text-sell',
  };

  return (
    <Card 
      className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="pt-6">
        <div className="text-xs text-foreground-muted uppercase tracking-wide mb-1">{title}</div>
        <div className={cn("text-2xl font-bold", colorClasses[color])}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

export function MarketDetailPage() {
  const { asset } = useParams<{ asset: string }>();
  const { pool, isLoading } = usePool(asset);

  const [activeTab, setActiveTab] = useState("supply");
  const [amount, setAmount] = useState("");
  const [useAsCollateral, setUseAsCollateral] = useState(true);

  const supplyQuote = useQuote("supply");
  const borrowQuote = useQuote("borrow");

  const handleGetQuote = async () => {
    if (!pool || !amount) return;

    const amountInSats = (parseFloat(amount) * 10 ** pool.decimals).toString();

    if (activeTab === "supply") {
      await supplyQuote.fetchQuote({
        userAddr: MOCK_USER,
        asset: pool.asset,
        amount: amountInSats,
        useAsCollateral,
      });
    } else {
      await borrowQuote.fetchQuote({
        userAddr: MOCK_USER,
        asset: pool.asset,
        amount: amountInSats,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-foreground-muted">Loading market data...</p>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-foreground-muted">
        <p className="text-lg font-medium text-foreground">Pool not found</p>
        <Link to="/markets">
          <Button className="mt-4 rounded-lg" variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Markets
          </Button>
        </Link>
      </div>
    );
  }

  const price = ASSET_PRICES[pool.asset] || 0;
  const liquidityUSD = (parseFloat(pool.liquidity) / 10 ** pool.decimals) * price;

  const currentQuote = activeTab === "supply" ? supplyQuote.quote : borrowQuote.quote;
  const isQuoteLoading = activeTab === "supply" ? supplyQuote.isLoading : borrowQuote.isLoading;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/markets">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-hover"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <AssetIcon symbol={pool.symbol} className="w-12 h-12 text-base" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                {pool.symbol}
              </h1>
              <p className="text-foreground-muted">{pool.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Liquidity"
          value={formatUSD(liquidityUSD)}
          delay={0}
        />
        <StatCard
          title="Supply APY"
          value={formatAPY(pool.supplyAPY)}
          color="success"
          delay={50}
        />
        <StatCard
          title="Borrow APY"
          value={formatAPY(pool.borrowAPY)}
          color="warning"
          delay={100}
        />
        <Card 
          className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
          style={{ animationDelay: '150ms' }}
        >
          <CardContent className="pt-6">
            <div className="text-xs text-foreground-muted uppercase tracking-wide mb-1">Utilization</div>
            <div className="text-2xl font-bold text-brand">
              {formatAPY(pool.utilization)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Panel */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div 
            className={cn(
              "h-1",
              activeTab === "supply" ? "bg-buy" : "bg-brand"
            )}
          />
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 rounded-lg bg-background-surface p-1">
                <TabsTrigger 
                  value="supply"
                  className="rounded-md data-[state=active]:bg-background-elevated data-[state=active]:shadow-sm"
                >
                  Supply
                </TabsTrigger>
                <TabsTrigger 
                  value="borrow"
                  className="rounded-md data-[state=active]:bg-background-elevated data-[state=active]:shadow-sm"
                >
                  Borrow
                </TabsTrigger>
              </TabsList>

              <TabsContent value="supply" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label className="text-foreground">Amount ({pool.symbol})</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.000001"
                    placeholder={`Enter ${pool.symbol} amount`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12 rounded-xl border-border focus:border-brand"
                  />
                </div>

                <div className="flex items-center space-x-2 p-4 rounded-xl bg-background-surface border border-border">
                  <Switch
                    id="collateral"
                    checked={useAsCollateral}
                    onCheckedChange={setUseAsCollateral}
                  />
                  <Label htmlFor="collateral" className="cursor-pointer text-foreground">
                    Use as collateral
                  </Label>
                </div>

                <Button
                  className="w-full h-12 rounded-xl font-medium text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleGetQuote}
                  disabled={!amount || supplyQuote.isLoading}
                  style={{
                    background: 'var(--gradient-success)',
                    color: 'white',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  {supplyQuote.isLoading ? "Calculating..." : "Get Quote"}
                </Button>
              </TabsContent>

              <TabsContent value="borrow" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label className="text-foreground">Amount ({pool.symbol})</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.000001"
                    placeholder={`Enter ${pool.symbol} amount`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12 rounded-xl border-border focus:border-brand"
                  />
                </div>

                <Button
                  className="w-full h-12 rounded-xl font-medium text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleGetQuote}
                  disabled={!amount || borrowQuote.isLoading}
                  style={{
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                  }}
                >
                  {borrowQuote.isLoading ? "Calculating..." : "Get Quote"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quote Result */}
        <Card>
          <CardHeader>
            <CardTitle>Quote Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {isQuoteLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-foreground-muted">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-3" />
                <p>Calculating...</p>
              </div>
            ) : currentQuote ? (
              <div className="space-y-4">
                {!currentQuote.feasible ? (
                  <div 
                    className="p-4 rounded-xl border bg-sell-light border-border-subtle"
                  >
                    <div className="flex items-center gap-2 text-sell font-medium">
                      <AlertTriangle className="h-5 w-5" />
                      Not Feasible
                    </div>
                    <ul className="mt-2 text-sm text-sell list-disc list-inside">
                      {currentQuote.reasons?.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <>
                    <div 
                      className="p-4 rounded-xl border bg-buy-light border-border-subtle"
                    >
                      <div className="flex items-center gap-2 text-buy font-medium">
                        <CheckCircle className="h-5 w-5" />
                        Feasible
                      </div>
                    </div>

                    <div className="space-y-3 rounded-xl border border-border p-4 bg-background-surface">
                      {currentQuote.computed.expectedAPY && (
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground-muted">Expected APY</span>
                          <span className="font-medium text-foreground">{formatAPY(currentQuote.computed.expectedAPY)}</span>
                        </div>
                      )}

                      {currentQuote.computed.healthFactorBefore && (
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground-muted">Health Factor (Before)</span>
                          <span className="font-medium text-foreground">{currentQuote.computed.healthFactorBefore}</span>
                        </div>
                      )}

                      {currentQuote.computed.healthFactorAfter && (
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground-muted">Health Factor (After)</span>
                          <span className={formatHealthFactor(currentQuote.computed.healthFactorAfter).color}>
                            {currentQuote.computed.healthFactorAfter}
                          </span>
                        </div>
                      )}

                      {currentQuote.computed.maxBorrowAmount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground-muted">Max Borrow</span>
                          <span className="font-medium text-foreground">{formatAmount(currentQuote.computed.maxBorrowAmount, pool.decimals)} {pool.symbol}</span>
                        </div>
                      )}

                      {currentQuote.txPlan && (
                        <>
                          <div className="h-px bg-border" />
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground-muted">Estimated Fee</span>
                            <span className="font-medium text-foreground">{currentQuote.txPlan.estimatedFee} sats</span>
                          </div>
                          {currentQuote.txPlan.requiresCreateOp && (
                            <div className="text-xs text-foreground-muted">
                              * Requires CreateOp backtrace
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {currentQuote.warnings && currentQuote.warnings.length > 0 && (
                      <div 
                        className="p-3 rounded-xl border bg-brand-light border-border-subtle"
                      >
                        <div className="text-sm font-medium text-brand mb-1">Warnings:</div>
                        <ul className="text-sm text-brand list-disc list-inside">
                          {currentQuote.warnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button 
                      className="w-full h-12 rounded-xl" 
                      variant="outline"
                    >
                      Create Transaction Draft
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-foreground-muted">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-background-surface"
                >
                  <Calculator className="h-8 w-8 opacity-50" />
                </div>
                <p>Enter an amount to get a quote</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Risk Parameters */}
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle>Risk Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-background-surface">
              <div className="text-sm text-foreground-muted mb-1">LTV</div>
              <div className="text-xl font-bold text-foreground">{formatLTV(pool.ltv)}</div>
              <div className="text-xs text-foreground-muted mt-1">Loan-to-Value ratio</div>
            </div>
            <div className="p-4 rounded-xl bg-background-surface">
              <div className="text-sm text-foreground-muted mb-1">Liquidation Threshold</div>
              <div className="text-xl font-bold text-foreground">{formatLTV(pool.liquidationThreshold)}</div>
              <div className="text-xs text-foreground-muted mt-1">When liquidation starts</div>
            </div>
            <div className="p-4 rounded-xl bg-background-surface">
              <div className="text-sm text-foreground-muted mb-1">Liquidation Bonus</div>
              <div className="text-xl font-bold text-foreground">{(pool.liquidationBonus / 100).toFixed(0)}%</div>
              <div className="text-xs text-foreground-muted mt-1">Bonus for liquidators</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
