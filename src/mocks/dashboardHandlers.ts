import { http, HttpResponse } from 'msw'
import type { CustomerStoreData, CustomerRole, DailyActivity, Site, Metric } from '@/types/dashboard'
import db from '../../db.json'

// Helper function to get customer ID from request
const getCustomerId = (request: Request) => {
  const customerId = request.headers.get('X-Customer-Id')
  return customerId ? parseInt(customerId, 10) : 21 // Default to Central England COOP
}

// Load JSON data
const loadData = async () => {
  return db
}

// Helper function to load data from db.json
const loadDashboardData = async () => {
  return db.dashboard
}

// Helper function to calculate dynamic metrics for a customer
const calculateDynamicMetrics = (customerId: number, siteId?: string) => {
  // Get all incidents for this customer
  const customerIncidents = db.dashboard.incidents.filter(i => i.customerId === customerId)
  
  console.log('🔍 calculateDynamicMetrics - Customer incidents found:', customerIncidents.length);
  console.log('🔍 First few incident dates:', customerIncidents.slice(0, 5).map(i => ({ id: i.id, date: i.date })));
  
  // Filter by site if specified
  const incidents = siteId 
    ? customerIncidents.filter(i => i.siteId === siteId)
    : customerIncidents
  
  console.log('🔍 After site filtering, incidents count:', incidents.length);
  
  // Get customer sites
  const customerSites = db.sites.filter(s => s.customerId === customerId)
  const activeSites = siteId 
    ? customerSites.filter(s => s.id === siteId)
    : customerSites.filter(s => s.status === 'active')
  
  // Calculate date ranges
  const now = new Date()
  const currentYear = now.getFullYear()
  const startOfYear = new Date(currentYear, 0, 1)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  console.log('🔍 Date calculations:', {
    currentYear,
    startOfYear: startOfYear.toISOString(),
    startOfMonth: startOfMonth.toISOString(),
    today: today.toISOString()
  });
  
  // Calculate YTD incidents
  const ytdIncidents = incidents.filter(i => {
    const incidentDate = new Date(i.date)
    const isYTD = incidentDate >= startOfYear
    if (isYTD) {
      console.log('🔍 YTD incident found:', { id: i.id, date: i.date, incidentDate: incidentDate.toISOString() });
    }
    return isYTD
  })
  
  console.log('🔍 YTD incidents count:', ytdIncidents.length);
  
  // Calculate monthly incidents
  const monthlyIncidents = incidents.filter(i => {
    const incidentDate = new Date(i.date)
    return incidentDate >= startOfMonth
  })
  
  // Calculate today's incidents
  const todayIncidents = incidents.filter(i => {
    const incidentDate = new Date(i.date)
    return incidentDate.toDateString() === today.toDateString()
  })
  
  // Calculate total value
  const totalValue = incidents.reduce((sum, i) => sum + (i.value || i.amount || 0), 0)
  const ytdValue = ytdIncidents.reduce((sum, i) => sum + (i.value || i.amount || 0), 0)
  
  // Calculate activity score (based on incidents per site ratio and value)
  const avgIncidentsPerSite = activeSites.length > 0 ? incidents.length / activeSites.length : 0
  const activityScore = Math.max(0, Math.min(100, 100 - (avgIncidentsPerSite * 3) + (totalValue / 1000)))
  
  // Get satisfaction data for this customer
  const satisfactionData = db.satisfactionData?.filter(s => s.customerId === customerId) || []
  const latestSatisfaction = satisfactionData.length > 0 
    ? satisfactionData[satisfactionData.length - 1].score 
    : 4.5
  
  // Calculate previous period for trends
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
  const prevMonthIncidents = incidents.filter(i => {
    const date = new Date(i.date)
    return date >= previousMonth && date <= previousMonthEnd
  })
  
  const monthlyChange = prevMonthIncidents.length > 0 
    ? Math.round(((monthlyIncidents.length - prevMonthIncidents.length) / prevMonthIncidents.length) * 100)
    : 0
  
  const ytdChange = Math.max(5, Math.min(25, Math.round(ytdIncidents.length * 0.1)))
  
  const result = {
    activityScore: Math.round(activityScore),
    totalIncidents: incidents.length,
    monthlyIncidents: monthlyIncidents.length,
    todayIncidents: todayIncidents.length,
    ytdIncidents: ytdIncidents.length,
    activeSites: activeSites.length,
    totalValue: totalValue,
    ytdValue: ytdValue,
    satisfaction: latestSatisfaction,
    monthlyChange: monthlyChange,
    ytdChange: ytdChange,
    activeSitesChange: Math.max(0, Math.round(activeSites.length * 0.1))
  }
  
  console.log('🔍 Final calculated metrics:', result);
  return result
}

// Helper function to calculate dynamic incident chart data
const calculateIncidentChartData = (customerId: number, siteId?: string) => {
  // Get customer incidents
  const customerIncidents = db.dashboard.incidents.filter(i => i.customerId === customerId);
  const incidents = siteId 
    ? customerIncidents.filter(i => i.siteId === siteId)
    : customerIncidents;

  console.log('🔍 Calculating incident chart data for customer:', customerId, 'incidents:', incidents.length);

  // Create date-based aggregations
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Generate daily data for last 30 days
  const dailyData = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayIncidents = incidents.filter(incident => 
      incident.date === dateStr
    );
    
    const uniformOfficers = dayIncidents
      .filter(i => i.officerType === 'uniform')
      .reduce((sum, i) => sum + (i.value || i.amount || 0), 0);
    
    const storeDetectives = dayIncidents
      .filter(i => i.officerType === 'detective')
      .reduce((sum, i) => sum + (i.value || i.amount || 0), 0);

    dailyData.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      uniformOfficers,
      storeDetectives
    });
  }

  // Generate weekly data for last 12 weeks
  const weeklyData = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i * 7 + now.getDay()));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekIncidents = incidents.filter(incident => {
      const incidentDate = new Date(incident.date);
      return incidentDate >= weekStart && incidentDate <= weekEnd;
    });
    
    const uniformOfficers = weekIncidents
      .filter(i => i.officerType === 'uniform')
      .reduce((sum, i) => sum + (i.value || i.amount || 0), 0);
    
    const storeDetectives = weekIncidents
      .filter(i => i.officerType === 'detective')
      .reduce((sum, i) => sum + (i.value || i.amount || 0), 0);

    weeklyData.push({
      week: `Week ${weeklyData.length + 1}`,
      uniformOfficers,
      storeDetectives
    });
  }

  // Generate monthly data for last 12 months
  const monthlyData = [];
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(currentYear, currentMonth - i, 1);
    const monthStr = monthDate.toISOString().substr(0, 7); // YYYY-MM format
    
    const monthIncidents = incidents.filter(incident => 
      incident.date.startsWith(monthStr)
    );
    
    const uniformOfficers = monthIncidents
      .filter(i => i.officerType === 'uniform')
      .reduce((sum, i) => sum + (i.value || i.amount || 0), 0);
    
    const storeDetectives = monthIncidents
      .filter(i => i.officerType === 'detective')
      .reduce((sum, i) => sum + (i.value || i.amount || 0), 0);

    monthlyData.push({
      month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      uniformOfficers,
      storeDetectives
    });
  }

  // Generate yearly data for last 5 years
  const yearlyData = [];
  for (let i = 4; i >= 0; i--) {
    const year = currentYear - i;
    const yearStr = year.toString();
    
    const yearIncidents = incidents.filter(incident => 
      incident.date.startsWith(yearStr)
    );
    
    const uniformOfficers = yearIncidents
      .filter(i => i.officerType === 'uniform')
      .reduce((sum, i) => sum + (i.value || i.amount || 0), 0);
    
    const storeDetectives = yearIncidents
      .filter(i => i.officerType === 'detective')
      .reduce((sum, i) => sum + (i.value || i.amount || 0), 0);

    yearlyData.push({
      year: year.toString(),
      uniformOfficers,
      storeDetectives
    });
  }

  console.log('🔍 Generated chart data - Daily points:', dailyData.length, 'Weekly points:', weeklyData.length);

  return {
    daily: dailyData,
    weekly: weeklyData,
    monthly: monthlyData,
    yearly: yearlyData
  };
}

export const sitesHandler = http.get('/api/dashboard/sites', () => {
  try {
    const sites: Site[] = db.sites
    return HttpResponse.json(sites)
  } catch (error) {
    console.error('Error in sites handler:', error)
    return new HttpResponse(null, { status: 500 })
  }
})

export const dashboardHandlers = [
  // Test handler to verify MSW is working
  http.get('/api/dashboard/test', async () => {
    console.log('🔍 Dashboard test handler called - MSW is working!');
    return HttpResponse.json({ message: 'Dashboard handlers are working', timestamp: Date.now() });
  }),

  // Get store data with real-time calculated metrics
  http.get('/api/dashboard/store/:storeId', async ({ request, params }) => {
    try {
      const { storeId } = params
      const customerId = getCustomerId(request)
      
      console.log('🔍 Store handler - Looking for:', { storeId, customerId })
      
      // Get store data from db.json
      const store = db.stores.find(s => s.id === storeId && s.customerId === customerId)
      console.log('📦 Store data found:', store)
      
      if (!store) {
        console.log('❌ No store found')
        return new HttpResponse(null, { status: 404 })
      }

      // Ensure storeId is a string
      const storeIdStr = Array.isArray(storeId) ? storeId[0] : storeId;
      
      // Calculate dynamic metrics for this customer and store
      const metrics = calculateDynamicMetrics(customerId, storeIdStr);
      console.log('📊 Calculated store dynamic metrics:', metrics);

      // Create dynamic metrics for CustomerHOManager
      const dynamicHOMetrics = [
        {
          title: "Overall Activity Score",
          value: `${metrics.activityScore}%`,
          change: metrics.activityScore > 85 ? "+8%" : "-3%",
          trend: metrics.activityScore > 85 ? "up" as const : "down" as const,
          icon: "Activity" as const,
          color: "green" as const
        },
        {
          title: "Total Incidents",
          value: metrics.totalIncidents.toString(),
          change: metrics.monthlyChange > 0 ? `+${metrics.monthlyChange}%` : `${metrics.monthlyChange}%`,
          trend: metrics.monthlyChange > 0 ? "up" as const : "down" as const,
          icon: "AlertCircle" as const,
          color: "amber" as const
        },
        {
          title: "Active Sites",
          value: metrics.activeSites.toString(),
          change: `+${metrics.activeSitesChange}`,
          trend: "up" as const,
          icon: "Building2" as const,
          color: "blue" as const
        },
        {
          title: "Total Incidents YTD",
          value: metrics.ytdIncidents.toString(),
          change: `+${metrics.ytdChange}`,
          trend: "up" as const,
          icon: "AlertCircle" as const,
          color: "amber" as const
        }
      ];

      // Create dynamic metrics for CustomerSiteManager
      const dynamicSiteMetrics = [
        {
          title: "Daily Activity Score",
          value: `${Math.max(80, metrics.activityScore - 5)}%`,
          change: metrics.activityScore > 85 ? "+6%" : "-2%",
          trend: metrics.activityScore > 85 ? "up" as const : "down" as const,
          icon: "Activity" as const,
          color: "green" as const
        },
        {
          title: "Incidents Today",
          value: metrics.todayIncidents.toString(),
          change: metrics.todayIncidents === 0 ? "0%" : "-25%",
          trend: metrics.todayIncidents === 0 ? "up" as const : "down" as const,
          icon: "AlertCircle" as const,
          color: "amber" as const
        },
        {
          title: "Customer Satisfaction",
          value: `${metrics.satisfaction.toFixed(1)}/5`,
          change: "+0.2",
          trend: "up" as const,
          icon: "Star" as const,
          color: "blue" as const
        },
        {
          title: "Total Incidents YTD",
          value: metrics.ytdIncidents.toString(),
          change: `+${metrics.ytdChange}`,
          trend: "up" as const,
          icon: "AlertCircle" as const,
          color: "amber" as const
        }
      ];

      // Get store incidents
      const storeIncidents = db.dashboard.incidents.filter(i => i.customerId === customerId && i.siteId === storeIdStr);

      const storeData: CustomerStoreData = {
        ...store,
        metrics: {
          CustomerHOManager: dynamicHOMetrics,
          CustomerSiteManager: dynamicSiteMetrics
        },
        recentIncidents: storeIncidents,
        incidentData: calculateIncidentChartData(customerId, storeIdStr),
      }

      console.log('✅ Final store data with dynamic metrics:', storeData)
      return HttpResponse.json(storeData)
    } catch (error) {
      console.error('❌ Error in store data handler:', error)
      return new HttpResponse(
        JSON.stringify({ error: 'Internal server error' }), 
        { status: 500 }
      )
    }
  }),

  // Get satisfaction data
  http.get('/api/dashboard/satisfaction', async ({ request }) => {
    try {
      const customerId = getCustomerId(request)
      console.log('🔍 Satisfaction handler - Customer ID:', customerId)
      
      // Get satisfaction data from db.json for the specific customer
      const satisfactionData = db.satisfactionData?.filter(data => 
        data.customerId === customerId
      ) || []
      
      console.log('📊 Returning satisfaction data:', satisfactionData)
      return HttpResponse.json(satisfactionData)
    } catch (error) {
      console.error('❌ Error in satisfaction handler:', error)
      return new HttpResponse(null, { status: 500 })
    }
  }),

  // Get be safe be secure data
  http.get('/api/dashboard/be-safe-be-secure', async ({ request }) => {
    try {
      const customerId = getCustomerId(request)
      console.log('🔍 Be Safe Be Secure handler - Customer ID:', customerId)
      
      // Get beSafe data from db.json for the specific customer
      const beSafeData = db.beSafeData?.filter(data => 
        data.customerId === customerId
      ) || []
      
      console.log('🛡️ Returning be safe be secure data:', beSafeData)
      return HttpResponse.json(beSafeData)
    } catch (error) {
      console.error('❌ Error in be safe be secure handler:', error)
      return new HttpResponse(null, { status: 500 })
    }
  }),

  // Get daily activities data
  http.get('/api/dashboard/daily-activities', async ({ request }) => {
    try {
      const customerId = getCustomerId(request)
      console.log('🔍 Daily activities handler - Customer ID:', customerId)
      
      // Get daily activities from db.json for the specific customer
      const dailyActivities = db.dailyActivities?.filter(activity => 
        activity.customerId === customerId
      ) || []
      
      console.log('📅 Returning daily activities data:', dailyActivities)
      return HttpResponse.json(dailyActivities)
    } catch (error) {
      console.error('❌ Error in daily activities handler:', error)
      return new HttpResponse(null, { status: 500 })
    }
  }),

  // Get aggregated data for a site
  http.get('/api/dashboard/site/:siteId', async ({ request, params }) => {
    try {
      const { siteId } = params;
      const customerId = getCustomerId(request);
      
      console.log('🔍 Site handler - Looking for site:', { siteId, customerId });
      
      // Ensure siteId is a string
      const siteIdStr = Array.isArray(siteId) ? siteId[0] : siteId;
      
      // First try to find a site with the given ID
      let site = db.sites.find(s => s.id === siteIdStr && s.customerId === customerId);
      
      // If no site found, try to find a store with that ID and get the corresponding site
      if (!site) {
        console.log('🔍 No site found, looking for store with ID:', siteId);
        const store = db.stores.find(st => st.id === siteIdStr && st.customerId === customerId);
        if (store) {
          // Find the corresponding site for this store
          // For now, we'll use the first site for this customer as a fallback
          site = db.sites.find(s => s.customerId === customerId);
          console.log('🔍 Found store, using corresponding site:', site);
        }
      }

      if (!site) {
        console.log('❌ No site or store found for ID:', siteId);
        return new HttpResponse(JSON.stringify({ message: 'Site not found' }), { status: 404 });
      }

      // Calculate dynamic metrics for this customer and site
      const metrics = calculateDynamicMetrics(customerId, siteIdStr);
      console.log('📊 Calculated dynamic metrics:', metrics);

      // Create dynamic metrics for CustomerHOManager
      const dynamicHOMetrics = [
        {
          title: "Overall Activity Score",
          value: `${metrics.activityScore}%`,
          change: metrics.activityScore > 85 ? "+8%" : "-3%",
          trend: metrics.activityScore > 85 ? "up" as const : "down" as const,
          icon: "Activity" as const,
          color: "green" as const
        },
        {
          title: "Total Incidents",
          value: metrics.totalIncidents.toString(),
          change: metrics.monthlyChange > 0 ? `+${metrics.monthlyChange}%` : `${metrics.monthlyChange}%`,
          trend: metrics.monthlyChange > 0 ? "up" as const : "down" as const,
          icon: "AlertCircle" as const,
          color: "amber" as const
        },
        {
          title: "Active Sites",
          value: metrics.activeSites.toString(),
          change: `+${metrics.activeSitesChange}`,
          trend: "up" as const,
          icon: "Building2" as const,
          color: "blue" as const
        },
        {
          title: "Total Incidents YTD",
          value: metrics.ytdIncidents.toString(),
          change: `+${metrics.ytdChange}`,
          trend: "up" as const,
          icon: "AlertCircle" as const,
          color: "amber" as const
        }
      ];

      // Create dynamic metrics for CustomerSiteManager
      const dynamicSiteMetrics = [
        {
          title: "Daily Activity Score",
          value: `${Math.max(80, metrics.activityScore - 5)}%`,
          change: metrics.activityScore > 85 ? "+6%" : "-2%",
          trend: metrics.activityScore > 85 ? "up" as const : "down" as const,
          icon: "Activity" as const,
          color: "green" as const
        },
        {
          title: "Incidents Today",
          value: metrics.todayIncidents.toString(),
          change: metrics.todayIncidents === 0 ? "0%" : "-25%",
          trend: metrics.todayIncidents === 0 ? "up" as const : "down" as const,
          icon: "AlertCircle" as const,
          color: "amber" as const
        },
        {
          title: "Customer Satisfaction",
          value: `${metrics.satisfaction.toFixed(1)}/5`,
          change: "+0.2",
          trend: "up" as const,
          icon: "Star" as const,
          color: "blue" as const
        },
        {
          title: "Total Incidents YTD",
          value: metrics.ytdIncidents.toString(),
          change: `+${metrics.ytdChange}`,
          trend: "up" as const,
          icon: "AlertCircle" as const,
          color: "amber" as const
        }
      ];

      // Filter incidents by both customerId and siteId
      console.log('🔍 Filtering incidents for customerId:', customerId, 'siteId:', site.id);
      console.log('🔍 Total incidents in database:', db.dashboard.incidents.length);
      
      const customerIncidents = db.dashboard.incidents.filter(i => i.customerId === customerId);
      console.log('🔍 Customer incidents found:', customerIncidents.length);
      
      // For now, return all customer incidents instead of filtering by site to debug
      const incidents = customerIncidents; // Remove site filtering temporarily
      console.log('🔍 Final incidents to return:', incidents.length);
      
      // Log first few incidents for debugging
      if (incidents.length > 0) {
        console.log('🔍 First incident sample:', incidents[0]);
      }

      const siteData: CustomerStoreData = {
        id: site.id,
        name: site.locationName,
        customerId: site.customerId,
        metrics: {
          CustomerHOManager: dynamicHOMetrics,
          CustomerSiteManager: dynamicSiteMetrics,
        },
        recentIncidents: incidents,
        incidentData: calculateIncidentChartData(customerId, siteIdStr),
      };

      console.log('✅ Returning site data with', incidents.length, 'incidents and dynamic metrics');
      return HttpResponse.json(siteData);
    } catch (error) {
      console.error('❌ Error in site data handler:', error);
      return new HttpResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
  }),

  // Get aggregated sites data with dynamic metrics
  http.get('/api/dashboard/sites/aggregate', async ({ request }) => {
    try {
      const url = new URL(request.url)
      const siteIds = url.searchParams.get('ids')?.split(',') || []
      const customerId = getCustomerId(request)
      
      console.log('🔍 Aggregate sites handler - Looking for:', { siteIds, customerId })
      
      // Calculate dynamic metrics for this customer (all sites)
      const metrics = calculateDynamicMetrics(customerId);
      console.log('📊 Calculated aggregated dynamic metrics:', metrics);

      // Create dynamic metrics for CustomerHOManager
      const dynamicHOMetrics = [
        {
          title: "Overall Activity Score",
          value: `${metrics.activityScore}%`,
          change: metrics.activityScore > 85 ? "+8%" : "-3%",
          trend: metrics.activityScore > 85 ? "up" as const : "down" as const,
          icon: "Activity" as const,
          color: "green" as const
        },
        {
          title: "Total Incidents",
          value: metrics.totalIncidents.toString(),
          change: metrics.monthlyChange > 0 ? `+${metrics.monthlyChange}%` : `${metrics.monthlyChange}%`,
          trend: metrics.monthlyChange > 0 ? "up" as const : "down" as const,
          icon: "AlertCircle" as const,
          color: "amber" as const
        },
        {
          title: "Active Sites",
          value: metrics.activeSites.toString(),
          change: `+${metrics.activeSitesChange}`,
          trend: "up" as const,
          icon: "Building2" as const,
          color: "blue" as const
        },
        {
          title: "Total Incidents YTD",
          value: metrics.ytdIncidents.toString(),
          change: `+${metrics.ytdChange}`,
          trend: "up" as const,
          icon: "AlertCircle" as const,
          color: "amber" as const
        }
      ];

      // Create dynamic metrics for CustomerSiteManager
      const dynamicSiteMetrics = [
        {
          title: "Daily Activity Score",
          value: `${Math.max(80, metrics.activityScore - 5)}%`,
          change: metrics.activityScore > 85 ? "+6%" : "-2%",
          trend: metrics.activityScore > 85 ? "up" as const : "down" as const,
          icon: "Activity" as const,
          color: "green" as const
        },
        {
          title: "Incidents Today",
          value: metrics.todayIncidents.toString(),
          change: metrics.todayIncidents === 0 ? "0%" : "-25%",
          trend: metrics.todayIncidents === 0 ? "up" as const : "down" as const,
          icon: "AlertCircle" as const,
          color: "amber" as const
        },
        {
          title: "Customer Satisfaction",
          value: `${metrics.satisfaction.toFixed(1)}/5`,
          change: "+0.2",
          trend: "up" as const,
          icon: "Star" as const,
          color: "blue" as const
        },
        {
          title: "Total Incidents YTD",
          value: metrics.ytdIncidents.toString(),
          change: `+${metrics.ytdChange}`,
          trend: "up" as const,
          icon: "AlertCircle" as const,
          color: "amber" as const
        }
      ];

      // Get incidents for this customer
      const customerIncidents = db.dashboard.incidents.filter(i => i.customerId === customerId);
      const aggregatedSiteIncidents = siteIds.length > 0 
        ? customerIncidents.filter(i => siteIds.includes(i.siteId))
        : customerIncidents;

      const aggregatedData: CustomerStoreData = {
        id: 'aggregated',
        name: 'Aggregated Sites',
        customerId,
        metrics: {
          CustomerHOManager: dynamicHOMetrics,
          CustomerSiteManager: dynamicSiteMetrics
        },
        recentIncidents: aggregatedSiteIncidents,
        incidentData: calculateIncidentChartData(customerId),
      }

      console.log('✅ Final aggregated data with dynamic metrics:', aggregatedData)
      return HttpResponse.json(aggregatedData)
    } catch (error) {
      console.error('❌ Error in aggregated sites handler:', error)
      return new HttpResponse(
        JSON.stringify({ error: 'Internal server error' }), 
        { status: 500 }
      )
    }
  }),

  // Get all stores
  http.get('/api/dashboard/stores', async ({ request }) => {
    try {
      const customerId = getCustomerId(request)
      console.log('🔍 Stores handler - Looking for customer:', customerId)
      const stores = db.stores.filter(store => store.customerId === customerId)
      console.log('📋 Found stores:', stores)
      return HttpResponse.json(stores)
    } catch (error) {
      console.error('❌ Error in stores handler:', error)
      return new HttpResponse(null, { status: 500 })
    }
  }),

  // Get all regions
  http.get('/api/dashboard/regions', async ({ request }) => {
    try {
      const customerId = getCustomerId(request)
      console.log('🔍 Regions handler - Looking for customer:', customerId)
      const regions = db.regions.filter(region => region.customerId === customerId)
      console.log('🌍 Found regions:', regions)
      return HttpResponse.json(regions)
    } catch (error) {
      console.error('❌ Error in regions handler:', error)
      return new HttpResponse(null, { status: 500 })
    }
  }),

  // Get all sites
  http.get('/api/dashboard/sites', async ({ request }) => {
    try {
      const customerId = getCustomerId(request)
      console.log('🔍 Sites handler - Looking for customer:', customerId)
      const sites = db.sites.filter(site => site.customerId === customerId)
      console.log('🏢 Found sites:', sites)
      return HttpResponse.json(sites)
    } catch (error) {
      console.error('❌ Error in sites handler:', error)
      return new HttpResponse(null, { status: 500 })
    }
  }),

  // Get officer dashboard data
  http.get('/api/dashboard/officer', async () => {
    try {
      const data = await loadData()
      if (!data.dashboard?.officer) {
        throw new Error('No officer dashboard data found')
      }
      return HttpResponse.json(data.dashboard.officer)
    } catch (error) {
      console.error('Error in officer dashboard handler:', error)
      return new HttpResponse(null, { status: 500 })
    }
  }),

  // Get recent incidents
  http.get('/api/dashboard/incidents', async ({ request }) => {
    try {
      const customerId = getCustomerId(request);
      const data = await loadData();
      if (!data.dashboard?.incidents) {
        throw new Error('No incidents data found');
      }
      // Filter incidents by customerId
      const incidents = data.dashboard.incidents.filter(i => i.customerId === customerId);
      return HttpResponse.json(incidents);
    } catch (error) {
      console.error('Error in incidents handler:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // Get aggregated data for multiple sites
  http.get('/api/dashboard/sites/aggregate', async ({ request }) => {
    try {
      const url = new URL(request.url);
      const idsParam = url.searchParams.get('ids');
      const customerId = getCustomerId(request);
      
      console.log('🔍 Aggregate sites handler - Looking for sites:', { siteIds: idsParam, customerId });
      
      if (!idsParam) {
        return new HttpResponse(JSON.stringify({ message: 'No site IDs provided' }), { status: 400 });
      }
      
      const siteIds = idsParam.split(',');
      // Filter sites by both site IDs and customer ID
      const sites = db.sites.filter(s => siteIds.includes(s.id) && s.customerId === customerId);
      
      console.log('🏢 Found sites for aggregation:', sites.length);
      
      if (!sites.length) {
        return new HttpResponse(JSON.stringify({ message: 'No sites found for customer' }), { status: 404 });
      }

      // Calculate dynamic metrics for this customer (all sites)
      const metrics = calculateDynamicMetrics(customerId);
      console.log('📊 Calculated aggregated dynamic metrics:', metrics);

      // Create dynamic metrics for CustomerHOManager
      const dynamicHOMetrics = [
        {
          title: "Overall Activity Score",
          value: `${metrics.activityScore}%`,
          change: metrics.activityScore > 85 ? "+8%" : "-3%",
          trend: metrics.activityScore > 85 ? "up" as const : "down" as const,
          icon: "Activity" as const,
          color: "green" as const
        },
        {
          title: "Total Incidents",
          value: metrics.totalIncidents.toString(),
          change: metrics.monthlyChange > 0 ? `+${metrics.monthlyChange}%` : `${metrics.monthlyChange}%`,
          trend: metrics.monthlyChange > 0 ? "up" as const : "down" as const,
          icon: "AlertCircle" as const,
          color: "amber" as const
        },
        {
          title: "Active Sites",
          value: metrics.activeSites.toString(),
          change: `+${metrics.activeSitesChange}`,
          trend: "up" as const,
          icon: "Building2" as const,
          color: "blue" as const
        },
        {
          title: "Total Incidents YTD",
          value: metrics.ytdIncidents.toString(),
          change: `+${metrics.ytdChange}`,
          trend: "up" as const,
          icon: "AlertCircle" as const,
          color: "amber" as const
        }
      ];

      // Create dynamic metrics for CustomerSiteManager
      const dynamicSiteMetrics = [
        {
          title: "Daily Activity Score",
          value: `${Math.max(80, metrics.activityScore - 5)}%`,
          change: metrics.activityScore > 85 ? "+6%" : "-2%",
          trend: metrics.activityScore > 85 ? "up" as const : "down" as const,
          icon: "Activity" as const,
          color: "green" as const
        },
        {
          title: "Incidents Today",
          value: metrics.todayIncidents.toString(),
          change: metrics.todayIncidents === 0 ? "0%" : "-25%",
          trend: metrics.todayIncidents === 0 ? "up" as const : "down" as const,
          icon: "AlertCircle" as const,
          color: "amber" as const
        },
        {
          title: "Customer Satisfaction",
          value: `${metrics.satisfaction.toFixed(1)}/5`,
          change: "+0.2",
          trend: "up" as const,
          icon: "Star" as const,
          color: "blue" as const
        },
        {
          title: "Total Incidents YTD",
          value: metrics.ytdIncidents.toString(),
          change: `+${metrics.ytdChange}`,
          trend: "up" as const,
          icon: "AlertCircle" as const,
          color: "amber" as const
        }
      ];

      // Aggregate incidents - filter by customerId and siteIds
      console.log('🔍 Filtering incidents for customerId:', customerId, 'siteIds:', siteIds);
      console.log('🔍 Total incidents in database:', db.dashboard.incidents.length);
      
      const customerIncidents = db.dashboard.incidents.filter(i => i.customerId === customerId);
      console.log('🔍 Customer incidents found:', customerIncidents.length);
      
      // For now, return all customer incidents instead of filtering by sites to debug
      const incidents = customerIncidents; // Remove site filtering temporarily
      console.log('🔍 Final aggregated incidents to return:', incidents.length);
      
      // Log first few incidents for debugging
      if (incidents.length > 0) {
        console.log('🔍 First aggregated incident sample:', incidents[0]);
      }

      const siteData: CustomerStoreData = {
        id: 'aggregate',
        name: 'All Sites Overview',
        customerId: customerId,
        metrics: {
          CustomerHOManager: dynamicHOMetrics,
          CustomerSiteManager: dynamicSiteMetrics,
        },
        recentIncidents: incidents,
        incidentData: calculateIncidentChartData(customerId),
      };

      console.log('✅ Returning aggregated site data with', incidents.length, 'incidents and dynamic metrics');
      return HttpResponse.json(siteData);
    } catch (error) {
      console.error('❌ Error in aggregate sites handler:', error);
      return new HttpResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
  }),

  sitesHandler
] 