import { BASE_API_URL } from '@/config/api'

export interface LookupTableItem {
  lookupId: number
  category: string
  value: string
  description: string
  code: string
  sortOrder: number
  isActive: boolean
}

export interface LookupTableResponse {
  success: boolean
  message: string
  data: LookupTableItem[]
}

const BASE_URL = `${BASE_API_URL}/LookupTable`

export const lookupTableService = {
  // Get all lookup tables
  getAll: async (): Promise<LookupTableItem[]> => {
    try {
      const response = await fetch(BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: LookupTableResponse = await response.json()
      return result.data
    } catch (error) {
      console.error('Error fetching lookup tables:', error)
      throw error
    }
  },

  // Get lookup tables by category
  getByCategory: async (category: string): Promise<LookupTableItem[]> => {
    try {
      const response = await fetch(`${BASE_URL}/category/${encodeURIComponent(category)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: LookupTableResponse = await response.json()
      return result.data
    } catch (error) {
      console.error(`Error fetching lookup tables for category ${category}:`, error)
      throw error
    }
  },

  // Get all categories
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${BASE_URL}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  },

  // Get trainers specifically
  getTrainers: async (): Promise<LookupTableItem[]> => {
    return lookupTableService.getByCategory('Trainers')
  }
}
