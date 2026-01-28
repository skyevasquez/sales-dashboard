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

interface AddStoreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (storeName: string) => void
}

export function AddStoreDialog({ open, onOpenChange, onAdd }: AddStoreDialogProps) {
  const [storeName, setStoreName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (storeName.trim()) {
      onAdd(storeName.trim())
      setStoreName("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Store</DialogTitle>
            <DialogDescription>Enter the name of the store you want to add to the dashboard.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="store-name" className="text-right">
                Store Name
              </Label>
              <Input
                id="store-name"
                name="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="col-span-3"
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!storeName.trim()}>
              Add Store
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
