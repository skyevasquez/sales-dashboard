"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Trash2, FileDown } from "lucide-react"
import type { Report } from "@/app/actions/report-actions"
import type { Store } from "./sales-dashboard"
import type { Id } from "@/convex/_generated/dataModel"

interface ReportsListProps {
  reports: Report[]
  stores: Store[]
  onDeleteReport: (reportId: Id<"reports">) => void
  onExportCsv?: () => void
  canDelete?: boolean
}

export function ReportsList({ reports, stores, onDeleteReport, onExportCsv, canDelete = true }: ReportsListProps) {
  // Sort reports by creation date (newest first)
  const sortedReports = [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const getStoreNames = (storeIds: Id<"stores">[]) => {
    if (storeIds.length === 0) return "All Stores"

    return storeIds.map((id) => stores.find((store) => store.id === id)?.name || "Unknown Store").join(", ")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <p className="mt-4 text-muted-foreground">No reports generated yet.</p>
          <p className="text-sm text-muted-foreground">Generate a report from the dashboard to see it here.</p>
          <Button variant="outline" className="mt-4" onClick={() => onExportCsv && onExportCsv()}>
            <FileDown className="h-4 w-4 mr-2" /> Export Data as CSV
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => onExportCsv && onExportCsv()}>
          <FileDown className="h-4 w-4 mr-2" /> Export Data as CSV
        </Button>
      </div>
      {sortedReports.map((report) => (
        <Card key={report.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{report.name}</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" asChild>
                  <a href={report.url} target="_blank" rel="noopener noreferrer" download>
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </a>
                </Button>
                {canDelete && (
                  <Button variant="outline" size="icon" onClick={() => onDeleteReport(report.id)} aria-label="Delete report">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                )}
              </div>
            </div>
            <CardDescription>Generated on {formatDate(report.createdAt)}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Stores: {getStoreNames(report.storeIds)}</p>
            <div className="mt-2">
              <Button variant="secondary" size="sm" asChild>
                <a href={report.url} target="_blank" rel="noopener noreferrer">
                  View Report
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
