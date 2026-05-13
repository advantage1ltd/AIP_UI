/**
 * User administration API and mapRawApiUserToUser normalizer for AuthContext.
 * Flow: raw API user payload → role/customer normalization → Redux and form consumers.
 */
import axios from 'axios'
import { api } from '@/config/api'
import { User, CreateUserInput, UpdateUserInput, UsersResponse } from '@/types/user'
import type { UserRole } from '@/utils/roles'
import { harmonizeRole } from '@/utils/roles'
import { logger } from '@/utils/logger'

export interface CreateUserRequest {
  username: string
  email: string
  password?: string
  role: string
  firstName: string
  lastName: string
  pageAccessRole?: string
  employeeId?: number
  phoneNumber?: string
  customerId?: number // For Customer users - direct foreign key to Customer table
  jobTitle?: string
  signature?: string
  signatureCode?: string
  recordIsDeleted?: boolean
  assignedCustomerIds?: number[]
}

// Backend response interfaces
export interface BackendUserResponse {
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
  customerId?: number
  customerName?: string // Company name for customer users
  recordIsDeleted: boolean
  isActive: boolean
  createdAt: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  lastLoginAt?: string
  phoneNumber?: string
  emailConfirmed: boolean
  twoFactorEnabled?: boolean
  notifySignInEmail?: boolean
  employeeId?: number
  employeeName?: string
  assignedCustomerIds?: number[] | string // Can be array or JSON string
  assignedCustomerNames?: string[]
}

export interface BackendUserListResponse {
  users?: BackendUserResponse[]
  totalCount?: number
  page?: number
  pageSize?: number
}

function parseEmployeeId(raw: unknown): number | undefined {
	if (raw === null || raw === undefined) return undefined
	if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return Math.trunc(raw)
	if (typeof raw === 'string') {
		const t = raw.trim()
		if (!t) return undefined
		const n = Number(t)
		if (Number.isFinite(n) && n > 0) return Math.trunc(n)
	}
	return undefined
}

export function mapBackendUserToUser(backendUser: BackendUserResponse): User {
  const role = harmonizeRole(backendUser.role)
  const pageAccessTrimmed = backendUser.pageAccessRole?.trim()
  const pageAccessRole = harmonizeRole(pageAccessTrimmed ? pageAccessTrimmed : backendUser.role)
  const cidRaw = backendUser.customerId
  const cid = cidRaw != null ? Number(cidRaw) : NaN
  const hasTenant = Number.isFinite(cid) && cid > 0

  const base = {
    id: backendUser.id,
    username: backendUser.username,
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    email: backendUser.email,
    role,
    pageAccessRole,
    signature: backendUser.signature,
    signatureCode: backendUser.signatureCode,
    jobTitle: backendUser.jobTitle,
    recordIsDeleted: backendUser.recordIsDeleted,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt || backendUser.createdAt,
		employeeId: parseEmployeeId(backendUser.employeeId),
    employeeName: backendUser.employeeName,
    phoneNumber: backendUser.phoneNumber,
    emailConfirmed: backendUser.emailConfirmed,
    twoFactorEnabled: Boolean(backendUser.twoFactorEnabled),
    notifySignInEmail: Boolean(backendUser.notifySignInEmail),
    lastLoginAt: backendUser.lastLoginAt,
  }

  if (role === 'customer' && hasTenant) {
    return {
      ...base,
      role: 'customer',
      customerId: cid,
      customerName: backendUser.customerName,
    } as User
  }

  const staffRole: Exclude<UserRole, 'customer'> =
    role === 'customer' ? 'securityofficer' : role

  return {
    ...base,
    role: staffRole,
    assignedCustomerIds: parseAssignedCustomerIdsStatic(backendUser.assignedCustomerIds),
    assignedCustomerNames: backendUser.assignedCustomerNames || [],
  } as User
}

function parseAssignedCustomerIdsStatic(customerIds: unknown): number[] {
  if (!customerIds) return []
  if (Array.isArray(customerIds)) return customerIds.map((id) => Number(id)).filter((n) => Number.isFinite(n))
  if (typeof customerIds === 'string') {
    try {
      const parsed = JSON.parse(customerIds)
      return Array.isArray(parsed) ? parsed.map((id: unknown) => Number(id)).filter((n: number) => Number.isFinite(n)) : []
    } catch {
      return []
    }
  }
  return []
}

/** Normalize loose login / Auth.me payloads into `User`. */
export function mapRawApiUserToUser(raw: unknown): User {
  const r = raw as Record<string, unknown>
  const backendUser: BackendUserResponse = {
    id: String(r.id ?? r.Id ?? ''),
    username: String(r.username ?? r.Username ?? ''),
    firstName: String(r.firstName ?? r.FirstName ?? ''),
    lastName: String(r.lastName ?? r.LastName ?? ''),
    email: String(r.email ?? r.Email ?? ''),
    role: String(r.role ?? r.Role ?? ''),
    pageAccessRole: String(r.pageAccessRole ?? r.PageAccessRole ?? r.role ?? r.Role ?? ''),
    signature: (r.signature ?? r.Signature) as string | undefined,
    signatureCode: (r.signatureCode ?? r.SignatureCode) as string | undefined,
    jobTitle: (r.jobTitle ?? r.JobTitle) as string | undefined,
    customerId: (r.customerId ?? r.CustomerId) as number | undefined,
    customerName: (r.customerName ?? r.CustomerName) as string | undefined,
    recordIsDeleted: Boolean(r.recordIsDeleted ?? r.RecordIsDeleted ?? false),
    isActive: Boolean(r.isActive ?? r.IsActive ?? true),
    createdAt: String(r.createdAt ?? r.CreatedAt ?? new Date().toISOString()),
    updatedAt: (r.updatedAt ?? r.UpdatedAt) as string | undefined,
    employeeId: parseEmployeeId(r.employeeId ?? r.EmployeeId),
    employeeName: (r.employeeName ?? r.EmployeeName) as string | undefined,
    assignedCustomerIds: (r.assignedCustomerIds ?? r.AssignedCustomerIds) as BackendUserResponse['assignedCustomerIds'],
    assignedCustomerNames: (r.assignedCustomerNames ?? r.AssignedCustomerNames) as string[] | undefined,
    phoneNumber: (r.phoneNumber ?? r.PhoneNumber) as string | undefined,
    emailConfirmed: Boolean(r.emailConfirmed ?? r.EmailConfirmed ?? false),
    twoFactorEnabled: Boolean(r.twoFactorEnabled ?? r.TwoFactorEnabled ?? false),
    notifySignInEmail: Boolean(r.notifySignInEmail ?? r.NotifySignInEmail ?? false),
    lastLoginAt: (r.lastLoginAt ?? r.LastLoginAt) as string | undefined,
  }
  return mapBackendUserToUser(backendUser)
}

export interface UsersQueryParams {
  page?: number
  pageSize?: number
  searchTerm?: string
  role?: string
  isActive?: boolean
  includeDeleted?: boolean
  assignedCustomerId?: number
  employeeId?: number
}

class UserService {
  private baseUrl = '/User'

  /**
   * Creates a new user account with optional employee linking
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      logger.debug('🔄 [UserService] Creating user:', userData)
      logger.debug('🔄 [UserService] CustomerId in request:', userData.customerId)
      const response = await api.post(`${this.baseUrl}/create`, userData)
      logger.debug('✅ [UserService] User created successfully:', response.data)
      
      const backendUser = response.data as BackendUserResponse
      return mapBackendUserToUser(backendUser)
    } catch (error) {
      logger.error('❌ [UserService] Error creating user:', error)
      throw new Error('Failed to create user account')
    }
  }

  /**
   * Gets all users with pagination and optional filtering
   */
  async getUsers(params: UsersQueryParams = {}): Promise<UsersResponse> {
    try {
      logger.debug('🔄 [UserService] Fetching users with params:', params)
      const queryParams = {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        ...(params.searchTerm ? { searchTerm: params.searchTerm } : {}),
        ...(params.role ? { role: params.role } : {}),
        ...(typeof params.isActive === 'boolean' ? { isActive: params.isActive } : {}),
        ...(typeof params.includeDeleted === 'boolean' ? { includeDeleted: params.includeDeleted } : {}),
        ...(typeof params.assignedCustomerId === 'number' ? { assignedCustomerId: params.assignedCustomerId } : {}),
        ...(typeof params.employeeId === 'number' ? { employeeId: params.employeeId } : {})
      }

      const response = await api.get(`${this.baseUrl}/list`, { params: queryParams })
      logger.debug('✅ [UserService] Raw backend response:', response.data)
      
      // Transform backend response to frontend format
      const backendResponse = response.data as BackendUserListResponse
      const backendUsers = Array.isArray(backendResponse.users) ? backendResponse.users : []
      logger.debug('✅ [UserService] Backend response users:', backendUsers)
      
      const transformedUsers = backendUsers.map((user) => mapBackendUserToUser(user as BackendUserResponse))
      
      logger.debug('✅ [UserService] Transformed users:', transformedUsers)
      const resolvedPageSize = backendResponse.pageSize ?? queryParams.pageSize ?? 10
      const resolvedTotalCount = backendResponse.totalCount ?? transformedUsers.length

      return {
        success: true,
        data: transformedUsers,
        pagination: {
          currentPage: backendResponse.page ?? queryParams.page ?? 1,
          totalPages: Math.ceil(resolvedTotalCount / Math.max(resolvedPageSize, 1)),
          pageSize: resolvedPageSize,
          totalCount: resolvedTotalCount
        }
      }
    } catch (error) {
      logger.error('❌ [UserService] Error getting users:', error)
      throw new Error('Failed to get users')
    }
  }

  /**
   * Gets a specific user by ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      logger.debug('🔄 [UserService] Fetching user by ID:', userId)
      const response = await api.get(`${this.baseUrl}/${userId}`)
      logger.debug('✅ [UserService] User fetched successfully:', response.data)
      
      // Transform backend response to frontend format
      const backendUser = response.data as BackendUserResponse

      logger.debug('🔄 [UserService] getUserById - Role normalization:', {
        backendRole: backendUser.role,
        harmonized: harmonizeRole(backendUser.role),
        customerId: backendUser.customerId,
        customerName: backendUser.customerName,
      })

      return mapBackendUserToUser(backendUser)
    } catch (error) {
      logger.error('❌ [UserService] Error getting user:', error)
      throw new Error('Failed to get user')
    }
  }

  /**
   * Updates a user account
   */
  async updateUser(userData: { id: string } & Partial<CreateUserRequest>): Promise<User> {
    try {
      logger.debug('🔄 [UserService] updateUser called with:', {
        id: userData.id,
        hasCustomerId: 'customerId' in userData,
        customerId: userData.customerId,
        customerIdType: typeof userData.customerId,
        role: userData.role,
        hasAssignedCustomerIds: 'assignedCustomerIds' in userData
      })
      
      const { id, ...updateData } = userData
      
      // Ensure assignedCustomerIds is included in the update data
      if ('assignedCustomerIds' in userData) {
        (updateData as any).assignedCustomerIds = userData.assignedCustomerIds
        logger.debug('🔄 [UserService] Added assignedCustomerIds:', (updateData as any).assignedCustomerIds)
      }
      
      // Always include customerId in update data (even if null/undefined)
      // This ensures the backend can properly handle customerId updates
      if ('customerId' in userData) {
        // Send null explicitly if customerId is undefined, to allow backend to process it
        (updateData as any).customerId = userData.customerId ?? null
        logger.debug('🔄 [UserService] Processed customerId:', {
          original: userData.customerId,
          processed: (updateData as any).customerId,
          type: typeof (updateData as any).customerId,
          isNull: (updateData as any).customerId === null,
          isUndefined: (updateData as any).customerId === undefined
        })
      } else {
        logger.debug('⚠️ [UserService] customerId not in userData, not including in update')
      }
      
      logger.debug('🔄 [UserService] Final updateData being sent:', JSON.stringify(updateData, null, 2))
      logger.debug('🔄 [UserService] Making PUT request to:', `${this.baseUrl}/${id}`)
      
      const response = await api.put(`${this.baseUrl}/${id}`, updateData)
      
      logger.debug('✅ [UserService] API response received:', {
        status: response.status,
        hasData: !!response.data,
        customerId: response.data?.customerId,
        customerName: response.data?.customerName,
        role: response.data?.role,
        fullResponse: response.data
      })
      
      // Transform backend response to frontend format
      const backendUser = response.data as BackendUserResponse

      logger.debug('🔄 [UserService] updateUser - Role normalization:', {
        backendRole: backendUser.role,
        harmonized: harmonizeRole(backendUser.role),
        customerId: backendUser.customerId,
        customerName: backendUser.customerName,
      })

      return mapBackendUserToUser(backendUser)
    } catch (error) {
      logger.error('❌ [UserService] Error updating user:', error)
      throw new Error('Failed to update user')
    }
  }

  /**
   * Deletes a user account
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      logger.debug('🔄 [UserService] Deleting user:', userId)
      await api.delete(`${this.baseUrl}/${userId}`)
      logger.debug('✅ [UserService] User deleted successfully')
    } catch (error) {
      logger.error('❌ [UserService] Error deleting user:', error)
      const message = ((): string => {
        if (axios.isAxiosError(error)) {
          const d = error.response?.data as { error?: string; details?: unknown; message?: string } | undefined
          const parts: string[] = []
          if (typeof d?.error === 'string' && d.error.trim()) parts.push(d.error.trim())
          if (typeof d?.message === 'string' && d.message.trim()) parts.push(d.message.trim())
          if (Array.isArray(d?.details)) {
            for (const item of d.details) {
              if (typeof item === 'string' && item.trim()) parts.push(item.trim())
            }
          }
          if (parts.length) return parts.join(' ')
          return error.message || 'Failed to delete user'
        }
        if (error instanceof Error) return error.message
        return 'Failed to delete user'
      })()
      throw new Error(message)
    }
  }

  /**
   * Resets a user's password
   */
  async resetPassword(userId: string, newPassword: string): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/${userId}/reset-password`, {
        newPassword
      })
    } catch (error) {
      logger.error('Error resetting password:', error)
      throw new Error('Failed to reset password')
    }
  }

  /**
   * Links an existing user to an employee
   */
  async linkToEmployee(userId: string, employeeId: number): Promise<User> {
    try {
      const response = await api.post(`${this.baseUrl}/${userId}/link-employee`, {
        employeeId
      })
      return response.data
    } catch (error) {
      logger.error('Error linking user to employee:', error)
      throw new Error('Failed to link user to employee')
    }
  }

  /**
   * Unlinks a user from an employee
   */
  async unlinkFromEmployee(userId: string): Promise<User> {
    try {
      const response = await api.post(`${this.baseUrl}/${userId}/unlink-employee`)
      return response.data
    } catch (error) {
      logger.error('Error unlinking user from employee:', error)
      throw new Error('Failed to unlink user from employee')
    }
  }

  /**
   * Gets users by role
   */
  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const response = await api.get(`${this.baseUrl}/by-role/${role}`)
      return response.data
    } catch (error) {
      logger.error('Error getting users by role:', error)
      throw new Error('Failed to get users by role')
    }
  }

  /**
   * Gets unlinked employees (employees without user accounts)
   */
  async getUnlinkedEmployees(): Promise<any[]> {
    try {
      const response = await api.get(`${this.baseUrl}/unlinked-employees`)
      // Transform backend response to frontend format
      return response.data.map((employee: any) => ({
        id: Number(employee.employeeId ?? employee.EmployeeId ?? employee.id),
        firstName: employee.firstName,
        surname: employee.surname,
        employeeNumber: employee.employeeNumber,
        position: employee.position,
        email: employee.email,
        employeeStatus: employee.employeeStatus,
        userId: employee.userId
      }))
    } catch (error) {
      logger.error('Error getting unlinked employees:', error)
      throw new Error('Failed to get unlinked employees')
    }
  }

  /**
   * Gets linked employees (employees with user accounts)
   */
  async getLinkedEmployees(): Promise<any[]> {
    try {
      const response = await api.get(`${this.baseUrl}/linked-employees`)
      return response.data
    } catch (error) {
      logger.error('Error getting linked employees:', error)
      throw new Error('Failed to get linked employees')
    }
  }

  /**
   * Validates if a username is available
   */
  async validateUsername(username: string): Promise<{ available: boolean; message?: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/validate-username`, {
        params: { username }
      })
      return response.data
    } catch (error) {
      logger.error('Error validating username:', error)
      throw new Error('Failed to validate username')
    }
  }

  /**
   * Validates if an email is available
   */
  async validateEmail(email: string): Promise<{ available: boolean; message?: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/validate-email`, {
        params: { email }
      })
      return response.data
    } catch (error) {
      logger.error('Error validating email:', error)
      throw new Error('Failed to validate email')
    }
  }
}

export const userService = new UserService() 