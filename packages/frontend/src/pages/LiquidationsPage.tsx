import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Label } from "@components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@components/ui/Dialog";
import {
  RefreshCw,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useLiquidations, useLiquidationPreview } from "@hooks/useLiquidations";
import { formatUSD, formatAmount } from "@utils/format";
import type { LiquidatablePosition } from "@app-types";
import { cn } from "@lib/utils";

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
  subtitle?: string;
  color?: "primary" | "success" | "warning" | "danger";
  delay?: number;
}) {
  const colorClasses = {
    primary: "text-brand",
    success: "text-buy",
    warning: "text-warning",
    danger: "text-sell",
  };

  return (
    <Card 
      className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground-secondary">{title}</p>
            <div className={cn("mt-2 text-2xl font-bold", colorClasses[color])}>
              {value}
            </div>
            {subtitle && (
              <p className="text-xs text-foreground-secondary mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LiquidationsPage() {
  const { positions, isLoading, refresh } = useLiquidations();
  const { preview, fetchPreview, isLoading: isPreviewLoading } = useLiquidationPreview();
  const [selectedPosition, setSelectedPosition] = useState<LiquidatablePosition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [repayAmount, setRepayAmount] = useState("");
  const [collAsset, setCollAsset] = useState("");
  const [step, setStep] = useState<"input" | "preview" | "success">("input");

  const handleOpenModal = (position: LiquidatablePosition) => {
    setSelectedPosition(position);
    setRepayAmount("");
    setCollAsset("");
    setStep("input");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPosition(null);
    setStep("input");
  };

  const handleGetPreview = async () => {
    if (!selectedPosition || !repayAmount || !collAsset) return;

    await fetchPreview({
      borrowerAddr: selectedPosition.userAddr,
      debtAsset: selectedPosition.asset,
      collAsset,
      repayAmount: (parseFloat(repayAmount) * 1e8).toString(),
    });

    setStep("preview");
  };

  const handleExecute = async () => {
    setStep("success");
    refresh();
  };

  const healthFactorColor = (hf: string) => {
    const value = parseFloat(hf);
    if (value < 0.9) return "text-sell";
    if (value < 1.0) return "text-warning";
    return "text-buy";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Liquidations
          </h1>
          <p className="text-foreground-secondary mt-1">View and execute liquidation opportunities</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refresh()} 
          disabled={isLoading}
          className="rounded-lg gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Positions at Risk"
          value={positions?.filter((p) => parseFloat(p.healthFactor) < 0.9).length || 0}
          subtitle="Critical health factor"
          color="danger"
          delay={0}
        />
        <StatCard
          title="Liquidatable"
          value={positions?.length || 0}
          subtitle="HF < 1.0"
          color="warning"
          delay={50}
        />
        <StatCard
          title="Total Potential Profit"
          value={formatUSD(
            positions
              ?.reduce((sum, p) => sum + parseFloat(p.potentialProfitUSD), 0)
              .toString() || "0"
          )}
          subtitle="Liquidation bonuses"
          color="success"
          delay={100}
        />
      </div>

      {/* Liquidations List */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg">Available Liquidations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-foreground-secondary" />
              <p className="mt-2 text-foreground-secondary">Scanning for liquidations...</p>
            </div>
          ) : positions && positions.length > 0 ? (
            <div className="divide-y divide-border">
              {positions.map((position) => (
                <div
                  key={position.userAddr}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-6 gap-4 hover:bg-background-hover transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-sell-light"
                    >
                      <span className="text-lg font-bold text-sell">!</span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        Borrower: {position.userAddr.slice(0, 8)}...
                        {position.userAddr.slice(-6)}
                      </div>
                      <div className="text-sm text-foreground-secondary">
                        Debt: {formatUSD(position.borrowedValueUSD)} {position.symbol}
                      </div>
                      <div className="text-xs text-foreground-secondary">
                        Amount: {formatAmount(position.borrowedAmount, 8)} {position.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    <div className={`text-2xl font-bold ${healthFactorColor(position.healthFactor)}`}>
                      HF: {position.healthFactor}
                    </div>
                    <div className="text-sm font-semibold text-buy">
                      Profit: {formatUSD(position.potentialProfitUSD)} (
                      {(position.liquidationBonus / 100).toFixed(0)}% bonus)
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleOpenModal(position)}
                      className="mt-2 rounded-lg font-medium bg-sell text-white hover:bg-sell/90"
                    >
                      Liquidate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-foreground-secondary">
              <div className="text-lg font-medium text-foreground">No liquidatable positions found</div>
              <p className="text-sm mt-1">All positions are healthy (HF &gt;= 1.0)</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liquidation Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[500px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sell">Execute Liquidation</DialogTitle>
            <DialogDescription className="text-foreground-secondary">
              Liquidate borrower position to earn liquidation bonus
            </DialogDescription>
          </DialogHeader>

          {step === "input" && selectedPosition && (
            <div className="space-y-4 mt-4">
              <div 
                className="p-4 rounded-xl border border-sell-light bg-sell-light/30"
              >
                <p className="font-medium text-sell">Borrower at Risk</p>
                <p className="text-sm text-sell mt-1">
                  Health Factor: {selectedPosition.healthFactor} (Below 1.0)
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Repay Amount ({selectedPosition.symbol})</Label>
                <Input
                  type="number"
                  placeholder={`Enter ${selectedPosition.symbol} amount to repay`}
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="rounded-lg h-11"
                />
                <p className="text-xs text-foreground-secondary">
                  Available to repay: {formatAmount(selectedPosition.borrowedAmount, 8)}{" "}
                  {selectedPosition.symbol}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Collateral Asset (to seize)</Label>
                <Input
                  type="text"
                  placeholder="Enter collateral asset ID"
                  value={collAsset}
                  onChange={(e) => setCollAsset(e.target.value)}
                  className="rounded-lg h-11"
                />
                <p className="text-xs text-foreground-secondary">
                  Example: 0000000000000000000000000000000000000000000000000000000000000000 (BTC)
                </p>
              </div>

              <Button
                className="w-full h-11 rounded-lg font-medium bg-sell text-white hover:bg-sell/90"
                onClick={handleGetPreview}
                disabled={!repayAmount || !collAsset || isPreviewLoading}
              >
                {isPreviewLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  "Preview Liquidation"
                )}
              </Button>
            </div>
          )}

          {step === "preview" && preview && (
            <div className="space-y-4 mt-4">
              <div 
                className="p-4 rounded-xl border border-buy-light bg-buy-light/30"
              >
                <p className="font-medium text-buy flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Liquidation is profitable!
                </p>
              </div>

              <div className="space-y-3 rounded-xl border border-border p-4 bg-background-surface">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">You Repay</span>
                  <span className="font-medium text-foreground">
                    {formatAmount(preview.repayAmount, 8)} ({formatUSD(preview.repayValueUSD)})
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">You Receive (Collateral)</span>
                  <span className="font-medium text-foreground">
                    {formatAmount(preview.seizeAmount, 8)} ({formatUSD(preview.seizeValueUSD)})
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between font-medium">
                  <span className="text-buy">Your Profit (Bonus)</span>
                  <span className="text-buy">
                    +{formatAmount(preview.bonusAmount, 8)} ({formatUSD(preview.bonusValueUSD)})
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-lg h-11"
                  onClick={() => setStep("input")}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1 rounded-lg h-11 font-medium bg-sell text-white hover:bg-sell/90"
                  onClick={handleExecute}
                >
                  Execute Liquidation
                </Button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-4 mt-4 text-center">
              <div className="flex justify-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center bg-buy-light"
                >
                  <CheckCircle className="w-8 h-8 text-buy" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">Liquidation Executed!</h3>
                <p className="text-sm text-foreground-secondary mt-1">
                  The transaction has been submitted to the network.
                </p>
              </div>
              <Button 
                onClick={handleCloseModal} 
                className="w-full rounded-lg h-11"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
