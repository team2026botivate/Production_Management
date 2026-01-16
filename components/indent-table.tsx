"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"
import { PriorityBadge } from "./priority-badge"
import { useProduction } from "@/lib/production-context"
import { type ProductionIndent } from "@/lib/production-data"
import { ReceiptView } from "./receipt-view"
import { useState } from "react"

interface IndentTableProps {
  onProceed: (indentId: string) => void
  showAction?: boolean
  data?: ProductionIndent[]
  statusField?: "bom" | "quality" | "grn" | "workflow"
  showReceipt?: boolean
}

export function IndentTable({ onProceed, showAction = false, data, statusField, showReceipt = false }: IndentTableProps) {
  const { indents: contextIndents } = useProduction()
  const [viewingReceipt, setViewingReceipt] = useState<ProductionIndent | null>(null)
  const indents = data || contextIndents

  return (
    <div className="h-full overflow-auto bg-card rounded-b-2xl border-t border-border/40 relative">
      <Table className="border-separate border-spacing-0">
        <TableHeader>
          <TableRow className="hover:bg-transparent border-none text-center">
            {/* Individually sticky TableHeads are required for table headers to stay fixed on scroll */}
            {showAction && <TableHead className="sticky top-0 z-30 bg-secondary font-black uppercase text-[10px] tracking-widest h-16 text-center border-b border-border/40 min-w-[100px]">Action</TableHead>}
            <TableHead className="sticky top-0 z-20 bg-secondary px-6 font-black uppercase text-[10px] tracking-widest h-16 border-b border-border/40">Indent No</TableHead>
            <TableHead className="sticky top-0 z-20 bg-secondary font-black uppercase text-[10px] tracking-widest h-16 border-b border-border/40">Dispatch Plan Ref</TableHead>
            <TableHead className="sticky top-0 z-20 bg-secondary font-black uppercase text-[10px] tracking-widest h-16 border-b border-border/40">Customer / Party Name</TableHead>
            <TableHead className="sticky top-0 z-20 bg-secondary font-black uppercase text-[10px] tracking-widest h-16 border-b border-border/40">Product Name</TableHead>
            <TableHead className="sticky top-0 z-20 bg-secondary font-black uppercase text-[10px] tracking-widest h-16 text-center border-b border-border/40">Planned Qty (MT)</TableHead>
            <TableHead className="sticky top-0 z-20 bg-secondary font-black uppercase text-[10px] tracking-widest h-16 border-b border-border/40">Packing Type</TableHead>
            <TableHead className="sticky top-0 z-20 bg-secondary font-black uppercase text-[10px] tracking-widest h-16 border-b border-border/40">Dispatch Date</TableHead>
            <TableHead className="sticky top-0 z-20 bg-secondary font-black uppercase text-[10px] tracking-widest h-16 text-center pr-6 border-b border-border/40 whitespace-nowrap">Priority</TableHead>
            {statusField && (
              <TableHead className="sticky top-0 z-20 bg-secondary font-black uppercase text-[10px] tracking-widest h-16 text-center border-b border-border/40 min-w-[100px]">
                {statusField === "bom" ? "BOM Status" : 
                 statusField === "quality" ? "QA Status" : 
                 statusField === "grn" ? "GRN / Receipt Slip No" : 
                 "Status"}
              </TableHead>
            )}
            {showReceipt && <TableHead className="sticky top-0 z-30 bg-secondary font-black uppercase text-[10px] tracking-widest h-16 text-center border-b border-border/40 min-w-[100px]">Receipt</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {indents.map((indent) => (
            <TableRow
              key={indent.id}
              className={`hover:bg-secondary/30 transition-colors ${!showAction ? 'cursor-pointer' : ''}`}
              onClick={() => !showAction && onProceed(indent.id)}
            >
              {showAction && (
                <TableCell className="text-center py-6">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onProceed(indent.id);
                    }}
                    variant="outline"
                    size="sm"
                    className="rounded-lg font-bold text-[10px] uppercase tracking-wider h-8 px-3 border-primary/20 hover:border-primary hover:bg-primary/5 text-primary transition-all shadow-sm"
                  >
                    Process
                  </Button>
                </TableCell>
              )}
              <TableCell className="font-mono text-primary font-bold py-6 px-6">{indent.productionIndentNo}</TableCell>
              <TableCell className="font-mono text-[10px] text-muted-foreground py-6">{indent.dispatchPlanRefNo}</TableCell>
              <TableCell className="font-semibold text-foreground/80 py-6 truncate max-w-[150px]">{indent.partyName}</TableCell>
              <TableCell className="font-bold text-foreground py-6">{indent.productName}</TableCell>
              <TableCell className="text-center font-black text-foreground py-6">{indent.plannedQuantity}</TableCell>
              <TableCell className="text-muted-foreground font-medium py-6">{indent.packingType}</TableCell>
              <TableCell className="text-muted-foreground font-medium text-xs py-6">{indent.expectedDispatchDate}</TableCell>
              <TableCell className="text-center pr-6 py-6">
                <PriorityBadge priority={indent.priority} />
              </TableCell>
              {statusField && (
                <TableCell className="text-center py-6">
                  {statusField === "grn" ? (
                    <div className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded border border-primary/10 inline-block">
                      {indent.grnSlipNo || "-"}
                    </div>
                  ) : statusField === "workflow" ? (
                    <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border inline-block ${
                      indent.isProductionCompleted 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>
                      {indent.isProductionCompleted ? "Completed" : "Pending"}
                    </div>
                  ) : (
                    <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border inline-block ${
                      (() => {
                        const status = statusField === "bom" ? indent.bomStatus : indent.qualityStatus;
                        if (!status) return "bg-gray-50 text-gray-400 border-gray-100";
                        if (["Approved", "Issued", "Pass"].includes(status)) return "bg-emerald-50 text-emerald-600 border-emerald-100";
                        if (["Hold", "Modify", "Pending"].includes(status)) return "bg-amber-50 text-amber-600 border-amber-100";
                        return "bg-rose-50 text-rose-600 border-rose-100";
                      })()
                    }`}>
                      {statusField === "quality" 
                        ? (indent.qualityStatus === "Issued" ? "Pass" : indent.qualityStatus === "Rejected" ? "Fail" : "-") 
                        : (statusField === "bom" ? indent.bomStatus : indent.qualityStatus) || "-"}
                    </div>
                  )}
                </TableCell>
              )}
              {showReceipt && (
                <TableCell className="text-center py-6">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary/80 font-bold text-[10px] uppercase tracking-wider h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingReceipt(indent);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {viewingReceipt && (
        <ReceiptView 
          indent={viewingReceipt} 
          onClose={() => setViewingReceipt(null)} 
        />
      )}
    </div>
  )
}
