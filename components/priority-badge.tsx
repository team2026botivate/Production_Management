import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PriorityBadgeProps {
  priority: "Normal" | "Urgent"
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        priority === "Urgent"
          ? "bg-red-500/20 text-red-400 border-red-500/30"
          : "bg-slate-500/20 text-slate-400 border-slate-500/30",
      )}
    >
      {priority}
    </Badge>
  )
}
