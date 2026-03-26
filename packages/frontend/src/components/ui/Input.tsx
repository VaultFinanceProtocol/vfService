import * as React from "react"
import { cn } from "@lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border border-border bg-background-input px-4 text-sm text-foreground",
          "placeholder:text-foreground-tertiary",
          "transition-all duration-150",
          "hover:border-border-strong",
          "focus:border-brand focus:ring-2 focus:ring-brand-light",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
