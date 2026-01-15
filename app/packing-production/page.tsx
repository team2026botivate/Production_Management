"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Factory, Trash2, Plus, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StageIndicator } from "@/components/stage-indicator"
import { AppSidebar } from "@/components/app-sidebar"
import { ProductionProvider, useProduction } from "@/lib/production-context"
import { toast, Toaster } from "sonner"

const stages = ["Dashboard", "BOM Validation", "Quality Approval", "Packing Receipt", "Production"]

interface ConsumptionItem {
  id: string
  name: string
  plannedQty: number
  actualConsumedQty: number
  variance: number
}

interface WastageItem {
  id: string
  rawMaterial: string
  quantity: number
  remarks: string
  supervisorApproval: boolean
}

function PackingProductionContent() {
  const router = useRouter()
  const { rawMaterials, setCurrentStage } = useProduction()

  const [consumptionData, setConsumptionData] = useState<ConsumptionItem[]>(
    rawMaterials.map((rm) => ({
      id: rm.id,
      name: rm.name,
      plannedQty: rm.requiredQty,
      actualConsumedQty: rm.requiredQty,
      variance: 0,
    })),
  )

  const [wastageData, setWastageData] = useState<WastageItem[]>([
    {
      id: "1",
      rawMaterial: "",
      quantity: 0,
      remarks: "",
      supervisorApproval: false,
    },
  ])

  const handleConsumptionChange = (id: string, actualQty: number) => {
    setConsumptionData((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const variance = actualQty - item.plannedQty
          return { ...item, actualConsumedQty: actualQty, variance }
        }
        return item
      }),
    )
  }

  const handleWastageChange = (id: string, field: keyof WastageItem, value: string | number | boolean) => {
    setWastageData((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value }
        }
        return item
      }),
    )
  }

  const addWastageRow = () => {
    setWastageData((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        rawMaterial: "",
        quantity: 0,
        remarks: "",
        supervisorApproval: false,
      },
    ])
  }

  const removeWastageRow = (id: string) => {
    setWastageData((prev) => prev.filter((item) => item.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Final Production & Consumption Report", {
      description: "Production cycle completed successfully",
    })
  }

  const handleBack = () => {
    setCurrentStage(4)
    router.push("/packing-receipt")
  }

  const handleFinish = () => {
    setCurrentStage(1)
    router.push("/")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Packing Production & Consumption</h1>
              <p className="text-muted-foreground">Track raw material consumption and wastage</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleFinish}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Workflow
              </Button>
            </div>
          </div>

          <StageIndicator currentStage={5} stages={stages} />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section A: Raw Material Consumption */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="w-5 h-5 text-primary" />
                  Section A: Raw Material Consumption
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                        <TableHead className="text-muted-foreground font-semibold">Raw Material Name</TableHead>
                        <TableHead className="text-muted-foreground font-semibold text-right">
                          Planned Qty (Auto)
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold text-right">
                          Actual Consumed Qty
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold text-right">Variance (+/-)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consumptionData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-secondary/30">
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">{item.plannedQty.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.01"
                              value={item.actualConsumedQty}
                              onChange={(e) => handleConsumptionChange(item.id, Number.parseFloat(e.target.value) || 0)}
                              className="w-24 text-right ml-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                item.variance > 0
                                  ? "text-red-400"
                                  : item.variance < 0
                                    ? "text-green-400"
                                    : "text-muted-foreground"
                              }
                            >
                              {item.variance > 0 ? "+" : ""}
                              {item.variance.toFixed(2)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Section B: Wastage Tracking */}
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-primary" />
                  Section B: Wastage Tracking
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addWastageRow}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Row
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wastageData.map((item, index) => (
                    <div key={item.id} className="border border-border rounded-lg p-4 bg-secondary/20">
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-sm text-muted-foreground">Wastage Entry #{index + 1}</span>
                        {wastageData.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeWastageRow(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Wastage Raw Material</Label>
                          <Input
                            value={item.rawMaterial}
                            onChange={(e) => handleWastageChange(item.id, "rawMaterial", e.target.value)}
                            placeholder="Enter material name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Wastage Quantity</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.quantity || ""}
                            onChange={(e) =>
                              handleWastageChange(item.id, "quantity", Number.parseFloat(e.target.value) || 0)
                            }
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Label>Remarks</Label>
                        <Textarea
                          value={item.remarks}
                          onChange={(e) => handleWastageChange(item.id, "remarks", e.target.value)}
                          placeholder="Enter remarks..."
                          rows={2}
                        />
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <Checkbox
                          id={`approval-${item.id}`}
                          checked={item.supervisorApproval}
                          onCheckedChange={(checked) => handleWastageChange(item.id, "supervisorApproval", !!checked)}
                        />
                        <Label htmlFor={`approval-${item.id}`} className="text-sm cursor-pointer">
                          Supervisor Approval
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full">
              Submit Final Production & Consumption Report
            </Button>
          </form>
        </div>

        <Toaster position="top-right" theme="dark" richColors />
      </main>
    </div>
  )
}

export default function PackingProductionPage() {
  return (
    <ProductionProvider>
      <PackingProductionContent />
    </ProductionProvider>
  )
}
