"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart, LineChart, PieChart, LayoutGrid, List, MoveUp, MoveDown, RotateCcw } from "lucide-react"
import {
  type DashboardPreferences,
  getDashboardPreferences,
  saveDashboardPreferences,
  resetDashboardPreferences,
} from "@/utils/dashboard-preferences"

interface DashboardCustomizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPreferencesChange: (preferences: DashboardPreferences) => void
}

export function DashboardCustomizationDialog({
  open,
  onOpenChange,
  onPreferencesChange,
}: DashboardCustomizationDialogProps) {
  const [preferences, setPreferences] = useState<DashboardPreferences>(getDashboardPreferences())
  const [isDirty, setIsDirty] = useState(false)

  // Load preferences when dialog opens
  useEffect(() => {
    if (open) {
      setPreferences(getDashboardPreferences())
      setIsDirty(false)
    }
  }, [open])

  // Save preferences
  const handleSave = () => {
    saveDashboardPreferences(preferences)
    onPreferencesChange(preferences)
    setIsDirty(false)
    onOpenChange(false)
  }

  // Reset to defaults
  const handleReset = () => {
    const defaultPrefs = resetDashboardPreferences()
    setPreferences(defaultPrefs)
    onPreferencesChange(defaultPrefs)
    setIsDirty(true)
  }

  // Toggle chart visibility
  const toggleChartVisibility = (chartId: string) => {
    setPreferences((prev) => ({
      ...prev,
      charts: prev.charts.map((chart) => {
        if (chart.id === chartId) {
          return { ...chart, visible: !chart.visible }
        }
        return chart
      }),
    }))
    setIsDirty(true)
  }

  // Update chart size
  const updateChartSize = (chartId: string, size: "small" | "medium" | "large") => {
    setPreferences((prev) => ({
      ...prev,
      charts: prev.charts.map((chart) => {
        if (chart.id === chartId) {
          return { ...chart, size }
        }
        return chart
      }),
    }))
    setIsDirty(true)
  }

  // Move chart up in order
  const moveChartUp = (chartId: string) => {
    setPreferences((prev) => {
      const chartIndex = prev.charts.findIndex((chart) => chart.id === chartId)
      if (chartIndex <= 0) return prev // Already at the top

      const newCharts = [...prev.charts]
      const temp = newCharts[chartIndex].order
      newCharts[chartIndex].order = newCharts[chartIndex - 1].order
      newCharts[chartIndex - 1].order = temp

      // Sort by order
      newCharts.sort((a, b) => a.order - b.order)

      return { ...prev, charts: newCharts }
    })
    setIsDirty(true)
  }

  // Move chart down in order
  const moveChartDown = (chartId: string) => {
    setPreferences((prev) => {
      const chartIndex = prev.charts.findIndex((chart) => chart.id === chartId)
      if (chartIndex >= prev.charts.length - 1) return prev // Already at the bottom

      const newCharts = [...prev.charts]
      const temp = newCharts[chartIndex].order
      newCharts[chartIndex].order = newCharts[chartIndex + 1].order
      newCharts[chartIndex + 1].order = temp

      // Sort by order
      newCharts.sort((a, b) => a.order - b.order)

      return { ...prev, charts: newCharts }
    })
    setIsDirty(true)
  }

  // Update layout preference
  const updateLayout = (layout: "grid" | "list") => {
    setPreferences((prev) => ({ ...prev, layout }))
    setIsDirty(true)
  }

  // Update default tab
  const updateDefaultTab = (defaultTab: string) => {
    setPreferences((prev) => ({ ...prev, defaultTab }))
    setIsDirty(true)
  }

  // Get chart icon based on type
  const getChartIcon = (type: string) => {
    switch (type) {
      case "bar":
        return <BarChart className="h-4 w-4" />
      case "line":
        return <LineChart className="h-4 w-4" />
      case "pie":
        return <PieChart className="h-4 w-4" />
      default:
        return <BarChart className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
          <DialogDescription>
            Select which charts to display on your dashboard and customize their appearance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Layout Options</h3>
            <RadioGroup
              value={preferences.layout}
              onValueChange={(value) => updateLayout(value as "grid" | "list")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="grid" id="layout-grid" />
                <Label htmlFor="layout-grid" className="flex items-center">
                  <LayoutGrid className="h-4 w-4 mr-2" /> Grid
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="list" id="layout-list" />
                <Label htmlFor="layout-list" className="flex items-center">
                  <List className="h-4 w-4 mr-2" /> List
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Default Tab</h3>
            <Select value={preferences.defaultTab} onValueChange={updateDefaultTab}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select default tab" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="visualizations">Visualizations</SelectItem>
                <SelectItem value="trends">Trends</SelectItem>
                <SelectItem value="data-entry">Data Entry</SelectItem>
                <SelectItem value="reports">Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Dashboard Charts</h3>
              <Button variant="outline" size="sm" onClick={handleReset} className="h-8">
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset to Default
              </Button>
            </div>

            <div className="space-y-3">
              {preferences.charts
                .sort((a, b) => a.order - b.order)
                .map((chart) => (
                  <Card key={chart.id} className={chart.visible ? "" : "opacity-70"}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getChartIcon(chart.type)}
                          <span className="font-medium">{chart.title}</span>
                        </div>
                        <Switch
                          checked={chart.visible}
                          onCheckedChange={() => toggleChartVisibility(chart.id)}
                          aria-label={`Toggle ${chart.title}`}
                        />
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`size-${chart.id}`} className="text-sm">
                            Size:
                          </Label>
                          <Select
                            value={chart.size}
                            onValueChange={(value) => updateChartSize(chart.id, value as "small" | "medium" | "large")}
                            disabled={!chart.visible}
                          >
                            <SelectTrigger className="h-8 w-[100px]" id={`size-${chart.id}`}>
                              <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveChartUp(chart.id)}
                            disabled={chart.order === 0 || !chart.visible}
                          >
                            <MoveUp className="h-4 w-4" />
                            <span className="sr-only">Move Up</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveChartDown(chart.id)}
                            disabled={
                              chart.order === preferences.charts.filter((c) => c.visible).length - 1 || !chart.visible
                            }
                          >
                            <MoveDown className="h-4 w-4" />
                            <span className="sr-only">Move Down</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isDirty}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
