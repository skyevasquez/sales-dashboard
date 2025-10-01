"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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

interface AddKpiDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (kpiName: string) => void
}

export function AddKpiDialog({ open, onOpenChange, onAdd }: AddKpiDialogProps) {
  const [kpiName, setKpiName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (kpiName.trim()) {
      onAdd(kpiName.trim())
      setKpiName("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New KPI</DialogTitle>
            <DialogDescription>Enter the name of the KPI metric you want to track.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="kpi-name" className="text-right">
                KPI Name
              </Label>
              <Input
                id="kpi-name"
                value={kpiName}
                onChange={(e) => setKpiName(e.target.value)}
                className="col-span-3"
                autoFocus
                placeholder="e.g., Sales, Units, Revenue"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!kpiName.trim()}>
              Add KPI
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
