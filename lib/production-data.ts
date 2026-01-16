export interface ProductionIndent {
  id: string
  productionIndentNo: string
  dispatchPlanRefNo: string
  partyName: string
  productName: string
  plannedQuantity: number
  packingType: "Tin" | "Pouch" | "Barrel"
  expectedDispatchDate: string
  priority: "Normal" | "Urgent"
  status: "Generated" | "Approved" | "Issued" | "Completed"
  isBomValidated?: boolean
  bomStatus?: string
  bomRemarks?: string
  isQualityApproved?: boolean
  qualityStatus?: string
  qualityRemarks?: string
  qualityBatchNo?: string
  qualityIssueDate?: string
  qualityIssuedBy?: string
  qualityIssuedQty?: number
  isPackingReceiptGenerated?: boolean
  grnSlipNo?: string
  receiptUrl?: string
  receiptDate?: string
  receiptTime?: string
  receiptReceiverName?: string
  receiptReceivedQty?: number
  isProductionCompleted?: boolean
  productionActualConsumption?: any[]
  productionWastage?: any[]
}

export interface RawMaterial {
  id: string
  name: string
  bomVersion: string
  standardQtyPerMT: number
  requiredQty: number
  availableStock: number
  shortageQty: number
  status: "Pending" | "Approved" | "Hold" | "Modify"
}

export interface QualityApproval {
  id: string
  indentNo: string
  batchNo: string
  issuedQuantity: number
  qaStatus: "Pass" | "Fail"
  qualityCertificate: string | null
  issueDate: string
  issuedBy: string
  status: "Issued" | "Rejected"
}

export interface PackingReceipt {
  id: string
  receivedQuantity: number
  receiptDateTime: string
  receiverName: string
  grnSlipNo: string
}

export interface RawMaterialConsumption {
  id: string
  name: string
  plannedQty: number
  actualConsumedQty: number
  variance: number
}

export interface Wastage {
  id: string
  rawMaterial: string
  quantity: number
  remarks: string
  supervisorApproval: boolean
}

// Generate auto ID
export const generateIndentNo = () => `PI-${Date.now().toString().slice(-6)}`
export const generateGRNNo = () => `GRN-${Date.now().toString().slice(-6)}`
export const generateBatchNo = () => `BATCH-${Date.now().toString().slice(-6)}`

// Initial dummy data
export const initialIndents: ProductionIndent[] = [
  {
    id: "1",
    productionIndentNo: "PI-001245",
    dispatchPlanRefNo: "DP-2026-001",
    partyName: "Metro Foods Pvt Ltd",
    productName: "Rice Bran Oil",
    plannedQuantity: 25,
    packingType: "Tin",
    expectedDispatchDate: "2026-01-20",
    priority: "Urgent",
    status: "Generated",
  },
  {
    id: "2",
    productionIndentNo: "PI-001246",
    dispatchPlanRefNo: "DP-2026-002",
    partyName: "FreshMart Distributors",
    productName: "Sunflower Oil",
    plannedQuantity: 50,
    packingType: "Pouch",
    expectedDispatchDate: "2026-01-22",
    priority: "Normal",
    status: "Generated",
  },
  {
    id: "3",
    productionIndentNo: "PI-001247",
    dispatchPlanRefNo: "DP-2026-003",
    partyName: "Golden Harvest Corp",
    productName: "Groundnut Oil",
    plannedQuantity: 15,
    packingType: "Barrel",
    expectedDispatchDate: "2026-01-25",
    priority: "Normal",
    status: "Generated",
  },
  {
    id: "4",
    productionIndentNo: "PI-001248",
    dispatchPlanRefNo: "DP-2026-004",
    partyName: "Nature's Best Foods",
    productName: "Rice Bran Oil",
    plannedQuantity: 40,
    packingType: "Tin",
    expectedDispatchDate: "2026-01-18",
    priority: "Urgent",
    status: "Generated",
  },
  {
    id: "5",
    productionIndentNo: "PI-001249",
    dispatchPlanRefNo: "DP-2026-005",
    partyName: "Global Mart",
    productName: "Soya Bean Oil",
    plannedQuantity: 35,
    packingType: "Pouch",
    expectedDispatchDate: "2026-01-28",
    priority: "Normal",
    status: "Generated",
  },
  {
    id: "6",
    productionIndentNo: "PI-001250",
    dispatchPlanRefNo: "DP-2026-006",
    partyName: "Pure Organics Ltd",
    productName: "Olive Oil",
    plannedQuantity: 10,
    packingType: "Tin",
    expectedDispatchDate: "2026-01-30",
    priority: "Urgent",
    status: "Generated",
  },
  {
    id: "7",
    productionIndentNo: "PI-001251",
    dispatchPlanRefNo: "DP-2026-007",
    partyName: "Quality Foods Co.",
    productName: "Mustard Oil",
    plannedQuantity: 60,
    packingType: "Barrel",
    expectedDispatchDate: "2026-02-01",
    priority: "Normal",
    status: "Generated",
  },
  {
    id: "8",
    productionIndentNo: "PI-001252",
    dispatchPlanRefNo: "DP-2026-008",
    partyName: "Elite Retailers",
    productName: "Coconut Oil",
    plannedQuantity: 20,
    packingType: "Pouch",
    expectedDispatchDate: "2026-02-03",
    priority: "Urgent",
    status: "Generated",
  },
  {
    id: "9",
    productionIndentNo: "PI-001253",
    dispatchPlanRefNo: "DP-2026-009",
    partyName: "Sunrise Wholesalers",
    productName: "Sunflower Oil",
    plannedQuantity: 45,
    packingType: "Tin",
    expectedDispatchDate: "2026-02-05",
    priority: "Normal",
    status: "Generated",
  },
]

export const initialRawMaterials: RawMaterial[] = [
  {
    id: "1",
    name: "Rope",
    bomVersion: "v2.1",
    standardQtyPerMT: 0.5,
    requiredQty: 12.5,
    availableStock: 15,
    shortageQty: 0,
    status: "Pending",
  },
  {
    id: "2",
    name: "Cartoon",
    bomVersion: "v2.1",
    standardQtyPerMT: 45,
    requiredQty: 1125,
    availableStock: 1200,
    shortageQty: 0,
    status: "Pending",
  },
  {
    id: "3",
    name: "Tin",
    bomVersion: "v2.1",
    standardQtyPerMT: 50,
    requiredQty: 1250,
    availableStock: 1400,
    shortageQty: 0,
    status: "Pending",
  },
  {
    id: "4",
    name: "Sticker",
    bomVersion: "v2.1",
    standardQtyPerMT: 100,
    requiredQty: 2500,
    availableStock: 3000,
    shortageQty: 0,
    status: "Pending",
  },
  {
    id: "5",
    name: "Pouch",
    bomVersion: "v2.1",
    standardQtyPerMT: 2000,
    requiredQty: 50000,
    availableStock: 48000,
    shortageQty: 2000,
    status: "Pending",
  },
  {
    id: "6",
    name: "Barrel",
    bomVersion: "v2.1",
    standardQtyPerMT: 10,
    requiredQty: 250,
    availableStock: 300,
    shortageQty: 0,
    status: "Pending",
  },
]
