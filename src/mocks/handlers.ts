import { http, HttpResponse, delay } from 'msw'
import { mockIncidents } from '@/data/mockIncidents'
import { Incident } from '@/types/incidents'
import { GetIncidentsParams, IncidentResponse, IncidentsResponse, UpsertIncidentRequest } from '@/types/api'
import { v4 as uuidv4 } from 'uuid'
import { siteVisitHandlers } from './siteVisitHandlers'
import { safeDuressWordsHandlers } from './safeDuressWordsHandlers'
import { holidayRequestHandlers } from './holidayRequestHandlers'
import { customerSatisfactionHandlers } from './customerSatisfactionHandlers'
import { bankHolidayHandlers } from './bankHolidayHandlers'

// Base API URL - should match what we'll use with the real backend
const API_URL = '/api'

// Helper to simulate database operations
let incidents = [...mockIncidents]

const users = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    displayName: 'Alice Admin',
    role: 'Administrator',
  },
  {
    id: '2',
    username: 'officer1',
    password: 'officer123',
    displayName: 'Oscar Officer',
    role: 'Advantage One Officer',
  },
  {
    id: '3',
    username: 'officer2',
    password: 'officer456',
    displayName: 'Olivia Officer',
    role: 'Advantage One Officer',
  },
  {
    id: '4',
    username: 'customerho',
    password: 'customer123',
    displayName: 'Cathy Customer',
    role: 'Customer - Head Office Manager',
  },
]

// Helper function to validate request
const validateRequest = async (request: Request) => {
  try {
    return await request.json()
  } catch (error) {
    throw new Error('Invalid JSON payload')
  }
}

// Helper function to create error response
const createErrorResponse = (status: number, message: string) => {
  return HttpResponse.json(
    { 
      success: false,
      error: message,
      data: null
    },
    { status }
  )
}

export const handlers = [
  // GET /api/incidents - Get paginated incidents
  http.get(`${API_URL}/incidents`, async ({ request }) => {
    try {
      await delay(500) // Simulate network latency

      const url = new URL(request.url)
      const page = Number(url.searchParams.get('page')) || 1
      const pageSize = Number(url.searchParams.get('pageSize')) || 10
      const search = url.searchParams.get('search') || ''

      // Filter incidents based on search term
      let filteredIncidents = incidents
      if (search) {
        filteredIncidents = incidents.filter(incident =>
          incident.siteName.toLowerCase().includes(search.toLowerCase()) ||
          incident.description.toLowerCase().includes(search.toLowerCase())
        )
      }

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
    } catch (error) {
      return createErrorResponse(500, 'Failed to fetch incidents')
    }
  }),

  // GET /api/incidents/:id - Get single incident
  http.get(`${API_URL}/incidents/:id`, async ({ params }) => {
    try {
      await delay(200)

      const incident = incidents.find(inc => inc.id === params.id)
      if (!incident) {
        return createErrorResponse(404, 'Incident not found')
      }

      const response: IncidentResponse = {
        success: true,
        data: incident
      }

      return HttpResponse.json(response)
    } catch (error) {
      return createErrorResponse(500, 'Failed to fetch incident')
    }
  }),

  // POST /api/incidents - Create new incident
  http.post(`${API_URL}/incidents`, async ({ request }) => {
    try {
      const { incident: newIncident } = await validateRequest(request) as UpsertIncidentRequest

      const incident: Incident = {
        ...newIncident,
        id: Math.random().toString(36).substr(2, 9),
        dateInputted: new Date().toISOString()
      }

      incidents.unshift(incident)

      return HttpResponse.json({
        success: true,
        data: incident,
        message: 'Incident created successfully'
      }, { status: 201 })
    } catch (error) {
      return createErrorResponse(400, error instanceof Error ? error.message : 'Failed to create incident')
    }
  }),

  // PUT /api/incidents/:id - Update incident
  http.put(`${API_URL}/incidents/:id`, async ({ params, request }) => {
    try {
      const { incident: updatedIncident } = await validateRequest(request) as UpsertIncidentRequest

      const index = incidents.findIndex(inc => inc.id === params.id)
      if (index === -1) {
        return createErrorResponse(404, 'Incident not found')
      }

      incidents[index] = {
        ...updatedIncident,
        id: params.id as string,
        dateInputted: incidents[index].dateInputted
      }

      return HttpResponse.json({
        success: true,
        data: incidents[index],
        message: 'Incident updated successfully'
      })
    } catch (error) {
      return createErrorResponse(400, error instanceof Error ? error.message : 'Failed to update incident')
    }
  }),

  // DELETE /api/incidents/:id - Delete incident
  http.delete(`${API_URL}/incidents/:id`, async ({ params }) => {
    try {
      await delay(200)

      const index = incidents.findIndex(inc => inc.id === params.id)
      if (index === -1) {
        return createErrorResponse(404, 'Incident not found')
      }

      incidents = incidents.filter(inc => inc.id !== params.id)

      return HttpResponse.json({
        success: true,
        message: 'Incident deleted successfully'
      })
    } catch (error) {
      return createErrorResponse(500, 'Failed to delete incident')
    }
  }),

  // POST /api/login - Login handler
  http.post('/api/login', async ({ request }) => {
    const { username, password } = await request.json() as LoginRequest
    const user = users.find(u => u.username === username && u.password === password)
    
    if (!user) {
      return new HttpResponse(
        JSON.stringify({ message: 'Invalid username or password' }),
        { status: 401 }
      )
    }
    
    // Don't return password and map to expected format
    const { password: _, ...userInfo } = user
    const userData = {
      ...userInfo,
      pageAccessRole: userInfo.role === 'Administrator' ? 'administrator' :
                     userInfo.role === 'Advantage One Officer' ? 'advantage-officer' :
                     userInfo.role === 'Advantage one HO Editor' ? 'advantage-ho' :
                     userInfo.role === 'Advantage One HO Manager' ? 'advantage-ho' :
                     userInfo.role.startsWith('Customer') ? 
                       (userInfo.role.includes('Head Office') ? 'customer-ho' : 'customer-site') : 'customer-site'
    }
    
    return HttpResponse.json({
      success: true,
      data: userData
    })
  }),

  // Include all feature handlers
  ...siteVisitHandlers,
  ...safeDuressWordsHandlers,
  ...holidayRequestHandlers,
  ...customerSatisfactionHandlers,
  ...bankHolidayHandlers
]

interface LoginRequest {
  username: string
  password: string
} 