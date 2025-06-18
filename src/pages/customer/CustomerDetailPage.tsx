import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Customer } from '@/types/user';
import { BASE_API_URL } from '@/config/api';

interface CustomerPage {
  id: string;
  title: string;
  path: string;
  customerTypes: string[];
}

const CUSTOMER_PAGES: CustomerPage[] = [
  {
    id: 'incidents',
    title: 'Incident Reports',
    path: 'incidents',
    customerTypes: ['Event', 'Static', 'Gatehouse', 'Retail', 'Mobile Patrol', 'Keyholding & Alarm Response'],
  },
  {
    id: 'daily-activity',
    title: 'Daily Activity Reports',
    path: 'daily-activity',
    customerTypes: ['Static', 'Gatehouse', 'Retail'],
  },
  {
    id: 'site-visits',
    title: 'Site Visits',
    path: 'site-visits',
    customerTypes: ['Static', 'Gatehouse', 'Retail', 'Mobile Patrol'],
  },
  {
    id: 'customer-satisfaction',
    title: 'Customer Satisfaction',
    path: 'satisfaction',
    customerTypes: ['Event', 'Static', 'Gatehouse', 'Retail', 'Mobile Patrol', 'Keyholding & Alarm Response'],
  },
  {
    id: 'be-safe-be-secure',
    title: 'Be Safe Be Secure',
    path: 'be-safe-be-secure',
    customerTypes: ['Retail'],
  },
];

export default function CustomerDetailPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { customerId } = useParams<{ customerId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        if (!user || !customerId) return;

        const response = await fetch(
          `${BASE_API_URL}/customers/${customerId}?userId=${user.id}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch customer');
        }

        setCustomer(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [user, customerId]);

  const getAvailablePages = (customer: Customer): CustomerPage[] => {
    const customerTypes = Array.isArray(customer.customerType) 
      ? customer.customerType 
      : [customer.customerType];
    return CUSTOMER_PAGES.filter((page) =>
      customerTypes.some((type) => page.customerTypes.includes(type))
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          {error || 'Customer not found'}
        </div>
      </div>
    );
  }

  const availablePages = getAvailablePages(customer) || [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{customer.companyName}</h1>
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(customer.customerType) 
            ? customer.customerType 
            : [customer.customerType]
          ).map((type) => (
            <span
              key={type}
              className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(availablePages || []).map((page) => (
          <div
            key={page.id}
            onClick={() => navigate(`/customer/${customer.id}/${page.path}`)}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">{page.title}</h2>
            <p className="mt-2 text-sm text-gray-600">
              View and manage {page.title.toLowerCase()}
            </p>
          </div>
        ))}
      </div>

      {availablePages.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
          <p className="text-gray-600">No available pages for this customer type</p>
        </div>
      )}
    </div>
  );
} 