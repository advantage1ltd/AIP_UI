import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Customer, CustomerPageId } from "@/types/customer"
import { CUSTOMER_PAGES } from "@/config/customerPages"
import { cn } from "@/lib/utils"
import { FileText, ClipboardList, Shield, Star, Calendar, Wrench, BarChart, FileCheck, Building, ArrowLeft } from "lucide-react"
import { customerOperations } from "@/mocks/customerStore"

interface CustomerReportingSectionProps {
  customers: Customer[]
  onNavigate: (customerId: string, pageId: CustomerPageId) => void
}

const PAGE_ICONS = {
  'incident-report': FileText,
  'daily-activity': ClipboardList,
  'incident-graph': BarChart,
  'customer-satisfaction': Star,
  'be-safe-be-secure': Shield,
} as const

export function CustomerReportingSection({ customers, onNavigate }: CustomerReportingSectionProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
  }

  const handleBack = () => {
    setSelectedCustomer(null)
  }

  if (selectedCustomer) {
    // Get enabled pages from pageAssignments if available, fallback to viewConfig
    let enabledPages: string[] = []
    
    if (selectedCustomer.pageAssignments) {
      enabledPages = Object.entries(selectedCustomer.pageAssignments)
        .filter(([_, assignment]) => (assignment as any).enabled)
        .map(([pageId]) => pageId)
    } else if (selectedCustomer.viewConfig?.enabledPages) {
      enabledPages = selectedCustomer.viewConfig.enabledPages
    }
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Customers
          </Button>
          <h2 className="text-xl font-semibold">{selectedCustomer.companyName}</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enabledPages.map(pageId => {
                const page = CUSTOMER_PAGES[pageId as CustomerPageId]
                if (!page) return null
                const Icon = PAGE_ICONS[pageId as keyof typeof PAGE_ICONS] || FileText
                return (
                  <Button
                    key={pageId}
                    variant="outline"
                    className={cn(
                      "h-auto p-4 flex flex-col items-center text-center gap-2",
                      "hover:bg-purple-50 hover:border-purple-200 transition-colors"
                    )}
                    onClick={() => onNavigate(String(selectedCustomer.id), pageId as CustomerPageId)}
                  >
                    <Icon className="h-6 w-6 text-purple-600" />
                    <div>
                      <h3 className="font-medium">{page.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{page.description}</p>
                    </div>
                    {page.readOnly && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Read Only
                      </span>
                    )}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Customer Reporting</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map(customer => {
          // Get enabled pages count from pageAssignments if available, fallback to viewConfig
          let availablePagesCount = 0
          
          if (customer.pageAssignments) {
            availablePagesCount = Object.entries(customer.pageAssignments)
              .filter(([_, assignment]) => (assignment as any).enabled)
              .length
          } else if (customer.viewConfig?.enabledPages) {
            availablePagesCount = customer.viewConfig.enabledPages.length
          }
          
          return (
            <Button
              key={customer.id}
              variant="outline"
              className={cn(
                "h-auto p-4 flex flex-col items-center text-center gap-2",
                "hover:bg-purple-50 hover:border-purple-200 transition-colors"
              )}
              onClick={() => handleCustomerSelect(customer)}
            >
              <Building className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="font-medium">{customer.companyName}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {customer.address.town}, {customer.address.county}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {availablePagesCount} Reports Available
                </p>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
} 