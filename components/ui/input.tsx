import * as React from "react"
import { cn } from "@/lib/utils"

export interface CustomInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: "outlined" | "filled" | "underlined" | "ghost"
  inputSize?: "sm" | "md" | "lg"
  error?: boolean
  helperText?: string
  label?: string
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, variant = "outlined", inputSize = "md", error = false, helperText, label, ...props }, ref) => {
    const variantStyles = {
      outlined: "border-2 border-input bg-background focus:border-ring",
      filled: "border-0 bg-muted focus:bg-accent",
      underlined: "border-0 border-b-2 border-input rounded-none px-0 focus:border-ring",
      ghost: "border-0 bg-transparent focus:bg-accent/50",
    }

    const sizeStyles = {
      sm: "h-8 px-3 py-1 text-sm",
      md: "h-10 px-4 py-2 text-base",
      lg: "h-12 px-5 py-3 text-lg",
    }

    const errorStyles = error ? "border-destructive focus:border-destructive text-destructive" : ""

    return (
      <div className="w-full">
        {label && (
          <label className={cn("block mb-2 text-sm font-medium", error ? "text-destructive" : "text-foreground")}>
            {label}
          </label>
        )}
        <input
          className={cn(
            "flex w-full rounded-lg transition-all duration-200",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            variantStyles[variant],
            sizeStyles[inputSize],
            errorStyles,
            className,
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p className={cn("mt-1.5 text-sm", error ? "text-destructive" : "text-muted-foreground")}>{helperText}</p>
        )}
      </div>
    )
  },
)

CustomInput.displayName = "CustomInput"

export { CustomInput }
