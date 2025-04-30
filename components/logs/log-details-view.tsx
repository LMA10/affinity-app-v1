"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, X, Check, FileDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface LogDetailsViewProps {
  log: any
  headers: string[]
  onClose: () => void
  onValueClick: (field: string, value: string) => void
}

export function LogDetailsView({ log, headers, onClose, onValueClick }: LogDetailsViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("formatted")
  const [prettifyJson, setPrettifyJson] = useState(true)
  const [showTimestamps, setShowTimestamps] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const { toast } = useToast()

  // Reset copied field after a delay
  useEffect(() => {
    if (copiedField) {
      const timer = setTimeout(() => {
        setCopiedField(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedField])

  const handleValueClick = (field: string, value: string) => {
    onValueClick(field, value)
  }

  const copyToClipboard = (field: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast({
      title: "Copied to clipboard",
      description: `${field}: ${text.substring(0, 30)}${text.length > 30 ? "..." : ""}`,
      duration: 2000,
    })
  }

  const copyFullLog = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, prettifyJson ? 2 : undefined))
    toast({
      title: "Copied to clipboard",
      description: "The full log has been copied to your clipboard",
      duration: 2000,
    })
  }

  const exportLogToJson = () => {
    const jsonContent = JSON.stringify(log, null, prettifyJson ? 2 : undefined)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `log_${log.traceid || new Date().toISOString()}.json`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: "Log exported to JSON",
      duration: 2000,
    })
  }

  // Filter headers based on search term
  const filteredHeaders = headers.filter((header) => {
    // Skip filtering if search term is empty
    if (!searchTerm) return true

    // Check if header name matches
    if (header.toLowerCase().includes(searchTerm.toLowerCase())) return true

    // Check if value matches
    if (log[header] !== null && String(log[header]).toLowerCase().includes(searchTerm.toLowerCase())) return true

    return false
  })

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "-"
    try {
      return new Date(timestamp).toLocaleString()
    } catch (e) {
      return timestamp
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    const statusCode = Number(status)
    if (statusCode >= 500) return "bg-red-500/20 text-red-500 border-red-500/20"
    if (statusCode >= 400) return "bg-yellow-500/20 text-yellow-500 border-yellow-500/20"
    if (statusCode >= 300) return "bg-blue-500/20 text-blue-500 border-blue-500/20"
    if (statusCode >= 200) return "bg-green-500/20 text-green-500 border-green-500/20"
    return "bg-gray-500/20 text-gray-500 border-gray-500/20"
  }

  return (
    <div className="bg-[#0a1419] border border-orange-600/20 rounded-md p-4 mt-2 mb-2 relative">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-orange-500 font-medium">Log Details</h3>
          <Badge variant="outline" className={log.albstatuscode ? getStatusBadgeColor(String(log.albstatuscode)) : ""}>
            {log.albstatuscode || "Unknown"} {log.requestverb || ""}{" "}
            {log.requesturl ? new URL(log.requesturl).pathname : ""}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyFullLog} className="h-7 px-2">
            <Copy className="h-3.5 w-3.5 mr-1" />
            Copy JSON
          </Button>
          <Button variant="outline" size="sm" onClick={exportLogToJson} className="h-7 px-2">
            <FileDown className="h-3.5 w-3.5 mr-1" />
            Export
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="bg-[#0f1d24]">
          <TabsTrigger value="formatted">Formatted View</TabsTrigger>
          <TabsTrigger value="raw">Raw JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="formatted">
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {filteredHeaders.map((header) => (
                <div key={header} className="group relative">
                  <div className="text-orange-500/80 text-sm font-medium mb-1">{header}</div>
                  <div className="flex items-start gap-2 bg-[#0f1d24] p-2 rounded-md border border-orange-600/10 group-hover:border-orange-600/30 transition-colors">
                    <div className="flex-1 break-all">
                      {log[header] !== null ? (
                        typeof log[header] === "object" ? (
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {JSON.stringify(log[header], null, 2)}
                          </pre>
                        ) : header === "timestamp" || header === "requestcreationtime" ? (
                          showTimestamps ? (
                            <div className="font-mono text-sm break-words">
                              <div>{log[header]}</div>
                              <div className="text-xs text-muted-foreground">{formatTimestamp(log[header])}</div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleValueClick(header, String(log[header]))}
                              className="font-mono text-sm break-words hover:bg-orange-500/20 px-1 rounded cursor-pointer transition-colors text-left w-full"
                            >
                              {log[header]}
                            </button>
                          )
                        ) : header === "albstatuscode" ? (
                          <Badge
                            variant="outline"
                            className={getStatusBadgeColor(String(log[header]))}
                            onClick={() => handleValueClick(header, String(log[header]))}
                          >
                            {log[header]}
                          </Badge>
                        ) : (
                          <button
                            onClick={() => handleValueClick(header, String(log[header]))}
                            className="font-mono text-sm break-words hover:bg-orange-500/20 px-1 rounded cursor-pointer transition-colors text-left w-full"
                          >
                            {String(log[header])}
                          </button>
                        )
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-5 w-5 ${copiedField === header ? "text-green-500" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
                      onClick={() => copyToClipboard(header, log[header] !== null ? String(log[header]) : "-")}
                    >
                      {copiedField === header ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              ))}

              {filteredHeaders.length === 0 && (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  No fields match your search criteria
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="raw">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Switch id="prettify-json" checked={prettifyJson} onCheckedChange={setPrettifyJson} />
              <Label htmlFor="prettify-json">Prettify JSON</Label>
            </div>
            <Button variant="outline" size="sm" className="h-7 px-2" onClick={copyFullLog}>
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy
            </Button>
          </div>
          <div className="relative">
            <ScrollArea className="h-[400px] bg-[#0f1d24] p-4 rounded-md border border-orange-600/10">
              <pre className="font-mono text-sm whitespace-pre-wrap">
                {JSON.stringify(log, null, prettifyJson ? 2 : undefined)}
              </pre>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
        <div>{log.timestamp && <span>Timestamp: {formatTimestamp(log.timestamp)}</span>}</div>
        <div className="flex items-center gap-2">
          {log.traceid && (
            <div className="flex items-center">
              <span className="mr-1">Trace ID:</span>
              <span className="font-mono">{log.traceid}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
