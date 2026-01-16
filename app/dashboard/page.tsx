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
  ShieldCheck
} from "lucide-react"
import { PriorityBadge } from "@/components/priority-badge"
import { TableFilters } from "@/components/table-filters"
import { useState, useMemo } from "react"

export default function DashboardPage() {
  const { indents } = useProduction()

  // Calculate statistics
  const totalIndents = indents.length
  const urgentIndents = indents.filter(i => i.priority === "Urgent").length
  const completedIndents = indents.filter(i => i.isProductionCompleted).length
  const pendingQuality = indents.filter(i => i.isBomValidated && !i.isQualityApproved).length
  const totalVolume = indents.reduce((acc, i) => acc + i.plannedQuantity, 0)

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

  const stats = [
    {
      title: "Total Indents",
      value: totalIndents,
      icon: ClipboardList,
      color: "text-blue-600",
      bg: "bg-blue-50",
      desc: "Gross pipeline volume"
    },
    {
      title: "Urgent Priority",
      value: urgentIndents,
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-50",
      desc: "Requires immediate focus"
    },
    {
      title: "Quality Pending",
      value: pendingQuality,
      icon: ShieldCheck,
      color: "text-amber-600",
      bg: "bg-amber-50",
      desc: "Awaiting QC clearance"
    },
    {
      title: "Gross Tonnage",
      value: `${totalVolume} MT`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      desc: "Total production target"
    }
  ]

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="border-none shadow-sm shadow-black/5 rounded-2xl overflow-hidden bg-white group hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Core Metric</div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-foreground tracking-tight">{stat.value}</h3>
                    <p className="text-sm font-bold text-foreground/70">{stat.title}</p>
                    <p className="text-xs text-muted-foreground font-medium">{stat.desc}</p>
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
                        style={{ width: `${(stage.count / totalIndents) * 100}%` }}
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
    </div>
  )
}
