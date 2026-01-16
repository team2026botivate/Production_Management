"use client"

import { useProduction } from "@/lib/production-context"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Timer,
  Factory,
  Package,
  ShieldCheck,
  Clock,
  AlertCircle,
  Eye
} from "lucide-react"
import { PriorityBadge } from "@/components/priority-badge"
import { TableFilters } from "@/components/table-filters"
import { useState, useMemo } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ProductionIndent } from "@/lib/production-data"

export default function DashboardPage() {
  const { indents, rawMaterials } = useProduction()

  // Calculate statistics
  const today = new Date().toISOString().split('T')[0]
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  
  const totalIndentsToday = indents.filter(i => i.createdAt && i.createdAt.startsWith(today)).length
  const totalIndentsThisWeek = indents.filter(i => i.createdAt && i.createdAt >= oneWeekAgo).length
  const totalIndentsCount = indents.length
  
  const pendingIndents = indents.filter(i => !i.isProductionCompleted).length
  const urgentIndentsCount = indents.filter(i => i.priority === "Urgent").length
  const inProduction = indents.filter(i => i.isBomValidated && !i.isProductionCompleted).length
  const readyForDispatch = indents.filter(i => i.isProductionCompleted).length
  const delayedDispatch = indents.filter(i => !i.isProductionCompleted && i.expectedDispatchDate < today).length
  // For shortage alerts, we'll check if any raw material has shortage
  const shortageAlerts = rawMaterials.filter(rm => rm.shortageQty > 0).length
  const completedOrders = indents.filter(i => i.isProductionCompleted).length
  const totalVolume = indents.reduce((acc, i) => acc + i.plannedQuantity, 0)

  const [selectedCategory, setSelectedCategory] = useState<{ title: string; indents: ProductionIndent[] } | null>(null)

  const getIndentStage = (indent: ProductionIndent) => {
    if (indent.isProductionCompleted) return { label: "Completed", color: "bg-emerald-100 text-emerald-700" }
    if (indent.isPackingReceiptGenerated) return { label: "Production", color: "bg-indigo-100 text-indigo-700" }
    if (indent.isQualityApproved) return { label: "Packing Receipt", color: "bg-amber-100 text-amber-700" }
    if (indent.isBomValidated) return { label: "Quality Approval", color: "bg-blue-100 text-blue-700" }
    return { label: "BOM Validation", color: "bg-gray-100 text-gray-700" }
  }

  const [partyFilter, setPartyFilter] = useState("all")
  const [productFilter, setProductFilter] = useState("all")
  const [packingFilter, setPackingFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const partyNames = useMemo(() => {
    return Array.from(new Set(indents.map(i => i.partyName))).sort()
  }, [indents])

  const filteredIndents = useMemo(() => {
    return indents.filter((indent) => {
      const matchesParty = partyFilter === "all" || indent.partyName === partyFilter
      const matchesProduct = productFilter === "all" || indent.productName === productFilter
      const matchesPacking = packingFilter === "all" || indent.packingType === packingFilter
      const matchesPriority = priorityFilter === "all" || indent.priority === priorityFilter

      return matchesParty && matchesProduct && matchesPacking && matchesPriority
    })
  }, [indents, partyFilter, productFilter, packingFilter, priorityFilter])

  // Recent 5 filtered indents
  const recentIndents = [...filteredIndents].reverse().slice(0, 5)

  const clearFilters = () => {
    setPartyFilter("all")
    setProductFilter("all")
    setPackingFilter("all")
    setPriorityFilter("all")
  }


  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa]">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground/90">Operational Overview</h1>
            <p className="text-muted-foreground font-medium">Real-time production management and workflow intelligence</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Production Indents",
                value: totalIndentsCount,
                icon: ClipboardList,
                color: "text-blue-600",
                bg: "bg-blue-50",
                desc: `Total Indents`
              },
              {
                title: "Pending Indents",
                value: pendingIndents,
                icon: Timer,
                color: "text-amber-600",
                bg: "bg-amber-50",
                desc: "Awaiting completion",
                filter: (i: ProductionIndent) => !i.isProductionCompleted
              },
              {
                title: "Urgent Priority",
                value: urgentIndentsCount,
                icon: AlertTriangle,
                color: "text-rose-600",
                bg: "bg-rose-50",
                desc: "Requires immediate focus",
                filter: (i: ProductionIndent) => i.priority === "Urgent"
              },
              {
                title: "In Production",
                value: inProduction,
                icon: Factory,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
                desc: "Active on floor",
                filter: (i: ProductionIndent) => i.isBomValidated && !i.isProductionCompleted
              },
              {
                title: "Gross Tonnage",
                value: `${totalVolume} MT`,
                icon: TrendingUp,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                desc: "Total production target",
                isCore: true
              },
              {
                title: "Delayed Dispatch",
                value: delayedDispatch,
                icon: Clock,
                color: "text-orange-600",
                bg: "bg-orange-50",
                desc: "Past expected date",
                filter: (i: ProductionIndent) => !i.isProductionCompleted && (i.expectedDispatchDate < today)
              },
              {
                title: "Shortage Alerts",
                value: shortageAlerts,
                icon: AlertCircle,
                color: "text-destructive",
                bg: "bg-destructive/10",
                desc: "RM stock issues",
                filter: (i: ProductionIndent) => !i.isBomValidated
              },
              {
                title: "Completed Orders",
                value: completedOrders,
                icon: CheckCircle2,
                color: "text-cyan-600",
                bg: "bg-cyan-50",
                desc: "Fully processed",
                filter: (i: ProductionIndent) => i.isProductionCompleted
              }
            ].map((stat, index) => (
              <Card 
                key={index} 
                className={`border-none shadow-sm shadow-black/5 rounded-2xl overflow-hidden bg-white group transition-all ${stat.title !== "Production Indents" ? "cursor-pointer hover:shadow-md hover:-translate-y-1" : ""}`}
                onClick={() => {
                  if (stat.title !== "Production Indents" && stat.filter) {
                    setSelectedCategory({
                      title: stat.title,
                      indents: indents.filter(stat.filter)
                    })
                  }
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    {stat.isCore ? (
                       <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Core Metric</div>
                    ) : stat.title !== "Production Indents" && (
                      <Eye className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-2xl font-black text-foreground tracking-tight">{stat.value}</h3>
                    <p className="text-xs font-bold text-foreground/70">{stat.title}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{stat.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Indents List */}
            <Card className="lg:col-span-2 border-none shadow-sm shadow-black/5 rounded-3xl bg-white overflow-hidden">
              <CardHeader className="border-b border-border/40 py-5 px-8 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-primary rounded-full" />
                  <CardTitle className="text-lg font-black uppercase tracking-tight text-foreground/80">Active Pipeline Tracking</CardTitle>
                </div>
                <div className="text-[10px] font-black text-muted-foreground uppercase bg-secondary/50 px-3 py-1 rounded-full">
                  Live Sync
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-secondary/10 border-b border-border/40">
                        <th className="py-4 px-8 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Indent ID</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Client / Product</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">Volume</th>
                        <th className="py-4 px-8 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {recentIndents.map((indent) => (
                        <tr key={indent.id} className="hover:bg-secondary/5 transition-colors group">
                          <td className="py-5 px-8 font-mono font-black text-primary text-sm">{indent.productionIndentNo}</td>
                          <td className="py-5 px-6">
                            <div className="flex flex-col">
                              <span className="font-black text-foreground/90 tracking-tight">{indent.partyName}</span>
                              <span className="text-xs font-bold text-muted-foreground">{indent.productName}</span>
                            </div>
                          </td>
                          <td className="py-5 px-6 text-center">
                            <span className="font-black text-foreground/70">{indent.plannedQuantity} MT</span>
                          </td>
                          <td className="py-5 px-8 text-right">
                            <PriorityBadge priority={indent.priority} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Distribution */}
            <Card className="border-none shadow-sm shadow-black/5 rounded-3xl bg-white overflow-hidden flex flex-col">
              <CardHeader className="border-b border-border/40 py-5 px-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-primary rounded-full" />
                  <CardTitle className="text-lg font-black uppercase tracking-tight text-foreground/80">Workflow Health</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6 flex-1">
                {[
                  { label: "BOM Validated", count: indents.filter(i => i.isBomValidated).length, color: "bg-blue-500", icon: ClipboardList },
                  { label: "Quality Cleared", count: indents.filter(i => i.isQualityApproved).length, color: "bg-amber-500", icon: ShieldCheck },
                  { label: "Receipts Generated", count: indents.filter(i => i.isPackingReceiptGenerated).length, color: "bg-indigo-500", icon: Package },
                  { label: "Production Done", count: indents.filter(i => i.isProductionCompleted).length, color: "bg-emerald-500", icon: Factory },
                ].map((stage, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <stage.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-black text-foreground/70 uppercase tracking-wider">{stage.label}</span>
                      </div>
                      <span className="text-sm font-black text-foreground">{stage.count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${stage.color} rounded-full transition-all duration-1000`} 
                        style={{ width: `${totalIndentsCount > 0 ? (stage.count / totalIndentsCount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
                
                <div className="pt-6 mt-6 border-t border-border/40 space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#fafafa] border border-border/40">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Timer className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Efficiency Rating</p>
                      <p className="text-xl font-black text-foreground">94.2%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[60vw] w-full p-0 overflow-hidden rounded-3xl border-none">
          <DialogHeader className="py-2 px-6 bg-secondary/10 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-black uppercase tracking-tight text-foreground/80">
                  {selectedCategory?.title}
                </DialogTitle>
                <p className="text-xs font-medium text-muted-foreground">Showing {selectedCategory?.indents.length} filtered records</p>
              </div>
            </div>
          </DialogHeader>
          <div className="p-0 max-h-[70vh] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr className="bg-secondary/5 border-b border-border/40">
                  <th className="py-3 px-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Indent ID</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Client Name</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">Stage</th>
                  <th className="py-3 px-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {selectedCategory?.indents.map((indent) => {
                  const stage = getIndentStage(indent)
                  return (
                    <tr key={indent.id} className="hover:bg-secondary/5 transition-colors">
                      <td className="py-3 px-6 font-mono font-black text-primary text-xs">{indent.productionIndentNo}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground/90 tracking-tight">{indent.partyName}</span>
                          <span className="text-[10px] font-bold text-muted-foreground">{indent.productName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={`${stage.color} border-none font-black text-[10px] uppercase px-2 py-0.5 rounded-full shadow-none`}>
                          {stage.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <PriorityBadge priority={indent.priority} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
