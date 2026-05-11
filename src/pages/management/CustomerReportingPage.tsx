/**
 * Management customer reporting aggregates.
 * Flow: customer and site pickers → enabled customer pages → deep links into customer modules.
 */
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Customer, CustomerPage, Site } from '@/types/customer';
import { CUSTOMER_PAGES } from '@/config/customerPages';
import { BASE_API_URL, api } from '@/config/api';
import { BackendApiResponse, getApiData } from '@/types/backend-api';
import type { StaffUser, User } from '@/types/user';
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
  MapPin,
  CheckCircle2,
  Circle,
  Loader2,
  Building2,
  FileBarChart,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import { customerService } from '@/services/customerService';
import { customerPageAccessCache } from '@/services/customerPageAccessCache';
import { siteService } from '@/services/siteService';
import type { CustomerPageAccessPage } from '@/api/customerPageAccess';
import { filterAssignedCustomerPages } from '@/utils/customer-page-access-display';
import { harmonizeRole } from '@/utils/roles';
import { cn } from '@/lib/utils';

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

const resolveNumericCustomerId = (customer: Customer): number | null => {
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

const buildCustomerKey = (customer: Customer, index: number): string => {
  const numericId = resolveNumericCustomerId(customer);
  if (numericId !== null) {
    return `customer-${numericId}`;
  }
  if (customer.id) {
    return `customer-${customer.id}`;
  }
  return `customer-index-${index}`;
};

type AuthUserPayload = User & {
	AssignedCustomerIds?: Array<number | string>
	assignedCustomerIds?: Array<number | string>
}

const normalizeAssignedCustomerIds = (value?: Array<number | string> | null): number[] | null => {
	if (!value) return null
	const normalized = value
		.map(id => Number(id))
		.filter(id => Number.isFinite(id))
	return normalized
}

const areCustomerIdsEqual = (left: number[], right: number[]): boolean => {
	if (left.length !== right.length) return false
	const leftSorted = [...left].sort((a, b) => a - b)
	const rightSorted = [...right].sort((a, b) => a - b)
	return leftSorted.every((value, index) => value === rightSorted[index])
}

const reportingWizardStorageKey = (userId: string | number | undefined): string | null =>
	userId != null && userId !== '' ? `aip-customer-reporting-wizard:${userId}` : null

// Step indicator component
const StepIndicator = ({ 
  step, 
  currentStep, 
  isCompleted, 
  icon: Icon, 
  label 
}: { 
  step: ReportingStep; 
  currentStep: ReportingStep; 
  isCompleted: boolean; 
  icon: React.ElementType;
  label: string;
}) => {
  const stepOrder = { customer: 1, page: 2, site: 3 };
  const isCurrent = currentStep === step;
  const isPast = stepOrder[currentStep] > stepOrder[step];
  
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "h-10 w-10 rounded-full flex items-center justify-center",
        isCurrent && "bg-blue-600 text-white shadow-lg shadow-blue-500/30",
        isPast || isCompleted ? "bg-emerald-500 text-white" : "",
        !isCurrent && !isPast && !isCompleted && "bg-gray-100 text-gray-400 border-2 border-gray-200"
      )}>
        {isPast || isCompleted ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </div>
      <div className="hidden sm:block">
        <p className={cn(
          "text-sm font-semibold",
          isCurrent && "text-blue-600",
          isPast || isCompleted ? "text-emerald-600" : "",
          !isCurrent && !isPast && !isCompleted && "text-gray-400"
        )}>
          {label}
        </p>
      </div>
    </div>
  );
};

// === Component ===
export default function CustomerReportingPage(): React.JSX.Element {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSites, setIsLoadingSites] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<ReportingStep>('customer');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
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
  const assignedCustomerIdsKey = useMemo(() => {
    const ids = user && 'assignedCustomerIds' in user ? user.assignedCustomerIds : undefined
    if (!ids?.length) return '';
    return [...ids].sort((a, b) => a - b).join('|');
  }, [user]);

  const isOfficerViewer = useMemo(
    () => harmonizeRole(user?.pageAccessRole ?? user?.role) === 'securityofficer',
    [user?.pageAccessRole, user?.role]
  );

  const restoreAttemptedRef = useRef(false);

  const fetchCustomerReportingData = async () => {
    try {
      if (!user) {
        setCustomers([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      let customerData = await customerService.getAllCustomers();

      if (harmonizeRole(user.pageAccessRole ?? user.role) === 'securityofficer') {
        let assignedCustomerIds = normalizeAssignedCustomerIds(
          'assignedCustomerIds' in user ? user.assignedCustomerIds : undefined
        ) ?? [];

        try {
          const response = await api.get<BackendApiResponse<AuthUserPayload>>('/Auth/me');
          const userData = getApiData(response.data);
          const latestAssignedIds = normalizeAssignedCustomerIds(
            userData?.assignedCustomerIds ?? userData?.AssignedCustomerIds
          );

          if (latestAssignedIds && !areCustomerIdsEqual(latestAssignedIds, assignedCustomerIds)) {
            if (user.role !== 'customer') {
              const updatedUser: StaffUser = {
                ...user,
                assignedCustomerIds: latestAssignedIds,
              };
              window.dispatchEvent(new CustomEvent<User>('user-assignments-updated', { detail: updatedUser }));
            }
            assignedCustomerIds = latestAssignedIds;
          }
        } catch (error) {
          console.warn('Failed to fetch from /Auth/me, using cached assignments:', error);
        }

        const assignedIdsAsNumbers = assignedCustomerIds.filter(id => Number.isFinite(id));

        customerData = customerData.filter(customer => {
          const customerId = resolveNumericCustomerId(customer);
          return customerId !== null && assignedIdsAsNumbers.includes(customerId);
        });

        if (customerData.length === 0 && assignedIdsAsNumbers.length > 0) {
          try {
            const allCustomers = await customerService.getAllCustomers();
            customerData = allCustomers.filter(customer => {
              const customerId = resolveNumericCustomerId(customer);
              return customerId !== null && assignedIdsAsNumbers.includes(customerId);
            });
          } catch (error) {
            console.error('Failed to fetch from API:', error);
          }
        }
      }

      setCustomers(customerData);
      void preloadAssignedCounts(customerData);
      
    } catch (error) {
      console.error('Error fetching customer data:', error);
      setError('Failed to load customer data');
    } finally {
      setIsLoading(false);
    }
  };

  const preloadAssignedCounts = async (customerList: Customer[]) => {
    try {
      const forcePageAccessRefresh =
        !!user &&
        harmonizeRole(user.pageAccessRole ?? user.role) === 'securityofficer';

      const entries = await Promise.all(
        customerList.map(async (customer) => {
          const numericId = resolveNumericCustomerId(customer);
          if (numericId === null) return null;

          try {
            const access = await customerPageAccessCache.get(numericId, {
              force: forcePageAccessRefresh,
            });
            return [
              String(numericId),
              filterAssignedCustomerPages(access.availablePages, access.assignedPageIds).length,
            ] as const;
          } catch (error) {
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
      console.error('Error preloading assignment counts:', error);
    }
  };

  const fetchSitesForCustomer = useCallback(async (customerId: number): Promise<Site[]> => {
    try {
      setIsLoadingSites(true);
      const response = await siteService.getSitesByCustomer(customerId);

      if (response.success && response.data?.length) {
        const sortedSites = [...response.data].sort((a, b) =>
          (a.locationName || '').localeCompare(b.locationName || '')
        );
        setSites(sortedSites);
        return sortedSites;
      }
      setSites([]);
      return [];
    } catch (error) {
      console.error('Error fetching sites:', error);
      setSites([]);
      return [];
    } finally {
      setIsLoadingSites(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomerReportingData();
  }, [user?.id, user?.role, user?.pageAccessRole, assignedCustomerIdsKey]);

  useEffect(() => {
    const handleUserAssignmentUpdate = () => {
      fetchCustomerReportingData();
    };

    window.addEventListener('user-assignments-updated', handleUserAssignmentUpdate as EventListener);
    
    return () => {
      window.removeEventListener('user-assignments-updated', handleUserAssignmentUpdate as EventListener);
    };
  }, [user?.id, user?.role, user?.pageAccessRole]);

  const getIcon = (iconName: string | undefined) => {
    if (!iconName) return FileText;
    return iconMap[iconName as keyof typeof iconMap] || FileText;
  };

  const loadPagesForCustomer = useCallback(async (customerId: number): Promise<CustomerPage[]> => {
    try {
      setPageAccessState({ isLoading: true, error: null, pages: [] });

      const access = await customerPageAccessCache.get(customerId);

      const assignedPages = filterAssignedCustomerPages(access.availablePages, access.assignedPageIds).map(
        mapAccessPageToCustomerPage
      );

      setPageAccessState({
        isLoading: false,
        error: null,
        pages: assignedPages
      });

      setAssignedPageCounts(prev => ({
        ...prev,
        [String(customerId)]: assignedPages.length
      }));
      return assignedPages;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load customer pages';
      setPageAccessState({
        isLoading: false,
        error: message,
        pages: []
      });
      return [];
    }
  }, []);

  const selectReportingCustomer = useCallback(
    async (
      customer: Customer,
      preserveSelection?: { pagePath?: string; siteId?: number | string }
    ) => {
      setSelectedCustomer(customer);
      const numericId = resolveNumericCustomerId(customer);

      if (numericId === null) {
        setSelectedPage(null);
        setSelectedSite(null);
        setCurrentStep('page');
        setPageAccessState({
          isLoading: false,
          error: 'Invalid customer identifier',
          pages: []
        });
        setSites([]);
        return;
      }

      const pagePath = preserveSelection?.pagePath;
      const shouldPreserve = Boolean(pagePath);

      if (!shouldPreserve) {
        setSelectedPage(null);
        setSelectedSite(null);
        setCurrentStep('page');
      }

      const [pages, loadedSites] = await Promise.all([
        loadPagesForCustomer(numericId),
        fetchSitesForCustomer(numericId),
      ]);

      if (shouldPreserve && pagePath) {
        const matchPage = pages.find(
          (p) => p.path === pagePath || String(p.id) === String(pagePath)
        );
        if (matchPage) {
          setSelectedPage(matchPage);
          setCurrentStep('site');
          const rawSiteId = preserveSelection?.siteId;
          if (rawSiteId != null && rawSiteId !== '') {
            const sid = Number(rawSiteId);
            const matchSite = loadedSites.find((s) => Number(s.siteID) === sid);
            setSelectedSite(matchSite ?? null);
          } else {
            setSelectedSite(null);
          }
          return;
        }
      }

      if (shouldPreserve) {
        setSelectedPage(null);
        setSelectedSite(null);
        setCurrentStep('page');
      }
    },
    [loadPagesForCustomer, fetchSitesForCustomer]
  );

  const handleCustomerSelect = (customer: Customer) => {
    void selectReportingCustomer(customer);
  };

  useEffect(() => {
    if (!isOfficerViewer || !user?.id || customers.length === 0 || restoreAttemptedRef.current) {
      return;
    }
    const key = reportingWizardStorageKey(user.id);
    if (!key) return;

    let parsed: { customerId?: number; pagePath?: string; siteId?: number | string };
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return;
      parsed = JSON.parse(raw) as typeof parsed;
    } catch {
      return;
    }

    const cid = parsed.customerId != null ? Number(parsed.customerId) : NaN;
    if (!Number.isFinite(cid)) return;

    const customerMatch = customers.find((c) => resolveNumericCustomerId(c) === cid);
    if (!customerMatch) return;

    restoreAttemptedRef.current = true;
    void selectReportingCustomer(customerMatch, {
      pagePath: parsed.pagePath,
      siteId: parsed.siteId,
    });
  }, [isOfficerViewer, user?.id, customers, selectReportingCustomer]);

  useEffect(() => {
    const handlePageAccessUpdate = (event: CustomEvent) => {
      const { customerId } = event.detail;
      const numericId = resolveNumericCustomerId(selectedCustomer);
      
      if (numericId !== null && numericId === customerId) {
        customerPageAccessCache.clear(customerId);
        void loadPagesForCustomer(numericId);
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
    if (!selectedCustomer || !selectedPage || !selectedSite) return;

    const numericCustomerId = resolveNumericCustomerId(selectedCustomer);
    const customerIdForUrl = numericCustomerId ?? selectedCustomer.id;

    if (!customerIdForUrl) return;

    if (isOfficerViewer && user?.id != null) {
      const key = reportingWizardStorageKey(user.id);
      if (key) {
        try {
          sessionStorage.setItem(
            key,
            JSON.stringify({
              customerId: Number(customerIdForUrl),
              pagePath: selectedPage.path,
              siteId: selectedSite.siteID,
            })
          );
        } catch {
          /* ignore quota / private mode */
        }
      }
    }

    const url = `${selectedPage.path}?customerId=${customerIdForUrl}&siteId=${selectedSite.siteID}`;
    navigate(url);
  };

  const handleBackToCustomers = () => {
    setCurrentStep('customer');
    setSelectedCustomer(null);
    setSelectedPage(null);
    setSelectedSite(null);
    restoreAttemptedRef.current = false;
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
  const totalAssignedReports = Object.values(assignedPageCounts).reduce((sum, value) => sum + value, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EFF4FF]">
        <div className="container mx-auto max-w-screen-2xl px-4 py-8 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="h-20 w-20 rounded-2xl bg-blue-100 flex items-center justify-center">
              <FileBarChart className="h-10 w-10 text-blue-600" />
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading customer data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#EFF4FF]">
        <div className="container mx-auto max-w-screen-2xl px-4 py-8 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="h-20 w-20 rounded-2xl bg-red-100 flex items-center justify-center mb-5">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => fetchCustomerReportingData()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFF4FF]">
      <div className="container mx-auto max-w-screen-2xl px-4 py-6 lg:px-8 lg:py-8 space-y-6">
        
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileBarChart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customer Reporting</h1>
                  <p className="text-gray-500 text-sm">
                    Select a customer, choose a report type, and pick a site
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Customers</p>
                <p className="text-base font-semibold text-slate-900">{customers.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Assigned reports</p>
                <p className="text-base font-semibold text-slate-900">{totalAssignedReports}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Sites loaded</p>
                <p className="text-base font-semibold text-slate-900">{sites.length}</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <StepIndicator 
                step="customer" 
                currentStep={currentStep} 
                isCompleted={!!selectedCustomer}
                icon={Building2}
                label="Select Customer"
              />
              
              <div className="flex-1 mx-4 h-1 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                <div className={cn(
                  "h-full bg-gradient-to-r from-emerald-500 to-blue-500",
                  currentStep === 'customer' && "w-0",
                  currentStep === 'page' && "w-1/2",
                  currentStep === 'site' && "w-full"
                )} />
              </div>
              
              <StepIndicator 
                step="page" 
                currentStep={currentStep} 
                isCompleted={!!selectedPage}
                icon={ClipboardList}
                label="Choose Report"
              />
              
              <div className="flex-1 mx-4 h-1 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                <div className={cn(
                  "h-full bg-gradient-to-r from-blue-500 to-purple-500",
                  (currentStep === 'customer' || currentStep === 'page') && "w-0",
                  currentStep === 'site' && selectedSite && "w-full",
                  currentStep === 'site' && !selectedSite && "w-1/2"
                )} />
              </div>
              
              <StepIndicator 
                step="site" 
                currentStep={currentStep} 
                isCompleted={!!selectedSite}
                icon={MapPin}
                label="Select Site"
              />
            </div>
          </CardContent>
        </Card>

        {isOfficerViewer && selectedCustomer && currentStep !== 'customer' && (
          <Card className="border-blue-100 bg-blue-50/40 shadow-sm overflow-hidden">
            <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-slate-900">Switch assigned customer</p>
                <p className="text-xs text-slate-600">
                  Keep the same report and site when they exist for the next customer
                </p>
              </div>
              <Select
                value={String(resolveNumericCustomerId(selectedCustomer) ?? '')}
                onValueChange={(value) => {
                  const next = customers.find((c) => String(resolveNumericCustomerId(c)) === value);
                  if (!next) return;
                  void selectReportingCustomer(next, {
                    pagePath: selectedPage?.path,
                    siteId: selectedSite?.siteID,
                  });
                }}
              >
                <SelectTrigger className="w-full sm:w-80 bg-white" aria-label="Switch customer">
                  <SelectValue placeholder="Customer" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {customers.map((c) => {
                    const id = resolveNumericCustomerId(c);
                    if (id === null) return null;
                    return (
                      <SelectItem key={String(id)} value={String(id)}>
                        {c.companyName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Customer Selection */}
        {currentStep === 'customer' && (
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-200 bg-slate-50/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-lg">Select a Customer</CardTitle>
                    <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200">
                      {filteredCustomers.length} available
                    </Badge>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-72 bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCustomers.map((customer, index) => {
                    const numericId = resolveNumericCustomerId(customer);
                    const assignedCount = numericId !== null
                      ? (assignedPageCounts[String(numericId)] ?? 0)
                      : 0;

                    return (
                      <Card 
                        key={buildCustomerKey(customer, index)} 
                        className="cursor-pointer border border-gray-200 hover:border-indigo-300 hover:shadow-lg group"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-200">
                              <Building2 className="h-5 w-5 text-indigo-600" />
                            </div>
                            <Badge variant="outline" className="text-xs bg-gray-50">
                              ID: {customer.id}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600">
                            {customer.companyName}
                          </h3>
                          <p className="text-sm text-gray-500 mb-4 line-clamp-1">
                            {typeof customer.address === 'string' 
                              ? customer.address 
                              : customer.address?.street || 'No address specified'
                            }
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge className="bg-emerald-100 text-emerald-700 border-0">
                              {assignedCount} Reports
                            </Badge>
                            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-500" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {filteredCustomers.length === 0 && (
                  <div className="text-center py-16">
                    <div className="h-20 w-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                      <Users className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers found</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      {searchTerm ? 'Try adjusting your search criteria.' : 'No customers are available for reporting.'}
                    </p>
                    {harmonizeRole(user?.pageAccessRole ?? user?.role) === 'securityofficer' && (
                      <Button
                        onClick={async () => {
                          try {
                            const response = await api.get<BackendApiResponse<AuthUserPayload>>(`/User/${user.id}`)
                            const userData = getApiData(response.data)
                            const latestAssignedIds = normalizeAssignedCustomerIds(
                              userData?.assignedCustomerIds ?? userData?.AssignedCustomerIds
                            )
                            if (latestAssignedIds && user && user.role !== 'customer') {
                              const updatedUser: StaffUser = {
                                ...user,
                                assignedCustomerIds: latestAssignedIds,
                              };
                              window.dispatchEvent(new CustomEvent<User>('user-assignments-updated', { detail: updatedUser }));
                            }
                            fetchCustomerReportingData()
                          } catch (error) {
                            console.error('Failed to refresh user data:', error)
                          }
                        }}
                        variant="outline"
                        className="gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Refresh Assignments
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Page Selection */}
        {currentStep === 'page' && selectedCustomer && (
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-200 bg-slate-50/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <ClipboardList className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">Choose Report Type</CardTitle>
                    </div>
                    <p className="text-sm text-gray-500">for {selectedCustomer.companyName}</p>
                  </div>
                  <Button variant="outline" onClick={handleBackToCustomers} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {pageAccessState.isLoading && (
                  <div className="text-center py-16">
                    <FileText className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading available reports...</p>
                  </div>
                )}

                {!pageAccessState.isLoading && pageAccessState.error && (
                  <div className="text-center py-16">
                    <div className="h-20 w-20 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-5">
                      <AlertCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <p className="text-red-600">{pageAccessState.error}</p>
                  </div>
                )}

                {!pageAccessState.isLoading && !pageAccessState.error && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availablePages.map((page) => {
                      const IconComponent = getIcon(page.icon);
                      return (
                        <Card 
                          key={page.id} 
                          className="cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-lg group"
                          onClick={() => handlePageSelect(page)}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 flex-shrink-0">
                                <IconComponent className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600">
                                  {page.title}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{page.description}</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 flex-shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {!pageAccessState.isLoading && !pageAccessState.error && availablePages.length === 0 && (
                  <div className="text-center py-16">
                    <div className="h-20 w-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports available</h3>
                    <p className="text-gray-500">
                      This customer doesn't have any reporting pages configured.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Site Selection */}
        {currentStep === 'site' && selectedCustomer && selectedPage && (
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-200 bg-slate-50/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <MapPin className="h-5 w-5 text-purple-600" />
                      <CardTitle className="text-lg">Select Site</CardTitle>
                    </div>
                    <p className="text-sm text-gray-500">
                      {selectedPage.title} at {selectedCustomer.companyName}
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleBackToPages} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingSites ? (
                  <div className="text-center py-16">
                    <MapPin className="h-10 w-10 text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading sites...</p>
                  </div>
                ) : sites.length > 0 ? (
                  <div className="max-w-xl mx-auto space-y-6">
                    {/* Info Card */}
                    <Card className="border-amber-200 bg-amber-50/70">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-amber-800 font-medium text-sm">
                              Select a site to continue
                            </p>
                            <p className="text-amber-700 text-sm mt-1">
                              Choose the site you want to view reports for from the dropdown below.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Site Selector */}
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Available Sites
                      </label>
                      <Select 
                        value={selectedSite ? String(selectedSite.siteID) : ''} 
                        onValueChange={(value) => {
                          const site = sites.find(s => String(s.siteID) === value);
                          if (site) {
                            handleSiteSelect(site);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full h-12 bg-white border-slate-300">
                          <SelectValue placeholder="Select a site..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {sites.map((site) => {
                            const siteValue = String(site.siteID);
                            return (
                              <SelectItem key={siteValue} value={siteValue}>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  {site.locationName || `Site ${siteValue}`}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>

                      {/* Continue Button */}
                      {selectedSite && (
                        <Button 
                          onClick={handleNavigateToReport} 
                          className="w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-sm"
                        >
                          <span>Continue to Report</span>
                          <ChevronRight className="h-5 w-5 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="h-20 w-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                      <MapPin className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No sites available</h3>
                    <p className="text-gray-500">
                      This customer doesn't have any sites configured yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
