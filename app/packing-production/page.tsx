"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Factory, Trash2, Plus, Info, ClipboardList, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppSidebar } from "@/components/app-sidebar"
import { IndentTable } from "@/components/indent-table"
import { useProduction } from "@/lib/production-context"
import { type ProductionIndent } from "@/lib/production-data"
import { toast, Toaster } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { TableFilters } from "@/components/table-filters"
import { useMemo } from "react"

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
}

export default function PackingProductionPage() {
  const router = useRouter()
  const { indents, rawMaterials, updateIndent } = useProduction()
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending")
  const [selectedIndentRecord, setSelectedIndentRecord] = useState<ProductionIndent | null>(null)
  
  const [consumptionData, setConsumptionData] = useState<ConsumptionItem[]>([])
  const [wastageData, setWastageData] = useState<WastageItem[]>([
    { id: "1", rawMaterial: "", quantity: 0, remarks: "" }
  ])

  const [partyFilter, setPartyFilter] = useState("all")
  const [productFilter, setProductFilter] = useState("all")
  const [packingFilter, setPackingFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const partyNames = useMemo(() => {
    return Array.from(new Set(indents.map(i => i.partyName))).sort()
  }, [indents])

  const wastageOptions = useMemo(() => {
    if (!selectedIndentRecord) return []
    const baseOptions = ["Oil Loss", "Other"]
    let filteredRMs = ["Rope", "Cartoon", "Tin", "Sticker", "Pouch"]
    
    if (selectedIndentRecord.packingType === "Tin") {
      filteredRMs = ["Rope", "Cartoon", "Tin", "Sticker"]
    } else if (selectedIndentRecord.packingType === "Pouch") {
      filteredRMs = ["Rope", "Cartoon", "Pouch", "Sticker"]
    } else if (selectedIndentRecord.packingType === "Barrel") {
      filteredRMs = ["Rope", "Cartoon", "Barrel", "Sticker"]
    }
    
    return [...filteredRMs, ...baseOptions]
  }, [selectedIndentRecord])

  // Filter indents based on stage and filters
  const filteredIndentsAvailable = useMemo(() => {
    return indents.filter((indent) => {
      const isCorrectTab = activeTab === "pending" 
        ? (indent.isPackingReceiptGenerated && !indent.isProductionCompleted) 
        : indent.isProductionCompleted
      
      const matchesParty = partyFilter === "all" || indent.partyName === partyFilter
      const matchesProduct = productFilter === "all" || indent.productName === productFilter
      const matchesPacking = packingFilter === "all" || indent.packingType === packingFilter
      const matchesPriority = priorityFilter === "all" || indent.priority === priorityFilter

      return isCorrectTab && matchesParty && matchesProduct && matchesPacking && matchesPriority
    })
  }, [indents, activeTab, partyFilter, productFilter, packingFilter, priorityFilter])

  const pendingCount = indents.filter(i => i.isPackingReceiptGenerated && !i.isProductionCompleted).length
  const historyCount = indents.filter(i => i.isProductionCompleted).length
  
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
      
      if (indent.isProductionCompleted) {
        setConsumptionData(indent.productionActualConsumption || [])
        setWastageData(indent.productionWastage || [])
      } else {
        // Initialize consumption data based on the indent's qty and raw material standards
        const initialConsumption = rawMaterials
          .filter(rm => {
            if (indent.packingType === "Tin") {
              return ["Rope", "Cartoon", "Tin", "Sticker"].includes(rm.name)
            }
            if (indent.packingType === "Pouch") {
              return ["Rope", "Cartoon", "Pouch", "Sticker"].includes(rm.name)
            }
            if (indent.packingType === "Barrel") {
              return ["Rope", "Cartoon", "Barrel", "Sticker"].includes(rm.name)
            }
            return true
          })
          .map(rm => {
            const planned = rm.standardQtyPerMT * indent.plannedQuantity
            return {
              id: rm.id,
              name: rm.name,
              plannedQty: planned,
              actualConsumedQty: planned,
              variance: 0
            }
          })
        
        setConsumptionData(initialConsumption)
        setWastageData([{ id: "1", rawMaterial: "", quantity: 0, remarks: "" }])
      }
    }
  }

  const handleBackToTable = () => {
    setSelectedIndentRecord(null)
  }

  const handleConsumptionChange = (id: string, value: string) => {
    const actualQty = parseFloat(value) || 0
    setConsumptionData(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          actualConsumedQty: actualQty,
          variance: actualQty - item.plannedQty
        }
      }
      return item
    }))
  }

  const handleWastageChange = (id: string, field: keyof WastageItem, value: any) => {
    setWastageData(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const addWastageRow = () => {
    setWastageData(prev => [...prev, {
      id: Date.now().toString(),
      rawMaterial: "",
      quantity: 0,
      remarks: ""
    }])
  }

  const removeWastageRow = (id: string) => {
    if (wastageData.length > 1) {
      setWastageData(prev => prev.filter(item => item.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedIndentRecord) {
       toast.error("Please select an indent first")
       return
    }

     updateIndent(selectedIndentRecord.id, { 
      isProductionCompleted: true,
      productionActualConsumption: consumptionData,
      productionWastage: wastageData
    })
    
    toast.success("Production Report Submitted", {
      description: `Indent ${selectedIndentRecord.productionIndentNo} marked as production completed.`
    })
    
    setTimeout(() => {
        router.push("/production_indent") // Reset to list
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
                    <Factory className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground/90">Packing Production & Consumption</h1>
                </div>
                <p className="text-muted-foreground font-medium ml-11 md:ml-[76px]">
                  {selectedIndentRecord ? `Recording consumption for indent ${selectedIndentRecord.productionIndentNo}` : "Manage consumption data and wastage for receipted items"}
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
                          Pending Reports
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
                      statusField={activeTab === "pending" ? "grn" : undefined}
                      showReceipt={activeTab === "pending"}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Form Stage */
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-10 pb-20">
                  {/* Indent Details Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-4 border-y border-border/60 bg-white/50 rounded-2xl px-6">
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

                  <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Section A: Consumption */}
                    <div className="space-y-5">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-3 ml-2">
                        <span className="bg-primary/20 w-8 h-8 rounded-xl flex items-center justify-center text-xs text-primary shadow-sm shadow-primary/10">01</span>
                        Raw Material Consumption Matrix
                      </h3>
                      
                      <Card className="border-border/60 shadow-lg overflow-hidden bg-card rounded-2xl overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-secondary/30 hover:bg-transparent border-b border-border/40">
                              <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest py-5 px-8">Material Name</TableHead>
                              <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest py-5 text-right">Planned Qty</TableHead>
                              <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest py-5 text-center">Actual Consumed QTY</TableHead>
                              <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest py-5 text-right px-8">Variance</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {consumptionData.map(item => (
                              <TableRow key={item.id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors">
                                <TableCell className="text-foreground font-bold py-5 px-8">{item.name}</TableCell>
                                <TableCell className="text-muted-foreground font-mono font-medium text-right py-5">{item.plannedQty.toFixed(2).toLocaleString()}</TableCell>
                                <TableCell className="text-center py-5">
                                  <div className="relative inline-flex">
                                     <Input 
                                      type="number" 
                                      step="0.01" 
                                      value={item.actualConsumedQty} 
                                      onChange={(e) => handleConsumptionChange(item.id, e.target.value)}
                                      className="h-10 w-32 text-center font-black bg-white border-border/60 mx-auto focus:ring-primary/20 rounded-xl shadow-sm disabled:opacity-80 disabled:bg-secondary/10"
                                      disabled={selectedIndentRecord.isProductionCompleted}
                                    />
                                  </div>
                                </TableCell>
                                <TableCell className="text-right px-8 py-5">
                                  <span className={`font-mono font-black text-sm px-3 py-1 rounded-lg ${
                                    item.variance > 0 
                                      ? "bg-rose-50 text-rose-600 border border-rose-100" 
                                      : item.variance < 0 
                                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                      : "text-muted-foreground/40"
                                  }`}>
                                    {item.variance > 0 ? "+" : ""}{item.variance.toFixed(2)}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>
                    </div>

                    {/* Section B: Wastage */}
                    <div className="space-y-5">
                      <div className="flex items-center justify-between ml-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-3">
                          <span className="bg-primary/20 w-8 h-8 rounded-xl flex items-center justify-center text-xs text-primary shadow-sm shadow-primary/10">02</span>
                          Wastage & Loss Tracking
                        </h3>
                         {!selectedIndentRecord.isProductionCompleted && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addWastageRow} 
                            className="h-10 rounded-xl border-primary/30 hover:bg-primary/5 text-primary font-black uppercase text-[10px] tracking-widest px-6 shadow-sm shadow-primary/5"
                          >
                            <Plus className="w-3.5 h-3.5 mr-2" /> Add Wastage Entry
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-8">
                        {wastageData.map((item) => (
                          <div key={item.id} className="group relative bg-white border border-border/60 rounded-3xl p-8 transition-all hover:shadow-xl hover:shadow-black/[0.02] shadow-sm">
                             {!selectedIndentRecord.isProductionCompleted && wastageData.length > 1 && (
                               <Button 
                                 type="button" 
                                 variant="ghost" 
                                 size="icon" 
                                 onClick={() => removeWastageRow(item.id)}
                                 className="absolute top-6 right-6 h-10 w-10 rounded-2xl bg-rose-50 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-100"
                               >
                                 <Trash2 className="w-5 h-5" />
                               </Button>
                             )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
                              <div className="space-y-3">
                                <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1 tracking-[0.15em]">Wastage Raw Material</Label>
                                <Select 
                                  value={item.rawMaterial} 
                                  onValueChange={(value) => handleWastageChange(item.id, "rawMaterial", value)}
                                  disabled={selectedIndentRecord.isProductionCompleted}
                                >
                                  <SelectTrigger className="bg-[#fcfcfc] border-border/80 !h-14 rounded-2xl focus:bg-white transition-all shadow-sm font-medium w-full disabled:opacity-80">
                                    <SelectValue placeholder="Select wastage source" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-2xl border-border/40 font-medium">
                                    {wastageOptions.map(option => (
                                      <SelectItem key={option} value={option} className="rounded-xl focus:bg-primary/5 focus:text-primary">
                                        {option === "Oil Loss" ? "Oil Loss (Spillage)" : option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-3">
                                <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1 tracking-[0.15em]">Wastage Qty</Label>
                                 <Input 
                                   type="number" 
                                   step="0.1" 
                                   value={item.quantity || ""} 
                                   onChange={(e) => handleWastageChange(item.id, "quantity", parseFloat(e.target.value) || 0)}
                                   placeholder="0.0"
                                   className="bg-[#fcfcfc] border-border/80 h-14 font-black text-xl rounded-2xl focus:bg-white transition-all shadow-sm disabled:opacity-80"
                                   disabled={selectedIndentRecord.isProductionCompleted}
                                 />
                              </div>
                              <div className="space-y-3">
                                <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1 tracking-[0.15em]">Remarks</Label>
                                 <Input 
                                   value={item.remarks} 
                                   onChange={(e) => handleWastageChange(item.id, "remarks", e.target.value)}
                                   placeholder="Describe the reason for wastage..."
                                   className="bg-[#fcfcfc] border-border/80 h-14 rounded-2xl focus:bg-white transition-all shadow-sm disabled:opacity-80"
                                   disabled={selectedIndentRecord.isProductionCompleted}
                                 />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                     {/* Submit Button */}
                    {!selectedIndentRecord.isProductionCompleted && (
                      <div className="pt-10 flex justify-end">
                        <Button 
                          type="submit"
                          className="h-14 px-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-sm rounded-xl transition-all active:scale-[0.98] shadow-xl shadow-primary/20"
                        >
                          Finalize Production Report
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
