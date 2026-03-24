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
// QuoteResponse type used implicitly via hook return types

const MOCK_USER = "user1234567890abcdef1234567890abcdef123456";
const ASSET_PRICES: Record<string, number> = {
  '0000000000000000000000000000000000000000000000000000000000000000': 65000,
  'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456': 1,
  'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1': 0.1,
};

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
      <div className="space-y-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-muted-foreground">
          Pool not found
        </div>
      </div>
    );
  }

  const price = ASSET_PRICES[pool.asset] || 0;
  const liquidityUSD = (parseFloat(pool.liquidity) / 10 ** pool.decimals) * price;

  const currentQuote = activeTab === "supply" ? supplyQuote.quote : borrowQuote.quote;
  const isQuoteLoading = activeTab === "supply" ? supplyQuote.isLoading : borrowQuote.isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/markets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
              {pool.symbol.slice(0, 2)}
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{pool.symbol}</h2>
          </div>
          <p className="text-muted-foreground">{pool.name}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Liquidity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUSD(liquidityUSD)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Supply APY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatAPY(pool.supplyAPY)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Borrow APY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatAPY(pool.borrowAPY)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAPY(pool.utilization)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Panel */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="supply">Supply</TabsTrigger>
                <TabsTrigger value="borrow">Borrow</TabsTrigger>
              </TabsList>

              <TabsContent value="supply" className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount ({pool.symbol})</Label>
                  <Input
                    type="number"
                    placeholder={`Enter ${pool.symbol} amount`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="collateral"
                    checked={useAsCollateral}
                    onCheckedChange={setUseAsCollateral}
                  />
                  <Label htmlFor="collateral">Use as collateral</Label>
                </div>

                <Button
                  className="w-full"
                  onClick={handleGetQuote}
                  disabled={!amount || supplyQuote.isLoading}
                >
                  {supplyQuote.isLoading ? "Calculating..." : "Get Quote"}
                </Button>
              </TabsContent>

              <TabsContent value="borrow" className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount ({pool.symbol})</Label>
                  <Input
                    type="number"
                    placeholder={`Enter ${pool.symbol} amount`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleGetQuote}
                  disabled={!amount || borrowQuote.isLoading}
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
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Quote Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isQuoteLoading ? (
              <div className="text-center py-8 text-muted-foreground">Calculating...</div>
            ) : currentQuote ? (
              <div className="space-y-4">
                {!currentQuote.feasible ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 font-medium">
                      <AlertTriangle className="h-5 w-5" />
                      Not Feasible
                    </div>
                    <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                      {currentQuote.reasons?.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle className="h-5 w-5" />
                        Feasible
                      </div>
                    </div>

                    <div className="space-y-2">
                      {currentQuote.computed.expectedAPY && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expected APY</span>
                          <span className="font-medium">{formatAPY(currentQuote.computed.expectedAPY)}</span>
                        </div>
                      )}

                      {currentQuote.computed.healthFactorBefore && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Health Factor (Before)</span>
                          <span className="font-medium">{currentQuote.computed.healthFactorBefore}</span>
                        </div>
                      )}

                      {currentQuote.computed.healthFactorAfter && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Health Factor (After)</span>
                          <span className={formatHealthFactor(currentQuote.computed.healthFactorAfter).color}>
                            {currentQuote.computed.healthFactorAfter}
                          </span>
                        </div>
                      )}

                      {currentQuote.computed.maxBorrowAmount && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Borrow</span>
                          <span className="font-medium">{formatAmount(currentQuote.computed.maxBorrowAmount, pool.decimals)} {pool.symbol}</span>
                        </div>
                      )}

                      {currentQuote.txPlan && (
                        <>
                          <div className="border-t my-2" />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Estimated Fee</span>
                            <span className="font-medium">{currentQuote.txPlan.estimatedFee} sats</span>
                          </div>
                          {currentQuote.txPlan.requiresCreateOp && (
                            <div className="text-xs text-muted-foreground">
                              * Requires CreateOp backtrace
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {currentQuote.warnings && currentQuote.warnings.length > 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-sm text-yellow-800 font-medium">Warnings:</div>
                        <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                          {currentQuote.warnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button className="w-full" variant="outline">
                      Create Transaction Draft
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Enter an amount to get a quote
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Risk Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">LTV</div>
              <div className="text-lg font-medium">{formatLTV(pool.ltv)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Liquidation Threshold</div>
              <div className="text-lg font-medium">{formatLTV(pool.liquidationThreshold)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Liquidation Bonus</div>
              <div className="text-lg font-medium">{(pool.liquidationBonus / 100).toFixed(0)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
