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
import { generateSalesDataCsv, downloadCsv } from "@/utils/csv-export"
import type { Store, Kpi, SalesData } from "./sales-dashboard"

interface ExportCsvDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stores: Store[]
  kpis: Kpi[]
  salesData: SalesData[]
  dateInfo: {
    dayOfMonth: number
    daysInMonth: number
  }
}

export function ExportCsvDialog({ open, onOpenChange, stores, kpis, salesData, dateInfo }: ExportCsvDialogProps) {
  const [filename, setFilename] = useState(`sales-data-${new Date().toISOString().split("T")[0]}.csv`)
  const [selectedStores, setSelectedStores] = useState<string[]>([])
  const [selectedKpis, setSelectedKpis] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (filename.trim()) {
      setIsExporting(true)
      try {
        // Filter stores and KPIs if selections are made
        const filteredStores =
          selectedStores.length > 0 ? stores.filter((store) => selectedStores.includes(store.id)) : stores

        const filteredKpis = selectedKpis.length > 0 ? kpis.filter((kpi) => selectedKpis.includes(kpi.id)) : kpis

        // Generate and download CSV
        const csvContent = generateSalesDataCsv(filteredStores, filteredKpis, salesData, dateInfo)
        downloadCsv(csvContent, filename)

        // Close dialog
        onOpenChange(false)
      } catch (error) {
        console.error("Error exporting CSV:", error)
      } finally {
        setIsExporting(false)
      }
    }
  }

  const toggleStore = (storeId: string) => {
    setSelectedStores((prev) => (prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId]))
  }

  const toggleKpi = (kpiId: string) => {
    setSelectedKpis((prev) => (prev.includes(kpiId) ? prev.filter((id) => id !== kpiId) : [...prev, kpiId]))
  }

  const selectAllStores = () => {
    if (selectedStores.length === stores.length) {
      setSelectedStores([])
    } else {
      setSelectedStores(stores.map((store) => store.id))
    }
  }

  const selectAllKpis = () => {
    if (selectedKpis.length === kpis.length) {
      setSelectedKpis([])
    } else {
      setSelectedKpis(kpis.map((kpi) => kpi.id))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Export Sales Data as CSV</DialogTitle>
            <DialogDescription>
              Export your sales data to a CSV file that can be opened in Excel or Google Sheets.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filename" className="text-right">
                Filename
              </Label>
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Stores to Include</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all-stores"
                    checked={selectedStores.length === stores.length && stores.length > 0}
                    onCheckedChange={selectAllStores}
                  />
                  <label
                    htmlFor="select-all-stores"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {selectedStores.length === stores.length && stores.length > 0 ? "Deselect All" : "Select All"}
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

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">KPIs to Include</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all-kpis"
                    checked={selectedKpis.length === kpis.length && kpis.length > 0}
                    onCheckedChange={selectAllKpis}
                  />
                  <label
                    htmlFor="select-all-kpis"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {selectedKpis.length === kpis.length && kpis.length > 0 ? "Deselect All" : "Select All"}
                  </label>
                </div>

                {kpis.map((kpi) => (
                  <div key={kpi.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`kpi-${kpi.id}`}
                      checked={selectedKpis.includes(kpi.id)}
                      onCheckedChange={() => toggleKpi(kpi.id)}
                    />
                    <label
                      htmlFor={`kpi-${kpi.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {kpi.name}
                    </label>
                  </div>
                ))}

                {kpis.length === 0 && <p className="text-sm text-muted-foreground">No KPIs available.</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={!filename.trim() || isExporting || stores.length === 0 || kpis.length === 0}
            >
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
