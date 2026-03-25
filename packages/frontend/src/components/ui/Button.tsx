import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] text-[var(--primary-contrast)] hover:bg-[var(--primary-hover)] hover:shadow-md",
        destructive:
          "bg-[var(--danger)] text-[var(--danger-contrast)] hover:bg-[var(--danger-hover)]",
        outline:
          "border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)]",
        secondary:
          "bg-[var(--bg-muted)] text-[var(--fg)] hover:bg-[var(--bg-hover)]",
        ghost: "hover:bg-[var(--bg-hover)] text-[var(--fg-muted)] hover:text-[var(--fg)]",
        link: "text-[var(--primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
