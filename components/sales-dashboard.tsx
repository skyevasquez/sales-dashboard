"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, FileText, FileDown, Upload, BarChart, LineChart, LayoutDashboard, Loader2, Building2 } from "lucide-react"
import { AddStoreDialog } from "./add-store-dialog"
import { AddKpiDialog } from "./add-kpi-dialog"
import { GenerateReportDialog } from "./generate-report-dialog"
import { ReportsList } from "./reports-list"
import { ExportCsvDialog } from "./export-csv-dialog"
import { ImportCsvDialog } from "./import-csv-dialog"
import { SalesVisualizations } from "./sales-visualizations"
import { TrendAnalysis } from "./trend-analysis"
import { CustomizableDashboard } from "./customizable-dashboard"
import { getDashboardPreferences } from "@/utils/dashboard-preferences"
import type { Report } from "@/app/actions/report-actions"
import type { CsvImportResult } from "@/utils/csv-import"
import { toast } from "sonner"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useOrganization } from "./organization/organization-context"
import { authClient } from "@/lib/auth-client"

// Types
export interface Store {
  id: Id<"stores">
  name: string
}

export interface Kpi {
  id: Id<"kpis">
  name: string
}

export interface SalesData {
  storeId: Id<"stores">
  kpiId: Id<"kpis">
  monthlyGoal: number
  mtdSales: number
}

export function SalesDashboard() {
  // State
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false)
  const [isKpiDialogOpen, setIsKpiDialogOpen] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [isCsvExportDialogOpen, setIsCsvExportDialogOpen] = useState(false)
  const [isCsvImportDialogOpen, setIsCsvImportDialogOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [daysInMonth, setDaysInMonth] = useState(0)
  const [dayOfMonth, setDayOfMonth] = useState(0)
  const [daysRemaining, setDaysRemaining] = useState(0)
  const [activeTab, setActiveTab] = useState(getDashboardPreferences().defaultTab)

  const { data: session, isPending: authLoading } = authClient.useSession()
  const isAuthenticated = !!session?.user

  // Use organization context
  const { selectedOrgId, organizations, isLoading: orgLoading, canDelete } = useOrganization()

  const createStoreMutation = useMutation(api.stores.createStore)
  const deleteStoreMutation = useMutation(api.stores.deleteStore)
  const createKpiMutation = useMutation(api.kpis.createKpi)
  const deleteKpiMutation = useMutation(api.kpis.deleteKpi)
  const upsertDailySales = useMutation(api.dailySales.upsertFromMtd)
  const deleteReportMutation = useMutation(api.reports.deleteReport)

  const orgId = selectedOrgId
  const storeDocs = useQuery(api.stores.listStores, orgId ? { orgId } : "skip") ?? []
  const kpiDocs = useQuery(api.kpis.listKpis, orgId ? { orgId } : "skip") ?? []

  const stores = useMemo<Store[]>(
    () => storeDocs.map((store) => ({ id: store._id, name: store.name })),
    [storeDocs],
  )

  const kpis = useMemo<Kpi[]>(
    () => kpiDocs.map((kpi) => ({ id: kpi._id, name: kpi.name })),
    [kpiDocs],
  )

  const monthKey = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  }, [currentDate])

  const dateKey = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, "0")
    const day = String(currentDate.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }, [currentDate])

  const salesSummary = useQuery(
    api.dailySales.getSalesSummary,
    orgId ? { orgId, monthKey } : "skip",
  )

  const reportDocs = useQuery(api.reports.listReports, orgId ? { orgId } : "skip")

  const isLoading =
    authLoading ||
    orgLoading ||
    (orgId !== null && (storeDocs === undefined || kpiDocs === undefined))

  useEffect(() => {
    const now = new Date()
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    setCurrentDate(now)
    setDaysInMonth(lastDayOfMonth)
    setDayOfMonth(now.getDate())
    setDaysRemaining(lastDayOfMonth - now.getDate())
  }, [])

  useEffect(() => {
    if (!salesSummary) {
      return
    }

    setSalesData(
      salesSummary.map((entry: SalesData) => ({
        storeId: entry.storeId,
        kpiId: entry.kpiId,
        monthlyGoal: entry.monthlyGoal,
        mtdSales: entry.mtdSales,
      })),
    )
  }, [salesSummary])

  useEffect(() => {
    if (!reportDocs) {
      return
    }

    setReports(
      reportDocs.map((report) => ({
        id: report._id,
        name: report.name,
        createdAt: new Date(report.createdAt).toISOString(),
        url: report.url,
        storeIds: report.storeIds,
      })),
    )
  }, [reportDocs])


  // Add a new store
  const addStore = async (storeName: string) => {
    if (!orgId) {
      toast.error("Organization not ready")
      return
    }
    try {
      const newStoreId = await createStoreMutation({ orgId, name: storeName })

      // Create default sales data entries for this store with all KPIs
      setSalesData((prevSalesData) => {
        const newSalesData = [...prevSalesData]
        kpis.forEach((kpi) => {
          newSalesData.push({
            storeId: newStoreId,
            kpiId: kpi.id,
            monthlyGoal: 0,
            mtdSales: 0,
          })
        })
        return newSalesData
      })

      toast.success("Store added successfully")
    } catch (error) {
      console.error("Error adding store:", error)
      toast.error("Failed to add store")
    }
  }

  // Add a new KPI
  const addKpi = async (kpiName: string) => {
    if (!orgId) {
      toast.error("Organization not ready")
      return
    }
    try {
      const newKpiId = await createKpiMutation({ orgId, name: kpiName })

      // Create default sales data entries for this KPI with all stores
      setSalesData((prevSalesData) => {
        const newSalesData = [...prevSalesData]
        stores.forEach((store) => {
          newSalesData.push({
            storeId: store.id,
            kpiId: newKpiId,
            monthlyGoal: 0,
            mtdSales: 0,
          })
        })
        return newSalesData
      })

      toast.success("KPI added successfully")
    } catch (error) {
      console.error("Error adding KPI:", error)
      toast.error("Failed to add KPI")
    }
  }

  // Remove a store
  const removeStore = async (storeId: Id<"stores">) => {
    if (!orgId) {
      toast.error("Organization not ready")
      return
    }
    try {
      await deleteStoreMutation({ orgId, storeId })
      setSalesData((prevSalesData) => prevSalesData.filter((data) => data.storeId !== storeId))
      toast.success("Store deleted successfully")
    } catch (error) {
      console.error("Error deleting store:", error)
      toast.error("Failed to delete store")
    }
  }

  // Remove a KPI
  const removeKpi = async (kpiId: Id<"kpis">) => {
    if (!orgId) {
      toast.error("Organization not ready")
      return
    }
    try {
      await deleteKpiMutation({ orgId, kpiId })
      setSalesData((prevSalesData) => prevSalesData.filter((data) => data.kpiId !== kpiId))
      toast.success("KPI deleted successfully")
    } catch (error) {
      console.error("Error deleting KPI:", error)
      toast.error("Failed to delete KPI")
    }
  }

  // Update sales data
  const updateSalesData = async (
    storeId: Id<"stores">,
    kpiId: Id<"kpis">,
    field: "monthlyGoal" | "mtdSales",
    value: number,
  ) => {
    const dataIndex = salesData.findIndex((data) => data.storeId === storeId && data.kpiId === kpiId)

    let updatedEntry: SalesData
    let updatedDataset: SalesData[]

    if (dataIndex >= 0) {
      updatedEntry = { ...salesData[dataIndex], [field]: value }
      updatedDataset = [...salesData]
      updatedDataset[dataIndex] = updatedEntry
    } else {
      updatedEntry = {
        storeId,
        kpiId,
        monthlyGoal: field === "monthlyGoal" ? value : 0,
        mtdSales: field === "mtdSales" ? value : 0,
      }
      updatedDataset = [...salesData, updatedEntry]
    }

    setSalesData(updatedDataset)

    if (!orgId) {
      toast.error("Organization not ready")
      return
    }

    try {
      await upsertDailySales({
        orgId,
        storeId,
        kpiId,
        dateKey,
        monthKey,
        mtdSales: updatedEntry.mtdSales,
        monthlyGoal: updatedEntry.monthlyGoal,
      })
    } catch (error) {
      console.error("Error updating sales data:", error)
      toast.error("Failed to update sales data")
      setSalesData(updatedDataset)
    }
  }

  // Get sales data for a specific store and KPI
  const getSalesData = (storeId: Id<"stores">, kpiId: Id<"kpis">) => {
    return (
      salesData.find((data) => data.storeId === storeId && data.kpiId === kpiId) || {
        storeId,
        kpiId,
        monthlyGoal: 0,
        mtdSales: 0,
      }
    )
  }

  const mergeSalesDataRecords = (current: SalesData[], updates: SalesData[]) => {
    if (updates.length === 0) {
      return current
    }

    const recordMap = new Map(current.map((entry) => [`${entry.storeId}:${entry.kpiId}`, entry]))

    updates.forEach((update) => {
      const key = `${update.storeId}:${update.kpiId}`
      const existing = recordMap.get(key)
      recordMap.set(key, existing ? { ...existing, ...update } : { ...update })
    })

    return Array.from(recordMap.values())
  }

  // Handle report generation
  const handleReportGenerated = (report: Report) => {
    setReports((prev) => [...prev, report])
  }

  // Delete a report
  const deleteReport = async (reportId: Report["id"]) => {
    try {
      if (!orgId) {
        toast.error("Organization not ready")
        return
      }
      await deleteReportMutation({ orgId, reportId })
      setReports((prev) => prev.filter((report) => report.id !== reportId))
      toast.success("Report deleted successfully")
    } catch (error) {
      console.error("Error deleting report:", error)
      toast.error("Failed to delete report")
    }
  }

  // Handle CSV import
  const handleCsvImport = async (result: CsvImportResult) => {
    try {
      const storeNameMap = new Map(stores.map((store) => [store.name.trim().toLowerCase(), store]))
      const kpiNameMap = new Map(kpis.map((kpi) => [kpi.name.trim().toLowerCase(), kpi]))

      const createdStores: Store[] = []
      for (const name of result.newStoreNames) {
        const trimmedName = name.trim()
        if (!trimmedName) continue
        const key = trimmedName.toLowerCase()
        if (storeNameMap.has(key)) continue
        if (!orgId) {
          throw new Error("Organization not ready")
        }
        const newStoreId = await createStoreMutation({ orgId, name: trimmedName })
        const newStore = { id: newStoreId, name: trimmedName }
        createdStores.push(newStore)
        storeNameMap.set(key, newStore)
      }

      const createdKpis: Kpi[] = []
      for (const name of result.newKpiNames) {
        const trimmedName = name.trim()
        if (!trimmedName) continue
        const key = trimmedName.toLowerCase()
        if (kpiNameMap.has(key)) continue
        if (!orgId) {
          throw new Error("Organization not ready")
        }
        const newKpiId = await createKpiMutation({ orgId, name: trimmedName })
        const newKpi = { id: newKpiId, name: trimmedName }
        createdKpis.push(newKpi)
        kpiNameMap.set(key, newKpi)
      }

      const salesUpdates: SalesData[] = []

      result.salesRows.forEach((row, index) => {
        const store = storeNameMap.get(row.storeName.trim().toLowerCase())
        const kpi = kpiNameMap.get(row.kpiName.trim().toLowerCase())

        if (!store || !kpi) {
          console.warn(
            `Skipping CSV row ${index + 2}: unable to resolve store "${row.storeName}" and KPI "${row.kpiName}"`,
          )
          return
        }

        salesUpdates.push({
          storeId: store.id,
          kpiId: kpi.id,
          monthlyGoal: row.monthlyGoal,
          mtdSales: row.mtdSales,
        })
      })

      if (salesUpdates.length === 0) {
        toast.error("No valid rows found to import after resolving stores and KPIs")
        return
      }

      if (!orgId) {
        throw new Error("Organization not ready")
      }

      await Promise.all(
        salesUpdates.map((entry) =>
          upsertDailySales({
            orgId,
            storeId: entry.storeId,
            kpiId: entry.kpiId,
            dateKey,
            monthKey,
            mtdSales: entry.mtdSales,
            monthlyGoal: entry.monthlyGoal,
          }),
        ),
      )

      let mergedData: SalesData[] = []
      setSalesData((prev) => {
        mergedData = mergeSalesDataRecords(prev, salesUpdates)
        return mergedData
      })

      void mergedData
      toast.success(result.message || "Data imported successfully")
    } catch (error) {
      console.error("Error importing data:", error)
      toast.error("Failed to import data")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard data…</p>
        </div>
      </div>
    )
  }

  if (!orgId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <p className="text-lg font-medium">No Organization Selected</p>
            <p className="text-muted-foreground">
              Create or select an organization to get started
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>Today: {currentDate.toLocaleDateString()}</p>
          <p className="text-sm text-muted-foreground">
            Day {dayOfMonth} of {daysInMonth} ({daysRemaining} days remaining)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsStoreDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Store
          </Button>
          <Button variant="outline" onClick={() => setIsKpiDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add KPI
          </Button>
          <Button variant="outline" onClick={() => setIsReportDialogOpen(true)}>
            <FileText className="h-4 w-4 mr-2" /> Generate Report
          </Button>
          <Button variant="outline" onClick={() => setIsCsvExportDialogOpen(true)}>
            <FileDown className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" onClick={() => setIsCsvImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" /> Import CSV
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">
            <LayoutDashboard className="h-4 w-4 mr-2 inline" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="visualizations">
            <BarChart className="h-4 w-4 mr-2 inline" /> Visualizations
          </TabsTrigger>
          <TabsTrigger value="trends">
            <LineChart className="h-4 w-4 mr-2 inline" /> Trends
          </TabsTrigger>
          <TabsTrigger value="data-entry">Data Entry</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <CustomizableDashboard
            stores={stores}
            kpis={kpis}
            salesData={salesData}
            dateInfo={{ dayOfMonth, daysInMonth, daysRemaining }}
          />
        </TabsContent>

        <TabsContent value="visualizations" className="space-y-4">
          <SalesVisualizations
            stores={stores}
            kpis={kpis}
            salesData={salesData}
            dateInfo={{ dayOfMonth, daysInMonth }}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <TrendAnalysis stores={stores} kpis={kpis} salesData={salesData} />
        </TabsContent>

        <TabsContent value="data-entry">
          <Card>
            <CardHeader>
              <CardTitle>Update Goals & MTD Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {stores.length === 0 || kpis.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Please add at least one store and one KPI to get started.
                </p>
              ) : (
                <div className="space-y-6">
                  {stores.map((store) => (
                    <div key={store.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">{store.name}</h3>
                        {canDelete && (
                          <Button variant="ghost" size="icon" onClick={() => removeStore(store.id)} aria-label="Delete store">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {kpis.map((kpi) => {
                          const data = getSalesData(store.id, kpi.id)
                          return (
                            <Card key={kpi.id} className="overflow-hidden">
                              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-base">{kpi.name}</CardTitle>
                                {canDelete && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => removeKpi(kpi.id)}
                                    aria-label="Delete KPI"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </CardHeader>
                              <CardContent className="p-4 pt-2 space-y-2">
                                <div>
                                  <label
                                    className="text-sm font-medium"
                                    htmlFor={`monthly-goal-${store.id}-${kpi.id}`}
                                  >
                                    Monthly Goal
                                  </label>
                                  <Input
                                    id={`monthly-goal-${store.id}-${kpi.id}`}
                                    type="number"
                                    value={data.monthlyGoal || ""}
                                    onChange={(e) =>
                                      updateSalesData(
                                        store.id,
                                        kpi.id,
                                        "monthlyGoal",
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label
                                    className="text-sm font-medium"
                                    htmlFor={`mtd-sales-${store.id}-${kpi.id}`}
                                  >
                                    MTD Sales
                                  </label>
                                  <Input
                                    id={`mtd-sales-${store.id}-${kpi.id}`}
                                    type="number"
                                    value={data.mtdSales || ""}
                                    onChange={(e) =>
                                      updateSalesData(
                                        store.id,
                                        kpi.id,
                                        "mtdSales",
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsList
            reports={reports}
            stores={stores}
            onDeleteReport={deleteReport}
            onExportCsv={() => setIsCsvExportDialogOpen(true)}
            canDelete={canDelete}
          />
        </TabsContent>
      </Tabs>

      <AddStoreDialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen} onAdd={addStore} />

      <AddKpiDialog open={isKpiDialogOpen} onOpenChange={setIsKpiDialogOpen} onAdd={addKpi} />

      <GenerateReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        stores={stores}
        kpis={kpis}
        salesData={salesData}
        dateInfo={{ dayOfMonth, daysInMonth, daysRemaining }}
        onReportGenerated={handleReportGenerated}
      />

      <ExportCsvDialog
        open={isCsvExportDialogOpen}
        onOpenChange={setIsCsvExportDialogOpen}
        stores={stores}
        kpis={kpis}
        salesData={salesData}
        dateInfo={{ dayOfMonth, daysInMonth }}
      />

      <ImportCsvDialog
        open={isCsvImportDialogOpen}
        onOpenChange={setIsCsvImportDialogOpen}
        stores={stores}
        kpis={kpis}
        onImport={handleCsvImport}
      />
    </div>
  )
}
