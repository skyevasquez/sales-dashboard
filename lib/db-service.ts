"use client"

import { ID, Query } from "appwrite"
import {
  databases,
  APPWRITE_DATABASE_ID,
  APPWRITE_COLLECTION_STORES_ID,
  APPWRITE_COLLECTION_KPIS_ID,
  APPWRITE_COLLECTION_SALES_ID,
  APPWRITE_COLLECTION_REPORTS_ID,
  APPWRITE_COLLECTION_SNAPSHOTS_ID,
} from "./appwrite-client"
import type { Store, Kpi, SalesData } from "@/components/sales-dashboard"
import type { Report } from "@/app/actions/report-actions"

// Stores
export async function getStores(): Promise<Store[]> {
  try {
    const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_STORES_ID, [
      Query.orderDesc("$createdAt"),
    ])
    return response.documents.map((doc) => ({
      id: doc.$id,
      name: doc.name,
    }))
  } catch (error) {
    console.error("Error fetching stores:", error)
    return []
  }
}

export async function createStore(name: string): Promise<Store> {
  const response = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_STORES_ID,
    ID.unique(),
    { name },
  )
  return {
    id: response.$id,
    name: response.name,
  }
}

export async function deleteStore(id: string): Promise<void> {
  await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_STORES_ID, id)
}

// KPIs
export async function getKpis(): Promise<Kpi[]> {
  try {
    const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_KPIS_ID, [
      Query.orderDesc("$createdAt"),
    ])
    return response.documents.map((doc) => ({
      id: doc.$id,
      name: doc.name,
    }))
  } catch (error) {
    console.error("Error fetching KPIs:", error)
    return []
  }
}

export async function createKpi(name: string): Promise<Kpi> {
  const response = await databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_KPIS_ID, ID.unique(), {
    name,
  })
  return {
    id: response.$id,
    name: response.name,
  }
}

export async function deleteKpi(id: string): Promise<void> {
  await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_KPIS_ID, id)
}

// Sales Data
export async function getSalesData(): Promise<SalesData[]> {
  try {
    const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_SALES_ID, [
      Query.limit(10000), // Increase limit to get all records
    ])
    return response.documents.map((doc) => ({
      storeId: doc.storeId,
      kpiId: doc.kpiId,
      monthlyGoal: doc.monthlyGoal,
      mtdSales: doc.mtdSales,
    }))
  } catch (error) {
    console.error("Error fetching sales data:", error)
    return []
  }
}

export async function upsertSalesData(data: SalesData): Promise<void> {
  try {
    // Try to find existing document
    const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_SALES_ID, [
      Query.equal("storeId", data.storeId),
      Query.equal("kpiId", data.kpiId),
    ])

    if (response.documents.length > 0) {
      // Update existing
      await databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_SALES_ID, response.documents[0].$id, {
        monthlyGoal: data.monthlyGoal,
        mtdSales: data.mtdSales,
      })
    } else {
      // Create new
      await databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_SALES_ID, ID.unique(), {
        storeId: data.storeId,
        kpiId: data.kpiId,
        monthlyGoal: data.monthlyGoal,
        mtdSales: data.mtdSales,
      })
    }
  } catch (error) {
    console.error("Error upserting sales data:", error)
    throw error
  }
}

export async function deleteSalesDataByStore(storeId: string): Promise<void> {
  try {
    const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_SALES_ID, [
      Query.equal("storeId", storeId),
    ])
    await Promise.all(
      response.documents.map((doc) => databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_SALES_ID, doc.$id)),
    )
  } catch (error) {
    console.error("Error deleting sales data by store:", error)
  }
}

export async function deleteSalesDataByKpi(kpiId: string): Promise<void> {
  try {
    const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_SALES_ID, [
      Query.equal("kpiId", kpiId),
    ])
    await Promise.all(
      response.documents.map((doc) => databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_SALES_ID, doc.$id)),
    )
  } catch (error) {
    console.error("Error deleting sales data by KPI:", error)
  }
}

// Reports
export async function getReports(): Promise<Report[]> {
  try {
    const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_REPORTS_ID, [
      Query.orderDesc("$createdAt"),
    ])
    return response.documents.map((doc) => ({
      id: doc.$id,
      name: doc.name,
      createdAt: doc.createdAt,
      url: doc.url,
      storeIds: doc.storeIds || [],
    }))
  } catch (error) {
    console.error("Error fetching reports:", error)
    return []
  }
}

export async function createReport(report: Omit<Report, "id">): Promise<Report> {
  const response = await databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_REPORTS_ID, ID.unique(), {
    name: report.name,
    createdAt: report.createdAt,
    url: report.url,
    storeIds: report.storeIds,
  })
  return {
    id: response.$id,
    name: response.name,
    createdAt: response.createdAt,
    url: response.url,
    storeIds: response.storeIds || [],
  }
}

export async function deleteReport(id: string): Promise<void> {
  await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_REPORTS_ID, id)
}

// Historical Snapshots
export async function createSnapshot(salesData: SalesData[]): Promise<void> {
  try {
    await databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_SNAPSHOTS_ID, ID.unique(), {
      timestamp: new Date().toISOString(),
      data: JSON.stringify(salesData),
    })
  } catch (error) {
    console.error("Error creating snapshot:", error)
  }
}
