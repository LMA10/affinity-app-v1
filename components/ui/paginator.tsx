"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface PaginatorProps {
  currentPage: number
  totalPages: number
  totalRecords: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export function Paginator({ currentPage, totalPages, totalRecords, itemsPerPage, onPageChange }: PaginatorProps) {
  const hasPrevious = currentPage > 1
  const hasNext = currentPage < totalPages

  const goToFirst = () => onPageChange(1)
  const goToPrevious = () => onPageChange(currentPage - 1)
  const goToNext = () => onPageChange(currentPage + 1)
  const goToLast = () => onPageChange(totalPages)

  return (
    <div className="flex w-full items-center justify-between p-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {totalRecords} item{totalRecords !== 1 ? "s" : ""} • {itemsPerPage} per page
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={goToFirst}
          disabled={!hasPrevious || currentPage === 1}
        >
          <span className="sr-only">Go to first page</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" className="h-8 w-8 p-0" onClick={goToPrevious} disabled={!hasPrevious}>
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-2 text-sm">
          Page {currentPage} of {totalPages || 1}
        </span>
        <Button variant="outline" className="h-8 w-8 p-0" onClick={goToNext} disabled={!hasNext}>
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={goToLast}
          disabled={!hasNext || currentPage === totalPages}
        >
          <span className="sr-only">Go to last page</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
