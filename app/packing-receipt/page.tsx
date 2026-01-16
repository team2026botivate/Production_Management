"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Receipt, Info, ClipboardList, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppSidebar } from "@/components/app-sidebar"
import { IndentTable } from "@/components/indent-table"
import { useProduction } from "@/lib/production-context"
import { generateGRNNo, type PackingReceipt, type ProductionIndent } from "@/lib/production-data"
import { toast, Toaster } from "sonner"
import { cn } from "@/lib/utils"
import { TableFilters } from "@/components/table-filters"
import { useMemo } from "react"

export default function PackingReceiptPage() {
  const router = useRouter()
  const { indents, updateIndent, setPackingReceipt, setCurrentStage } = useProduction()
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending")
  const [selectedIndentRecord, setSelectedIndentRecord] = useState<ProductionIndent | null>(null)

  const [formData, setFormData] = useState({
    receivedQuantity: "",
    receiptDate: new Date().toISOString().split("T")[0],
    receiptTime: new Date().toTimeString().slice(0, 5),
    receiverName: "",
    grnSlipNo: generateGRNNo(),
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
        ? (indent.isQualityApproved && !indent.isPackingReceiptGenerated) 
        : indent.isPackingReceiptGenerated
      
      const matchesParty = partyFilter === "all" || indent.partyName === partyFilter
      const matchesProduct = productFilter === "all" || indent.productName === productFilter
      const matchesPacking = packingFilter === "all" || indent.packingType === packingFilter
      const matchesPriority = priorityFilter === "all" || indent.priority === priorityFilter

      return isCorrectTab && matchesParty && matchesProduct && matchesPacking && matchesPriority
    })
  }, [indents, activeTab, partyFilter, productFilter, packingFilter, priorityFilter])

  const pendingCount = indents.filter(i => i.isQualityApproved && !i.isPackingReceiptGenerated).length
  const historyCount = indents.filter(i => i.isPackingReceiptGenerated).length
  
  const clearFilters = () => {
    setPartyFilter("all")
    setProductFilter("all")
    setPackingFilter("all")
    setPriorityFilter("all")
  }

  // We want to show the table first by default, so we don't auto-select on mount
  useEffect(() => {
    setSelectedIndentRecord(null)
  }, [])

  const handleProceed = (indentId: string) => {
    const indent = indents.find(i => i.id === indentId)
    if (indent) {
      setSelectedIndentRecord(indent)
      if (indent.isPackingReceiptGenerated) {
        // Populating from history
        setFormData({
          receivedQuantity: indent.receiptReceivedQty?.toString() || indent.plannedQuantity.toString(),
          receiptDate: indent.receiptDate || new Date().toISOString().split("T")[0],
          receiptTime: indent.receiptTime || new Date().toTimeString().slice(0, 5),
          receiverName: indent.receiptReceiverName || "",
          grnSlipNo: indent.grnSlipNo || "HISTORY",
        })
      } else {
        setFormData({
          ...formData,
          receivedQuantity: indent.plannedQuantity.toString(),
          grnSlipNo: generateGRNNo(),
          receiptDate: new Date().toISOString().split("T")[0],
          receiverName: "",
        })
      }
    }
  }

  const handleBackToTable = () => {
    setSelectedIndentRecord(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedIndentRecord) {
      toast.error("Please select an indent first")
      return
    }

    const receipt: PackingReceipt = {
      id: Date.now().toString(),
      receivedQuantity: Number.parseFloat(formData.receivedQuantity),
      receiptDateTime: `${formData.receiptDate}T${formData.receiptTime}`,
      receiverName: formData.receiverName,
      grnSlipNo: formData.grnSlipNo,
    }

    setPackingReceipt(receipt)
    updateIndent(selectedIndentRecord.id, { 
      isPackingReceiptGenerated: true,
      grnSlipNo: formData.grnSlipNo,
      receiptDate: formData.receiptDate,
      receiptTime: formData.receiptTime,
      receiptReceiverName: formData.receiverName,
      receiptReceivedQty: Number.parseFloat(formData.receivedQuantity),
      plannedQuantity: Number.parseFloat(formData.receivedQuantity),
      expectedDispatchDate: formData.receiptDate,
      receiptUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    })
    
    toast.success("Packing Receipt Generated", {
      description: `GRN No: ${formData.grnSlipNo}`,
    })

    // Auto proceed to next stage after successful generation
    setTimeout(() => {
      setCurrentStage(5)
      router.push("/packing-production")
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
                    <Receipt className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground/90">Packing Receipt Confirmation</h1>
                </div>
                <p className="text-muted-foreground font-medium ml-11 md:ml-[76px]">
                  {selectedIndentRecord ? `Confirming receipt for indent ${selectedIndentRecord.productionIndentNo}` : "Confirm receipt of materials for quality-approved indents"}
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
                          Pending Receipts
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
                      statusField={activeTab === "pending" ? "quality" : "grn"}
                      showReceipt={activeTab === "history"}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Receipt Form Stage */
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

                  {/* Receipt Form */}
                   <form onSubmit={handleSubmit} className="space-y-8 pb-12">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8">
                       <div className="space-y-3">
                         <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60 ml-1">GRN / Receipt Slip No</Label>
                         <Input value={formData.grnSlipNo} disabled className="h-12 bg-secondary/20 border-transparent font-mono font-bold text-lg rounded-xl" />
                       </div>

                       <div className="space-y-3">
                         <Label htmlFor="receivedQuantity" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Received Quantity (MT)</Label>
                          <Input
                           id="receivedQuantity"
                           type="number"
                           step="0.1"
                           value={formData.receivedQuantity}
                           onChange={(e) => setFormData({ ...formData, receivedQuantity: e.target.value })}
                           className="h-12 font-bold text-lg border-border focus:ring-primary focus:ring-offset-0 rounded-xl disabled:opacity-80"
                           required
                           disabled={selectedIndentRecord.isPackingReceiptGenerated}
                         />
                       </div>

                       <div className="space-y-3">
                         <Label htmlFor="receiverName" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Receiver Name</Label>
                          <Input
                           id="receiverName"
                           value={formData.receiverName}
                           onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                           placeholder="Full name of receiver"
                           className="h-12 border-border rounded-xl font-medium disabled:opacity-80"
                           required
                           disabled={selectedIndentRecord.isPackingReceiptGenerated}
                         />
                       </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                       <div className="space-y-3">
                         <Label htmlFor="receiptDate" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Receipt Date</Label>
                          <Input
                           id="receiptDate"
                           type="date"
                           value={formData.receiptDate}
                           onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                           className="h-12 border-border rounded-xl font-medium disabled:opacity-80"
                           required
                           disabled={selectedIndentRecord.isPackingReceiptGenerated}
                         />
                       </div>

                       <div className="space-y-3">
                         <Label htmlFor="receiptTime" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Receipt Time</Label>
                          <Input
                           id="receiptTime"
                           type="time"
                           value={formData.receiptTime}
                           onChange={(e) => setFormData({ ...formData, receiptTime: e.target.value })}
                           className="h-12 border-border rounded-xl font-medium disabled:opacity-80"
                           required
                           disabled={selectedIndentRecord.isPackingReceiptGenerated}
                         />
                       </div>
                     </div>

                     {/* Submit Button */}
                    {!selectedIndentRecord.isPackingReceiptGenerated && (
                      <div className="pt-8 flex justify-end">
                        <Button 
                          type="submit"
                          className="h-14 px-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-sm rounded-xl transition-all active:scale-[0.98] shadow-xl shadow-primary/20"
                        >
                          Generate Receipt
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
