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
  Generated: "bg-blue-100/80 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
  Approved: "bg-green-100/80 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30",
  Issued: "bg-cyan-100/80 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/30",
  Completed: "bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
  Hold: "bg-yellow-100/80 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30",
  Modify: "bg-orange-100/80 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30",
  Pending: "bg-slate-100/80 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30",
  Rejected: "bg-red-100/80 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
  Pass: "bg-green-100/80 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30",
  Fail: "bg-red-100/80 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("font-medium", statusStyles[status])}>
      {status}
    </Badge>
  )
}
