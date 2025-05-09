import React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { List } from "lucide-react"
import { IconButton } from "./icon-button"

interface ColumnDropdownProps {
  columns: string[]
  visibleColumns: string[]
  onToggle: (column: string) => void
  className?: string
}

export function ColumnDropdown({ columns, visibleColumns, onToggle, className = "" }: ColumnDropdownProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconButton aria-label="Show columns" className={className}>
          <List className="h-5 w-5" />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Visible Columns</h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {columns.map((column) => (
              <div key={column} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${column}`}
                  checked={visibleColumns.includes(column)}
                  onCheckedChange={() => onToggle(column)}
                  disabled={visibleColumns.length === 1 && visibleColumns.includes(column)}
                />
                <Label htmlFor={`column-${column}`}>{column}</Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 