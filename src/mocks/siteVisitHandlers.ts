import { http, HttpResponse, delay } from 'msw'
import { allMockVisits } from '@/pages/operations/SiteVisitPage'
import type { SiteVisit, SiteVisitsResponse } from '@/types/siteVisit'

// Helper to simulate database operations
let visits = [...allMockVisits]

export const siteVisitHandlers = [
  // GET /api/site-visits - Get paginated site visits
  http.get('/api/site-visits', async ({ request }) => {
    console.log('MSW: GET /api/site-visits called')
    await delay(500) // Simulate network delay
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const search = url.searchParams.get('search') || ''
    
    // Filter visits based on search term
    let filteredVisits = [...visits]
    if (search) {
      const searchLower = search.toLowerCase()
      filteredVisits = filteredVisits.filter(visit => 
        visit.customerName.toLowerCase().includes(searchLower) ||
        visit.officerName.toLowerCase().includes(searchLower) ||
        visit.locationName.toLowerCase().includes(searchLower) ||
        visit.status.toLowerCase().includes(searchLower)
      )
    }
    
    // Calculate pagination
    const total = filteredVisits.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedVisits = filteredVisits.slice(start, end)
    
    const response: SiteVisitsResponse = {
      data: paginatedVisits,
      total,
      page,
      pageSize,
      totalPages
    }
    
    console.log('MSW: Returning', paginatedVisits.length, 'visits')
    return HttpResponse.json(response)
  }),

  // GET /api/site-visits/:id - Get single site visit
  http.get('/api/site-visits/:id', async ({ params }) => {
    console.log('MSW: GET /api/site-visits/:id called with id:', params.id)
    await delay(300)
    
    const visit = visits.find(v => v.id === params.id)
    if (!visit) {
      console.log('MSW: Visit not found for id:', params.id)
      return new HttpResponse(null, { status: 404 })
    }

    console.log('MSW: Found visit:', visit.id)
    return HttpResponse.json(visit)
  }),

  // POST /api/site-visits - Create site visit
  http.post('/api/site-visits', async ({ request }) => {
    console.log('MSW: POST /api/site-visits called')
    await delay(500)
    
    const body = await request.json() as Omit<SiteVisit, 'id' | 'createdAt' | 'status'>
    
    const newVisit: SiteVisit = {
      ...body,
      id: `sv${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      status: 'Completed',
      followUpAction: body.followUpAction || '',
      followUpActionDate: body.followUpActionDate || '',
      recommendations: body.recommendations || '',
      updatedAt: new Date().toISOString()
    }
    
    visits = [newVisit, ...visits]
    
    console.log('MSW: Created new visit:', newVisit.id)
    return HttpResponse.json(newVisit)
  }),

  // PUT /api/site-visits/:id - Update site visit
  http.put('/api/site-visits/:id', async ({ params, request }) => {
    console.log('MSW: PUT /api/site-visits/:id called with id:', params.id)
    await delay(500)
    
    const body = await request.json() as Partial<SiteVisit>
    const index = visits.findIndex(v => v.id === params.id)
    
    if (index === -1) {
      console.log('MSW: Visit not found for update, id:', params.id)
      return new HttpResponse(null, { status: 404 })
    }
    
    const updatedVisit: SiteVisit = {
      ...visits[index],
      ...body,
      updatedAt: new Date().toISOString()
    }
    
    visits[index] = updatedVisit
    
    console.log('MSW: Updated visit:', updatedVisit.id)
    return HttpResponse.json(updatedVisit)
  }),

  // DELETE /api/site-visits/:id - Delete site visit
  http.delete('/api/site-visits/:id', async ({ params }) => {
    console.log('MSW: DELETE /api/site-visits/:id called with id:', params.id)
    await delay(300)
    
    const index = visits.findIndex(v => v.id === params.id)
    if (index === -1) {
      console.log('MSW: Visit not found for deletion, id:', params.id)
      return new HttpResponse(null, { status: 404 })
    }
    
    visits = visits.filter(v => v.id !== params.id)
    
    console.log('MSW: Deleted visit:', params.id)
    return new HttpResponse(null, { status: 204 })
  })
] 