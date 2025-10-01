"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, FileText, FileDown, Upload, BarChart, LineChart, LayoutDashboard, Loader2 } from "lucide-react"
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
import * as db from "@/lib/db-service"
import { toast } from "sonner"

// Types
export interface Store {
  id: string
  name: string
}

export interface Kpi {
  id: string
  name: string
}

export interface SalesData {
  storeId: string
  kpiId: string
  monthlyGoal: number
  mtdSales: number
}

export function SalesDashboard() {
  // State
  const [stores, setStores] = useState<Store[]>([])
  const [kpis, setKpis] = useState<Kpi[]>([])
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  // Load data from Appwrite on component mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [storesData, kpisData, salesDataData, reportsData] = await Promise.all([
          db.getStores(),
          db.getKpis(),
          db.getSalesData(),
          db.getReports(),
        ])

        setStores(storesData)
        setKpis(kpisData)
        setSalesData(salesDataData)
        setReports(reportsData)

        // Set date calculations
        const now = new Date()
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        setCurrentDate(now)
        setDaysInMonth(lastDayOfMonth)
        setDayOfMonth(now.getDate())
        setDaysRemaining(lastDayOfMonth - now.getDate())
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Failed to load data from database")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])


  // Add a new store
  const addStore = async (storeName: string) => {
    try {
      const newStore = await db.createStore(storeName)
      setStores((prevStores) => [...prevStores, newStore])

      // Create default sales data entries for this store with all KPIs
      const newSalesDataPromises = kpis.map((kpi) =>
        db.upsertSalesData({
          storeId: newStore.id,
          kpiId: kpi.id,
          monthlyGoal: 0,
          mtdSales: 0,
        }),
      )

      await Promise.all(newSalesDataPromises)

      // Update local state
      setSalesData((prevSalesData) => {
        const newSalesData = [...prevSalesData]
        kpis.forEach((kpi) => {
          newSalesData.push({
            storeId: newStore.id,
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
    try {
      const newKpi = await db.createKpi(kpiName)
      setKpis((prevKpis) => [...prevKpis, newKpi])

      // Create default sales data entries for this KPI with all stores
      const newSalesDataPromises = stores.map((store) =>
        db.upsertSalesData({
          storeId: store.id,
          kpiId: newKpi.id,
          monthlyGoal: 0,
          mtdSales: 0,
        }),
      )

      await Promise.all(newSalesDataPromises)

      // Update local state
      setSalesData((prevSalesData) => {
        const newSalesData = [...prevSalesData]
        stores.forEach((store) => {
          newSalesData.push({
            storeId: store.id,
            kpiId: newKpi.id,
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
  const removeStore = async (storeId: string) => {
    try {
      await db.deleteStore(storeId)
      await db.deleteSalesDataByStore(storeId)
      setStores((prevStores) => prevStores.filter((store) => store.id !== storeId))
      setSalesData((prevSalesData) => prevSalesData.filter((data) => data.storeId !== storeId))
      toast.success("Store deleted successfully")
    } catch (error) {
      console.error("Error deleting store:", error)
      toast.error("Failed to delete store")
    }
  }

  // Remove a KPI
  const removeKpi = async (kpiId: string) => {
    try {
      await db.deleteKpi(kpiId)
      await db.deleteSalesDataByKpi(kpiId)
      setKpis((prevKpis) => prevKpis.filter((kpi) => kpi.id !== kpiId))
      setSalesData((prevSalesData) => prevSalesData.filter((data) => data.kpiId !== kpiId))
      toast.success("KPI deleted successfully")
    } catch (error) {
      console.error("Error deleting KPI:", error)
      toast.error("Failed to delete KPI")
    }
  }

  // Update sales data
  const updateSalesData = async (storeId: string, kpiId: string, field: "monthlyGoal" | "mtdSales", value: number) => {
    // Optimistically update local state
    setSalesData((prevSalesData) => {
      const newSalesData = [...prevSalesData]
      const dataIndex = newSalesData.findIndex((data) => data.storeId === storeId && data.kpiId === kpiId)

      if (dataIndex >= 0) {
        newSalesData[dataIndex] = {
          ...newSalesData[dataIndex],
          [field]: value,
        }
      } else {
        // Create new entry if it doesn't exist
        newSalesData.push({
          storeId,
          kpiId,
          monthlyGoal: field === "monthlyGoal" ? value : 0,
          mtdSales: field === "mtdSales" ? value : 0,
        })
      }

      return newSalesData
    })

    // Save to Appwrite
    try {
      const currentData = salesData.find((data) => data.storeId === storeId && data.kpiId === kpiId)
      await db.upsertSalesData({
        storeId,
        kpiId,
        monthlyGoal: field === "monthlyGoal" ? value : currentData?.monthlyGoal || 0,
        mtdSales: field === "mtdSales" ? value : currentData?.mtdSales || 0,
      })

      // Save a historical snapshot when data is updated
      await db.createSnapshot(salesData)
    } catch (error) {
      console.error("Error updating sales data:", error)
      toast.error("Failed to update sales data")
    }
  }

  // Get sales data for a specific store and KPI
  const getSalesData = (storeId: string, kpiId: string) => {
    return (
      salesData.find((data) => data.storeId === storeId && data.kpiId === kpiId) || {
        storeId,
        kpiId,
        monthlyGoal: 0,
        mtdSales: 0,
      }
    )
  }

  // Handle report generation
  const handleReportGenerated = (report: Report) => {
    setReports((prev) => [...prev, report])
  }

  // Delete a report
  const deleteReport = async (reportId: string) => {
    try {
      await db.deleteReport(reportId)
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
      // Add new stores
      if (result.newStores.length > 0) {
        setStores((prev) => [...prev, ...result.newStores])
      }

      // Add new KPIs
      if (result.newKpis.length > 0) {
        setKpis((prev) => [...prev, ...result.newKpis])
      }

      // Update sales data in Appwrite
      for (const importedData of result.salesData) {
        await db.upsertSalesData(importedData)
      }

      // Update local state
      setSalesData((prev) => {
        const newData = [...prev]

        // Process each imported data point
        result.salesData.forEach((importedData) => {
          const existingIndex = newData.findIndex(
            (data) => data.storeId === importedData.storeId && data.kpiId === importedData.kpiId,
          )

          if (existingIndex >= 0) {
            // Update existing data
            newData[existingIndex] = {
              ...newData[existingIndex],
              monthlyGoal: importedData.monthlyGoal,
              mtdSales: importedData.mtdSales,
            }
          } else {
            // Add new data
            newData.push(importedData)
          }
        })

        return newData
      })

      // Save a historical snapshot after import
      await db.createSnapshot(salesData)
      toast.success("Data imported successfully")
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
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Today: {currentDate.toLocaleDateString()}</p>
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
                        <Button variant="ghost" size="icon" onClick={() => removeStore(store.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {kpis.map((kpi) => {
                          const data = getSalesData(store.id, kpi.id)
                          return (
                            <Card key={kpi.id} className="overflow-hidden">
                              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-base">{kpi.name}</CardTitle>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => removeKpi(kpi.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </CardHeader>
                              <CardContent className="p-4 pt-2 space-y-2">
                                <div>
                                  <label className="text-sm font-medium">Monthly Goal</label>
                                  <Input
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
                                  <label className="text-sm font-medium">MTD Sales</label>
                                  <Input
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
