import { http, HttpResponse } from 'msw'
import { authService, AuthUser } from '@/services/authService'

/**
 * Unified MSW Authentication Utilities
 * This module provides centralized authentication utilities for all MSW handlers
 * When switching to real .NET API, only this file needs to be updated
 */

export interface AuthResult {
  isAuthenticated: boolean
  user: AuthUser | null
  customerId: number | null
  hasGlobalAccess: boolean
  accessibleCustomerIds: number[]
  errorMessage?: string
}

/**
 * Extract and validate authentication information from MSW request
 * In production: This would validate JWT tokens with the backend
 */
export const getAuthFromRequest = (request: any): AuthResult => {
  try {
    // For MSW, we read from localStorage (simulating client-side state)
    // In production: This would extract and validate JWT from Authorization header
    const currentUser = authService.getCurrentUser()
    
    if (!currentUser) {
      return {
        isAuthenticated: false,
        user: null,
        customerId: null,
        hasGlobalAccess: false,
        accessibleCustomerIds: [],
        errorMessage: 'User not authenticated'
      }
    }

    // Extract customer ID from query parameter (for multi-customer access)
    const customerId = extractCustomerIdFromRequest(request, currentUser)
    
    return {
      isAuthenticated: true,
      user: currentUser,
      customerId,
      hasGlobalAccess: currentUser.accessLevel === 'global',
      accessibleCustomerIds: currentUser.accessibleCustomerIds || [],
      errorMessage: undefined
    }
    
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      isAuthenticated: false,
      user: null,
      customerId: null,
      hasGlobalAccess: false,
      accessibleCustomerIds: [],
      errorMessage: 'Authentication failed'
    }
  }
}

/**
 * Extract customer ID from request (query param or user context)
 */
const extractCustomerIdFromRequest = (request: any, user: AuthUser): number | null => {
  const url = new URL(request.url)
  
  // First try query parameter (for Administrator/AdvantageOne users accessing specific customer)
  const queryCustomerId = url.searchParams.get('customerId')
  if (queryCustomerId) {
    const id = parseInt(queryCustomerId)
    if (!isNaN(id)) {
      return id
    }
  }
  
  // For customer users, use their assigned customer ID
  if (user.role.includes('Customer')) {
    return user.customerId || user.companyId || null
  }
  
  // For AdvantageOne officers with single customer assignment
  if (user.role === 'AdvantageOneOfficer' && user.accessibleCustomerIds?.length === 1) {
    return user.accessibleCustomerIds[0]
  }
  
  // For global access users without specific customer ID, return null (access all)
  return null
}

/**
 * Check if user has permission for specific resource and action
 */
export const checkPermission = (auth: AuthResult, resource: string, action: string): boolean => {
  if (!auth.isAuthenticated || !auth.user) {
    return false
  }
  
  return authService.hasPermission(resource, action)
}

/**
 * Filter data based on user's customer access
 * For global users: returns all data
 * For customer users: filters by accessible customer IDs
 */
export const filterDataByCustomerAccess = <T extends { customerId?: number }>(
  data: T[], 
  auth: AuthResult
): T[] => {
  // Global access users see all data
  if (auth.hasGlobalAccess) {
    return data
  }
  
  // No accessible customers = no data
  if (!auth.accessibleCustomerIds.length) {
    return []
  }
  
  // Filter by accessible customer IDs
  return data.filter(item => 
    item.customerId && auth.accessibleCustomerIds.includes(item.customerId)
  )
}

/**
 * Apply customer filtering based on request and user access
 * Returns filtered data and effective customer ID
 */
export const applyCustomerFilter = <T extends { customerId?: number }>(
  data: T[],
  auth: AuthResult
): { data: T[], effectiveCustomerId: number | null } => {
  // If specific customer ID requested and user has access
  if (auth.customerId && (auth.hasGlobalAccess || auth.accessibleCustomerIds.includes(auth.customerId))) {
    return {
      data: data.filter(item => item.customerId === auth.customerId),
      effectiveCustomerId: auth.customerId
    }
  }
  
  // Apply general customer access filtering
  const filteredData = filterDataByCustomerAccess(data, auth)
  
  return {
    data: filteredData,
    effectiveCustomerId: auth.customerId
  }
}

/**
 * Create unauthorized response
 */
export const createUnauthorizedResponse = (message: string = 'Unauthorized') => {
  return HttpResponse.json({
    success: false,
    message,
    error: 'UNAUTHORIZED'
  }, { status: 401 })
}

/**
 * Create forbidden response
 */
export const createForbiddenResponse = (message: string = 'Access denied') => {
  return HttpResponse.json({
    success: false,
    message,
    error: 'FORBIDDEN'
  }, { status: 403 })
}

/**
 * Higher-order function to wrap handlers with authentication
 * Usage: export const protectedHandler = withAuth(['incidents:read'], handler)
 */
export const withAuth = (
  requiredPermissions: string[],
  handler: (request: any, auth: AuthResult, params?: any) => Promise<any>
) => {
  return async (request: any, params?: any) => {
    const auth = getAuthFromRequest(request)
    
    if (!auth.isAuthenticated) {
      return createUnauthorizedResponse(auth.errorMessage)
    }
    
    // Check permissions
    for (const permission of requiredPermissions) {
      const [resource, action] = permission.split(':')
      if (!checkPermission(auth, resource, action)) {
        return createForbiddenResponse(`Missing permission: ${permission}`)
      }
    }
    
    return handler(request, auth, params)
  }
}

/**
 * Log authentication details for debugging
 */
export const logAuthDetails = (request: any, auth: AuthResult, handlerName: string) => {
  console.log(`🔍 [MSW:${handlerName}] Auth Details:`, {
    isAuthenticated: auth.isAuthenticated,
    userRole: auth.user?.role,
    customerId: auth.customerId,
    hasGlobalAccess: auth.hasGlobalAccess,
    accessibleCustomers: auth.accessibleCustomerIds
  })
} 