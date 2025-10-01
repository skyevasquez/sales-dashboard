// Types for dashboard preferences
export interface ChartPreference {
  id: string
  title: string
  type: string
  visible: boolean
  order: number
  size: "small" | "medium" | "large"
}

export interface DashboardPreferences {
  charts: ChartPreference[]
  layout: "grid" | "list"
  defaultTab: string
}

// Default chart configurations
export const defaultCharts: ChartPreference[] = [
  {
    id: "store-metrics",
    title: "Store Metrics",
    type: "metrics",
    visible: true,
    order: 0,
    size: "large",
  },
  {
    id: "overall-performance",
    title: "Overall Performance by Store",
    type: "pie",
    visible: true,
    order: 1,
    size: "medium",
  },
  {
    id: "goal-vs-actual",
    title: "Goal vs Actual by KPI",
    type: "bar",
    visible: true,
    order: 2,
    size: "medium",
  },
  {
    id: "store-comparison",
    title: "Store Comparison",
    type: "bar",
    visible: true,
    order: 3,
    size: "large",
  },
  {
    id: "percent-to-goal",
    title: "Percent to Goal by Store",
    type: "bar",
    visible: true,
    order: 4,
    size: "medium",
  },
  {
    id: "kpi-comparison",
    title: "KPI Comparison",
    type: "bar",
    visible: false,
    order: 5,
    size: "medium",
  },
  {
    id: "trend-analysis",
    title: "Trend Analysis",
    type: "line",
    visible: true,
    order: 6,
    size: "large",
  },
  {
    id: "monthly-comparison",
    title: "Month-over-Month Comparison",
    type: "bar",
    visible: false,
    order: 7,
    size: "medium",
  },
  {
    id: "forecast",
    title: "Sales Forecast",
    type: "line",
    visible: true,
    order: 8,
    size: "medium",
  },
]

// Default dashboard preferences
export const defaultPreferences: DashboardPreferences = {
  charts: defaultCharts,
  layout: "grid",
  defaultTab: "dashboard",
}

// Get dashboard preferences from localStorage
export function getDashboardPreferences(): DashboardPreferences {
  // Check if we're running in the browser
  if (typeof window === 'undefined') {
    return defaultPreferences
  }

  try {
    const storedPreferences = localStorage.getItem("dashboardPreferences")
    if (!storedPreferences) return defaultPreferences

    const preferences = JSON.parse(storedPreferences) as DashboardPreferences

    // Ensure all default charts are included (in case new charts were added)
    const existingChartIds = preferences.charts.map((chart) => chart.id)
    const missingCharts = defaultCharts.filter((chart) => !existingChartIds.includes(chart.id))

    if (missingCharts.length > 0) {
      preferences.charts = [...preferences.charts, ...missingCharts]
    }

    return preferences
  } catch (error) {
    console.error("Error loading dashboard preferences:", error)
    return defaultPreferences
  }
}

// Save dashboard preferences to localStorage
export function saveDashboardPreferences(preferences: DashboardPreferences): void {
  // Check if we're running in the browser
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem("dashboardPreferences", JSON.stringify(preferences))
  } catch (error) {
    console.error("Error saving dashboard preferences:", error)
  }
}

// Update a specific chart preference
export function updateChartPreference(chartId: string, updates: Partial<ChartPreference>): DashboardPreferences {
  const preferences = getDashboardPreferences()

  const updatedCharts = preferences.charts.map((chart) => {
    if (chart.id === chartId) {
      return { ...chart, ...updates }
    }
    return chart
  })

  const updatedPreferences = { ...preferences, charts: updatedCharts }
  saveDashboardPreferences(updatedPreferences)

  return updatedPreferences
}

// Toggle chart visibility
export function toggleChartVisibility(chartId: string): DashboardPreferences {
  const preferences = getDashboardPreferences()

  const updatedCharts = preferences.charts.map((chart) => {
    if (chart.id === chartId) {
      return { ...chart, visible: !chart.visible }
    }
    return chart
  })

  const updatedPreferences = { ...preferences, charts: updatedCharts }
  saveDashboardPreferences(updatedPreferences)

  return updatedPreferences
}

// Update chart order
export function updateChartOrder(chartId: string, newOrder: number): DashboardPreferences {
  const preferences = getDashboardPreferences()

  // Find the chart to move
  const chartToMove = preferences.charts.find((chart) => chart.id === chartId)
  if (!chartToMove) return preferences

  // Update orders for all charts
  const updatedCharts = preferences.charts.map((chart) => {
    if (chart.id === chartId) {
      return { ...chart, order: newOrder }
    } else if (chart.order >= newOrder && chart.order < chartToMove.order) {
      // Shift charts down
      return { ...chart, order: chart.order + 1 }
    } else if (chart.order <= newOrder && chart.order > chartToMove.order) {
      // Shift charts up
      return { ...chart, order: chart.order - 1 }
    }
    return chart
  })

  // Sort by order
  updatedCharts.sort((a, b) => a.order - b.order)

  const updatedPreferences = { ...preferences, charts: updatedCharts }
  saveDashboardPreferences(updatedPreferences)

  return updatedPreferences
}

// Reset dashboard preferences to defaults
export function resetDashboardPreferences(): DashboardPreferences {
  saveDashboardPreferences(defaultPreferences)
  return defaultPreferences
}
