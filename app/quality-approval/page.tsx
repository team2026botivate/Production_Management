"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileCheck, Info, ClipboardList, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppSidebar } from "@/components/app-sidebar"
import { IndentTable } from "@/components/indent-table"
import { useProduction } from "@/lib/production-context"
import { generateBatchNo, type QualityApproval, type ProductionIndent } from "@/lib/production-data"
import { toast, Toaster } from "sonner"
import { cn } from "@/lib/utils"
import { TableFilters } from "@/components/table-filters"
import { useMemo } from "react"

export default function QualityApprovalPage() {
  const router = useRouter()
  const { indents, updateIndent, setQualityApproval, setCurrentStage } = useProduction()
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending")
  const [selectedIndentRecord, setSelectedIndentRecord] = useState<ProductionIndent | null>(null)
  
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    batchNo: generateBatchNo(),
    issuedQuantity: "",
    qaStatus: "Pass" as "Pass" | "Fail",
    issueDate: new Date().toISOString().split("T")[0],
    issuedBy: "",
    status: "Issued" as "Issued" | "Rejected",
  })

  const [partyFilter, setPartyFilter] = useState("all")
  const [productFilter, setProductFilter] = useState("all")
  const [packingFilter, setPackingFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const partyNames = useMemo(() => {
    return Array.from(new Set(indents.map(i => i.partyName))).sort()
  }, [indents])

  // Filter indents based on stage and filters
  const filteredIndentsAvailable = useMemo(() => {
    return indents.filter((indent) => {
      const isCorrectTab = activeTab === "pending" 
        ? (indent.isBomValidated && !indent.isQualityApproved) 
        : indent.isQualityApproved
      
      const matchesParty = partyFilter === "all" || indent.partyName === partyFilter
      const matchesProduct = productFilter === "all" || indent.productName === productFilter
      const matchesPacking = packingFilter === "all" || indent.packingType === packingFilter
      const matchesPriority = priorityFilter === "all" || indent.priority === priorityFilter

      return isCorrectTab && matchesParty && matchesProduct && matchesPacking && matchesPriority
    })
  }, [indents, activeTab, partyFilter, productFilter, packingFilter, priorityFilter])

  const pendingCount = indents.filter(i => i.isBomValidated && !i.isQualityApproved).length
  const historyCount = indents.filter(i => i.isQualityApproved).length
  
  const clearFilters = () => {
    setPartyFilter("all")
    setProductFilter("all")
    setPackingFilter("all")
    setPriorityFilter("all")
  }

  // We want to show the table first, so we don't auto-select on mount
  useEffect(() => {
    setSelectedIndentRecord(null)
  }, [])

  const handleProceed = (indentId: string) => {
    const indent = indents.find(i => i.id === indentId)
    if (indent) {
      setSelectedIndentRecord(indent)
      if (indent.isQualityApproved) {
        // Populating from history
        setFormData({
          batchNo: indent.qualityBatchNo || "HISTORY",
          issuedQuantity: indent.qualityIssuedQty?.toString() || indent.plannedQuantity.toString(),
          qaStatus: (indent.qualityStatus === "Issued" ? "Pass" : "Fail") as "Pass" | "Fail",
          issueDate: indent.qualityIssueDate || new Date().toISOString().split("T")[0],
          issuedBy: indent.qualityIssuedBy || "",
          status: (indent.qualityStatus || "Issued") as "Issued" | "Rejected",
        })
      } else {
        setFormData({
          ...formData,
          issuedQuantity: indent.plannedQuantity.toString(),
          batchNo: generateBatchNo(),
          issueDate: new Date().toISOString().split("T")[0],
          issuedBy: "",
          qaStatus: "Pass",
          status: "Issued",
        })
      }
    }
  }

  const handleBackToTable = () => {
    setSelectedIndentRecord(null)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file.name)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedIndentRecord) {
      toast.error("Please select an indent first")
      return
    }

    const approval: QualityApproval = {
      id: Date.now().toString(),
      indentNo: selectedIndentRecord.productionIndentNo,
      batchNo: formData.batchNo,
      issuedQuantity: Number.parseFloat(formData.issuedQuantity),
      qaStatus: formData.qaStatus,
      qualityCertificate: uploadedFile,
      issueDate: formData.issueDate,
      issuedBy: formData.issuedBy,
      status: formData.status,
    }

    setQualityApproval(approval)
    updateIndent(selectedIndentRecord.id, { 
      isQualityApproved: true,
      qualityStatus: formData.status,
      qualityRemarks: "Quality Approval Processed",
      qualityBatchNo: formData.batchNo,
      qualityIssueDate: formData.issueDate,
      qualityIssuedBy: formData.issuedBy,
      qualityIssuedQty: Number.parseFloat(formData.issuedQuantity),
      plannedQuantity: Number.parseFloat(formData.issuedQuantity),
      expectedDispatchDate: formData.issueDate
    })
    toast.success("Quality-Approved Oil Issued", {
      description: `Batch ${formData.batchNo} has been ${formData.status.toLowerCase()}`,
    })

    // Auto proceed to next stage after successful submission
    setTimeout(() => {
      setCurrentStage(4)
      router.push("/packing-receipt")
    }, 1500)
  }

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
                  {selectedIndentRecord && (
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
                    <FileCheck className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground/90">Quality Approval & Oil Issue</h1>
                </div>
                <p className="text-muted-foreground font-medium ml-11 md:ml-[76px]">
                  {selectedIndentRecord ? `Issuing oil for indent ${selectedIndentRecord.productionIndentNo}` : "Process approved indents for production release"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-8 pt-2">
          <div className="max-w-[1400px] mx-auto h-full flex flex-col">
            {!selectedIndentRecord ? (
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
                         Pending Clearances
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
                      statusField={activeTab === "pending" ? "bom" : "quality"}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Approval Form Stage */
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-8">
                  {/* Indent Details Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-4 border-y border-border/60 bg-white/50 rounded-2xl px-6 mb-4">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Indent No</p>
                      <p className="text-lg font-black text-primary truncate">{selectedIndentRecord.productionIndentNo}</p>
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Party Name</p>
                      <p className="text-lg font-black text-foreground truncate" title={selectedIndentRecord.partyName}>{selectedIndentRecord.partyName}</p>
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Product Name</p>
                      <p className="text-lg font-black text-foreground truncate" title={selectedIndentRecord.productName}>{selectedIndentRecord.productName}</p>
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Planned Qty</p>
                      <p className="text-lg font-black text-foreground/80 truncate">{selectedIndentRecord.plannedQuantity} MT</p>
                    </div>
                  </div>

                  {/* Quality Form */}
                   <form onSubmit={handleSubmit} className="space-y-8 pb-12">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="space-y-3">
                         <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60 ml-1">Batch Number</Label>
                         <Input value={formData.batchNo} disabled className="h-12 bg-secondary/20 border-transparent font-mono font-bold text-lg rounded-xl" />
                       </div>

                       <div className="space-y-3">
                         <Label htmlFor="issuedQuantity" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Issued Quantity (MT)</Label>
                          <Input
                           id="issuedQuantity"
                           type="number"
                           step="0.1"
                           value={formData.issuedQuantity}
                           onChange={(e) => setFormData({ ...formData, issuedQuantity: e.target.value })}
                           className="h-12 font-bold text-lg border-border focus:ring-primary focus:ring-offset-0 rounded-xl disabled:opacity-80"
                           required
                           disabled={selectedIndentRecord.isQualityApproved}
                         />
                       </div>

                       <div className="space-y-3">
                         <Label htmlFor="issueDate" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Date of Issue</Label>
                          <Input
                           id="issueDate"
                           type="date"
                           value={formData.issueDate}
                           onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                           className="h-12 border-border rounded-xl font-medium disabled:opacity-80"
                           required
                           disabled={selectedIndentRecord.isQualityApproved}
                         />
                       </div>

                       <div className="space-y-3">
                         <Label htmlFor="issuedBy" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Issued By</Label>
                          <Input
                           id="issuedBy"
                           value={formData.issuedBy}
                           onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
                           placeholder="Name of Approver"
                           className="h-12 border-border rounded-xl font-medium disabled:opacity-80"
                           required
                           disabled={selectedIndentRecord.isQualityApproved}
                         />
                       </div>

                       <div className="space-y-3">
                         <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">QA Status</Label>
                         <Select
                           value={formData.qaStatus}
                           onValueChange={(value: "Pass" | "Fail") => {
                             setFormData({
                               ...formData,
                               qaStatus: value,
                             })
                           }}
                           disabled={selectedIndentRecord.isQualityApproved}
                         >
                           <SelectTrigger className="w-full h-12 font-bold border-border rounded-xl disabled:opacity-80">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl border-border shadow-2xl">
                             <SelectItem value="Pass" className="font-bold text-emerald-600 py-3">Pass</SelectItem>
                             <SelectItem value="Fail" className="font-bold text-rose-600 py-3">Fail</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>

                       <div className="space-y-3">
                         <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Status</Label>
                         <Select
                           value={formData.status}
                           onValueChange={(value: "Issued" | "Rejected") => {
                             setFormData({
                               ...formData,
                               status: value,
                             })
                           }}
                           disabled={selectedIndentRecord.isQualityApproved}
                         >
                           <SelectTrigger className="w-full h-12 font-bold border-border rounded-xl disabled:opacity-80">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl border-border shadow-2xl">
                             <SelectItem value="Issued" className="font-bold text-emerald-600 py-3">Issued</SelectItem>
                             <SelectItem value="Rejected" className="font-bold text-rose-600 py-3">Rejected</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>

                       <div className="md:col-span-3 space-y-3">
                         <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Quality Certificate Upload</Label>
                        <div className={cn(
                          "border-2 border-dashed border-border/60 rounded-2xl p-8 text-center bg-white/50 group relative overflow-hidden transition-all",
                          !selectedIndentRecord.isQualityApproved ? "hover:border-primary/40" : "opacity-60 cursor-not-allowed"
                        )}>
                          <input
                            type="file"
                            id="certificate"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={selectedIndentRecord.isQualityApproved}
                          />
                          <label htmlFor="certificate" className={cn("block", !selectedIndentRecord.isQualityApproved ? "cursor-pointer" : "cursor-not-allowed")}>
                            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-all" />
                            {uploadedFile ? (
                              <p className="text-primary font-bold text-lg">{uploadedFile}</p>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-foreground font-bold">Select Certificate File</p>
                                <p className="text-muted-foreground font-medium text-xs">Upload PDF or Image certificate for this batch</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    {!selectedIndentRecord.isQualityApproved && (
                      <div className="pt-8 flex justify-end">
                        <Button 
                          type="submit"
                          className="h-14 px-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-sm rounded-xl transition-all active:scale-[0.98] shadow-xl shadow-primary/20"
                        >
                          Issue Approved Batch
                        </Button>
                      </div>
                    )}
                  </form>
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
