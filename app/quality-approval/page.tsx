"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Upload, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StageIndicator } from "@/components/stage-indicator"
import { AppSidebar } from "@/components/app-sidebar"
import { ProductionProvider, useProduction } from "@/lib/production-context"
import { generateBatchNo, type QualityApproval } from "@/lib/production-data"
import { toast, Toaster } from "sonner"

const stages = ["Dashboard", "BOM Validation", "Quality Approval", "Packing Receipt", "Production"]

function QualityApprovalContent() {
  const router = useRouter()
  const { selectedIndent, setQualityApproval, setCurrentStage } = useProduction()
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    batchNo: generateBatchNo(),
    issuedQuantity: "",
    qaStatus: "Pass" as "Pass" | "Fail",
    issueDate: new Date().toISOString().split("T")[0],
    issuedBy: "",
    status: "Issued" as "Issued" | "Rejected",
  })

  const indent = selectedIndent || {
    productionIndentNo: "PI-001245",
    productName: "Rice Bran Oil",
    plannedQuantity: 25,
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file.name)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const approval: QualityApproval = {
      id: Date.now().toString(),
      indentNo: indent.productionIndentNo,
      batchNo: formData.batchNo,
      issuedQuantity: Number.parseFloat(formData.issuedQuantity),
      qaStatus: formData.qaStatus,
      qualityCertificate: uploadedFile,
      issueDate: formData.issueDate,
      issuedBy: formData.issuedBy,
      status: formData.status,
    }

    setQualityApproval(approval)
    toast.success("Quality-Approved Oil Issued", {
      description: `Batch ${formData.batchNo} has been ${formData.status.toLowerCase()}`,
    })
  }

  const handleProceed = () => {
    setCurrentStage(4)
    router.push("/packing-receipt")
  }

  const handleBack = () => {
    setCurrentStage(2)
    router.push("/bom-validation")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Quality Approval & Oil Issue</h1>
              <p className="text-muted-foreground">Ensure quality clearance before oil issue</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleProceed}>
                Proceed to Packing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <StageIndicator currentStage={3} stages={stages} />

          <Card className="border-border max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                Quality Approval Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="indentNo">Indent No</Label>
                    <Input id="indentNo" value={indent.productionIndentNo} disabled className="bg-secondary/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batchNo">Batch No</Label>
                    <Input id="batchNo" value={formData.batchNo} disabled className="bg-secondary/50 font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issuedQuantity">Issued Quantity (MT)</Label>
                    <Input
                      id="issuedQuantity"
                      type="number"
                      step="0.1"
                      value={formData.issuedQuantity}
                      onChange={(e) => setFormData({ ...formData, issuedQuantity: e.target.value })}
                      placeholder="0.0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qaStatus">QA Status</Label>
                    <Select
                      value={formData.qaStatus}
                      onValueChange={(value: "Pass" | "Fail") => {
                        setFormData({
                          ...formData,
                          qaStatus: value,
                          status: value === "Pass" ? "Issued" : "Rejected",
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select QA status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pass">Pass</SelectItem>
                        <SelectItem value="Fail">Fail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificate">Quality Certificate (PDF/Image)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="certificate"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="certificate" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      {uploadedFile ? (
                        <p className="text-primary font-medium">{uploadedFile}</p>
                      ) : (
                        <p className="text-muted-foreground">Click to upload certificate</p>
                      )}
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issuedBy">Issued By</Label>
                    <Input
                      id="issuedBy"
                      value={formData.issuedBy}
                      onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
                      placeholder="Enter name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "Issued" | "Rejected") => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Issued">Issued</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">
                  Submit Quality Approval
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Toaster position="top-right" theme="dark" richColors />
      </main>
    </div>
  )
}

export default function QualityApprovalPage() {
  return (
    <ProductionProvider>
      <QualityApprovalContent />
    </ProductionProvider>
  )
}
