import type { Store, Kpi, SalesData } from "@/components/sales-dashboard"

// Interface for historical data entry
export interface HistoricalDataEntry {
  date: string // ISO date string
  salesData: SalesData[]
}

// Interface for trend analysis result
export interface TrendAnalysisResult {
  storeId: string
  kpiId: string
  trend: "up" | "down" | "stable"
  percentChange: number
  values: {
    date: string
    value: number
  }[]
}

// Save current sales data as a historical snapshot
export function saveHistoricalSnapshot(salesData: SalesData[]): HistoricalDataEntry {
  const snapshot: HistoricalDataEntry = {
    date: new Date().toISOString(),
    salesData: JSON.parse(JSON.stringify(salesData)), // Deep copy
  }

  // Get existing historical data
  const historicalData = getHistoricalData()

  // Check if we already have a snapshot from today
  const today = new Date().toISOString().split("T")[0]
  const existingTodayIndex = historicalData.findIndex((entry) => entry.date.split("T")[0] === today)

  // Replace today's entry if it exists, otherwise add new entry
  if (existingTodayIndex >= 0) {
    historicalData[existingTodayIndex] = snapshot
  } else {
    historicalData.push(snapshot)
  }

  // Keep only the last 90 days of data
  const sortedData = historicalData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 90)

  // Save to localStorage
  localStorage.setItem("historicalData", JSON.stringify(sortedData))

  return snapshot
}

// Get all historical data
export function getHistoricalData(): HistoricalDataEntry[] {
  const data = localStorage.getItem("historicalData")
  if (!data) return []

  try {
    return JSON.parse(data)
  } catch (error) {
    console.error("Error parsing historical data:", error)
    return []
  }
}

// Get historical data for a specific store and KPI
export function getHistoricalDataForStoreAndKpi(
  storeId: string,
  kpiId: string,
  days = 30,
): { date: string; value: number }[] {
  const historicalData = getHistoricalData()

  // Sort by date (newest first) and take only the specified number of days
  const sortedData = historicalData
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, days)
    // Sort back to chronological order for charting
    .reverse()

  return sortedData.map((entry) => {
    const salesDataEntry = entry.salesData.find((data) => data.storeId === storeId && data.kpiId === kpiId)

    return {
      date: new Date(entry.date).toLocaleDateString(),
      value: salesDataEntry?.mtdSales || 0,
    }
  })
}

// Calculate trend for a specific store and KPI
export function calculateTrend(storeId: string, kpiId: string, days = 7): TrendAnalysisResult {
  const historicalData = getHistoricalDataForStoreAndKpi(storeId, kpiId, days)

  if (historicalData.length < 2) {
    return {
      storeId,
      kpiId,
      trend: "stable",
      percentChange: 0,
      values: historicalData,
    }
  }

  // Get first and last values to calculate trend
  const firstValue = historicalData[0].value
  const lastValue = historicalData[historicalData.length - 1].value

  // Calculate percent change
  let percentChange = 0
  if (firstValue > 0) {
    percentChange = ((lastValue - firstValue) / firstValue) * 100
  }

  // Determine trend direction
  let trend: "up" | "down" | "stable" = "stable"
  if (percentChange > 5) {
    trend = "up"
  } else if (percentChange < -5) {
    trend = "down"
  }

  return {
    storeId,
    kpiId,
    trend,
    percentChange,
    values: historicalData,
  }
}

// Get month-over-month comparison
export function getMonthOverMonthComparison(
  storeId: string,
  kpiId: string,
): { currentMonth: number; previousMonth: number; percentChange: number } {
  const historicalData = getHistoricalData()

  // Get current date info
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Calculate previous month
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

  // Find the latest entry for current month
  const currentMonthData = historicalData
    .filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  // Find the latest entry for previous month
  const previousMonthData = historicalData
    .filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate.getMonth() === previousMonth && entryDate.getFullYear() === previousYear
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  // Get sales values
  const currentMonthValue =
    currentMonthData?.salesData.find((data) => data.storeId === storeId && data.kpiId === kpiId)?.mtdSales || 0

  const previousMonthValue =
    previousMonthData?.salesData.find((data) => data.storeId === storeId && data.kpiId === kpiId)?.mtdSales || 0

  // Calculate percent change
  let percentChange = 0
  if (previousMonthValue > 0) {
    percentChange = ((currentMonthValue - previousMonthValue) / previousMonthValue) * 100
  }

  return {
    currentMonth: currentMonthValue,
    previousMonth: previousMonthValue,
    percentChange,
  }
}

// Generate sample historical data for testing
export function generateSampleHistoricalData(stores: Store[], kpis: Kpi[], days = 30): HistoricalDataEntry[] {
  const sampleData: HistoricalDataEntry[] = []

  // Generate data for the past 'days' days
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const salesData: SalesData[] = []

    // Generate data for each store and KPI
    stores.forEach((store) => {
      kpis.forEach((kpi) => {
        // Create a base value that increases over time
        const baseValue = 1000 + (days - i) * 50

        // Add some randomness
        const randomFactor = 0.8 + Math.random() * 0.4 // 0.8 to 1.2

        // Calculate the value for this day
        const value = Math.round(baseValue * randomFactor)

        salesData.push({
          storeId: store.id,
          kpiId: kpi.id,
          monthlyGoal: 5000, // Sample goal
          mtdSales: value,
        })
      })
    })

    sampleData.push({
      date: date.toISOString(),
      salesData,
    })
  }

  return sampleData
}
