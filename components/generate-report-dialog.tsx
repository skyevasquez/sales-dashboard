"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { generateReport } from "@/app/actions/report-actions"
import type { Store, Kpi, SalesData } from "./sales-dashboard"
import type { Report } from "@/app/actions/report-actions"
import type { Id } from "@/convex/_generated/dataModel"

interface GenerateReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stores: Store[]
  kpis: Kpi[]
  salesData: SalesData[]
  dateInfo: {
    dayOfMonth: number
    daysInMonth: number
    daysRemaining: number
  }
  onReportGenerated: (report: Report) => void
}

export function GenerateReportDialog({
  open,
  onOpenChange,
  stores,
  kpis,
  salesData,
  dateInfo,
  onReportGenerated,
}: GenerateReportDialogProps) {
  const [reportName, setReportName] = useState(`Sales Report - ${new Date().toLocaleDateString()}`)
  const [selectedStores, setSelectedStores] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (reportName.trim()) {
      setIsGenerating(true)
      try {
        const result = await generateReport(reportName.trim(), stores, kpis, salesData, selectedStores, dateInfo)

        if (result.success && result.report) {
          onReportGenerated(result.report)
          setReportName(`Sales Report - ${new Date().toLocaleDateString()}`)
          setSelectedStores([])
          onOpenChange(false)
        } else {
          console.error("Failed to generate report")
        }
      } catch (error) {
        console.error("Error generating report:", error)
      } finally {
        setIsGenerating(false)
      }
    }
  }

  const toggleStore = (storeId: string) => {
    setSelectedStores((prev) => (prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId]))
  }

  const selectAllStores = () => {
    if (selectedStores.length === stores.length) {
      setSelectedStores([])
    } else {
      setSelectedStores(stores.map((store) => store.id))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Generate Sales Report</DialogTitle>
            <DialogDescription>Create a PDF report of your sales performance data.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="report-name" className="text-right">
                Report Name
              </Label>
              <Input
                id="report-name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Stores to Include</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedStores.length === stores.length && stores.length > 0}
                    onCheckedChange={selectAllStores}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {selectedStores.length === stores.length ? "Deselect All" : "Select All"}
                  </label>
                </div>

                {stores.map((store) => (
                  <div key={store.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`store-${store.id}`}
                      checked={selectedStores.includes(store.id)}
                      onCheckedChange={() => toggleStore(store.id)}
                    />
                    <label
                      htmlFor={`store-${store.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {store.name}
                    </label>
                  </div>
                ))}

                {stores.length === 0 && <p className="text-sm text-muted-foreground">No stores available.</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!reportName.trim() || isGenerating || stores.length === 0}>
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
