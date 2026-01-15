"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { RawMaterial } from "@/lib/production-data"
import { toast } from "sonner"

interface ReviewMaterialModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  material: RawMaterial | null
  onSubmit: (id: string, status: "Approved" | "Hold" | "Modify", remarks: string) => void
}

export function ReviewMaterialModal({ open, onOpenChange, material, onSubmit }: ReviewMaterialModalProps) {
  const [status, setStatus] = useState<"Approved" | "Hold" | "Modify">("Approved")
  const [remarks, setRemarks] = useState("")

  useEffect(() => {
    if (material) {
      setStatus("Approved")
      setRemarks("")
    }
  }, [material])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (material) {
      onSubmit(material.id, status, remarks)
      toast.success("Approved Raw Material Plan", {
        description: `${material.name} has been ${status.toLowerCase()}`,
      })
      onOpenChange(false)
    }
  }

  if (!material) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Review Raw Material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="materialName">Raw Material Name</Label>
            <Input id="materialName" value={material.name} disabled className="bg-secondary/50" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requiredQty">Required Quantity</Label>
              <Input id="requiredQty" value={material.requiredQty.toFixed(2)} disabled className="bg-secondary/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availableStock">Available Stock</Label>
              <Input
                id="availableStock"
                value={material.availableStock.toFixed(2)}
                disabled
                className="bg-secondary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortageQty">Shortage Quantity</Label>
            <Input
              id="shortageQty"
              value={material.shortageQty.toFixed(2)}
              disabled
              className={material.shortageQty > 0 ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-secondary/50"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Approval Remarks</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter approval remarks..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: "Approved" | "Hold" | "Modify") => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Hold">Hold</SelectItem>
                <SelectItem value="Modify">Modify</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Review</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
