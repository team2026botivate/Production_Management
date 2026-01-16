"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { RawMaterial, ProductionIndent } from "@/lib/production-data"
import { toast } from "sonner"

interface ReviewMaterialModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  material: RawMaterial | null
  indent: ProductionIndent | null
  onSubmit: (id: string, status: "Approved" | "Hold" | "Modify", remarks: string) => void
}

export function ReviewMaterialModal({ open, onOpenChange, material, indent, onSubmit }: ReviewMaterialModalProps) {
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
      <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Review Raw Material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Linked Indent Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/20 rounded-lg border border-border">
            <div className="space-y-1.5">
              <Label htmlFor="indentNo" className="text-xs uppercase tracking-wider text-muted-foreground">Indent No (Linked)</Label>
              <Input id="indentNo" value={indent?.productionIndentNo || "N/A"} disabled className="bg-background/50 h-9 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="productName" className="text-xs uppercase tracking-wider text-muted-foreground">Product Name</Label>
              <Input id="productName" value={indent?.productName || "N/A"} disabled className="bg-background/50 h-9" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <span className="w-8 h-px bg-border"></span>
              Raw Material Details
              <span className="flex-1 h-px bg-border"></span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="materialName">Raw Material Name</Label>
                <Input id="materialName" value={material.name} disabled className="bg-secondary/30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bomVersion">BOM Version</Label>
                <Input id="bomVersion" value={material.bomVersion} disabled className="bg-secondary/30 font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stdQty">Standard Qty per MT</Label>
                <Input id="stdQty" value={material.standardQtyPerMT} disabled className="bg-secondary/30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredQty">Required Qty (Auto)</Label>
                <Input id="requiredQty" value={material.requiredQty.toFixed(2)} disabled className="bg-secondary/30 font-semibold text-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availableStock">Available Stock (Live)</Label>
                <Input id="availableStock" value={material.availableStock.toFixed(2)} disabled className="bg-secondary/30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortageQty">Shortage Qty (Auto)</Label>
                <Input
                  id="shortageQty"
                  value={material.shortageQty.toFixed(2)}
                  disabled
                  className={cn(
                    "bg-secondary/30 font-semibold",
                    material.shortageQty > 0 ? "text-red-600 bg-red-50" : ""
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <div className="space-y-2">
              <Label htmlFor="remarks" className="font-semibold text-primary">Approval Remarks</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter approval remarks..."
                rows={3}
                className="focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="font-semibold text-primary">Status</Label>
              <Select value={status} onValueChange={(value: "Approved" | "Hold" | "Modify") => setStatus(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved" className="text-green-600">Approved</SelectItem>
                  <SelectItem value="Hold" className="text-amber-600">Hold</SelectItem>
                  <SelectItem value="Modify" className="text-blue-600">Modify</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-8">
              Cancel
            </Button>
            <Button type="submit" className="px-8 bg-primary hover:bg-primary/90">Submit Review</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
