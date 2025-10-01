import type { Store, Kpi } from "@/components/sales-dashboard"

// Parsed representation of an individual CSV row prior to persistence
export interface ParsedSalesRow {
  storeName: string
  kpiName: string
  monthlyGoal: number
  mtdSales: number
}

// Interface for CSV import results
export interface CsvImportResult {
  success: boolean
  message: string
  newStoreNames: string[]
  newKpiNames: string[]
  salesRows: ParsedSalesRow[]
  errors: string[]
}

// Function to parse CSV content and extract sales data
export function parseSalesCsv(csvContent: string, existingStores: Store[], existingKpis: Kpi[]): CsvImportResult {
  const result: CsvImportResult = {
    success: false,
    message: "",
    newStoreNames: [],
    newKpiNames: [],
    salesRows: [],
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
    const storeMap = new Map(existingStores.map((store) => [store.name.trim().toLowerCase(), store]))
    const kpiMap = new Map(existingKpis.map((kpi) => [kpi.name.trim().toLowerCase(), kpi]))
    const newStoreNameMap = new Map<string, string>()
    const newKpiNameMap = new Map<string, string>()

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
      const storeNameRaw = values[headers.indexOf("Store")]
      const kpiNameRaw = values[headers.indexOf("KPI")]
      const storeName = storeNameRaw.trim()
      const kpiName = kpiNameRaw.trim()
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
      const storeKey = storeName.toLowerCase()
      const kpiKey = kpiName.toLowerCase()

      if (!storeMap.has(storeKey) && !newStoreNameMap.has(storeKey)) {
        newStoreNameMap.set(storeKey, storeName)
      }

      if (!kpiMap.has(kpiKey) && !newKpiNameMap.has(kpiKey)) {
        newKpiNameMap.set(kpiKey, kpiName)
      }

      const resolvedStoreName = storeMap.get(storeKey)?.name ?? newStoreNameMap.get(storeKey) ?? storeName
      const resolvedKpiName = kpiMap.get(kpiKey)?.name ?? newKpiNameMap.get(kpiKey) ?? kpiName

      // Add sales data row with human-friendly names; IDs will be resolved during import
      result.salesRows.push({
        storeName: resolvedStoreName,
        kpiName: resolvedKpiName,
        monthlyGoal,
        mtdSales,
      })
    }

    // Set success if we have any valid data
    if (result.salesRows.length > 0) {
      result.success = true
      result.message = `Successfully validated ${result.salesRows.length} data rows`
      if (newStoreNameMap.size > 0) {
        result.message += `, detected ${newStoreNameMap.size} new stores`
      }
      if (newKpiNameMap.size > 0) {
        result.message += `, detected ${newKpiNameMap.size} new KPIs`
      }
      if (result.errors.length > 0) {
        result.message += ` with ${result.errors.length} errors`
      }
    } else {
      result.success = false
      result.message = "No valid data found in the CSV file"
    }

    result.newStoreNames = Array.from(newStoreNameMap.values())
    result.newKpiNames = Array.from(newKpiNameMap.values())

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
