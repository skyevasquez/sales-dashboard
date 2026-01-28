"use client";

import { SalesDashboard } from "@/components/sales-dashboard"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserMenu } from "@/components/auth/user-menu"
import { OrgSelector } from "@/components/organization/org-selector"

export default function Home() {
  return (
    <ProtectedRoute>
      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <OrgSelector />
          <h1 className="text-3xl font-bold text-center flex-1">Sales Performance Dashboard</h1>
          <UserMenu />
        </div>
        <SalesDashboard />
      </main>
    </ProtectedRoute>
  )
}
