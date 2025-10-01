import type { Store, Kpi, SalesData } from "@/components/sales-dashboard"

// Interface for CSV import results
export interface CsvImportResult {
  success: boolean
  message: string
  newStores: Store[]
  newKpis: Kpi[]
  salesData: SalesData[]
  errors: string[]
}

// Function to parse CSV content and extract sales data
export function parseSalesCsv(csvContent: string, existingStores: Store[], existingKpis: Kpi[]): CsvImportResult {
  const result: CsvImportResult = {
    success: false,
    message: "",
    newStores: [],
    newKpis: [],
    salesData: [],
    errors: [],
  }

  try {
    // Split the CSV content into lines
    const lines = csvContent.split(/\r?\n/).filter((line) => line.trim() !== "")

    if (lines.length < 2) {
      result.message = "CSV file must contain a header row and at least one data row"
      return result
    }

    // Parse the header row
    const headers = lines[0].split(",").map((header) => header.trim())

    // Validate required headers
    const requiredHeaders = ["Store", "KPI", "Monthly Goal", "MTD Sales"]
    const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header))

    if (missingHeaders.length > 0) {
      result.message = `Missing required headers: ${missingHeaders.join(", ")}`
      return result
    }

    // Create maps for existing stores and KPIs for quick lookup
    const storeMap = new Map(existingStores.map((store) => [store.name.toLowerCase(), store]))
    const kpiMap = new Map(existingKpis.map((kpi) => [kpi.name.toLowerCase(), kpi]))

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const values = line.split(",").map((value) => value.trim())

      // Check if the row has the correct number of columns
      if (values.length < requiredHeaders.length) {
        result.errors.push(`Row ${i + 1} has insufficient columns`)
        continue
      }

      // Extract values
      const storeName = values[headers.indexOf("Store")]
      const kpiName = values[headers.indexOf("KPI")]
      const monthlyGoalStr = values[headers.indexOf("Monthly Goal")]
      const mtdSalesStr = values[headers.indexOf("MTD Sales")]

      // Validate values
      if (!storeName) {
        result.errors.push(`Row ${i + 1}: Store name is required`)
        continue
      }

      if (!kpiName) {
        result.errors.push(`Row ${i + 1}: KPI name is required`)
        continue
      }

      const monthlyGoal = Number.parseFloat(monthlyGoalStr)
      if (isNaN(monthlyGoal)) {
        result.errors.push(`Row ${i + 1}: Monthly Goal must be a number`)
        continue
      }

      const mtdSales = Number.parseFloat(mtdSalesStr)
      if (isNaN(mtdSales)) {
        result.errors.push(`Row ${i + 1}: MTD Sales must be a number`)
        continue
      }

      // Find or create store
      let storeId: string
      const storeKey = storeName.toLowerCase()
      if (storeMap.has(storeKey)) {
        storeId = storeMap.get(storeKey)!.id
      } else {
        // Create a new store
        const newStore: Store = {
          id: `store-${Date.now()}-${result.newStores.length}`,
          name: storeName,
        }
        result.newStores.push(newStore)
        storeMap.set(storeKey, newStore)
        storeId = newStore.id
      }

      // Find or create KPI
      let kpiId: string
      const kpiKey = kpiName.toLowerCase()
      if (kpiMap.has(kpiKey)) {
        kpiId = kpiMap.get(kpiKey)!.id
      } else {
        // Create a new KPI
        const newKpi: Kpi = {
          id: `kpi-${Date.now()}-${result.newKpis.length}`,
          name: kpiName,
        }
        result.newKpis.push(newKpi)
        kpiMap.set(kpiKey, newKpi)
        kpiId = newKpi.id
      }

      // Add sales data
      result.salesData.push({
        storeId,
        kpiId,
        monthlyGoal,
        mtdSales,
      })
    }

    // Set success if we have any valid data
    if (result.salesData.length > 0) {
      result.success = true
      result.message = `Successfully imported ${result.salesData.length} data points`
      if (result.newStores.length > 0) {
        result.message += `, created ${result.newStores.length} new stores`
      }
      if (result.newKpis.length > 0) {
        result.message += `, created ${result.newKpis.length} new KPIs`
      }
      if (result.errors.length > 0) {
        result.message += ` with ${result.errors.length} errors`
      }
    } else {
      result.success = false
      result.message = "No valid data found in the CSV file"
    }

    return result
  } catch (error) {
    result.success = false
    result.message = `Error parsing CSV: ${error instanceof Error ? error.message : String(error)}`
    return result
  }
}

// Function to generate a sample CSV template
export function generateCsvTemplate(stores: Store[], kpis: Kpi[]): string {
  // Create header row
  const headers = ["Store", "KPI", "Monthly Goal", "MTD Sales"]

  // Create sample rows
  const rows: string[][] = []

  // If there are existing stores and KPIs, use them as examples
  if (stores.length > 0 && kpis.length > 0) {
    for (let i = 0; i < Math.min(2, stores.length); i++) {
      for (let j = 0; j < Math.min(2, kpis.length); j++) {
        rows.push([stores[i].name, kpis[j].name, "1000", "500"])
      }
    }
  } else {
    // Create example data if no stores or KPIs exist
    rows.push(
      ["Store A", "Sales", "10000", "5000"],
      ["Store A", "Units", "500", "250"],
      ["Store B", "Sales", "8000", "4200"],
      ["Store B", "Units", "400", "210"],
    )
  }

  // Convert to CSV string
  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
}
