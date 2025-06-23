import { http, HttpResponse } from 'msw';
import { PageAccess } from '@/contexts/PageAccessContext';
import { PageAccessSettings } from '@/services/settingsService';
import { defaultPageAccess } from '@/api/pageAccess';

// In-memory storage
let settingsStore: PageAccessSettings = {
  pageAccessByRole: {
    'Administrator': defaultPageAccess.Administrator,
    'AdvantageOneOfficer': defaultPageAccess.AdvantageOneOfficer,
    'AdvantageOneHOOfficer': defaultPageAccess.AdvantageOneHOOfficer,
    'CustomerSiteManager': defaultPageAccess.CustomerSiteManager,
    'CustomerHOManager': defaultPageAccess.CustomerHOManager
  }
};

export const settingsHandlers = [
  // Get page access settings
  http.get('/api/settings/page-access', () => {
    return HttpResponse.json(settingsStore);
  }),

  // Save page access settings
  http.put('/api/settings/page-access', async ({ request }) => {
    const settings = await request.json() as PageAccessSettings;
    settingsStore = settings;
    return HttpResponse.json(settingsStore);
  }),

  // Reset admin access
  http.post('/api/settings/reset-admin', async ({ request }) => {
    const { availablePages } = await request.json() as { availablePages: PageAccess[] };
    settingsStore.pageAccessByRole.Administrator = availablePages.map(page => page.id);
    return HttpResponse.json(settingsStore);
  })
]; 