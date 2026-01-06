"use client"

import type React from "react"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface InfoButtonProps {
  title?: string
  description?: string
  children?: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl",
  classname?: string
}

const iconSizes = {
  sm: "size-3",
  md: "size-4",
  lg: "size-5",
  xl: "size-6",
}

export function InfoButton({
  title = "Información",
  description = "Esta es información importante que debes conocer.",
  children,
  size = "md",
  classname
}: InfoButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className={"p-0 px-0 w-[fit-content] h-auto " + classname} aria-label="Mostrar información" style={{padding: "0"}}>
          <Info className={iconSizes[size]} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children && <div className="mt-2 text-sm text-foreground">{children}</div>}
      </DialogContent>
    </Dialog>
  )
}
