import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { CustomerViewConfig } from "@/components/customer-setup/CustomerViewConfig"
import { useToast } from "@/hooks/use-toast"
import type { Customer, CustomerViewConfig as CustomerViewConfigType } from "@/types/customer"
import { BASE_API_URL } from "@/config/api"
import { CUSTOMER_PAGES } from "@/config/customerPages"

export default function CustomerViewsConfig() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true)
  
  const selectedCustomer = customers.find(c => c.id.toString() === selectedCustomerId)

  // Load customers from db.json via API
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoadingCustomers(true)
        const response = await fetch(`${BASE_API_URL}/customers`)
        const result = await response.json()
        
        if (result.success && result.data) {
          setCustomers(result.data)
          // Auto-select first customer if available
          if (result.data.length > 0 && !selectedCustomerId) {
            setSelectedCustomerId(result.data[0].id.toString())
          }
          console.log('✅ [CustomerViewsConfig] Loaded customers from db.json:', result.data.length)
        } else {
          throw new Error('Failed to load customers')
        }
      } catch (error) {
        console.error('❌ [CustomerViewsConfig] Failed to load customers:', error)
        toast({
          title: "Loading Failed",
          description: "Failed to load customer data. Please refresh the page.",
          variant: "destructive"
        })
      } finally {
        setIsLoadingCustomers(false)
      }
    }

    loadCustomers()
  }, [])

  const handleSaveConfig = async (config: Partial<CustomerViewConfigType>) => {
    if (!selectedCustomer) return

    setIsLoading(true)
    try {
      // Convert enabled pages to page assignments format
      const pageAssignments: Record<string, any> = {}
      
      // Set all pages to disabled first
      Object.keys(CUSTOMER_PAGES).forEach(pageId => {
        pageAssignments[pageId] = { enabled: false }
      })
      
      // Then enable the selected pages
      config.enabledPages?.forEach(pageId => {
        pageAssignments[pageId] = { enabled: true }
      })

      const response = await fetch(`${BASE_API_URL}/customers/${selectedCustomer.id}/page-assignments`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ pageAssignments })
      })

      if (!response.ok) {
        throw new Error('Failed to save configuration')
      }

      const result = await response.json()
      
      if (result.success) {
        // Update local customer data
        const updatedCustomers = customers.map(customer => 
          customer.id === selectedCustomer.id 
            ? { ...customer, viewConfig: { ...customer.viewConfig, ...config } }
            : customer
        )
        setCustomers(updatedCustomers)

        toast({
          title: "Configuration Saved",
          description: `Page configuration has been successfully updated for ${selectedCustomer.companyName}.`,
        })

        // Dispatch custom event to notify other pages of the configuration update
        window.dispatchEvent(new CustomEvent('customer-config-updated', {
          detail: { customerId: selectedCustomer.id, customerName: selectedCustomer.companyName }
        }))

        console.log('✅ [CustomerViewsConfig] Configuration updated in db.json:', {
          customerId: selectedCustomer.id,
          enabledPages: config.enabledPages
        })
      } else {
        throw new Error(result.message || 'Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving configuration:', error)
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save page configuration. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isAdmin = user?.role === 'Administrator'

  // Don't render until user is loaded
  if (!user) {
    return <div>Loading...</div>
  }

  if (isLoadingCustomers) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <span className="ml-3">Loading customers from database...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Configure Customer Views</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {isAdmin ? 
              'Configure which pages are available for each customer (Data loaded from db.json)' : 
              'View customer page configurations (Administrator access required to modify)'
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isAdmin && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                You are viewing this page in read-only mode. Only administrators can modify customer page configurations.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Customer</label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="w-[300px]">
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
            <CustomerViewConfig
              customerId={selectedCustomer.id}
              initialConfig={selectedCustomer.viewConfig}
              onSave={handleSaveConfig}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
} 