import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CustomerWithRelations, CustomerReportingAccess, CustomerPage } from '@/types/customer';
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
  Info
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithRelations | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerReportingData = async () => {
      try {
        if (!user) return;

        // Build API URL with proper parameters
        const params = new URLSearchParams({
          userId: user.id,
          role: user.role
        });

        // Add assigned customer IDs for officers
        if (user.role === 'AdvantageOneOfficer' && 'assignedCustomerIds' in user && user.assignedCustomerIds) {
          params.append('assignedCustomerIds', user.assignedCustomerIds.join(','));
        }

        // Fetch customers based on user role and assignments
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

    fetchCustomerReportingData();
  }, [user]);

  const getAvailablePages = (customer: CustomerWithRelations): CustomerPage[] => {
    if (customer.availablePages) {
      // If availablePages is provided directly from API
      return customer.availablePages;
    }
    
    // Fallback: derive from pageAssignments
    const assignments = customer.pageAssignments || {};
    const enabledPageIds = Object.entries(assignments)
      .filter(([_, assignment]) => assignment.enabled)
      .map(([pageId]) => pageId);
    
    return Object.values(CUSTOMER_PAGES).filter(page => 
      enabledPageIds.includes(page.id)
    );
  };

  const getIcon = (iconName: string | undefined) => {
    if (!iconName || !iconMap[iconName as keyof typeof iconMap]) {
      return <Info className="h-4 w-4" />
    }
    const IconComponent = iconMap[iconName as keyof typeof iconMap]
    return <IconComponent className="h-4 w-4" />
  };

  const handlePageNavigation = (customer: CustomerWithRelations, page: CustomerPage) => {
    // Navigate to the customer-specific page
    const pathWithoutCustomer = page.path.replace('/customer/', '');
    const customerSpecificPath = `/customer/${customer.id}/${pathWithoutCustomer}`;
    navigate(customerSpecificPath);
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Incidents</span>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.incidents}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Reports</span>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.reports}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Sites</span>
              </div>
              <p className="text-2xl font-bold mt-2">{selectedCustomer.sites?.length || 0}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Regions</span>
              </div>
              <p className="text-2xl font-bold mt-2">{selectedCustomer.regions?.length || 0}</p>
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
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((customer) => {
          const availablePages = getAvailablePages(customer);
          const stats = getCustomerStats(customer);
          
          return (
            <Card
              key={customer.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedCustomer(customer)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{customer.companyName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {customer.companyNumber}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {Array.isArray(customer.customerType) ? customer.customerType[0] : customer.customerType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-500">{stats.incidents}</p>
                    <p className="text-xs text-muted-foreground">Incidents</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-500">{availablePages.length}</p>
                    <p className="text-xs text-muted-foreground">Available Pages</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.sites?.length || 0} Sites</span>
                    <span>•</span>
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.regions?.length || 0} Regions</span>
                  </div>
                  
                  {availablePages.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {availablePages.slice(0, 3).map(page => (
                        <Badge key={page.id} variant="outline" className="text-xs">
                          {page.title}
                        </Badge>
                      ))}
                      {availablePages.length > 3 && (
                        <Badge variant="outline" className="text-xs">
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
