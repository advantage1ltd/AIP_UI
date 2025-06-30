import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CustomerWithRelations, CustomerPage } from '@/types/customer';
import { CUSTOMER_PAGES } from '@/config/customerPages';
import { BASE_API_URL } from '@/config/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function CustomerDetailPage() {
  const [customer, setCustomer] = useState<CustomerWithRelations | null>(null);
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

  const getAvailablePages = (customer: CustomerWithRelations): CustomerPage[] => {
    console.log('🔍 [CustomerDetailPage] getAvailablePages called with customer:', customer);
    console.log('🔍 [CustomerDetailPage] User role:', user?.role);
    console.log('🔍 [CustomerDetailPage] Available CUSTOMER_PAGES:', Object.keys(CUSTOMER_PAGES));
    
    // Administrator should have access to ALL customer pages regardless of customer configuration
    if (user?.role === 'Administrator') {
      console.log('🔍 [CustomerDetailPage] Administrator access - returning all pages');
      return Object.values(CUSTOMER_PAGES);
    }
    
    // For other roles, use customer's page assignments
    if (customer.pageAssignments) {
      const enabledPageIds = Object.entries(customer.pageAssignments)
        .filter(([_, assignment]) => assignment.enabled)
        .map(([pageId]) => pageId);
      
      console.log('🔍 [CustomerDetailPage] Enabled page IDs:', enabledPageIds);
      console.log('🔍 [CustomerDetailPage] Available CUSTOMER_PAGES keys:', Object.keys(CUSTOMER_PAGES));
      
      // Match against the keys of CUSTOMER_PAGES, not the IDs
      const matchedPages = Object.entries(CUSTOMER_PAGES)
        .filter(([key, page]) => enabledPageIds.includes(key))
        .map(([key, page]) => page);
      
      console.log('🔍 [CustomerDetailPage] Matched pages:', matchedPages);
      return matchedPages;
    }
    
    // Fallback to availablePages if pageAssignments is not available
    if (customer.availablePages) {
      console.log('🔍 [CustomerDetailPage] Using fallback availablePages:', customer.availablePages);
      return customer.availablePages;
    }
    
    // Last fallback: return empty array
    console.log('🔍 [CustomerDetailPage] No page assignments or available pages found');
    return [];
  };

  const handlePageNavigation = (page: CustomerPage) => {
    // Navigate to the static customer page routes with customer ID as query parameter
    // This way the customer pages know which customer to display
    const url = `${page.path}?customerId=${customer!.id}`;
    navigate(url);
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

  const availablePages = getAvailablePages(customer);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/management/customer-reporting')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customer Reporting
        </Button>
        
        <div className="mb-4">
          <h1 className="text-3xl font-bold">{customer.companyName}</h1>
          <p className="text-muted-foreground">
            Company Number: {customer.companyNumber}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(customer.customerType) 
            ? customer.customerType 
            : [customer.customerType]
          ).map((type) => (
            <Badge key={type} variant="outline">
              {type}
            </Badge>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Reporting Pages</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on any page to access customer-specific reports and data
          </p>
        </CardHeader>
        <CardContent>
          {availablePages.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availablePages.map(page => (
                <Card 
                  key={page.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handlePageNavigation(page)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">{page.title}</h3>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {page.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {page.category}
                          </Badge>
                          {page.readOnly && (
                            <Badge variant="secondary" className="text-xs">
                              Read Only
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No pages assigned to this customer</p>
              <p className="text-sm">Contact administrator to configure page assignments</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 