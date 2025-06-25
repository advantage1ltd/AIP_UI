import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  AlertCircle,
  Star,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  FileText,
  TrendingUp,
  CheckCircle,
  Building2,
  Store,
  ChevronLeft,
  ChevronRightIcon
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts'
import { cn } from '@/lib/utils'
import { IncidentTable } from '@/components/dashboard/IncidentTable'
import { DashboardGreeting } from '@/components/dashboard/DashboardGreeting'
import { useState, useEffect, useMemo, useRef } from 'react'
import { customerDashboardService } from '@/services/dashboardService'
import { CustomerRole, StoreData, Region, CustomerStoreData, DailyActivity, SatisfactionDataPoint, BeSafeDataPoint, Site } from '@/types/dashboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuth } from '@/hooks/useAuth'
import { AVAILABLE_CUSTOMERS } from '@/types/user'

interface CustomerDashboardProps {
  userRole: CustomerRole
}

const CustomerDashboard = ({ userRole }: CustomerDashboardProps) => {
  const { user } = useAuth();
  const mountedRef = useRef(true);
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [siteData, setSiteData] = useState<CustomerStoreData | null>(null);
  const [satisfactionData, setSatisfactionData] = useState<SatisfactionDataPoint[]>([]);
  const [beSafeData, setBeSafeData] = useState<BeSafeDataPoint[]>([]);
  const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>([]);
  const [activePeriod, setActivePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [showAllMonths, setShowAllMonths] = useState(true);
  const [showAllMonthsBeSafe, setShowAllMonthsBeSafe] = useState(true);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');

  const isSiteManager = userRole === 'CustomerSiteManager';

  const customerName = useMemo(() => {
    if (user?.customerId) {
      const customer = AVAILABLE_CUSTOMERS.find(c => c.id === user.customerId);
      return customer?.name || 'Customer';
    }
    return 'Customer';
  }, [user]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Helper to get the list of site IDs to aggregate
  const getSiteIdsToAggregate = () => {
    if (selectedRegion === 'all' || !selectedRegion) {
      if (selectedSite === 'all' || !selectedSite) {
        return sites.map(site => site.id);
      }
      return [selectedSite];
    } else {
      const regionSites = sites.filter(site => site.regionId === selectedRegion);
      if (selectedSite === 'all' || !selectedSite) {
        return regionSites.map(site => site.id);
      }
      return [selectedSite];
    }
  };

  const filteredSites = useMemo(() => {
    if (!selectedRegion || selectedRegion === 'all') {
      return sites;
    }
    return sites.filter(site => site.regionId === selectedRegion);
  }, [selectedRegion, sites]);

  // Load initial data, filtered by customerId
  useEffect(() => {
    const abortController = new AbortController();
    let isActive = true;

    const loadInitialData = async () => {
      try {
        if (!isActive) return;
        setLoading(true);
        setError(null);

        // Load all data
        const storesData = await customerDashboardService.getStores(abortController.signal);
        const regionsData = await customerDashboardService.getRegions(abortController.signal);
        const sitesData = await customerDashboardService.getSites(abortController.signal);

        // Filter by user.customerId
        const filteredStores = storesData.filter(s => s.customerId === user.customerId);
        const filteredRegions = regionsData.filter(r => r.customerId === user.customerId);
        const filteredSites = sitesData.filter(s => s.customerId === user.customerId);

        setRegions(filteredRegions);
        setSites(filteredSites);

        // Set initial selections
        if (filteredRegions.length > 0) {
          setSelectedRegion('all');
        }
        if (filteredSites.length > 0) {
          setSelectedSite('all');
        }
        setLoading(false);
      } catch (err) {
        if (!(err instanceof Error && err.name === 'AbortError')) {
          setError('Failed to load initial data');
        }
        setLoading(false);
      }
    };

    loadInitialData();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [user?.customerId]);

  // Reset site selection when region changes
  useEffect(() => {
    // When region changes, reset site selection to "all" by default
    if (selectedRegion === 'all') {
      setSelectedSite('all'); // Show all sites when all regions selected
    } else {
      // When a specific region is selected, show all sites in that region
      setSelectedSite('all');
    }
  }, [selectedRegion]);

  // Load site or aggregate data when selection changes
  useEffect(() => {
    const siteIds = getSiteIdsToAggregate();
    console.log('🔍 CustomerDashboard - Loading data for siteIds:', siteIds);
    console.log('🔍 CustomerDashboard - Selected region:', selectedRegion);
    console.log('🔍 CustomerDashboard - Selected site:', selectedSite);
    console.log('🔍 CustomerDashboard - Available sites:', sites.map(s => ({ id: s.id, name: s.locationName })));
    console.log('🔍 CustomerDashboard - Customer ID:', user?.customerId);
    
    if (!siteIds.length) {
      console.log('❌ CustomerDashboard - No site IDs to load');
      return;
    }

    let isActive = true;
    const abortController = new AbortController();

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        setSiteData(null);

        let data;
        if (siteIds.length === 1) {
          // Single site
          console.log('🔍 CustomerDashboard - Loading single site data for:', siteIds[0]);
          data = await customerDashboardService.getSiteData(siteIds[0], abortController.signal);
        } else {
          // Aggregate multiple sites
          console.log('🔍 CustomerDashboard - Loading aggregated data for sites:', siteIds);
          data = await customerDashboardService.getAggregatedSitesData(siteIds, abortController.signal);
        }
        
        console.log('🔍 CustomerDashboard - Received site data:', data);
        console.log('🔍 CustomerDashboard - Recent incidents count:', data?.recentIncidents?.length || 0);
        
        const [satisfaction, beSafe, activities] = await Promise.all([
          customerDashboardService.getSatisfactionData(abortController.signal),
          customerDashboardService.getBeSafeData(abortController.signal),
          customerDashboardService.getDailyActivities(abortController.signal)
        ]);
        if (!isActive) return;
        setSiteData(data);
        setSatisfactionData(satisfaction || []);
        setBeSafeData(beSafe || []);
        setDailyActivities(activities || []);
      } catch (err) {
        console.error('❌ CustomerDashboard - Error loading data:', err);
        if (isActive) {
          setError('Failed to load dashboard data');
          setSiteData(null);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };
    loadData();
    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [selectedRegion, selectedSite, sites]);

  // Compute which data to show for each chart
  const satisfactionDataToShow = useMemo(() => {
    if (showAllMonths || satisfactionData.length <= 12) return satisfactionData;
    return satisfactionData.slice(-12);
  }, [showAllMonths, satisfactionData]);

  const beSafeDataToShow = useMemo(() => {
    if (showAllMonthsBeSafe || beSafeData.length <= 12) return beSafeData;
    return beSafeData.slice(-12);
  }, [showAllMonthsBeSafe, beSafeData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="alert">
        <div className="text-center p-4 rounded-lg bg-white shadow-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="min-w-[120px] h-10"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Wait for store data to be loaded
  if (!siteData) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // For HO Managers, we can show the dashboard without store data
  // For Site Managers, we need store data
  const metrics = siteData?.metrics?.[userRole] || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[90rem] py-4 sm:py-6 lg:py-8">
        <header className="mb-6 sm:mb-8">
          <DashboardGreeting className="mb-6" />

          {/* Development Debug Info */}
          {import.meta.env.DEV && user && (
            <Card className="mb-4 border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Debug Info (Dev Only)</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-blue-600">
                <div>Customer ID: {user.customerId || 'Not found'}</div>
                <div>Customer Name: {customerName}</div>
                <div>User Role: {userRole}</div>
                <div>Username: {user.username}</div>
              </CardContent>
            </Card>
          )}

          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold">
                {customerName} Overview
              </h1>
              <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-gray-500" aria-hidden="true" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full sm:w-[200px] h-11">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={selectedSite} 
                onValueChange={setSelectedSite}
              >
                <SelectTrigger className="w-full sm:w-[250px] h-11">
                  <SelectValue placeholder="Select Site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {filteredSites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.locationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <div className="space-y-6 sm:space-y-8">
          {/* Metrics Grid */}
          <section aria-label="Key Metrics" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <Card
                key={index}
                className={cn(
                  "relative overflow-hidden border-none shadow-lg transition-transform hover:scale-[1.02]",
                  metrics.length % 2 !== 0 && index === metrics.length - 1 ? "col-span-2 sm:col-span-1" : "",
                  metric.color === 'green' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
                  metric.color === 'amber' ? 'bg-gradient-to-br from-amber-500 to-amber-700' :
                  metric.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                  'bg-gradient-to-br from-purple-500 to-purple-700'
                )}
              >
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg text-white/90 font-medium">
                      {metric.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    {metric.value}
                  </div>
                  <div className="flex items-center mt-2 sm:mt-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/20 text-white text-sm">
                      {metric.trend === 'up' ? 
                        <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5" aria-hidden="true" /> : 
                        <ArrowDownRight className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5" aria-hidden="true" />
                      }
                      {metric.change}
                    </span>
                    <span className="ml-2 text-sm text-white/70">
                      {metric.trend === 'up' ? 'increase' : 'decrease'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Charts */}
            <section className="lg:col-span-2 space-y-6" aria-label="Charts and Reports">
              {/* Incident Graph */}
              <Card>
                <CardHeader className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-lg sm:text-xl font-semibold">
                      Incident Reports
                    </CardTitle>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#10B981]" aria-hidden="true" />
                        <span>Uniform Officers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#F59E0B]" aria-hidden="true" />
                        <span>Store Detectives</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto">
                    <div className="bg-gray-100 rounded-lg p-1 flex text-sm">
                      {(["daily", "weekly", "monthly", "yearly"] as const).map((period) => (
                        <button
                          key={period}
                          onClick={() => setActivePeriod(period)}
                          className={cn(
                            "flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-colors capitalize",
                            period === activePeriod
                              ? "bg-white shadow-sm text-emerald-600 font-medium"
                              : "text-gray-600 hover:text-gray-900"
                          )}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="h-[300px] sm:h-[350px] lg:h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={siteData.incidentData[activePeriod]}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="uniformOfficersGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#10B981" stopOpacity={0.2} />
                          </linearGradient>
                          <linearGradient id="storeDetectivesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                        <XAxis
                          dataKey={activePeriod === 'daily' ? 'date' : activePeriod === 'weekly' ? 'week' : activePeriod === 'monthly' ? 'month' : 'year'}
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          className="text-gray-500"
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          className="text-gray-500"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="uniformOfficers"
                          stackId="1"
                          stroke="#10B981"
                          fill="url(#uniformOfficersGradient)"
                          name="Uniform Officers"
                        />
                        <Area
                          type="monotone"
                          dataKey="storeDetectives"
                          stackId="1"
                          stroke="#F59E0B"
                          fill="url(#storeDetectivesGradient)"
                          name="Store Detectives"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Be Safe Be Secure Graph */}
              <Card>
                <CardHeader className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-semibold">
                      Be Safe Be Secure Compliance
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Monthly compliance metrics</p>
                  </div>
                  {beSafeData.length > 12 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllMonthsBeSafe(v => !v)}
                      className="h-9"
                    >
                      {showAllMonthsBeSafe ? 'Show Last 12 Months' : 'Show All Months'}
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[300px] sm:h-[350px] w-full overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={beSafeDataToShow}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        barCategoryGap={20}
                      >
                        <defs>
                          <linearGradient id="insecureAreasGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#D97706" stopOpacity={0.8} />
                          </linearGradient>
                          <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                          </linearGradient>
                          <linearGradient id="systemsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#2563EB" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          padding={{ left: 10, right: 10 }}
                        />
                        <YAxis 
                          domain={[75, 100]}
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(0, 0, 0, 0.05)', radius: 4 }}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          }}
                          formatter={(value: number) => [`${value}%`, '']}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="circle"
                          formatter={(value) => <span className="text-sm">{value}</span>}
                        />
                        <Bar 
                          dataKey="insecureAreas" 
                          fill="url(#insecureAreasGradient)"
                          name="Insecure Areas"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="compliance" 
                          fill="url(#complianceGradient)"
                          name="Compliance"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="systems" 
                          fill="url(#systemsGradient)"
                          name="Systems"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Incidents Table */}
              <Card>
                <CardHeader className="p-4 sm:p-5">
                  <CardTitle className="text-lg sm:text-xl font-semibold">
                    Recent Incidents
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <div className="min-w-full p-4">
                      <IncidentTable data={siteData?.recentIncidents || []} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Right Column - Activities and Satisfaction */}
            <section className="space-y-6" aria-label="Activities and Satisfaction">
              {/* Daily Activities */}
              <Card>
                <CardHeader className="p-4 sm:p-5">
                  <CardTitle className="text-lg sm:text-xl font-semibold">
                    Daily Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {dailyActivities.map((activity) => (
                      <div 
                        key={activity.id} 
                        className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className={cn(
                          "mt-0.5 p-2 rounded-full",
                          activity.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                        )}>
                          {activity.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" aria-hidden="true" />
                          ) : (
                            <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" aria-hidden="true" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-base sm:text-lg font-medium">{activity.type}</p>
                            <time className="text-sm text-gray-500">{activity.time}</time>
                          </div>
                          <p className="text-sm text-gray-600">{activity.location}</p>
                          <p className="text-sm text-gray-500">{activity.officer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Satisfaction Survey */}
              <Card>
                <CardHeader className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-lg sm:text-xl font-semibold">
                    Satisfaction Survey
                  </CardTitle>
                  {satisfactionData.length > 12 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllMonths(v => !v)}
                      className="h-9"
                    >
                      {showAllMonths ? 'Show Last 12 Months' : 'Show All Months'}
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[250px] sm:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart 
                        data={satisfactionDataToShow} 
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="satisfactionGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          padding={{ left: 10, right: 10 }}
                        />
                        <YAxis
                          domain={[4, 5]}
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value.toFixed(1)}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          }}
                          formatter={(value: number) => [`${value.toFixed(2)}`, 'Score']}
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="#f59e0b"
                          fill="url(#satisfactionGradient)"
                          strokeWidth={2}
                          name="Satisfaction Score"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CustomerDashboard; 