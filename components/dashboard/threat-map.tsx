"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockThreatData } from "@/lib/mock-data"
import { filterDataByDateRange } from "@/lib/services/data-filter-service"
import type { DateRange } from "@/components/date-range-provider"

interface ThreatMapProps {
  dateRange?: DateRange
}

export function ThreatMap({ dateRange }: ThreatMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Filter threat data based on date range if provided
  const filteredThreats = dateRange ? filterDataByDateRange(mockThreatData, dateRange, "timestamp") : mockThreatData

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Count threats by type
  const attackCount = filteredThreats.filter((threat) => threat.type === "attack").length
  const suspiciousCount = filteredThreats.filter((threat) => threat.type === "suspicious").length
  const potentialCount = filteredThreats.filter((threat) => threat.type === "potential").length

  return (
    <Card className="bg-[#0f1d24] border-orange-600/20">
      <CardHeader>
        <CardTitle className="text-orange-500">Global Threat Map</CardTitle>
        <CardDescription>Real-time security threats and attacks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0a1419] rounded-md p-3 text-center">
              <div className="text-xl font-bold text-red-500">{attackCount}</div>
              <div className="text-xs text-muted-foreground">Attacks</div>
            </div>
            <div className="bg-[#0a1419] rounded-md p-3 text-center">
              <div className="text-xl font-bold text-orange-500">{suspiciousCount}</div>
              <div className="text-xs text-muted-foreground">Suspicious</div>
            </div>
            <div className="bg-[#0a1419] rounded-md p-3 text-center">
              <div className="text-xl font-bold text-yellow-500">{potentialCount}</div>
              <div className="text-xs text-muted-foreground">Potential</div>
            </div>
          </div>

          <div ref={mapRef} className="h-[350px] bg-[#0a1419] rounded-md relative overflow-hidden">
            {!mapLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <>
                {/* World map background */}
                <div className="absolute inset-0 opacity-20 bg-[url('/world-outline-continents.png')] bg-no-repeat bg-center bg-contain"></div>

                {/* Threat indicators */}
                {filteredThreats.map((threat) => (
                  <div
                    key={threat.id}
                    className={`absolute w-2 h-2 rounded-full animate-pulse ${
                      threat.type === "attack"
                        ? "bg-red-500"
                        : threat.type === "suspicious"
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                    }`}
                    style={{
                      // Convert lat/long to x/y coordinates (simplified)
                      left: `${((threat.longitude + 180) / 360) * 100}%`,
                      top: `${((90 - threat.latitude) / 180) * 100}%`,
                      width: `${threat.magnitude * 2}px`,
                      height: `${threat.magnitude * 2}px`,
                    }}
                  ></div>
                ))}
              </>
            )}
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Showing {filteredThreats.length} threat events for {dateRange?.label || "all time"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
