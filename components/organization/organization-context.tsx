"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"
import { useAuth } from '@workos-inc/authkit-nextjs/components'

interface Organization {
  _id: string
  name: string
  slug: string
  ownerId: string
}

interface OrganizationContextType {
  organizations: Organization[]
  selectedOrg: Organization | null
  selectedOrgId: string | null
  myRole: "owner" | "admin" | "member" | null
  isLoading: boolean
  selectOrg: (orgId: string) => void
  createOrg: (name: string) => Promise<void>
  refetchOrgs: () => void
  canDelete: boolean
  canInvite: boolean
  canManageRoles: boolean
}

const OrganizationContext = createContext<OrganizationContextType | null>(null)

const STORAGE_KEY = "selected-org-id"

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()
  const workosUserId = user?.id
  const isAuthenticated = !!user
  
  const organizationsResult = useQuery(
    api.organizations.listOrganizations,
    workosUserId ? { workosUserId } : "skip"
  )
  const organizations = (organizationsResult ?? []) as Organization[]
  
  const myRole = useQuery(
    api.orgMembers.getMyOrgRole,
    workosUserId && selectedOrgId ? { orgId: selectedOrgId, workosUserId } : "skip"
  )
  const createOrganization = useMutation(api.organizations.createOrganization)

  // Load selected org from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setSelectedOrgId(stored)
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
    } else if (organizations.length === 0 && !authLoading && isAuthenticated) {
      // Clear stale localStorage when user has no orgs (shouldn't happen due to auto-creation, but handle it)
      setSelectedOrgId(null)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [organizations, selectedOrgId, authLoading, isAuthenticated])

  const selectOrg = useCallback((orgId: string) => {
    setSelectedOrgId(orgId)
    localStorage.setItem(STORAGE_KEY, orgId)
  }, [])

  const createOrg = useCallback(async (name: string) => {
    if (!workosUserId) {
      toast.error("Not authenticated")
      return
    }
    try {
      await createOrganization({ name, workosUserId })
      toast.success("Organization created successfully")
    } catch (error) {
      console.error("Error creating organization:", error)
      toast.error("Failed to create organization")
      throw error
    }
  }, [createOrganization, workosUserId])

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
    isLoading: authLoading || (isAuthenticated && organizationsResult === undefined),
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
