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
import { Alert, AlertDescription } from "@components/ui/Alert";
import {
  AlertTriangle,
  RefreshCw,
  DollarSign,
  TrendingDown,
  User,
  Activity,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useLiquidations, useLiquidationPreview } from "@hooks/useLiquidations";
import { formatUSD, formatAmount } from "@utils/format";
import type { LiquidatablePosition } from "@app-types";

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
    // In a real implementation, this would create and broadcast the liquidation transaction
    setStep("success");
    refresh();
  };

  const healthFactorColor = (hf: string) => {
    const value = parseFloat(hf);
    if (value < 0.9) return "text-red-600";
    if (value < 1.0) return "text-orange-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Liquidations</h2>
          <p className="text-muted-foreground">
            View and execute liquidation opportunities
          </p>
        </div>
        <Button variant="outline" onClick={() => refresh()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-muted-foreground">Positions at Risk</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {positions?.filter((p) => parseFloat(p.healthFactor) < 0.9).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-muted-foreground">Liquidatable (HF &lt; 1.0)</span>
            </div>
            <div className="text-2xl font-bold mt-2">{positions?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Total Potential Profit</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-green-600">
              {formatUSD(
                positions
                  ?.reduce((sum, p) => sum + parseFloat(p.potentialProfitUSD), 0)
                  .toString() || "0"
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liquidations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Available Liquidations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Scanning for liquidations...</p>
            </div>
          ) : positions && positions.length > 0 ? (
            <div className="space-y-4">
              {positions.map((position) => (
                <div
                  key={position.userAddr}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        Borrower: {position.userAddr.slice(0, 8)}...
                        {position.userAddr.slice(-6)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Debt: {formatUSD(position.borrowedValueUSD)} {position.symbol}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Amount: {formatAmount(position.borrowedAmount, 8)} {position.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex flex-col md:items-end gap-2">
                    <div className={`text-2xl font-bold ${healthFactorColor(position.healthFactor)}`}>
                      HF: {position.healthFactor}
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Profit: {formatUSD(position.potentialProfitUSD)} (
                      {(position.liquidationBonus / 100).toFixed(0)}% bonus)
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleOpenModal(position)}
                      className="mt-2"
                    >
                      Liquidate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No liquidatable positions found.</p>
              <p className="text-sm">All positions are healthy (HF &gt;= 1.0).</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liquidation Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Execute Liquidation
            </DialogTitle>
            <DialogDescription>
              Liquidate borrower position to earn liquidation bonus
            </DialogDescription>
          </DialogHeader>

          {step === "input" && selectedPosition && (
            <div className="space-y-4">
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  <div className="font-medium">Borrower at Risk</div>
                  <div className="text-sm mt-1">
                    Health Factor: {selectedPosition.healthFactor} (Below 1.0)
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Repay Amount ({selectedPosition.symbol})</Label>
                <Input
                  type="number"
                  placeholder={`Enter ${selectedPosition.symbol} amount to repay`}
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                />
                <div className="text-sm text-muted-foreground">
                  Available to repay: {formatAmount(selectedPosition.borrowedAmount, 8)}{" "}
                  {selectedPosition.symbol}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Collateral Asset (to seize)</Label>
                <Input
                  type="text"
                  placeholder="Enter collateral asset ID"
                  value={collAsset}
                  onChange={(e) => setCollAsset(e.target.value)}
                />
                <div className="text-sm text-muted-foreground">
                  Example: 0000000000000000000000000000000000000000000000000000000000000000 (BTC)
                </div>
              </div>

              <Button
                className="w-full"
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
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Liquidation is profitable!
                </AlertDescription>
              </Alert>

              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You Repay</span>
                  <span>
                    {formatAmount(preview.repayAmount, 8)} ({formatUSD(preview.repayValueUSD)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You Receive (Collateral)</span>
                  <span>
                    {formatAmount(preview.seizeAmount, 8)} ({formatUSD(preview.seizeValueUSD)})
                  </span>
                </div>
                <div className="border-t my-2" />
                <div className="flex justify-between font-medium text-green-600">
                  <span>Your Profit (Bonus)</span>
                  <span>
                    +{formatAmount(preview.bonusAmount, 8)} ({formatUSD(preview.bonusValueUSD)})
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("input")}
                >
                  Back
                </Button>
                <Button className="flex-1" variant="destructive" onClick={handleExecute}>
                  Execute Liquidation
                </Button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Liquidation Executed!</h3>
                <p className="text-sm text-muted-foreground">
                  The transaction has been submitted to the network.
                </p>
              </div>
              <Button onClick={handleCloseModal} className="w-full">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
