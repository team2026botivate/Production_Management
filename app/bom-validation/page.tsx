"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StageIndicator } from "@/components/stage-indicator"
import { StatusBadge } from "@/components/status-badge"
import { ReviewMaterialModal } from "@/components/review-material-modal"
import { AppSidebar } from "@/components/app-sidebar"
import { ProductionProvider, useProduction } from "@/lib/production-context"
import type { RawMaterial } from "@/lib/production-data"
import { Toaster } from "sonner"

const stages = ["Dashboard", "BOM Validation", "Quality Approval", "Packing Receipt", "Production"]

function BOMValidationContent() {
  const router = useRouter()
  const { selectedIndent, rawMaterials, updateRawMaterial, setCurrentStage } = useProduction()
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null)

  const handleReview = (material: RawMaterial) => {
    setSelectedMaterial(material)
    setIsReviewModalOpen(true)
  }

  const handleSubmitReview = (id: string, status: "Approved" | "Hold" | "Modify") => {
    updateRawMaterial(id, { status })
  }

  const handleProceed = () => {
    setCurrentStage(3)
    router.push("/quality-approval")
  }

  const handleBack = () => {
    setCurrentStage(1)
    router.push("/")
  }

  // Default indent for demo
  const indent = selectedIndent || {
    productionIndentNo: "PI-001245",
    productName: "Rice Bran Oil",
    plannedQuantity: 25,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">BOM & Raw Material Validation</h1>
              <p className="text-muted-foreground">Validate and approve raw materials for production</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleProceed}>
                Proceed to Quality
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <StageIndicator currentStage={2} stages={stages} />

          <Card className="border-border mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Indent Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Indent No</p>
                  <p className="font-mono text-primary text-lg">{indent.productionIndentNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Product Name</p>
                  <p className="font-medium text-lg">{indent.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Planned Quantity</p>
                  <p className="font-medium text-lg">{indent.plannedQuantity} MT</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Raw Material Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="text-muted-foreground font-semibold">Raw Material Name</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">BOM Version</TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-right">Std Qty/MT</TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-right">Required Qty</TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-right">Available Stock</TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-right">Shortage Qty</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawMaterials.map((material) => (
                      <TableRow key={material.id} className="hover:bg-secondary/30">
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell className="font-mono text-sm">{material.bomVersion}</TableCell>
                        <TableCell className="text-right">{material.standardQtyPerMT}</TableCell>
                        <TableCell className="text-right">{material.requiredQty.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{material.availableStock.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              material.shortageQty > 0 ? "text-red-400 flex items-center justify-end gap-1" : ""
                            }
                          >
                            {material.shortageQty > 0 && <AlertTriangle className="w-4 h-4" />}
                            {material.shortageQty.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={material.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleReview(material)}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <ReviewMaterialModal
          open={isReviewModalOpen}
          onOpenChange={setIsReviewModalOpen}
          material={selectedMaterial}
          onSubmit={handleSubmitReview}
        />
        <Toaster position="top-right" theme="dark" richColors />
      </main>
    </div>
  )
}

export default function BOMValidationPage() {
  return (
    <ProductionProvider>
      <BOMValidationContent />
    </ProductionProvider>
  )
}
