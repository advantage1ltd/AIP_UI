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
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-gradient-to-br from-indigo-100/80 via-purple-50/80 to-pink-100/80">
      <div className="container mx-auto px-2 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#324053]">
              Customer Setup
            </h1>
            <p className="text-sm md:text-base text-gray-500">
              {selectedCustomerId 
                ? `Viewing details for ${DUMMY_CUSTOMERS.find(c => c.id === selectedCustomerId)?.companyName}`
                : 'Manage customer information, regions, and sites'}
            </p>
          </div>
        </div>

        {/* Customer Stats - Responsive Grid */}
        <div className="w-full overflow-hidden">
          <CustomerStats 
            customers={statsData.customers}
            regions={statsData.regions}
            sites={statsData.sites}
          />
        </div>

        {/* Main Content - Responsive Container */}
        <div className="w-full overflow-x-auto rounded-lg">
          <div className="min-w-[320px]">
            <Card className="bg-white/70 backdrop-blur-lg border border-gray-100 shadow-md">
              <CardContent className="p-2 md:p-4 lg:p-6">
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab} 
                  className="space-y-2 md:space-y-4"
                >
                  <TabsList className="bg-gray-100 w-full grid grid-cols-3 h-auto p-1">
                    <TabsTrigger 
                      value="customers" 
                      className="text-xs md:text-sm py-1.5 md:py-2"
                    >
                      Customers
                    </TabsTrigger>
                    <TabsTrigger 
                      value="regions" 
                      className="text-xs md:text-sm py-1.5 md:py-2"
                    >
                      Regions
                    </TabsTrigger>
                    <TabsTrigger 
                      value="sites" 
                      className="text-xs md:text-sm py-1.5 md:py-2"
                    >
                      Sites
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="customers" className="mt-2 md:mt-4">
                    <div className="overflow-x-auto">
                      <CustomersTable 
                        onCustomerSelect={setSelectedCustomerId}
                        selectedCustomerId={selectedCustomerId}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="regions" className="mt-2 md:mt-4">
                    <div className="overflow-x-auto">
                      <RegionsTable 
                        selectedCustomerId={selectedCustomerId} 
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="sites" className="mt-2 md:mt-4">
                    <div className="overflow-x-auto">
                      <SitesTable 
                        selectedCustomerId={selectedCustomerId} 
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerSetup