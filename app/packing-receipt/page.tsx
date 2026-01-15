"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StageIndicator } from "@/components/stage-indicator"
import { AppSidebar } from "@/components/app-sidebar"
import { ProductionProvider, useProduction } from "@/lib/production-context"
import { generateGRNNo, type PackingReceipt } from "@/lib/production-data"
import { toast, Toaster } from "sonner"

const stages = ["Dashboard", "BOM Validation", "Quality Approval", "Packing Receipt", "Production"]

function PackingReceiptContent() {
  const router = useRouter()
  const { setPackingReceipt, setCurrentStage } = useProduction()
  const [formData, setFormData] = useState({
    receivedQuantity: "",
    receiptDate: new Date().toISOString().split("T")[0],
    receiptTime: new Date().toTimeString().slice(0, 5),
    receiverName: "",
    grnSlipNo: generateGRNNo(),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const receipt: PackingReceipt = {
      id: Date.now().toString(),
      receivedQuantity: Number.parseFloat(formData.receivedQuantity),
      receiptDateTime: `${formData.receiptDate}T${formData.receiptTime}`,
      receiverName: formData.receiverName,
      grnSlipNo: formData.grnSlipNo,
    }

    setPackingReceipt(receipt)
    toast.success("Packing Receipt Generated", {
      description: `GRN No: ${formData.grnSlipNo}`,
    })
  }

  const handleProceed = () => {
    setCurrentStage(5)
    router.push("/packing-production")
  }

  const handleBack = () => {
    setCurrentStage(3)
    router.push("/quality-approval")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Packing Receipt Confirmation</h1>
              <p className="text-muted-foreground">Confirm receipt of materials for packing</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleProceed}>
                Proceed to Production
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <StageIndicator currentStage={4} stages={stages} />

          <Card className="border-border max-w-xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Packing Receipt Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="receivedQuantity">Received Quantity (MT)</Label>
                  <Input
                    id="receivedQuantity"
                    type="number"
                    step="0.1"
                    value={formData.receivedQuantity}
                    onChange={(e) => setFormData({ ...formData, receivedQuantity: e.target.value })}
                    placeholder="Enter received quantity"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="receiptDate">Receipt Date</Label>
                    <Input
                      id="receiptDate"
                      type="date"
                      value={formData.receiptDate}
                      onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receiptTime">Receipt Time</Label>
                    <Input
                      id="receiptTime"
                      type="time"
                      value={formData.receiptTime}
                      onChange={(e) => setFormData({ ...formData, receiptTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiverName">Receiver Name</Label>
                  <Input
                    id="receiverName"
                    value={formData.receiverName}
                    onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                    placeholder="Enter receiver name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grnSlipNo">GRN / Receipt Slip No</Label>
                  <Input id="grnSlipNo" value={formData.grnSlipNo} disabled className="bg-secondary/50 font-mono" />
                  <p className="text-xs text-muted-foreground">Auto-generated receipt number</p>
                </div>

                <Button type="submit" className="w-full">
                  Generate Packing Receipt
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Toaster position="top-right" theme="dark" richColors />
      </main>
    </div>
  )
}

export default function PackingReceiptPage() {
  return (
    <ProductionProvider>
      <PackingReceiptContent />
    </ProductionProvider>
  )
}
