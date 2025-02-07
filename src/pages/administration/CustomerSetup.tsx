import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomersTable } from "@/components/customer-setup/CustomersTable"
import { RegionsTable } from "@/components/customer-setup/RegionsTable"
import { SitesTable } from "@/components/customer-setup/SitesTable"
import { CustomerStats } from "@/components/customer-setup/CustomerStats"
import { Card, CardContent } from "@/components/ui/card"
import { DUMMY_CUSTOMERS } from "@/data/customers"
import { DUMMY_REGIONS } from "@/data/regions"
import { DUMMY_SITES } from "@/data/sites"

const CustomerSetup = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("customers")

  // Get filtered data based on selected customer
  const filteredRegions = selectedCustomerId 
    ? DUMMY_REGIONS.filter(region => region.customerId === selectedCustomerId)
    : DUMMY_REGIONS

  const filteredSites = selectedCustomerId
    ? DUMMY_SITES.filter(site => site.customerId === selectedCustomerId)
    : DUMMY_SITES

  // Get stats data
  const statsData = {
    customers: selectedCustomerId 
      ? DUMMY_CUSTOMERS.filter(customer => customer.id === selectedCustomerId)
      : DUMMY_CUSTOMERS,
    regions: filteredRegions,
    sites: filteredSites
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="space-y-8 p-6 md:p-8 lg:p-12 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[#324053]">
              Customer Setup
            </h1>
            <p className="text-gray-500">
              {selectedCustomerId 
                ? `Viewing details for ${DUMMY_CUSTOMERS.find(c => c.id === selectedCustomerId)?.companyName}`
                : 'Manage customer information, regions, and sites'}
            </p>
          </div>
        </div>

        <CustomerStats 
          customers={statsData.customers}
          regions={statsData.regions}
          sites={statsData.sites}
        />

        <Card className="bg-white/70 backdrop-blur-lg border-none shadow-lg">
          <CardContent className="p-6">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="space-y-4"
            >
              <TabsList className="bg-gray-100">
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="regions">Regions</TabsTrigger>
                <TabsTrigger value="sites">Sites</TabsTrigger>
              </TabsList>
              <TabsContent value="customers">
                <CustomersTable 
                  onCustomerSelect={setSelectedCustomerId}
                  selectedCustomerId={selectedCustomerId}
                />
              </TabsContent>
              <TabsContent value="regions">
                <RegionsTable selectedCustomerId={selectedCustomerId} />
              </TabsContent>
              <TabsContent value="sites">
                <SitesTable selectedCustomerId={selectedCustomerId} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CustomerSetup