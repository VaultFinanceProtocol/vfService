import { cn } from "@lib/utils";
import { ArrowRight, Info, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/Card";
import { AmountDisplay } from "./amount-display";

interface QuoteItem {
  label: string;
  value: string | number;
  valuePrefix?: string;
  valueSuffix?: string;
  valueDecimals?: number;
  valueVariant?: "default" | "positive" | "negative" | "muted";
  highlight?: boolean;
  tooltip?: string;
}

interface QuotePanelProps {
  title?: string;
  subtitle?: string;
  operation: "supply" | "withdraw" | "borrow" | "repay" | "liquidate";
  fromAsset: {
    symbol: string;
    amount: string | number;
    usdValue: string | number;
    icon?: string;
  };
  toAsset?: {
    symbol: string;
    amount: string | number;
    usdValue: string | number;
    icon?: string;
  };
  quoteItems: QuoteItem[];
  warnings?: string[];
  className?: string;
}

const operationTitles = {
  supply: "Supply Summary",
  withdraw: "Withdraw Summary",
  borrow: "Borrow Summary",
  repay: "Repay Summary",
  liquidate: "Liquidation Preview",
};

const operationColors = {
  supply: "var(--success)",
  withdraw: "var(--warning)",
  borrow: "var(--primary)",
  repay: "var(--success)",
  liquidate: "var(--danger)",
};

export function QuotePanel({
  title,
  subtitle,
  operation,
  fromAsset,
  toAsset,
  quoteItems,
  warnings,
  className,
}: QuotePanelProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{title || operationTitles[operation]}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Asset Flow */}
        <div
          className="flex items-center gap-3 p-3 rounded-lg"
          style={{ backgroundColor: "var(--bg-elevated)" }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {fromAsset.icon ? (
                <img
                  src={fromAsset.icon}
                  alt={fromAsset.symbol}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: "var(--primary-muted)", color: "var(--primary)" }}
                >
                  {fromAsset.symbol[0]}
                </div>
              )}
              <div>
                <div className="font-semibold text-[var(--fg)]">
                  <AmountDisplay value={fromAsset.amount} decimals={6} />
                  <span className="ml-1">{fromAsset.symbol}</span>
                </div>
                <div className="text-xs text-[var(--fg-muted)]">
                  ≈ $<AmountDisplay value={fromAsset.usdValue} decimals={2} />
                </div>
              </div>
            </div>
          </div>

          {toAsset && (
            <>
              <ArrowRight
                className="h-5 w-5 flex-shrink-0"
                style={{ color: operationColors[operation] }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {toAsset.icon ? (
                    <img
                      src={toAsset.icon}
                      alt={toAsset.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: "var(--primary-muted)",
                        color: "var(--primary)",
                      }}
                    >
                      {toAsset.symbol[0]}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-[var(--fg)]">
                      <AmountDisplay value={toAsset.amount} decimals={6} />
                      <span className="ml-1">{toAsset.symbol}</span>
                    </div>
                    <div className="text-xs text-[var(--fg-muted)]">
                      ≈ $<AmountDisplay value={toAsset.usdValue} decimals={2} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quote Details */}
        <div className="space-y-2">
          {quoteItems.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between py-2",
                index !== quoteItems.length - 1 &&
                  "border-b border-[var(--border)]"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-[var(--fg-muted)]">
                  {item.label}
                </span>
                {item.tooltip && (
                  <Info className="h-3.5 w-3.5 text-[var(--fg-muted)] cursor-help" />
                )}
              </div>
              <AmountDisplay
                value={item.value}
                prefix={item.valuePrefix}
                suffix={item.valueSuffix}
                decimals={item.valueDecimals ?? 4}
                variant={item.valueVariant}
                className={cn(
                  item.highlight && "font-semibold",
                  item.valueVariant === "positive" && "text-[var(--success)]",
                  item.valueVariant === "negative" && "text-[var(--danger)]"
                )}
              />
            </div>
          ))}
        </div>

        {/* Warnings */}
        {warnings && warnings.length > 0 && (
          <div
            className="p-3 rounded-lg space-y-2"
            style={{ backgroundColor: "var(--risk-warning-bg)" }}
          >
            {warnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-2">
                <TrendingDown
                  className="h-4 w-4 mt-0.5 flex-shrink-0"
                  style={{ color: "var(--risk-warning)" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--risk-warning)" }}
                >
                  {warning}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simplified version for inline use
interface QuoteRowProps {
  label: string;
  value: string | number;
  valuePrefix?: string;
  valueSuffix?: string;
  valueDecimals?: number;
  valueVariant?: "default" | "positive" | "negative" | "muted";
  tooltip?: string;
  className?: string;
}

export function QuoteRow({
  label,
  value,
  valuePrefix,
  valueSuffix,
  valueDecimals = 4,
  valueVariant = "default",
  tooltip,
  className,
}: QuoteRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-[var(--fg-muted)]">{label}</span>
        {tooltip && (
          <Info className="h-3.5 w-3.5 text-[var(--fg-muted)] cursor-help" />
        )}
      </div>
      <AmountDisplay
        value={value}
        prefix={valuePrefix}
        suffix={valueSuffix}
        decimals={valueDecimals}
        variant={valueVariant}
      />
    </div>
  );
}

// Health factor change preview
interface HealthFactorChangeProps {
  before: string | number;
  after: string | number;
  className?: string;
}

export function HealthFactorChange({
  before,
  after,
  className,
}: HealthFactorChangeProps) {
  const beforeNum = typeof before === "string" ? parseFloat(before) : before;
  const afterNum = typeof after === "string" ? parseFloat(after) : after;
  const isImproving = afterNum > beforeNum;
  const isRisky = afterNum < 1.2;

  return (
    <div
      className={cn(
        "flex items-center justify-between py-2",
        className
      )}
    >
      <span className="text-sm text-[var(--fg-muted)]">Health Factor</span>
      <div className="flex items-center gap-2">
        <span
          className="font-medium tabular-nums"
          style={{
            color:
              beforeNum >= 1.2
                ? "var(--risk-safe)"
                : beforeNum >= 1.0
                ? "var(--risk-warning)"
                : "var(--risk-danger)",
          }}
        >
          {beforeNum.toFixed(2)}
        </span>
        <ArrowRight className="h-4 w-4 text-[var(--fg-muted)]" />
        <span
          className="font-medium tabular-nums"
          style={{
            color: isRisky
              ? "var(--risk-danger)"
              : isImproving
              ? "var(--success)"
              : "var(--warning)",
          }}
        >
          {afterNum.toFixed(2)}
        </span>
        {isImproving ? (
          <TrendingUp className="h-4 w-4 text-[var(--success)]" />
        ) : (
          <TrendingDown className="h-4 w-4 text-[var(--warning)]" />
        )}
      </div>
    </div>
  );
}
