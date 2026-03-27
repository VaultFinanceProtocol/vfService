import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { cn } from "@lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down";
  trendValue?: string;
  variant?: "default" | "brand" | "success";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
        variant === "brand" && "border-brand/20 bg-brand-light/5",
        variant === "success" && "border-buy/20 bg-buy-light/5",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground-secondary">
            {title}
          </CardTitle>
          {Icon && (
            <Icon className="w-4 h-4 text-foreground-tertiary" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold text-foreground">{value}</div>
          {trend && trendValue && (
            <span
              className={cn(
                "text-xs font-semibold",
                trend === "up" ? "text-buy" : "text-sell"
              )}
            >
              {trend === "up" ? "+" : ""}{trendValue}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-foreground-secondary mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
