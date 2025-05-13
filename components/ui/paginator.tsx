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
    <div className="flex w-full items-center justify-between">
      <div className="flex-1 text-sm font-['IBM_Plex_Mono'] text-[#506C77] text-[14px]">
        {totalRecords} item{totalRecords !== 1 ? "s" : ""} • {itemsPerPage} per page
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 text-[#506C77] hover:text-[#506C77] hover:bg-transparent"
          onClick={goToFirst}
          disabled={!hasPrevious || currentPage === 1}
        >
          <span className="sr-only">Go to first page</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0 text-[#506C77] hover:text-[#506C77] hover:bg-transparent" 
          onClick={goToPrevious} 
          disabled={!hasPrevious}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-2 text-sm font-['IBM_Plex_Mono'] text-[#506C77] text-[14px]">
          Page {currentPage} of {totalPages || 1}
        </span>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0 text-[#506C77] hover:text-[#506C77] hover:bg-transparent" 
          onClick={goToNext} 
          disabled={!hasNext}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 text-[#506C77] hover:text-[#506C77] hover:bg-transparent"
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
