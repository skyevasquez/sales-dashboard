import type { Store, Kpi, SalesData } from "@/components/sales-dashboard"

// Function to convert sales data to CSV format
export function generateSalesDataCsv(
  stores: Store[],
  kpis: Kpi[],
  salesData: SalesData[],
  dateInfo: { dayOfMonth: number; daysInMonth: number },
): string {
  // Create header row
  const headers = [
    "Store",
    "KPI",
    "Monthly Goal",
    "MTD Sales",
    "% to Goal",
    "Projected EOM",
    "Daily Average",
    "Export Date",
  ]

  const rows: string[][] = []

  // Add data rows
  stores.forEach((store) => {
    kpis.forEach((kpi) => {
      const data = salesData.find((d) => d.storeId === store.id && d.kpiId === kpi.id) || {
        monthlyGoal: 0,
        mtdSales: 0,
      }

      // Calculate metrics
      const percentToGoal = data.monthlyGoal > 0 ? (data.mtdSales / data.monthlyGoal) * 100 : 0
      const dailyAverage = dateInfo.dayOfMonth > 0 ? data.mtdSales / dateInfo.dayOfMonth : 0
      const projection = dailyAverage * dateInfo.daysInMonth

      rows.push([
        store.name,
        kpi.name,
        data.monthlyGoal.toString(),
        data.mtdSales.toString(),
        percentToGoal.toFixed(2) + "%",
        projection.toFixed(2),
        dailyAverage.toFixed(2),
        new Date().toLocaleDateString(),
      ])
    })
  })

  // Convert to CSV string
  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

  return csvContent
}

// Function to trigger CSV download
export function downloadCsv(csvContent: string, filename: string): void {
  // Create a blob with the CSV data
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

  // Create a download link
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  // Set link properties
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  // Add to document, trigger click, and remove
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
