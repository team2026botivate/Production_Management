"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, FileText, Clock, Truck, PackageCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SummaryCard } from "@/components/summary-card"
import { IndentTable } from "@/components/indent-table"
import { AddIndentModal } from "@/components/add-indent-modal"
import { StageIndicator } from "@/components/stage-indicator"
import { AppSidebar } from "@/components/app-sidebar"
import { ProductionProvider, useProduction } from "@/lib/production-context"
import { Toaster } from "sonner"

const stages = ["Dashboard", "BOM Validation", "Quality Approval", "Packing Receipt", "Production"]

function DashboardContent() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { indents, setSelectedIndent, setCurrentStage } = useProduction()
  const router = useRouter()

  const handleProceed = (indentId: string) => {
    const indent = indents.find((i) => i.id === indentId)
    if (indent) {
      setSelectedIndent(indent)
      setCurrentStage(2)
      router.push("/bom-validation")
    }
  }

  const stats = {
    totalIndents: indents.length,
    pendingApprovals: indents.filter((i) => i.status === "Generated").length,
    issuedBatches: indents.filter((i) => i.status === "Issued").length,
    packingCompleted: indents.filter((i) => i.status === "Completed").length,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Production Control Dashboard</h1>
              <p className="text-muted-foreground">Manage production indents and track workflow progress</p>
            </div>
          </div>

          <StageIndicator currentStage={1} stages={stages} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SummaryCard
              title="Total Indents"
              value={stats.totalIndents}
              icon={<FileText className="w-6 h-6" />}
              variant="primary"
            />
            <SummaryCard
              title="Pending Approvals"
              value={stats.pendingApprovals}
              icon={<Clock className="w-6 h-6" />}
              variant="warning"
            />
            <SummaryCard
              title="Issued Batches"
              value={stats.issuedBatches}
              icon={<Truck className="w-6 h-6" />}
              variant="default"
            />
            <SummaryCard
              title="Packing Completed"
              value={stats.packingCompleted}
              icon={<PackageCheck className="w-6 h-6" />}
              variant="success"
            />
          </div>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Production Indent List</CardTitle>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Production Indent
              </Button>
            </CardHeader>
            <CardContent>
              <IndentTable onProceed={handleProceed} />
            </CardContent>
          </Card>
        </div>

        <AddIndentModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
        <Toaster position="top-right" theme="dark" richColors />
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProductionProvider>
      <DashboardContent />
    </ProductionProvider>
  )
}
