import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CUSTOMER_PAGES } from "@/config/customerPages"
import type { Customer } from "@/types/customer"
import useAuth from "@/hooks/useAuth"
import { RefreshCw } from "lucide-react"
import { customerOperations } from "@/mocks/customerStore"

export default function CustomerReporting() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [availablePages, setAvailablePages] = useState<string[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Refresh data when needed
  const refreshData = () => setRefreshTrigger(prev => prev + 1)

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true)
        
        // Load customer data from customer store (which uses cached data)
        let customerData = await customerOperations.getAll()
        
        // For officers, filter to only assigned customers
        if (user?.role === 'AdvantageOneOfficer') {
          const assignedCustomerIds = user.assignedCustomerIds || []
          customerData = customerData.filter((customer: any) => 
            assignedCustomerIds.includes(customer.id)
          )
          console.log('🔄 [CustomerReporting] Filtered customers for officer:', {
            assignedCustomerIds,
            filteredCount: customerData.length
          })
        }
        
        setCustomers(customerData)
        console.log('✅ [CustomerReporting] Loaded customers from store:', customerData.length)
        
      } catch (error) {
        console.error('❌ [CustomerReporting] Error loading customers from store:', error)
        setCustomers([])
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [user, refreshTrigger])

  // Listen for customer data updates to refresh data automatically
  useEffect(() => {
    const handleCustomerDataUpdate = (event: CustomEvent) => {
      console.log('🔄 [CustomerReporting] Received customer data update:', event.detail)
      refreshData()
    }

    window.addEventListener('customer-data-updated', handleCustomerDataUpdate as EventListener)
    
    return () => {
      window.removeEventListener('customer-data-updated', handleCustomerDataUpdate as EventListener)
    }
  }, [refreshData])

  useEffect(() => {
    if (!selectedCustomer) {
      setAvailablePages([])
      return
    }

    const customer = customers.find(c => c.id.toString() === selectedCustomer)
    if (customer) {
      // Get enabled pages from pageAssignments if available, fallback to viewConfig
      if (customer.pageAssignments) {
        const enabledPages = Object.entries(customer.pageAssignments)
          .filter(([_, assignment]) => (assignment as any).enabled)
          .map(([pageId]) => pageId)
        setAvailablePages(enabledPages)
        console.log('🔍 [CustomerReporting] Available pages from pageAssignments:', {
          customerId: customer.id,
          customerName: customer.companyName,
          enabledPages
        })
      } else if (customer.viewConfig?.enabledPages) {
        setAvailablePages(customer.viewConfig.enabledPages)
        console.log('🔍 [CustomerReporting] Available pages from viewConfig:', {
          customerId: customer.id,
          customerName: customer.companyName,
          enabledPages: customer.viewConfig.enabledPages
        })
      } else {
        setAvailablePages([])
        console.log('🔍 [CustomerReporting] No page assignments found for customer:', {
          customerId: customer.id,
          customerName: customer.companyName
        })
      }
    }
  }, [selectedCustomer, customers])

  const handlePageSelect = (pageId: string) => {
    const page = CUSTOMER_PAGES[pageId]
    if (page) {
      navigate(page.path)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  if (!loading && customers.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Customer Reporting</h1>
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              No customers are currently assigned to you.
              Please contact your administrator to get access to customer reports.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Customer Reporting</h1>
          <p className="text-muted-foreground">
            Select a customer to view their reports and metrics
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="w-full max-w-md">
        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
          <SelectTrigger>
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map(customer => (
              <SelectItem key={customer.id} value={customer.id.toString()}>
                {customer.companyName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCustomer && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availablePages.map(pageId => {
            const page = CUSTOMER_PAGES[pageId]
            if (!page) return null

            return (
              <Card
                key={pageId}
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handlePageSelect(pageId)}
              >
                <h3 className="font-semibold mb-2">{page.title}</h3>
                <p className="text-sm text-muted-foreground">{page.description}</p>
                {page.readOnly && (
                  <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Read Only
                  </span>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {selectedCustomer && availablePages.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No pages have been configured for this customer.
            Please contact your administrator to set up page access.
          </p>
        </div>
      )}
    </div>
  )
} 