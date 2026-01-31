"use client"

import { useOrganization } from "@/components/organization/organization-context"
import { OrgMemberManager } from "@/components/organization/org-member-manager"
import { WorkOSProtectedRoute } from "@/components/auth/workos-protected-route"
import { WorkOSUserMenu } from "@/components/auth/workos-user-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Shield } from "lucide-react"

export default function OrgSettingsPage() {
  const { selectedOrg, myRole } = useOrganization()

  return (
    <WorkOSProtectedRoute>
      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <WorkOSUserMenu />
        </div>

        {!selectedOrg ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No organization selected. Create or join an organization to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Org Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization Details
                </CardTitle>
                <CardDescription>Basic information about your organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-lg">{selectedOrg.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Slug</p>
                    <p className="text-lg">{selectedOrg.slug}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Your Role</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="h-4 w-4" />
                    <span className="capitalize">{myRole?.replace("_", " ") ?? "Unknown"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Member Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members
                </CardTitle>
                <CardDescription>Manage organization members and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <OrgMemberManager />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </WorkOSProtectedRoute>
  )
}
