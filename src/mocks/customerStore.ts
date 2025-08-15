import { CustomerWithRelations as Customer } from '@/types/customer'
import { customerApiService, CustomerCreateRequest } from '@/services/customerApiService'

// Debug logging with timestamps
const log = {
  info: (message: string, data?: any) => {
    console.log(`${new Date().toISOString()} 📝 [Customer Store] ${message}`, data ? data : '')
  },
  warn: (message: string, data?: any) => {
    console.warn(`${new Date().toISOString()} ⚠️ [Customer Store] ${message}`, data ? data : '')
  },
  error: (message: string, data?: any) => {
    console.error(`${new Date().toISOString()} ❌ [Customer Store] ${message}`, data ? data : '')
  },
  success: (message: string, data?: any) => {
    console.log(`${new Date().toISOString()} ✅ [Customer Store] ${message}`, data ? data : '')
  }
}

// In-memory cache for performance
let customerCache: Customer[] = []
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Check if cache is valid
const isCacheValid = (): boolean => {
  return customerCache.length > 0 && (Date.now() - cacheTimestamp) < CACHE_DURATION
}

// Clear cache
const clearCache = (): void => {
  customerCache = []
  cacheTimestamp = 0
  log.info('Customer cache cleared')
}

// Customer operations with real API calls and caching
export const customerOperations = {
  /**
   * Get all customers with caching
   */
  getAll: async (): Promise<Customer[]> => {
    try {
      if (isCacheValid()) {
        log.info('Retrieved customers from cache', { 
          count: customerCache.length,
          cacheAge: Math.round((Date.now() - cacheTimestamp) / 1000) + 's'
        })
        return customerCache
      }

      log.info('Fetching customers from API...')
      const response = await customerApiService.getCustomers()
      
      customerCache = response.customers
      cacheTimestamp = Date.now()
      
      log.success('Retrieved customers from API', { 
        count: customerCache.length,
        total: response.total
      })
      
      return customerCache
    } catch (error) {
      log.error('Failed to fetch customers from backend API:', error)
      
      // Return empty array instead of fallback data
      customerCache = []
      cacheTimestamp = Date.now()
      
      log.warn('Returning empty customer list - no fallback data used')
      
      return []
    }
  },

  /**
   * Get customer by ID
   */
  getById: async (id: number | string): Promise<Customer | undefined> => {
    try {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id
      
      // Check cache first
      if (isCacheValid()) {
        const customer = customerCache.find(c => c.id === numericId)
        if (customer) {
          log.info(`Retrieved customer ${id} from cache`, { found: true })
          return customer
        }
      }

      // Fetch from API if not in cache
      log.info(`Fetching customer ${id} from API...`)
      const customer = await customerApiService.getCustomerById(numericId)
      
      // Update cache
      if (isCacheValid()) {
        const index = customerCache.findIndex(c => c.id === numericId)
        if (index !== -1) {
          customerCache[index] = customer
        } else {
          customerCache.push(customer)
        }
      }
      
      log.success(`Retrieved customer ${id} from API`, { found: true })
      return customer
    } catch (error) {
      log.error(`Failed to retrieve customer ${id}:`, error)
      return undefined
    }
  },

  /**
   * Update customer
   */
  update: async (id: number | string, updates: Partial<Customer>): Promise<Customer | null> => {
    try {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id
      
      log.info(`Updating customer ${id}`, {
        updateKeys: Object.keys(updates)
      })
      
      // Convert Customer updates to CustomerCreateRequest format
      const apiUpdates: Partial<CustomerCreateRequest> = {}
      
      if (updates.companyName) apiUpdates.companyName = updates.companyName
      if (updates.status) apiUpdates.status = updates.status
      if (updates.pageAssignments) apiUpdates.pageAssignments = updates.pageAssignments
      if (updates.regions) apiUpdates.regions = updates.regions.map(r => r.name)
      if (updates.sites) apiUpdates.sites = updates.sites.map(s => s.locationName)
      if (updates.address) {
        apiUpdates.address = {
          street: updates.address.street,
          city: updates.address.town,
          county: updates.address.county,
          postCode: updates.address.postcode,
          region: updates.address.county // Using county as region for now
        }
      }
      
      const updatedCustomer = await customerApiService.updateCustomer(numericId, apiUpdates)
      
      // Update cache
      if (isCacheValid()) {
        const index = customerCache.findIndex(c => c.id === numericId)
        if (index !== -1) {
          customerCache[index] = updatedCustomer
        }
      }
      
      log.success(`Updated customer ${id}`, {
        changes: Object.keys(updates)
      })
      
      return updatedCustomer
    } catch (error) {
      log.error(`Failed to update customer ${id}:`, error)
      throw error
    }
  },

  /**
   * Create new customer
   */
  create: async (customer: Customer): Promise<Customer> => {
    try {
      log.info('Creating new customer', { 
        name: customer.companyName
      })
      
      const newCustomer = await customerApiService.createCustomer({
        companyName: customer.companyName,
        contactName: customer.contact?.forename + ' ' + customer.contact?.surname,
        contactEmail: customer.contact?.email,
        contactPhone: customer.contact?.phone,
        address: {
          street: customer.address.street,
          city: customer.address.town,
          county: customer.address.county,
          postCode: customer.address.postcode,
          region: customer.address.county // Using county as region for now
        },
        pageAssignments: customer.pageAssignments,
        regions: customer.regions?.map(r => r.name) || [],
        sites: customer.sites?.map(s => s.locationName) || [],
        status: customer.status
      })
      
      // Add to cache
      if (isCacheValid()) {
        customerCache.push(newCustomer)
      }
      
      log.success('Created new customer', { 
        id: newCustomer.id, 
        name: newCustomer.companyName
      })
      
      return newCustomer
    } catch (error) {
      log.error('Failed to create customer:', error)
      throw error
    }
  },

  /**
   * Delete customer
   */
  delete: async (id: number | string): Promise<void> => {
    try {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id
      
      log.info(`Deleting customer ${id}`)
      await customerApiService.deleteCustomer(numericId)
      
      // Remove from cache
      if (isCacheValid()) {
        customerCache = customerCache.filter(c => c.id !== numericId)
      }
      
      log.success(`Deleted customer ${id}`)
    } catch (error) {
      log.error(`Failed to delete customer ${id}:`, error)
      throw error
    }
  },

  /**
   * Search customers
   */
  search: async (query: string): Promise<Customer[]> => {
    try {
      log.info(`Searching customers with query: ${query}`)
      const results = await customerApiService.searchCustomers(query)
      log.success(`Search completed`, { results: results.length })
      return results
    } catch (error) {
      log.error('Failed to search customers:', error)
      throw error
    }
  },

  /**
   * Get customers by region
   */
  getByRegion: async (region: string): Promise<Customer[]> => {
    try {
      log.info(`Getting customers by region: ${region}`)
      const results = await customerApiService.getCustomersByRegion(region)
      log.success(`Retrieved customers by region`, { region, count: results.length })
      return results
    } catch (error) {
      log.error(`Failed to get customers by region ${region}:`, error)
      throw error
    }
  },

  /**
   * Get customers by status
   */
  getByStatus: async (status: 'active' | 'inactive'): Promise<Customer[]> => {
    try {
      log.info(`Getting customers by status: ${status}`)
      const results = await customerApiService.getCustomersByStatus(status)
      log.success(`Retrieved customers by status`, { status, count: results.length })
      return results
    } catch (error) {
      log.error(`Failed to get customers by status ${status}:`, error)
      throw error
    }
  },

  /**
   * Update customer page assignments
   */
  updatePageAssignments: async (id: number | string, pageAssignments: Record<string, any>): Promise<Customer> => {
    try {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id
      
      log.info(`Updating page assignments for customer ${id}`)
      const updatedCustomer = await customerApiService.updateCustomerPageAssignments(numericId, pageAssignments)
      
      // Update cache
      if (isCacheValid()) {
        const index = customerCache.findIndex(c => c.id === numericId)
        if (index !== -1) {
          customerCache[index] = updatedCustomer
        }
      }
      
      log.success(`Updated page assignments for customer ${id}`)
      return updatedCustomer
    } catch (error) {
      log.error(`Failed to update page assignments for customer ${id}:`, error)
      throw error
    }
  },

  /**
   * Get customer statistics
   */
  getStatistics: async () => {
    try {
      log.info('Getting customer statistics')
      const stats = await customerApiService.getCustomerStatistics()
      log.success('Retrieved customer statistics')
      return stats
    } catch (error) {
      log.error('Failed to get customer statistics:', error)
      throw error
    }
  },

  /**
   * Force refresh cache
   */
  forceRefresh: async (): Promise<Customer[]> => {
    try {
      log.info('Forcing cache refresh')
      clearCache()
      return await customerOperations.getAll()
    } catch (error) {
      log.error('Failed to force refresh:', error)
      throw error
    }
  },

  /**
   * Clear cache
   */
  clearCache: (): void => {
    clearCache()
  }
}

// Export current state to db.json format (for backward compatibility)
export const exportToDbJson = async () => {
  try {
    const customers = await customerOperations.getAll()
    
    const dbJsonData = {
      customerDetails: customers
    }
    
    const dbJsonString = JSON.stringify(dbJsonData, null, 2)
    
    // Create a downloadable file
    const blob = new Blob([dbJsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'db_updated.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    log.success('Exported updated data to db_updated.json', {
      customerCount: customers.length,
      totalSize: dbJsonString.length
    })
    
    return dbJsonData
  } catch (error) {
    log.error('Failed to export to db.json format:', error)
    return null
  }
}

// Legacy functions for backward compatibility
export const getStore = async () => {
  const customers = await customerOperations.getAll()
  return {
    customers,
    lastUpdated: Date.now(),
    version: 3 // New version for API-based store
  }
}

export const clearStore = () => {
  clearCache()
  log.info('Cleared store')
}

// Make debug functions available globally
(window as any).customerDebug = {
  clearCache: customerOperations.clearCache,
  forceRefresh: customerOperations.forceRefresh,
  getStatistics: customerOperations.getStatistics,
  exportToDbJson,
  log,
  // Debug function to check cache status
  checkCacheStatus: () => {
    console.log('🔍 [Debug] Cache status:', {
      cacheValid: isCacheValid(),
      cacheSize: customerCache.length,
      cacheAge: cacheTimestamp ? Math.round((Date.now() - cacheTimestamp) / 1000) + 's' : 'N/A',
      cacheDuration: Math.round(CACHE_DURATION / 1000) + 's'
    })
  },
  // Debug function to list all customers in cache
  listAllCustomers: () => {
    console.log('🔍 [Debug] All customers in cache:', customerCache.map(c => ({
      id: c.id,
      name: c.companyName,
      status: c.status
    })))
    return customerCache
  },
  // Debug function to find customer by name
  findCustomerByName: (name: string) => {
    const customer = customerCache.find(c => c.companyName.toLowerCase().includes(name.toLowerCase()))
    console.log('🔍 [Debug] Search result for name:', name, customer ? {
      id: customer.id,
      name: customer.companyName,
      status: customer.status
    } : 'Not found')
    return customer
  }
} 