import { useState, useEffect } from 'react';

interface AvailableCustomer {
  id: number;
  name: string;
}

// Custom hook to manage available customers dynamically
export const useAvailableCustomers = () => {
  const [availableCustomers, setAvailableCustomers] = useState<AvailableCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/customers');
      const result = await response.json();
      
      if (result.success) {
        const customers = result.data.map((c: any) => ({
          id: c.id,
          name: c.companyName
        }));
        setAvailableCustomers(customers);
      } else {
        console.error('Failed to fetch customers:', result.message);
        setAvailableCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching available customers:', error);
      setAvailableCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCustomers();

    // Listen for customer events to refresh the list
    const handleCustomerEvent = () => {
      refreshCustomers();
    };

    window.addEventListener('customer-created', handleCustomerEvent);
    window.addEventListener('customer-updated', handleCustomerEvent);
    window.addEventListener('customer-deleted', handleCustomerEvent);
    
    return () => {
      window.removeEventListener('customer-created', handleCustomerEvent);
      window.removeEventListener('customer-updated', handleCustomerEvent);
      window.removeEventListener('customer-deleted', handleCustomerEvent);
    };
  }, []);

  return {
    availableCustomers,
    isLoading,
    refreshCustomers
  };
};

// Utility function to get available customers asynchronously (for components that can't use hooks)
export const getAvailableCustomers = async (): Promise<AvailableCustomer[]> => {
  try {
    const response = await fetch('/api/customers');
    const result = await response.json();
    
    if (result.success) {
      return result.data.map((c: any) => ({
        id: c.id,
        name: c.companyName
      }));
    } else {
      console.error('Failed to fetch customers:', result.message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching available customers:', error);
    return [];
  }
};

// Utility function to find customer by ID
export const findCustomerById = async (id: number | string): Promise<AvailableCustomer | undefined> => {
  const customers = await getAvailableCustomers();
  const searchId = typeof id === 'string' ? parseInt(id) : id;
  return customers.find(c => c.id === searchId);
}; 