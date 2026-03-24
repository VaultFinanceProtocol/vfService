import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/Tabs";
import { Wallet, TrendingUp, TrendingDown, Shield, AlertTriangle, MinusCircle, PlusCircle } from "lucide-react";
import { usePositions, useHealthFactor } from "@hooks/usePositions";
import { formatUSD, formatAmount, formatAPY, formatHealthFactor } from "@utils/format";
import { OperationModal } from "@components/operations/OperationModal";
import type { UserPosition } from "@app-types";

const MOCK_USER = "user1234567890abcdef1234567890abcdef123456";

export function PositionsPage() {
  const [userAddr] = useState(MOCK_USER);
  const { summary, isLoading, mutate: refreshPositions } = usePositions(userAddr);
  const { healthFactor } = useHealthFactor(userAddr);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<"withdraw" | "repay" | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<UserPosition | null>(null);

  const healthFactorStyle = formatHealthFactor(healthFactor);

  const openWithdrawModal = (position: UserPosition) => {
    setSelectedOperation("withdraw");
    setSelectedPosition(position);
    setIsModalOpen(true);
  };

  const openRepayModal = (position: UserPosition) => {
    setSelectedOperation("repay");
    setSelectedPosition(position);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedOperation(null);
    setSelectedPosition(null);
  };

  const handleOperationSuccess = () => {
    refreshPositions();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Positions</h2>
          <p className="text-muted-foreground">Manage your supplies and borrows</p>
        </div>
        <Button className="gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </div>

      {/* Health Factor Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Health Factor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Health Factor</span>
                <span className={`text-3xl font-bold ${healthFactorStyle.color}`}>
                  {healthFactorStyle.value}
                </span>
              </div>

              {summary?.accountData && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Collateral</div>
                    <div className="text-lg font-medium">{formatUSD(summary.accountData.totalCollateralUSD)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Debt</div>
                    <div className="text-lg font-medium text-orange-600">{formatUSD(summary.accountData.totalDebtUSD)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Available to Borrow</div>
                    <div className="text-lg font-medium text-green-600">{formatUSD(summary.accountData.availableBorrowsUSD)}</div>
                  </div>
                </div>
              )}

              {parseFloat(healthFactor || "999") < 1.1 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm">Your position is at risk of liquidation!</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supplies & Borrows */}
      <Tabs defaultValue="supplies">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="supplies">Supplied Assets</TabsTrigger>
          <TabsTrigger value="borrows">Borrowed Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="supplies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Supplied Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : summary?.supplies && summary.supplies.length > 0 ? (
                <div className="space-y-4">
                  {summary.supplies.map((position) => (
                    <div
                      key={position.asset}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                          {position.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium">{position.symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatAmount(position.suppliedAmount, position.decimals)} {position.symbol}
                          </div>
                          {position.usedAsCollateral && (
                            <div className="text-xs text-blue-600">Used as Collateral</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatUSD(position.suppliedValueUSD)}</div>
                        <div className="text-sm text-green-600">{formatAPY(position.supplyAPY)} APY</div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 gap-1"
                          onClick={() => openWithdrawModal(position)}
                        >
                          <MinusCircle className="h-3 w-3" />
                          Withdraw
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No supplied assets. Go to Markets to start supplying.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="borrows">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-600" />
                Borrowed Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : summary?.borrows && summary.borrows.length > 0 ? (
                <div className="space-y-4">
                  {summary.borrows.map((position) => (
                    <div
                      key={position.asset}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                          {position.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium">{position.symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatAmount(position.borrowedAmount, position.decimals)} {position.symbol}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatUSD(position.borrowedValueUSD)}</div>
                        <div className="text-sm text-orange-600">{formatAPY(position.borrowAPY)} APY</div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 gap-1"
                          onClick={() => openRepayModal(position)}
                        >
                          <PlusCircle className="h-3 w-3" />
                          Repay
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No borrowed assets. Supply collateral first to enable borrowing.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Operation Modal */}
      <OperationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        operation={selectedOperation}
        position={selectedPosition}
        userAddr={userAddr}
        onSuccess={handleOperationSuccess}
      />
    </div>
  );
}
