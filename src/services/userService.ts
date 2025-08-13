import { User, CreateUserInput, UpdateUserInput } from '@/types/user'
import { api, USER_ENDPOINTS, ApiResponse, handleApiError } from '@/config/api'

export interface UserCreateRequest {
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  pageAccessRole?: string
  signature?: string
  signatureCode?: string
  jobTitle?: string
  userCompany?: string
  isActive?: boolean
  password: string
  assignedCustomerIds?: number[]
}

export interface UserUpdateRequest extends Partial<UserCreateRequest> {
  id: string
}

export interface UserDetailResponse extends User {
  id: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface UserListResponse {
  users: UserDetailResponse[]
  total: number
  page: number
  pageSize: number
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
    try {
      const response = await api.post<ApiResponse<UserDetailResponse>>(
        USER_ENDPOINTS.CREATE,
        userData
      )
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Update user
   */
  async updateUser(userData: UserUpdateRequest): Promise<UserDetailResponse> {
    try {
      const response = await api.put<ApiResponse<UserDetailResponse>>(
        USER_ENDPOINTS.UPDATE(userData.id),
        userData
      )
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await api.delete(USER_ENDPOINTS.DELETE(userId))
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Get all users with optional filtering and pagination
   */
  async getUsers(params?: {
    page?: number
    pageSize?: number
    search?: string
    role?: string
    isActive?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<UserListResponse> {
    try {
      const response = await api.get<ApiResponse<UserListResponse>>(
        USER_ENDPOINTS.LIST,
        { params }
      )
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserDetailResponse> {
    try {
      const response = await api.get<ApiResponse<UserDetailResponse>>(
        USER_ENDPOINTS.DETAIL(id)
      )
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<UserStatistics> {
    try {
      const response = await api.get<ApiResponse<UserStatistics>>(
        `${USER_ENDPOINTS.LIST}/statistics`
      )
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Assign customers to user
   */
  async assignCustomersToUser(userId: string, customerIds: number[]): Promise<UserDetailResponse> {
    try {
      const response = await api.post<ApiResponse<UserDetailResponse>>(
        USER_ENDPOINTS.ASSIGN_CUSTOMERS(userId),
        { customerIds }
      )
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Remove customer assignment from user
   */
  async removeCustomerFromUser(userId: string, customerId: number): Promise<UserDetailResponse> {
    try {
      const response = await api.delete<ApiResponse<UserDetailResponse>>(
        `${USER_ENDPOINTS.ASSIGN_CUSTOMERS(userId)}/${customerId}`
      )
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Search users by name or email
   */
  async searchUsers(query: string): Promise<UserDetailResponse[]> {
    try {
      const response = await api.get<ApiResponse<UserDetailResponse[]>>(
        `${USER_ENDPOINTS.LIST}/search`,
        { params: { q: query } }
      )
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<UserDetailResponse[]> {
    try {
      const response = await api.get<ApiResponse<UserDetailResponse[]>>(
        `${USER_ENDPOINTS.LIST}/by-role/${role}`
      )
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Get users by customer assignment
   */
  async getUsersByCustomer(customerId: number): Promise<UserDetailResponse[]> {
    try {
      const response = await api.get<ApiResponse<UserDetailResponse[]>>(
        `${USER_ENDPOINTS.LIST}/by-customer/${customerId}`
      )
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post(`${USER_ENDPOINTS.DETAIL(userId)}/change-password`, {
        currentPassword,
        newPassword
      })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Reset user password (admin only)
   */
  async resetPassword(userId: string, newPassword: string): Promise<void> {
    try {
      await api.post(`${USER_ENDPOINTS.DETAIL(userId)}/reset-password`, {
        newPassword
      })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Activate/deactivate user
   */
  async toggleUserStatus(userId: string, isActive: boolean): Promise<UserDetailResponse> {
    try {
      const response = await api.patch<ApiResponse<UserDetailResponse>>(
        `${USER_ENDPOINTS.DETAIL(userId)}/status`,
        { isActive }
      )
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(updates: Array<{ id: string; updates: Partial<UserUpdateRequest> }>): Promise<UserDetailResponse[]> {
    try {
      const response = await api.put<ApiResponse<UserDetailResponse[]>>(
        `${USER_ENDPOINTS.LIST}/bulk-update`,
        { updates }
      )
      return response.data.data
    } catch (error) {
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
    try {
      const response = await api.get(
        `${USER_ENDPOINTS.LIST}/export/${format}`,
        {
          params: filters,
          responseType: 'blob'
        }
      )
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }
}

export const userService = new UserService() 