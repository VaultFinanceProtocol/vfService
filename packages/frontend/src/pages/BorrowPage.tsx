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
import {
  LiquidationRiskBanner,
} from "@components/protocol/risk-banner";
import { TrendingDown, Wallet, Calculator, AlertTriangle } from "lucide-react";
import { formatUSD, formatAPY } from "@utils/format";

const MOCK_USER = "user1234567890abcdef1234567890abcdef123456";

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Borrow</h2>
          <p style={{ color: "var(--fg-muted)" }}>
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: "var(--fg-muted)" }}
            >
              Total Borrowed
            </CardTitle>
            <Wallet
              className="h-4 w-4"
              style={{ color: "var(--fg-muted)" }}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "var(--fg)" }}>
              {isLoading ? "..." : formatUSD(totalBorrowed)}
            </div>
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
              Across all borrowers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: "var(--fg-muted)" }}
            >
              Best Borrow Rate
            </CardTitle>
            <TrendingDown
              className="h-4 w-4"
              style={{ color: "var(--primary)" }}
            />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold"
              style={{ color: "var(--primary)" }}
            >
              {isLoading || !bestRatePool
                ? "..."
                : formatAPY(bestRatePool.borrowAPY)}
            </div>
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
              {bestRatePool?.symbol || ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: "var(--fg-muted)" }}
            >
              Your Health Factor
            </CardTitle>
            <AlertTriangle
              className="h-4 w-4"
              style={{
                color:
                  hf >= 1.2
                    ? "var(--success)"
                    : hf >= 1.0
                    ? "var(--warning)"
                    : "var(--danger)",
              }}
            />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <HealthFactorBadge value={healthFactor || "∞"} size="lg" />
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--fg-muted)" }}>
              {hf < 1.0
                ? "At risk of liquidation!"
                : hf < 1.2
                ? "Low - Add collateral"
                : "Healthy position"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Area */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Borrow Form */}
        <Card>
          <CardHeader>
            <CardTitle>Borrow Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="borrow">Borrow</TabsTrigger>
                <TabsTrigger value="repay">Repay</TabsTrigger>
              </TabsList>

              <TabsContent value="borrow" className="space-y-4">
                {/* Asset Selection */}
                <div className="space-y-2">
                  <Label>Select Asset to Borrow</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {pools.slice(0, 6).map((pool) => (
                      <button
                        key={pool.asset}
                        onClick={() => setSelectedAsset(pool.asset)}
                        className={`p-3 rounded-lg border transition-all ${
                          selectedAsset === pool.asset
                            ? "border-[var(--primary)] bg-[var(--primary-muted)]"
                            : "border-[var(--border)] hover:bg-[var(--bg-hover)]"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                            style={{
                              backgroundColor: "var(--primary-muted)",
                              color: "var(--primary)",
                            }}
                          >
                            {pool.symbol.slice(0, 2)}
                          </div>
                          <span
                            className="text-sm font-medium"
                            style={{ color: "var(--fg)" }}
                          >
                            {pool.symbol}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--primary)" }}
                          >
                            {formatAPY(pool.borrowAPY)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pr-16"
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      {selectedPool?.symbol || "Token"}
                    </span>
                  </div>
                  {borrowQuote.quote?.computed?.maxBorrowAmount && (
                    <div
                      className="flex justify-between text-xs"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      <span>
                        Max Borrow:{" "}
                        <AmountDisplay
                          value={borrowQuote.quote.computed.maxBorrowAmount}
                          decimals={selectedPool?.decimals || 8}
                        />
                      </span>
                      <button
                        className="hover:underline"
                        style={{ color: "var(--primary)" }}
                      >
                        MAX
                      </button>
                    </div>
                  )}
                </div>

                {/* Info Box */}
                <div
                  className="p-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    color: "var(--fg-muted)",
                  }}
                >
                  <p>
                    You need to supply collateral before borrowing. Your
                    collateralization ratio determines your maximum borrow
                    limit.
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={handleGetQuote}
                  disabled={!amount || !selectedAsset || borrowQuote.isLoading}
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-contrast)",
                  }}
                >
                  {borrowQuote.isLoading ? "Calculating..." : "Preview Borrow"}
                </Button>
              </TabsContent>

              <TabsContent value="repay" className="space-y-4">
                <div
                  className="p-4 rounded-lg text-center"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    color: "var(--fg-muted)",
                  }}
                >
                  Connect your wallet to view and repay your loans
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
                  className="w-full"
                  size="lg"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-contrast)",
                  }}
                >
                  Confirm Borrow
                </Button>
              )}
            </>
          ) : (
            <Card>
              <CardContent
                className="p-8 text-center"
                style={{ color: "var(--fg-muted)" }}
              >
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  Select an asset and enter amount to preview your borrow
                  position
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* All Markets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Borrow Markets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <th
                    className="text-left py-3 px-4 font-medium"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    Asset
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    Available Liquidity
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    Borrow APY
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    Variable APY
                  </th>
                  <th
                    className="text-center py-3 px-4 font-medium"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {pools.map((pool) => (
                  <tr
                    key={pool.asset}
                    className="hover:bg-[var(--bg-hover)] transition-colors"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{
                            backgroundColor: "var(--primary-muted)",
                            color: "var(--primary)",
                          }}
                        >
                          {pool.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div
                            className="font-medium"
                            style={{ color: "var(--fg)" }}
                          >
                            {pool.symbol}
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: "var(--fg-muted)" }}
                          >
                            {pool.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-4 px-4">
                      <AmountDisplay
                        value={parseFloat(pool.liquidity) / 10 ** pool.decimals}
                        decimals={2}
                      />
                    </td>
                    <td className="text-right py-4 px-4">
                      <span style={{ color: "var(--primary)" }}>
                        {formatAPY(pool.borrowAPY)}
                      </span>
                    </td>
                    <td className="text-right py-4 px-4">
                      <span style={{ color: "var(--primary)" }}>
                        {formatAPY(pool.borrowAPY)}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <Button
                        size="sm"
                        onClick={() => setSelectedAsset(pool.asset)}
                        style={{
                          backgroundColor: "var(--primary)",
                          color: "var(--primary-contrast)",
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
