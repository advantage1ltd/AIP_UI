import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import CustomerSatisfactionPage from "@/pages/operations/CustomerSatisfactionPage"
import { useAuth } from "@/contexts/AuthContext"
import { findCustomerById } from "@/hooks/useAvailableCustomers"

export default function CustomerSatisfactionReport() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<{ id: number; name: string } | null>(null)

  console.log('CustomerSatisfactionReport: Component rendered')

  useEffect(() => {
    console.log('CustomerSatisfactionReport: useEffect called')
    try {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // Get customer ID from URL parameter or user's customerId (for customer users)
      const urlCustomerId = searchParams.get('customerId')
      const userCustomerId = user && ('customerId' in user) ? (user as any).customerId : undefined
      const targetCustomerId = urlCustomerId ? parseInt(urlCustomerId) : userCustomerId

      console.log('CustomerSatisfactionReport: URL customerId:', urlCustomerId)
      console.log('CustomerSatisfactionReport: User customerId:', userCustomerId)
      console.log('CustomerSatisfactionReport: Target customerId:', targetCustomerId)

      if (!targetCustomerId) {
        setError("No customer ID found")
        return
      }

      const customerData = findCustomerById(targetCustomerId)
      console.log('CustomerSatisfactionReport: Found customer:', customerData)
      
      if (!customerData) {
        setError("Customer not found")
        return
      }
      
      console.log('CustomerSatisfactionReport: Access granted - setting customer')
      setCustomer(customerData)
    } catch (error) {
      console.error('CustomerSatisfactionReport: Error loading customer:', error)
      setError('Failed to load customer data')
    } finally {
      console.log('CustomerSatisfactionReport: Setting loading to false')
      setLoading(false)
    }
  }, [user, authLoading, searchParams])

  console.log('CustomerSatisfactionReport: Render state:', { loading, error, customer: !!customer })

  if (loading) {
    console.log('CustomerSatisfactionReport: Rendering loading state')
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  if (error) {
    console.log('CustomerSatisfactionReport: Rendering error state:', error)
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  console.log('CustomerSatisfactionReport: Rendering CustomerSatisfactionPage with customer:', customer?.id)
  return (
    <div>
      <div className="p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      <CustomerSatisfactionPage 
        isCustomerView={true}
        customerId={customer?.id.toString()}
      />
    </div>
  )
} 