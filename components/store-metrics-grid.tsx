import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Store, Kpi, SalesData } from "./sales-dashboard"
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react"

interface StoreMetricsGridProps {
  stores: Store[]
  kpis: Kpi[]
  salesData: SalesData[]
  daysInMonth: number
  dayOfMonth: number
  daysRemaining: number
}

export function StoreMetricsGrid({
  stores,
  kpis,
  salesData,
  daysInMonth,
  dayOfMonth,
  daysRemaining,
}: StoreMetricsGridProps) {
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

  // Calculate percent to goal
  const calculatePercentToGoal = (mtdSales: number, monthlyGoal: number) => {
    if (monthlyGoal === 0) return 0
    return (mtdSales / monthlyGoal) * 100
  }

  // Calculate projected end of month
  const calculateProjection = (mtdSales: number, dayOfMonth: number, daysInMonth: number) => {
    if (dayOfMonth === 0) return 0
    const dailyAverage = mtdSales / dayOfMonth
    return dailyAverage * daysInMonth
  }

  // Calculate daily target needed to reach goal
  const calculateDailyTarget = (monthlyGoal: number, mtdSales: number, daysRemaining: number) => {
    if (daysRemaining === 0) return 0
    const remaining = monthlyGoal - mtdSales
    return remaining > 0 ? remaining / daysRemaining : 0
  }

  return (
    <div className="grid gap-6">
      {stores.map((store) => (
        <Card key={store.id}>
          <CardHeader>
            <CardTitle>{store.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpis.map((kpi) => {
                const data = getSalesData(store.id, kpi.id)
                const percentToGoal = calculatePercentToGoal(data.mtdSales, data.monthlyGoal)
                const projection = calculateProjection(data.mtdSales, dayOfMonth, daysInMonth)
                const dailyTarget = calculateDailyTarget(data.monthlyGoal, data.mtdSales, daysRemaining)

                // Determine if we're ahead, behind, or on track
                let status = "neutral"
                let StatusIcon = MinusIcon

                if (data.monthlyGoal > 0) {
                  const expectedPercent = (dayOfMonth / daysInMonth) * 100
                  if (percentToGoal > expectedPercent + 5) {
                    status = "ahead"
                    StatusIcon = ArrowUpIcon
                  } else if (percentToGoal < expectedPercent - 5) {
                    status = "behind"
                    StatusIcon = ArrowDownIcon
                  }
                }

                return (
                  <Card key={kpi.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        {kpi.name}
                        <span
                          className={`inline-flex items-center ${
                            status === "ahead"
                              ? "text-green-500"
                              : status === "behind"
                                ? "text-red-500"
                                : "text-gray-500"
                          }`}
                        >
                          <StatusIcon className="h-4 w-4 mr-1" />
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Monthly Goal</p>
                          <p className="text-sm font-medium">{data.monthlyGoal.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">MTD Sales</p>
                          <p className="text-sm font-medium">{data.mtdSales.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{percentToGoal.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              status === "ahead" ? "bg-green-500" : status === "behind" ? "bg-red-500" : "bg-primary"
                            }`}
                            style={{ width: `${Math.min(percentToGoal, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Projected</p>
                          <p className="text-sm font-medium">
                            {projection.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Daily Target</p>
                          <p className="text-sm font-medium">
                            {dailyTarget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
