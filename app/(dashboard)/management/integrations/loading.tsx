import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function IntegrationsLoading() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Integrations" description="Manage your security integrations" />

      <div className="flex-1 p-6 space-y-6">
        <Tabs defaultValue="installed" className="space-y-4">
          <TabsList className="bg-[#0f1d24]">
            <TabsTrigger value="installed" disabled>
              Installed
            </TabsTrigger>
            <TabsTrigger value="available" disabled>
              Available
            </TabsTrigger>
            <TabsTrigger value="settings" disabled>
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="installed" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="bg-[#0f1d24] border-orange-600/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-32 bg-gray-700" />
                      <Skeleton className="h-5 w-16 bg-gray-700" />
                    </div>
                    <Skeleton className="h-4 w-full mt-2 bg-gray-700" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20 bg-gray-700" />
                        <Skeleton className="h-4 w-24 bg-gray-700" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20 bg-gray-700" />
                        <Skeleton className="h-4 w-16 bg-gray-700" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20 bg-gray-700" />
                        <Skeleton className="h-4 w-24 bg-gray-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
