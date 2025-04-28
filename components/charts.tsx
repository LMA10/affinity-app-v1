"use client"

import { Card } from "@/components/ui/card"
import { useTheme } from "next-themes"
import {
  BarChart as TremorBarChart,
  LineChart as TremorLineChart,
  DonutChart as TremorDonutChart,
  AreaChart as TremorAreaChart,
} from "@tremor/react"
import { useEffect, useState } from "react"

interface ChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  showLegend?: boolean
  height?: string
}

interface PieChartProps {
  data: any[]
  index: string
  category: string
  colors?: string[]
  valueFormatter?: (value: number) => string
  height?: string
}

// Define explicit color palette that works in production
const defaultColors = ["orange", "sky", "green", "yellow", "purple", "pink", "indigo", "teal", "stone"]

export function BarChart({
  data,
  index,
  categories,
  colors,
  valueFormatter = (value) => `${value}`,
  showLegend = true,
  height = "h-64", // Reduced default height
}: ChartProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Common chart configuration
  const chartConfig = {
    yAxisProps: {
      labelProps: {
        fill: theme === "dark" ? "#FF8A65" : "#ea580c",
        fontSize: 12,
        fontWeight: 600,
      },
      tickLabelProps: {
        fill: theme === "dark" ? "#e2e8f0" : "#1e293b",
        fontSize: 12,
        fontWeight: 500,
      },
      axisLineProps: {
        stroke: theme === "dark" ? "#334155" : "#cbd5e1",
        strokeWidth: 1,
      },
      tickSize: 0,
    },
    xAxisProps: {
      labelProps: {
        fill: theme === "dark" ? "#FF8A65" : "#ea580c",
        fontSize: 12,
        fontWeight: 600,
      },
      tickLabelProps: {
        fill: theme === "dark" ? "#e2e8f0" : "#1e293b",
        fontSize: 12,
        fontWeight: 500,
      },
      axisLineProps: {
        stroke: theme === "dark" ? "#334155" : "#cbd5e1",
        strokeWidth: 1,
      },
      tickSize: 0,
    },
    marginLeft: 60,
    showGridLines: true,
    gridProps: {
      stroke: theme === "dark" ? "#1e293b" : "#e2e8f0",
      strokeDasharray: "4 4",
    },
    showAnimation: true,
    autoMinValue: true,
    connectNulls: true,
    curveType: "monotone",
  }

  // Ensure we're using explicit colors
  const chartColors = colors && colors.length > 0 ? colors : defaultColors

  if (!mounted) {
    return (
      <Card className="bg-[#0a1419] dark:bg-[#0a1419] light:bg-white border-orange-600/10 dark:border-orange-600/10 light:border-slate-200 p-4 chart-padding-left h-64" />
    )
  }

  return (
    <Card className="bg-[#0a1419] dark:bg-[#0a1419] light:bg-white border-orange-600/10 dark:border-orange-600/10 light:border-slate-200 p-4 chart-padding-left">
      <TremorBarChart
        data={data}
        index={index}
        categories={categories}
        colors={defaultColors}
        valueFormatter={valueFormatter}
        showLegend={showLegend}
        className={height}
        {...chartConfig}
        // Margin fix to avoid axis text cutoff
        padding={{ top: 20, right: 20, bottom: 40, left: 70 }}
        margin={{ top: 20, right: 20, bottom: 40, left: 70 }}
      />
    </Card>
  )
}

export function LineChart({
  data,
  index,
  categories,
  colors,
  valueFormatter = (value) => `${value}`,
  showLegend = true,
  height = "h-64", // Reduced default height
}: ChartProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Common chart configuration
  const chartConfig = {
    yAxisProps: {
      labelProps: {
        fill: theme === "dark" ? "#FF8A65" : "#ea580c",
        fontSize: 12,
        fontWeight: 600,
      },
      tickLabelProps: {
        fill: theme === "dark" ? "#e2e8f0" : "#1e293b",
        fontSize: 12,
        fontWeight: 500,
      },
      axisLineProps: {
        stroke: theme === "dark" ? "#334155" : "#cbd5e1",
        strokeWidth: 1,
      },
      tickSize: 0,
    },
    xAxisProps: {
      labelProps: {
        fill: theme === "dark" ? "#FF8A65" : "#ea580c",
        fontSize: 12,
        fontWeight: 600,
      },
      tickLabelProps: {
        fill: theme === "dark" ? "#e2e8f0" : "#1e293b",
        fontSize: 12,
        fontWeight: 500,
      },
      axisLineProps: {
        stroke: theme === "dark" ? "#334155" : "#cbd5e1",
        strokeWidth: 1,
      },
      tickSize: 0,
    },
    marginLeft: 60,
    showGridLines: true,
    gridProps: {
      stroke: theme === "dark" ? "#1e293b" : "#e2e8f0",
      strokeDasharray: "4 4",
    },
    showAnimation: true,
    autoMinValue: true,
    connectNulls: true,
    curveType: "monotone",
  }

  // Ensure we're using explicit colors
  const chartColors = colors && colors.length > 0 ? colors : defaultColors

  if (!mounted) {
    return (
      <Card className="bg-[#0a1419] dark:bg-[#0a1419] light:bg-white border-orange-600/10 dark:border-orange-600/10 light:border-slate-200 p-4 chart-padding-left h-64" />
    )
  }

  return (
    <Card className="bg-[#0a1419] dark:bg-[#0a1419] light:bg-white border-orange-600/10 dark:border-orange-600/10 light:border-slate-200 p-4 chart-padding-left">
      <TremorLineChart
        data={data}
        index={index}
        categories={categories}
        colors={defaultColors}
        valueFormatter={valueFormatter}
        showLegend={showLegend}
        className={height}
        {...chartConfig}
        padding={{ top: 20, right: 20, bottom: 40, left: 70 }}
      />
    </Card>
  )
}

export function AreaChart({
  data,
  index,
  categories,
  colors,
  valueFormatter = (value) => `${value}`,
  showLegend = true,
  height = "h-64", // Reduced default height
}: ChartProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Common chart configuration
  const chartConfig = {
    yAxisProps: {
      labelProps: {
        fill: theme === "dark" ? "#FF8A65" : "#ea580c",
        fontSize: 12,
        fontWeight: 600,
      },
      tickLabelProps: {
        fill: theme === "dark" ? "#e2e8f0" : "#1e293b",
        fontSize: 12,
        fontWeight: 500,
      },
      axisLineProps: {
        stroke: theme === "dark" ? "#334155" : "#cbd5e1",
        strokeWidth: 1,
      },
      tickSize: 0,
    },
    xAxisProps: {
      labelProps: {
        fill: theme === "dark" ? "#FF8A65" : "#ea580c",
        fontSize: 12,
        fontWeight: 600,
      },
      tickLabelProps: {
        fill: theme === "dark" ? "#e2e8f0" : "#1e293b",
        fontSize: 12,
        fontWeight: 500,
      },
      axisLineProps: {
        stroke: theme === "dark" ? "#334155" : "#cbd5e1",
        strokeWidth: 1,
      },
      tickSize: 0,
    },
    marginLeft: 60,
    showGridLines: true,
    gridProps: {
      stroke: theme === "dark" ? "#1e293b" : "#e2e8f0",
      strokeDasharray: "4 4",
    },
    showAnimation: true,
    autoMinValue: true,
    connectNulls: true,
    curveType: "monotone",
  }

  // Ensure we're using explicit colors
  const chartColors = colors && colors.length > 0 ? colors : defaultColors

  if (!mounted) {
    return (
      <Card className="bg-[#0a1419] dark:bg-[#0a1419] light:bg-white border-orange-600/10 dark:border-orange-600/10 light:border-slate-200 p-4 h-64" />
    )
  }

  return (
    <Card className="bg-[#0a1419] dark:bg-[#0a1419] light:bg-white border-orange-600/10 dark:border-orange-600/10 light:border-slate-200 p-4">
      <TremorAreaChart
        data={data}
        index={index}
        categories={categories}
        colors={defaultColors}
        valueFormatter={valueFormatter}
        showLegend={showLegend}
        className={height}
        {...chartConfig}
      />
    </Card>
  )
}

export function PieChart({
  data,
  index,
  category,
  colors,
  valueFormatter = (value) => `${value}`,
  height = "h-64", // Reduced default height
}: PieChartProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Ensure we're using explicit colors
  const chartColors = colors && colors.length > 0 ? colors : defaultColors

  if (!mounted) {
    return (
      <Card className="bg-[#0a1419] dark:bg-[#0a1419] light:bg-white border-orange-600/10 dark:border-orange-600/10 light:border-slate-200 p-4 h-64" />
    )
  }

  return (
    <Card className="bg-[#0a1419] dark:bg-[#0a1419] light:bg-white border-orange-600/10 dark:border-orange-600/10 light:border-slate-200 p-4">
      <TremorDonutChart
        data={data}
        index={index}
        category={category}
        colors={defaultColors}
        valueFormatter={valueFormatter}
        showAnimation={true}
        className={height}
        label="Total"
        labelProps={{
          fill: theme === "dark" ? "#FF8A65" : "#ea580c",
          fontSize: 16,
          fontWeight: 600,
        }}
        valueProps={{
          fill: theme === "dark" ? "#FF8A65" : "#ea580c",
          fontSize: 24,
          fontWeight: 700,
        }}
      />
    </Card>
  )
}
