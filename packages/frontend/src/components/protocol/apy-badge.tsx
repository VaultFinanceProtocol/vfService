import { cn } from "@lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface APYBadgeProps {
  value: number;
  type?: "supply" | "borrow";
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function APYBadge({ value, type = "supply", showIcon = false, size = "md", className }: APYBadgeProps) {
  const isPositive = type === "supply";
  const percentage = (value * 100).toFixed(2);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold transition-all duration-150",
        isPositive
          ? "bg-buy-light text-buy"
          : "bg-sell-light text-sell",
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )
      )}
      <span>{percentage}%</span>
    </div>
  );
}
