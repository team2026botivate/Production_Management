"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ChevronDown, Info, ClipboardList, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AppSidebar } from "@/components/app-sidebar"
import { IndentTable } from "@/components/indent-table"
import { useProduction } from "@/lib/production-context"
import { cn } from "@/lib/utils"
import { Toaster, toast } from "sonner"
import { TableFilters } from "@/components/table-filters"
import { useMemo } from "react"

export default function BOMValidationPage() {
  const router = useRouter()
  const { indents, selectedIndent, setSelectedIndent, rawMaterials, updateRawMaterial, updateIndent, setCurrentStage } = useProduction()
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending")
  const [approvalStatus, setApprovalStatus] = useState<string>("Approved")
  const [approvalRemarks, setApprovalRemarks] = useState("")
  const [editableMaterials, setEditableMaterials] = useState<any[]>([])

  const [partyFilter, setPartyFilter] = useState("all")
  const [productFilter, setProductFilter] = useState("all")
  const [packingFilter, setPackingFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const partyNames = useMemo(() => {
    return Array.from(new Set(indents.map(i => i.partyName))).sort()
  }, [indents])

  // Filter indents based on active tab and search/filters
  const filteredIndentsAvailable = useMemo(() => {
    return indents.filter((indent) => {
      const isCorrectTab = activeTab === "pending" ? !indent.isBomValidated : indent.isBomValidated
      
      const matchesParty = partyFilter === "all" || indent.partyName === partyFilter
      const matchesProduct = productFilter === "all" || indent.productName === productFilter
      const matchesPacking = packingFilter === "all" || indent.packingType === packingFilter
      const matchesPriority = priorityFilter === "all" || indent.priority === priorityFilter

      return isCorrectTab && matchesParty && matchesProduct && matchesPacking && matchesPriority
    })
  }, [indents, activeTab, partyFilter, productFilter, packingFilter, priorityFilter])

  const pendingCount = indents.filter(i => !i.isBomValidated).length
  const historyCount = indents.filter(i => i.isBomValidated).length
  
  const clearFilters = () => {
    setPartyFilter("all")
    setProductFilter("all")
    setPackingFilter("all")
    setPriorityFilter("all")
  }

  // Sync form state when an indent is selected (for both Pending and History)
  useEffect(() => {
    if (selectedIndent) {
      setApprovalStatus(selectedIndent.bomStatus || "Approved")
      setApprovalRemarks(selectedIndent.bomRemarks || "")
      
      // Initialize editable materials
      const initial = rawMaterials
        .filter(rm => {
          if (selectedIndent.packingType === "Tin") {
            return ["Rope", "Cartoon", "Tin", "Sticker"].includes(rm.name)
          }
          if (selectedIndent.packingType === "Pouch") {
            return ["Rope", "Cartoon", "Pouch", "Sticker"].includes(rm.name)
          }
          if (selectedIndent.packingType === "Barrel") {
            return ["Rope", "Cartoon", "Barrel", "Sticker"].includes(rm.name)
          }
          return true
        })
        .map(rm => {
          const required = rm.standardQtyPerMT * selectedIndent.plannedQuantity
          return {
            ...rm,
            requiredQty: required,
          }
        })
      setEditableMaterials(initial)
    }
  }, [selectedIndent, rawMaterials])

  // We want to show the table first by default, so we don't auto-select on mount
  useEffect(() => {
    // Start with the table view by default
    setSelectedIndent(null)
  }, [setSelectedIndent])

  const handleProceed = (indentId: string) => {
    const indent = indents.find(i => i.id === indentId)
    if (indent) {
      setSelectedIndent(indent)
    }
  }

  const handleBackToTable = () => {
    setSelectedIndent(null)
  }

  const handleSubmitApproval = () => {
    if (!selectedIndent) {
      toast.error("Please select an indent first")
      return
    }

    // Explicitly update the indent with validation and status
    updateIndent(selectedIndent.id, { 
      isBomValidated: true,
      bomStatus: approvalStatus || "Approved",
      bomRemarks: approvalRemarks
    })
    toast.success("BOM Validation Submitted", {
      description: `Indent ${selectedIndent.productionIndentNo} has been ${approvalStatus.toLowerCase()}.`
    })

    // Auto proceed to next stage or reset
    setTimeout(() => {
      setCurrentStage(3)
      router.push("/quality-approval")
    }, 1500)
  }

  // Handle manual changes to required quantity
  const handleQtyChange = (id: string, newQty: string) => {
    const val = parseFloat(newQty) || 0
    setEditableMaterials(prev => prev.map(m => 
      m.id === id ? { ...m, requiredQty: val } : m
    ))
  }

  // Get calculated materials with shortage based on editable state
  const calculatedMaterials = editableMaterials.map(rm => {
    const shortage = Math.max(0, rm.requiredQty - rm.availableStock)
    return {
      ...rm,
      shortageQty: shortage
    }
  })

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground selection:bg-primary/20">
      <AppSidebar />
      <main className="flex-1 overflow-hidden bg-[#fafafa] flex flex-col">
        {/* Header Section */}
        <div className="p-8 pb-4">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3 mb-1">
                  {selectedIndent && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleBackToTable}
                      className="rounded-full hover:bg-white border border-border/40 shadow-sm transition-all"
                    >
                      <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  )}
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <ClipboardList className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground/90">BOM & Raw Material Validation</h1>
                </div>
                <p className="text-muted-foreground font-medium ml-11 md:ml-[76px]">
                  {selectedIndent ? "Validate BOM feasibility and raw material availability" : "Select an indent from the pipeline to perform BOM validation"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-8 pt-2">
          <div className="max-w-[1400px] mx-auto h-full flex flex-col">
            {!selectedIndent ? (
              /* Table Stage */
              <div className="flex-1 flex flex-col overflow-hidden">
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
                  onClearFilters={clearFilters}
                />
                <Card className="flex-1 border-border/60 shadow-xl shadow-black/[0.03] rounded-2xl overflow-hidden border-none bg-card flex flex-col">
                  <CardHeader className="border-b border-border/40 py-0 px-6 flex-shrink-0 bg-white">
                    <div className="flex items-center justify-between">
                    <div className="flex min-h-[80px]">
                      <button 
                        onClick={() => setActiveTab("pending")}
                        className={cn(
                          "px-8 flex items-center gap-3 text-sm font-black transition-all relative",
                          activeTab === "pending" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Pending Validations
                        <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {pendingCount}
                        </span>
                        {activeTab === "pending" && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                        )}
                      </button>
                      <button 
                        onClick={() => setActiveTab("history")}
                        className={cn(
                          "px-8 flex items-center gap-3 text-sm font-black transition-all relative",
                          activeTab === "history" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        History
                        <span className="bg-secondary text-muted-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {historyCount}
                        </span>
                        {activeTab === "history" && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                        )}
                      </button>
                    </div>
                      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/50 px-3 py-1 rounded-full border border-border/40">
                        {filteredIndentsAvailable.length} Result{filteredIndentsAvailable.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden p-0">
                    <IndentTable 
                      data={filteredIndentsAvailable} 
                      onProceed={handleProceed} 
                      showAction={activeTab === "pending"} 
                      statusField={activeTab === "history" ? "bom" : undefined}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Validation Form Stage */
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-6">
                  {/* Indent Details Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6 border-y border-border/60 bg-white/50 rounded-2xl px-8 mb-6">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Indent No</p>
                      <p className="text-2xl font-black text-primary">{selectedIndent.productionIndentNo}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Product Name</p>
                      <p className="text-2xl font-black text-foreground">{selectedIndent.productName}</p>
                    </div>
                     <div className="space-y-1">
                       <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Planned Qty (MT)</p>
                       <p className="text-2xl font-black text-foreground/80">{selectedIndent.plannedQuantity}</p>
                     </div>
                  </div>

                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Raw Materials Table */}
                    <div className="lg:col-span-2 space-y-6">
                      <Card className="border-border/60 shadow-lg overflow-hidden bg-card rounded-2xl">
                        <div className="bg-secondary/30 border-b border-border/40 py-4 px-6 flex items-center gap-2">
                          <Info className="w-4 h-4 text-primary" />
                          <span className="text-xs font-black uppercase tracking-widest text-primary/80">Raw Material Details</span>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-secondary/10 hover:bg-transparent border-b border-border/40 text-center">
                              <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest py-4 px-6 h-12">Raw Material Name</TableHead>
                              <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest py-4 text-right h-12">Std Qty/MT</TableHead>
                              <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest py-4 text-center h-12 w-32">Required Qty</TableHead>
                              <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest py-4 text-right h-12">Available Stock</TableHead>
                              <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest py-4 text-center px-6 h-12">Shortage</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {calculatedMaterials.map((rm) => (
                              <TableRow key={rm.id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors">
                                <TableCell className="text-foreground font-bold py-4 px-6">{rm.name}</TableCell>
                                <TableCell className="text-muted-foreground font-mono text-right py-4 text-xs">{rm.standardQtyPerMT}</TableCell>
                                <TableCell className="text-center py-4">
                                  <input 
                                    type="number"
                                    value={rm.requiredQty}
                                    onChange={(e) => handleQtyChange(rm.id, e.target.value)}
                                    disabled={selectedIndent.isBomValidated}
                                    className="w-24 h-9 bg-white border border-border/60 rounded-lg text-center font-black font-mono text-sm focus:ring-1 focus:ring-primary/30 outline-none disabled:bg-secondary/10 disabled:opacity-80"
                                  />
                                </TableCell>
                                <TableCell className="text-muted-foreground font-mono text-right py-4 text-xs">{rm.availableStock.toLocaleString()}</TableCell>
                                <TableCell className="text-center py-4 px-6">
                                  {rm.shortageQty === 0 ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200/50 uppercase tracking-tighter shadow-sm">OK</span>
                                  ) : (
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-50 text-rose-500 text-xs font-black border border-rose-200/50 shadow-sm">
                                      {Math.ceil(rm.shortageQty)}
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>
                    </div>

                    {/* Approval Section */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white border border-border/60 rounded-2xl p-6 shadow-xl shadow-black/[0.02] space-y-6">
                        <div className="space-y-3">
                          <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Approval Status</Label>
                          <Select 
                            value={approvalStatus} 
                            onValueChange={setApprovalStatus}
                            disabled={selectedIndent.isBomValidated}
                          >
                            <SelectTrigger className="w-full h-12 bg-[#fcfcfc] border-border/60 text-foreground rounded-xl shadow-sm hover:border-primary/40 transition-colors disabled:opacity-80">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground rounded-xl shadow-xl">
                              <SelectItem value="Approved" className="text-emerald-600 font-bold focus:bg-emerald-50 py-3">Approved</SelectItem>
                              <SelectItem value="Hold" className="text-amber-600 font-bold focus:bg-amber-50 py-3">Hold</SelectItem>
                              <SelectItem value="Modify" className="text-sky-600 font-bold focus:bg-sky-50 py-3">Modify</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Approval Remarks</Label>
                          <Textarea 
                            placeholder="Add remarks or notes..." 
                            className="min-h-[150px] w-full bg-[#fcfcfc] border-border/60 text-foreground rounded-2xl resize-none focus:ring-primary/20 placeholder:text-muted-foreground/40 shadow-sm hover:border-primary/40 transition-colors disabled:opacity-80 disabled:bg-secondary/20"
                            value={approvalRemarks}
                            onChange={(e) => setApprovalRemarks(e.target.value)}
                            disabled={selectedIndent.isBomValidated}
                          />
                        </div>
                         {!selectedIndent.isBomValidated && (
                          <div className="pt-2">
                            <Button 
                              onClick={handleSubmitApproval}
                              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-sm rounded-xl transition-all active:scale-[0.98] shadow-xl shadow-primary/20"
                            >
                              Submit Validation
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <Toaster position="top-right" theme="light" richColors />
      </main>
    </div>
  )
}
