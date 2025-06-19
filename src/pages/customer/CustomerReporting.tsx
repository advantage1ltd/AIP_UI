import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CUSTOMER_PAGES } from "@/config/customerPages"
import type { Customer } from "@/types/customer"
import { customerService } from "@/services/customerService"
import useAuth from "@/hooks/useAuth"

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
        // In a real app, this would be an API call
        const isAdmin = user?.role?.toLowerCase() === 'administrator' || 
                       user?.pageAccessRole?.toLowerCase() === 'administrator'

        const allCustomers = customerService.getAllCustomers()
        
        if (isAdmin) {
          setCustomers(allCustomers)
        } else {
          // Get assigned customers from user data
          const assignedCustomerIds = (user as any)?.assignedCustomers?.map((c: any) => c.id) || []
          const filteredCustomers = allCustomers.filter(c => 
            assignedCustomerIds.includes(c.id)
          )
          setCustomers(filteredCustomers)
        }
      } catch (error) {
        console.error('Error loading customers:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [user, refreshTrigger])

  useEffect(() => {
    if (!selectedCustomer) {
      setAvailablePages([])
      return
    }

    const customer = customers.find(c => c.id === selectedCustomer)
    if (customer) {
      // Get enabled pages from pageAssignments if available, fallback to viewConfig
      if (customer.pageAssignments) {
        const enabledPages = Object.entries(customer.pageAssignments)
          .filter(([_, assignment]) => assignment.enabled)
          .map(([pageId]) => pageId)
        setAvailablePages(enabledPages)
      } else if (customer.viewConfig) {
        setAvailablePages(customer.viewConfig.enabledPages)
      } else {
        setAvailablePages([])
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
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Customer Reporting</h1>
        <p className="text-muted-foreground">
          Select a customer to view their reports and metrics
        </p>
      </div>

      <div className="w-full max-w-md">
        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
          <SelectTrigger>
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map(customer => (
              <SelectItem key={customer.id} value={customer.id}>
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