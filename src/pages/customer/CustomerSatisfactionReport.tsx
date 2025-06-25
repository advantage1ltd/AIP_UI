import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import CustomerSatisfactionPage from "@/pages/operations/CustomerSatisfactionPage"
import { useAuth } from "@/hooks/useAuth"
import { AVAILABLE_CUSTOMERS } from "@/types/user"

export default function CustomerSatisfactionReport() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<typeof AVAILABLE_CUSTOMERS[0] | null>(null)

  console.log('CustomerSatisfactionReport: Component rendered')

  useEffect(() => {
    console.log('CustomerSatisfactionReport: useEffect called')
    try {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // Use authenticated user's customer ID
      if (!user?.customerId) {
        setError("No customer ID found for user")
        return
      }

      const customerData = AVAILABLE_CUSTOMERS.find(c => c.id === user.customerId)
      console.log('CustomerSatisfactionReport: Target customer ID:', user.customerId)
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
  }, [user?.customerId, authLoading])

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