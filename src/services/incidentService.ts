/**
 * Incident operations API (`/incidents`): CRUD, stats, repeat-offender search, graph DTO types.
 * Flow: optional customer header → api/incidents or direct api calls → UI types for operations and reports.
 * Overlap: services/api/incidents.ts exposes envelope-typed list/detail helpers; incidentGraphService.ts handles chart aggregates.
 */
import { Incident, IncidentStats, RepeatOffenderSearchPayload, RepeatOffenderSearchResponse } from '@/types/incidents'
import { logger } from '@/utils/logger'
import { getCurrentCustomerId } from '@/lib/utils'
import { api, handleApiError } from '@/config/api'
import { incidentsApi } from '@/services/api/incidents'
import type { GetIncidentsParams } from '@/types/api'

const optionalCustomerHeaders = (): Record<string, string> => {
	const customerId = getCurrentCustomerId()
	const headers: Record<string, string> = {}
	if (customerId) {
		headers['X-Customer-Id'] = customerId.toString()
	}
	return headers
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
	officerName: string
	officerRole: string
	officerType: string
	dutyManagerName: string
	dateOfIncident: string
	timeOfIncident: string
	incidentType: string
	type: string
	actionCode: string
	description: string
	incidentDetails?: string
	storeComments?: string
	incidentInvolved: string[]
	stolenItems: Array<{
		id: string
		category: string
		description: string
		productName: string
		cost: number
		quantity: number
		totalAmount: number
	}>
	totalValueRecovered: number
	totalValueLost?: number
	value: number
	valueRecovered: number
	recoveredValue?: number
	lossValue?: number
	quantityRecovered: number
	quantity: number
	amount: number
	total: number
	policeInvolvement: boolean
	urnNumber: string
	crimeRefNumber: string
	policeID: string
	status: 'pending' | 'resolved' | 'in-progress'
	priority: 'low' | 'medium' | 'high'
	actionTaken: string
	evidenceAttached: boolean
	witnessStatements: string[]
	involvedParties: string[]
	reportNumber: string
	offenderName: string
	offenderSex: string
	gender: 'Male' | 'Female' | 'N/A or N/K'
	offenderDOB: string
	offenderPlaceOfBirth: string
	offenderAddress: {
		houseName?: string
		numberAndStreet?: string
		villageOrSuburb?: string
		town?: string
		county?: string
		postCode?: string
	}
	arrestSaveComment: string
	dateInputted: string
	assignedTo: string
	store?: string
}

export interface IncidentGraphResponse {
	success: boolean
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
	code: string
	type: string
	count: number
	description: string
	fullName: string
}

export interface IncidentTypesResponse {
	success: boolean
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

export const fetchIncidentGraphData = async (
	filters: IncidentGraphFilters
): Promise<IncidentGraphResponse> => {
	try {
		const searchParams = new URLSearchParams()
		searchParams.append('customerId', filters.customerId.toString())
		if (filters.startDate) searchParams.append('startDate', filters.startDate)
		if (filters.endDate) searchParams.append('endDate', filters.endDate)
		if (filters.regionId) searchParams.append('regionId', filters.regionId)
		if (filters.officerType) searchParams.append('officerType', filters.officerType)
		if (filters.graphType) searchParams.append('graphType', filters.graphType)

		const { data } = await api.get<IncidentGraphResponse>(
			`/incidents/graph-data?${searchParams}`,
			{ headers: { 'X-Customer-Id': filters.customerId.toString() } }
		)
		return data
	} catch (error) {
		throw new Error(handleApiError(error))
	}
}

export const fetchIncidentTypesData = async (
	filters: Omit<IncidentGraphFilters, 'graphType'>
): Promise<IncidentTypesResponse> => {
	try {
		const searchParams = new URLSearchParams()
		searchParams.append('customerId', filters.customerId.toString())
		if (filters.startDate) searchParams.append('startDate', filters.startDate)
		if (filters.endDate) searchParams.append('endDate', filters.endDate)
		if (filters.regionId) searchParams.append('regionId', filters.regionId)
		if (filters.officerType) searchParams.append('officerType', filters.officerType)

		const { data } = await api.get<IncidentTypesResponse>(
			`/incidents/types-summary?${searchParams}`,
			{ headers: { 'X-Customer-Id': filters.customerId.toString() } }
		)
		return data
	} catch (error) {
		throw new Error(handleApiError(error))
	}
}

export const fetchCustomerRegions = async (
	customerId: number
): Promise<{ success: boolean; data: string[] }> => {
	try {
		const { data } = await api.get<{ success: boolean; data: string[] }>(
			`/incidents/regions?customerId=${customerId}`,
			{ headers: { 'X-Customer-Id': customerId.toString() } }
		)
		return data
	} catch (error) {
		throw new Error(handleApiError(error))
	}
}

type IncidentItemEnvelope = { success: boolean; data: Incident; message?: string }

export const incidentService = {
	async getIncidents(params?: GetIncidentsParams): Promise<Incident[]> {
		try {
			const response = await incidentsApi.getIncidents({
				page: 1,
				pageSize: 50,
				...params,
			})
			return response.data
		} catch (error) {
			logger.error('Error fetching incidents:', error)
			throw error instanceof Error ? error : new Error(handleApiError(error))
		}
	},

	async getIncidentById(id: string): Promise<Incident> {
		try {
			const { data: result } = await api.get<IncidentItemEnvelope>(`/incidents/${id}`, {
				headers: optionalCustomerHeaders(),
			})
			if (!result.success) {
				throw new Error(result.message || 'Failed to fetch incident')
			}
			return result.data
		} catch (error) {
			logger.error('Error fetching incident:', error)
			throw error instanceof Error ? error : new Error(handleApiError(error))
		}
	},

	async getIncidentsByCustomer(customerId: string): Promise<Incident[]> {
		try {
			const response = await incidentsApi.getIncidents({
				page: 1,
				pageSize: 50,
				customerId,
			})
			return response.data
		} catch (error) {
			logger.error('Error fetching incidents by customer:', error)
			throw error instanceof Error ? error : new Error(handleApiError(error))
		}
	},

	async getIncidentStats(filters?: GetIncidentsParams): Promise<IncidentStats> {
		try {
			const result = await incidentsApi.getIncidentStats(filters)
			if (!result.success) throw new Error(result.message || 'Failed to fetch incident stats')
			return result.data
		} catch (error) {
			logger.error('Error fetching incident stats:', error)
			throw error instanceof Error ? error : new Error(handleApiError(error))
		}
	},

	async createIncident(incident: Partial<Incident>): Promise<void> {
		try {
			await incidentsApi.createIncident(incident as Omit<Incident, 'id' | 'dateInputted'>)
		} catch (error) {
			logger.error('Error creating incident:', error)
			throw error instanceof Error ? error : new Error(handleApiError(error))
		}
	},

	async updateIncident(id: string, incident: Partial<Incident>): Promise<void> {
		try {
			await incidentsApi.updateIncident(id, incident as Omit<Incident, 'id' | 'dateInputted'>)
		} catch (error) {
			logger.error('Error updating incident:', error)
			throw error instanceof Error ? error : new Error(handleApiError(error))
		}
	},

	async deleteIncident(id: string): Promise<void> {
		try {
			await incidentsApi.deleteIncident(id)
		} catch (error) {
			logger.error('Error deleting incident:', error)
			throw error instanceof Error ? error : new Error(handleApiError(error))
		}
	},

	async searchRepeatOffenders(
		payload: RepeatOffenderSearchPayload
	): Promise<RepeatOffenderSearchResponse> {
		try {
			const searchParams = new URLSearchParams()
			if (payload.name) searchParams.append('name', payload.name)
			if (payload.dateOfBirth) searchParams.append('dateOfBirth', payload.dateOfBirth)
			if (payload.marks) searchParams.append('marks', payload.marks)
			if (payload.page) searchParams.append('page', payload.page.toString())
			if (payload.pageSize) searchParams.append('pageSize', payload.pageSize.toString())

			const { data: result } = await api.get<RepeatOffenderSearchResponse>(
				`/incidents/repeat-offenders?${searchParams}`
			)
			if (!result.success) {
				throw new Error(result.message || 'Failed to search repeat offenders')
			}
			return result
		} catch (error) {
			throw error instanceof Error ? error : new Error(handleApiError(error))
		}
	},
}
