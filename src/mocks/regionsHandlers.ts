import { http, HttpResponse } from 'msw';
import { regionsService } from '@/services/regionsService';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const regionsHandlers = [
  // Get all regions
  http.get('/api/regions', async () => {
    await delay(200);
    const result = await regionsService.getRegions();
    return HttpResponse.json(result);
  }),

  // Get regions by customer
  http.get('/api/customers/:customerId/regions', async ({ params }) => {
    await delay(200);
    const result = await regionsService.getRegionsByCustomer(params.customerId as string);
    return HttpResponse.json(result);
  }),

  // Create new region
  http.post('/api/regions', async ({ request }) => {
    await delay(300);
    try {
      const regionData = await request.json() as any;
      const result = await regionsService.createRegion(regionData);
      
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

  // Update region
  http.patch('/api/regions/:id', async ({ params, request }) => {
    await delay(300);
    try {
      const updates = await request.json() as any;
      const result = await regionsService.updateRegion(params.id as string, updates);
      
      if (result.success) {
        return HttpResponse.json(result);
      } else {
        return HttpResponse.json(result, { status: result.message === 'Region not found' ? 404 : 400 });
      }
    } catch (error) {
      return HttpResponse.json({
        success: false,
        message: 'Invalid request data'
      }, { status: 400 });
    }
  }),

  // Delete region
  http.delete('/api/regions/:id', async ({ params }) => {
    await delay(300);
    const result = await regionsService.deleteRegion(params.id as string);
    
    if (result.success) {
      return HttpResponse.json(result);
    } else {
      return HttpResponse.json(result, { status: result.message === 'Region not found' ? 404 : 400 });
    }
  })
]; 