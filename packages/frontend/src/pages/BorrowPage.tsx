import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/Tabs";
import { Label } from "@components/ui/Label";
import { usePools } from "@hooks/usePools";
import { useQuote } from "@hooks/useQuotes";
import { useHealthFactor } from "@hooks/usePositions";
import { AmountDisplay } from "@components/protocol/amount-display";
import { HealthFactorBadge } from "@components/protocol/health-factor-badge";
import { QuotePanel, HealthFactorChange } from "@components/protocol/quote-panel";
import { LiquidationRiskBanner } from "@components/protocol/risk-banner";
import { Calculator, Wallet, Info } from "lucide-react";
import { formatUSD, formatAPY } from "@utils/format";
import { cn } from "@lib/utils";

const MOCK_USER = "user1234567890abcdef1234567890abcdef123456";

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
  subtitle, 
  color = "primary",
  delay = 0 
}: { 
  title: string;
  value: React.ReactNode;
  subtitle: string;
  color?: "primary" | "success" | "warning" | "danger";
  delay?: number;
}) {
  const colorStyles = {
    primary: { text: 'var(--primary)' },
    success: { text: 'var(--success)' },
    warning: { text: 'var(--warning)' },
    danger: { text: 'var(--danger)' },
  };

  return (
    <Card 
      className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-[var(--fg-muted)]">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" style={{ color: colorStyles[color].text }}>
          {value}
        </div>
        <p className="text-xs text-[var(--fg-muted)] mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export function BorrowPage() {
  const { pools, isLoading } = usePools(0, 100);
  const { healthFactor } = useHealthFactor(MOCK_USER);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("borrow");

  const borrowQuote = useQuote("borrow");
  const selectedPool = pools.find((p) => p.asset === selectedAsset);

  const handleGetQuote = async () => {
    if (!selectedPool || !amount) return;

    const amountInSats = (
      parseFloat(amount) *
      10 ** selectedPool.decimals
    ).toString();

    await borrowQuote.fetchQuote({
      userAddr: MOCK_USER,
      asset: selectedPool.asset,
      amount: amountInSats,
    });
  };

  // Calculate total borrowed
  const totalBorrowed = pools.reduce(
    (sum, pool) => sum + parseFloat(pool.totalBorrowed),
    0
  );

  // Best rate for borrowers (lowest APY)
  const bestRatePool = pools.length > 0
    ? pools.reduce((best, pool) =>
        parseFloat(pool.borrowAPY) < parseFloat(best.borrowAPY) ? pool : best
      )
    : null;

  const hf = parseFloat(healthFactor || "999");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--fg)]">
            Borrow
          </h1>
          <p className="text-[var(--fg-muted)] mt-1">
            Borrow assets using your supplied collateral
          </p>
        </div>
      </div>

      {/* Risk Warning Banner */}
      {hf < 1.2 && (
        <LiquidationRiskBanner
          healthFactor={healthFactor || "999"}
          liquidationThreshold="1.0"
        />
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Borrowed"
          value={isLoading ? "..." : formatUSD(totalBorrowed)}
          subtitle="Across all borrowers"
          delay={0}
        />
        <StatCard
          title="Best Borrow Rate"
          value={isLoading || !bestRatePool ? "..." : formatAPY(bestRatePool.borrowAPY)}
          subtitle={bestRatePool?.symbol || ""}
          color="primary"
          delay={50}
        />
        <StatCard
          title="Your Health Factor"
          value={<HealthFactorBadge value={healthFactor || "∞"} size="lg" />}
          subtitle={hf < 1.0 ? "At risk of liquidation!" : hf < 1.2 ? "Low - Add collateral" : "Healthy position"}
          color={hf < 1.0 ? "danger" : hf < 1.2 ? "warning" : "success"}
          delay={100}
        />
      </div>

      {/* Main Action Area */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Borrow Form */}
        <Card className="overflow-hidden">
          <div 
            className="h-1"
            style={{ background: 'var(--gradient-primary)' }}
          />
          <CardHeader>
            <CardTitle>Borrow Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 rounded-lg bg-[var(--bg-muted)] p-1">
                <TabsTrigger 
                  value="borrow"
                  className="rounded-md data-[state=active]:bg-[var(--card)] data-[state=active]:shadow-sm"
                >
                  Borrow
                </TabsTrigger>
                <TabsTrigger 
                  value="repay"
                  className="rounded-md data-[state=active]:bg-[var(--card)] data-[state=active]:shadow-sm"
                >
                  Repay
                </TabsTrigger>
              </TabsList>

              <TabsContent value="borrow" className="space-y-6 mt-6">
                {/* Asset Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-[var(--fg)]">Select Asset to Borrow</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {pools.slice(0, 8).map((pool) => (
                      <button
                        key={pool.asset}
                        onClick={() => setSelectedAsset(pool.asset)}
                        className={cn(
                          "p-3 rounded-xl border transition-all duration-200",
                          selectedAsset === pool.asset
                            ? "border-[var(--primary)] bg-[var(--primary-muted)]"
                            : "border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)]"
                        )}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <AssetIcon 
                            symbol={pool.symbol} 
                            className="w-8 h-8 text-xs"
                          />
                          <span className="text-sm font-medium text-[var(--fg)]">
                            {pool.symbol}
                          </span>
                          <span className="text-xs font-semibold text-[var(--primary)]">
                            {formatAPY(pool.borrowAPY)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-[var(--fg)]">Amount</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-12 pr-20 text-lg rounded-xl border-[var(--border)] focus:border-[var(--primary)]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--fg-muted)]">
                      {selectedPool?.symbol || "Token"}
                    </span>
                  </div>
                  {borrowQuote.quote?.computed?.maxBorrowAmount && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--fg-muted)]">
                        Max Borrow:{" "}
                        <AmountDisplay
                          value={borrowQuote.quote.computed.maxBorrowAmount}
                          decimals={selectedPool?.decimals || 8}
                        />
                      </span>
                      <button className="font-medium text-[var(--primary)] hover:underline">
                        MAX
                      </button>
                    </div>
                  )}
                </div>

                {/* Info Box */}
                <div className="p-4 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)]">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-[var(--fg-muted)] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-[var(--fg)] font-medium mb-1">How Borrowing Works</p>
                      <p className="text-xs text-[var(--fg-muted)]">
                        You need to supply collateral before borrowing. Your collateralization 
                        ratio determines your maximum borrow limit.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full h-12 rounded-xl font-medium text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleGetQuote}
                  disabled={!amount || !selectedAsset || borrowQuote.isLoading}
                  style={{
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                  }}
                >
                  {borrowQuote.isLoading ? "Calculating..." : "Preview Borrow"}
                </Button>
              </TabsContent>

              <TabsContent value="repay" className="mt-6">
                <div className="p-8 rounded-xl text-center bg-[var(--bg-muted)] border border-[var(--border)]">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-[var(--fg-muted)] opacity-50" />
                  <p className="text-[var(--fg-muted)]">
                    Connect your wallet to view and repay your loans
                  </p>
                  <Button 
                    className="mt-4 rounded-lg"
                    style={{
                      background: 'var(--gradient-primary)',
                      color: 'white',
                    }}
                  >
                    Connect Wallet
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quote Preview */}
        <div className="space-y-4">
          {borrowQuote.quote ? (
            <>
              <QuotePanel
                operation="borrow"
                fromAsset={{
                  symbol: selectedPool?.symbol || "",
                  amount: amount,
                  usdValue: "0",
                }}
                quoteItems={[
                  {
                    label: "Borrow APY",
                    value: borrowQuote.quote.computed.expectedAPY || "0",
                    valueSuffix: "%",
                    valueDecimals: 2,
                    valueVariant: "negative",
                    highlight: true,
                  },
                  {
                    label: "Liquidation Threshold",
                    value: selectedPool?.liquidationThreshold || "0",
                    valueSuffix: "%",
                    valueDecimals: 0,
                  },
                  {
                    label: "Estimated Fee",
                    value: borrowQuote.quote.txPlan?.estimatedFee || "0",
                    valueSuffix: " sats",
                    valueDecimals: 0,
                  },
                ]}
                warnings={borrowQuote.quote.warnings}
              />

              {borrowQuote.quote.computed.healthFactorBefore &&
                borrowQuote.quote.computed.healthFactorAfter && (
                  <Card>
                    <CardContent className="p-4">
                      <HealthFactorChange
                        before={borrowQuote.quote.computed.healthFactorBefore}
                        after={borrowQuote.quote.computed.healthFactorAfter}
                      />
                    </CardContent>
                  </Card>
                )}

              {borrowQuote.quote.feasible && (
                <Button
                  className="w-full h-12 rounded-xl font-medium text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                  }}
                >
                  Confirm Borrow
                </Button>
              )}
            </>
          ) : (
            <Card className="h-full min-h-[300px] flex flex-col">
              <CardHeader>
                <CardTitle>Quote Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--bg-muted)' }}
                >
                  <Calculator className="h-8 w-8 text-[var(--fg-muted)] opacity-50" />
                </div>
                <p className="text-[var(--fg-muted)]">
                  Select an asset and enter amount to preview your borrow
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* All Markets Table */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-[var(--border)]">
          <CardTitle>All Borrow Markets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                    Asset
                  </th>
                  <th className="text-right py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                    Available Liquidity
                  </th>
                  <th className="text-right py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                    Borrow APY
                  </th>
                  <th className="text-right py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] hidden sm:table-cell">
                    Variable APY
                  </th>
                  <th className="text-center py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {pools.map((pool) => (
                  <tr
                    key={pool.asset}
                    className="group border-b border-[var(--border)] transition-colors hover:bg-[var(--bg-hover)]"
                  >
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <AssetIcon 
                          symbol={pool.symbol} 
                          className="w-10 h-10 text-sm"
                        />
                        <div>
                          <div className="font-semibold text-[var(--fg)]">
                            {pool.symbol}
                          </div>
                          <div className="text-sm text-[var(--fg-muted)] hidden sm:block">
                            {pool.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-4 px-4 sm:px-6">
                      <AmountDisplay
                        value={parseFloat(pool.liquidity) / 10 ** pool.decimals}
                        decimals={2}
                      />
                    </td>
                    <td className="text-right py-4 px-4 sm:px-6">
                      <span className="font-semibold text-[var(--primary)]">
                        {formatAPY(pool.borrowAPY)}
                      </span>
                    </td>
                    <td className="text-right py-4 px-4 sm:px-6 hidden sm:table-cell">
                      <span className="text-[var(--fg-muted)]">
                        {formatAPY(pool.borrowAPY)}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4 sm:px-6">
                      <Button
                        size="sm"
                        onClick={() => setSelectedAsset(pool.asset)}
                        className="rounded-lg font-medium transition-all hover:scale-105"
                        style={{
                          background: 'var(--gradient-primary)',
                          color: 'white',
                        }}
                      >
                        Borrow
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
