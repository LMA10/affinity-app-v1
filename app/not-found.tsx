import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a1419] text-white">
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-8">
          <div className="relative">
            <div className="h-40 w-40 rounded-md border border-orange-600/50 flex items-center justify-center">
              <X className="h-24 w-24 text-orange-500" />
            </div>
            <div className="absolute -right-2 -top-2 h-4 w-4 border-t border-r border-orange-600/50"></div>
            <div className="absolute -left-2 -top-2 h-4 w-4 border-t border-l border-orange-600/50"></div>
            <div className="absolute -right-2 -bottom-2 h-4 w-4 border-b border-r border-orange-600/50"></div>
            <div className="absolute -left-2 -bottom-2 h-4 w-4 border-b border-l border-orange-600/50"></div>
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-7xl font-bold text-orange-500">404</h1>
            <p className="text-2xl text-orange-500">Page not found.</p>
            <div className="flex gap-2">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-8 w-16 bg-orange-500 transform -skew-x-[20deg]"></div>
                ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 mt-8">
          <p className="text-center text-gray-400 max-w-md">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <Button asChild className="bg-orange-600 hover:bg-orange-700 mt-4">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
