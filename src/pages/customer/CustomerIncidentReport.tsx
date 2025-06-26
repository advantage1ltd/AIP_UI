import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import IncidentReportPage from "@/pages/operations/IncidentReportPage"
import { useAuth } from "@/hooks/useAuth"
import { AVAILABLE_CUSTOMERS } from "@/types/user"

export default function CustomerIncidentReport() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<typeof AVAILABLE_CUSTOMERS[0] | null>(null)

  useEffect(() => {
    try {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // Get customer ID from URL parameter or user's customerId
      const urlCustomerId = searchParams.get('customerId')
      const targetCustomerId = urlCustomerId ? parseInt(urlCustomerId) : user?.customerId

      console.log('CustomerIncidentReport: URL customerId:', urlCustomerId)
      console.log('CustomerIncidentReport: User customerId:', user?.customerId)
      console.log('CustomerIncidentReport: Target customerId:', targetCustomerId)

      if (!targetCustomerId) {
        setError("No customer ID found")
        return
      }

      const customerData = AVAILABLE_CUSTOMERS.find(c => c.id === targetCustomerId)
      console.log('CustomerIncidentReport: Found customer:', customerData)
      
      if (!customerData) {
        setError("Customer not found")
        return
      }
      
      console.log('CustomerIncidentReport: Access granted - setting customer')
      setCustomer(customerData)
    } catch (err) {
      console.error('CustomerIncidentReport: Error loading customer:', err)
      setError("Failed to load customer data")
    } finally {
      setLoading(false)
    }
  }, [user?.customerId, authLoading, searchParams])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-xl font-semibold">{customer?.name}</h2>
      </div>

      <IncidentReportPage 
        isCustomerView={true}
        customerId={customer?.id.toString()}
      />
    </div>
  )
} 