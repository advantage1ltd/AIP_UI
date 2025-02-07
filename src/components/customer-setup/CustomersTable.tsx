import { useState, useEffect, useCallback } from "react"
import { Table, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
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
    <div className="space-y-4">
      <TableActions 
        title="Customers"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNew={handleNewCustomer}
        searchPlaceholder="Search customers..."
        newButtonText="New Customer"
      />

      <div className="rounded-lg border bg-white shadow">
        <Table>
          <CustomerTableHeader />
          <TableBody>
            {filteredCustomers.map((customer) => (
              <CustomerTableRow 
                key={customer.id}
                customer={customer}
                isSelected={selectedRows.includes(customer.id)}
                onSelect={toggleRowSelection}
                onEdit={handleEditCustomer}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <CustomerDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        customer={selectedCustomer}
      />
    </div>
  )
}