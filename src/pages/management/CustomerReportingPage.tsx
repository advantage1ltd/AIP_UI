import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CustomerWithRelations, CustomerReportingAccess, CustomerPage } from '@/types/customer';
import { CUSTOMER_PAGES } from '@/config/customerPages';
import { BASE_API_URL } from '@/config/api';
import { regionsService } from '@/services/regionsService';
import { sitesService } from '@/services/sitesService';
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
  RefreshCw
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
  Users
};

export default function CustomerReportingPage() {
  const [customers, setCustomers] = useState<CustomerWithRelations[]>([]);
  const [reportingData, setReportingData] = useState<CustomerReportingAccess[]>([]);
  const [customerStats, setCustomerStats] = useState<Record<string, {regions: number, sites: number}>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithRelations | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCustomerReportingData = async () => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);

      // For officers, always fetch fresh assignment data instead of relying on cached user data
      let assignedCustomerIds: string[] = [];
      if (user.role === 'AdvantageOneOfficer') {
        try {
          // Fetch fresh user data to get latest assignments
          console.log('🔍 [CustomerReportingPage] Making fresh API call to GET /api/users/' + user.id);
          const userResponse = await fetch(`${BASE_API_URL}/users/${user.id}`);
          console.log('🔍 [CustomerReportingPage] API response status:', userResponse.status, userResponse.statusText);
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            assignedCustomerIds = userData.data?.assignedCustomerIds?.map((id: number) => id.toString()) || [];
            console.log('🔄 [CustomerReportingPage] Fetched fresh assignment data:', {
              userId: user.id,
              userName: user.username,
              apiResponseSuccess: userData.success,
              cachedAssignments: 'assignedCustomerIds' in user ? user.assignedCustomerIds : 'none',
              freshAssignments: assignedCustomerIds,
              fullUserData: userData.data
            });
          } else {
            // Fallback to cached data if API call fails
            assignedCustomerIds = ('assignedCustomerIds' in user && user.assignedCustomerIds) 
              ? user.assignedCustomerIds.map(id => id.toString()) 
              : [];
            console.warn('🔄 [CustomerReportingPage] Failed to fetch fresh assignments, using cached data');
          }
        } catch (fetchError) {
          // Fallback to cached data if API call fails
          assignedCustomerIds = ('assignedCustomerIds' in user && user.assignedCustomerIds) 
            ? user.assignedCustomerIds.map(id => id.toString()) 
            : [];
          console.warn('🔄 [CustomerReportingPage] Error fetching fresh assignments, using cached data:', fetchError);
        }
      }

      // Build API URL with proper parameters
      const params = new URLSearchParams({
        userId: user.id,
        role: user.role
      });

      // Add fresh assigned customer IDs for officers
      if (user.role === 'AdvantageOneOfficer' && assignedCustomerIds.length > 0) {
        params.append('assignedCustomerIds', assignedCustomerIds.join(','));
      }

      // Fetch customers based on user role and fresh assignments
      const response = await fetch(`${BASE_API_URL}/customers/reporting?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch customer reporting data');
      }

      setCustomers(data.data || []);
      
      // Fetch regions and sites counts for each customer
      await fetchCustomerStats(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerStats = async (customersData: CustomerWithRelations[]) => {
    setIsLoadingStats(true);
    try {
      const [regionsResult, sitesResult] = await Promise.all([
        regionsService.getRegions(),
        sitesService.getSites()
      ]);

      const stats: Record<string, {regions: number, sites: number}> = {};
      
      customersData.forEach(customer => {
        const customerRegions = regionsResult.success ? 
          regionsResult.data.filter(region => region.customerId === customer.id).length : 0;
        const customerSites = sitesResult.success ? 
          sitesResult.data.filter(site => site.customerId === customer.id).length : 0;
        
        stats[customer.id] = {
          regions: customerRegions,
          sites: customerSites
        };
      });

      setCustomerStats(stats);
    } catch (error) {
      console.error('Failed to fetch customer stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchCustomerReportingData();
  }, [user]);

  // Listen for customer configuration updates
  useEffect(() => {
    const handleConfigUpdate = () => {
      console.log('🔄 Customer configuration updated, refreshing data...');
      fetchCustomerReportingData();
    };

    window.addEventListener('customer-config-updated', handleConfigUpdate);
    return () => window.removeEventListener('customer-config-updated', handleConfigUpdate);
  }, []);

  // Listen for user assignment updates to refresh data automatically
  useEffect(() => {
    const handleAssignmentUpdate = (event: CustomEvent) => {
      const { userId, newAssignments } = event.detail
      
      // Only refresh if this is the current user's assignment that was updated
      if (user?.id === userId) {
        console.log('🔄 [CustomerReportingPage] Received assignment update for current user:', {
          userId,
          newAssignments,
          currentUser: user.id
        })
        fetchCustomerReportingData()
      }
    }

    window.addEventListener('user-assignments-updated', handleAssignmentUpdate as EventListener)
    
    return () => {
      window.removeEventListener('user-assignments-updated', handleAssignmentUpdate as EventListener)
    }
  }, [user?.id, fetchCustomerReportingData]);

  const getAvailablePages = (customer: CustomerWithRelations): CustomerPage[] => {
    console.log('🔍 [CustomerReportingPage] getAvailablePages called with user role:', user?.role);
    console.log('🔍 [CustomerReportingPage] Available CUSTOMER_PAGES:', Object.keys(CUSTOMER_PAGES));
    
    // Administrator should have access to ALL customer pages regardless of customer configuration
    if (user?.role === 'Administrator') {
      console.log('🔍 [CustomerReportingPage] Administrator access - returning all pages');
      return Object.values(CUSTOMER_PAGES);
    }
    
    // For other roles, use customer's page assignments
    if (customer.pageAssignments) {
      const enabledPageIds = Object.entries(customer.pageAssignments)
        .filter(([_, assignment]) => assignment.enabled)
        .map(([pageId]) => pageId);
      
      // Match against the keys of CUSTOMER_PAGES, not the IDs
      return Object.entries(CUSTOMER_PAGES)
        .filter(([key, page]) => enabledPageIds.includes(key))
        .map(([key, page]) => page);
    }
    
    // Fallback to availablePages if pageAssignments is not available
    if (customer.availablePages) {
      return customer.availablePages;
    }
    
    // Last fallback: return empty array
    return [];
  };

  const getIcon = (iconName: string | undefined) => {
    if (!iconName || !iconMap[iconName as keyof typeof iconMap]) {
      return <Info className="h-4 w-4" />
    }
    const IconComponent = iconMap[iconName as keyof typeof iconMap]
    return <IconComponent className="h-4 w-4" />
  };

  const handlePageNavigation = (customer: CustomerWithRelations, page: CustomerPage) => {
    // Navigate to the static customer page routes with customer ID as query parameter
    // This way the customer pages know which customer to display
    const url = `${page.path}?customerId=${customer.id}`;
    navigate(url);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.companyNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    
    // Handle both single customerType and array of customerTypes
    const customerTypes = Array.isArray(customer.customerType) ? customer.customerType : [customer.customerType];
    return matchesSearch && customerTypes.some(type => type.toLowerCase() === filterType.toLowerCase());
  });

  const getCustomerStats = (customer: CustomerWithRelations) => {
    if (customer.statistics) {
      // Use statistics from API response
      return {
        incidents: customer.statistics.incidents || 0,
        reports: customer.statistics.reports || 0,
        lastActivity: customer.statistics.lastIncident ? 
          new Date(customer.statistics.lastIncident).toLocaleDateString() : 
          'No recent activity',
        activeIssues: customer.statistics.activeIssues || 0
      };
    }
    
    // Fallback to reportingData
    const reportingInfo = reportingData.find(r => r.customerId === customer.id);
    return {
      incidents: reportingInfo?.totalIncidents || 0,
      reports: reportingInfo?.totalReports || 0,
      lastActivity: reportingInfo?.lastActivity || 'No recent activity',
      activeIssues: 0
    };
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
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

  if (selectedCustomer) {
    const availablePages = getAvailablePages(selectedCustomer);
    const stats = getCustomerStats(selectedCustomer);
    
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
            ← Back to Customers
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedCustomer.companyName}</h1>
            <p className="text-muted-foreground">
              Customer Reporting Dashboard
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card className="border-0 bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-white" />
                <span className="text-sm font-medium text-white/90">Incidents</span>
              </div>
              <p className="text-2xl font-bold mt-2 text-white">{stats.incidents}</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-white" />
                <span className="text-sm font-medium text-white/90">Reports</span>
              </div>
              <p className="text-2xl font-bold mt-2 text-white">{stats.reports}</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-white" />
                <span className="text-sm font-medium text-white/90">Sites</span>
              </div>
              <p className="text-2xl font-bold mt-2 text-white">{customerStats[selectedCustomer.id]?.sites || 0}</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-white" />
                <span className="text-sm font-medium text-white/90">Regions</span>
              </div>
              <p className="text-2xl font-bold mt-2 text-white">{customerStats[selectedCustomer.id]?.regions || 0}</p>
            </CardContent>
          </Card>
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
                    onClick={() => handlePageNavigation(selectedCustomer, page)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getIcon(page.icon)}
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
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pages assigned to this customer</p>
                <p className="text-sm">Contact administrator to configure page assignments</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Customer Reporting</h1>
          <p className="text-muted-foreground">
            {user?.role === 'Administrator' ? 
              'View all customers and their assigned reporting pages' : 
              'View your assigned customers and their reporting pages'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              console.log('🧪 [Test] Direct API test for user:', user?.id);
              try {
                const response = await fetch(`${BASE_API_URL}/users/${user?.id}`);
                const data = await response.json();
                console.log('🧪 [Test] Direct API result:', {
                  status: response.status,
                  success: data.success,
                  assignedCustomerIds: data.data?.assignedCustomerIds,
                  username: data.data?.username,
                  fullData: data.data
                });
                alert(`Test Result:\nUser: ${data.data?.username}\nAssignments: ${JSON.stringify(data.data?.assignedCustomerIds)}`);
              } catch (error) {
                console.error('🧪 [Test] API test failed:', error);
                alert('Test failed: ' + error);
              }
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            🧪 Test API
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('🧹 [Clear] Clearing all caches...');
              // Clear MSW cache
              if ((window as any).clearUserStore) {
                (window as any).clearUserStore();
              }
              // Clear localStorage
              localStorage.removeItem('msw_user_store');
              // Force refresh
              window.location.reload();
            }}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            🧹 Clear Cache
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCustomerReportingData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="static">Static</SelectItem>
              <SelectItem value="gatehouse">Gatehouse</SelectItem>
              <SelectItem value="mobile-patrol">Mobile Patrol</SelectItem>
              <SelectItem value="keyholding-alarm-response">Keyholding & Alarm Response</SelectItem>
              <SelectItem value="event">Event</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Debug Panel - Only show for officers during testing */}
      {user?.role === 'AdvantageOneOfficer' && (
        <Card className="mb-6 bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700">🔍 Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>User:</strong> {user.username} ({user.firstName} {user.lastName})</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>User ID:</strong> {user.id}</p>
              </div>
              <div>
                <p><strong>Cached Assignments:</strong> {
                  'assignedCustomerIds' in user 
                    ? JSON.stringify(user.assignedCustomerIds)
                    : 'None'
                }</p>
                <p><strong>Customers Found:</strong> {customers.length}</p>
                <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((customer, index) => {
          const availablePages = getAvailablePages(customer);
          const stats = getCustomerStats(customer);
          
          // Cycle through different gradient backgrounds - more subtle and professional
          const gradients = [
            "bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800",
            "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800", 
            "bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800",
            "bg-gradient-to-br from-orange-600 via-amber-700 to-red-800",
            "bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-800",
            "bg-gradient-to-br from-cyan-600 via-teal-700 to-emerald-800"
          ];
          const gradientClass = gradients[index % gradients.length];
          
          return (
            <Card
              key={customer.id}
              className={`cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-0 text-white shadow-lg ${gradientClass}`}
              onClick={() => setSelectedCustomer(customer)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-white">{customer.companyName}</CardTitle>
                    <p className="text-sm text-white/80">
                      {customer.companyNumber}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-white/25 text-white border-white/40 backdrop-blur-sm font-medium">
                    {Array.isArray(customer.customerType) ? customer.customerType[0] : customer.customerType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-3xl font-bold text-white">{stats.incidents}</p>
                    <p className="text-xs text-white/80 font-medium">Incidents</p>
                  </div>
                  <div className="text-center bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-3xl font-bold text-white">{availablePages.length}</p>
                    <p className="text-xs text-white/80 font-medium">Available Pages</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <Building className="h-4 w-4 text-white/80" />
                    <span>{customerStats[customer.id]?.sites || 0} Sites</span>
                    <span>•</span>
                    <Users className="h-4 w-4 text-white/80" />
                    <span>{customerStats[customer.id]?.regions || 0} Regions</span>
                  </div>
                  
                  {availablePages.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {availablePages.slice(0, 3).map(page => (
                        <Badge key={page.id} variant="outline" className="text-xs bg-white/25 text-white border-white/40 backdrop-blur-sm">
                          {page.title}
                        </Badge>
                      ))}
                      {availablePages.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-white/25 text-white border-white/40 backdrop-blur-sm">
                          +{availablePages.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No customers found</h3>
          <p className="text-muted-foreground max-w-md">
            {searchTerm || filterType !== 'all' ? 
              'Try adjusting your search or filter criteria' :
              user?.role === 'AdvantageOneOfficer' ?
                'No customers have been assigned to you yet' :
                'No customers have been set up yet'
            }
          </p>
        </div>
      )}
    </div>
  );
}
