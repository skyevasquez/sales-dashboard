import { Client, Databases, Account } from "appwrite"

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID

export const appwriteConfigured = Boolean(endpoint && projectId)

export const client = appwriteConfigured
  ? new Client().setEndpoint(endpoint!).setProject(projectId!)
  : null

export const databases = client ? new Databases(client) : null
export const account = client ? new Account(client) : null

export const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || ""
export const APPWRITE_COLLECTION_STORES_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_STORES_ID || ""
export const APPWRITE_COLLECTION_KPIS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_KPIS_ID || ""
export const APPWRITE_COLLECTION_SALES_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SALES_ID || ""
export const APPWRITE_COLLECTION_REPORTS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_REPORTS_ID || ""
export const APPWRITE_COLLECTION_SNAPSHOTS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SNAPSHOTS_ID || ""
