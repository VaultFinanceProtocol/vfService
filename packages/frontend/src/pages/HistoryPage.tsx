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
  History,
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
  MinusCircle,
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useHistory } from "@hooks/useHistory";
import { OperationStatus, OperationType } from "@types/index";
import { formatAmount } from "@utils/format";

const MOCK_USER = "user1234567890abcdef1234567890abcdef123456";

const typeIcons: Record<OperationType, React.ReactNode> = {
  [OperationType.SUPPLY]: <ArrowUpCircle className="h-4 w-4 text-green-600" />,
  [OperationType.WITHDRAW]: <ArrowDownCircle className="h-4 w-4 text-orange-600" />,
  [OperationType.BORROW]: <PlusCircle className="h-4 w-4 text-blue-600" />,
  [OperationType.REPAY]: <MinusCircle className="h-4 w-4 text-purple-600" />,
  [OperationType.LIQUIDATE]: <AlertTriangle className="h-4 w-4 text-red-600" />,
  [OperationType.SET_COLLATERAL]: <CheckCircle className="h-4 w-4 text-gray-600" />,
};

const statusConfig: Record<OperationStatus, { color: string; icon: React.ReactNode }> = {
  [OperationStatus.DRAFTED]: { color: "bg-gray-100 text-gray-800", icon: <Clock className="h-3 w-3" /> },
  [OperationStatus.BROADCAST]: { color: "bg-blue-100 text-blue-800", icon: <Clock className="h-3 w-3" /> },
  [OperationStatus.PENDING]: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3 w-3" /> },
  [OperationStatus.CONFIRMED]: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3" /> },
  [OperationStatus.FAILED]: { color: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3" /> },
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

  const formatType = (type: OperationType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">History</h2>
          <p className="text-muted-foreground">View your transaction history</p>
        </div>
        <Button variant="outline" onClick={() => refresh()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select
                value={status || "all"}
                onValueChange={(value) => setStatus(value === "all" ? undefined : (value as OperationStatus))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading history...</p>
            </div>
          ) : records && records.length > 0 ? (
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {typeIcons[record.type]}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {formatType(record.type)}
                        <Badge
                          variant="secondary"
                          className={`${statusConfig[record.status].color} flex items-center gap-1`}
                        >
                          {statusConfig[record.status].icon}
                          {record.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Asset: {record.asset.slice(0, 8)}...{record.asset.slice(-6)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(record.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <div className="font-medium">
                      {formatAmount(record.amount, 8)}
                    </div>
                    {record.txid && (
                      <div className="text-xs text-muted-foreground">
                        TX: {record.txid.slice(0, 8)}...{record.txid.slice(-6)}
                      </div>
                    )}
                    {record.error && (
                      <div className="text-xs text-red-600 mt-1">
                        Error: {record.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {offset + 1} - {Math.min(offset + limit, meta?.total || 0)} of {meta?.total || 0}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={offset === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!meta?.hasMore}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No transaction history found.</p>
              <p className="text-sm">Your operations will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
