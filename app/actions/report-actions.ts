"use server"

import { put } from "@vercel/blob"
import { jsPDF } from "jspdf"
import type { Store, Kpi, SalesData } from "@/components/sales-dashboard"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { withAuth } from "@workos-inc/authkit-nextjs"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// Type for our report metadata
export interface Report {
  id: string
  name: string
  createdAt: string
  url: string
  storeIds: string[]
}

async function getOrgIdForUser(): Promise<string> {
  const auth = await withAuth()
  if (!auth.user) {
    throw new Error("Unauthorized")
  }
  
  // Get user's organizations from Convex
  const organizations = await convex.query(api.organizations.listOrganizations, {})
  if (!organizations || organizations.length === 0) {
    throw new Error("No organization found")
  }
  
  return organizations[0]._id
}

// Function to generate a PDF report and store it in Vercel Blob
export async function generateReport(
  reportName: string,
  stores: Store[],
  kpis: Kpi[],
  salesData: SalesData[],
  selectedStoreIds: string[],
  dateInfo: { dayOfMonth: number; daysInMonth: number; daysRemaining: number },
) {
  try {
    // Create a new PDF document
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Add title
    doc.setFontSize(20)
    doc.text("Sales Performance Report", pageWidth / 2, 20, { align: "center" })

    // Add report name and date
    doc.setFontSize(12)
    doc.text(`Report: ${reportName}`, 20, 30)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 37)
    doc.text(`Day ${dateInfo.dayOfMonth} of ${dateInfo.daysInMonth} (${dateInfo.daysRemaining} days remaining)`, 20, 44)

    let yPos = 55

    // Filter stores if specific ones are selected
    const storesToInclude =
      selectedStoreIds.length > 0 ? stores.filter((store) => selectedStoreIds.includes(store.id)) : stores

    // Loop through each store and add its data
    for (const store of storesToInclude) {
      // Add store name as a header
      doc.setFontSize(16)
      doc.text(store.name, 20, yPos)
      yPos += 10

      // Create a table for KPIs
      doc.setFontSize(10)
      doc.text("KPI", 20, yPos)
      doc.text("Goal", 70, yPos)
      doc.text("MTD Sales", 100, yPos)
      doc.text("% to Goal", 130, yPos)
      doc.text("Projected", 160, yPos)
      yPos += 5

      // Add a line under the headers
      doc.line(20, yPos, 190, yPos)
      yPos += 5

      // Add each KPI's data
      for (const kpi of kpis) {
        const data = salesData.find((d) => d.storeId === store.id && d.kpiId === kpi.id) || {
          monthlyGoal: 0,
          mtdSales: 0,
        }

        // Calculate metrics
        const percentToGoal = data.monthlyGoal > 0 ? (data.mtdSales / data.monthlyGoal) * 100 : 0

        const projection = dateInfo.dayOfMonth > 0 ? (data.mtdSales / dateInfo.dayOfMonth) * dateInfo.daysInMonth : 0

        // Add KPI data row
        doc.text(kpi.name, 20, yPos)
        doc.text(data.monthlyGoal.toLocaleString(), 70, yPos)
        doc.text(data.mtdSales.toLocaleString(), 100, yPos)
        doc.text(`${percentToGoal.toFixed(1)}%`, 130, yPos)
        doc.text(projection.toLocaleString(undefined, { maximumFractionDigits: 0 }), 160, yPos)

        yPos += 8

        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
      }

      // Add some space between stores
      yPos += 10

      // Check if we need a new page for the next store
      if (yPos > 250 && store !== storesToInclude[storesToInclude.length - 1]) {
        doc.addPage()
        yPos = 20
      }
    }

    // Convert the PDF to a blob
    const pdfBlob = new Blob([doc.output("blob")], { type: "application/pdf" })

    // Generate a unique filename
    const reportFileId = `report-${Date.now()}`
    const filename = `${reportFileId}.pdf`

    // Upload to Vercel Blob
    const { url } = await put(filename, pdfBlob, { access: "public" })

    const orgId = await getOrgIdForUser()
    const createdAt = new Date().toISOString()
    const reportId = await convex.mutation(api.reports.createReport, {
      orgId,
      name: reportName,
      url,
      storeIds: selectedStoreIds,
    })

    const report: Report = {
      id: reportId,
      name: reportName,
      createdAt,
      url,
      storeIds: selectedStoreIds,
    }

    return { success: true, report }
  } catch (error) {
    console.error("Error generating report:", error)
    return { success: false, error: "Failed to generate report" }
  }
}

// Function to get all reports
export async function getAllReports() {
  try {
    const auth = await withAuth()
    if (!auth.user) {
      throw new Error("Unauthorized")
    }

    const orgId = await getOrgIdForUser()
    const response = await convex.query(api.reports.listReports, { orgId })
    const reports: Report[] = response.map((doc: (typeof response)[number]) => ({
      id: doc._id,
      name: doc.name,
      createdAt: new Date(doc.createdAt).toISOString(),
      url: doc.url,
      storeIds: doc.storeIds,
    }))

    return { success: true, reports }
  } catch (error) {
    console.error("Error fetching reports:", error)
    return { success: false, error: "Failed to fetch reports" }
  }
}
