import { api, REGION_ENDPOINTS, handleApiError } from '@/config/api'
import type { Region } from '@/types/customer'
import { logger } from '@/utils/logger'

export interface CreateRegionData {
  fkCustomerID: number
  regionName: string
  regionDescription?: string
  recordIsDeletedYN?: boolean
}

export interface UpdateRegionData {
  regionName: string
  regionDescription?: string
  recordIsDeletedYN?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: string[]
}

export const regionService = {
  // Get all regions
  async getRegions(customerId?: number): Promise<{ success: boolean; data: Region[] }> {
    try {
      logger.debug('🔄 [RegionService] Fetching regions from backend')
      
      const params = new URLSearchParams()
      if (customerId) {
        params.append('customerId', customerId.toString())
      }
      
      const response = await api.get<ApiResponse<Region[]>>(`${REGION_ENDPOINTS.LIST}?${params}`)
      
      if (response.data.success) {
        logger.debug('✅ [RegionService] Successfully fetched regions:', response.data.data.length)
        return {
          success: true,
          data: response.data.data
        }
      } else {
        logger.error('❌ [RegionService] Failed to fetch regions:', response.data.message)
        return {
          success: false,
          data: []
        }
      }
    } catch (error) {
      logger.error('❌ [RegionService] Error fetching regions:', error)
      return {
        success: false,
        data: []
      }
    }
  },

  // Get regions by customer
  async getRegionsByCustomer(customerId: number): Promise<{ success: boolean; data: Region[] }> {
    try {
      logger.debug('🔄 [RegionService] Fetching regions for customer:', customerId)
      
      const response = await api.get<ApiResponse<Region[]>>(REGION_ENDPOINTS.BY_CUSTOMER(customerId.toString()))
      
      if (response.data.success) {
        logger.debug('✅ [RegionService] Successfully fetched regions for customer:', response.data.data.length)
        return {
          success: true,
          data: response.data.data
        }
      } else {
        logger.error('❌ [RegionService] Failed to fetch regions for customer:', response.data.message)
        return {
          success: false,
          data: []
        }
      }
    } catch (error) {
      logger.error('❌ [RegionService] Error fetching regions for customer:', error)
      return {
        success: false,
        data: []
      }
    }
  },

  // Get region by ID
  async getRegionById(id: number): Promise<{ success: boolean; data?: Region }> {
    try {
      logger.debug('🔄 [RegionService] Fetching region by ID:', id)
      
      const response = await api.get<ApiResponse<Region>>(REGION_ENDPOINTS.DETAIL(id.toString()))
      
      if (response.data.success) {
        logger.debug('✅ [RegionService] Successfully fetched region:', response.data.data)
        return {
          success: true,
          data: response.data.data
        }
      } else {
        logger.error('❌ [RegionService] Failed to fetch region:', response.data.message)
        return {
          success: false
        }
      }
    } catch (error) {
      logger.error('❌ [RegionService] Error fetching region:', error)
      return {
        success: false
      }
    }
  },

  // Create new region
  async createRegion(data: CreateRegionData): Promise<{ success: boolean; data?: Region; message?: string }> {
    try {
      logger.debug('🔄 [RegionService] Creating region:', data)
      
      const response = await api.post<ApiResponse<Region>>(REGION_ENDPOINTS.CREATE, data)
      
      if (response.data.success) {
        logger.debug('✅ [RegionService] Successfully created region:', response.data.data)
        return {
          success: true,
          data: response.data.data
        }
      } else {
        logger.error('❌ [RegionService] Failed to create region:', response.data.message)
        return {
          success: false,
          message: response.data.message
        }
      }
    } catch (error) {
      logger.error('❌ [RegionService] Error creating region:', error)
      return {
        success: false,
        message: handleApiError(error)
      }
    }
  },

  // Update region
  async updateRegion(id: number, data: UpdateRegionData): Promise<{ success: boolean; data?: Region; message?: string }> {
    try {
      logger.debug('🔄 [RegionService] Updating region:', id, data)
      
      const response = await api.put<ApiResponse<Region>>(REGION_ENDPOINTS.UPDATE(id.toString()), data)
      
      if (response.data.success) {
        logger.debug('✅ [RegionService] Successfully updated region:', response.data.data)
        return {
          success: true,
          data: response.data.data
        }
      } else {
        logger.error('❌ [RegionService] Failed to update region:', response.data.message)
        return {
          success: false,
          message: response.data.message
        }
      }
    } catch (error) {
      logger.error('❌ [RegionService] Error updating region:', error)
      return {
        success: false,
        message: handleApiError(error)
      }
    }
  },

  // Delete region
  async deleteRegion(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      logger.debug('🔄 [RegionService] Deleting region:', id)
      
      const response = await api.delete<ApiResponse<object>>(REGION_ENDPOINTS.DELETE(id.toString()))
      
      if (response.data.success) {
        logger.debug('✅ [RegionService] Successfully deleted region')
        return {
          success: true
        }
      } else {
        logger.error('❌ [RegionService] Failed to delete region:', response.data.message)
        return {
          success: false,
          message: response.data.message
        }
      }
    } catch (error) {
      logger.error('❌ [RegionService] Error deleting region:', error)
      return {
        success: false,
        message: handleApiError(error)
      }
    }
  }
}
