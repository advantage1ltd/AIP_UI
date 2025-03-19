import { useState, useEffect, useCallback } from "react"
import { Table, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { CustomerDialog } from "./CustomerDialog"
import { CustomerTableHeader } from "./table-components/CustomerTableHeader"
import { CustomerTableRow } from "./table-components/CustomerTableRow"
import { DUMMY_CUSTOMERS } from "@/data/customers"
import { TableActions } from "./table-components/TableActions"

interface CustomersTableProps {
  onCustomerSelect: (customerId: string | null) => void
  selectedCustomerId: string | null
}

export function CustomersTable({ onCustomerSelect, selectedCustomerId }: CustomersTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any | undefined>()
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const cleanup = useCallback(() => {
    setIsDialogOpen(false)
    setSelectedCustomer(undefined)
    setSelectedRows([])
  }, [])

  useEffect(() => {
    console.log("CustomersTable mounted")
    return () => {
      console.log("CustomersTable unmounting")
      cleanup()
    }
  }, [cleanup])

  // Cleanup when component becomes hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanup()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [cleanup])

  const handleNewCustomer = () => {
    setSelectedCustomer(undefined)
    setIsDialogOpen(true)
  }

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setIsDialogOpen(true)
  }

  // Filter customers based on search query
  const filteredCustomers = DUMMY_CUSTOMERS.filter(customer => {
    const searchLower = searchQuery.toLowerCase()
    return (
      customer.companyName.toLowerCase().includes(searchLower) ||
      customer.contact.email.toLowerCase().includes(searchLower) ||
      customer.contact.phone.toLowerCase().includes(searchLower) ||
      customer.address.town.toLowerCase().includes(searchLower) ||
      customer.status.toLowerCase().includes(searchLower)
    )
  })
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex)

  const toggleRowSelection = (customerId: string) => {
    if (selectedRows.includes(customerId)) {
      setSelectedRows([])
      onCustomerSelect(null)
    } else {
      setSelectedRows([customerId])
      onCustomerSelect(customerId)
    }
  }

  return (
    <div className="space-y-2 md:space-y-4">
      <TableActions 
        title="Customers"
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1) // Reset to first page on search
        }}
        onNew={handleNewCustomer}
        searchPlaceholder="Search customers..."
        newButtonText="New Customer"
      />

      <div className="rounded-lg border bg-white/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <CustomerTableHeader />
            <TableBody>
              {currentCustomers.length > 0 ? (
                currentCustomers.map((customer) => (
                  <CustomerTableRow 
                    key={customer.id}
                    customer={customer}
                    isSelected={selectedRows.includes(customer.id)}
                    onSelect={toggleRowSelection}
                    onEdit={handleEditCustomer}
                  />
                ))
              ) : (
                <tr className="h-16">
                  <td colSpan={7} className="text-center text-xs md:text-sm text-gray-500">
                    {searchQuery ? 'No matching customers found' : 'No customers found'}
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination */}
      {filteredCustomers.length > itemsPerPage && (
        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-gray-500">
            Showing {Math.min(filteredCustomers.length, startIndex + 1)}-{Math.min(filteredCustomers.length, endIndex)} of {filteredCustomers.length}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="sr-only">Previous page</span>
            </Button>
            <div className="text-xs px-2">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}

      <CustomerDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        customer={selectedCustomer}
      />
    </div>
  )
}