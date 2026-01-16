"use client"

import { type ProductionIndent } from "@/lib/production-data"
import { Printer, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReceiptViewProps {
  indent: ProductionIndent
  onClose: () => void
}

export function ReceiptView({ indent, onClose }: ReceiptViewProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 w-full max-w-[800px] h-[90vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Actions Bar */}
        <div className="bg-slate-900 px-8 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="font-black text-primary text-xl">P</span>
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest">Document Preview</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Receipt NO: {indent.grnSlipNo || "PENDING"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrint} className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl">
              <Printer className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Receipt Area */}
        <div className="flex-1 overflow-y-auto bg-slate-100/50 p-8 custom-scrollbar print:p-0 print:bg-white">
          <div id="printable-receipt" className="bg-white shadow-sm border border-slate-200 rounded-px mx-auto w-full max-w-[700px] p-12 print:shadow-none print:border-none">
            
            {/* Business Header */}
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-1">PRODUCTION PRO</h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Manufacturing & Supply Chain</p>
                <div className="mt-4 space-y-0.5">
                  <p className="text-[11px] text-slate-400">123 Industrial Estate, Phase II</p>
                  <p className="text-[11px] text-slate-400">Raipur, Chhattisgarh, 492001</p>
                  <p className="text-[11px] text-slate-400">GSTIN: 22AAAAA0000A1Z5</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg inline-block mb-4">
                  <span className="text-xs font-black uppercase tracking-widest">Material Receipt</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Date of Receipt</p>
                  <p className="text-sm font-black text-slate-900">{indent.expectedDispatchDate || "---"}</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-200 mb-12" />

            {/* Document Details Grid */}
            <div className="grid grid-cols-2 gap-12 mb-12">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">Recipient Information</p>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900 uppercase">{indent.partyName}</p>
                    <p className="text-xs text-slate-500">Plan Ref: {indent.dispatchPlanRefNo}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">Indent Details</p>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900 uppercase">#{indent.productionIndentNo}</p>
                    <p className="text-xs text-slate-500">{indent.productName} ({indent.packingType})</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">Logistics Reference</p>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900">GRN: {indent.grnSlipNo}</p>
                    <p className="text-xs text-slate-500 font-bold text-emerald-600">STATUS: RECEIPT GENERATED</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">Stage History</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-500 flex justify-between"><span>BOM Validation</span> <span className="text-emerald-600 font-bold uppercase">{indent.bomStatus || "PASSED"}</span></p>
                    <p className="text-slate-500 flex justify-between"><span>QA Clearance</span> <span className="text-emerald-600 font-bold uppercase">{indent.qualityStatus || "PASSED"}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Area */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden mb-12">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-[10px] uppercase tracking-widest text-slate-400 font-black border-r border-slate-200">Item Description</th>
                    <th className="py-4 px-6 text-right text-[10px] uppercase tracking-widest text-slate-400 font-black border-r border-slate-200">UOM</th>
                    <th className="py-4 px-6 text-right text-[10px] uppercase tracking-widest text-slate-400 font-black">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-6 px-6 border-r border-slate-200">
                      <p className="text-sm font-black text-slate-900 uppercase">{indent.productName}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Packing Type: {indent.packingType}</p>
                    </td>
                    <td className="py-6 px-6 text-right border-r border-slate-200 text-sm font-bold text-slate-600">MT</td>
                    <td className="py-6 px-6 text-right text-lg font-black text-slate-900">{indent.plannedQuantity}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer Signatures */}
            <div className="grid grid-cols-2 gap-24 mt-24 mb-12">
              <div className="text-center">
                <div className="border-b border-slate-900 mb-2 h-10 w-full"></div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Authorized Signatory</p>
              </div>
              <div className="text-center">
                <div className="border-b border-slate-900 mb-2 h-10 w-full flex items-center justify-center">
                   <span className="text-[10px] font-mono text-slate-300 italic">SYSTEM GENERATED</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Receiver Signature</p>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                This document is a computer-generated confirmation of material receipt for production processing. 
                Values recorded are based on physical verification at the time of entry. 
                For any discrepancies, contact the logistics department immediately at support@productionpro.com.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-border/60 p-6 flex justify-center shrink-0">
           <Button onClick={onClose} className="rounded-2xl px-12 h-12 font-black uppercase tracking-widest">Close Preview</Button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20mm;
          }
        }
      `}</style>
    </div>
  )
}
