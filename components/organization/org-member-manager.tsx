"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useOrganization } from "./organization-context"
import { useAuth } from '@workos-inc/authkit-nextjs/components'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Trash2, UserMinus, Crown, Shield, User } from "lucide-react"

interface Member {
  memberId: string
  userId: string
  role: "owner" | "admin" | "member"
  joinedAt: number
  name: string | null
  email: string | null
}

export function OrgMemberManager() {
  const { selectedOrgId, canInvite, canManageRoles, myRole } = useOrganization()
  const { user } = useAuth()

  const members = useQuery(
    api.orgMembers.listMembers,
    selectedOrgId ? { orgId: selectedOrgId } : "skip"
  ) ?? []

  const inviteMember = useMutation(api.orgMembers.inviteMember)
  const updateMemberRole = useMutation(api.orgMembers.updateMemberRole)
  const removeMember = useMutation(api.orgMembers.removeMember)
  const leaveOrganization = useMutation(api.orgMembers.leaveOrganization)

  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member")
  const [isInviting, setIsInviting] = useState(false)

  const handleInvite = async () => {
    if (!selectedOrgId || !inviteEmail.trim()) return

    setIsInviting(true)
    try {
      await inviteMember({
        orgId: selectedOrgId,
        email: inviteEmail.trim(),
        role: inviteRole,
      })
      toast.success("Member invited successfully")
      setInviteEmail("")
      setIsInviteOpen(false)
    } catch (error: any) {
      console.error("Error inviting member:", error)
      toast.error(error.message || "Failed to invite member")
    } finally {
      setIsInviting(false)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: "owner" | "admin" | "member") => {
    if (!selectedOrgId) return

    try {
      await updateMemberRole({
        orgId: selectedOrgId,
        memberId: memberId as any,
        role: newRole,
      })
      toast.success("Role updated successfully")
    } catch (error: any) {
      console.error("Error updating role:", error)
      toast.error(error.message || "Failed to update role")
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedOrgId) return

    try {
      await removeMember({
        orgId: selectedOrgId,
        memberId: memberId as any,
      })
      toast.success("Member removed successfully")
    } catch (error: any) {
      console.error("Error removing member:", error)
      toast.error(error.message || "Failed to remove member")
    }
  }

  const handleLeaveOrg = async () => {
    if (!selectedOrgId) return

    try {
      await leaveOrganization({ orgId: selectedOrgId })
      toast.success("You have left the organization")
      window.location.href = "/"
    } catch (error: any) {
      console.error("Error leaving organization:", error)
      toast.error(error.message || "Failed to leave organization")
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Owner</Badge>
      case "admin":
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Admin</Badge>
      default:
        return <Badge variant="secondary">Member</Badge>
    }
  }

  const currentUserId = user?.email || ""
  const myMemberId = members.find((m) => m.userId === currentUserId)?.memberId

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {members.length} member{members.length !== 1 ? "s" : ""}
        </p>
        {canInvite && (
          <Button onClick={() => setIsInviteOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => {
                const isMe = member.userId === currentUserId
                const canRemove = canManageRoles || isMe
                const canChangeRole = canManageRoles && !isMe && member.role !== "owner"

                return (
                  <TableRow key={member.memberId}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {member.name || "Unknown"}
                          {isMe && <span className="text-muted-foreground ml-1">(You)</span>}
                        </span>
                        <span className="text-sm text-muted-foreground">{member.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        {canChangeRole ? (
                          <Select
                            value={member.role}
                            onValueChange={(value) =>
                              handleRoleChange(member.memberId, value as "owner" | "admin" | "member")
                            }
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owner">Owner</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          getRoleBadge(member.role)
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {canRemove && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            isMe ? handleLeaveOrg() : handleRemoveMember(member.memberId)
                          }
                          aria-label={isMe ? "Leave organization" : "Remove member"}
                        >
                          {isMe ? (
                            <UserMinus className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Leave organization option for non-owners */}
      {myRole !== "owner" && myMemberId && (
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={handleLeaveOrg} className="text-destructive">
            <UserMinus className="h-4 w-4 mr-2" />
            Leave Organization
          </Button>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Invite a user to join your organization. They must have an account already.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="col-span-3"
                placeholder="user@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "member")}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim() || isInviting}>
              {isInviting ? "Inviting…" : "Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
