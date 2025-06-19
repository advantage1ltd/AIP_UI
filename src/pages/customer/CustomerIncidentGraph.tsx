import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Customer } from "@/types/customer"
import { DUMMY_CUSTOMERS } from "@/data/customers"
import IncidentGraph from "./IncidentGraph"

export default function CustomerIncidentGraph() {
  const navigate = useNavigate()
  const { customerId } = useParams<{ customerId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    try {
      // If no customerId in URL, use the first customer (backwards compatibility)
      const targetCustomerId = customerId || "1"
      const dummyCustomer = DUMMY_CUSTOMERS.find(c => c.id === targetCustomerId)
      
      if (!dummyCustomer) {
        setError("Customer not found")
        return
      }
      
      if (!dummyCustomer?.viewConfig?.enabledPages.includes('incident-graph')) {
        setError("You don't have access to this page")
        return
      }
      setCustomer(dummyCustomer)
    } catch (err) {
      setError("Failed to load customer data")
    } finally {
      setLoading(false)
    }
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
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
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
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-xl font-semibold">{customer?.companyName}</h2>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Incident Graph</h1>
        <IncidentGraph 
          customerId={customer?.id} 
          customerName={customer?.companyName} 
        />
      </Card>
    </div>
  )
} 