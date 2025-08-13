import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CustomersTable } from "@/components/customer-setup/CustomersTable"
import { RegionsTable } from "@/components/customer-setup/RegionsTable"
import { SitesTable } from "@/components/customer-setup/SitesTable"
import { CustomerStats } from "@/components/customer-setup/CustomerStats"
import { RefreshCw } from "lucide-react"
import { usePageAccess } from "@/contexts/PageAccessContext"

export default function CustomerSetup() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("customers")
  const [statsUpdateTrigger, setStatsUpdateTrigger] = useState(0)
  const { clearCacheAndReload } = usePageAccess()

  // Function to trigger stats update
  const updateStats = useCallback(() => {
    setStatsUpdateTrigger(prev => prev + 1)
  }, [])

  const handleCustomerSelect = useCallback((customerId: string | null) => {
    setSelectedCustomerId(customerId)
    updateStats() // Update stats when customer selection changes
  }, [updateStats])

  // Function to clear cache and reload
  const handleClearCache = async () => {
    try {
      await clearCacheAndReload()
      
      // Also clear customer store cache
      if ((window as any).customerDebug) {
        await (window as any).customerDebug.forceRefresh()
      }
      
      console.log('✅ Cache cleared and data reloaded')
    } catch (error) {
      console.error('❌ Error clearing cache:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customer Setup</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if ((window as any).customerDebug) {
                (window as any).customerDebug.listAllCustomers()
              }
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Debug Store
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Clear Cache
          </Button>
        </div>
      </div>

      <CustomerStats 
        selectedCustomerId={selectedCustomerId} 
        updateTrigger={statsUpdateTrigger}
      />

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
            onCustomerSelect={handleCustomerSelect}
            onDataChange={updateStats}
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