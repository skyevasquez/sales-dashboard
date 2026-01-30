"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"

interface Organization {
  _id: Id<"organizations">
  name: string
  slug: string
  ownerId: string
}

interface OrganizationContextType {
  organizations: Organization[]
  selectedOrg: Organization | null
  selectedOrgId: Id<"organizations"> | null
  myRole: "owner" | "admin" | "member" | null
  isLoading: boolean
  selectOrg: (orgId: Id<"organizations">) => void
  createOrg: (name: string) => Promise<void>
  refetchOrgs: () => void
  canDelete: boolean
  canInvite: boolean
  canManageRoles: boolean
}

const OrganizationContext = createContext<OrganizationContextType | null>(null)

const STORAGE_KEY = "selected-org-id"

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [selectedOrgId, setSelectedOrgId] = useState<Id<"organizations"> | null>(null)
  const { data: session, isPending } = authClient.useSession()
  const isAuthenticated = !!session?.user
  
  const organizationsResult = useQuery(
    api.organizations.listOrganizations,
    isAuthenticated ? undefined : "skip"
  )
  const organizations = organizationsResult ?? []
  
  const myRole = useQuery(
    api.orgMembers.getMyOrgRole,
    isAuthenticated && selectedOrgId ? { orgId: selectedOrgId } : "skip"
  )
  const createOrganization = useMutation(api.organizations.createOrganization)

  // Load selected org from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setSelectedOrgId(stored as Id<"organizations">)
    }
  }, [])

  // If no org selected or selected org not in list, select first available
  useEffect(() => {
    if (organizations.length > 0) {
      const stored = localStorage.getItem(STORAGE_KEY)
      const orgExists = organizations.some((org) => org._id === stored)
      
      if (!selectedOrgId || !orgExists) {
        setSelectedOrgId(organizations[0]._id)
        localStorage.setItem(STORAGE_KEY, organizations[0]._id)
      }
    }
  }, [organizations, selectedOrgId])

  const selectOrg = useCallback((orgId: Id<"organizations">) => {
    setSelectedOrgId(orgId)
    localStorage.setItem(STORAGE_KEY, orgId)
  }, [])

  const createOrg = useCallback(async (name: string) => {
    try {
      await createOrganization({ name })
      toast.success("Organization created successfully")
    } catch (error) {
      console.error("Error creating organization:", error)
      toast.error("Failed to create organization")
      throw error
    }
  }, [createOrganization])

  const selectedOrg = organizations.find((org) => org._id === selectedOrgId) ?? null

  // Role-based permissions
  const canDelete = myRole === "owner" || myRole === "admin"
  const canInvite = myRole === "owner" || myRole === "admin"
  const canManageRoles = myRole === "owner"

  const value: OrganizationContextType = {
    organizations,
    selectedOrg,
    selectedOrgId,
    myRole: myRole as "owner" | "admin" | "member" | null,
    isLoading: isPending || (isAuthenticated && organizationsResult === undefined),
    selectOrg,
    createOrg,
    refetchOrgs: () => {}, // Convex handles this automatically
    canDelete,
    canInvite,
    canManageRoles,
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error("useOrganization must be used within an OrganizationProvider")
  }
  return context
}
