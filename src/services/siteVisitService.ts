import { api, BASE_API_URL } from '@/config/api';
import { getCurrentCustomerId } from '@/lib/utils';
import type { 
  SiteVisit, 
  SiteVisitResponse, 
  SiteVisitsResponse, 
  GetSiteVisitsParams 
} from '../types/siteVisit';

const SITE_VISIT_ENDPOINTS = {
  LIST: '/site-visits',
  DETAIL: (id: string) => `/site-visits/${id}`,
  CREATE: '/site-visits',
  UPDATE: (id: string) => `/site-visits/${id}`,
  DELETE: (id: string) => `/site-visits/${id}`,
};

// Helper to get headers with customer ID
const getHeaders = () => {
  const customerId = getCurrentCustomerId();
  return customerId ? { 'X-Customer-Id': customerId.toString() } : {};
};

export const siteVisitService = {
  /**
   * Get paginated list of site visits
   */
  getSiteVisits: async (params: GetSiteVisitsParams): Promise<SiteVisitsResponse> => {
    const { data } = await api.get<SiteVisitsResponse>(SITE_VISIT_ENDPOINTS.LIST, { 
      params,
      headers: getHeaders()
    });
    return data;
  },

  /**
   * Get a single site visit by ID
   */
  getSiteVisit: async (id: string): Promise<SiteVisitResponse> => {
    const { data } = await api.get<SiteVisitResponse>(SITE_VISIT_ENDPOINTS.DETAIL(id), {
      headers: getHeaders()
    });
    return data;
  },

  /**
   * Create a new site visit
   */
  createSiteVisit: async (siteVisit: Omit<SiteVisit, 'id' | 'createdAt'>): Promise<SiteVisit> => {
    const { data } = await api.post<SiteVisit>(SITE_VISIT_ENDPOINTS.CREATE, siteVisit, {
      headers: getHeaders()
    });
    return data;
  },

  /**
   * Update an existing site visit
   */
  updateSiteVisit: async (id: string, siteVisit: Partial<SiteVisit>): Promise<SiteVisit> => {
    const { data } = await api.put<SiteVisit>(SITE_VISIT_ENDPOINTS.UPDATE(id), siteVisit, {
      headers: getHeaders()
    });
    return data;
  },

  /**
   * Delete a site visit
   */
  deleteSiteVisit: async (id: string): Promise<void> => {
    await api.delete(SITE_VISIT_ENDPOINTS.DELETE(id), {
      headers: getHeaders()
    });
  },
}; 