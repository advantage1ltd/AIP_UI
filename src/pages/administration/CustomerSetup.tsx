import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomersTable } from "@/components/customer-setup/CustomersTable"
import { RegionsTable } from "@/components/customer-setup/RegionsTable"
import { SitesTable } from "@/components/customer-setup/SitesTable"
import { CustomerStats } from "@/components/customer-setup/CustomerStats"

export default function CustomerSetup() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("customers")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customer Setup</h1>
      </div>

      <CustomerStats selectedCustomerId={selectedCustomerId} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="regions" disabled={!selectedCustomerId}>
            Regions
          </TabsTrigger>
          <TabsTrigger value="sites" disabled={!selectedCustomerId}>
            Sites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <CustomersTable
            selectedCustomerId={selectedCustomerId}
            onCustomerSelect={setSelectedCustomerId}
          />
        </TabsContent>

        <TabsContent value="regions">
          <RegionsTable selectedCustomerId={selectedCustomerId} />
        </TabsContent>

        <TabsContent value="sites">
          <SitesTable selectedCustomerId={selectedCustomerId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}