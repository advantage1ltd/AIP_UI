import { User } from '@/types/user'

export interface AuthUser {
  id: string
  username: string
  email?: string
  role: string
  customerId?: number
  assignedCustomerIds?: number[]
  permissions?: string[]
  accessLevel?: 'global' | 'customer' | 'site'
  accessibleCustomerIds?: number[]
}

/**
 * Unified Authentication Service
 * This service provides a single point of authentication logic
 * that can be easily replaced with real API calls when switching to .NET backend
 */
export class AuthService {
  private static instance: AuthService
  private currentUser: AuthUser | null = null

  private constructor() {
    this.loadCurrentUser()
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  /**
   * Load current user from localStorage
   * In production: Replace with API call to validate JWT token
   */
  private loadCurrentUser(): void {
    try {
      const userData = localStorage.getItem('user')
      const userRole = localStorage.getItem('userRole')
      
      if (userData && userRole) {
        const user = JSON.parse(userData)
        this.currentUser = {
          ...user,
          permissions: this.getUserPermissions(user.role),
          accessLevel: this.getUserAccessLevel(user.role),
          accessibleCustomerIds: this.calculateAccessibleCustomerIds(user)
        }
      }
    } catch (error) {
      console.error('Failed to load current user:', error)
      this.currentUser = null
    }
  }

  /**
   * Get current authenticated user
   * In production: This would validate JWT token with backend
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  /**
   * Check if user has specific permission
   * In production: This would check against backend permission system
   */
  hasPermission(resource: string, action: string): boolean {
    if (!this.currentUser) return false

    const permission = `${resource}:${action}`
    const allPermission = `${resource}:*`
    const globalPermission = '*'

    return this.currentUser.permissions?.includes(permission) ||
           this.currentUser.permissions?.includes(allPermission) ||
           this.currentUser.permissions?.includes(globalPermission) ||
           false
  }

  /**
   * Check if user has global access (can see all customer data)
   */
  hasGlobalAccess(): boolean {
    if (!this.currentUser) return false
    return this.currentUser.accessLevel === 'global'
  }

  /**
   * Get customer IDs that user can access
   * Returns empty array for global access users (means all customers)
   */
  getAccessibleCustomerIds(): number[] {
    if (!this.currentUser) return []
    
    if (this.hasGlobalAccess()) {
      return [] // Empty array means access to all customers
    }
    
    return this.currentUser.accessibleCustomerIds || []
  }

  /**
   * Get user permissions based on role
   * In production: This would come from backend role definitions
   */
  private getUserPermissions(role: string): string[] {
    const rolePermissions = this.loadRolePermissions()
    return rolePermissions[role] || []
  }

  /**
   * Get user access level based on role
   */
  private getUserAccessLevel(role: string): 'global' | 'customer' | 'site' {
    const globalRoles = ['Administrator', 'AdvantageOneHOOfficer']
    const customerRoles = ['CustomerHOManager', 'AdvantageOneOfficer']
    
    if (globalRoles.includes(role)) return 'global'
    if (customerRoles.includes(role)) return 'customer'
    return 'site'
  }

  /**
   * Calculate accessible customer IDs for user during setup
   */
  private calculateAccessibleCustomerIds(user: any): number[] {
    // For customer users, return their customer ID
    if (['CustomerSiteManager', 'CustomerHOManager'].includes(user.role)) {
      const customerId = user.customerId
      return customerId ? [customerId] : []
    }
    
    // For AdvantageOne officers with assigned customers
    if (user.role === 'AdvantageOneOfficer' && user.assignedCustomerIds) {
      // Convert string array to number array if needed
      const ids = Array.isArray(user.assignedCustomerIds) 
        ? user.assignedCustomerIds.map((id: any) => typeof id === 'string' ? parseInt(id) : id)
        : [user.assignedCustomerIds]
      return ids.filter((id: number) => !isNaN(id))
    }
    
    // For global access users
    return []
  }

  /**
   * Load role permissions from db.json
   * In production: This would come from backend API
   */
  private loadRolePermissions(): Record<string, string[]> {
    try {
      // Try to load from db.json (simulating API call)
      const dbJson = localStorage.getItem('db_cache')
      if (dbJson) {
        const db = JSON.parse(dbJson)
        return db.rolePermissions || this.getDefaultRolePermissions()
      }
      
      // Fallback: try to load directly from db.json file (dev only)
      // In production, this would be an API call
      return this.getDefaultRolePermissions()
    } catch (error) {
      console.warn('Failed to load role permissions from db.json, using defaults:', error)
      return this.getDefaultRolePermissions()
    }
  }

  /**
   * Default role permissions (fallback)
   */
  private getDefaultRolePermissions(): Record<string, string[]> {
    return {
      'Administrator': ['*'], // Global access to everything
      'AdvantageOneHOOfficer': ['*'], // Global access to everything
      'AdvantageOneOfficer': [
        'incidents:read', 'incidents:create', 'incidents:update',
        'customers:read', 'sites:read', 'regions:read'
      ],
      'CustomerHOManager': [
        'incidents:read', 'incidents:create', 'incidents:update',
        'customers:read', 'sites:read', 'regions:read',
        'reports:read'
      ],
      'CustomerSiteManager': [
        'incidents:read', 'incidents:create',
        'customers:read', 'sites:read'
      ]
    }
  }

  /**
   * Update current user (e.g., after login)
   */
  setCurrentUser(user: any): void {
    this.currentUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      customerId: user.customerId,
      assignedCustomerIds: user.assignedCustomerIds,
      permissions: this.getUserPermissions(user.role),
      accessLevel: this.getUserAccessLevel(user.role),
      accessibleCustomerIds: this.calculateAccessibleCustomerIds(user)
    }
  }

  /**
   * Clear current user (logout)
   */
  clearCurrentUser(): void {
    this.currentUser = null
  }

  /**
   * Refresh user data (e.g., when localStorage changes)
   */
  refreshCurrentUser(): void {
    this.loadCurrentUser()
  }
}

// Export singleton instance for easy access
export const authService = AuthService.getInstance()

// Utility functions for common auth checks
export const getCurrentUserAuth = () => authService.getCurrentUser()
export const isUserAuthenticated = () => authService.isAuthenticated()
export const checkPermission = (resource: string, action: string) => authService.hasPermission(resource, action)
export const checkGlobalAccess = () => authService.hasGlobalAccess()
export const getUserAccessibleCustomerIds = () => authService.getAccessibleCustomerIds() 