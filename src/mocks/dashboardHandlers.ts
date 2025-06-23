import { http, HttpResponse } from 'msw'
import type { CustomerStoreData, CustomerRole, DailyActivity, Site, Metric } from '@/types/dashboard'
import db from '../../db.json'

// Helper function to get customer ID from request
const getCustomerId = (request: Request) => {
  const customerId = request.headers.get('X-Customer-Id') || 'COOP001' // Default to COOP001 for testing
  return customerId
}

// Load JSON data
const loadData = async () => {
  const data = await import('../../db.json')
  return data.default
}

// Helper function to load data from db.json
const loadDashboardData = async () => {
  try {
    const data = await loadData()
    return data
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    return null
  }
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
  // Get store data
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

      // Ensure metrics exist for both roles
      if (!store.metrics || (!store.metrics.CustomerHOManager && !store.metrics.CustomerSiteManager)) {
        console.error('❌ Store is missing metrics data')
        return new HttpResponse(
          JSON.stringify({ error: 'Store data is missing metrics' }), 
          { status: 500 }
        )
      }

      // Get metrics for the store and ensure they match the Metric type
      const hoManagerMetrics = (store.metrics.CustomerHOManager || []).map(metric => ({
        ...metric,
        trend: metric.trend as 'up' | 'down',
        icon: metric.icon as 'Activity' | 'AlertCircle' | 'Building2' | 'Users' | 'Star',
        color: metric.color as 'green' | 'amber' | 'blue' | 'purple'
      }))

      const siteManagerMetrics = (store.metrics.CustomerSiteManager || []).map(metric => ({
        ...metric,
        trend: metric.trend as 'up' | 'down',
        icon: metric.icon as 'Activity' | 'AlertCircle' | 'Building2' | 'Users' | 'Star',
        color: metric.color as 'green' | 'amber' | 'blue' | 'purple'
      }))

      // Get incidents for the store - filter by both customerId and siteId
      const incidents = db.dashboard.incidents.filter(i => 
        i.customerId === customerId && 
        i.siteId === storeId
      )
      console.log('🚨 Incidents:', incidents)

      const storeData: CustomerStoreData = {
        ...store,
        metrics: {
          CustomerHOManager: hoManagerMetrics,
          CustomerSiteManager: siteManagerMetrics
        },
        recentIncidents: incidents,
        incidentData: {
          daily: db.incidentData?.daily || [],
          weekly: db.incidentData?.weekly || [],
          monthly: db.incidentData?.monthly || [],
          yearly: db.incidentData?.yearly || []
        }
      }

      console.log('✅ Final store data:', storeData)
      return HttpResponse.json(storeData)
    } catch (error) {
      console.error('❌ Error in store data handler:', error)
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

  // Get satisfaction data
  http.get('/api/dashboard/satisfaction', async ({ request }) => {
    try {
      const customerId = getCustomerId(request)
      const data = db.satisfactionData?.filter(d => d.customerId === customerId) || []
      return HttpResponse.json(data)
    } catch (error) {
      console.error('Error in satisfaction data handler:', error)
      return new HttpResponse(null, { status: 500 })
    }
  }),

  // Get be-safe-be-secure data
  http.get('/api/dashboard/be-safe-be-secure', async ({ request }) => {
    try {
      const customerId = getCustomerId(request)
      const data = db.beSafeData?.filter(d => d.customerId === customerId) || []
      return HttpResponse.json(data)
    } catch (error) {
      console.error('Error in be-safe data handler:', error)
      return new HttpResponse(null, { status: 500 })
    }
  }),

  // Get daily activities
  http.get('/api/dashboard/daily-activities', async ({ request }) => {
    try {
      const customerId = getCustomerId(request)
      const activities = db.dailyActivities?.filter(a => a.customerId === customerId) || []
      return HttpResponse.json(activities)
    } catch (error) {
      console.error('Error in daily activities handler:', error)
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
  http.get('/api/dashboard/incidents', async () => {
    try {
      const data = await loadData()
      if (!data.dashboard?.incidents) {
        throw new Error('No incidents data found')
      }
      return HttpResponse.json(data.dashboard.incidents)
    } catch (error) {
      console.error('Error in incidents handler:', error)
      return new HttpResponse(null, { status: 500 })
    }
  }),

  // Get aggregated data for a site
  http.get('/api/dashboard/site/:siteId', async ({ request, params }) => {
    try {
      const { siteId } = params;
      const customerId = getCustomerId(request);
      const site = db.sites.find(s => s.id === siteId && s.customerId === customerId);

      if (!site) {
        return new HttpResponse(JSON.stringify({ message: 'Site not found' }), { status: 404 });
      }

      // Use only the single site for metrics and incidents
      const store = db.stores.find(st => st.id === site.id);
      const metrics = (store?.metrics?.CustomerHOManager || []).map(metric => ({
        ...metric,
        trend: metric.trend as 'up' | 'down',
        icon: metric.icon as 'Activity' | 'AlertCircle' | 'Building2' | 'Users' | 'Star',
        color: metric.color as 'green' | 'amber' | 'blue' | 'purple',
      }));

      // Filter incidents by both customerId and siteId
      const incidents = db.dashboard.incidents.filter(i => 
        i.customerId === customerId && 
        i.siteId === siteId
      );

      const siteData: CustomerStoreData = {
        id: site.id,
        name: site.locationName,
        customerId: site.customerId,
        metrics: {
          CustomerHOManager: metrics,
          CustomerSiteManager: [],
        },
        recentIncidents: incidents,
        incidentData: db.incidentData,
      };

      return HttpResponse.json(siteData);
    } catch (error) {
      console.error('❌ Error in site data handler:', error);
      return new HttpResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
  }),

  // Get aggregated data for multiple sites
  http.get('/api/dashboard/sites/aggregate', async ({ request }) => {
    try {
      const url = new URL(request.url);
      const idsParam = url.searchParams.get('ids');
      if (!idsParam) {
        return new HttpResponse(JSON.stringify({ message: 'No site IDs provided' }), { status: 400 });
      }
      const siteIds = idsParam.split(',');
      const sites = db.sites.filter(s => siteIds.includes(s.id));
      if (!sites.length) {
        return new HttpResponse(JSON.stringify({ message: 'No sites found' }), { status: 404 });
      }

      // Aggregate metrics from all sites
      const allMetrics = sites.flatMap(site => {
        const store = db.stores.find(st => st.id === site.id);
        return store?.metrics?.CustomerHOManager || [];
      });

      // Group by metric title and sum values
      const metricMap = new Map();
      for (const metric of allMetrics) {
        if (!metricMap.has(metric.title)) {
          metricMap.set(metric.title, { ...metric, value: 0 });
        }
        const entry = metricMap.get(metric.title);
        entry.value = (parseInt(entry.value, 10) + parseInt(metric.value, 10)).toString();
      }

      const aggregatedMetrics = Array.from(metricMap.values()).map(m => ({
        ...m,
        trend: m.trend as 'up' | 'down',
        icon: m.icon as 'Activity' | 'AlertCircle' | 'Building2' | 'Users' | 'Star',
        color: m.color as 'green' | 'amber' | 'blue' | 'purple',
      }));

      // Get customer ID from the first site (they should all be from the same customer)
      const customerId = sites[0].customerId;

      // Aggregate incidents - filter by both customerId and siteIds
      const incidents = db.dashboard.incidents.filter(i => 
        i.customerId === customerId && 
        siteIds.includes(i.siteId)
      );

      const siteData: CustomerStoreData = {
        id: 'aggregate',
        name: 'Aggregated Sites',
        customerId: sites[0].customerId,
        metrics: {
          CustomerHOManager: aggregatedMetrics,
          CustomerSiteManager: [],
        },
        recentIncidents: incidents,
        incidentData: db.incidentData,
      };

      return HttpResponse.json(siteData);
    } catch (error) {
      console.error('❌ Error in aggregate sites handler:', error);
      return new HttpResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
  }),

  sitesHandler
] 