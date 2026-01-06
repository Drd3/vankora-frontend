import * as React from "react"
import { cn } from "@/lib/utils"

export interface PaperProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: "none" | "sm" | "md" | "lg" | "xl"
  variant?: "default" | "outlined"
}

const elevationClasses = {
  none: "",
  sm: "shadow-sm p-8",
  md: "shadow-md rounded-[20px] p-8",
  lg: "shadow-lg p-8",
  xl: "shadow-xl p-8",
}

const Paper = React.forwardRef<HTMLDivElement, PaperProps>(
  ({ className, elevation = "sm", variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-[#EDEDED] transition-shadow p-4",
          variant === "default" && "bg-card text-card-foreground",
          variant === "outlined" && "bg-transparent",
          elevationClasses[elevation],
          className,
        )}
        {...props}
      />
    )
  },
)
Paper.displayName = "Paper"

export { Paper }
