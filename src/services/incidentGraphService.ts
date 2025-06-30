import { 
	IncidentGraphData, 
	IncidentGraphResponse, 
	IncidentTypeData, 
	IncidentTypesResponse, 
	IncidentGraphFilters 
} from '@/services/incidentService'
import { BASE_API_URL } from '@/config/api'

/**
 * Service for fetching incident graph data and analytics
 */
export const incidentGraphService = {
	/**
	 * Fetch incident graph data with filtering
	 */
	async fetchGraphData(filters: IncidentGraphFilters): Promise<IncidentGraphResponse> {
		const searchParams = new URLSearchParams()
		
		// Add filters to search params
		searchParams.append('customerId', filters.customerId.toString())
		if (filters.startDate) searchParams.append('startDate', filters.startDate)
		if (filters.endDate) searchParams.append('endDate', filters.endDate)
		if (filters.region) searchParams.append('region', filters.region)
		if (filters.officerType) searchParams.append('officerType', filters.officerType)
		if (filters.graphType) searchParams.append('graphType', filters.graphType)

		const response = await fetch(`${BASE_API_URL}/incidents/graph-data?${searchParams}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-Customer-Id': filters.customerId.toString()
			}
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		return response.json()
	},

	/**
	 * Fetch incident types summary with filtering
	 */
	async fetchTypesData(filters: Omit<IncidentGraphFilters, 'graphType'>): Promise<IncidentTypesResponse> {
		const searchParams = new URLSearchParams()
		
		// Add filters to search params
		searchParams.append('customerId', filters.customerId.toString())
		if (filters.startDate) searchParams.append('startDate', filters.startDate)
		if (filters.endDate) searchParams.append('endDate', filters.endDate)
		if (filters.region) searchParams.append('region', filters.region)
		if (filters.officerType) searchParams.append('officerType', filters.officerType)

		const response = await fetch(`${BASE_API_URL}/incidents/types-summary?${searchParams}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-Customer-Id': filters.customerId.toString()
			}
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		return response.json()
	},

	/**
	 * Fetch available regions for a customer
	 */
	async fetchRegions(customerId: number): Promise<{ success: boolean; data: string[] }> {
		const response = await fetch(`${BASE_API_URL}/incidents/regions?customerId=${customerId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-Customer-Id': customerId.toString()
			}
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		return response.json()
	}
}

// Re-export types for convenience
export type { 
	IncidentGraphData, 
	IncidentGraphResponse, 
	IncidentTypeData, 
	IncidentTypesResponse, 
	IncidentGraphFilters 
} 