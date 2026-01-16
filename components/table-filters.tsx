"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, FilterX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TableFiltersProps {
  partyFilter: string
  onPartyFilterChange: (value: string) => void
  partyNames: string[]
  productFilter: string
  onProductFilterChange: (value: string) => void
  packingFilter: string
  onPackingFilterChange: (value: string) => void
  priorityFilter: string
  onPriorityFilterChange: (value: string) => void
  statusFilter?: string
  onStatusFilterChange?: (value: string) => void
  onClearFilters: () => void
}

export function TableFilters({
  partyFilter,
  onPartyFilterChange,
  partyNames,
  productFilter,
  onProductFilterChange,
  packingFilter,
  onPackingFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
}: TableFiltersProps) {
  return (
    <div className="bg-white/50 p-4 rounded-3xl border border-border/40 mb-8 backdrop-blur-sm shadow-sm ring-1 ring-black/[0.02]">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <Select value={partyFilter} onValueChange={onPartyFilterChange}>
            <SelectTrigger className="w-full h-12 bg-white border-border/60 rounded-2xl font-semibold shadow-sm focus:ring-primary/20 transition-all hover:border-primary/30">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Party Name" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border shadow-2xl max-h-[300px]">
              <SelectItem value="all">All Parties</SelectItem>
              {partyNames.map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[180px]">
          <Select value={productFilter} onValueChange={onProductFilterChange}>
            <SelectTrigger className="w-full h-12 bg-white border-border/60 rounded-2xl font-semibold shadow-sm focus:ring-primary/20 transition-all hover:border-primary/30">
              <SelectValue placeholder="Product Name" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border shadow-2xl">
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="Rice Bran Oil">Rice Bran Oil</SelectItem>
              <SelectItem value="Sunflower Oil">Sunflower Oil</SelectItem>
              <SelectItem value="Groundnut Oil">Groundnut Oil</SelectItem>
              <SelectItem value="Soybean Oil">Soybean Oil</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[160px]">
          <Select value={packingFilter} onValueChange={onPackingFilterChange}>
            <SelectTrigger className="w-full h-12 bg-white border-border/60 rounded-2xl font-semibold shadow-sm focus:ring-primary/20 transition-all hover:border-primary/30">
              <SelectValue placeholder="Packing Type" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border shadow-2xl">
              <SelectItem value="all">All Packing</SelectItem>
              <SelectItem value="Tin">Tin</SelectItem>
              <SelectItem value="Pouch">Pouch</SelectItem>
              <SelectItem value="Barrel">Barrel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[160px]">
          <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
            <SelectTrigger className="w-full h-12 bg-white border-border/60 rounded-2xl font-semibold shadow-sm focus:ring-primary/20 transition-all hover:border-primary/30">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border shadow-2xl">
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {onStatusFilterChange && (
          <div className="flex-1 min-w-[160px]">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full h-12 bg-white border-border/60 rounded-2xl font-semibold shadow-sm focus:ring-primary/20 transition-all hover:border-primary/30">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border shadow-2xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {(partyFilter !== "all" || productFilter !== "all" || packingFilter !== "all" || priorityFilter !== "all" || (statusFilter && statusFilter !== "all")) && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="h-12 px-6 text-muted-foreground hover:text-red-500 hover:bg-red-50 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all"
          >
            <FilterX className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
