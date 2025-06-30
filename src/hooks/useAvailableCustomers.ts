import { useState, useEffect } from 'react';
import { customerService } from '@/services/customerService';

interface AvailableCustomer {
  id: number;
  name: string;
}

// Custom hook to manage available customers dynamically
export const useAvailableCustomers = () => {
  const [availableCustomers, setAvailableCustomers] = useState<AvailableCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCustomers = () => {
    try {
      const customers = customerService.getAvailableCustomers();
      setAvailableCustomers(customers);
    } catch (error) {
      console.error('Error fetching available customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCustomers();
  }, []);

  return {
    availableCustomers,
    isLoading,
    refreshCustomers
  };
};

// Utility function to get available customers synchronously (for components that can't use hooks)
export const getAvailableCustomers = (): AvailableCustomer[] => {
  return customerService.getAvailableCustomers();
};

// Utility function to find customer by ID
export const findCustomerById = (id: number | string): AvailableCustomer | undefined => {
  const customers = customerService.getAvailableCustomers();
  const searchId = typeof id === 'string' ? parseInt(id) : id;
  return customers.find(c => c.id === searchId);
}; 