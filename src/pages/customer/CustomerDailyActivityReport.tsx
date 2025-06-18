import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { CustomerWithRelations } from "@/types/customer"
import { BASE_API_URL } from "@/config/api"

export default function CustomerDailyActivityReport() {
  const navigate = useNavigate()
  const { customerId } = useParams<{ customerId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<CustomerWithRelations | null>(null)

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) {
        setError("Customer ID is required")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${BASE_API_URL}/customers/${customerId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch customer')
        }

        const customerData = data.data
        
        // Check if customer has access to this page
        if (!customerData.pageAssignments?.['daily-activity']?.enabled) {
          setError("You don't have access to this page for this customer")
          return
        }
        
        setCustomer(customerData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load customer data")
      } finally {
        setLoading(false)
      }
    }

    fetchCustomer()
  }, [customerId])

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
          onClick={() => navigate('/management/customer-reporting')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customer Reporting
        </Button>
        <Card className="p-4">
          <p className="text-red-600">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/management/customer-reporting')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customer Reporting
        </Button>
        <h2 className="text-xl font-semibold">{customer?.companyName}</h2>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Daily Activity Report</h1>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Customer Information</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Company:</strong> {customer?.companyName}</p>
              <p><strong>Customer ID:</strong> {customerId}</p>
              <p><strong>Type:</strong> {Array.isArray(customer?.customerType) ? customer?.customerType.join(', ') : customer?.customerType}</p>
              <p><strong>Sites:</strong> {customer?.sites?.length || 0}</p>
            </div>
          </div>
          
          <p className="text-muted-foreground">
            This is the daily activity report for <strong>{customer?.companyName}</strong>.
            In a real application, this would show the daily activity logs,
            security checks, patrol reports, and other relevant information specific to this customer.
          </p>
          
          {/* Add more customer-specific content here */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <h4 className="font-medium mb-2">Recent Activities</h4>
              <p className="text-sm text-muted-foreground">
                Recent security activities and reports for this customer would appear here.
              </p>
            </Card>
            <Card className="p-4">
              <h4 className="font-medium mb-2">Security Metrics</h4>
              <p className="text-sm text-muted-foreground">
                Key performance indicators and security metrics would be displayed here.
              </p>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  )
} 