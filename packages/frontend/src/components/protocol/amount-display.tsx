import { cn } from "@lib/utils";

interface AmountDisplayProps {
  value: string | number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "positive" | "negative" | "muted";
}

export function AmountDisplay({
  value,
  prefix = "",
  suffix = "",
  decimals = 2,
  className,
  size = "md",
  variant = "default",
}: AmountDisplayProps) {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  const formatted = numValue.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-2xl",
  };

  const variantStyles = {
    default: { color: "var(--fg)" },
    positive: { color: "var(--success)" },
    negative: { color: "var(--danger)" },
    muted: { color: "var(--fg-muted)" },
  };

  return (
    <span
      className={cn("font-medium tabular-nums tracking-tight", sizeClasses[size], className)}
      style={variantStyles[variant]}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
