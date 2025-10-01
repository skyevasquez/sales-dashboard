"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { StoreMetricsGrid } from "./store-metrics-grid"
import { SalesVisualizations } from "./sales-visualizations"
import { TrendAnalysis } from "./trend-analysis"
import { DashboardCustomizationDialog } from "./dashboard-customization-dialog"
import { getDashboardPreferences, type DashboardPreferences, type ChartPreference } from "@/utils/dashboard-preferences"
import type { Store, Kpi, SalesData } from "./sales-dashboard"

interface CustomizableDashboardProps {
  stores: Store[]
  kpis: Kpi[]
  salesData: SalesData[]
  dateInfo: {
    dayOfMonth: number
    daysInMonth: number
    daysRemaining: number
  }
}

export function CustomizableDashboard({ stores, kpis, salesData, dateInfo }: CustomizableDashboardProps) {
  const [preferences, setPreferences] = useState<DashboardPreferences>(getDashboardPreferences())
  const [isCustomizationDialogOpen, setIsCustomizationDialogOpen] = useState(false)

  // Get visible charts sorted by order
  const visibleCharts = preferences.charts.filter((chart) => chart.visible).sort((a, b) => a.order - b.order)

  // Handle preferences change
  const handlePreferencesChange = (newPreferences: DashboardPreferences) => {
    setPreferences(newPreferences)
  }

  // Get CSS class for chart size
  const getChartSizeClass = (size: string) => {
    switch (size) {
      case "small":
        return "col-span-1"
      case "medium":
        return "col-span-2"
      case "large":
        return "col-span-3"
      default:
        return "col-span-2"
    }
  }

  // Render a specific chart based on its ID
  const renderChart = (chart: ChartPreference) => {
    switch (chart.id) {
      case "store-metrics":
        return (
          <StoreMetricsGrid
            stores={stores}
            kpis={kpis}
            salesData={salesData}
            daysInMonth={dateInfo.daysInMonth}
            dayOfMonth={dateInfo.dayOfMonth}
            daysRemaining={dateInfo.daysRemaining}
          />
        )
      case "overall-performance":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Overall Performance by Store</CardTitle>
              <CardDescription>Distribution of MTD sales across stores</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <SalesVisualizations
                stores={stores}
                kpis={kpis}
                salesData={salesData}
                dateInfo={{ dayOfMonth: dateInfo.dayOfMonth, daysInMonth: dateInfo.daysInMonth }}
                chartType="overall-performance"
              />
            </CardContent>
          </Card>
        )
      case "goal-vs-actual":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Goal vs Actual by KPI</CardTitle>
              <CardDescription>Comparison of MTD sales against expected progress</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <SalesVisualizations
                stores={stores}
                kpis={kpis}
                salesData={salesData}
                dateInfo={{ dayOfMonth: dateInfo.dayOfMonth, daysInMonth: dateInfo.daysInMonth }}
                chartType="goal-vs-actual"
              />
            </CardContent>
          </Card>
        )
      case "store-comparison":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Store Comparison</CardTitle>
              <CardDescription>MTD Sales vs Monthly Goal by Store</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <SalesVisualizations
                stores={stores}
                kpis={kpis}
                salesData={salesData}
                dateInfo={{ dayOfMonth: dateInfo.dayOfMonth, daysInMonth: dateInfo.daysInMonth }}
                chartType="store-comparison"
              />
            </CardContent>
          </Card>
        )
      case "percent-to-goal":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Percent to Goal by Store</CardTitle>
              <CardDescription>How close each store is to reaching their monthly goal</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <SalesVisualizations
                stores={stores}
                kpis={kpis}
                salesData={salesData}
                dateInfo={{ dayOfMonth: dateInfo.dayOfMonth, daysInMonth: dateInfo.daysInMonth }}
                chartType="percent-to-goal"
              />
            </CardContent>
          </Card>
        )
      case "kpi-comparison":
        return (
          <Card>
            <CardHeader>
              <CardTitle>KPI Comparison</CardTitle>
              <CardDescription>MTD Sales vs Monthly Goal by KPI</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <SalesVisualizations
                stores={stores}
                kpis={kpis}
                salesData={salesData}
                dateInfo={{ dayOfMonth: dateInfo.dayOfMonth, daysInMonth: dateInfo.daysInMonth }}
                chartType="kpi-comparison"
              />
            </CardContent>
          </Card>
        )
      case "trend-analysis":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
              <CardDescription>Performance trends over time</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TrendAnalysis
                stores={stores}
                kpis={kpis}
                salesData={salesData}
                compact={true}
                chartType="trend-direction"
              />
            </CardContent>
          </Card>
        )
      case "monthly-comparison":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Month-over-Month Comparison</CardTitle>
              <CardDescription>Compare current month with previous month</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TrendAnalysis
                stores={stores}
                kpis={kpis}
                salesData={salesData}
                compact={true}
                chartType="monthly-comparison"
              />
            </CardContent>
          </Card>
        )
      case "forecast":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Sales Forecast</CardTitle>
              <CardDescription>Projected performance based on historical trends</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TrendAnalysis stores={stores} kpis={kpis} salesData={salesData} compact={true} chartType="forecast" />
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  if (stores.length === 0 || kpis.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please add at least one store and one KPI to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setIsCustomizationDialogOpen(true)}>
          <Settings className="h-4 w-4 mr-2" /> Customize Dashboard
        </Button>
      </div>

      {preferences.layout === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleCharts.map((chart) => (
            <div key={chart.id} className={`${getChartSizeClass(chart.size)} flex flex-col`}>
              {renderChart(chart)}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {visibleCharts.map((chart) => (
            <div key={chart.id}>{renderChart(chart)}</div>
          ))}
        </div>
      )}

      <DashboardCustomizationDialog
        open={isCustomizationDialogOpen}
        onOpenChange={setIsCustomizationDialogOpen}
        onPreferencesChange={handlePreferencesChange}
      />
    </div>
  )
}
