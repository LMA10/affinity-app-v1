import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loading } from "@/components/loading"

export default function AlertsLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* Alert summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-card/50">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-9 w-16" />
              </div>
              <Skeleton className="h-4 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and search skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>
              <Skeleton className="h-6 w-32" />
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Skeleton className="h-9 w-full sm:w-48" />
              <Skeleton className="h-9 w-full sm:w-48" />
              <Skeleton className="h-9 w-full sm:w-36" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Alert items */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 p-3 rounded-md bg-card/50">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-1" />
                    <Skeleton className="h-4 w-72" />
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </div>
          ))}

          {/* Loading spinner */}
          <div className="flex justify-center mt-6">
            <Loading />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
