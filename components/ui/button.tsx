import type * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "outlined" | "ghost" | "default" | "destructive" | "outline" | "link"
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"
  asChild?: boolean
}

function getVariantClasses(variant: ButtonProps["variant"] = "default"): string {
  const variants = {
    primary: "bg-primary text-[#fff] hover:bg-primary/90 shadow-sm",
    secondary: "bg-secondary text-[#fff] hover:bg-secondary/90 shadow-sm",
    outlined: "border-2 border-primary bg-transparent text-primary hover:bg-primary/10",
    ghost: "text-primary hover:bg-primary/10",
    default: "bg-primary text-[#fff] hover:bg-primary/90",
    destructive:
      "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
    outline:
      "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
    link: "text-primary underline-offset-4 hover:underline",
  }
  return variants[variant]
}

function getSizeClasses(size: ButtonProps["size"] = "default"): string {
  const sizes = {
    default: "h-10 px-6 py-2.5 has-[>svg]:px-5",
    sm: "h-9 rounded-md gap-1.5 px-4 py-2 has-[>svg]:px-3.5",
    lg: "h-11 rounded-md px-8 text-lg py-6 font-semibold has-[>svg]:px-6",
    icon: "size-10",
    "icon-sm": "size-9",
    "icon-lg": "size-11",
  }
  return sizes[size]
}

function Button({ className, variant = "default", size = "default", asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  const baseClasses =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"

  return (
    <Comp
      data-slot="button"
      className={cn(baseClasses, getVariantClasses(variant), getSizeClasses(size), className)}
      {...props}
    />
  )
}

export { Button }
export type { ButtonProps }
