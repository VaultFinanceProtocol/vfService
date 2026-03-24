import { cn } from "@lib/utils";
import { Shield, AlertTriangle, AlertCircle } from "lucide-react";

interface HealthFactorBadgeProps {
  value: string | number;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function HealthFactorBadge({
  value,
  className,
  showIcon = true,
  size = "md",
}: HealthFactorBadgeProps) {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  let variant: "safe" | "warning" | "danger" = "safe";
  if (numValue < 1.0) {
    variant = "danger";
  } else if (numValue < 1.2) {
    variant = "warning";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const variantStyles = {
    safe: {
      backgroundColor: "var(--risk-safe-bg)",
      color: "var(--risk-safe)",
    },
    warning: {
      backgroundColor: "var(--risk-warning-bg)",
      color: "var(--risk-warning)",
    },
    danger: {
      backgroundColor: "var(--risk-danger-bg)",
      color: "var(--risk-danger)",
    },
  };

  const Icon = variant === "safe" ? Shield : variant === "warning" ? AlertTriangle : AlertCircle;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-semibold tabular-nums",
        sizeClasses[size],
        className
      )}
      style={variantStyles[variant]}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {numValue.toFixed(2)}
    </span>
  );
}

export function formatHealthFactor(value: string | number | undefined): {
  value: string;
  variant: "safe" | "warning" | "danger";
} {
  if (!value || value === "∞") {
    return { value: "∞", variant: "safe" };
  }

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (num < 1.0) {
    return { value: num.toFixed(2), variant: "danger" };
  } else if (num < 1.2) {
    return { value: num.toFixed(2), variant: "warning" };
  }

  return { value: num.toFixed(2), variant: "safe" };
}
