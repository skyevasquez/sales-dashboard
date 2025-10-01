import { Client, Databases, Account } from "appwrite"

export const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")

export const databases = new Databases(client)
export const account = new Account(client)

export const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || ""
export const APPWRITE_COLLECTION_STORES_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_STORES_ID || ""
export const APPWRITE_COLLECTION_KPIS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_KPIS_ID || ""
export const APPWRITE_COLLECTION_SALES_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SALES_ID || ""
export const APPWRITE_COLLECTION_REPORTS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_REPORTS_ID || ""
export const APPWRITE_COLLECTION_SNAPSHOTS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SNAPSHOTS_ID || ""
