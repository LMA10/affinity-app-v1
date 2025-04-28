"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentAlerts } from "@/components/dashboard/recent-alerts"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from "lucide-react"
import { enhancedMockAlerts } from "@/lib/mock-data/enhanced-alerts"
import { useDateRange } from "@/components/date-range-provider"
import { filterByDateRange, getPreviousPeriodData, calculatePercentageChange } from "@/lib/services/data-filter-service"

export function SecurityOverview() {
  const { dateRange } = useDateRange()
  const [loading, setLoading] = useState(false)
  const [alertStats, setAlertStats] = useState({
    totalAlerts: 0,
    criticalAlerts: 0,
    highAlerts: 0,
    mediumAlerts: 0,
    lowAlerts: 0,
    criticalChange: 0,
    highChange: 0,
    mediumChange: 0,
    lowChange: 0,
  })

  // Update alert statistics when date range changes
  useEffect(() => {
    setLoading(true)

    // Short delay to simulate data fetching
    setTimeout(() => {
      // Filter alerts for the current period
      const currentPeriodAlerts = filterByDateRange(enhancedMockAlerts, dateRange.start, dateRange.end, "timestamp")

      // Get alerts for the previous period of the same duration
      const previousPeriodAlerts = getPreviousPeriodData(
        enhancedMockAlerts,
        dateRange.start,
        dateRange.end,
        "timestamp",
      )

      // Count alerts by severity for current period
      const currentCritical = currentPeriodAlerts.filter((a) => a.severity === "critical").length
      const currentHigh = currentPeriodAlerts.filter((a) => a.severity === "high").length
      const currentMedium = currentPeriodAlerts.filter((a) => a.severity === "medium").length
      const currentLow = currentPeriodAlerts.filter((a) => a.severity === "low").length

      // Count alerts by severity for previous period
      const previousCritical = previousPeriodAlerts.filter((a) => a.severity === "critical").length
      const previousHigh = previousPeriodAlerts.filter((a) => a.severity === "high").length
      const previousMedium = previousPeriodAlerts.filter((a) => a.severity === "medium").length
      const previousLow = previousPeriodAlerts.filter((a) => a.severity === "low").length

      // Calculate percentage changes
      const criticalChange = calculatePercentageChange(currentCritical, previousCritical)
      const highChange = calculatePercentageChange(currentHigh, previousHigh)
      const mediumChange = calculatePercentageChange(currentMedium, previousMedium)
      const lowChange = calculatePercentageChange(currentLow, previousLow)

      setAlertStats({
        totalAlerts: currentPeriodAlerts.length,
        criticalAlerts: currentCritical,
        highAlerts: currentHigh,
        mediumAlerts: currentMedium,
        lowAlerts: currentLow,
        criticalChange,
        highChange,
        mediumChange,
        lowChange,
      })

      setLoading(false)
    }, 300)
  }, [dateRange])

  // Calculate percentages for the donut chart
  const criticalPercentage = alertStats.totalAlerts > 0 ? (alertStats.criticalAlerts / alertStats.totalAlerts) * 100 : 0
  const highPercentage = alertStats.totalAlerts > 0 ? (alertStats.highAlerts / alertStats.totalAlerts) * 100 : 0
  const mediumPercentage = alertStats.totalAlerts > 0 ? (alertStats.mediumAlerts / alertStats.totalAlerts) * 100 : 0
  const lowPercentage = alertStats.totalAlerts > 0 ? (alertStats.lowAlerts / alertStats.totalAlerts) * 100 : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full bg-[#0f1d24] border-orange-600/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-orange-500">Security Posture</CardTitle>
            <CardDescription>Overall security status across your infrastructure</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-red-500 mr-1" />
              <span className="text-xs text-muted-foreground">Critical</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-orange-500 mr-1" />
              <span className="text-xs text-muted-foreground">High</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-yellow-500 mr-1" />
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-1" />
              <span className="text-xs text-muted-foreground">Low</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : alertStats.totalAlerts === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No alerts found for the selected time period.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-center">
                <div className="relative h-48 w-48">
                  {/* SVG Donut Chart */}
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="20"
                      strokeDasharray={`${lowPercentage} ${100 - lowPercentage}`}
                      strokeDashoffset="25"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#eab308"
                      strokeWidth="20"
                      strokeDasharray={`${mediumPercentage} ${100 - mediumPercentage}`}
                      strokeDashoffset={`${100 - lowPercentage + 25}`}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#f97316"
                      strokeWidth="20"
                      strokeDasharray={`${highPercentage} ${100 - highPercentage}`}
                      strokeDashoffset={`${100 - lowPercentage - mediumPercentage + 25}`}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#ef4444"
                      strokeWidth="20"
                      strokeDasharray={`${criticalPercentage} ${100 - criticalPercentage}`}
                      strokeDashoffset={`${100 - lowPercentage - mediumPercentage - highPercentage + 25}`}
                    />
                  </svg>
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a1419] rounded-full"
                    style={{ width: "60%", height: "60%", margin: "auto", top: 0, left: 0, right: 0, bottom: 0 }}
                  >
                    <span className="text-3xl font-bold">{alertStats.totalAlerts}</span>
                    <span className="text-sm text-muted-foreground">Total Alerts</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-[#0a1419] border-orange-600/10">
                  <CardHeader className="p-4 pb-2">
                    <CardDescription>Critical Alerts</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <ShieldX className="h-8 w-8 text-red-500" />
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-500">{alertStats.criticalAlerts}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-end">
                          {alertStats.criticalChange > 0 ? (
                            <>
                              <ArrowUp className="h-3 w-3 text-red-500 mr-1" />
                              <span>+{Math.round(alertStats.criticalChange)}% from previous period</span>
                            </>
                          ) : alertStats.criticalChange < 0 ? (
                            <>
                              <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
                              <span>{Math.round(alertStats.criticalChange)}% from previous period</span>
                            </>
                          ) : (
                            <span>No change from previous period</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a1419] border-orange-600/10">
                  <CardHeader className="p-4 pb-2">
                    <CardDescription>High Alerts</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <ShieldAlert className="h-8 w-8 text-orange-500" />
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-500">{alertStats.highAlerts}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-end">
                          {alertStats.highChange > 0 ? (
                            <>
                              <ArrowUp className="h-3 w-3 text-orange-500 mr-1" />
                              <span>+{Math.round(alertStats.highChange)}% from previous period</span>
                            </>
                          ) : alertStats.highChange < 0 ? (
                            <>
                              <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
                              <span>{Math.round(alertStats.highChange)}% from previous period</span>
                            </>
                          ) : (
                            <span>No change from previous period</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a1419] border-orange-600/10">
                  <CardHeader className="p-4 pb-2">
                    <CardDescription>Medium Alerts</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <Shield className="h-8 w-8 text-yellow-500" />
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-500">{alertStats.mediumAlerts}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-end">
                          {alertStats.mediumChange > 0 ? (
                            <>
                              <ArrowUp className="h-3 w-3 text-yellow-500 mr-1" />
                              <span>+{Math.round(alertStats.mediumChange)}% from previous period</span>
                            </>
                          ) : alertStats.mediumChange < 0 ? (
                            <>
                              <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
                              <span>{Math.round(alertStats.mediumChange)}% from previous period</span>
                            </>
                          ) : (
                            <span>No change from previous period</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a1419] border-orange-600/10">
                  <CardHeader className="p-4 pb-2">
                    <CardDescription>Low Alerts</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <ShieldCheck className="h-8 w-8 text-green-500" />
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-500">{alertStats.lowAlerts}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-end">
                          {alertStats.lowChange > 0 ? (
                            <>
                              <ArrowUp className="h-3 w-3 text-yellow-500 mr-1" />
                              <span>+{Math.round(alertStats.lowChange)}% from previous period</span>
                            </>
                          ) : alertStats.lowChange < 0 ? (
                            <>
                              <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
                              <span>{Math.round(alertStats.lowChange)}% from previous period</span>
                            </>
                          ) : (
                            <span>No change from previous period</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2 bg-[#0f1d24] border-orange-600/20">
        <CardHeader>
          <CardTitle className="text-orange-500">Recent Alerts</CardTitle>
          <CardDescription>Latest security alerts across your infrastructure</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentAlerts />
        </CardContent>
      </Card>

      <Card className="bg-[#0f1d24] border-orange-600/20">
        <CardHeader>
          <CardTitle className="text-orange-500">Security Status</CardTitle>
          <CardDescription>Current security status by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm font-medium">Firewall Status</span>
                <span className="ml-auto text-sm text-green-500">Active</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-green-500 w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm font-medium">Endpoint Protection</span>
                <span className="ml-auto text-sm text-green-500">Protected</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-green-500 w-[95%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm font-medium">Vulnerability Scan</span>
                <span className="ml-auto text-sm text-yellow-500">Warning</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-yellow-500 w-[75%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm font-medium">Data Encryption</span>
                <span className="ml-auto text-sm text-green-500">Enabled</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-green-500 w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm font-medium">Patch Management</span>
                <span className="ml-auto text-sm text-red-500">Critical</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-red-500 w-[45%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-orange-500 mr-2" />
                <span className="text-sm font-medium">Last Full Scan</span>
                <span className="ml-auto text-sm text-orange-500">3 days ago</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-orange-500 w-[60%]" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
