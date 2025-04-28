"use client"

import { PageHeader } from "@/components/page-header"
import { QueryEditor } from "@/components/logs/query-editor"

export default function QueryPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Query" description="Run SQL queries against your log data" />
      <div className="p-6 flex-1 overflow-hidden">
        <div className="bg-[#0a1419] border border-orange-600/20 rounded-md h-full overflow-hidden">
          <QueryEditor />
        </div>
      </div>
    </div>
  )
}
