import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        brand: "bg-brand-light text-brand",
        buy: "bg-buy-light text-buy",
        sell: "bg-sell-light text-sell",
        neutral: "bg-background-elevated text-foreground-secondary border border-border",
        outline: "border border-border text-foreground-secondary",
      },
    },
    defaultVariants: {
      variant: "brand",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
