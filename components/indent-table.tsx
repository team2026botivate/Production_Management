"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"
import { PriorityBadge } from "./priority-badge"
import { useProduction } from "@/lib/production-context"
import { ArrowRight } from "lucide-react"

interface IndentTableProps {
  onProceed: (indentId: string) => void
}

export function IndentTable({ onProceed }: IndentTableProps) {
  const { indents } = useProduction()

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            <TableHead className="text-muted-foreground font-semibold">Production Indent No</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Dispatch Plan Ref</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Party / Customer</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Product</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-right">Qty (MT)</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Packing</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Dispatch Date</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Priority</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {indents.map((indent) => (
            <TableRow key={indent.id} className="hover:bg-secondary/30">
              <TableCell className="font-mono text-primary">{indent.productionIndentNo}</TableCell>
              <TableCell className="font-mono text-sm">{indent.dispatchPlanRefNo}</TableCell>
              <TableCell>{indent.partyName}</TableCell>
              <TableCell>{indent.productName}</TableCell>
              <TableCell className="text-right font-medium">{indent.plannedQuantity}</TableCell>
              <TableCell>{indent.packingType}</TableCell>
              <TableCell>{indent.expectedDispatchDate}</TableCell>
              <TableCell>
                <PriorityBadge priority={indent.priority} />
              </TableCell>
              <TableCell>
                <StatusBadge status={indent.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => onProceed(indent.id)}
                >
                  Proceed
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
