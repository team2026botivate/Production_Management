import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusType =
  | "Generated"
  | "Approved"
  | "Issued"
  | "Completed"
  | "Hold"
  | "Modify"
  | "Pending"
  | "Rejected"
  | "Pass"
  | "Fail"

interface StatusBadgeProps {
  status: StatusType
}

const statusStyles: Record<StatusType, string> = {
  Generated: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Approved: "bg-green-500/20 text-green-400 border-green-500/30",
  Issued: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Hold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Modify: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Pending: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  Rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  Pass: "bg-green-500/20 text-green-400 border-green-500/30",
  Fail: "bg-red-500/20 text-red-400 border-red-500/30",
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("font-medium", statusStyles[status])}>
      {status}
    </Badge>
  )
}
