/**
 * Lookup table cache API (`/LookupTable`) for form dropdowns and reference data.
 * Flow: category batch request → in-memory grouping → form select options.
 */
import { api } from '@/config/api'
import { logger } from '@/utils/logger'

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

const BASE_URL = '/LookupTable'

// Cache for lookup table data
const cache = new Map<string, { data: LookupTableItem[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Helper function to check if cache is valid
const isCacheValid = (timestamp: number) => {
  return Date.now() - timestamp < CACHE_DURATION
}

export const lookupTableService = {
  // Get all lookup tables
  getAll: async (): Promise<LookupTableItem[]> => {
    try {
      const response = await api.get<LookupTableResponse>(BASE_URL)
      return response.data.data
    } catch (error) {
      logger.error('Error fetching lookup tables:', error)
      throw error
    }
  },

  // Get lookup tables by category with caching
  getByCategory: async (category: string): Promise<LookupTableItem[]> => {
    // Check cache first
    const cached = cache.get(category)
    if (cached && isCacheValid(cached.timestamp)) {
      logger.debug(`Using cached data for category: ${category}`)
      return cached.data
    }

    try {
      const response = await api.get<LookupTableResponse>(`${BASE_URL}/category/${encodeURIComponent(category)}`)
      const result = response.data
      
      // Cache the result
      cache.set(category, { data: result.data, timestamp: Date.now() })
      
      return result.data
    } catch (error) {
      logger.error(`Error fetching lookup tables for category ${category}:`, error)
      throw error
    }
  },

  // Batch load multiple categories in parallel
  getByCategories: async (categories: string[]): Promise<Record<string, LookupTableItem[]>> => {
    const results: Record<string, LookupTableItem[]> = {}
    const uncachedCategories: string[] = []

    // Check cache for each category
    for (const category of categories) {
      const cached = cache.get(category)
      if (cached && isCacheValid(cached.timestamp)) {
        results[category] = cached.data
        logger.debug(`Using cached data for category: ${category}`)
      } else {
        uncachedCategories.push(category)
      }
    }

    // Load uncached categories in parallel
    if (uncachedCategories.length > 0) {
      logger.debug(`Loading uncached categories in parallel: ${uncachedCategories.join(', ')}`)
      
      const promises = uncachedCategories.map(async (category) => {
        try {
          const data = await lookupTableService.getByCategory(category)
          return { category, data }
        } catch (error) {
          logger.error(`Failed to load category ${category}:`, error)
          return { category, data: [] }
        }
      })

      const batchResults = await Promise.all(promises)
      
      // Merge results
      for (const { category, data } of batchResults) {
        results[category] = data
      }
    }

    return results
  },

  // Get all categories
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await api.get<{ data: string[] }>(`${BASE_URL}/categories`)
      return response.data.data
    } catch (error) {
      logger.error('Error fetching categories:', error)
      throw error
    }
  },

  // Get trainers specifically
  getTrainers: async (): Promise<LookupTableItem[]> => {
    return lookupTableService.getByCategory('Trainers')
  },

  // Clear cache
  clearCache: () => {
    cache.clear()
    logger.debug('Lookup table cache cleared')
  },

  // Clear specific category from cache
  clearCategoryCache: (category: string) => {
    cache.delete(category)
    logger.debug(`Cache cleared for category: ${category}`)
  }
}
