"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react"
import { StatusBadge } from "./status-badge"
import type { ProductionIndent, RawMaterial } from "@/lib/production-data"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface IndentReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  indent: ProductionIndent | null
  rawMaterials: RawMaterial[]
  onUpdateMaterial: (id: string, updates: Partial<RawMaterial>) => void
  onValidateIndent: (id: string) => void
  onProceed: () => void
}

export function IndentReviewModal({
  open,
  onOpenChange,
  indent,
  rawMaterials,
  onUpdateMaterial,
  onValidateIndent,
  onProceed,
}: IndentReviewModalProps) {
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("")
  const [remarks, setRemarks] = useState("")
  const [status, setStatus] = useState<"Approved" | "Hold" | "Modify">("Approved")

  const selectedMaterial = rawMaterials.find(m => m.id === selectedMaterialId) || rawMaterials[0]

  useEffect(() => {
    if (open && rawMaterials.length > 0 && !selectedMaterialId) {
      setSelectedMaterialId(rawMaterials[0].id)
    }
  }, [open, rawMaterials, selectedMaterialId])

  useEffect(() => {
    if (selectedMaterial) {
      setRemarks("")
      setStatus(selectedMaterial.status === "Pending" ? "Approved" : selectedMaterial.status as any)
    }
  }, [selectedMaterialId, selectedMaterial])

  if (!indent) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedMaterial) {
      onUpdateMaterial(selectedMaterial.id, { status, shortageQty: selectedMaterial.shortageQty }) // Keeping it simple
      onValidateIndent(indent.id)
      toast.success("Validation Updated", {
        description: `${selectedMaterial.name} status set to ${status}`
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-card border-border max-h-[95vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-4">
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-bold text-primary">BOM & Raw Material Validation</DialogTitle>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="font-semibold text-foreground">{indent.productionIndentNo}</span>
              • {indent.productName}
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Section 1: Linked Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Indent No</Label>
              <Input value={indent.productionIndentNo} disabled className="bg-secondary/30 font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Product Name</Label>
              <Input value={indent.productName} disabled className="bg-secondary/30" />
            </div>
          </div>

          <div className="space-y-4 border rounded-xl p-5 bg-secondary/10 border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Raw Material Details
              </h3>
            </div>

            {selectedMaterial && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">Raw Material Name</Label>
                  <Input value={selectedMaterial.name} disabled className="bg-background/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">BOM Version</Label>
                  <Input value={selectedMaterial.bomVersion} disabled className="bg-background/50 font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">Standard Qty per MT</Label>
                  <Input value={selectedMaterial.standardQtyPerMT} disabled className="bg-background/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs font-semibold text-primary">Required Qty</Label>
                  <Input value={selectedMaterial.requiredQty.toFixed(2)} disabled className="bg-primary/5 border-primary/20 text-primary font-bold" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">Available Stock</Label>
                  <Input value={selectedMaterial.availableStock.toFixed(2)} disabled className="bg-background/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs font-semibold text-red-600">Shortage Qty</Label>
                  <Input 
                    value={selectedMaterial.shortageQty.toFixed(2)} 
                    disabled 
                    className={cn(
                      "bg-background/50 font-bold",
                      selectedMaterial.shortageQty > 0 ? "text-red-600 border-red-200 bg-red-50" : ""
                    )} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: User Inputs */}
          <div className="space-y-4 border-t border-border pt-4">
            <div className="space-y-2">
              <Label className="font-bold text-primary">Approval Remarks</Label>
              <Textarea 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter validation remarks..."
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-primary">Status</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved" className="text-green-600 font-medium">Approved</SelectItem>
                  <SelectItem value="Hold" className="text-amber-600 font-medium">Hold</SelectItem>
                  <SelectItem value="Modify" className="text-blue-600 font-medium">Modify</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-6">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="px-8 font-semibold">
              Close
            </Button>
            <Button type="submit" className="px-10 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
              Submit Validation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
