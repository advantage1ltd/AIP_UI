import React, { useEffect, useState } from 'react';
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
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCustomerReportingData = async () => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);

      // For officers, fetch fresh assignment data
      let assignedCustomerIds: string[] = [];
      if (user.role === 'AdvantageOneOfficer') {
        try {
          const userResponse = await fetch(`${BASE_API_URL}/users/${user.id}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            assignedCustomerIds = userData.data?.assignedCustomerIds?.map((id: number) => id.toString()) || [];
            console.log('🔄 [CustomerReportingPage] Fresh assignments:', assignedCustomerIds);
          }
        } catch (fetchError) {
          assignedCustomerIds = ('assignedCustomerIds' in user && user.assignedCustomerIds) 
            ? user.assignedCustomerIds.map(id => id.toString()) 
            : [];
        }
      }

      // Build API URL with proper parameters
      const params = new URLSearchParams({
        userId: user.id,
        role: user.role
      });

      if (user.role === 'AdvantageOneOfficer' && assignedCustomerIds.length > 0) {
        params.append('assignedCustomerIds', assignedCustomerIds.join(','));
      }

      const response = await fetch(`${BASE_API_URL}/customers/reporting?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch customer reporting data');
      }

      setCustomers(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSitesForCustomer = async (customerId: number) => {
    try {
      setIsLoadingSites(true);
      console.log('🏢 [CustomerReportingPage] Loading sites for customer:', customerId);
      
      const response = await fetch('/api/dashboard/sites', {
        headers: {
          'X-Customer-Id': customerId.toString()
        }
      });
      
      if (response.ok) {
        const sitesData = await response.json();
        console.log('🏢 [CustomerReportingPage] Loaded sites:', sitesData.length, 'for customer', customerId);
        setSites(sitesData);
      } else {
        console.error('Failed to fetch sites');
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
  }, [user]);

  const getAvailablePages = (customer: CustomerWithRelations): CustomerPage[] => {
    console.log('🔍 [CustomerReportingPage] getAvailablePages called with customer:', customer);
    console.log('🔍 [CustomerReportingPage] User role:', user?.role);
    
    // Use customer's page assignments if available
    if (customer.pageAssignments) {
      const enabledPageIds = Object.entries(customer.pageAssignments)
        .filter(([_, assignment]) => assignment.enabled)
        .map(([pageId]) => pageId);
      
      console.log('🔍 [CustomerReportingPage] Enabled page IDs:', enabledPageIds);
      
      const matchedPages = Object.entries(CUSTOMER_PAGES)
        .filter(([key, page]) => enabledPageIds.includes(key))
        .map(([key, page]) => page);
      
      console.log('🔍 [CustomerReportingPage] Matched pages:', matchedPages);
      return matchedPages;
    }
    
    // Fallback to availablePages if pageAssignments is not available
    if (customer.availablePages) {
      console.log('🔍 [CustomerReportingPage] Using fallback availablePages:', customer.availablePages);
      return customer.availablePages;
    }
    
    console.log('🔍 [CustomerReportingPage] No page assignments or available pages found');
    return [];
  };

  const getIcon = (iconName: string | undefined) => {
    if (!iconName) return FileText;
    return iconMap[iconName as keyof typeof iconMap] || FileText;
  };

  const handleCustomerSelect = (customer: CustomerWithRelations) => {
    setSelectedCustomer(customer);
    setSelectedPage(null);
    setSelectedSite(null);
    setCurrentStep('page');
    fetchSitesForCustomer(customer.id);
  };

  const handlePageSelect = (page: CustomerPage) => {
    setSelectedPage(page);
    setSelectedSite(null);
    setCurrentStep('site');
  };

  const handleSiteSelect = (site: Site) => {
    setSelectedSite(site);
  };

  const handleNavigateToReport = () => {
    if (!selectedCustomer || !selectedPage || !selectedSite) return;
    
    // Navigate to the selected page with customer and site context
    const url = `${selectedPage.path}?customerId=${selectedCustomer.id}&siteId=${selectedSite.id}`;
    console.log('🚀 [CustomerReportingPage] Navigating to:', url);
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

  const availablePages = selectedCustomer ? getAvailablePages(selectedCustomer) : [];

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
            {filteredCustomers.map((customer) => (
              <Card 
                key={customer.id} 
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
                        {getAvailablePages(customer).length} Reports Available
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search criteria.' : 'No customers are available for reporting.'}
              </p>
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
            {availablePages.map((page) => {
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

          {availablePages.length === 0 && (
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
                           value={selectedSite?.id || ''} 
                           onValueChange={(value) => {
                             const site = sites.find(s => s.id === value);
                             if (site) {
                               handleSiteSelect(site);
                             }
                           }}
                         >
                           <SelectTrigger className="w-full">
                             <SelectValue placeholder="Select a site..." />
                           </SelectTrigger>
                           <SelectContent className="max-h-60">
                             {sites.map((site) => (
                               <SelectItem key={site.id} value={site.id}>
                                 {site.locationName}
                               </SelectItem>
                             ))}
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
