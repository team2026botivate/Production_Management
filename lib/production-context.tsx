"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import {
  type ProductionIndent,
  type RawMaterial,
  type QualityApproval,
  type PackingReceipt,
  type RawMaterialConsumption,
  type Wastage,
  initialIndents,
  initialRawMaterials,
} from "./production-data"

interface ProductionContextType {
  indents: ProductionIndent[]
  setIndents: (indents: ProductionIndent[]) => void
  addIndent: (indent: ProductionIndent) => void
  selectedIndent: ProductionIndent | null
  setSelectedIndent: (indent: ProductionIndent | null) => void
  rawMaterials: RawMaterial[]
  setRawMaterials: (materials: RawMaterial[]) => void
  updateRawMaterial: (id: string, updates: Partial<RawMaterial>) => void
  qualityApproval: QualityApproval | null
  setQualityApproval: (approval: QualityApproval | null) => void
  packingReceipt: PackingReceipt | null
  setPackingReceipt: (receipt: PackingReceipt | null) => void
  consumption: RawMaterialConsumption[]
  setConsumption: (consumption: RawMaterialConsumption[]) => void
  wastage: Wastage[]
  setWastage: (wastage: Wastage[]) => void
  currentStage: number
  setCurrentStage: (stage: number) => void
}

const ProductionContext = createContext<ProductionContextType | undefined>(undefined)

export function ProductionProvider({ children }: { children: ReactNode }) {
  const [indents, setIndents] = useState<ProductionIndent[]>(initialIndents)
  const [selectedIndent, setSelectedIndent] = useState<ProductionIndent | null>(null)
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(initialRawMaterials)
  const [qualityApproval, setQualityApproval] = useState<QualityApproval | null>(null)
  const [packingReceipt, setPackingReceipt] = useState<PackingReceipt | null>(null)
  const [consumption, setConsumption] = useState<RawMaterialConsumption[]>([])
  const [wastage, setWastage] = useState<Wastage[]>([])
  const [currentStage, setCurrentStage] = useState(1)

  const addIndent = (indent: ProductionIndent) => {
    setIndents((prev) => [...prev, indent])
  }

  const updateRawMaterial = (id: string, updates: Partial<RawMaterial>) => {
    setRawMaterials((prev) => prev.map((rm) => (rm.id === id ? { ...rm, ...updates } : rm)))
  }

  return (
    <ProductionContext.Provider
      value={{
        indents,
        setIndents,
        addIndent,
        selectedIndent,
        setSelectedIndent,
        rawMaterials,
        setRawMaterials,
        updateRawMaterial,
        qualityApproval,
        setQualityApproval,
        packingReceipt,
        setPackingReceipt,
        consumption,
        setConsumption,
        wastage,
        setWastage,
        currentStage,
        setCurrentStage,
      }}
    >
      {children}
    </ProductionContext.Provider>
  )
}

export function useProduction() {
  const context = useContext(ProductionContext)
  if (!context) {
    throw new Error("useProduction must be used within a ProductionProvider")
  }
  return context
}
