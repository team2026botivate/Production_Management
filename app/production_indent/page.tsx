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
import { useProduction } from "@/lib/production-context"
import { Toaster } from "sonner"
import { TableFilters } from "@/components/table-filters"
import { useMemo } from "react"

const stages = ["Production Indent Creation", "BOM Validation", "Quality Approval", "Packing Receipt", "Production"]

function ProductionIndentContent() {
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

  const [partyFilter, setPartyFilter] = useState("all")
  const [productFilter, setProductFilter] = useState("all")
  const [packingFilter, setPackingFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const partyNames = useMemo(() => {
    return Array.from(new Set(indents.map(i => i.partyName))).sort()
  }, [indents])

  const filteredIndents = useMemo(() => {
    return indents.filter((indent) => {
      const matchesParty = partyFilter === "all" || indent.partyName === partyFilter
      const matchesProduct = productFilter === "all" || indent.productName === productFilter
      const matchesPacking = packingFilter === "all" || indent.packingType === packingFilter
      const matchesPriority = priorityFilter === "all" || indent.priority === priorityFilter
      
      const indentStatus = indent.isProductionCompleted ? "Completed" : "Pending"
      const matchesStatus = statusFilter === "all" || indentStatus === statusFilter

      return matchesParty && matchesProduct && matchesPacking && matchesPriority && matchesStatus
    })
  }, [indents, partyFilter, productFilter, packingFilter, priorityFilter, statusFilter])

  const stats = {
    totalIndents: indents.length,
    pendingApprovals: indents.filter((i) => i.status === "Generated").length,
    issuedBatches: indents.filter((i) => i.status === "Issued").length,
    packingCompleted: indents.filter((i) => i.status === "Completed").length,
  }

  const clearFilters = () => {
    setPartyFilter("all")
    setProductFilter("all")
    setPackingFilter("all")
    setPriorityFilter("all")
    setStatusFilter("all")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden bg-[#fafafa]">
        {/* Fixed Header Section */}
        <div className="p-8 pb-4">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground/90">Production Indent Creation</h1>
                <p className="text-muted-foreground font-medium">Manage and track your production workflow efficiently</p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={() => setIsAddModalOpen(true)} className="rounded-xl px-6 h-11 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Indent
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Flexible Table Section */}
        <div className="flex-1 overflow-hidden p-8 pt-2">
          <div className="max-w-[1400px] mx-auto h-full flex flex-col">
            <TableFilters 
              partyFilter={partyFilter}
              onPartyFilterChange={setPartyFilter}
              partyNames={partyNames}
              productFilter={productFilter}
              onProductFilterChange={setProductFilter}
              packingFilter={packingFilter}
              onPackingFilterChange={setPackingFilter}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onClearFilters={clearFilters}
            />
            <Card className="flex-1 border-border/60 shadow-xl shadow-black/[0.03] rounded-2xl overflow-hidden border-none bg-card flex flex-col">
              <CardHeader className="border-b border-border/40 py-5 px-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    Live Indent Pipeline
                  </CardTitle>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-secondary px-3 py-1 rounded-full">
                    {filteredIndents.length} Items Total
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <IndentTable data={filteredIndents} onProceed={handleProceed} statusField="workflow" />
              </CardContent>
            </Card>
          </div>
        </div>

        <AddIndentModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
        <Toaster position="top-right" theme="light" richColors />
      </main>
    </div>
  )
}

export default function ProductionIndentPage() {
  return <ProductionIndentContent />
}
