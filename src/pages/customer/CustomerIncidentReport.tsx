import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Customer } from "@/types/customer"
import { DUMMY_CUSTOMERS } from "@/data/customers"
import IncidentReportPage from "@/pages/operations/IncidentReportPage"
import { useAuth } from "@/hooks/useAuth"

export default function CustomerIncidentReport() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    try {
      const dummyCustomer = DUMMY_CUSTOMERS[0]
      if (!dummyCustomer?.viewConfig?.enabledPages.includes('incident-report')) {
        setError("You don't have access to this page")
        return
      }
      setCustomer(dummyCustomer)
    } catch (err) {
      setError("Failed to load customer data")
    } finally {
      setLoading(false)
    }
  }, [])

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
          onClick={() => navigate('/customer/reporting')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customer Reporting
        </Button>
        <h2 className="text-xl font-semibold">{customer?.companyName}</h2>
      </div>

      <IncidentReportPage 
        isCustomerView={true}
        customerId={customer?.id}
      />
    </div>
  )
} 