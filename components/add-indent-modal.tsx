"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProduction } from "@/lib/production-context"
import { generateIndentNo, type ProductionIndent } from "@/lib/production-data"
import { toast } from "sonner"

interface AddIndentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddIndentModal({ open, onOpenChange }: AddIndentModalProps) {
  const { addIndent } = useProduction()
  const [formData, setFormData] = useState({
    dispatchPlanRefNo: "",
    partyName: "",
    productName: "",
    plannedQuantity: "",
    packingType: "Tin" as "Tin" | "Pouch" | "Barrel",
    expectedDispatchDate: "",
    priority: "Normal" as "Normal" | "Urgent",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newIndent: ProductionIndent = {
      id: Date.now().toString(),
      productionIndentNo: generateIndentNo(),
      dispatchPlanRefNo: formData.dispatchPlanRefNo,
      partyName: formData.partyName,
      productName: formData.productName,
      plannedQuantity: Number.parseFloat(formData.plannedQuantity),
      packingType: formData.packingType,
      expectedDispatchDate: formData.expectedDispatchDate,
      priority: formData.priority,
      status: "Generated",
    }

    addIndent(newIndent)
    toast.success("Production Indent Generated", {
      description: `Indent No: ${newIndent.productionIndentNo}`,
    })
    onOpenChange(false)
    setFormData({
      dispatchPlanRefNo: "",
      partyName: "",
      productName: "",
      plannedQuantity: "",
      packingType: "Tin",
      expectedDispatchDate: "",
      priority: "Normal",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add Production Indent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dispatchPlanRefNo">Dispatch Plan Reference No</Label>
              <Input
                id="dispatchPlanRefNo"
                value={formData.dispatchPlanRefNo}
                onChange={(e) => setFormData({ ...formData, dispatchPlanRefNo: e.target.value })}
                placeholder="DP-2026-XXX"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partyName">Party / Customer Name</Label>
              <Input
                id="partyName"
                value={formData.partyName}
                onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                placeholder="Enter customer name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Select
                value={formData.productName}
                onValueChange={(value) => setFormData({ ...formData, productName: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rice Bran Oil">Rice Bran Oil</SelectItem>
                  <SelectItem value="Sunflower Oil">Sunflower Oil</SelectItem>
                  <SelectItem value="Groundnut Oil">Groundnut Oil</SelectItem>
                  <SelectItem value="Soybean Oil">Soybean Oil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plannedQuantity">Planned Quantity (MT)</Label>
              <Input
                id="plannedQuantity"
                type="number"
                step="0.1"
                value={formData.plannedQuantity}
                onChange={(e) => setFormData({ ...formData, plannedQuantity: e.target.value })}
                placeholder="0.0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="packingType">Packing Type</Label>
              <Select
                value={formData.packingType}
                onValueChange={(value: "Tin" | "Pouch" | "Barrel") => setFormData({ ...formData, packingType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select packing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tin">Tin</SelectItem>
                  <SelectItem value="Pouch">Pouch</SelectItem>
                  <SelectItem value="Barrel">Barrel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedDispatchDate">Expected Dispatch Date</Label>
              <Input
                id="expectedDispatchDate"
                type="date"
                value={formData.expectedDispatchDate}
                onChange={(e) => setFormData({ ...formData, expectedDispatchDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: "Normal" | "Urgent") => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Generate Indent</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
