import { http, HttpResponse } from 'msw';
import { sitesService } from '@/services/sitesService';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sitesHandlers = [
  // Get all sites
  http.get('/api/sites', async () => {
    await delay(200);
    const result = await sitesService.getSites();
    return HttpResponse.json(result);
  }),

  // Get sites by customer
  http.get('/api/customers/:customerId/sites', async ({ params }) => {
    await delay(200);
    const result = await sitesService.getSitesByCustomer(params.customerId as string);
    return HttpResponse.json(result);
  }),

  // Get sites by region
  http.get('/api/regions/:regionId/sites', async ({ params }) => {
    await delay(200);
    const result = await sitesService.getSitesByRegion(params.regionId as string);
    return HttpResponse.json(result);
  }),

  // Create new site
  http.post('/api/sites', async ({ request }) => {
    await delay(300);
    try {
      const siteData = await request.json() as any;
      const result = await sitesService.createSite(siteData);
      
      if (result.success) {
        return HttpResponse.json(result, { status: 201 });
      } else {
        return HttpResponse.json(result, { status: 400 });
      }
    } catch (error) {
      return HttpResponse.json({
        success: false,
        message: 'Invalid request data'
      }, { status: 400 });
    }
  }),

  // Update site
  http.patch('/api/sites/:id', async ({ params, request }) => {
    await delay(300);
    try {
      const updates = await request.json() as any;
      const result = await sitesService.updateSite(params.id as string, updates);
      
      if (result.success) {
        return HttpResponse.json(result);
      } else {
        return HttpResponse.json(result, { status: result.message === 'Site not found' ? 404 : 400 });
      }
    } catch (error) {
      return HttpResponse.json({
        success: false,
        message: 'Invalid request data'
      }, { status: 400 });
    }
  }),

  // Delete site
  http.delete('/api/sites/:id', async ({ params }) => {
    await delay(300);
    const result = await sitesService.deleteSite(params.id as string);
    
    if (result.success) {
      return HttpResponse.json(result);
    } else {
      return HttpResponse.json(result, { status: result.message === 'Site not found' ? 404 : 400 });
    }
  })
]; 