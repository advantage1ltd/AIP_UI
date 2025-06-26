import type { Customer } from "@/types/customer"
import { DUMMY_CUSTOMERS } from "@/data/customers"

// Dynamic available customers management
let dynamicAvailableCustomers: Array<{ id: number; name: string }> = [];

// Initialize from existing customers
const initializeAvailableCustomers = () => {
  dynamicAvailableCustomers = DUMMY_CUSTOMERS.map(customer => ({
    id: parseInt(customer.id),
    name: customer.companyName
  }));
};

// Initialize on module load
initializeAvailableCustomers();

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
        
        // Update available customers list
        const availableCustomerIndex = dynamicAvailableCustomers.findIndex(c => c.id === parseInt(updatedCustomer.id));
        if (availableCustomerIndex !== -1) {
          dynamicAvailableCustomers[availableCustomerIndex] = {
            id: parseInt(updatedCustomer.id),
            name: updatedCustomer.companyName
          };
        }
        
        return { success: true, customer: DUMMY_CUSTOMERS[customerIndex], isNew: false }
      } else {
        // Add new customer
        const newCustomer = {
          ...updatedCustomer,
          createdAt: updatedCustomer.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        DUMMY_CUSTOMERS.push(newCustomer)
        
        // Add to available customers list
        dynamicAvailableCustomers.push({
          id: parseInt(newCustomer.id),
          name: newCustomer.companyName
        });
        
        console.log('Added new customer:', newCustomer)
        console.log('Updated available customers:', dynamicAvailableCustomers)
        
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
      
      // Remove from available customers list
      const availableCustomerIndex = dynamicAvailableCustomers.findIndex(c => c.id === parseInt(customerId));
      if (availableCustomerIndex !== -1) {
        dynamicAvailableCustomers.splice(availableCustomerIndex, 1);
      }
      
      console.log('Deleted customer:', deletedCustomer)
      console.log('Updated available customers:', dynamicAvailableCustomers)
      
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
  },

  // Get dynamic available customers (replaces AVAILABLE_CUSTOMERS constant)
  getAvailableCustomers: (): Array<{ id: number; name: string }> => {
    return [...dynamicAvailableCustomers];
  },

  // Generate next available customer ID
  generateNextCustomerId: (): string => {
    const existingIds = DUMMY_CUSTOMERS.map(c => parseInt(c.id)).filter(id => !isNaN(id));
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 20;
    return (maxId + 1).toString();
  },

  // Create a new customer with auto-generated ID and proper page assignments
  createNewCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'viewConfig' | 'pageAssignments'>): { success: boolean; customer?: Customer; error?: string } => {
    try {
      const newId = customerService.generateNextCustomerId();
      const now = new Date().toISOString();
      
      // Get pages for customer type
      const { getPagesByCustomerType } = require('@/config/customerPages');
      const availablePages = getPagesByCustomerType(customerData.customerType);
      
      // Create page assignments
      const pageAssignments: Record<string, any> = {};
      const enabledPageIds: string[] = [];
      
      availablePages.forEach(page => {
        const pageKey = Object.keys(require('@/config/customerPages').CUSTOMER_PAGES).find(
          key => require('@/config/customerPages').CUSTOMER_PAGES[key].id === page.id
        );
        if (pageKey) {
          pageAssignments[pageKey] = {
            enabled: true,
            customized: false,
            lastModified: now,
            modifiedBy: "system"
          };
          enabledPageIds.push(pageKey);
        }
      });

      const newCustomer: Customer = {
        ...customerData,
        id: newId,
        viewConfig: {
          id: `vc${newId}`,
          customerId: newId,
          customerType: customerData.customerType,
          enabledPages: enabledPageIds,
          createdAt: now,
          updatedAt: now
        },
        pageAssignments,
        createdAt: now,
        updatedAt: now
      };

      return customerService.updateCustomer(newCustomer);
    } catch (error) {
      console.error('Error creating new customer:', error);
      return { success: false, error: 'Failed to create new customer' };
    }
  }
} 