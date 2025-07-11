import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CUSTOMER_PAGES } from "@/config/customerPages"
import type { Customer } from "@/types/customer"
import { BASE_API_URL } from "@/config/api"
import useAuth from "@/hooks/useAuth"
import { RefreshCw } from "lucide-react"

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
        const isAdmin = user?.role?.toLowerCase() === 'administrator' || 
                       user?.pageAccessRole?.toLowerCase() === 'administrator'

        if (isAdmin) {
          // For admin users, fetch all customers via API
          const response = await fetch(`${BASE_API_URL}/customers`)
          const result = await response.json()
          
          if (result.success && result.data) {
            setCustomers(result.data)
          } else {
            throw new Error('Failed to fetch customers')
          }
        } else {
          // For officers, use the same approach as CustomerReportingPage
          // This fetches customers that are already filtered based on current assignments
          let assignedCustomerIds: string[] = []
          
          if (user?.role === 'AdvantageOneOfficer') {
            try {
              // Fetch fresh user data to get latest assignments
              const userResponse = await fetch(`${BASE_API_URL}/users/${user.id}`)
              if (userResponse.ok) {
                const userData = await userResponse.json()
                assignedCustomerIds = userData.data?.assignedCustomerIds?.map((id: number) => id.toString()) || []
                console.log('🔄 [CustomerReporting] Fetched fresh assignment data:', {
                  userId: user.id,
                  cachedAssignments: 'assignedCustomerIds' in user ? user.assignedCustomerIds : 'none',
                  freshAssignments: assignedCustomerIds
                })
              } else {
                console.warn('🔄 [CustomerReporting] Failed to fetch fresh assignments')
                assignedCustomerIds = []
              }
            } catch (fetchError) {
              console.warn('🔄 [CustomerReporting] Error fetching fresh assignments:', fetchError)
              assignedCustomerIds = []
            }
          }

          // Build API URL with proper parameters
          const params = new URLSearchParams({
            userId: user?.id || '',
            role: user?.role || ''
          })

          // Add fresh assigned customer IDs for officers
          if (user?.role === 'AdvantageOneOfficer' && assignedCustomerIds.length > 0) {
            params.append('assignedCustomerIds', assignedCustomerIds.join(','))
          }

          // Fetch customers based on user role and fresh assignments
          const response = await fetch(`${BASE_API_URL}/customers/reporting?${params.toString()}`)
          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch customer reporting data')
          }

          setCustomers(data.data || [])
        }
      } catch (error) {
        console.error('Error loading customers:', error)
        setCustomers([])
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [user, refreshTrigger])

  // Listen for user assignment updates to refresh data automatically
  useEffect(() => {
    const handleAssignmentUpdate = (event: CustomEvent) => {
      const { userId, newAssignments } = event.detail
      
      // Only refresh if this is the current user's assignment that was updated
      if (user?.id === userId) {
        console.log('🔄 [CustomerReporting] Received assignment update for current user:', {
          userId,
          newAssignments,
          currentUser: user.id
        })
        refreshData()
      }
    }

    window.addEventListener('user-assignments-updated', handleAssignmentUpdate as EventListener)
    
    return () => {
      window.removeEventListener('user-assignments-updated', handleAssignmentUpdate as EventListener)
    }
  }, [user?.id, refreshData])

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