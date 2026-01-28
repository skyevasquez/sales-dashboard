"use client"

import { useState } from "react"
import { useOrganization } from "./organization-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, ChevronDown, Plus, Settings } from "lucide-react"
import Link from "next/link"

export function OrgSelector() {
  const { organizations, selectedOrg, selectOrg, createOrg, myRole } = useOrganization()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newOrgName, setNewOrgName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return
    
    setIsCreating(true)
    try {
      await createOrg(newOrgName.trim())
      setNewOrgName("")
      setIsCreateOpen(false)
    } finally {
      setIsCreating(false)
    }
  }

  if (organizations.length === 0) {
    return (
      <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Organization
      </Button>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[200px] justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="truncate">{selectedOrg?.name ?? "Select Organization"}</span>
            </div>
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[240px]" align="start">
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org._id}
              onClick={() => selectOrg(org._id)}
              className={selectedOrg?._id === org._id ? "bg-accent" : ""}
            >
              <div className="flex items-center justify-between w-full">
                <span className="truncate">{org.name}</span>
                {selectedOrg?._id === org._id && (
                  <span className="text-xs text-muted-foreground ml-2">Current</span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </DropdownMenuItem>
          {selectedOrg && (
            <DropdownMenuItem asChild>
              <Link href="/org-settings" className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Organization Settings
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to manage separate stores and KPIs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="org-name" className="text-right">
                Name
              </Label>
              <Input
                id="org-name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="col-span-3"
                placeholder="My Organization"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateOrg()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateOrg} 
              disabled={!newOrgName.trim() || isCreating}
            >
              {isCreating ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
