import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SummaryCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  variant?: "default" | "primary" | "warning" | "success"
}

export function SummaryCard({ title, value, icon, variant = "default" }: SummaryCardProps) {
  return (
    <Card
      className={cn(
        "border-border/50",
        variant === "primary" && "border-l-4 border-l-primary",
        variant === "warning" && "border-l-4 border-l-warning",
        variant === "success" && "border-l-4 border-l-success",
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div
            className={cn(
              "p-3 rounded-lg",
              variant === "default" && "bg-secondary text-muted-foreground",
              variant === "primary" && "bg-primary/10 text-primary",
              variant === "warning" && "bg-warning/10 text-warning",
              variant === "success" && "bg-success/10 text-success",
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
