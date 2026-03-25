import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/Tabs";

import { usePositions, useHealthFactor } from "@hooks/usePositions";
import { formatUSD, formatAmount, formatAPY, formatHealthFactor } from "@utils/format";
import { OperationModal } from "@components/operations/OperationModal";
import { useWallet } from "@contexts/wallet-context";
import type { UserPosition } from "@app-types";
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

export function PositionsPage() {
  const [userAddr] = useState(MOCK_USER);
  const { summary, isLoading, mutate: refreshPositions } = usePositions(userAddr);
  const { healthFactor } = useHealthFactor(userAddr);
  useWallet();

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
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--fg)]">
          My Positions
        </h1>
        <p className="text-[var(--fg-muted)] mt-1">Manage your supplies and borrows</p>
      </div>

      {/* Health Factor Summary */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ 
                    backgroundColor: parseFloat(healthFactor || "999") < 1.2 
                      ? 'var(--danger-muted)' 
                      : 'var(--success-muted)' 
                  }}
                >
                  <span className={`text-xl font-bold ${healthFactorStyle.color}`}>
                    {healthFactorStyle.value}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-[var(--fg)]">Health Factor</div>
                  <div className="text-sm text-[var(--fg-muted)]">
                    {parseFloat(healthFactor || "999") < 1.0 
                      ? "At risk of liquidation!" 
                      : parseFloat(healthFactor || "999") < 1.2 
                      ? "Low - Add collateral" 
                      : "Healthy position"}
                  </div>
                </div>
              </div>

              {summary?.accountData && (
                <div className="flex flex-wrap gap-6 sm:gap-8">
                  <div>
                    <div className="text-xs text-[var(--fg-muted)] uppercase tracking-wide">Collateral</div>
                    <div className="text-lg font-semibold text-[var(--fg)]">{formatUSD(summary.accountData.totalCollateralUSD)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--fg-muted)] uppercase tracking-wide">Debt</div>
                    <div className="text-lg font-semibold text-[var(--danger)]">{formatUSD(summary.accountData.totalDebtUSD)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--fg-muted)] uppercase tracking-wide">Available</div>
                    <div className="text-lg font-semibold text-[var(--success)]">{formatUSD(summary.accountData.availableBorrowsUSD)}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supplies & Borrows */}
      <Tabs defaultValue="supplies" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-xl bg-[var(--bg-muted)] p-1 h-12">
          <TabsTrigger 
            value="supplies" 
            className="rounded-lg data-[state=active]:bg-[var(--card)] data-[state=active]:shadow-sm"
          >
            Supplied Assets
          </TabsTrigger>
          <TabsTrigger 
            value="borrows"
            className="rounded-lg data-[state=active]:bg-[var(--card)] data-[state=active]:shadow-sm"
          >
            Borrowed Assets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="supplies" className="mt-6">
          <Card>
            <CardHeader className="border-b border-[var(--border)]">
              <CardTitle className="text-lg">Supplied Assets</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : summary?.supplies && summary.supplies.length > 0 ? (
                <div className="divide-y divide-[var(--border)]">
                  {summary.supplies.map((position) => (
                    <div
                      key={position.asset}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4 hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <AssetIcon 
                          symbol={position.symbol} 
                          className="w-10 h-10 text-sm"
                        />
                        <div>
                          <div className="font-semibold text-[var(--fg)]">{position.symbol}</div>
                          <div className="text-sm text-[var(--fg-muted)]">
                            {formatAmount(position.suppliedAmount, position.decimals)} {position.symbol}
                          </div>
                          {position.usedAsCollateral && (
                            <div className="text-xs text-[var(--primary)] mt-0.5">Used as Collateral</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="text-right">
                          <div className="font-semibold text-[var(--fg)]">{formatUSD(position.suppliedValueUSD)}</div>
                          <div className="text-sm text-[var(--success)]">{formatAPY(position.supplyAPY)} APY</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg border-[var(--border)] hover:bg-[var(--bg-hover)]"
                          onClick={() => openWithdrawModal(position)}
                        >
                          Withdraw
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-[var(--fg-muted)]">
                  <div className="text-lg font-medium text-[var(--fg)]">No supplied assets</div>
                  <p className="text-sm mt-1">Go to Markets to start supplying</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="borrows" className="mt-6">
          <Card>
            <CardHeader className="border-b border-[var(--border)]">
              <CardTitle className="text-lg">Borrowed Assets</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : summary?.borrows && summary.borrows.length > 0 ? (
                <div className="divide-y divide-[var(--border)]">
                  {summary.borrows.map((position) => (
                    <div
                      key={position.asset}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4 hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <AssetIcon 
                          symbol={position.symbol} 
                          className="w-10 h-10 text-sm"
                        />
                        <div>
                          <div className="font-semibold text-[var(--fg)]">{position.symbol}</div>
                          <div className="text-sm text-[var(--fg-muted)]">
                            {formatAmount(position.borrowedAmount, position.decimals)} {position.symbol}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="text-right">
                          <div className="font-semibold text-[var(--fg)]">{formatUSD(position.borrowedValueUSD)}</div>
                          <div className="text-sm text-[var(--primary)]">{formatAPY(position.borrowAPY)} APY</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg border-[var(--border)] hover:bg-[var(--bg-hover)]"
                          onClick={() => openRepayModal(position)}
                        >
                          Repay
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-[var(--fg-muted)]">
                  <div className="text-lg font-medium text-[var(--fg)]">No borrowed assets</div>
                  <p className="text-sm mt-1">Supply collateral first to enable borrowing</p>
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
