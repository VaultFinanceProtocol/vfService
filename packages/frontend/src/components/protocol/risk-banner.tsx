import { cn } from "@lib/utils";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  Shield,
  TrendingDown,
  Flame,
} from "lucide-react";

interface RiskBannerProps {
  variant: "info" | "warning" | "danger" | "success";
  title?: string;
  message: string;
  details?: string[];
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantConfig = {
  info: {
    icon: Info,
    bgColor: "var(--info-bg)",
    borderColor: "var(--info)",
    textColor: "var(--info)",
    iconColor: "var(--info)",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "var(--risk-warning-bg)",
    borderColor: "var(--risk-warning)",
    textColor: "var(--risk-warning)",
    iconColor: "var(--risk-warning)",
  },
  danger: {
    icon: AlertCircle,
    bgColor: "var(--risk-danger-bg)",
    borderColor: "var(--risk-danger)",
    textColor: "var(--risk-danger)",
    iconColor: "var(--risk-danger)",
  },
  success: {
    icon: Shield,
    bgColor: "var(--risk-safe-bg)",
    borderColor: "var(--risk-safe)",
    textColor: "var(--risk-safe)",
    iconColor: "var(--risk-safe)",
  },
};

export function RiskBanner({
  variant,
  title,
  message,
  details,
  action,
  dismissible,
  onDismiss,
  className,
}: RiskBannerProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative rounded-lg border-l-4 p-4",
        className
      )}
      style={{
        backgroundColor: config.bgColor,
        borderLeftColor: config.borderColor,
      }}
    >
      <div className="flex gap-3">
        <Icon
          className="h-5 w-5 flex-shrink-0 mt-0.5"
          style={{ color: config.iconColor }}
        />
        <div className="flex-1 min-w-0">
          {title && (
            <h4
              className="font-semibold text-sm mb-1"
              style={{ color: config.textColor }}
            >
              {title}
            </h4>
          )}
          <p
            className="text-sm leading-relaxed"
            style={{ color: config.textColor }}
          >
            {message}
          </p>
          {details && details.length > 0 && (
            <ul className="mt-2 space-y-1">
              {details.map((detail, index) => (
                <li
                  key={index}
                  className="text-sm flex items-start gap-2"
                  style={{ color: config.textColor }}
                >
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0" />
                  <span className="opacity-90">{detail}</span>
                </li>
              ))}
            </ul>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-3 text-sm font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
              style={{ color: config.textColor }}
            >
              {action.label}
            </button>
          )}
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded hover:opacity-70 transition-opacity"
            style={{ color: config.textColor }}
          >
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// Specialized banners for specific use cases

interface LiquidationRiskBannerProps {
  healthFactor: string | number;
  liquidationThreshold: string | number;
  className?: string;
}

export function LiquidationRiskBanner({
  healthFactor,
  liquidationThreshold,
  className,
}: LiquidationRiskBannerProps) {
  const hf =
    typeof healthFactor === "string" ? parseFloat(healthFactor) : healthFactor;
  const lt =
    typeof liquidationThreshold === "string"
      ? parseFloat(liquidationThreshold)
      : liquidationThreshold;

  if (hf >= 1.2) return null;

  const variant = hf < 1.0 ? "danger" : "warning";
  const title = hf < 1.0 ? "Liquidation Risk" : "Low Health Factor";
  const message =
    hf < 1.0
      ? `Your health factor is below 1.0. Your position is at risk of liquidation. Repay debt or add collateral immediately.`
      : `Your health factor is low (${hf.toFixed(
          2
        )}). Consider repaying debt or adding collateral to reduce liquidation risk.`;

  return (
    <RiskBanner
      variant={variant}
      title={title}
      message={message}
      className={className}
    />
  );
}

interface InsufficientCollateralBannerProps {
  requiredCollateral: string | number;
  availableCollateral: string | number;
  assetSymbol: string;
  className?: string;
}

export function InsufficientCollateralBanner({
  requiredCollateral,
  availableCollateral,
  assetSymbol,
  className,
}: InsufficientCollateralBannerProps) {
  return (
    <RiskBanner
      variant="warning"
      title="Insufficient Collateral"
      message={`You need ${requiredCollateral} ${assetSymbol} as collateral to proceed. Your available collateral is ${availableCollateral} ${assetSymbol}.`}
      className={className}
    />
  );
}

interface HighSlippageBannerProps {
  slippagePercent: string | number;
  threshold?: number;
  className?: string;
}

export function HighSlippageBanner({
  slippagePercent,
  threshold = 1,
  className,
}: HighSlippageBannerProps) {
  const slippage =
    typeof slippagePercent === "string"
      ? parseFloat(slippagePercent)
      : slippagePercent;

  if (slippage < threshold) return null;

  return (
    <RiskBanner
      variant={slippage > 5 ? "danger" : "warning"}
      title="High Slippage Warning"
      message={`The slippage for this transaction is ${slippage.toFixed(
        2
      )}%. You may receive less than expected.`}
      className={className}
    />
  );
}

interface PoolPausedBannerProps {
  assetSymbol: string;
  reason?: string;
  className?: string;
}

export function PoolPausedBanner({
  assetSymbol,
  reason,
  className,
}: PoolPausedBannerProps) {
  return (
    <RiskBanner
      variant="warning"
      icon={AlertTriangle}
      title={`${assetSymbol} Pool Paused`}
      message={
        reason ||
        `The ${assetSymbol} pool is currently paused. You cannot supply, withdraw, borrow, or repay this asset at this time.`
      }
      className={className}
    />
  );
}

interface GasEstimationBannerProps {
  estimatedGas: string | number;
  gasTokenSymbol?: string;
  className?: string;
}

export function GasEstimationBanner({
  estimatedGas,
  gasTokenSymbol = "ETH",
  className,
}: GasEstimationBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm",
        className
      )}
      style={{
        backgroundColor: "var(--bg-elevated)",
        color: "var(--fg-muted)",
      }}
    >
      <Flame className="h-4 w-4" />
      <span>
        Estimated Gas: ~{estimatedGas} {gasTokenSymbol}
      </span>
    </div>
  );
}

interface MarketStatusBannerProps {
  status: "active" | "frozen" | "paused" | "deprecated";
  assetSymbol: string;
  ltv?: string | number;
  className?: string;
}

export function MarketStatusBanner({
  status,
  assetSymbol,
  ltv,
  className,
}: MarketStatusBannerProps) {
  const config = {
    active: {
      variant: "success" as const,
      icon: Shield,
      title: `${assetSymbol} Market Active`,
      message: ltv
        ? `Supply and borrow are active. Maximum LTV: ${ltv}%.`
        : "Supply and borrow are active.",
    },
    frozen: {
      variant: "warning" as const,
      icon: AlertTriangle,
      title: `${assetSymbol} Market Frozen`,
      message: `The ${assetSymbol} market is frozen. New supply and borrow are disabled. You can still withdraw and repay.`,
    },
    paused: {
      variant: "warning" as const,
      icon: AlertTriangle,
      title: `${assetSymbol} Market Paused`,
      message: `The ${assetSymbol} market is paused. All operations are temporarily disabled.`,
    },
    deprecated: {
      variant: "danger" as const,
      icon: XCircle,
      title: `${assetSymbol} Market Deprecated`,
      message: `The ${assetSymbol} market is deprecated. Please withdraw your funds and repay any debt as soon as possible.`,
    },
  };

  const { variant, title, message } = config[status];

  return (
    <RiskBanner
      variant={variant}
      title={title}
      message={message}
      className={className}
    />
  );
}

// Add icon prop support to RiskBanner
interface RiskBannerExtendedProps extends RiskBannerProps {
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

export function RiskBannerExtended({
  variant,
  icon: CustomIcon,
  ...props
}: RiskBannerExtendedProps) {
  const config = variantConfig[variant];
  const Icon = CustomIcon || config.icon;

  return (
    <RiskBanner
      variant={variant}
      {...props}
    />
  );
}
