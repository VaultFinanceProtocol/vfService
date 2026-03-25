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
  const colorStyles = {
    primary: { text: 'var(--primary)' },
    success: { text: 'var(--success)' },
    warning: { text: 'var(--warning)' },
  };

  return (
    <Card 
      className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="pt-6">
        <div className="text-xs text-[var(--fg-muted)] uppercase tracking-wide mb-1">{title}</div>
        <div className="text-2xl font-bold" style={{ color: colorStyles[color].text }}>
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
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-[var(--fg-muted)]">Loading market data...</p>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--fg-muted)]">
        <p className="text-lg font-medium text-[var(--fg)]">Pool not found</p>
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
            className="h-10 w-10 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-hover)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <AssetIcon symbol={pool.symbol} className="w-12 h-12 text-base" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--fg)]">
                {pool.symbol}
              </h1>
              <p className="text-[var(--fg-muted)]">{pool.name}</p>
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
            <div className="text-xs text-[var(--fg-muted)] uppercase tracking-wide mb-1">Utilization</div>
            <div className="text-2xl font-bold text-[var(--primary)]">
              {formatAPY(pool.utilization)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Panel */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div 
            className="h-1"
            style={{ background: activeTab === "supply" ? 'var(--gradient-success)' : 'var(--gradient-primary)' }}
          />
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 rounded-lg bg-[var(--bg-muted)] p-1">
                <TabsTrigger 
                  value="supply"
                  className="rounded-md data-[state=active]:bg-[var(--card)] data-[state=active]:shadow-sm"
                >
                  Supply
                </TabsTrigger>
                <TabsTrigger 
                  value="borrow"
                  className="rounded-md data-[state=active]:bg-[var(--card)] data-[state=active]:shadow-sm"
                >
                  Borrow
                </TabsTrigger>
              </TabsList>

              <TabsContent value="supply" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label className="text-[var(--fg)]">Amount ({pool.symbol})</Label>
                  <Input
                    type="number"
                    placeholder={`Enter ${pool.symbol} amount`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12 rounded-xl border-[var(--border)] focus:border-[var(--success)]"
                  />
                </div>

                <div className="flex items-center space-x-2 p-4 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)]">
                  <Switch
                    id="collateral"
                    checked={useAsCollateral}
                    onCheckedChange={setUseAsCollateral}
                  />
                  <Label htmlFor="collateral" className="cursor-pointer text-[var(--fg)]">
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
                  <Label className="text-[var(--fg)]">Amount ({pool.symbol})</Label>
                  <Input
                    type="number"
                    placeholder={`Enter ${pool.symbol} amount`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12 rounded-xl border-[var(--border)] focus:border-[var(--primary)]"
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
              <div className="flex flex-col items-center justify-center py-8 text-[var(--fg-muted)]">
                <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-3" />
                <p>Calculating...</p>
              </div>
            ) : currentQuote ? (
              <div className="space-y-4">
                {!currentQuote.feasible ? (
                  <div 
                    className="p-4 rounded-xl border"
                    style={{ 
                      backgroundColor: 'var(--danger-bg)',
                      borderColor: 'var(--danger-muted)',
                    }}
                  >
                    <div className="flex items-center gap-2 text-[var(--danger)] font-medium">
                      <AlertTriangle className="h-5 w-5" />
                      Not Feasible
                    </div>
                    <ul className="mt-2 text-sm text-[var(--danger)] list-disc list-inside">
                      {currentQuote.reasons?.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <>
                    <div 
                      className="p-4 rounded-xl border"
                      style={{ 
                        backgroundColor: 'var(--success-bg)',
                        borderColor: 'var(--success-muted)',
                      }}
                    >
                      <div className="flex items-center gap-2 text-[var(--success)] font-medium">
                        <CheckCircle className="h-5 w-5" />
                        Feasible
                      </div>
                    </div>

                    <div className="space-y-3 rounded-xl border border-[var(--border)] p-4 bg-[var(--bg-muted)]">
                      {currentQuote.computed.expectedAPY && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--fg-muted)]">Expected APY</span>
                          <span className="font-medium text-[var(--fg)]">{formatAPY(currentQuote.computed.expectedAPY)}</span>
                        </div>
                      )}

                      {currentQuote.computed.healthFactorBefore && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--fg-muted)]">Health Factor (Before)</span>
                          <span className="font-medium text-[var(--fg)]">{currentQuote.computed.healthFactorBefore}</span>
                        </div>
                      )}

                      {currentQuote.computed.healthFactorAfter && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--fg-muted)]">Health Factor (After)</span>
                          <span className={formatHealthFactor(currentQuote.computed.healthFactorAfter).color}>
                            {currentQuote.computed.healthFactorAfter}
                          </span>
                        </div>
                      )}

                      {currentQuote.computed.maxBorrowAmount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--fg-muted)]">Max Borrow</span>
                          <span className="font-medium text-[var(--fg)]">{formatAmount(currentQuote.computed.maxBorrowAmount, pool.decimals)} {pool.symbol}</span>
                        </div>
                      )}

                      {currentQuote.txPlan && (
                        <>
                          <div className="h-px bg-[var(--border)]" />
                          <div className="flex justify-between text-sm">
                            <span className="text-[var(--fg-muted)]">Estimated Fee</span>
                            <span className="font-medium text-[var(--fg)]">{currentQuote.txPlan.estimatedFee} sats</span>
                          </div>
                          {currentQuote.txPlan.requiresCreateOp && (
                            <div className="text-xs text-[var(--fg-muted)]">
                              * Requires CreateOp backtrace
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {currentQuote.warnings && currentQuote.warnings.length > 0 && (
                      <div 
                        className="p-3 rounded-xl border"
                        style={{ 
                          backgroundColor: 'var(--warning-bg)',
                          borderColor: 'var(--warning-muted)',
                        }}
                      >
                        <div className="text-sm font-medium text-[var(--warning)] mb-1">Warnings:</div>
                        <ul className="text-sm text-[var(--warning)] list-disc list-inside">
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
              <div className="flex flex-col items-center justify-center py-8 text-[var(--fg-muted)]">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--bg-muted)' }}
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
        <CardHeader className="border-b border-[var(--border)]">
          <CardTitle>Risk Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-[var(--bg-muted)]">
              <div className="text-sm text-[var(--fg-muted)] mb-1">LTV</div>
              <div className="text-xl font-bold text-[var(--fg)]">{formatLTV(pool.ltv)}</div>
              <div className="text-xs text-[var(--fg-muted)] mt-1">Loan-to-Value ratio</div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-muted)]">
              <div className="text-sm text-[var(--fg-muted)] mb-1">Liquidation Threshold</div>
              <div className="text-xl font-bold text-[var(--fg)]">{formatLTV(pool.liquidationThreshold)}</div>
              <div className="text-xs text-[var(--fg-muted)] mt-1">When liquidation starts</div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-muted)]">
              <div className="text-sm text-[var(--fg-muted)] mb-1">Liquidation Bonus</div>
              <div className="text-xl font-bold text-[var(--fg)]">{(pool.liquidationBonus / 100).toFixed(0)}%</div>
              <div className="text-xs text-[var(--fg-muted)] mt-1">Bonus for liquidators</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
