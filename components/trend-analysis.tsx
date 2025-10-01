"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, RefreshCw } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { Store, Kpi, SalesData } from "./sales-dashboard"
import {
  getHistoricalDataForStoreAndKpi,
  calculateTrend,
  getMonthOverMonthComparison,
  saveHistoricalSnapshot,
  generateSampleHistoricalData,
} from "@/utils/historical-data"

interface TrendAnalysisProps {
  stores: Store[]
  kpis: Kpi[]
  salesData: SalesData[]
  compact?: boolean
  chartType?: string
}

export function TrendAnalysis({ stores, kpis, salesData, compact = false, chartType }: TrendAnalysisProps) {
  const [selectedStore, setSelectedStore] = useState<string>(stores.length > 0 ? stores[0].id : "")
  const [selectedKpi, setSelectedKpi] = useState<string>(kpis.length > 0 ? kpis[0].id : "")
  const [timeRange, setTimeRange] = useState<string>("30")
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [trendData, setTrendData] = useState<any>(null)
  const [monthlyComparison, setMonthlyComparison] = useState<any>(null)
  const [isGeneratingSample, setIsGeneratingSample] = useState(false)

  // Load historical data on component mount and when selections change
  useEffect(() => {
    if (selectedStore && selectedKpi) {
      const data = getHistoricalDataForStoreAndKpi(selectedStore, selectedKpi, Number.parseInt(timeRange))
      setHistoricalData(data)

      const trend = calculateTrend(selectedStore, selectedKpi, Number.parseInt(timeRange))
      setTrendData(trend)

      const comparison = getMonthOverMonthComparison(selectedStore, selectedKpi)
      setMonthlyComparison(comparison)
    }
  }, [selectedStore, selectedKpi, timeRange])

  // Save current data as a historical snapshot
  const handleSaveSnapshot = () => {
    saveHistoricalSnapshot(salesData)
    // Refresh the data
    if (selectedStore && selectedKpi) {
      const data = getHistoricalDataForStoreAndKpi(selectedStore, selectedKpi, Number.parseInt(timeRange))
      setHistoricalData(data)

      const trend = calculateTrend(selectedStore, selectedKpi, Number.parseInt(timeRange))
      setTrendData(trend)

      const comparison = getMonthOverMonthComparison(selectedStore, selectedKpi)
      setMonthlyComparison(comparison)
    }
  }

  // Generate sample historical data for testing
  const handleGenerateSampleData = async () => {
    setIsGeneratingSample(true)
    try {
      // Generate sample data
      const sampleData = generateSampleHistoricalData(stores, kpis, 30)

      // Save to localStorage
      localStorage.setItem("historicalData", JSON.stringify(sampleData))

      // Refresh the data
      if (selectedStore && selectedKpi) {
        const data = getHistoricalDataForStoreAndKpi(selectedStore, selectedKpi, Number.parseInt(timeRange))
        setHistoricalData(data)

        const trend = calculateTrend(selectedStore, selectedKpi, Number.parseInt(timeRange))
        setTrendData(trend)

        const comparison = getMonthOverMonthComparison(selectedStore, selectedKpi)
        setMonthlyComparison(comparison)
      }
    } finally {
      setIsGeneratingSample(false)
    }
  }

  // If no data, show a message
  if (stores.length === 0 || kpis.length === 0) {
    return (
      <div className={compact ? "p-4" : ""}>
        <p className="text-center text-muted-foreground">
          Please add at least one store and one KPI to view trend analysis.
        </p>
      </div>
    )
  }

  // If chartType is specified, render only that chart
  if (chartType) {
    switch (chartType) {
      case "trend-direction":
        return (
          <div className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div>
                  <Select value={selectedStore} onValueChange={setSelectedStore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedKpi} onValueChange={setSelectedKpi}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select KPI" />
                    </SelectTrigger>
                    <SelectContent>
                      {kpis.map((kpi) => (
                        <SelectItem key={kpi.id} value={kpi.id}>
                          {kpi.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 Days</SelectItem>
                      <SelectItem value="14">Last 14 Days</SelectItem>
                      <SelectItem value="30">Last 30 Days</SelectItem>
                      <SelectItem value="90">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="h-[300px]">
              <ChartContainer
                config={{
                  value: {
                    label: "Sales",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-value)"
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        )

      case "monthly-comparison":
        return (
          <div className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div>
                  <Select value={selectedStore} onValueChange={setSelectedStore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedKpi} onValueChange={setSelectedKpi}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select KPI" />
                    </SelectTrigger>
                    <SelectContent>
                      {kpis.map((kpi) => (
                        <SelectItem key={kpi.id} value={kpi.id}>
                          {kpi.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {monthlyComparison && (
              <div className="flex flex-col items-center justify-center h-[200px]">
                <div
                  className={`flex items-center ${
                    monthlyComparison.percentChange > 0
                      ? "text-green-500"
                      : monthlyComparison.percentChange < 0
                        ? "text-red-500"
                        : "text-gray-500"
                  }`}
                >
                  {monthlyComparison.percentChange > 0 ? (
                    <ArrowUpIcon className="h-12 w-12 mr-2" />
                  ) : monthlyComparison.percentChange < 0 ? (
                    <ArrowDownIcon className="h-12 w-12 mr-2" />
                  ) : (
                    <MinusIcon className="h-12 w-12 mr-2" />
                  )}
                  <span className="font-bold text-3xl">
                    {monthlyComparison.percentChange > 0 ? "+" : ""}
                    {monthlyComparison.percentChange.toFixed(1)}%
                  </span>
                </div>
                <p className="text-lg text-muted-foreground mt-4">
                  Current: {monthlyComparison.currentMonth.toLocaleString()} | Previous:{" "}
                  {monthlyComparison.previousMonth.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )

      case "forecast":
        return (
          <div className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div>
                  <Select value={selectedStore} onValueChange={setSelectedStore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedKpi} onValueChange={setSelectedKpi}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select KPI" />
                    </SelectTrigger>
                    <SelectContent>
                      {kpis.map((kpi) => (
                        <SelectItem key={kpi.id} value={kpi.id}>
                          {kpi.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 Days</SelectItem>
                      <SelectItem value="14">Last 14 Days</SelectItem>
                      <SelectItem value="30">Last 30 Days</SelectItem>
                      <SelectItem value="90">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="h-[300px]">
              <ChartContainer
                config={{
                  actual: {
                    label: "Actual",
                    color: "hsl(var(--chart-1))",
                  },
                  forecast: {
                    label: "Forecast",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={(() => {
                      // Use historical data for forecasting
                      if (historicalData.length < 5) return historicalData

                      // Simple linear regression for forecasting
                      const xValues = historicalData.map((_, i) => i)
                      const yValues = historicalData.map((item) => item.value)

                      // Calculate slope and intercept
                      const n = xValues.length
                      const sumX = xValues.reduce((a, b) => a + b, 0)
                      const sumY = yValues.reduce((a, b) => a + b, 0)
                      const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0)
                      const sumXX = xValues.reduce((acc, x) => acc + x * x, 0)

                      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
                      const intercept = (sumY - slope * sumX) / n

                      // Generate forecast data
                      const actualData = [...historicalData]
                      const forecastDays = 7 // Forecast for next 7 days

                      // Add forecast points
                      for (let i = 1; i <= forecastDays; i++) {
                        const lastDate = new Date(actualData[actualData.length - 1].date)
                        lastDate.setDate(lastDate.getDate() + 1)

                        const x = xValues.length + i - 1
                        const forecastValue = slope * x + intercept

                        actualData.push({
                          date: lastDate.toLocaleDateString(),
                          value: null, // No actual value
                          forecast: Math.max(0, forecastValue), // Ensure non-negative
                        })
                      }

                      // Add forecast values to actual data
                      return actualData.map((item, i) => ({
                        ...item,
                        actual: item.value,
                        forecast: i >= actualData.length - forecastDays ? Math.max(0, slope * i + intercept) : null,
                      }))
                    })()}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Actual"
                      stroke="var(--color-actual)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      name="Forecast"
                      stroke="var(--color-forecast)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // If no historical data, show a message
  const hasHistoricalData = historicalData.length > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Trend Analysis</h2>
          <p className="text-muted-foreground">Track performance trends over time</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleSaveSnapshot}>
            <RefreshCw className="h-4 w-4 mr-2" /> Save Snapshot
          </Button>
          {!hasHistoricalData && (
            <Button variant="outline" onClick={handleGenerateSampleData} disabled={isGeneratingSample}>
              {isGeneratingSample ? "Generating..." : "Generate Sample Data"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Store</label>
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger>
              <SelectValue placeholder="Select Store" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">KPI</label>
          <Select value={selectedKpi} onValueChange={setSelectedKpi}>
            <SelectTrigger>
              <SelectValue placeholder="Select KPI" />
            </SelectTrigger>
            <SelectContent>
              {kpis.map((kpi) => (
                <SelectItem key={kpi.id} value={kpi.id}>
                  {kpi.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Time Range</label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="14">Last 14 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!hasHistoricalData ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No historical data available. Save a snapshot of your current data or generate sample data to see trends.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="trends">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="comparison">Period Comparison</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Trend Direction</CardTitle>
                </CardHeader>
                <CardContent>
                  {trendData && (
                    <div className="flex items-center justify-center h-24">
                      {trendData.trend === "up" ? (
                        <div className="flex flex-col items-center text-green-500">
                          <ArrowUpIcon className="h-12 w-12" />
                          <p className="font-bold text-lg">+{trendData.percentChange.toFixed(1)}%</p>
                        </div>
                      ) : trendData.trend === "down" ? (
                        <div className="flex flex-col items-center text-red-500">
                          <ArrowDownIcon className="h-12 w-12" />
                          <p className="font-bold text-lg">{trendData.percentChange.toFixed(1)}%</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-gray-500">
                          <MinusIcon className="h-12 w-12" />
                          <p className="font-bold text-lg">Stable</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Month-over-Month</CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyComparison && (
                    <div className="flex flex-col items-center justify-center h-24">
                      <div
                        className={`flex items-center ${
                          monthlyComparison.percentChange > 0
                            ? "text-green-500"
                            : monthlyComparison.percentChange < 0
                              ? "text-red-500"
                              : "text-gray-500"
                        }`}
                      >
                        {monthlyComparison.percentChange > 0 ? (
                          <ArrowUpIcon className="h-5 w-5 mr-1" />
                        ) : monthlyComparison.percentChange < 0 ? (
                          <ArrowDownIcon className="h-5 w-5 mr-1" />
                        ) : (
                          <MinusIcon className="h-5 w-5 mr-1" />
                        )}
                        <span className="font-bold text-lg">
                          {monthlyComparison.percentChange > 0 ? "+" : ""}
                          {monthlyComparison.percentChange.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {monthlyComparison.currentMonth.toLocaleString()} vs{" "}
                        {monthlyComparison.previousMonth.toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col justify-center h-24">
                    {trendData && (
                      <p className="text-sm">
                        {trendData.trend === "up"
                          ? `Strong upward trend of ${trendData.percentChange.toFixed(1)}% over the last ${
                              trendData.values.length
                            } days.`
                          : trendData.trend === "down"
                            ? `Downward trend of ${trendData.percentChange.toFixed(1)}% over the last ${
                                trendData.values.length
                              } days.`
                            : `Stable performance over the last ${trendData.values.length} days.`}
                      </p>
                    )}
                    {monthlyComparison && (
                      <p className="text-sm mt-2">
                        {monthlyComparison.percentChange > 5
                          ? "Significant improvement compared to last month."
                          : monthlyComparison.percentChange < -5
                            ? "Significant decline compared to last month."
                            : "Similar performance to last month."}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {kpis.find((k) => k.id === selectedKpi)?.name} Trend for{" "}
                  {stores.find((s) => s.id === selectedStore)?.name}
                </CardTitle>
                <CardDescription>Performance over the last {timeRange} days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Sales",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historicalData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="var(--color-value)"
                          fillOpacity={1}
                          fill="url(#colorValue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Period Comparison</CardTitle>
                <CardDescription>Compare performance across different time periods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Sales",
                        color: "hsl(var(--chart-1))",
                      },
                      average: {
                        label: "Average",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          name="Sales"
                          stroke="var(--color-value)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey={() => {
                            // Calculate average
                            if (historicalData.length === 0) return 0
                            const sum = historicalData.reduce((acc, item) => acc + item.value, 0)
                            return sum / historicalData.length
                          }}
                          name="Average"
                          stroke="var(--color-average)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Performance</CardTitle>
                  <CardDescription>Average daily performance by week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        average: {
                          label: "Average Daily Sales",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={(() => {
                            // Group data by week
                            const weeks: { [key: string]: number[] } = {}

                            historicalData.forEach((item) => {
                              const date = new Date(item.date)
                              // Get week number (approximate)
                              const weekNum = Math.floor(date.getDate() / 7) + 1
                              const weekKey = `Week ${weekNum}`

                              if (!weeks[weekKey]) {
                                weeks[weekKey] = []
                              }

                              weeks[weekKey].push(item.value)
                            })

                            // Calculate averages
                            return Object.entries(weeks).map(([week, values]) => ({
                              week,
                              average: values.reduce((sum, val) => sum + val, 0) / values.length,
                            }))
                          })()}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="average" name="Average Daily Sales" fill="var(--color-average)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Rate</CardTitle>
                  <CardDescription>Day-to-day growth rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        growthRate: {
                          label: "Growth Rate (%)",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={(() => {
                            // Calculate day-to-day growth rate
                            const growthData = []

                            for (let i = 1; i < historicalData.length; i++) {
                              const prevValue = historicalData[i - 1].value
                              const currValue = historicalData[i].value

                              let growthRate = 0
                              if (prevValue > 0) {
                                growthRate = ((currValue - prevValue) / prevValue) * 100
                              }

                              growthData.push({
                                date: historicalData[i].date,
                                growthRate,
                              })
                            }

                            return growthData
                          })()}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar
                            dataKey="growthRate"
                            name="Growth Rate (%)"
                            fill={(entry) => (entry.growthRate >= 0 ? "#4ade80" : "#f87171")}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales Forecast</CardTitle>
                <CardDescription>Projected performance based on historical trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      actual: {
                        label: "Actual",
                        color: "hsl(var(--chart-1))",
                      },
                      forecast: {
                        label: "Forecast",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={(() => {
                          // Use historical data for forecasting
                          if (historicalData.length < 5) return historicalData

                          // Simple linear regression for forecasting
                          const xValues = historicalData.map((_, i) => i)
                          const yValues = historicalData.map((item) => item.value)

                          // Calculate slope and intercept
                          const n = xValues.length
                          const sumX = xValues.reduce((a, b) => a + b, 0)
                          const sumY = yValues.reduce((a, b) => a + b, 0)
                          const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0)
                          const sumXX = xValues.reduce((acc, x) => acc + x * x, 0)

                          const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
                          const intercept = (sumY - slope * sumX) / n

                          // Generate forecast data
                          const actualData = [...historicalData]
                          const forecastDays = 7 // Forecast for next 7 days

                          // Add forecast points
                          for (let i = 1; i <= forecastDays; i++) {
                            const lastDate = new Date(actualData[actualData.length - 1].date)
                            lastDate.setDate(lastDate.getDate() + 1)

                            const x = xValues.length + i - 1
                            const forecastValue = slope * x + intercept

                            actualData.push({
                              date: lastDate.toLocaleDateString(),
                              value: null, // No actual value
                              forecast: Math.max(0, forecastValue), // Ensure non-negative
                            })
                          }

                          // Add forecast values to actual data
                          return actualData
                        })()}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="actual"
                          name="Actual"
                          stroke="var(--color-actual)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          connectNulls
                        />
                        <Line
                          type="monotone"
                          dataKey="forecast"
                          name="Forecast"
                          stroke="var(--color-forecast)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 4 }}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
