"use client"

import { useState, useEffect } from "react"
import { X, ChevronDown, Plus, Minus, Loader2, AlertCircle, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import useLogsState from "@/lib/state/logs/logsState"
import { validateSqlQuery } from "@/lib/utils/sql-validator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"

// Operators for conditions
const OPERATORS = ["=", "!=", ">", "<", ">=", "<=", "LIKE", "IN", "NOT IN", "IS NULL", "IS NOT NULL"]

// Aggregation functions
const AGGREGATIONS = ["COUNT", "SUM", "AVG", "MIN", "MAX"]

// Clause types
const CLAUSE_TYPES = ["WHERE", "GROUP BY", "ORDER BY", "LIMIT"]

// Time options
const TIME_OPTIONS = [
  "12:00 AM",
  "12:15 AM",
  "12:30 AM",
  "12:45 AM",
  "1:00 AM",
  "1:15 AM",
  "1:30 AM",
  "1:45 AM",
  "2:00 AM",
  "2:15 AM",
  "2:30 AM",
  "2:45 AM",
  "3:00 AM",
  "3:15 AM",
  "3:30 AM",
  "3:45 AM",
  "4:00 AM",
  "4:15 AM",
  "4:30 AM",
  "4:45 AM",
  "5:00 AM",
  "5:15 AM",
  "5:30 AM",
  "5:45 AM",
  "6:00 AM",
  "6:15 AM",
  "6:30 AM",
  "6:45 AM",
  "7:00 AM",
  "7:15 AM",
  "7:30 AM",
  "7:45 AM",
  "8:00 AM",
  "8:15 AM",
  "8:30 AM",
  "8:45 AM",
  "9:00 AM",
  "9:15 AM",
  "9:30 AM",
  "9:45 AM",
  "10:00 AM",
  "10:15 AM",
  "10:30 AM",
  "10:45 AM",
  "11:00 AM",
  "11:15 AM",
  "11:30 AM",
  "11:45 AM",
  "12:00 PM",
  "12:15 PM",
  "12:30 PM",
  "12:45 PM",
  "1:00 PM",
  "1:15 PM",
  "1:30 PM",
  "1:45 PM",
  "2:00 PM",
  "2:15 PM",
  "2:30 PM",
  "2:45 PM",
  "3:00 PM",
  "3:15 PM",
  "3:30 PM",
  "3:45 PM",
  "4:00 PM",
  "4:15 PM",
  "4:30 PM",
  "4:45 PM",
  "5:00 PM",
  "5:15 PM",
  "5:30 PM",
  "5:45 PM",
  "6:00 PM",
  "6:15 PM",
  "6:30 PM",
  "6:45 PM",
  "7:00 PM",
  "7:15 PM",
  "7:30 PM",
  "7:45 PM",
  "8:00 PM",
  "8:15 PM",
  "8:30 PM",
  "8:45 PM",
  "9:00 PM",
  "9:15 PM",
  "9:30 PM",
  "9:45 PM",
  "10:00 PM",
  "10:15 PM",
  "10:30 PM",
  "10:45 PM",
  "11:00 PM",
  "11:15 PM",
  "11:30 PM",
  "11:45 PM",
]

// Date range types
const DATE_RANGE_TYPES = ["Between", "Last 24 hours", "Last 7 days", "Last 30 days", "Custom"]

interface Condition {
  type: string
  column: string
  operator: string
  value: string
}

interface Aggregation {
  function: string
  column: string
  alias?: string
}

interface DateTimeFilter {
  type: string
  startDate: Date | null
  endDate: Date | null
  startTime: string
  endTime: string
}

interface QueryBuilderProps {
  isOpen: boolean
  onClose: () => void
  onApply: (query: string) => void
  onLoadExample?: (query: string) => void
  builderSyncState?: any
}

const EXAMPLE_QUERIES = [
  {
    name: "Console Login Attempts",
    description: "Detect users attempting to log into the AWS Management Console",
    query: `SELECT
  "eventtime",
  "useridentity.username",
  "sourceipaddress",
  "useragent"
FROM "cloudtrail"
WHERE "eventname" = 'ConsoleLogin'
  AND "eventsource" = 'signin.amazonaws.com'
  AND "useridentity.type" = 'IAMUser'
ORDER BY "eventtime" DESC
LIMIT 20;`
  },
  {
    name: "New IAM Users Created in the Last 7 Days",
    description: "Track provisioning of new users",
    query: `SELECT
  "eventtime",
  "useridentity.username" AS created_by,
  "requestid",
  "eventsource",
  "eventname"
FROM "cloudtrail"
WHERE "eventname" = 'CreateUser'
  AND from_iso8601_timestamp("eventtime") > current_timestamp - INTERVAL '7' DAY
ORDER BY from_iso8601_timestamp("eventtime") DESC
LIMIT 20;`
  },
  {
    name: "API Keys Used (AccessKeyId Logged) in the Last 7 Days",
    description: "Track usage of access keys",
    query: `SELECT
  "eventtime",
  "useridentity.username",
  "useridentity.accesskeyid",
  "eventname",
  "eventsource"
FROM "cloudtrail"
WHERE "useridentity.accesskeyid" IS NOT NULL
  AND from_iso8601_timestamp("eventtime") > current_timestamp - interval '7' day
ORDER BY from_iso8601_timestamp("eventtime") DESC
LIMIT 20;
`
  },
];

export function SQLQueryBuilder({ isOpen, onClose, onApply, onLoadExample, builderSyncState }: QueryBuilderProps) {
  // Get tables from state
  const { tables, loadingTables, fetchDatabases } = useLogsState()

  // State for query components
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [selectedColumns, setSelectedColumns] = useState<string[]>(["*"])
  const [useDistinct, setUseDistinct] = useState<boolean>(false)
  const [conditions, setConditions] = useState<Condition[]>([])
  const [aggregations, setAggregations] = useState<Aggregation[]>([])
  const [dateTimeFilter, setDateTimeFilter] = useState<DateTimeFilter>({
    type: "Between",
    startDate: new Date(),
    endDate: new Date(),
    startTime: "1:36 PM",
    endTime: "1:36 PM",
  })
  const [showDateTimeFilter, setShowDateTimeFilter] = useState<boolean>(false)
  const [generatedSQL, setGeneratedSQL] = useState<string>("")

  // State for validation errors
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch tables when the component mounts
  useEffect(() => {
    if (isOpen && Object.keys(tables).length === 0) {
      fetchDatabases()
    }
  }, [isOpen, tables, fetchDatabases])

  // Sync builder state from builderSyncState prop
  useEffect(() => {
    if (builderSyncState && isOpen) {
      if (builderSyncState.table) setSelectedTable(builderSyncState.table);

      // Only update columns if present and non-empty
      if (builderSyncState.columns && builderSyncState.columns.length > 0) {
        setSelectedColumns(builderSyncState.columns);
      } else if (builderSyncState.groupBy && builderSyncState.groupBy.length > 0) {
        setSelectedColumns(builderSyncState.groupBy);
      }
      // Otherwise, do not overwrite selectedColumns

      if (typeof builderSyncState.distinct === 'boolean') setUseDistinct(builderSyncState.distinct);
      if (builderSyncState.aggregates) setAggregations(builderSyncState.aggregates);
      if (builderSyncState.where) setConditions(
        builderSyncState.where.map((cond: string) => ({
          type: "WHERE",
          column: cond.split(' ')[0].replace(/"/g, ''),
          operator: cond.split(' ')[1],
          value: cond.split(' ').slice(2).join(' ').replace(/['"]/g, '')
        }))
      );
      if (builderSyncState.limit) setConditions((prev: any) => [
        ...prev.filter((c: any) => c.type !== 'LIMIT'),
        { type: 'LIMIT', column: '', operator: '', value: builderSyncState.limit }
      ]);
    }
  }, [builderSyncState, isOpen]);

  // Get columns for the selected table
  const getTableColumns = () => {
    return selectedTable && tables[selectedTable] ? tables[selectedTable] : []
  }

  // Add a new condition
  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        type: "-",
        column: "-",
        operator: "-",
        value: "",
      },
    ])
  }

  // Remove a condition
  const removeCondition = (index: number) => {
    const newConditions = [...conditions]
    newConditions.splice(index, 1)
    setConditions(newConditions)
  }

  // Update a condition
  const updateCondition = (index: number, field: keyof Condition, value: string) => {
    const newConditions = [...conditions]
    newConditions[index] = { ...newConditions[index], [field]: value }
    setConditions(newConditions)
  }

  // Add a new aggregation
  const addAggregation = () => {
    const columns = getTableColumns()
    setAggregations([
      ...aggregations,
      {
        function: "COUNT",
        column: columns.length > 0 ? columns[0] : "",
        alias: "",
      },
    ])
  }

  // Remove an aggregation
  const removeAggregation = (index: number) => {
    const newAggregations = [...aggregations]
    newAggregations.splice(index, 1)
    setAggregations(newAggregations)
  }

  // Update an aggregation
  const updateAggregation = (index: number, field: keyof Aggregation, value: string) => {
    const newAggregations = [...aggregations]
    newAggregations[index] = { ...newAggregations[index], [field]: value }
    setAggregations(newAggregations)
  }

  // Toggle date/time filter
  const toggleDateTimeFilter = () => {
    setShowDateTimeFilter(!showDateTimeFilter)
  }

  // Reset the query builder
  const resetQueryBuilder = () => {
    setSelectedTable("")
    setSelectedColumns(["*"])
    setUseDistinct(false)
    setConditions([])
    setAggregations([])
    setDateTimeFilter({
      type: "Between",
      startDate: new Date(),
      endDate: new Date(),
      startTime: "1:36 PM",
      endTime: "1:36 PM",
    })
    setShowDateTimeFilter(false)
    setGeneratedSQL("")
  }

  // Generate SQL query
  const generateSQL = () => {
    if (!selectedTable) return ""

    // Start building the query
    let query = "SELECT "

    // Add DISTINCT if enabled
    if (useDistinct) {
      query += "DISTINCT "
    }

    // Add columns or aggregations
    if (aggregations.length > 0) {
      const aggParts = aggregations.map((agg) => {
        let part = `${agg.function}(${agg.column === "*" ? "*" : `\"${agg.column}\"`})`
        if (agg.alias) {
          part += ` AS \"${agg.alias}\"`
        }
        return part
      })

      if (selectedColumns.length > 0 && !(selectedColumns.length === 1 && selectedColumns[0] === "*")) {
        const colParts = selectedColumns.map((col) => (col === "*" ? "*" : `\"${col}\"`))
        query += [...colParts, ...aggParts].join(", ")
      } else {
        query += aggParts.join(", ")
      }
    } else {
      query += selectedColumns.map((col) => (col === "*" ? "*" : `\"${col}\"`)).join(", ")
    }

    // Add FROM clause
    query += ` FROM \"${selectedTable}\"`

    // Filter out incomplete/empty conditions
    const validConditions = conditions.filter(
      (cond) => cond.type !== "-" && cond.column !== "-" && cond.operator !== "-" && cond.type !== "LIMIT"
    )

    // Add WHERE conditions
    if (validConditions.length > 0) {
      query += " WHERE "
      const whereParts = validConditions.map((cond) => {
        if (cond.operator === "IS NULL" || cond.operator === "IS NOT NULL") {
          return `${cond.column} ${cond.operator}`
        } else if (cond.operator === "IN" || cond.operator === "NOT IN") {
          return `${cond.column} ${cond.operator} (${cond.value})`
        } else {
          return `${cond.column} ${cond.operator} '${cond.value}'`
        }
      })
      query += whereParts.join(" AND ")
    }

    // Add date/time filter if enabled
    if (showDateTimeFilter && dateTimeFilter.startDate && dateTimeFilter.endDate) {
      const startDateTime = formatDateTimeForSQL(dateTimeFilter.startDate, dateTimeFilter.startTime)
      const endDateTime = formatDateTimeForSQL(dateTimeFilter.endDate, dateTimeFilter.endTime)

      if (validConditions.length > 0) {
        query += ` AND timestamp BETWEEN '${startDateTime}' AND '${endDateTime}'`
      } else {
        query += ` WHERE timestamp BETWEEN '${startDateTime}' AND '${endDateTime}'`
      }
    }

    // Add GROUP BY if there are aggregations
    if (
      aggregations.length > 0 &&
      selectedColumns.length > 0 &&
      !(selectedColumns.length === 1 && selectedColumns[0] === "*")
    ) {
      query += " GROUP BY " + selectedColumns.map((col) => `\"${col}\"`).join(", ")
    }

    // Add LIMIT clause if present
    const limitCondition = conditions.find((cond) => cond.type === "LIMIT" && cond.value)
    if (limitCondition) {
      query += ` LIMIT ${limitCondition.value}`
    }

    // End the query
    query += ";"

    return query
  }

  // Format date and time for SQL
  const formatDateTimeForSQL = (date: Date, time: string) => {
    const formattedDate = format(date, "yyyy-MM-dd")

    // Convert time from "1:36 PM" format to "13:36:00"
    let hours = 0
    let minutes = 0
    const timeParts = time.match(/(\d+):(\d+)\s*(AM|PM)/)

    if (timeParts) {
      hours = Number.parseInt(timeParts[1])
      minutes = Number.parseInt(timeParts[2])
      const period = timeParts[3]

      if (period === "PM" && hours < 12) hours += 12
      if (period === "AM" && hours === 12) hours = 0
    }

    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`

    return `${formattedDate}T${formattedTime}.000Z`
  }

  // Update SQL when query components change
  useEffect(() => {
    const sql = generateSQL()
    setGeneratedSQL(sql)
    
    // Clear validation error when SQL changes
    if (validationError) {
      setValidationError(null)
    }
  }, [selectedTable, selectedColumns, useDistinct, conditions, aggregations, showDateTimeFilter, dateTimeFilter, validationError])

  // Apply the generated SQL
  const handleApply = () => {
    // Validate the SQL before applying it
    const validationResult = validateSqlQuery(generatedSQL);
    if (!validationResult.isValid) {
      // Show the validation error to the user
      setValidationError(validationResult.error || "Invalid SQL query");
      return;
    }

    onApply(generatedSQL)
    onClose()
  }

  // Parse example query
  const parseExampleQuery = (query: string) => {
    
    // Extract table name
    const fromMatch = query.match(/FROM\s+"([^"]+)"/i);
    if (fromMatch) {
      setSelectedTable(fromMatch[1]);
    }

    // Extract WHERE conditions
    const whereMatch = query.match(/WHERE\s+(.+?)(?=(GROUP BY|ORDER BY|LIMIT|$))/i);
    if (whereMatch) {
      const conditions = whereMatch[1].split(/\s+AND\s+/i).map(condition => {
        const parts = condition.match(/"([^"]+)"\s*([=<>!]+|IS|LIKE|IN)\s*(.+)/i);
        if (parts) {
          return {
            type: "WHERE",
            column: parts[1],
            operator: parts[2],
            value: parts[3].replace(/['"]/g, '')
          };
        }
        return null;
      }).filter(Boolean);
      
      setConditions(conditions as Condition[]);
    }

    // Extract GROUP BY columns
    const groupByMatch = query.match(/GROUP BY\s+(.+?)(?=(HAVING|ORDER BY|LIMIT|$))/i);
    if (groupByMatch) {
      const columns = groupByMatch[1].split(',').map(col => col.trim().replace(/"/g, ''));
      setSelectedColumns(columns);
    }

    // Extract aggregations
    const aggregateMatch = query.match(/SELECT\s+(.+?)\s+FROM/i);
    if (aggregateMatch) {
      const aggregates = aggregateMatch[1].split(',').map(agg => {
        const funcMatch = agg.match(/(\w+)\((.*?)\)(?:\s+AS\s+(\w+))?/i);
        if (funcMatch) {
          return {
            function: funcMatch[1],
            column: funcMatch[2].replace(/"/g, ''),
            alias: funcMatch[3] || ''
          };
        }
        return null;
      }).filter(Boolean);
      
      setAggregations(aggregates as Aggregation[]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[#0a1419] border-orange-600/20 text-white">

        <DialogHeader>
          <DialogTitle className="text-2xl text-orange-500 flex justify-between items-center">
            SQL Query Builder
            <Button variant="ghost" size="icon" onClick={onClose} className="text-orange-500">
              <X className="h-5 w-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Table Selection */}
          <div>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="bg-[#0f1d24] border-orange-600/20 text-orange-500">
                {loadingTables ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading tables...
                  </div>
                ) : selectedTable ? (
                  selectedTable
                ) : (
                  "Select Table"
                )}
              </SelectTrigger>
              <SelectContent className="bg-[#0f1d24] border-orange-600/20">
                {Object.keys(tables).map((tableName) => (
                  <SelectItem key={tableName} value={tableName} className="text-white">
                    {tableName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Column Selection */}
          <div>
            <div className="flex items-center gap-2 bg-[#0f1d24] border border-orange-600/20 rounded-md p-2">
              <div className="flex flex-wrap gap-2 flex-1">
                {selectedColumns.map((col, index) => (
                  <div key={index} className="bg-[#1a2e38] text-white px-2 py-1 rounded-md flex items-center gap-1">
                    {col}
                    <button
                      onClick={() => {
                        if (selectedColumns.length > 1) {
                          setSelectedColumns(selectedColumns.filter((_, i) => i !== index))
                        }
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-orange-500"
                  onClick={() => {
                    if (selectedTable) {
                      const columns = getTableColumns()
                      if (columns.length > 0 && !selectedColumns.includes(columns[0]) && selectedColumns[0] !== "*") {
                        setSelectedColumns([...selectedColumns, columns[0]])
                      }
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !selectedColumns.includes(value)) {
                      if (selectedColumns.length === 1 && selectedColumns[0] === "*") {
                        setSelectedColumns([value])
                      } else {
                        setSelectedColumns([...selectedColumns, value])
                      }
                    }
                  }}
                >
                  <SelectTrigger className="w-8 p-0 border-none bg-transparent">
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f1d24] border-orange-600/20">
                    <SelectItem value="*" className="text-white">
                      *
                    </SelectItem>
                    {getTableColumns().map((col) => (
                      <SelectItem key={col} value={col} className="text-white">
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Query Options */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={useDistinct ? "default" : "outline"}
              className={useDistinct ? "bg-orange-600 hover:bg-orange-700" : "border-orange-600/20 text-orange-500"}
              onClick={() => setUseDistinct(!useDistinct)}
            >
              {useDistinct ? "Disable DISTINCT" : "Enable DISTINCT"}
            </Button>
            <Button
              variant={showDateTimeFilter ? "default" : "outline"}
              className={
                showDateTimeFilter ? "bg-orange-600 hover:bg-orange-700" : "border-orange-600/20 text-orange-500"
              }
              onClick={toggleDateTimeFilter}
            >
              {showDateTimeFilter ? "Hide Date/Time" : "Add Date/Time"}
            </Button>
            <Button variant="outline" className="border-orange-600/20 text-orange-500" onClick={addCondition}>
              Add Clause
            </Button>
            <Button variant="outline" className="border-orange-600/20 text-orange-500" onClick={addAggregation}>
              Add Aggregate
            </Button>
          </div>

          {/* Date/Time Filter */}
          {showDateTimeFilter && (
            <div className="space-y-4 border-t border-b border-orange-600/10 py-4">
              <Select
                value={dateTimeFilter.type}
                onValueChange={(value) => setDateTimeFilter({ ...dateTimeFilter, type: value })}
              >
                <SelectTrigger className="bg-[#0f1d24] border-orange-600/20 text-orange-500">
                  {dateTimeFilter.type}
                </SelectTrigger>
                <SelectContent className="bg-[#0f1d24] border-orange-600/20">
                  {DATE_RANGE_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="text-white">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {dateTimeFilter.type === "Between" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full border-orange-600/20 text-white bg-[#0f1d24]">
                          {dateTimeFilter.startDate ? format(dateTimeFilter.startDate, "MM/dd/yyyy") : "Start Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="bg-[#0f1d24] border-orange-600/20 p-0">
                        <Calendar
                          mode="single"
                          selected={dateTimeFilter.startDate ?? undefined}
                          onSelect={(date) => setDateTimeFilter({ ...dateTimeFilter, startDate: date ?? null })}
                          className="bg-[#0f1d24]"
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="border-l-0 border-orange-600/20 text-white bg-[#0f1d24]">
                          {dateTimeFilter.startTime}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="bg-[#0f1d24] border-orange-600/20 p-0 w-[120px] h-[300px] overflow-auto">
                        <div className="py-1">
                          {TIME_OPTIONS.map((time) => (
                            <div
                              key={time}
                              className={`px-4 py-2 cursor-pointer hover:bg-orange-600/20 ${dateTimeFilter.startTime === time ? "bg-orange-600/20 text-orange-500" : "text-white"}`}
                              onClick={() => setDateTimeFilter({ ...dateTimeFilter, startTime: time })}
                            >
                              {time}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full border-orange-600/20 text-white bg-[#0f1d24]">
                          {dateTimeFilter.endDate ? format(dateTimeFilter.endDate, "MM/dd/yyyy") : "End Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="bg-[#0f1d24] border-orange-600/20 p-0">
                        <Calendar
                          mode="single"
                          selected={dateTimeFilter.endDate ?? undefined}
                          onSelect={(date) => setDateTimeFilter({ ...dateTimeFilter, endDate: date ?? null })}
                          className="bg-[#0f1d24]"
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="border-l-0 border-orange-600/20 text-white bg-[#0f1d24]">
                          {dateTimeFilter.endTime}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="bg-[#0f1d24] border-orange-600/20 p-0 w-[120px] h-[300px] overflow-auto">
                        <div className="py-1">
                          {TIME_OPTIONS.map((time) => (
                            <div
                              key={time}
                              className={`px-4 py-2 cursor-pointer hover:bg-orange-600/20 ${dateTimeFilter.endTime === time ? "bg-orange-600/20 text-orange-500" : "text-white"}`}
                              onClick={() => setDateTimeFilter({ ...dateTimeFilter, endTime: time })}
                            >
                              {time}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conditions */}
          {conditions.length > 0 && (
            <div className="space-y-4 border-t border-b border-orange-600/10 py-4">
              {conditions.map((condition, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select value={condition.type} onValueChange={(value) => updateCondition(index, "type", value)}>
                    <SelectTrigger className="bg-[#0f1d24] border-orange-600/20 text-orange-500 w-32">
                      {condition.type}
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1d24] border-orange-600/20">
                      {CLAUSE_TYPES.map((type) => (
                        <SelectItem key={type} value={type} className="text-white">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {condition.type !== "LIMIT" ? (
                    <>
                      <Select value={condition.column} onValueChange={(value) => updateCondition(index, "column", value)}>
                        <SelectTrigger className="bg-[#0f1d24] border-orange-600/20 text-orange-500 flex-1">
                          {condition.column}
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f1d24] border-orange-600/20">
                          {getTableColumns().map((col) => (
                            <SelectItem key={col} value={col} className="text-white">
                              {col}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={condition.operator}
                        onValueChange={(value) => updateCondition(index, "operator", value)}
                      >
                        <SelectTrigger className="bg-[#0f1d24] border-orange-600/20 text-orange-500 w-32">
                          {condition.operator}
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f1d24] border-orange-600/20">
                          {OPERATORS.map((op) => (
                            <SelectItem key={op} value={op} className="text-white">
                              {op}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {condition.operator !== "IS NULL" && condition.operator !== "IS NOT NULL" && (
                        <Input
                          value={condition.value}
                          onChange={(e) => updateCondition(index, "value", e.target.value)}
                          className="bg-[#0f1d24] border-orange-600/20 text-white flex-1"
                          placeholder="Value"
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <span className="px-2 text-orange-500">=</span>
                      <Input
                        type="number"
                        value={condition.value}
                        onChange={(e) => updateCondition(index, "value", e.target.value)}
                        className="bg-[#0f1d24] border-orange-600/20 text-white flex-1"
                        placeholder="Limit value"
                      />
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-orange-500"
                    onClick={() => removeCondition(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Aggregations */}
          {aggregations.length > 0 && (
            <div className="space-y-4 border-t border-b border-orange-600/10 py-4">
              {aggregations.map((agg, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select value={agg.function} onValueChange={(value) => updateAggregation(index, "function", value)}>
                    <SelectTrigger className="bg-[#0f1d24] border-orange-600/20 text-orange-500 w-32">
                      {agg.function}
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1d24] border-orange-600/20">
                      {AGGREGATIONS.map((func) => (
                        <SelectItem key={func} value={func} className="text-white">
                          {func}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={agg.column} onValueChange={(value) => updateAggregation(index, "column", value)}>
                    <SelectTrigger className="bg-[#0f1d24] border-orange-600/20 text-orange-500 flex-1">
                      {agg.column}
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1d24] border-orange-600/20">
                      <SelectItem value="*" className="text-white">
                        *
                      </SelectItem>
                      {getTableColumns().map((col) => (
                        <SelectItem key={col} value={col} className="text-white">
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    value={agg.alias || ""}
                    onChange={(e) => updateAggregation(index, "alias", e.target.value)}
                    className="bg-[#0f1d24] border-orange-600/20 text-white flex-1"
                    placeholder="Alias (optional)"
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-orange-500"
                    onClick={() => removeAggregation(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Example Queries */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-orange-500">Example Queries</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-orange-500">
                    <BookOpen className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click an example to load it into the query builder</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <ScrollArea className="h-40 rounded-md border border-orange-600/20">
            <div className="p-4 space-y-4">
              {EXAMPLE_QUERIES.map((example, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-orange-600/20 hover:bg-orange-600/10 cursor-pointer transition-colors"
                  onClick={() => {
                    setGeneratedSQL(example.query);
                    // Parse and set the query components
                    parseExampleQuery(example.query);
                  }}
                >
                  <h4 className="font-medium text-orange-500">{example.name}</h4>
                  <p className="text-sm text-gray-400">{example.description}</p>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Generated SQL */}
          <div>
            <textarea
              value={generatedSQL}
              readOnly
              className={`w-full h-32 bg-[#0a1419] border ${validationError ? 'border-red-500' : 'border-orange-600/20'} rounded-md p-2 text-orange-500 font-mono`}
            />
            {validationError && (
              <div className="mt-2 p-2 bg-red-950/20 border border-red-800 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
                  <p className="text-sm text-red-400">{validationError}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="border-orange-600/20 text-orange-500" onClick={resetQueryBuilder}>
            Reset
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleApply}>
            Use
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
