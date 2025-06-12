import { Incident } from '@/types/incidents'
import { GetIncidentsParams, IncidentResponse, IncidentsResponse, UpsertIncidentRequest } from '@/types/api'

const API_URL = '/api'

export const incidentsApi = {
  // Get paginated incidents
  getIncidents: async (params?: GetIncidentsParams): Promise<IncidentsResponse> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString())
      })
    }
    
    const response = await fetch(`${API_URL}/incidents?${searchParams.toString()}`)
    if (!response.ok) {
      throw new Error('Failed to fetch incidents')
    }
    return response.json()
  },

  // Get single incident
  getIncident: async (id: string): Promise<IncidentResponse> => {
    const response = await fetch(`${API_URL}/incidents/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch incident')
    }
    return response.json()
  },

  // Create new incident
  createIncident: async (incident: Omit<Incident, 'id' | 'dateInputted'>): Promise<IncidentResponse> => {
    const response = await fetch(`${API_URL}/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ incident } as UpsertIncidentRequest),
    })
    if (!response.ok) {
      throw new Error('Failed to create incident')
    }
    return response.json()
  },

  // Update incident
  updateIncident: async (id: string, incident: Omit<Incident, 'id' | 'dateInputted'>): Promise<IncidentResponse> => {
    const response = await fetch(`${API_URL}/incidents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ incident } as UpsertIncidentRequest),
    })
    if (!response.ok) {
      throw new Error('Failed to update incident')
    }
    return response.json()
  },

  // Delete incident
  deleteIncident: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/incidents/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete incident')
    }
  },
} 