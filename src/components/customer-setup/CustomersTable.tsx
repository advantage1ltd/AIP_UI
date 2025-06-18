import { useState, useEffect, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { CustomerDialog } from "./CustomerDialog"
import { CustomerTableHeader } from "./table-components/CustomerTableHeader"
import { CustomerTableRow } from "./CustomerTableRow"
import { DUMMY_CUSTOMERS } from "@/data/customers"
import { TableActions } from "./table-components/TableActions"
import type { Customer } from "@/types/customer"

interface CustomersTableProps {
  onCustomerSelect: (customerId: string | null) => void
  selectedCustomerId: string | null
}

export function CustomersTable({ onCustomerSelect, selectedCustomerId }: CustomersTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>()
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const cleanup = useCallback(() => {
    setDialogOpen(false)
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

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setDialogOpen(true)
  }

  const handleSave = (updatedCustomer: Customer) => {
    // In a real app, this would be an API call
    console.log('Saving customer:', updatedCustomer)
    setDialogOpen(false)
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Customers</h2>
        <Button 
          onClick={() => {
            setSelectedCustomer(undefined)
            setDialogOpen(true)
          }}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Add Customer
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Company Number</TableHead>
              <TableHead>VAT Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DUMMY_CUSTOMERS.map((customer) => (
              <CustomerTableRow
                key={customer.id}
                customer={customer}
                isSelected={customer.id === selectedCustomerId}
                onSelect={onCustomerSelect}
                onEdit={handleEdit}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={selectedCustomer}
        onSave={handleSave}
      />
    </div>
  )
}