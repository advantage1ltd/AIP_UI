import { customerPageAccessApi, type CustomerPageAccessResponse } from '@/api/customerPageAccess'
import { logger } from '@/utils/logger'

const CACHE_TTL_MS = 5 * 60 * 1000

interface CacheEntry {
	data: CustomerPageAccessResponse
	timestamp: number
}

const cache = new Map<number, CacheEntry>()
const inFlightRequests = new Map<number, Promise<CustomerPageAccessResponse>>()

const isFresh = (entry?: CacheEntry) => {
	if (!entry) return false
	return Date.now() - entry.timestamp < CACHE_TTL_MS
}

export const customerPageAccessCache = {
	async get(customerId: number, options?: { force?: boolean }): Promise<CustomerPageAccessResponse> {
		if (!options?.force) {
			const cached = cache.get(customerId)
			if (isFresh(cached)) {
				logger.debug('[CustomerPageAccessCache] Cache hit for customer', customerId)
				return cached!.data
			}

			const pending = inFlightRequests.get(customerId)
			if (pending) {
				return pending
			}
		}

		logger.debug('[CustomerPageAccessCache] Fetching page access for customer', customerId)
		const request = customerPageAccessApi
			.getCustomerPageAccess(customerId)
			.then((data) => {
				cache.set(customerId, { data, timestamp: Date.now() })
				return data
			})
			.finally(() => {
				inFlightRequests.delete(customerId)
			})

		inFlightRequests.set(customerId, request)
		return request
	},
	set(customerId: number, data: CustomerPageAccessResponse) {
		cache.set(customerId, { data, timestamp: Date.now() })
	},
	clear(customerId?: number) {
		if (typeof customerId === 'number') {
			cache.delete(customerId)
			inFlightRequests.delete(customerId)
			return
		}
		cache.clear()
		inFlightRequests.clear()
	}
}
