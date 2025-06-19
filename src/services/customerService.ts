import type { Customer } from "@/types/customer"
import { DUMMY_CUSTOMERS } from "@/data/customers"

export const customerService = {
  // Update a customer in the DUMMY_CUSTOMERS array
  updateCustomer: (updatedCustomer: Customer): { success: boolean; customer?: Customer; isNew?: boolean; error?: string } => {
    try {
      const customerIndex = DUMMY_CUSTOMERS.findIndex(c => c.id === updatedCustomer.id)
      
      if (customerIndex !== -1) {
        // Update existing customer
        DUMMY_CUSTOMERS[customerIndex] = {
          ...updatedCustomer,
          updatedAt: new Date().toISOString()
        }
        console.log('Updated customer:', updatedCustomer)
        return { success: true, customer: DUMMY_CUSTOMERS[customerIndex], isNew: false }
      } else {
        // Add new customer
        const newCustomer = {
          ...updatedCustomer,
          createdAt: updatedCustomer.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        DUMMY_CUSTOMERS.push(newCustomer)
        console.log('Added new customer:', newCustomer)
        return { success: true, customer: newCustomer, isNew: true }
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      return { success: false, error: 'Failed to save customer data' }
    }
  },

  // Get a customer by ID
  getCustomer: (id: string): Customer | undefined => {
    return DUMMY_CUSTOMERS.find(c => c.id === id)
  },

  // Get all customers
  getAllCustomers: (): Customer[] => {
    return DUMMY_CUSTOMERS
  },

  // Delete a customer
  deleteCustomer: (customerId: string): { success: boolean; customerName?: string; error?: string } => {
    try {
      const customerIndex = DUMMY_CUSTOMERS.findIndex(c => c.id === customerId)
      
      if (customerIndex === -1) {
        return { success: false, error: 'Customer not found' }
      }

      const deletedCustomer = DUMMY_CUSTOMERS[customerIndex]
      DUMMY_CUSTOMERS.splice(customerIndex, 1)
      console.log('Deleted customer:', deletedCustomer)
      return { success: true, customerName: deletedCustomer.companyName }
    } catch (error) {
      console.error('Error deleting customer:', error)
      return { success: false, error: 'Failed to delete customer' }
    }
  },

  // Update customer page assignments specifically
  updateCustomerPageAssignments: (customerId: string, pageAssignments: Record<string, any>): Customer | null => {
    const customerIndex = DUMMY_CUSTOMERS.findIndex(c => c.id === customerId)
    
    if (customerIndex === -1) {
      return null
    }

    // Update page assignments and sync with viewConfig.enabledPages
    const enabledPages = Object.keys(pageAssignments).filter(pageId => pageAssignments[pageId].enabled)
    
    DUMMY_CUSTOMERS[customerIndex] = {
      ...DUMMY_CUSTOMERS[customerIndex],
      pageAssignments,
      viewConfig: {
        ...DUMMY_CUSTOMERS[customerIndex].viewConfig,
        enabledPages,
        updatedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    }

    console.log('Updated customer page assignments:', DUMMY_CUSTOMERS[customerIndex])
    return DUMMY_CUSTOMERS[customerIndex]
  }
} 