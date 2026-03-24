import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/Tabs";
import { Switch } from "@components/ui/Switch";
import { Label } from "@components/ui/Label";
import { usePools } from "@hooks/usePools";
import { useQuote } from "@hooks/useQuotes";
import { AmountDisplay } from "@components/protocol/amount-display";
import { HealthFactorBadge } from "@components/protocol/health-factor-badge";
import { QuotePanel } from "@components/protocol/quote-panel";
import { RiskBanner, LiquidationRiskBanner } from "@components/protocol/risk-banner";
import { TrendingUp, PiggyBank, Calculator, ChevronDown } from "lucide-react";
import { formatUSD, formatAPY } from "@utils/format";

const MOCK_USER = "user1234567890abcdef1234567890abcdef123456";

export function EarnPage() {
  const { pools, isLoading } = usePools(0, 100);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [useAsCollateral, setUseAsCollateral] = useState(true);
  const [activeTab, setActiveTab] = useState("supply");

  const supplyQuote = useQuote("supply");

  const selectedPool = pools.find((p) => p.asset === selectedAsset);

  const handleGetQuote = async () => {
    if (!selectedPool || !amount) return;

    const amountInSats = (
      parseFloat(amount) *
      10 ** selectedPool.decimals
    ).toString();

    await supplyQuote.fetchQuote({
      userAddr: MOCK_USER,
      asset: selectedPool.asset,
      amount: amountInSats,
      useAsCollateral,
    });
  };

  // Calculate total supplied
  const totalSupplied = pools.reduce(
    (sum, pool) => sum + parseFloat(pool.totalSupplied),
    0
  );

  // Best APY pool
  const bestAPYPool = pools.length > 0
    ? pools.reduce((best, pool) =>
        parseFloat(pool.supplyAPY) > parseFloat(best.supplyAPY) ? pool : best
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Earn</h2>
          <p style={{ color: "var(--fg-muted)" }}>
            Supply assets to earn passive yield
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: "var(--fg-muted)" }}
            >
              Total Supplied
            </CardTitle>
            <PiggyBank
              className="h-4 w-4"
              style={{ color: "var(--fg-muted)" }}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "var(--fg)" }}>
              {isLoading ? "..." : formatUSD(totalSupplied)}
            </div>
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
              Across all markets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: "var(--fg-muted)" }}
            >
              Best Supply APY
            </CardTitle>
            <TrendingUp
              className="h-4 w-4"
              style={{ color: "var(--success)" }}
            />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold"
              style={{ color: "var(--success)" }}
            >
              {isLoading || !bestAPYPool
                ? "..."
                : formatAPY(bestAPYPool.supplyAPY)}
            </div>
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
              {bestAPYPool?.symbol || ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: "var(--fg-muted)" }}
            >
              Available Markets
            </CardTitle>
            <Calculator
              className="h-4 w-4"
              style={{ color: "var(--fg-muted)" }}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "var(--fg)" }}>
              {pools.length}
            </div>
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
              Active pools
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Area */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Supply Form */}
        <Card>
          <CardHeader>
            <CardTitle>Supply Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="supply">Supply</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              </TabsList>

              <TabsContent value="supply" className="space-y-4">
                {/* Asset Selection */}
                <div className="space-y-2">
                  <Label>Select Asset</Label>
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
                            style={{ color: "var(--success)" }}
                          >
                            {formatAPY(pool.supplyAPY)}
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
                  <div
                    className="flex justify-between text-xs"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    <span>Balance: 0.00</span>
                    <button
                      className="hover:underline"
                      style={{ color: "var(--primary)" }}
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Collateral Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-elevated)]">
                  <div>
                    <Label htmlFor="collateral" className="cursor-pointer">
                      Use as Collateral
                    </Label>
                    <p
                      className="text-xs"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      Enable to borrow against this asset
                    </p>
                  </div>
                  <Switch
                    id="collateral"
                    checked={useAsCollateral}
                    onCheckedChange={setUseAsCollateral}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleGetQuote}
                  disabled={!amount || !selectedAsset || supplyQuote.isLoading}
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-contrast)",
                  }}
                >
                  {supplyQuote.isLoading ? "Calculating..." : "Preview Supply"}
                </Button>
              </TabsContent>

              <TabsContent value="withdraw" className="space-y-4">
                <div
                  className="p-4 rounded-lg text-center"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    color: "var(--fg-muted)",
                  }}
                >
                  Connect your wallet to view and withdraw your supplies
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quote Preview */}
        <div className="space-y-4">
          {supplyQuote.quote ? (
            <>
              <QuotePanel
                operation="supply"
                fromAsset={{
                  symbol: selectedPool?.symbol || "",
                  amount: amount,
                  usdValue: "0", // Calculate based on price
                }}
                quoteItems={[
                  {
                    label: "Supply APY",
                    value: supplyQuote.quote.computed.expectedAPY || "0",
                    valueSuffix: "%",
                    valueDecimals: 2,
                    valueVariant: "positive",
                    highlight: true,
                  },
                  {
                    label: "Health Factor After",
                    value:
                      supplyQuote.quote.computed.healthFactorAfter || "∞",
                    highlight: true,
                  },
                  {
                    label: "Estimated Fee",
                    value: supplyQuote.quote.txPlan?.estimatedFee || "0",
                    valueSuffix: " sats",
                    valueDecimals: 0,
                  },
                ]}
                warnings={supplyQuote.quote.warnings}
              />

              {supplyQuote.quote.feasible && (
                <Button
                  className="w-full"
                  size="lg"
                  style={{
                    backgroundColor: "var(--success)",
                    color: "var(--success-contrast)",
                  }}
                >
                  Confirm Supply
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
                <p>Select an asset and enter amount to preview your supply</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* All Markets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Supply Markets</CardTitle>
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
                    Total Supplied
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    Supply APY
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    Liquidity
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
                        value={parseFloat(pool.totalSupplied) / 10 ** pool.decimals}
                        decimals={2}
                      />
                    </td>
                    <td className="text-right py-4 px-4">
                      <span style={{ color: "var(--success)" }}>
                        {formatAPY(pool.supplyAPY)}
                      </span>
                    </td>
                    <td className="text-right py-4 px-4">
                      <AmountDisplay
                        value={parseFloat(pool.liquidity) / 10 ** pool.decimals}
                        decimals={2}
                      />
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
                        Supply
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
