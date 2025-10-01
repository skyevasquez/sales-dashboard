"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { Store, Kpi, SalesData } from "./sales-dashboard"

interface SalesVisualizationsProps {
  stores: Store[]
  kpis: Kpi[]
  salesData: SalesData[]
  dateInfo: {
    dayOfMonth: number
    daysInMonth: number
  }
  chartType?: string // Optional prop to render a specific chart
}

export function SalesVisualizations({ stores, kpis, salesData, dateInfo, chartType }: SalesVisualizationsProps) {
  const [selectedKpi, setSelectedKpi] = useState<string>(kpis.length > 0 ? kpis[0].id : "")
  const [selectedStore, setSelectedStore] = useState<string>(stores.length > 0 ? stores[0].id : "")

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

  // Prepare data for store comparison chart
  const prepareStoreComparisonData = () => {
    if (!selectedKpi) return []

    return stores.map((store) => {
      const data = salesData.find((d) => d.storeId === store.id && d.kpiId === selectedKpi)
      const mtdSales = data?.mtdSales || 0
      const monthlyGoal = data?.monthlyGoal || 0
      const percentToGoal = calculatePercentToGoal(mtdSales, monthlyGoal)
      const projection = calculateProjection(mtdSales, dateInfo.dayOfMonth, dateInfo.daysInMonth)

      return {
        name: store.name,
        mtdSales,
        monthlyGoal,
        percentToGoal,
        projection,
      }
    })
  }

  // Prepare data for KPI comparison chart
  const prepareKpiComparisonData = () => {
    if (!selectedStore) return []

    return kpis.map((kpi) => {
      const data = salesData.find((d) => d.storeId === selectedStore && d.kpiId === kpi.id)
      const mtdSales = data?.mtdSales || 0
      const monthlyGoal = data?.monthlyGoal || 0
      const percentToGoal = calculatePercentToGoal(mtdSales, monthlyGoal)
      const projection = calculateProjection(mtdSales, dateInfo.dayOfMonth, dateInfo.daysInMonth)

      return {
        name: kpi.name,
        mtdSales,
        monthlyGoal,
        percentToGoal,
        projection,
      }
    })
  }

  // Prepare data for overall performance pie chart
  const prepareOverallPerformanceData = () => {
    const totalMtdSales = salesData.reduce((sum, data) => sum + data.mtdSales, 0)

    if (totalMtdSales === 0) return []

    return stores.map((store) => {
      const storeData = salesData.filter((d) => d.storeId === store.id)
      const storeMtdSales = storeData.reduce((sum, data) => sum + data.mtdSales, 0)
      const percentage = (storeMtdSales / totalMtdSales) * 100

      return {
        name: store.name,
        value: storeMtdSales,
        percentage,
      }
    })
  }

  // Prepare data for goal vs actual chart
  const prepareGoalVsActualData = () => {
    return kpis.map((kpi) => {
      const kpiData = salesData.filter((d) => d.kpiId === kpi.id)
      const totalMtdSales = kpiData.reduce((sum, data) => sum + data.mtdSales, 0)
      const totalMonthlyGoal = kpiData.reduce((sum, data) => sum + data.monthlyGoal, 0)
      const expectedProgress = (dateInfo.dayOfMonth / dateInfo.daysInMonth) * totalMonthlyGoal

      return {
        name: kpi.name,
        mtdSales: totalMtdSales,
        expectedProgress,
        monthlyGoal: totalMonthlyGoal,
      }
    })
  }

  // Generate colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#8DD1E1"]

  // If no data, show a message
  if (stores.length === 0 || kpis.length === 0) {
    return (
      <div className="p-4">
        <p className="text-center text-muted-foreground">
          Please add at least one store and one KPI to view visualizations.
        </p>
      </div>
    )
  }

  // If chartType is specified, render only that chart
  if (chartType) {
    switch (chartType) {
      case "overall-performance":
        return (
          <div className="h-[300px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prepareOverallPerformanceData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                >
                  {prepareOverallPerformanceData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )

      case "goal-vs-actual":
        return (
          <div className="h-[300px] p-4">
            <ChartContainer
              config={{
                mtdSales: {
                  label: "MTD Sales",
                  color: "hsl(var(--chart-1))",
                },
                expectedProgress: {
                  label: "Expected Progress",
                  color: "hsl(var(--chart-2))",
                },
                monthlyGoal: {
                  label: "Monthly Goal",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareGoalVsActualData()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="mtdSales" name="MTD Sales" fill="var(--color-mtdSales)" />
                  <Bar dataKey="expectedProgress" name="Expected Progress" fill="var(--color-expectedProgress)" />
                  <Bar dataKey="monthlyGoal" name="Monthly Goal" fill="var(--color-monthlyGoal)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )

      case "store-comparison":
        return (
          <div className="h-[400px] p-4">
            <div className="flex justify-end mb-4">
              <Select value={selectedKpi} onValueChange={setSelectedKpi}>
                <SelectTrigger className="w-[180px]">
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
            <ChartContainer
              config={{
                mtdSales: {
                  label: "MTD Sales",
                  color: "hsl(var(--chart-1))",
                },
                monthlyGoal: {
                  label: "Monthly Goal",
                  color: "hsl(var(--chart-2))",
                },
                projection: {
                  label: "Projected EOM",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[350px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareStoreComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="mtdSales" name="MTD Sales" fill="var(--color-mtdSales)" />
                  <Bar dataKey="monthlyGoal" name="Monthly Goal" fill="var(--color-monthlyGoal)" />
                  <Bar dataKey="projection" name="Projected EOM" fill="var(--color-projection)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )

      case "percent-to-goal":
        return (
          <div className="h-[300px] p-4">
            <div className="flex justify-end mb-4">
              <Select value={selectedKpi} onValueChange={setSelectedKpi}>
                <SelectTrigger className="w-[180px]">
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
            <ChartContainer
              config={{
                percentToGoal: {
                  label: "Percent to Goal",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareStoreComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <ChartTooltip
                    formatter={(value) => `${Number(value).toFixed(1)}%`}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="percentToGoal"
                    name="Percent to Goal"
                    fill="var(--color-percentToGoal)"
                    label={{ position: "top", formatter: (value) => `${Number(value).toFixed(0)}%` }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )

      case "kpi-comparison":
        return (
          <div className="h-[400px] p-4">
            <div className="flex justify-end mb-4">
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="w-[180px]">
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
            <ChartContainer
              config={{
                mtdSales: {
                  label: "MTD Sales",
                  color: "hsl(var(--chart-1))",
                },
                monthlyGoal: {
                  label: "Monthly Goal",
                  color: "hsl(var(--chart-2))",
                },
                projection: {
                  label: "Projected EOM",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[350px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareKpiComparisonData()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="mtdSales" name="MTD Sales" fill="var(--color-mtdSales)" />
                  <Bar dataKey="monthlyGoal" name="Monthly Goal" fill="var(--color-monthlyGoal)" />
                  <Bar dataKey="projection" name="Projected EOM" fill="var(--color-projection)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )

      default:
        return null
    }
  }

  // Otherwise, render the full visualization tab
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stores">By Store</TabsTrigger>
          <TabsTrigger value="kpis">By KPI</TabsTrigger>
          <TabsTrigger value="goals">Goals vs Actual</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance by Store</CardTitle>
                <CardDescription>Distribution of MTD sales across stores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareOverallPerformanceData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                      >
                        {prepareOverallPerformanceData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goal vs Actual by KPI</CardTitle>
                <CardDescription>Comparison of MTD sales against expected progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      mtdSales: {
                        label: "MTD Sales",
                        color: "hsl(var(--chart-1))",
                      },
                      expectedProgress: {
                        label: "Expected Progress",
                        color: "hsl(var(--chart-2))",
                      },
                      monthlyGoal: {
                        label: "Monthly Goal",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareGoalVsActualData()} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="mtdSales" name="MTD Sales" fill="var(--color-mtdSales)" />
                        <Bar dataKey="expectedProgress" name="Expected Progress" fill="var(--color-expectedProgress)" />
                        <Bar dataKey="monthlyGoal" name="Monthly Goal" fill="var(--color-monthlyGoal)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stores" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <Select value={selectedKpi} onValueChange={setSelectedKpi}>
              <SelectTrigger className="w-[180px]">
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

          <Card>
            <CardHeader>
              <CardTitle>Store Comparison: {kpis.find((k) => k.id === selectedKpi)?.name}</CardTitle>
              <CardDescription>MTD Sales vs Monthly Goal by Store</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    mtdSales: {
                      label: "MTD Sales",
                      color: "hsl(var(--chart-1))",
                    },
                    monthlyGoal: {
                      label: "Monthly Goal",
                      color: "hsl(var(--chart-2))",
                    },
                    projection: {
                      label: "Projected EOM",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareStoreComparisonData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="mtdSales" name="MTD Sales" fill="var(--color-mtdSales)" />
                      <Bar dataKey="monthlyGoal" name="Monthly Goal" fill="var(--color-monthlyGoal)" />
                      <Bar dataKey="projection" name="Projected EOM" fill="var(--color-projection)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Percent to Goal by Store</CardTitle>
              <CardDescription>How close each store is to reaching their monthly goal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    percentToGoal: {
                      label: "Percent to Goal",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareStoreComparisonData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <ChartTooltip
                        formatter={(value) => `${Number(value).toFixed(1)}%`}
                        content={<ChartTooltipContent />}
                      />
                      <Bar
                        dataKey="percentToGoal"
                        name="Percent to Goal"
                        fill="var(--color-percentToGoal)"
                        label={{ position: "top", formatter: (value) => `${Number(value).toFixed(0)}%` }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-[180px]">
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

          <Card>
            <CardHeader>
              <CardTitle>KPI Comparison: {stores.find((s) => s.id === selectedStore)?.name || "All Stores"}</CardTitle>
              <CardDescription>MTD Sales vs Monthly Goal by KPI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    mtdSales: {
                      label: "MTD Sales",
                      color: "hsl(var(--chart-1))",
                    },
                    monthlyGoal: {
                      label: "Monthly Goal",
                      color: "hsl(var(--chart-2))",
                    },
                    projection: {
                      label: "Projected EOM",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareKpiComparisonData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="mtdSales" name="MTD Sales" fill="var(--color-mtdSales)" />
                      <Bar dataKey="monthlyGoal" name="Monthly Goal" fill="var(--color-monthlyGoal)" />
                      <Bar dataKey="projection" name="Projected EOM" fill="var(--color-projection)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Percent to Goal by KPI</CardTitle>
              <CardDescription>How close each KPI is to reaching the monthly goal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    percentToGoal: {
                      label: "Percent to Goal",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareKpiComparisonData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <YAxis dataKey="name" type="category" width={100} />
                      <ChartTooltip
                        formatter={(value) => `${Number(value).toFixed(1)}%`}
                        content={<ChartTooltipContent />}
                      />
                      <Bar
                        dataKey="percentToGoal"
                        name="Percent to Goal"
                        fill="var(--color-percentToGoal)"
                        label={{ position: "right", formatter: (value) => `${Number(value).toFixed(0)}%` }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Toward Goals</CardTitle>
              <CardDescription>
                Current progress compared to expected progress (
                {Math.round((dateInfo.dayOfMonth / dateInfo.daysInMonth) * 100)}% of month elapsed)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    mtdSales: {
                      label: "MTD Sales",
                      color: "hsl(var(--chart-1))",
                    },
                    expectedProgress: {
                      label: "Expected Progress",
                      color: "hsl(var(--chart-2))",
                    },
                    monthlyGoal: {
                      label: "Monthly Goal",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareGoalVsActualData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="mtdSales"
                        name="MTD Sales"
                        stroke="var(--color-mtdSales)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="expectedProgress"
                        name="Expected Progress"
                        stroke="var(--color-expectedProgress)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="monthlyGoal"
                        name="Monthly Goal"
                        stroke="var(--color-monthlyGoal)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Goal Achievement Rate</CardTitle>
              <CardDescription>Percentage of monthly goal achieved vs expected at this point</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    actual: {
                      label: "Actual %",
                      color: "hsl(var(--chart-1))",
                    },
                    expected: {
                      label: "Expected %",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareGoalVsActualData().map((item) => ({
                        name: item.name,
                        actual: item.monthlyGoal > 0 ? (item.mtdSales / item.monthlyGoal) * 100 : 0,
                        expected: (dateInfo.dayOfMonth / dateInfo.daysInMonth) * 100,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <ChartTooltip
                        formatter={(value) => `${Number(value).toFixed(1)}%`}
                        content={<ChartTooltipContent />}
                      />
                      <Legend />
                      <Bar dataKey="actual" name="Actual %" fill="var(--color-actual)" />
                      <Bar dataKey="expected" name="Expected %" fill="var(--color-expected)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
