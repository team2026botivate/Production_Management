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
        "font-bold uppercase text-[9px] tracking-wider px-2 py-0 border-none rounded-full ring-1 ring-inset",
        priority === "Urgent"
          ? "bg-rose-50 text-rose-600 ring-rose-200"
          : "bg-slate-50 text-slate-500 ring-slate-200",
      )}
    >
      {priority}
    </Badge>
  )
}
