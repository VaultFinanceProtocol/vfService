import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@components/ui/Dialog";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Label } from "@components/ui/Label";
import { Switch } from "@components/ui/Switch";
import { Alert, AlertDescription } from "@components/ui/Alert";
import { quotesApi, transactionsApi } from "@services/api";
import {
  formatAmount,
  formatAPY,
  formatHealthFactor,
} from "@utils/format";
import { Loader2, AlertTriangle, CheckCircle, Wallet } from "lucide-react";
import type { QuoteResponse, TransactionDraft } from "../../types/index";

interface OperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: "withdraw" | "repay" | null;
  position: {
    asset: string;
    symbol: string;
    decimals: number;
    suppliedAmount?: string;
    suppliedShares?: string;
    borrowedAmount?: string;
    borrowAPY?: string;
    supplyAPY?: string;
  } | null;
  userAddr: string;
  onSuccess?: () => void;
}

export function OperationModal({
  isOpen,
  onClose,
  operation,
  position,
  userAddr,
  onSuccess,
}: OperationModalProps) {
  const [amount, setAmount] = useState("");
  const [useInternal, setUseInternal] = useState(true);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [draft, setDraft] = useState<TransactionDraft | null>(null);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [txid, setTxid] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [step, setStep] = useState<"input" | "quote" | "draft" | "success">("input");

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setAmount("");
    setUseInternal(true);
    setQuote(null);
    setDraft(null);
    setTxid(null);
    setStep("input");
  };

  const handleGetQuote = async () => {
    if (!position || !amount) return;

    setIsLoadingQuote(true);
    try {
      const amountInSats = (
        parseFloat(amount) *
        10 ** position.decimals
      ).toString();

      let response;
      if (operation === "withdraw") {
        response = await quotesApi.withdraw({
          userAddr,
          asset: position.asset,
          shares: amountInSats,
          minAmount: "0", // TODO: calculate min with slippage
        });
      } else {
        response = await quotesApi.repay({
          userAddr,
          asset: position.asset,
          amount: amountInSats,
          useInternal,
        });
      }

      setQuote(response.data.data);
      setStep("quote");
    } catch (error) {
      console.error("Quote error:", error);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const handleCreateDraft = async () => {
    if (!position || !quote) return;

    setIsCreatingDraft(true);
    try {
      const amountInSats = (
        parseFloat(amount) *
        10 ** position.decimals
      ).toString();

      let response;
      if (operation === "withdraw") {
        response = await transactionsApi.createWithdrawDraft({
          userAddr,
          asset: position.asset,
          shares: amountInSats,
          minAmount: "0",
        });
      } else {
        response = await transactionsApi.createRepayDraft({
          userAddr,
          asset: position.asset,
          amount: amountInSats,
          useInternal,
        });
      }

      setDraft(response.data.data);
      setStep("draft");
    } catch (error) {
      console.error("Draft error:", error);
    } finally {
      setIsCreatingDraft(false);
    }
  };

  const handleBroadcast = async () => {
    if (!draft || !position) return;

    setIsBroadcasting(true);
    try {
      // Mock signed transaction - in real implementation,
      // this would be signed by the wallet
      const mockSignedTx = draft.psbtBase64;

      const response = await transactionsApi.broadcast({
        signedTx: mockSignedTx,
        operation: operation!,
        userAddr,
        asset: position.asset,
        amount: (parseFloat(amount) * 10 ** position.decimals).toString(),
      });

      setTxid(response.data.data.txid);
      setStep("success");
      onSuccess?.();
    } catch (error) {
      console.error("Broadcast error:", error);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!position || !operation) return null;

  const isWithdraw = operation === "withdraw";
  const title = isWithdraw ? "Withdraw" : "Repay";
  const actionColor = isWithdraw ? "text-buy" : "text-brand";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${actionColor}`}>
            {title} {position.symbol}
          </DialogTitle>
          <DialogDescription>
            {isWithdraw
              ? "Withdraw your supplied liquidity"
              : "Repay your borrowed debt"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Input Amount */}
        {step === "input" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount ({position.symbol})</Label>
              <Input
                type="number"
                placeholder={`Enter ${position.symbol} amount`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="text-sm text-muted-foreground">
                Available: {" "}
                {isWithdraw
                  ? formatAmount(
                      position.suppliedAmount || "0",
                      position.decimals
                    )
                  : formatAmount(
                      position.borrowedAmount || "0",
                      position.decimals
                    )}{" "}
                {position.symbol}
              </div>
            </div>

            {!isWithdraw && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="internal"
                  checked={useInternal}
                  onCheckedChange={setUseInternal}
                />
                <Label htmlFor="internal">Use supply position to repay</Label>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleGetQuote}
              disabled={!amount || isLoadingQuote}
            >
              {isLoadingQuote ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Get Quote"
              )}
            </Button>
          </div>
        )}

        {/* Step 2: Show Quote */}
        {step === "quote" && quote && (
          <div className="space-y-4">
            {!quote.feasible ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">Transaction Not Feasible</div>
                  <ul className="mt-1 text-sm list-disc list-inside">
                    {quote.reasons?.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Alert className="bg-buy-light border-border">
                  <CheckCircle className="h-4 w-4 text-buy" />
                  <AlertDescription className="text-buy">
                    Transaction is feasible
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 rounded-lg border p-4">
                  {quote.computed.expectedAPY && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Expected APY
                      </span>
                      <span>{formatAPY(quote.computed.expectedAPY)}</span>
                    </div>
                  )}

                  {quote.computed.healthFactorBefore && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Health Factor (Before)
                      </span>
                      <span>{quote.computed.healthFactorBefore}</span>
                    </div>
                  )}

                  {quote.computed.healthFactorAfter && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Health Factor (After)
                      </span>
                      <span
                        className={
                          formatHealthFactor(quote.computed.healthFactorAfter)
                            .color
                        }
                      >
                        {quote.computed.healthFactorAfter}
                      </span>
                    </div>
                  )}

                  {quote.txPlan && (
                    <>
                      <div className="border-t my-2" />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Estimated Fee
                        </span>
                        <span>{quote.txPlan.estimatedFee} sats</span>
                      </div>
                    </>
                  )}
                </div>

                {quote.warnings && quote.warnings.length > 0 && (
                  <Alert className="bg-background-elevated border-border">
                    <AlertTriangle className="h-4 w-4 text-brand" />
                    <AlertDescription className="text-foreground-secondary">
                      <div className="font-medium">Warnings:</div>
                      <ul className="mt-1 text-sm list-disc list-inside">
                        {quote.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("input")}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleCreateDraft}
                    disabled={isCreatingDraft}
                  >
                    {isCreatingDraft ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Transaction"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Show Draft */}
        {step === "draft" && draft && (
          <div className="space-y-4">
            <Alert>
              <Wallet className="h-4 w-4" />
              <AlertDescription>
                Transaction draft created. Review and sign to broadcast.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 rounded-lg border p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Operation</span>
                <span>{draft.operation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee</span>
                <span>{draft.fee} sats</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inputs</span>
                <span>{draft.inputs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outputs</span>
                <span>{draft.outputs.length}</span>
              </div>
              {draft.metadata.requiresGuard && (
                <div className="text-xs text-brand">
                  * Requires Guard verification
                </div>
              )}
              {draft.metadata.requiresCreateOp && (
                <div className="text-xs text-brand">
                  * Requires CreateOp backtrace
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("quote")}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleBroadcast}
                disabled={isBroadcasting}
              >
                {isBroadcasting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  "Sign & Broadcast"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === "success" && txid && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-buy-light flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-buy" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium">Transaction Submitted!</h3>
              <p className="text-sm text-muted-foreground">
                Your transaction has been broadcast to the network.
              </p>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">
                Transaction ID
              </div>
              <div className="text-sm font-mono break-all">{txid}</div>
            </div>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
