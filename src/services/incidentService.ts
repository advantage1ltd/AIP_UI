import { Incident } from "@/types/incidents"
import { mockIncidents } from "@/data/mockIncidents"

// In-memory store for incidents
let incidents = [...mockIncidents]

export const incidentService = {
  // Get all incidents
  getAll: async (): Promise<Incident[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(incidents)
      }, 500) // Simulate network delay
    })
  },

  // Get incident by id
  getById: async (id: string): Promise<Incident | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const incident = incidents.find(inc => inc.id === id)
        resolve(incident)
      }, 500)
    })
  },

  // Create new incident
  create: async (incident: Incident): Promise<Incident> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newIncident = {
          ...incident,
          id: `INC-${Date.now()}`,
          dateInputted: new Date().toISOString()
        }
        incidents.push(newIncident)
        resolve(newIncident)
      }, 500)
    })
  },

  // Update incident
  update: async (id: string, incident: Incident): Promise<Incident> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = incidents.findIndex(inc => inc.id === id)
        if (index === -1) {
          reject(new Error('Incident not found'))
          return
        }
        incidents[index] = { ...incident }
        resolve(incidents[index])
      }, 500)
    })
  },

  // Delete incident
  delete: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = incidents.findIndex(inc => inc.id === id)
        if (index === -1) {
          reject(new Error('Incident not found'))
          return
        }
        incidents = incidents.filter(inc => inc.id !== id)
        resolve()
      }, 500)
    })
  }
} 