import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CustomerWithRelations, CustomerPage } from '@/types/customer';
import { CUSTOMER_PAGES } from '@/config/customerPages';
import { BASE_API_URL } from '@/config/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Users, 
  Building, 
  AlertTriangle, 
  FileText,
  Search,
  Filter,
  ExternalLink,
  Calendar,
  BarChart3,
  MessageSquare,
  Shield,
  UserCheck,
  Footprints,
  Key,
  Info,
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  MapPin
} from 'lucide-react';
import { customerService } from '@/services/customerService';
import { customerPageAccessCache } from '@/services/customerPageAccessCache';
import { siteService } from '@/services/siteService';
import type { Site } from '@/types/customer';
import type { CustomerPageAccessPage } from '@/api/customerPageAccess';

const iconMap = {
  Calendar,
  BarChart3,
  AlertTriangle,
  MessageSquare,
  Shield,
  UserCheck,
  Footprints,
  Building,
  Key,
  Users,
  FileText
};

interface Site {
  id: string;
  locationName: string;
  customerId: number;
  regionId?: string;
}

type ReportingStep = 'customer' | 'page' | 'site';

const mapAccessPageToCustomerPage = (page: CustomerPageAccessPage): CustomerPage => {
  const config = Object.values(CUSTOMER_PAGES).find(
    cfg => cfg.id === page.pageId || cfg.path === page.path
  );

  return {
    id: page.pageId,
    title: page.title || config?.title || page.pageId,
    description: page.description || config?.description || '',
    enabled: true,
    requiredForTypes: [],
    path: page.path,
    readOnly: config?.readOnly ?? false,
    category: (config?.category || page.category || 'reports') as CustomerPage['category'],
    icon: config?.icon || 'FileText'
  };
};

const resolveNumericCustomerId = (customer: CustomerWithRelations): number | null => {
  const candidates = [
    (customer as any)?.id,
    (customer as any)?.customerId,
    (customer as any)?.CustomerId,
    (customer as any)?.customerID
  ];

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;

    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate;
    }

    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
};

const buildCustomerKey = (customer: CustomerWithRelations, index: number): string => {
  const numericId = resolveNumericCustomerId(customer);
  if (numericId !== null) {
    return `customer-${numericId}`;
  }
  if (customer.id) {
    return `customer-${customer.id}`;
  }
  return `customer-index-${index}`;
};

export default function CustomerReportingPage() {
  const [customers, setCustomers] = useState<CustomerWithRelations[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSites, setIsLoadingSites] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<ReportingStep>('customer');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithRelations | null>(null);
  const [selectedPage, setSelectedPage] = useState<CustomerPage | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [assignedPageCounts, setAssignedPageCounts] = useState<Record<string, number>>({});
  const [pageAccessState, setPageAccessState] = useState<{
    isLoading: boolean;
    error: string | null;
    pages: CustomerPage[];
  }>({
    isLoading: false,
    error: null,
    pages: []
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCustomerReportingData = async () => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);

      // Load customer data from customer store (which uses cached data)
      let customerData = await customerService.getAllCustomers();
      
      // For officers, filter to only assigned customers
      if (user.role === 'advantageoneofficer') {
        let assignedCustomerIds = user.assignedCustomerIds || [];
        
        // Debug: Log what we have in user object
        console.log('🔍 [CustomerReportingPage] User object:', {
          userId: user.id,
          role: user.role,
          assignedCustomerIds: assignedCustomerIds,
          assignedCustomerIdsType: typeof assignedCustomerIds,
          isArray: Array.isArray(assignedCustomerIds),
          assignedCustomerIdsLength: Array.isArray(assignedCustomerIds) ? assignedCustomerIds.length : 'not array'
        });
        
        // Try to fetch latest assignments from /Auth/me endpoint (officers can access their own data)
        // This handles cases where assignments were updated but user session hasn't refreshed
        try {
          console.log('🔄 [CustomerReportingPage] Fetching latest user assignments from /Auth/me');
          const response = await fetch(`${BASE_API_URL}/Auth/me`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          
          if (response.ok) {
            const responseData = await response.json();
            const userData = responseData.data || responseData;
            const latestAssignedIds = userData?.AssignedCustomerIds || userData?.assignedCustomerIds || [];
            
            console.log('🔍 [CustomerReportingPage] Fetched user data from /Auth/me:', {
              assignedCustomerIds: latestAssignedIds,
              isArray: Array.isArray(latestAssignedIds),
              length: Array.isArray(latestAssignedIds) ? latestAssignedIds.length : 'not array'
            });
            
            // Update user object if assignments changed
            const currentIds = assignedCustomerIds || [];
            const idsChanged = JSON.stringify(latestAssignedIds.sort()) !== JSON.stringify(currentIds.sort());
            
            if (idsChanged || currentIds.length === 0) {
              console.log('🔄 [CustomerReportingPage] Assignments changed or were empty, updating user session');
              const updatedUser = {
                ...user,
                assignedCustomerIds: latestAssignedIds
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              // Dispatch event to update AuthContext
              window.dispatchEvent(new CustomEvent('user-assignments-updated', { detail: updatedUser }));
            }
            
            assignedCustomerIds = latestAssignedIds;
            console.log('✅ [CustomerReportingPage] Using assignedCustomerIds:', assignedCustomerIds);
          } else {
            console.warn('⚠️ [CustomerReportingPage] /Auth/me returned status:', response.status, 'using cached assignments');
          }
        } catch (error) {
          console.warn('⚠️ [CustomerReportingPage] Failed to fetch from /Auth/me, using cached assignments:', error);
          // Continue with cached assignments if API fails
        }
        
        // Normalize IDs to numbers for comparison (customer.id might be string or number)
        const assignedIdsAsNumbers = assignedCustomerIds.map(id => Number(id)).filter(id => !isNaN(id));
        
        console.log('🔍 [CustomerReportingPage] Before filtering:', {
          totalCustomersInStore: customerData.length,
          assignedCustomerIds: assignedCustomerIds,
          assignedIdsAsNumbers: assignedIdsAsNumbers,
          allCustomerIds: customerData.map((c: any) => ({ id: c.id, idType: typeof c.id, idNumber: Number(c.id) }))
        });
        
        customerData = customerData.filter((customer: any) => {
          // Use resolveNumericCustomerId to get the actual numeric ID
          const customerId = resolveNumericCustomerId(customer);
          const isAssigned = customerId !== null && assignedIdsAsNumbers.includes(customerId);
          if (import.meta.env.DEV) {
            console.log(`  - Customer ${customer.companyName || customer.id}: id=${customer.id}, customerId=${(customer as any)?.customerId}, resolvedId=${customerId}, assigned=${isAssigned}`);
          }
          return isAssigned;
        });
        
        console.log('🔄 [CustomerReportingPage] Filtered customers for officer:', {
          assignedCustomerIds: assignedCustomerIds,
          assignedIdsAsNumbers: assignedIdsAsNumbers,
          totalCustomers: (await customerService.getAllCustomers()).length,
          filteredCount: customerData.length,
          filteredCustomerIds: customerData.map((c: any) => c.id),
          filteredCustomerNames: customerData.map((c: any) => c.companyName || c.name)
        });
        
        // If no customers found but we have assigned IDs, try fetching from API directly
        if (customerData.length === 0 && assignedIdsAsNumbers.length > 0) {
          console.warn('⚠️ [CustomerReportingPage] No customers found in store but have assigned IDs, trying API...');
          try {
            const { customerService } = await import('@/services/customerService');
            const allCustomers = await customerService.getAllCustomers();
            customerData = allCustomers.filter((customer: any) => {
              const customerId = Number(customer.customerId || customer.id);
              const isAssigned = !isNaN(customerId) && assignedIdsAsNumbers.includes(customerId);
              if (import.meta.env.DEV && isAssigned) {
                console.log(`✅ [CustomerReportingPage] Found assigned customer from API: ${customer.companyName} (ID: ${customerId})`);
              }
              return isAssigned;
            });
            console.log('✅ [CustomerReportingPage] Fetched customers from API:', customerData.length);
          } catch (error) {
            console.error('❌ [CustomerReportingPage] Failed to fetch from API:', error);
          }
        }
      }
      
      setCustomers(customerData);
      console.log('✅ [CustomerReportingPage] Loaded customers from store:', customerData.length);
      await preloadAssignedCounts(customerData);
      
    } catch (error) {
      console.error('❌ [CustomerReportingPage] Error fetching customer data:', error);
      setError('Failed to load customer data');
    } finally {
      setIsLoading(false);
    }
  };

  const preloadAssignedCounts = async (customerList: CustomerWithRelations[]) => {
    try {
      const entries = await Promise.all(
        customerList.map(async (customer) => {
          const numericId = resolveNumericCustomerId(customer);
          if (numericId === null) {
            console.warn('⚠️ [CustomerReportingPage] Invalid customer ID, skipping assignment preload:', customer.id);
            return null;
          }

          try {
            const access = await customerPageAccessCache.get(numericId);
            return [String(numericId), access.assignedPageIds.length] as const;
          } catch (error) {
            // Silently fail - preloading is not critical
            if (import.meta.env.DEV) {
              console.warn('⚠️ [CustomerReportingPage] Could not preload assignment count for customer', numericId, ':', error instanceof Error ? error.message : error);
            }
            return [String(numericId), 0] as const;
          }
        })
      );

      const validEntries = entries.filter((entry): entry is readonly [string, number] => Boolean(entry));
      if (validEntries.length > 0) {
        setAssignedPageCounts(prev => ({
          ...prev,
          ...Object.fromEntries(validEntries)
        }));
      }
    } catch (error) {
      console.error('❌ [CustomerReportingPage] Error preloading assignment counts:', error);
    }
  };

  const fetchSitesForCustomer = async (customerId: number) => {
    try {
      setIsLoadingSites(true);
      console.log('🏢 [CustomerReportingPage] Loading sites for customer:', customerId);
      
      const response = await siteService.getSitesByCustomer(customerId);
      
      if (response.success) {
        const sortedSites = response.data.sort((a, b) =>
          (a.locationName || '').localeCompare(b.locationName || '')
        );
        console.log('🏢 [CustomerReportingPage] Loaded sites:', sortedSites.length, 'for customer', customerId);
        setSites(sortedSites);
      } else {
        console.error('Failed to fetch sites', response);
        setSites([]);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
      setSites([]);
    } finally {
      setIsLoadingSites(false);
    }
  };

  useEffect(() => {
    fetchCustomerReportingData();
  }, [user, user?.assignedCustomerIds]);

  // Listen for user assignment updates from User Setup page
  useEffect(() => {
    const handleUserAssignmentUpdate = (event: CustomEvent) => {
      console.log('🔄 [CustomerReportingPage] Received user assignment update:', event.detail);
      // Refresh customer data when assignments change
      fetchCustomerReportingData();
    };

    window.addEventListener('user-customer-assignment-updated', handleUserAssignmentUpdate as EventListener);
    
    return () => {
      window.removeEventListener('user-customer-assignment-updated', handleUserAssignmentUpdate as EventListener);
    };
  }, [user]);

  const getIcon = (iconName: string | undefined) => {
    if (!iconName) return FileText;
    return iconMap[iconName as keyof typeof iconMap] || FileText;
  };

  const loadPagesForCustomer = useCallback(async (customerId: number) => {
    try {
      setPageAccessState({ isLoading: true, error: null, pages: [] });
      
      // Force refresh to get latest assignments (cache is cleared when pages are assigned)
      const access = await customerPageAccessCache.get(customerId, { force: false });
      
      console.log('🔍 [CustomerReportingPage] Page access data:', {
        customerId,
        totalAvailablePages: access.availablePages.length,
        assignedPageIds: access.assignedPageIds,
        assignedCount: access.assignedPageIds.length
      });
      
      const assignedPages = access.availablePages
        .filter(page => access.assignedPageIds.includes(page.pageId))
        .map(mapAccessPageToCustomerPage);

      setPageAccessState({
        isLoading: false,
        error: null,
        pages: assignedPages
      });

      setAssignedPageCounts(prev => ({
        ...prev,
        [String(customerId)]: assignedPages.length
      }));

      console.log('✅ [CustomerReportingPage] Loaded assigned pages:', {
        customerId,
        count: assignedPages.length,
        pageIds: assignedPages.map(p => p.id)
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load customer pages';
      console.error('❌ [CustomerReportingPage] Error loading customer pages:', error);
      setPageAccessState({
        isLoading: false,
        error: message,
        pages: []
      });
    }
  }, []);

  const handleCustomerSelect = (customer: CustomerWithRelations) => {
    setSelectedCustomer(customer);
    setSelectedPage(null);
    setSelectedSite(null);
    setCurrentStep('page');

    const numericId = resolveNumericCustomerId(customer);
    if (numericId !== null) {
      loadPagesForCustomer(numericId);
      fetchSitesForCustomer(numericId);
    } else {
      setPageAccessState({
        isLoading: false,
        error: 'Invalid customer identifier',
        pages: []
      });
    }
  };

  // Listen for customer page access updates and refresh if the selected customer's pages were updated
  useEffect(() => {
    const handlePageAccessUpdate = (event: CustomEvent) => {
      const { customerId } = event.detail;
      const numericId = resolveNumericCustomerId(selectedCustomer);
      
      // If the updated customer matches the currently selected customer, refresh the pages
      if (numericId !== null && numericId === customerId) {
        console.log('🔄 [CustomerReportingPage] Page access updated for selected customer, refreshing...');
        // Clear cache and force refresh
        customerPageAccessCache.clear(customerId);
        loadPagesForCustomer(numericId);
      }
    };

    window.addEventListener('customer-page-access-updated', handlePageAccessUpdate as EventListener);
    
    return () => {
      window.removeEventListener('customer-page-access-updated', handlePageAccessUpdate as EventListener);
    };
  }, [selectedCustomer, loadPagesForCustomer]);

  const handlePageSelect = (page: CustomerPage) => {
    setSelectedPage(page);
    setSelectedSite(null);
    setCurrentStep('site');
  };

  const handleSiteSelect = (site: Site) => {
    setSelectedSite(site);
  };

  const handleNavigateToReport = () => {
    if (!selectedCustomer || !selectedPage || !selectedSite) {
      console.group('⚠️ [CustomerReportingPage] Navigation Blocked: Missing Selection');
      console.log('📋 Missing Selection:', {
       	hasCustomer: !!selectedCustomer,
       	hasPage: !!selectedPage,
       	hasSite: !!selectedSite,
       	customerId: selectedCustomer?.id,
       	pagePath: selectedPage?.path,
       	siteId: selectedSite?.siteID
      });
      console.groupEnd();
      return;
    }
    
    const numericCustomerId = resolveNumericCustomerId(selectedCustomer);
    const customerIdForUrl = numericCustomerId ?? selectedCustomer.id;
    
    if (!customerIdForUrl) {
      console.group('❌ [CustomerReportingPage] Navigation Blocked: Unable to Resolve Customer ID');
      console.log('📋 Customer ID Resolution:', {
       	selectedCustomer,
       	numericCustomerId,
       	customerIdForUrl: null,
       	reason: 'Unable to resolve customer ID'
      });
      console.groupEnd();
      return;
    }
    
    // Navigate to the selected page with customer and site context
    const url = `${selectedPage.path}?customerId=${customerIdForUrl}&siteId=${selectedSite.siteID}`;
    
    console.group('🚀 [CustomerReportingPage] NAVIGATION TRIGGERED');
    console.log('📍 Navigation Details:', {
     	from: location.pathname + location.search,
     	to: url,
     	timestamp: new Date().toISOString()
    });
    console.log('📋 Selection Context:', {
     	customer: {
       		id: selectedCustomer.id,
       		companyName: selectedCustomer.companyName,
       		resolvedCustomerId: customerIdForUrl
     	},
     	page: {
       		id: selectedPage.id,
       		path: selectedPage.path,
       		title: selectedPage.title
     	},
     	site: {
       		siteID: selectedSite.siteID,
       		name: selectedSite.siteName
     	}
    });
    console.log('🔐 Access Context (Before Navigation):', {
     	userRole: user?.role,
     	currentPath: location.pathname
    });
    console.groupEnd();
    
    navigate(url);
  };

  const handleBackToCustomers = () => {
    setCurrentStep('customer');
    setSelectedCustomer(null);
    setSelectedPage(null);
    setSelectedSite(null);
  };

  const handleBackToPages = () => {
    setCurrentStep('page');
    setSelectedPage(null);
    setSelectedSite(null);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availablePages = pageAccessState.pages;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Reporting</h1>
        <p className="mt-2 text-gray-600">
          Select a customer, choose a reporting page, pick a site, and start logging reports
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${currentStep === 'customer' ? 'text-blue-600' : selectedCustomer ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'customer' ? 'bg-blue-100 border-2 border-blue-600' : selectedCustomer ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
              <Users className="w-4 h-4" />
            </div>
            <span className="font-medium">Select Customer</span>
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400" />
          
          <div className={`flex items-center space-x-2 ${currentStep === 'page' ? 'text-blue-600' : selectedPage ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'page' ? 'bg-blue-100 border-2 border-blue-600' : selectedPage ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-medium">Choose Report Type</span>
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400" />
          
          <div className={`flex items-center space-x-2 ${currentStep === 'site' ? 'text-blue-600' : selectedSite ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'site' ? 'bg-blue-100 border-2 border-blue-600' : selectedSite ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
              <MapPin className="w-4 h-4" />
            </div>
            <span className="font-medium">Select Site</span>
          </div>
        </div>
      </div>

      {/* Step 1: Customer Selection */}
      {currentStep === 'customer' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Select a Customer</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer, index) => {
              const numericId = resolveNumericCustomerId(customer);
              const assignedCount = numericId !== null
                ? (assignedPageCounts[String(numericId)] ?? 0)
                : 0;

              return (
              <Card 
                  key={buildCustomerKey(customer, index)} 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
                onClick={() => handleCustomerSelect(customer)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{customer.companyName}</CardTitle>
                    <Badge variant="outline">ID: {customer.id}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="w-4 h-4 mr-2" />
                      <span>
                        {typeof customer.address === 'string' 
                          ? customer.address 
                          : customer.address?.street || 'No address specified'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <Badge variant="secondary">
                          {assignedCount} Reports Available
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search criteria.' : 'No customers are available for reporting.'}
              </p>
              {user?.role === 'AdvantageOneOfficer' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    If you were recently assigned customers, you may need to refresh your session.
                  </p>
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch(`${BASE_API_URL}/User/${user.id}`, {
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                          }
                        });
                        if (response.ok) {
                          const userData = await response.json();
                          const updatedUser = {
                            ...user,
                            assignedCustomerIds: userData.data?.AssignedCustomerIds || userData.data?.assignedCustomerIds || []
                          };
                          localStorage.setItem('user', JSON.stringify(updatedUser));
                          window.location.reload();
                        }
                      } catch (error) {
                        console.error('Failed to refresh user data:', error);
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Customer Assignments
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Page Selection */}
      {currentStep === 'page' && selectedCustomer && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Choose Report Type</h2>
              <p className="text-gray-600 mt-1">for {selectedCustomer.companyName}</p>
            </div>
            <Button variant="outline" onClick={handleBackToCustomers}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Customers
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageAccessState.isLoading && (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading available reports...</p>
              </div>
            )}

            {!pageAccessState.isLoading && pageAccessState.error && (
              <div className="col-span-full text-center py-12 text-red-600">
                {pageAccessState.error}
              </div>
            )}

            {!pageAccessState.isLoading && !pageAccessState.error && availablePages.map((page) => {
              const IconComponent = getIcon(page.icon);
              return (
                <Card 
                  key={page.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
                  onClick={() => handlePageSelect(page)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">{page.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{page.description}</p>
                    <div className="flex items-center justify-end">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {!pageAccessState.isLoading && !pageAccessState.error && availablePages.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports available</h3>
              <p className="text-gray-600">
                This customer doesn't have any reporting pages configured.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Site Selection */}
      {currentStep === 'site' && selectedCustomer && selectedPage && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Select Site</h2>
              <p className="text-gray-600 mt-1">
                for {selectedPage.title} at {selectedCustomer.companyName}
              </p>
            </div>
            <Button variant="outline" onClick={handleBackToPages}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Report Types
            </Button>
          </div>

                     {isLoadingSites ? (
             <div className="text-center py-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
               <p className="text-gray-600">Loading sites...</p>
             </div>
           ) : (
             <>
               {sites.length > 0 ? (
                 <div className="max-w-2xl mx-auto space-y-6">
                   {/* Warning Message */}
                   <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
                     <div className="text-center space-y-2">
                       <p className="text-amber-800 font-medium">
                         Before opening the page you have chosen, you need to select the site you wish to show details for.
                       </p>
                       <p className="text-amber-700 text-sm">
                         Use the drop list below to select the site at this customer and then click the 'OK' button below.
                       </p>
                     </div>
                   </div>

                   {/* Site Selection */}
                   <div className="space-y-4">
                     <div className="text-center">
                                               <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select the site whose records you wish to view:
                        </label>
                       <div className="max-w-md mx-auto">
                         <Select 
                           value={selectedSite ? String(selectedSite.siteID) : ''} 
                           onValueChange={(value) => {
                             const site = sites.find(s => String(s.siteID) === value);
                             if (site) {
                               handleSiteSelect(site);
                             }
                           }}
                         >
                           <SelectTrigger className="w-full">
                             <SelectValue placeholder="Select a site..." />
                           </SelectTrigger>
                           <SelectContent className="max-h-60">
                             {sites.map((site) => {
                               const siteValue = String(site.siteID);
                               return (
                                 <SelectItem key={siteValue} value={siteValue}>
                                   {site.locationName || `Site ${siteValue}`}
                               </SelectItem>
                               );
                             })}
                           </SelectContent>
                         </Select>
                       </div>
                     </div>

                     {/* OK Button */}
                     {selectedSite && (
                       <div className="text-center pt-4">
                         <Button 
                           onClick={handleNavigateToReport} 
                           size="lg" 
                           className="px-12 py-3 bg-gray-600 hover:bg-gray-700 text-white"
                         >
                           OK
                         </Button>
                       </div>
                     )}
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-12">
                   <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                   <h3 className="text-lg font-medium text-gray-900 mb-2">No sites available</h3>
                   <p className="text-gray-600">
                     This customer doesn't have any sites configured yet.
                   </p>
                 </div>
               )}
             </>
           )}
        </div>
      )}
    </div>
  );
}
