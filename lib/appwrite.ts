import { Client, Databases } from "appwrite"

if (!process.env.APPWRITE_ENDPOINT || !process.env.APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY) {
  // We don't throw at import time to avoid breaking local dev; API routes will validate.
  console.warn(
    "Appwrite environment variables are not fully set. Please configure APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, and APPWRITE_API_KEY.",
  )
}

export const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID || ""
export const APPWRITE_COLLECTION_STORES_ID = process.env.APPWRITE_COLLECTION_STORES_ID || ""
export const APPWRITE_COLLECTION_KPIS_ID = process.env.APPWRITE_COLLECTION_KPIS_ID || ""
export const APPWRITE_COLLECTION_SALES_ID = process.env.APPWRITE_COLLECTION_SALES_ID || ""
export const APPWRITE_COLLECTION_REPORTS_ID = process.env.APPWRITE_COLLECTION_REPORTS_ID || ""
export const APPWRITE_COLLECTION_SNAPSHOTS_ID = process.env.APPWRITE_COLLECTION_SNAPSHOTS_ID || ""

export function getDatabases() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || "")
    .setProject(process.env.APPWRITE_PROJECT_ID || "")
    .setKey(process.env.APPWRITE_API_KEY || "")

  return new Databases(client)
}