import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Customer } from "@/types/customer"
import { DUMMY_CUSTOMERS } from "@/data/customers"
import CustomerSatisfactionPage from "@/pages/operations/CustomerSatisfactionPage"
import { useAuth } from "@/hooks/useAuth"

export default function CustomerSatisfactionReport() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)

  console.log('CustomerSatisfactionReport: Component rendered')

  useEffect(() => {
    console.log('CustomerSatisfactionReport: useEffect called')
    try {
      const dummyCustomer = DUMMY_CUSTOMERS[0]
      console.log('CustomerSatisfactionReport: Dummy customer:', dummyCustomer)
      console.log('CustomerSatisfactionReport: Enabled pages:', dummyCustomer?.viewConfig?.enabledPages)
      
      if (!dummyCustomer?.viewConfig?.enabledPages.includes('customer-satisfaction')) {
        console.log('CustomerSatisfactionReport: Access denied - customer-satisfaction not in enabled pages')
        setError('Access to satisfaction reports is not enabled for this customer')
        return
      }
      console.log('CustomerSatisfactionReport: Access granted - setting customer')
      setCustomer(dummyCustomer)
    } catch (error) {
      console.error('CustomerSatisfactionReport: Error loading customer:', error)
      setError('Failed to load customer data')
    } finally {
      console.log('CustomerSatisfactionReport: Setting loading to false')
      setLoading(false)
    }
  }, [])

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
        customerId={customer?.id}
      />
    </div>
  )
} 