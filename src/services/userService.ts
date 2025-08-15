import { User, CreateUserInput, UpdateUserInput } from '@/types/user'
import { api, USER_ENDPOINTS, ApiResponse, handleApiError } from '@/config/api'

export interface UserCreateRequest {
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  pageAccessRole: string
  signature?: string
  signatureCode?: string
  jobTitle?: string
  userCompany?: string
  isActive?: boolean
  password: string
  confirmPassword: string
  assignedCustomerIds?: number[]
  customerId?: number
}

export interface UserUpdateRequest extends Partial<UserCreateRequest> {
  id: string
}

export interface UserDetailResponse {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  role: string
  pageAccessRole: string
  signature?: string
  signatureCode?: string
  jobTitle?: string
  userCompany?: string
  isActive: boolean
  assignedCustomerIds?: number[]
  customerId?: number
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface UserListResponse {
  items: UserDetailResponse[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface UserStatistics {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  usersByRole: Record<string, number>
  newUsersThisMonth: number
}

class UserService {
  /**
   * Create a new user
   */
  async createUser(userData: UserCreateRequest): Promise<UserDetailResponse> {
    console.log('🔄 [UserService] Creating user via real API', { 
      username: userData.username, 
      role: userData.role,
      assignedCustomerIds: userData.assignedCustomerIds 
    })
    
    try {
      const response = await api.post<ApiResponse<UserDetailResponse>>(
        USER_ENDPOINTS.CREATE,
        userData
      )
      
      console.log('✅ [UserService] User created successfully via real API', { 
        id: response.data.data.id,
        username: response.data.data.username 
      })
      
      return response.data.data
    } catch (error) {
      console.error('❌ [UserService] User creation failed via real API:', error)
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Update user
   */
  async updateUser(userData: UserUpdateRequest): Promise<UserDetailResponse> {
    console.log('🔄 [UserService] Updating user via real API', { 
      id: userData.id,
      role: userData.role,
      assignedCustomerIds: userData.assignedCustomerIds 
    })
    
    try {
      const response = await api.put<ApiResponse<UserDetailResponse>>(
        USER_ENDPOINTS.UPDATE(userData.id),
        userData
      )
      
      console.log('✅ [UserService] User updated successfully via real API', { 
        id: response.data.data.id,
        username: response.data.data.username 
      })
      
      return response.data.data
    } catch (error) {
      console.error('❌ [UserService] User update failed via real API:', error)
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    console.log('🔄 [UserService] Deleting user via real API', { userId })
    
    try {
      await api.delete(USER_ENDPOINTS.DELETE(userId))
      console.log('✅ [UserService] User deleted successfully via real API', { userId })
    } catch (error) {
      console.error('❌ [UserService] User deletion failed via real API:', error)
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Get all users with optional filtering and pagination
   */
  async getUsers(params?: {
    page?: number
    pageSize?: number
    searchTerm?: string
    role?: string
    isActive?: boolean
    sortBy?: string
    sortDescending?: boolean
  }): Promise<UserListResponse> {
    console.log('🔄 [UserService] Getting users via real API', { params })
    
    try {
      const response = await api.get<ApiResponse<UserListResponse>>(
        USER_ENDPOINTS.LIST,
        { params }
      )
      
      console.log('✅ [UserService] Users retrieved successfully via real API', { 
        totalCount: response.data.data.totalCount,
        itemsCount: response.data.data.items.length 
      })
      
      return response.data.data
    } catch (error) {
      console.error('❌ [UserService] Failed to get users via real API:', error)
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserDetailResponse> {
    console.log('🔄 [UserService] Getting user by ID via real API', { id })
    
    try {
      const response = await api.get<ApiResponse<UserDetailResponse>>(
        USER_ENDPOINTS.DETAIL(id)
      )
      
      console.log('✅ [UserService] User retrieved successfully via real API', { 
        id: response.data.data.id,
        username: response.data.data.username 
      })
      
      return response.data.data
    } catch (error) {
      console.error('❌ [UserService] Failed to get user via real API:', error)
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<UserStatistics> {
    console.log('🔄 [UserService] Getting user statistics via real API')
    
    try {
      const response = await api.get<ApiResponse<UserStatistics>>(
        `${USER_ENDPOINTS.LIST}/statistics`
      )
      
      console.log('✅ [UserService] User statistics retrieved successfully via real API')
      
      return response.data.data
    } catch (error) {
      console.error('❌ [UserService] Failed to get user statistics via real API:', error)
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Assign customers to user
   */
  async assignCustomersToUser(userId: string, customerIds: number[]): Promise<UserDetailResponse> {
    console.log('🔄 [UserService] Assigning customers to user via real API', { userId, customerIds })
    
    try {
      const response = await api.post<ApiResponse<UserDetailResponse>>(
        USER_ENDPOINTS.ASSIGN_CUSTOMERS(userId),
        { customerIds }
      )
      
      console.log('✅ [UserService] Customers assigned successfully via real API', { 
        id: response.data.data.id,
        assignedCustomerIds: response.data.data.assignedCustomerIds 
      })
      
      return response.data.data
    } catch (error) {
      console.error('❌ [UserService] Failed to assign customers via real API:', error)
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Remove customer assignment from user
   */
  async removeCustomerFromUser(userId: string, customerId: number): Promise<UserDetailResponse> {
    console.log('🔄 [UserService] Removing customer from user via real API', { userId, customerId })
    
    try {
      const response = await api.delete<ApiResponse<UserDetailResponse>>(
        `${USER_ENDPOINTS.ASSIGN_CUSTOMERS(userId)}/${customerId}`
      )
      
      console.log('✅ [UserService] Customer removed successfully via real API', { 
        id: response.data.data.id 
      })
      
      return response.data.data
    } catch (error) {
      console.error('❌ [UserService] Failed to remove customer via real API:', error)
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Search users by name or email
   */
  async searchUsers(query: string): Promise<UserDetailResponse[]> {
    console.log('🔄 [UserService] Searching users via real API', { query })
    
    try {
      const response = await api.get<ApiResponse<UserDetailResponse[]>>(
        `${USER_ENDPOINTS.LIST}/search`,
        { params: { q: query } }
      )
      
      console.log('✅ [UserService] User search completed via real API', { 
        resultsCount: response.data.data.length 
      })
      
      return response.data.data
    } catch (error) {
      console.error('❌ [UserService] Failed to search users via real API:', error)
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<UserDetailResponse[]> {
    console.log('🔄 [UserService] Getting users by role via real API', { role })
    
    try {
      const response = await api.get<ApiResponse<UserDetailResponse[]>>(
        `${USER_ENDPOINTS.LIST}/by-role/${role}`
      )
      
      console.log('✅ [UserService] Users by role retrieved via real API', { 
        role,
        count: response.data.data.length 
      })
      
      return response.data.data
    } catch (error) {
      console.error('❌ [UserService] Failed to get users by role via real API:', error)
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Get users by customer assignment
   */
  async getUsersByCustomer(customerId: number): Promise<UserDetailResponse[]> {
    console.log('🔄 [UserService] Getting users by customer via real API', { customerId })
    
    try {
      const response = await api.get<ApiResponse<UserDetailResponse[]>>(
        `${USER_ENDPOINTS.LIST}/by-customer/${customerId}`
      )
      
      console.log('✅ [UserService] Users by customer retrieved via real API', { 
        customerId,
        count: response.data.data.length 
      })
      
      return response.data.data
    } catch (error) {
      console.error('❌ [UserService] Failed to get users by customer via real API:', error)
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    console.log('🔄 [UserService] Changing user password via real API', { userId })
    
    try {
      await api.post(`${USER_ENDPOINTS.DETAIL(userId)}/change-password`, {
        currentPassword,
        newPassword
      })
      
      console.log('✅ [UserService] Password changed successfully via real API', { userId })
    } catch (error) {
      console.error('❌ [UserService] Failed to change password via real API:', error)
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Reset user password (admin only)
   */
  async resetPassword(userId: string, newPassword: string): Promise<void> {
    console.log('🔄 [UserService] Resetting user password via real API', { userId })
    
    try {
      await api.post(`${USER_ENDPOINTS.DETAIL(userId)}/reset-password`, {
        newPassword
      })
      
      console.log('✅ [UserService] Password reset successfully via real API', { userId })
    } catch (error) {
      console.error('❌ [UserService] Failed to reset password via real API:', error)
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Activate/deactivate user
   */
  async toggleUserStatus(userId: string, isActive: boolean): Promise<UserDetailResponse> {
    console.log('🔄 [UserService] Toggling user status via real API', { userId, isActive })
    
    try {
      const response = await api.patch<ApiResponse<UserDetailResponse>>(
        `${USER_ENDPOINTS.DETAIL(userId)}/status`,
        { isActive }
      )
      
      console.log('✅ [UserService] User status toggled successfully via real API', { 
        id: response.data.data.id,
        isActive: response.data.data.isActive 
      })
      
      return response.data.data
    } catch (error) {
      console.error('❌ [UserService] Failed to toggle user status via real API:', error)
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(updates: Array<{ id: string; updates: Partial<UserUpdateRequest> }>): Promise<UserDetailResponse[]> {
    console.log('🔄 [UserService] Bulk updating users via real API', { updatesCount: updates.length })
    
    try {
      const response = await api.put<ApiResponse<UserDetailResponse[]>>(
        `${USER_ENDPOINTS.LIST}/bulk-update`,
        { updates }
      )
      
      console.log('✅ [UserService] Bulk update completed successfully via real API', { 
        updatedCount: response.data.data.length 
      })
      
      return response.data.data
    } catch (error) {
      console.error('❌ [UserService] Failed to bulk update users via real API:', error)
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Export users to CSV/Excel
   */
  async exportUsers(format: 'csv' | 'excel', filters?: {
    role?: string
    isActive?: boolean
    dateFrom?: string
    dateTo?: string
  }): Promise<Blob> {
    console.log('🔄 [UserService] Exporting users via real API', { format, filters })
    
    try {
      const response = await api.get(
        `${USER_ENDPOINTS.LIST}/export/${format}`,
        {
          params: filters,
          responseType: 'blob'
        }
      )
      
      console.log('✅ [UserService] Users exported successfully via real API', { format })
      
      return response.data
    } catch (error) {
      console.error('❌ [UserService] Failed to export users via real API:', error)
      throw new Error(handleApiError(error))
    }
  }
}

export const userService = new UserService() 