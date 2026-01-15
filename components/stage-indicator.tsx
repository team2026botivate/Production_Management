"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StageIndicatorProps {
  currentStage: number
  stages: string[]
}

export function StageIndicator({ currentStage, stages }: StageIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto py-6">
      {stages.map((stage, index) => {
        const stageNum = index + 1
        const isActive = stageNum === currentStage
        const isCompleted = stageNum < currentStage

        return (
          <div key={stage} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  isCompleted && "bg-primary text-primary-foreground",
                  isActive && "bg-primary text-primary-foreground ring-4 ring-primary/30",
                  !isActive && !isCompleted && "bg-secondary text-muted-foreground",
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stageNum}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center max-w-[80px]",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {stage}
              </span>
            </div>
            {index < stages.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-2", stageNum < currentStage ? "bg-primary" : "bg-border")} />
            )}
          </div>
        )
      })}
    </div>
  )
}
