"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { AlertsTable } from "@/components/alerts/alerts-table"
import { AlertDetailsProvider } from "@/components/alerts/alert-details-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Paginator } from "@/components/ui/paginator"
import { Loading } from "@/components/loading"
import { Download, Filter, RefreshCw, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"
import useAlertsState from "@/lib/state/alerts/alertsState"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"

// Update AlertShieldIcon to accept a color prop
const AlertShieldIcon = ({ size = 48, color = '#EA661B' }: { size?: number, color?: string }) => (
  <svg width={size} height={size * 50 / 48} viewBox="0 0 48 58" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    <path d="M47.2978 12.5691C47.2162 13.2136 47.1346 13.825 47.053 14.4364C46.9878 14.9156 46.9062 15.3783 46.8572 15.8575C46.743 16.7663 46.6288 17.6752 46.5309 18.584C46.4656 19.1128 46.433 19.6581 46.384 20.1869C46.3188 20.7487 46.2372 21.3106 46.1882 21.8889C46.1556 22.2525 46.1556 22.6325 46.1066 22.9961C46.0087 23.8553 45.8945 24.6981 45.7803 25.5574C45.6987 26.1853 45.6171 26.8132 45.5029 27.4411C45.1766 29.1266 44.8339 30.8121 44.4586 32.4811C44.0181 34.431 43.4143 36.3313 42.6801 38.182C42.06 39.7519 41.2931 41.2556 40.3467 42.6602C39.5146 43.916 38.6334 45.1388 37.6707 46.3121C36.4633 47.7828 35.1416 49.1378 33.6241 50.311C32.7267 51.005 31.9108 51.8147 31.0297 52.5253C29.6591 53.6159 28.2885 54.69 26.8852 55.7476C25.9062 56.4912 24.8782 57.1521 23.8829 57.8792C23.6708 58.0279 23.5728 57.9949 23.3934 57.8792C22.1533 56.9869 20.8969 56.1276 19.6894 55.2022C18.5962 54.376 17.5519 53.5167 16.4913 52.6575C15.5122 51.8643 14.5006 51.0711 13.5542 50.2284C12.4773 49.2534 11.433 48.262 10.4377 47.2044C8.85491 45.5189 7.51692 43.6351 6.34209 41.6357C5.06937 39.4875 4.18825 37.1906 3.4703 34.8111C2.99711 33.2743 2.63813 31.7045 2.29547 30.1181C2.00177 28.7796 1.80596 27.4411 1.61016 26.0861C1.44699 24.9955 1.31645 23.8884 1.20223 22.7978C1.08802 21.8228 1.03906 20.8644 0.924845 19.8895C0.810626 18.8815 0.647456 17.8735 0.533237 16.882C0.435335 16.0227 0.35375 15.1635 0.255848 14.3042C0.206897 13.858 0.125312 13.4119 0.0274101 12.9657C-0.0215409 12.7013 -0.0378579 12.5691 0.304799 12.5196C1.87123 12.2221 3.35608 11.6107 4.82461 10.9663C6.47263 10.2392 8.13696 9.49559 9.73603 8.61979C11.9062 7.44655 14.0437 6.17417 16.1649 4.88526C18.0414 3.74507 19.8689 2.50574 21.6964 1.29945C22.3001 0.902868 22.8712 0.440183 23.4749 0.0435958C23.5565 -0.00597757 23.736 -0.022502 23.8176 0.0435958C25.5472 1.20031 27.2442 2.39007 28.9738 3.53026C30.3118 4.40605 31.6824 5.23228 33.053 6.0585C34.5379 6.9343 36.039 7.79357 37.5565 8.60327C38.7314 9.2312 39.9388 9.8426 41.1626 10.3879C42.9248 11.1811 44.7034 11.9412 46.5798 12.4204C46.8083 12.47 47.0367 12.503 47.3304 12.5691H47.2978ZM41.5868 17.3943C41.6358 17.0968 41.6847 16.7994 41.7337 16.5515C40.7547 16.2045 39.8083 15.9071 38.8782 15.5601C37.3444 14.9817 35.8596 14.2877 34.4237 13.4945C33.1346 12.784 31.8129 12.0899 30.5565 11.3298C29.039 10.4044 27.5542 9.41296 26.053 8.43802C25.3188 7.95881 24.6171 7.44655 23.8829 6.96734C23.7687 6.90125 23.5402 6.90125 23.426 6.96734C23.0018 7.23174 22.5938 7.5457 22.1696 7.82662C21.0437 8.57022 19.9505 9.34687 18.792 10.0574C17.2255 11.0324 15.6428 11.9743 14.0274 12.8666C12.6731 13.6267 11.2698 14.3042 9.85025 14.9652C8.54489 15.5766 7.17426 16.0888 5.771 16.4359C5.60783 16.4689 5.55888 16.5681 5.57519 16.7168C5.65678 17.2456 5.73836 17.7743 5.80363 18.3031C5.91785 19.1789 6.04839 20.0382 6.14629 20.914C6.26051 21.9055 6.34209 22.8969 6.43999 23.8884C6.52158 24.7311 6.60316 25.5904 6.7337 26.4166C6.89687 27.5238 7.07636 28.6309 7.32111 29.7215C7.64745 31.1592 8.00643 32.5968 8.41435 34.0014C8.85491 35.5216 9.49127 36.9758 10.2582 38.3638C11.2698 40.198 12.5426 41.834 13.9621 43.3542C14.8596 44.3291 15.8875 45.1388 16.8992 45.9816C17.8456 46.7582 18.743 47.601 19.7057 48.3281C20.9295 49.27 22.2185 50.1458 23.4749 51.0381C23.5565 51.1042 23.7687 51.0876 23.8502 51.0381C24.6987 50.4597 25.5309 49.8483 26.3631 49.2534C26.9994 48.7907 27.6358 48.3281 28.2558 47.8323C28.8922 47.3201 29.4959 46.7748 30.1323 46.2295C30.9481 45.5354 31.7966 44.8579 32.5962 44.1308C33.6078 43.2055 34.4726 42.1479 35.3048 41.0573C36.757 39.1405 37.9155 37.0584 38.6661 34.7615C39.123 33.39 39.4819 31.9854 39.8246 30.5808C40.053 29.6719 40.1836 28.7466 40.3467 27.8212C40.4446 27.2594 40.5099 26.6975 40.5915 26.1192C40.6894 25.3591 40.7873 24.5824 40.8689 23.8058C40.9178 23.3927 40.9505 22.963 40.9831 22.5499C41.0484 21.8559 41.13 21.1784 41.2115 20.4844C41.2442 20.1539 41.2931 19.8399 41.3258 19.5094" fill={color}/>
  </svg>
)

// Severity color maps
const severityColors = {
  dark: {
    critical: '#EA661B',
    high: '#FF975D',
    medium: '#FFD0B6',
    low: '#FFFFFF',
  },
  light: {
    critical: '#FF7120',
    high: '#FF985E',
    medium: '#FFC09C',
    low: '#506C77',
  },
}

export default function AlertsViewPage() {
  const { alerts, loading, error, fetchAlerts } = useAlertsState()
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme === 'light' ? 'light' : 'dark'
  const [searchQuery, setSearchQuery] = useState("")
  const [severity, setSeverity] = useState("all")
  const [status, setStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const itemsPerPage = 10

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  // Use debouncing for search to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Filter alerts based on search query and filters
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      debouncedSearch === "" ||
      (alert.metadata?.rule_name && alert.metadata.rule_name.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
      (alert.security_detection?.description &&
        alert.security_detection.description.toLowerCase().includes(debouncedSearch.toLowerCase()))

    const matchesSeverity =
      severity === "all" || (alert.security_detection && alert.security_detection.severity === severity)

    const matchesStatus = status === "all" || (alert.alert_management && alert.alert_management.status === status)

    return matchesSearch && matchesSeverity && matchesStatus
  })

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    fetchAlerts()
  }

  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage)
  const paginatedAlerts = filteredAlerts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Count alerts by severity
  const alertCounts = {
    critical: alerts.filter((alert) => alert.security_detection?.severity === "critical").length,
    high: alerts.filter((alert) => alert.security_detection?.severity === "high").length,
    medium: alerts.filter((alert) => alert.security_detection?.severity === "medium").length,
    low: alerts.filter((alert) => alert.security_detection?.severity === "low").length,
  }

  return (
    <AlertDetailsProvider>
      <div className="flex flex-col h-full bg-[#E8E8E8] dark:bg-[#0E1A1F]">
        <div className="px-12 py-4">
          <div className="flex justify-between items-center">
            <div style={{ 
              color: theme === 'light' ? '#506C77' : '#506C77', 
              fontFamily: 'Helvetica, Arial, sans-serif', 
              fontWeight: 400, 
              fontSize: '12.3px', 
              marginBottom: 0,
              lineHeight: '13px'
            }}>
              <span style={{ color: theme === 'light' ? '#FF7120' : '#EA661B', fontWeight: 700, fontSize: 13 }}>Security Alerts</span> / monitor and respond to security alerts across your infrastructure
            </div>
            <div style={{ color: '#0C2027' }}>
              <div style={{ color: '#0C2027' }}>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        <div className="px-12 py-0 -mt-0 space-y-3">
          {/* Severity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Critical Alerts Card */}
            <Card className="bg-transparent dark:bg-[#0f1d24] rounded-lg border" style={{ borderColor: severityColors[theme].critical, borderWidth: 1 }}>
              <div className="flex flex-row items-center w-full justify-between" style={{ minHeight: 100 }}>
                <div style={{ textAlign: 'left', color: severityColors[theme].critical, fontWeight: 700, fontSize: 25, fontFamily: 'Helvetica, Arial, sans-serif', lineHeight: 1, marginLeft: 20 }}>
                  Critical<br />Alerts
                </div>
                <div className="flex flex-row items-center" style={{ marginRight: 15 }}>
                  <AlertShieldIcon size={48} color={severityColors[theme].critical} />
                  <span style={{ color: severityColors[theme].critical, fontWeight: 400, fontSize: 64, fontFamily: 'Helvetica, Arial, sans-serif', lineHeight: 1, marginLeft: 1, display: 'inline-block', minWidth: 56, textAlign: 'right' }}>{alertCounts.critical.toString().padStart(2, '0')}</span>
                </div>
              </div>
            </Card>

            {/* High Alerts Card */}
            <Card className="bg-transparent dark:bg-[#0f1d24] rounded-lg border" style={{ borderColor: '#506C77', borderWidth: 0.5 }}>
              <div className="flex flex-row items-center w-full justify-between" style={{ minHeight: 100 }}>
                <div style={{ textAlign: 'left', color: severityColors[theme].high, fontWeight: 700, fontSize: 25, fontFamily: 'Helvetica, Arial, sans-serif', lineHeight: 1, marginLeft: 20 }}>
                  High<br />Alerts
                </div>
                <div className="flex flex-row items-center" style={{ marginRight: 15 }}>
                  <AlertShieldIcon size={48} color={severityColors[theme].high} />
                  <span style={{ color: severityColors[theme].high, fontWeight: 400, fontSize: 64, fontFamily: 'Helvetica, Arial, sans-serif', lineHeight: 1, marginLeft: 1, display: 'inline-block', minWidth: 56, textAlign: 'right' }}>{alertCounts.high.toString().padStart(2, '0')}</span>
                </div>
              </div>
            </Card>

            {/* Medium Alerts Card */}
            <Card className="bg-transparent dark:bg-[#0f1d24] rounded-lg border" style={{ borderColor: '#506C77', borderWidth: 0.5 }}>
              <div className="flex flex-row items-center w-full justify-between" style={{ minHeight: 100 }}>
                <div style={{ textAlign: 'left', color: severityColors[theme].medium, fontWeight: 700, fontSize: 25, fontFamily: 'Helvetica, Arial, sans-serif', lineHeight: 1, marginLeft: 20 }}>
                  Medium<br />Alerts
                </div>
                <div className="flex flex-row items-center" style={{ marginRight: 15 }}>
                  <AlertShieldIcon size={48} color={severityColors[theme].medium} />
                  <span style={{ color: severityColors[theme].medium, fontWeight: 400, fontSize: 64, fontFamily: 'Helvetica, Arial, sans-serif', lineHeight: 1, marginLeft: 1, display: 'inline-block', minWidth: 56, textAlign: 'right' }}>{alertCounts.medium.toString().padStart(2, '0')}</span>
                </div>
              </div>
            </Card>

            {/* Low Alerts Card */}
            <Card className="bg-transparent dark:bg-[#0f1d24] rounded-lg border" style={{ borderColor: '#506C77', borderWidth: 0.5 }}>
              <div className="flex flex-row items-center w-full justify-between" style={{ minHeight: 100 }}>
                <div style={{ textAlign: 'left', color: severityColors[theme].low, fontWeight: 700, fontSize: 25, fontFamily: 'Helvetica, Arial, sans-serif', lineHeight: 1, marginLeft: 20 }}>
                  Low<br />Alerts
                </div>
                <div className="flex flex-row items-center" style={{ marginRight: 20 }}>
                  <AlertShieldIcon size={48} color={severityColors[theme].low} />
                  <span style={{ color: severityColors[theme].low, fontWeight: 400, fontSize: 64, fontFamily: 'Helvetica, Arial, sans-serif', lineHeight: 1, marginLeft: 1, display: 'inline-block', minWidth: 56, textAlign: 'right' }}>{alertCounts.low.toString().padStart(2, '0')}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-white dark:text-white text-[#506C77]" />
              <Input placeholder="Search alerts..." value={searchQuery} onChange={handleSearch} className="pl-10 !bg-[#CAD0D2] dark:!bg-[#0D1315] !border-none !text-[#506C77] dark:!text-white placeholder-[#506C77] dark:placeholder-white" />
            </div>

            <Select value={severity} onValueChange={(value) => setSeverity(value)}>
              <SelectTrigger className="w-full sm:w-[180px] !bg-[#CAD0D2] dark:!bg-[#0D1315] !text-[#506C77] dark:!text-[#506C77] !border !border-[#506C77]">
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={(value) => setStatus(value)}>
              <SelectTrigger className="w-full sm:w-[180px] !bg-[#CAD0D2] dark:!bg-[#0D1315] !text-[#506C77] dark:!text-[#506C77] !border !border-[#506C77]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="false_positive">False Positive</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="!bg-[#CAD0D2] dark:!bg-[#0D1315] !border !border-[#506C77]"
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(alerts, null, 2));
                  const dlAnchorElem = document.createElement('a');
                  dlAnchorElem.setAttribute("href", dataStr);
                  dlAnchorElem.setAttribute("download", "alerts.json");
                  document.body.appendChild(dlAnchorElem);
                  dlAnchorElem.click();
                  document.body.removeChild(dlAnchorElem);
                }}
              >
                <Download className="h-4 w-4 text-[#506C77]" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loading />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-red-500">{error}</div>
          ) : (
            <>
              <AlertsTable alerts={paginatedAlerts} />
              <div className="flex items-center justify-end mt-4">
                <Paginator
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalRecords={filteredAlerts.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </AlertDetailsProvider>
  )
}
