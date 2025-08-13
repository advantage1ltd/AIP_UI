import { useState, useEffect, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Plus, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CustomerDialog } from "./CustomerDialog"
import { CustomerTableRow } from "./CustomerTableRow"
import { customerService } from "@/services/customerService"
import type { Customer } from "@/types/customer"

interface CustomersTableProps {
  onCustomerSelect: (customerId: string | null) => void
  selectedCustomerId: string | null
  onDataChange?: () => void
}

export function CustomersTable({ onCustomerSelect, selectedCustomerId, onDataChange }: CustomersTableProps) {
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>()
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const itemsPerPage = 10

  const cleanup = useCallback(() => {
    setDialogOpen(false)
    setSelectedCustomer(undefined)
    setSelectedRows([])
    setDeleteDialogOpen(false)
    setCustomerToDelete(null)
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
    if (!customer) {
      toast({
        title: "Error",
        description: "Unable to load customer data for editing.",
        variant: "destructive"
      })
      return
    }
    
    setSelectedCustomer(customer)
    setDialogOpen(true)
  }

  const handleDelete = (customer: Customer) => {
    console.log('🔧 [CustomersTable] handleDelete called for customer:', {
      id: customer.id,
      name: customer.companyName,
      idType: typeof customer.id,
      idString: String(customer.id)
    })
    setCustomerToDelete(customer)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (customerToDelete) {
      try {
        console.log('🔧 [CustomersTable] confirmDelete - attempting to delete customer:', {
          id: customerToDelete.id,
          name: customerToDelete.companyName,
          idType: typeof customerToDelete.id
        })
        
        const response = await fetch(`/api/customers/${customerToDelete.id}`, {
          method: 'DELETE',
        })
        const result = await response.json()
        
        console.log('🔧 [CustomersTable] confirmDelete - API response:', result)
        
        if (result.success) {
          // If the deleted customer was selected, clear the selection
          if (selectedCustomerId === String(customerToDelete.id)) {
            onCustomerSelect(null)
          }
          
          toast({
            title: "Customer Deleted",
            description: result.message || `Customer has been successfully deleted.`,
            variant: "default"
          })
          
          forceUpdate()
          onDataChange?.() // Notify parent of data change
        } else {
          throw new Error(result.message || 'Failed to delete customer')
        }
      } catch (error) {
        console.error('❌ [CustomersTable] confirmDelete - error:', error)
        toast({
          title: "Delete Failed",
          description: error instanceof Error ? error.message : "Failed to delete customer. Please try again.",
          variant: "destructive"
        })
      }
      
      setDeleteDialogOpen(false)
      setCustomerToDelete(null)
    }
  }

  const handleSave = async (updatedCustomer: Customer) => {
    try {
      console.log('🔧 [CustomersTable] handleSave - received customer data:', {
        id: updatedCustomer.id,
        companyName: updatedCustomer.companyName,
        pageAssignmentsCount: Object.keys(updatedCustomer.pageAssignments || {}).length,
        enabledPagesCount: updatedCustomer.viewConfig?.enabledPages?.length || 0,
        pageAssignments: updatedCustomer.pageAssignments,
        enabledPages: updatedCustomer.viewConfig?.enabledPages
      })
      
      // Determine if this is a new customer based on ID
      // New customers have IDs starting with 'CUST' (temporary IDs)
      // Existing customers have numeric IDs from the database
      const idString = String(updatedCustomer.id || '')
      const isNew = idString.startsWith('CUST')
      
      console.log('🔧 [CustomersTable] handleSave - customer type:', { 
        id: updatedCustomer.id, 
        idString, 
        isNew 
      })
      
      let result
      if (isNew) {
        // Create new customer via API
        console.log('🔧 [CustomersTable] handleSave - creating new customer')
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedCustomer),
        })
        result = await response.json()
      } else {
        // Update existing customer via API
        console.log('🔧 [CustomersTable] handleSave - updating existing customer')
        const response = await fetch(`/api/customers/${String(updatedCustomer.id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedCustomer),
        })
        result = await response.json()
      }
      
      console.log('🔧 [CustomersTable] handleSave - API response:', result)
      
      if (result.success) {
        toast({
          title: isNew ? "Customer Created" : "Customer Updated",
          description: result.message || `${updatedCustomer.companyName} has been successfully ${isNew ? 'created' : 'updated'}.`,
          variant: "default"
        })
        
        setDialogOpen(false)
        forceUpdate()
        onDataChange?.() // Notify parent of data change
      } else {
        throw new Error(result.message || 'Failed to save customer')
      }
    } catch (error) {
      console.error('❌ [CustomersTable] handleSave - error:', error)
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save customer. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Force re-render function to reflect data changes
  const [updateTrigger, setUpdateTrigger] = useState(0)
  const forceUpdate = () => setUpdateTrigger(prev => prev + 1)

  // Get customers from API and filter based on search query
  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoadingCustomers(true)
        const response = await fetch('/api/customers')
        const result = await response.json()
        
        if (result.success) {
          setAllCustomers(result.data || [])
        } else {
          console.error('Failed to fetch customers:', result.message)
          setAllCustomers([])
        }
      } catch (error) {
        console.error('Error fetching customers:', error)
        setAllCustomers([])
      } finally {
        setIsLoadingCustomers(false)
      }
    }

    fetchCustomers()
  }, [updateTrigger])

  // Listen for customer events to refresh data
  useEffect(() => {
    const handleCustomerEvent = () => {
      forceUpdate()
    }

    window.addEventListener('customer-created', handleCustomerEvent)
    window.addEventListener('customer-updated', handleCustomerEvent)
    window.addEventListener('customer-deleted', handleCustomerEvent)
    
    return () => {
      window.removeEventListener('customer-created', handleCustomerEvent)
      window.removeEventListener('customer-updated', handleCustomerEvent)
      window.removeEventListener('customer-deleted', handleCustomerEvent)
    }
  }, [])

  const filteredCustomers = allCustomers.filter(customer => {
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
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
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
            {isLoadingCustomers ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600" />
                    <span>Loading customers...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : currentCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {searchQuery ? (
                    <>
                      No customers found matching "{searchQuery}"
                      <br />
                      <span className="text-sm">Try adjusting your search terms</span>
                    </>
                  ) : (
                    <>
                      No customers available
                      <br />
                      <span className="text-sm">Click "Add Customer" to create your first customer</span>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              currentCustomers.map((customer) => (
                <CustomerTableRow
                  key={customer.id}
                  customer={customer}
                  isSelected={String(customer.id) === selectedCustomerId}
                  onSelect={onCustomerSelect}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length} customers
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={selectedCustomer}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{customerToDelete?.companyName}"? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}