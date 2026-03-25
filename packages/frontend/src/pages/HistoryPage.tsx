import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Badge } from "@components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/Select";
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useHistory } from "@hooks/useHistory";
import { OperationStatus, OperationType } from "@app-types";
import { formatAmount } from "@utils/format";
import { cn } from "@lib/utils";

const MOCK_USER = "user1234567890abcdef1234567890abcdef123456";

const statusConfig: Record<OperationStatus, { bg: string; text: string }> = {
  [OperationStatus.DRAFTED]: { 
    bg: 'var(--bg-muted)', 
    text: 'var(--fg-muted)', 
  },
  [OperationStatus.BROADCAST]: { 
    bg: 'var(--primary-muted)', 
    text: 'var(--primary)', 
  },
  [OperationStatus.PENDING]: { 
    bg: 'var(--warning-muted)', 
    text: 'var(--warning)', 
  },
  [OperationStatus.CONFIRMED]: { 
    bg: 'var(--success-muted)', 
    text: 'var(--success)', 
  },
  [OperationStatus.FAILED]: { 
    bg: 'var(--danger-muted)', 
    text: 'var(--danger)', 
  },
};

const typeLabels: Record<OperationType, string> = {
  [OperationType.SUPPLY]: 'Supply',
  [OperationType.WITHDRAW]: 'Withdraw',
  [OperationType.BORROW]: 'Borrow',
  [OperationType.REPAY]: 'Repay',
  [OperationType.LIQUIDATE]: 'Liquidate',
  [OperationType.SET_COLLATERAL]: 'Set Collateral',
};

export function HistoryPage() {
  const [userAddr] = useState(MOCK_USER);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(10);
  const [status, setStatus] = useState<OperationStatus | undefined>(undefined);

  const { records, meta, isLoading, refresh } = useHistory(userAddr, {
    offset,
    limit,
    status,
  });

  const handlePrevPage = () => {
    if (offset >= limit) {
      setOffset(offset - limit);
    }
  };

  const handleNextPage = () => {
    if (meta?.hasMore) {
      setOffset(offset + limit);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--fg)]">
            History
          </h1>
          <p className="text-[var(--fg-muted)] mt-1">View your transaction history</p>
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--fg-muted)]">Status:</span>
              <Select
                value={status || "all"}
                onValueChange={(value) => setStatus(value === "all" ? undefined : (value as OperationStatus))}
              >
                <SelectTrigger className="w-[180px] rounded-lg h-10">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={OperationStatus.DRAFTED}>Drafted</SelectItem>
                  <SelectItem value={OperationStatus.BROADCAST}>Broadcast</SelectItem>
                  <SelectItem value={OperationStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={OperationStatus.CONFIRMED}>Confirmed</SelectItem>
                  <SelectItem value={OperationStatus.FAILED}>Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-[var(--border)]">
          <CardTitle className="text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[var(--fg-muted)]" />
              <p className="mt-2 text-[var(--fg-muted)]">Loading history...</p>
            </div>
          ) : records && records.length > 0 ? (
            <div className="divide-y divide-[var(--border)]">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-6 gap-4 hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div>
                    <div className="font-medium text-[var(--fg)] flex items-center gap-2 flex-wrap">
                      {typeLabels[record.type]}
                      <Badge
                        className="rounded-md text-xs font-medium border-0"
                        style={{
                          backgroundColor: statusConfig[record.status].bg,
                          color: statusConfig[record.status].text,
                        }}
                      >
                        {record.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-[var(--fg-muted)]">
                      Asset: {record.asset.slice(0, 8)}...{record.asset.slice(-6)}
                    </div>
                    <div className="text-xs text-[var(--fg-muted)]">
                      {formatDate(record.createdAt)}
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-1">
                    <div className="font-semibold text-[var(--fg)] text-lg">
                      {formatAmount(record.amount, 8)}
                    </div>
                    {record.txid && (
                      <div className="text-xs text-[var(--fg-muted)]">
                        TX: {record.txid.slice(0, 8)}...{record.txid.slice(-6)}
                      </div>
                    )}
                    {record.error && (
                      <div className="text-xs text-[var(--danger)]">
                        Error: {record.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-t border-[var(--border)]">
                <div className="text-sm text-[var(--fg-muted)]">
                  Showing {offset + 1} - {Math.min(offset + limit, meta?.total || 0)} of {meta?.total || 0}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={offset === 0}
                    className="rounded-lg gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!meta?.hasMore}
                    className="rounded-lg gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--fg-muted)]">
              <div className="text-lg font-medium text-[var(--fg)]">No transaction history found</div>
              <p className="text-sm mt-1">Your operations will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
