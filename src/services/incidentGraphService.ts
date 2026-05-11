/**
 * Incident graph/type summary service.
 * Flow: region/site filters → summary endpoints → graph and breakdown DTOs for customer views.
 */
import { api, handleApiError } from '@/config/api'
import { regionService } from '@/services/regionService'
import { logger } from '@/utils/logger'

export interface RegionOption {
	id: string
	name: string
}

export interface IncidentGraphData {
	id: string
	customerId: number
	customerName: string
	siteName: string
	siteId: string
	regionId: string
	regionName: string
	location: string
	value: number
	quantity: number
	totalValueRecovered: number
	totalValueLost?: number
	count?: number
}

export interface IncidentGraphResponse {
	success: boolean
	message?: string
	data: {
		incidents: IncidentGraphData[]
		totals: {
			totalValue: number
			totalQuantity: number
			totalIncidents: number
		}
		filters: {
			customerId: number
			regionId?: string
			officerType: string
			graphType: string
			startDate?: string
			endDate?: string
		}
	}
}

export interface IncidentTypeData {
	code?: string
	type: string
	count: number
	description?: string
	fullName?: string
}

export interface IncidentTypesResponse {
	success: boolean
	message?: string
	data: IncidentTypeData[]
}

export interface IncidentGraphFilters {
	customerId: number
	startDate?: string
	endDate?: string
	regionId?: string
	officerType?: string
	graphType?: string
}

const inFlightGraphDataRequests = new Map<string, Promise<IncidentGraphResponse>>()
const inFlightTypeRequests = new Map<string, Promise<IncidentTypesResponse>>()

const buildGraphDataRequestKey = (filters: IncidentGraphFilters): string =>
	JSON.stringify({
		customerId: filters.customerId,
		startDate: filters.startDate ?? null,
		endDate: filters.endDate ?? null,
		regionId: filters.regionId ?? null,
		officerType: filters.officerType ?? 'all',
		graphType: filters.graphType ?? 'value',
	})

const buildTypesRequestKey = (filters: Omit<IncidentGraphFilters, 'graphType'>): string =>
	JSON.stringify({
		customerId: filters.customerId,
		startDate: filters.startDate ?? null,
		endDate: filters.endDate ?? null,
		regionId: filters.regionId ?? null,
		officerType: filters.officerType ?? 'all',
	})

const toSearchParams = (filters: IncidentGraphFilters | Omit<IncidentGraphFilters, 'graphType'>) => {
	const searchParams = new URLSearchParams()
	searchParams.append('customerId', filters.customerId.toString())
	if (filters.startDate) searchParams.append('startDate', filters.startDate)
	if (filters.endDate) searchParams.append('endDate', filters.endDate)
	if (filters.regionId) searchParams.append('regionId', filters.regionId)
	if (filters.officerType) searchParams.append('officerType', filters.officerType)
	if ('graphType' in filters && filters.graphType) {
		searchParams.append('graphType', filters.graphType)
	}
	return searchParams.toString()
}

export const incidentGraphService = {
	async fetchGraphData(filters: IncidentGraphFilters): Promise<IncidentGraphResponse> {
		const requestKey = buildGraphDataRequestKey(filters)
		const inFlightRequest = inFlightGraphDataRequests.get(requestKey)
		if (inFlightRequest) return inFlightRequest

		const requestPromise = (async () => {
			try {
				const query = toSearchParams(filters)
				const { data } = await api.get<IncidentGraphResponse>(`/incidents/graph-data?${query}`, {
					headers: {
						'X-Customer-Id': filters.customerId.toString(),
					},
				})
				return data
			} catch (error) {
				logger.error('[IncidentGraphService] graph-data endpoint failed', error)
				return {
					success: false,
					message: handleApiError(error),
					data: {
						incidents: [],
						totals: {
							totalValue: 0,
							totalQuantity: 0,
							totalIncidents: 0,
						},
						filters: {
							customerId: filters.customerId,
							regionId: filters.regionId,
							officerType: filters.officerType || 'all',
							graphType: filters.graphType || 'value',
							startDate: filters.startDate,
							endDate: filters.endDate,
						},
					},
				}
			}
		})()

		inFlightGraphDataRequests.set(requestKey, requestPromise)
		try {
			return await requestPromise
		} finally {
			inFlightGraphDataRequests.delete(requestKey)
		}
	},

	async fetchTypesData(filters: Omit<IncidentGraphFilters, 'graphType'>): Promise<IncidentTypesResponse> {
		const requestKey = buildTypesRequestKey(filters)
		const inFlightRequest = inFlightTypeRequests.get(requestKey)
		if (inFlightRequest) return inFlightRequest

		const requestPromise = (async () => {
			try {
				const query = toSearchParams(filters)
				const { data } = await api.get<IncidentTypesResponse>(`/incidents/types-summary?${query}`, {
					headers: {
						'X-Customer-Id': filters.customerId.toString(),
					},
				})
				return data
			} catch (error) {
				logger.error('[IncidentGraphService] types-summary endpoint failed', error)
				return {
					success: false,
					message: handleApiError(error),
					data: [],
				}
			}
		})()

		inFlightTypeRequests.set(requestKey, requestPromise)
		try {
			return await requestPromise
		} finally {
			inFlightTypeRequests.delete(requestKey)
		}
	},

	async fetchRegions(customerId: number): Promise<{ success: boolean; data: RegionOption[] }> {
		try {
			const response = await regionService.getRegionsByCustomer(customerId)
			if (!response.success) {
				return {
					success: false,
					data: [],
				}
			}
			return {
				success: true,
				data: response.data
					.filter(region => (region.regionID ?? region.RegionID ?? (region as { id?: number }).id) !== undefined)
					.map(region => ({
						id: (region.regionID ?? region.RegionID ?? (region as { id?: number }).id)?.toString() || '',
						name: region.regionName || region.RegionName || 'Unnamed Region',
					}))
					.filter(region => region.id.length > 0),
			}
		} catch (error) {
			logger.error('[IncidentGraphService] regions endpoint failed', error)
			return {
				success: false,
				data: [],
			}
		}
	},
}
