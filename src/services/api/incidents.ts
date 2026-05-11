/**
 * Typed incident list/detail client (`/incidents`) returning ApiResponse envelopes.
 * Prefer incidentService.ts for operations screens; keep this module for legacy envelope consumers until consolidated.
 * Flow: list/stats query params → `api` client → envelope unwrap → React Query hooks and report tables.
 */
import { Incident, StolenItem } from '@/types/incidents'
import {
	GetIncidentsParams,
	IncidentResponse,
	IncidentsResponse,
	IncidentStatsResponse,
	UpsertIncidentRequest,
} from '@/types/api'
import { getCurrentCustomerId } from '@/lib/utils'
import { api, handleApiError } from '@/config/api'

const toFiniteNumberOrUndefined = (value: unknown): number | undefined => {
	const parsed = typeof value === 'number' ? value : Number(value)
	return Number.isFinite(parsed) ? parsed : undefined
}

/** Aligns stolen-line financial fields across camelCase and PascalCase API payloads. */
const normalizeStolenItemFromApi = (item: StolenItem): StolenItem => {
	const extended = item as StolenItem & Record<string, unknown>
	const totalAmount =
		toFiniteNumberOrUndefined(item.totalAmount) ??
		toFiniteNumberOrUndefined(extended.TotalAmount) ??
		toFiniteNumberOrUndefined(extended.totalValue) ??
		0
	const recoveredQuantity =
		toFiniteNumberOrUndefined(item.recoveredQuantity) ??
		toFiniteNumberOrUndefined(extended.RecoveredQuantity) ??
		0
	const valueSaved =
		toFiniteNumberOrUndefined(item.valueSaved) ??
		toFiniteNumberOrUndefined(extended.ValueSaved) ??
		toFiniteNumberOrUndefined(extended.valueRecovered) ??
		0
	const valueLost =
		toFiniteNumberOrUndefined(item.valueLost) ??
		toFiniteNumberOrUndefined(extended.ValueLost) ??
		toFiniteNumberOrUndefined(extended.lossValue) ??
		0

	return {
		...item,
		totalAmount,
		recoveredQuantity,
		valueSaved,
		valueLost,
	}
}

/** Normalizes incident totals, datetime fields, and nested stolen items from GET responses. */
const normalizeIncidentFromApi = (incident: Incident): Incident => {
	const extended = incident as Incident & Record<string, unknown>
	const totalValueRecovered =
		toFiniteNumberOrUndefined(incident.totalValueRecovered) ??
		toFiniteNumberOrUndefined(extended.TotalValueRecovered) ??
		toFiniteNumberOrUndefined(incident.valueRecovered) ??
		toFiniteNumberOrUndefined(extended.ValueRecovered) ??
		toFiniteNumberOrUndefined(incident.recoveredValue) ??
		toFiniteNumberOrUndefined(extended.RecoveredValue) ??
		toFiniteNumberOrUndefined(incident.amount) ??
		toFiniteNumberOrUndefined(incident.value)
	const totalValueLost =
		toFiniteNumberOrUndefined(incident.totalValueLost) ??
		toFiniteNumberOrUndefined(extended.TotalValueLost) ??
		toFiniteNumberOrUndefined(incident.lossValue) ??
		toFiniteNumberOrUndefined(extended.LossValue)
	const valueRecovered = totalValueRecovered
	const lossValue = totalValueLost
	const dateOfIncident =
		incident.dateOfIncident ??
		(typeof extended.dateOfIncident === 'string' ? extended.dateOfIncident : undefined) ??
		incident.date
	const timeOfIncident =
		incident.timeOfIncident ??
		(typeof extended.timeOfIncident === 'string' ? extended.timeOfIncident : undefined)
	const stolenItems = Array.isArray(incident.stolenItems)
		? incident.stolenItems.map(normalizeStolenItemFromApi)
		: incident.stolenItems

	return {
		...incident,
		dateOfIncident,
		date: incident.date ?? dateOfIncident,
		timeOfIncident,
		totalValueRecovered,
		valueRecovered,
		recoveredValue: valueRecovered,
		totalValueLost,
		lossValue,
		stolenItems,
	}
}

/** Mirrors financial and stolen-item fields for POST/PUT bodies the backend accepts. */
const normalizeIncidentForApi = (incident: Omit<Incident, 'id' | 'dateInputted'>) => {
	const totalValueRecovered = toFiniteNumberOrUndefined(
		(incident as Incident & { totalValueRecovered?: unknown }).totalValueRecovered
	)
	const valueRecovered = toFiniteNumberOrUndefined(
		(incident as Incident & { valueRecovered?: unknown }).valueRecovered
	) ?? totalValueRecovered
	const totalValueLost = toFiniteNumberOrUndefined(
		(incident as Incident & { totalValueLost?: unknown }).totalValueLost
	)
	const lossValue = toFiniteNumberOrUndefined(
		(incident as Incident & { lossValue?: unknown }).lossValue
	) ?? totalValueLost

	const normalizedStolenItems = Array.isArray(incident.stolenItems)
		? incident.stolenItems.map(item => {
			const totalAmount = toFiniteNumberOrUndefined(
				(item as typeof item & { totalAmount?: unknown }).totalAmount
			)
			const recoveredQuantity = toFiniteNumberOrUndefined(
				(item as typeof item & { recoveredQuantity?: unknown }).recoveredQuantity
			)
			const valueSaved = toFiniteNumberOrUndefined(
				(item as typeof item & { valueSaved?: unknown }).valueSaved
			)
			const valueLost = toFiniteNumberOrUndefined(
				(item as typeof item & { valueLost?: unknown }).valueLost
			)

			return {
				...item,
				totalAmount,
				recoveredQuantity,
				valueSaved,
				valueLost,
				TotalAmount: totalAmount,
				TotalValue: totalAmount,
				RecoveredQuantity: recoveredQuantity,
				RecoveredValue: valueSaved,
				RecoveredAmount: valueSaved,
				ValueSaved: valueSaved,
				ValueRecovered: valueSaved,
				ValueLost: valueLost,
				LossValue: valueLost,
			}
		})
		: incident.stolenItems

	return {
		...incident,
		totalValueRecovered,
		valueRecovered,
		totalValueLost,
		lossValue,
		TotalValueRecovered: totalValueRecovered,
		ValueRecovered: valueRecovered,
		TotalValueLost: totalValueLost,
		LossValue: lossValue,
		stolenItems: normalizedStolenItems,
	}
}

const customerHeaders = (): Record<string, string> => {
	const customerId = getCurrentCustomerId()
	const headers: Record<string, string> = {}
	if (customerId) {
		headers['X-Customer-Id'] = customerId.toString()
	}
	return headers
}

/** Typed `/incidents` client; responses are normalized before they reach React Query caches. */
export const incidentsApi = {
	/** Paged list; supports region, store, and date filters used by Operations and analytics paging. */
	getIncidents: async (params?: GetIncidentsParams): Promise<IncidentsResponse> => {
		try {
			const searchParams = new URLSearchParams()
			if (params) {
				Object.entries(params).forEach(([key, value]) => {
					if (value) searchParams.append(key, value.toString())
				})
			}
			const query = searchParams.toString()
			const url = query ? `/incidents?${query}` : '/incidents'
			const { data } = await api.get<IncidentsResponse>(url, { headers: customerHeaders() })
			return {
				...data,
				data: Array.isArray(data.data) ? data.data.map(normalizeIncidentFromApi) : data.data,
			}
		} catch (error) {
			throw new Error(handleApiError(error))
		}
	},

	getIncident: async (id: string): Promise<IncidentResponse> => {
		try {
			const { data } = await api.get<IncidentResponse>(`/incidents/${id}`, {
				headers: customerHeaders(),
			})
			return {
				...data,
				data: data.data ? normalizeIncidentFromApi(data.data) : data.data,
			}
		} catch (error) {
			throw new Error(handleApiError(error))
		}
	},

	createIncident: async (incident: Omit<Incident, 'id' | 'dateInputted'>): Promise<IncidentResponse> => {
		try {
			const normalizedIncident = normalizeIncidentForApi(incident)
			const { data } = await api.post<IncidentResponse>(
				'/incidents',
				{ incident: normalizedIncident } as UpsertIncidentRequest,
				{ headers: customerHeaders() }
			)
			return {
				...data,
				data: data.data ? normalizeIncidentFromApi(data.data) : data.data,
			}
		} catch (error) {
			throw new Error(handleApiError(error))
		}
	},

	updateIncident: async (
		id: string,
		incident: Omit<Incident, 'id' | 'dateInputted'>
	): Promise<IncidentResponse> => {
		try {
			const normalizedIncident = normalizeIncidentForApi(incident)
			const { data } = await api.put<IncidentResponse>(
				`/incidents/${id}`,
				{ incident: normalizedIncident } as UpsertIncidentRequest,
				{ headers: customerHeaders() }
			)
			return {
				...data,
				data: data.data ? normalizeIncidentFromApi(data.data) : data.data,
			}
		} catch (error) {
			throw new Error(handleApiError(error))
		}
	},

	deleteIncident: async (id: string): Promise<void> => {
		try {
			await api.delete(`/incidents/${id}`, { headers: customerHeaders() })
		} catch (error) {
			throw new Error(handleApiError(error))
		}
	},

	getIncidentStats: async (params?: GetIncidentsParams): Promise<IncidentStatsResponse> => {
		try {
			const searchParams = new URLSearchParams()
			if (params) {
				Object.entries(params).forEach(([key, value]) => {
					if (value !== undefined && value !== null && value !== '') {
						searchParams.append(key, value.toString())
					}
				})
			}
			const query = searchParams.toString()
			const url = query ? `/incidents/stats?${query}` : '/incidents/stats'
			const { data } = await api.get<IncidentStatsResponse>(url, { headers: customerHeaders() })
			return data
		} catch (error) {
			throw new Error(handleApiError(error))
		}
	},
}
