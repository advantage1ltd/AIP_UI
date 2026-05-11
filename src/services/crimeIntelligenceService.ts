/**
 * Customer crime intelligence aggregates built from incident records (`/CrimeIntelligence`).
 * Flow: filter query → normalized incident metrics → chart-ready CrimeIntelligenceResponse.
 */
import { api } from '@/config/api'
import { logger } from '@/utils/logger'
import { CrimeIntelligenceQuery, CrimeIntelligenceResponse } from '@/types/crimeIntelligence'

type IncidentRecord = Record<string, unknown>

const asNumber = (value: unknown) => {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : 0
	}
	if (typeof value === 'string') {
		const trimmed = value.trim()
		if (!trimmed) return 0
		const normalized = trimmed.replace(/[^\d.-]/g, '')
		const n = Number(normalized)
		return Number.isFinite(n) ? n : 0
	}
	const n = Number(value)
	return Number.isFinite(n) ? n : 0
}

const asString = (value: unknown) => (typeof value === 'string' ? value : '')

const pickNumeric = (source: Record<string, unknown>, keys: string[]): number | null => {
	for (const key of keys) {
		if (!(key in source)) continue
		const value = asNumber(source[key])
		if (value > 0) return value
	}
	return null
}

const getStolenItemsTotals = (incident: IncidentRecord) => {
	const stolenItems = Array.isArray(incident.stolenItems) ? incident.stolenItems : []
	return stolenItems.reduce(
		(totals, item) => {
			if (!item || typeof item !== 'object') return totals
			const record = item as IncidentRecord
			const totalAmount =
				asNumber(record.totalAmount) ||
				asNumber(record.TotalAmount) ||
				(asNumber(record.cost || record.Cost) * asNumber(record.quantity || record.Quantity))
			const recovered =
				asNumber(record.valueSaved) ||
				asNumber(record.ValueSaved) ||
				asNumber(record.valueRecovered) ||
				asNumber(record.ValueRecovered)
			const explicitLost = asNumber(record.valueLost) || asNumber(record.ValueLost)
			const derivedLost = Math.max(0, totalAmount - recovered)

			return {
				totalAmount: totals.totalAmount + Math.max(0, totalAmount),
				totalRecovered: totals.totalRecovered + Math.max(0, recovered),
				totalLost: totals.totalLost + Math.max(0, explicitLost || derivedLost),
			}
		},
		{ totalAmount: 0, totalRecovered: 0, totalLost: 0 }
	)
}

const getIncidentRecoveredValue = (incident: IncidentRecord): number => {
	const directRecovered = pickNumeric(incident, [
		'totalValueRecovered',
		'TotalValueRecovered',
		'totalRecoveredValue',
		'TotalRecoveredValue',
		'valueRecovered',
		'ValueRecovered',
		'recoveredValue',
		'RecoveredValue',
		'valueSaved',
		'ValueSaved',
		'amount',
		'Amount',
		'value',
		'Value',
	])
	if (directRecovered !== null) return directRecovered
	return getStolenItemsTotals(incident).totalRecovered
}

const getIncidentLossValue = (incident: IncidentRecord): number => {
	const directLoss = pickNumeric(incident, [
		'totalValueLost',
		'TotalValueLost',
		'totalLossValue',
		'TotalLossValue',
		'lossValue',
		'LossValue',
		'valueLost',
		'ValueLost',
	])
	if (directLoss !== null) return directLoss

	const stolenTotals = getStolenItemsTotals(incident)
	if (stolenTotals.totalLost > 0) return stolenTotals.totalLost
	if (stolenTotals.totalAmount > 0) return Math.max(0, stolenTotals.totalAmount - getIncidentRecoveredValue(incident))

	const totalAmount =
		asNumber(incident.totalAmount) ||
		asNumber(incident.TotalAmount) ||
		asNumber(incident.amount) ||
		asNumber(incident.Amount)
	return Math.max(0, totalAmount - getIncidentRecoveredValue(incident))
}

const getIncidentDate = (incident: IncidentRecord) => {
	const raw = asString(incident.dateOfIncident ?? incident.DateOfIncident ?? incident.date ?? incident.Date)
	const parsed = raw ? new Date(raw) : null
	return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null
}

const extractTimeBucket = (incidentDate: Date) => {
	const hour = incidentDate.getHours()
	if (hour < 6) return 'Night (00:00-05:59)'
	if (hour < 12) return 'Morning (06:00-11:59)'
	if (hour < 18) return 'Afternoon (12:00-17:59)'
	return 'Evening (18:00-23:59)'
}

const applyLocalFilters = (incidents: IncidentRecord[], query: CrimeIntelligenceQuery) => {
	return incidents.filter((incident) => {
		const incidentSiteId = asString(incident.siteId ?? incident.SiteId)
		const incidentRegionId = asString(incident.regionId ?? incident.RegionId)
		if (query.siteId && incidentSiteId && incidentSiteId !== query.siteId) return false
		if (query.regionId && incidentRegionId && incidentRegionId !== query.regionId) return false
		return true
	})
}

const toIncidentArray = (payload: unknown): IncidentRecord[] => {
	if (Array.isArray(payload)) return payload as IncidentRecord[]
	if (!payload || typeof payload !== 'object') return []
	const record = payload as Record<string, unknown>
	const candidates = [
		record.data,
		record.items,
		record.results,
		record.incidents,
		(record.data as Record<string, unknown> | undefined)?.items,
		(record.data as Record<string, unknown> | undefined)?.incidents,
	]
	for (const candidate of candidates) {
		if (Array.isArray(candidate)) return candidate as IncidentRecord[]
	}
	return []
}

const normalizeStolenItems = (value: unknown): IncidentRecord[] => {
	if (Array.isArray(value)) return value.filter((item): item is IncidentRecord => Boolean(item && typeof item === 'object'))
	if (typeof value === 'string' && value.trim()) {
		try {
			const parsed = JSON.parse(value)
			if (Array.isArray(parsed)) {
				return parsed.filter((item): item is IncidentRecord => Boolean(item && typeof item === 'object'))
			}
		} catch (error) {
			logger.warn('CrimeIntelligence: unable to parse stolenItems JSON string', error)
		}
	}
	return []
}

const normalizeIncident = (incident: IncidentRecord): IncidentRecord => ({
	...incident,
	siteId: incident.siteId ?? incident.SiteId,
	regionId: incident.regionId ?? incident.RegionId,
	siteName: incident.siteName ?? incident.SiteName ?? incident.location ?? incident.Location,
	regionName: incident.regionName ?? incident.RegionName,
	incidentType: incident.incidentType ?? incident.IncidentType ?? incident.type ?? incident.Type,
	dateOfIncident: incident.dateOfIncident ?? incident.DateOfIncident ?? incident.date ?? incident.Date,
	stolenItems: normalizeStolenItems(incident.stolenItems ?? incident.StolenItems),
})

const buildInsights = (incidents: IncidentRecord[]): CrimeIntelligenceResponse => {
	const totalIncidents = incidents.length
	const totalRecovered = incidents.reduce((sum, item) => sum + getIncidentRecoveredValue(item), 0)
	const totalLoss = incidents.reduce((sum, item) => sum + getIncidentLossValue(item), 0)

	const typeMap = new Map<string, { count: number; value: number }>()
	const storeMap = new Map<string, { count: number; value: number }>()
	const regionMap = new Map<string, { count: number; value: number }>()
	const productMap = new Map<string, { count: number; value: number }>()
	const timeMap = new Map<string, number>()

	incidents.forEach((incident) => {
		const incidentType = asString(incident.incidentType ?? incident.IncidentType ?? incident.type ?? incident.Type) || 'Unknown'
		const siteName = asString(incident.siteName ?? incident.SiteName ?? incident.location ?? incident.Location) || 'Unknown Site'
		const regionName = asString(incident.regionName ?? incident.RegionName) || 'Unknown Region'
		const incidentValue = asNumber(incident.totalValueRecovered ?? incident.valueRecovered ?? incident.totalValueLost ?? incident.valueLost ?? incident.amount)

		const currentType = typeMap.get(incidentType) ?? { count: 0, value: 0 }
		typeMap.set(incidentType, { count: currentType.count + 1, value: currentType.value + incidentValue })

		const currentStore = storeMap.get(siteName) ?? { count: 0, value: 0 }
		storeMap.set(siteName, { count: currentStore.count + 1, value: currentStore.value + incidentValue })

		const currentRegion = regionMap.get(regionName) ?? { count: 0, value: 0 }
		regionMap.set(regionName, { count: currentRegion.count + 1, value: currentRegion.value + incidentValue })

		const stolenItems = Array.isArray(incident.stolenItems) ? incident.stolenItems : []
		stolenItems.forEach((item) => {
			if (!item || typeof item !== 'object') return
			const productName = asString((item as IncidentRecord).productName ?? (item as IncidentRecord).description) || 'Unknown Product'
			const quantity = asNumber((item as IncidentRecord).quantity)
			const value = asNumber((item as IncidentRecord).totalAmount ?? (item as IncidentRecord).valueLost ?? (item as IncidentRecord).valueSaved)
			const current = productMap.get(productName) ?? { count: 0, value: 0 }
			productMap.set(productName, { count: current.count + quantity, value: current.value + value })
		})

		const incidentDate = getIncidentDate(incident)
		if (incidentDate) {
			const bucket = extractTimeBucket(incidentDate)
			timeMap.set(bucket, (timeMap.get(bucket) ?? 0) + 1)
		}
	})

	const toList = (map: Map<string, { count: number; value: number }>) =>
		Array.from(map.entries())
			.map(([name, stats]) => ({
				name,
				count: stats.count,
				value: stats.value,
				percentage: totalIncidents > 0 ? (stats.count / totalIncidents) * 100 : 0,
			}))
			.sort((a, b) => b.count - a.count)

	const topIncidentTypes = toList(typeMap).slice(0, 8)
	const topStores = toList(storeMap).slice(0, 12)
	const topRegions = toList(regionMap).slice(0, 12)
	const topProducts = Array.from(productMap.entries())
		.map(([name, stats]) => ({
			name,
			count: stats.count,
			value: stats.value,
			percentage: totalIncidents > 0 ? (stats.count / totalIncidents) * 100 : 0,
		}))
		.sort((a, b) => b.count - a.count)
		.slice(0, 12)

	const timeBuckets = Array.from(timeMap.entries())
		.map(([bucket, count]) => ({
			bucket,
			count,
			percentage: totalIncidents > 0 ? (count / totalIncidents) * 100 : 0,
		}))
		.sort((a, b) => b.count - a.count)

	const hotProduct = topProducts[0]
		? {
			productName: topProducts[0].name,
			quantity: topProducts[0].count,
			totalValue: topProducts[0].value ?? 0,
			mostTargetedStore: topStores[0]?.name,
			typicalTime: timeBuckets[0]?.bucket,
		}
		: undefined

	return {
		success: true,
		heroMetrics: [
			{ title: 'Total Incidents', value: totalIncidents.toLocaleString(), trendIsPositive: false },
			{ title: 'Recovery Value', value: `GBP ${Math.round(totalRecovered).toLocaleString()}`, trendIsPositive: true },
			{ title: 'Loss Value', value: `GBP ${Math.round(totalLoss).toLocaleString()}`, trendIsPositive: false },
			{ title: 'Top Hotspot', value: topStores[0]?.name ?? 'N/A', subtext: `${topStores[0]?.count ?? 0} incidents`, trendIsPositive: false },
		],
		topIncidentTypes,
		topStores,
		topProducts,
		topRegions,
		timeBuckets,
		hotProduct,
		generatedAt: new Date().toISOString(),
	}
}

export const crimeIntelligenceService = {
	async getInsights(query: CrimeIntelligenceQuery): Promise<CrimeIntelligenceResponse> {
		const summarySearch = new URLSearchParams()
		summarySearch.append('customerId', query.customerId.toString())
		if (query.startDate) summarySearch.append('startDate', query.startDate)
		if (query.endDate) summarySearch.append('endDate', query.endDate)
		if (query.siteId) summarySearch.append('siteId', query.siteId)
		if (query.regionId) summarySearch.append('regionId', query.regionId)

		try {
			const summaryResponse = await api.get<CrimeIntelligenceResponse>(
				`/CrimeIntelligence/insights?${summarySearch.toString()}`,
				{
					headers: {
						'X-Customer-Id': query.customerId.toString(),
					},
				}
			)
			if (summaryResponse.data?.success) {
				return summaryResponse.data
			}
		} catch (error) {
			logger.warn('CrimeIntelligence: summary endpoint unavailable, using bounded fallback', error)
		}

		const search = new URLSearchParams()
		search.append('page', '1')
		// Keep fallback payload bounded; backend summary endpoint should serve primary analytics.
		search.append('pageSize', '200')
		search.append('customerId', query.customerId.toString())
		if (query.startDate) search.append('fromDate', query.startDate)
		if (query.endDate) search.append('toDate', query.endDate)

		const response = await api.get(`/incidents?${search.toString()}`, {
			headers: {
				'X-Customer-Id': query.customerId.toString(),
			},
		})

		const incidents = toIncidentArray(response.data).map(normalizeIncident)
		const filtered = applyLocalFilters(incidents, query)
		return buildInsights(filtered)
	},
}

export type CrimeIntelligenceService = typeof crimeIntelligenceService

