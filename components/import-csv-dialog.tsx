"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { parseSalesCsv, generateCsvTemplate } from "@/utils/csv-import"
import { AlertCircle, CheckCircle2, Download, Upload } from "lucide-react"
import type { Store, Kpi } from "./sales-dashboard"
import type { CsvImportResult } from "@/utils/csv-import"

interface ImportCsvDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stores: Store[]
  kpis: Kpi[]
  onImport: (result: CsvImportResult) => void
}

export function ImportCsvDialog({ open, onOpenChange, stores, kpis, onImport }: ImportCsvDialogProps) {
  const [csvContent, setCsvContent] = useState("")
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setCsvContent(content)
      setImportResult(null)
    }
    reader.readAsText(file)
  }

  const handleParse = () => {
    if (!csvContent.trim()) return

    setIsProcessing(true)
    try {
      const result = parseSalesCsv(csvContent, stores, kpis)
      setImportResult(result)
    } catch (error) {
      setImportResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        newStores: [],
        newKpis: [],
        salesData: [],
        errors: [],
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = () => {
    if (importResult && importResult.success) {
      onImport(importResult)
      setCsvContent("")
      setImportResult(null)
      onOpenChange(false)
    }
  }

  const handleDownloadTemplate = () => {
    const template = generateCsvTemplate(stores, kpis)
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "sales-data-template.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Sales Data from CSV</DialogTitle>
          <DialogDescription>Upload a CSV file with your sales data or paste the content directly.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="paste">Paste Content</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Upload a CSV file</p>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              <Button onClick={() => fileInputRef.current?.click()}>Select File</Button>
            </div>
            {csvContent && (
              <div className="space-y-2">
                <p className="text-sm font-medium">File content preview:</p>
                <div className="max-h-[200px] overflow-auto border rounded-md p-2">
                  <pre className="text-xs">
                    {csvContent.slice(0, 1000)}
                    {csvContent.length > 1000 ? "..." : ""}
                  </pre>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="paste" className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Paste your CSV content below. The first row should contain headers.
              </p>
              <Textarea
                placeholder="Store,KPI,Monthly Goal,MTD Sales"
                value={csvContent}
                onChange={(e) => {
                  setCsvContent(e.target.value)
                  setImportResult(null)
                }}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="h-4 w-4 mr-2" /> Download Template
          </Button>
          <Button onClick={handleParse} disabled={!csvContent.trim() || isProcessing}>
            {isProcessing ? "Processing..." : "Validate Data"}
          </Button>
        </div>

        {importResult && (
          <div className="space-y-4">
            <Alert variant={importResult.success ? "default" : "destructive"}>
              {importResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{importResult.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{importResult.message}</AlertDescription>
            </Alert>

            {importResult.success && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Import Summary:</p>
                <ul className="text-sm space-y-1 list-disc pl-5">
                  <li>Data points: {importResult.salesData.length}</li>
                  {importResult.newStores.length > 0 && (
                    <li>New stores: {importResult.newStores.map((s) => s.name).join(", ")}</li>
                  )}
                  {importResult.newKpis.length > 0 && (
                    <li>New KPIs: {importResult.newKpis.map((k) => k.name).join(", ")}</li>
                  )}
                </ul>
              </div>
            )}

            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Errors:</p>
                <div className="max-h-[150px] overflow-auto border rounded-md p-2">
                  <ul className="text-xs space-y-1 list-disc pl-5">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!importResult || !importResult.success || importResult.salesData.length === 0}
          >
            Import Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
