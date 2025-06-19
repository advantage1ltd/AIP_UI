import { http, HttpResponse, delay } from 'msw'
import { mockIncidents } from '@/data/mockIncidents'
import { Incident } from '@/types/incidents'
import { GetIncidentsParams, IncidentResponse, IncidentsResponse, UpsertIncidentRequest } from '@/types/api'
import { v4 as uuidv4 } from 'uuid'

// Base API URL - should match what we'll use with the real backend
const API_URL = '/api'

// Helper to simulate database operations
let incidents = [...mockIncidents]

export const incidentHandlers = [
  // GET /api/incidents - Get paginated incidents
  http.get(`${API_URL}/incidents`, async ({ request }) => {
    await delay(500) // Simulate network delay
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const search = url.searchParams.get('search') || ''
    const customerId = url.searchParams.get('customerId')
    
    // Filter incidents based on search term and customer
    let filteredIncidents = incidents
    
    // Filter by customer if specified
    if (customerId) {
      filteredIncidents = filteredIncidents.filter(incident => {
        // Map customer names to customer IDs
        const customerIdMap: Record<string, string> = {
          "Central England COOP": "1",
          "Midcounties COOP": "2", 
          "Heart of England COOP": "3"
        }
        return customerIdMap[incident.customerName] === customerId
      })
    }
    
    // Filter by search term
    if (search) {
      filteredIncidents = filteredIncidents.filter(incident => 
        incident.siteName.toLowerCase().includes(search.toLowerCase()) ||
        incident.description.toLowerCase().includes(search.toLowerCase()) ||
        incident.incidentType.toLowerCase().includes(search.toLowerCase()) ||
        incident.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (incident.officerName && incident.officerName.toLowerCase().includes(search.toLowerCase()))
      )
    }
    
    // Calculate pagination
    const totalCount = filteredIncidents.length
    const totalPages = Math.ceil(totalCount / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedIncidents = filteredIncidents.slice(startIndex, endIndex)
    
    const response: IncidentsResponse = {
      success: true,
      data: paginatedIncidents,
      pagination: {
        currentPage: page,
        totalPages,
        pageSize,
        totalCount,
        hasPrevious: page > 1,
        hasNext: page < totalPages
      }
    }
    
    return HttpResponse.json(response)
  }),

  // GET /api/incidents/:id - Get single incident
  http.get(`${API_URL}/incidents/:id`, async ({ params }) => {
    await delay(300)
    
    const incident = incidents.find(inc => inc.id === params.id)
    if (!incident) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Not Found'
      })
    }
    
    const response: IncidentResponse = {
      success: true,
      data: incident
    }
    
    return HttpResponse.json(response)
  }),

  // POST /api/incidents - Create new incident
  http.post(`${API_URL}/incidents`, async ({ request }) => {
    await delay(500)
    
    const body = await request.json() as UpsertIncidentRequest
    const { incident: newIncident } = body
    
    const incident: Incident = {
      ...newIncident,
      id: uuidv4(),
      dateInputted: new Date().toISOString()
    }
    
    incidents.unshift(incident)
    
    const response: IncidentResponse = {
      success: true,
      data: incident,
      message: 'Incident created successfully'
    }
    
    return HttpResponse.json(response, { status: 201 })
  }),

  // PUT /api/incidents/:id - Update incident
  http.put(`${API_URL}/incidents/:id`, async ({ params, request }) => {
    await delay(500)
    
    const body = await request.json() as UpsertIncidentRequest
    const { incident: updatedIncident } = body
    
    const index = incidents.findIndex(inc => inc.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Not Found'
      })
    }
    
    incidents[index] = {
      ...updatedIncident,
      id: params.id as string,
      dateInputted: incidents[index].dateInputted
    }
    
    const response: IncidentResponse = {
      success: true,
      data: incidents[index],
      message: 'Incident updated successfully'
    }
    
    return HttpResponse.json(response)
  }),

  // DELETE /api/incidents/:id - Delete incident
  http.delete(`${API_URL}/incidents/:id`, async ({ params }) => {
    await delay(500)
    
    const index = incidents.findIndex(inc => inc.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Not Found'
      })
    }
    
    incidents = incidents.filter(inc => inc.id !== params.id)
    
    return HttpResponse.json({
      success: true,
      message: 'Incident deleted successfully'
    })
  })
] 