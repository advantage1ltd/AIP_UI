import { http, HttpResponse } from 'msw';
import { PageHeaderData } from '@/types/header';

// In-memory storage (synced with db.json)
let headerStore: Record<string, PageHeaderData> = {};

export const headerHandlers = [
  // Get header data
  http.get('/api/headers/:pageId', async ({ params }) => {
    const { pageId } = params;
    return HttpResponse.json(headerStore[pageId as string] || {
      title: '',
      description: '',
      customizations: {}
    });
  }),

  // Update header data
  http.put('/api/headers/:pageId', async ({ request, params }) => {
    const { pageId } = params;
    const data = await request.json() as PageHeaderData;
    headerStore[pageId as string] = data;
    return HttpResponse.json(data);
  }),

  // Delete header data
  http.delete('/api/headers/:pageId', ({ params }) => {
    const { pageId } = params;
    delete headerStore[pageId as string];
    return new HttpResponse(null, { status: 204 });
  })
]; 