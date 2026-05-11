/**
 * Client-side analytics hub: pages incident payloads from `GET /incidents` and builds hub modules locally.
 * No dedicated analytics API yet; normalization and paging live here until the backend exposes aggregates.
 * Flow: filter params → paged `/incidents` fetch → in-memory aggregates for hub modules and CSV export.
 * Invalidate `incidentQueryKeys.analyticsHub*` after incident create/update/delete.
 */
import { api } from '@/config/api'
import type {
	AnalyticsHubData,
	CrimeTrendData,
	HotProductsData,
	RepeatOffenderData,
	DeploymentRecommendation,
	StoreRiskRanking,
	CrimeLinkingData,
	IncidentTypeData,
	StoreDrilldownData,
} from '@/types/analytics'

export interface StoreOption {
	id: number | string
	name: string
}

export interface RegionOption {
	id: number | string
	name: string
}

export interface AnalyticsQueryParams {
	customerId?: number
	startDate?: string
	endDate?: string
	storeIds?: number[]
	regionIds?: number[]
	stores?: StoreOption[]
	regions?: RegionOption[]
}

type IncidentRecord = Record<string, unknown>

interface NormalizedStolenItem {
	barcode: string
	productName: string
	quantity: number
	lossValue: number
}

interface NormalizedIncident {
	id: string
	date: Date
	day: string
	hour: number
	type: string
	siteId: number
	siteName: string
	regionId: number
	regionName: string
	officerType: 'uniform' | 'store detectives'
	offenderName: string
	offenderId: string
	recoveredValue: number
	lossValue: number
	totalValue: number
	stolenItems: NormalizedStolenItem[]
}

// Incident paging for hub aggregation (client-side cap).
const PAGE_SIZE = 1000
const MAX_PAGES = 20
// Deployment charts only count incidents in typical store operating hours.
const OPERATING_START_HOUR = 7
const OPERATING_END_HOUR = 22
// Date-only incidents without a time field use midday so they are not dropped from hour buckets.
const DEFAULT_DEPLOYMENT_HOUR = 14
const WEEKDAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const parseNumber = (value: unknown): number => {
	if (typeof value === 'number') return Number.isFinite(value) ? value : 0
	if (typeof value === 'string' && value.trim() !== '') {
		const parsed = Number(value.replace(/[^\d.-]/g, ''))
		return Number.isFinite(parsed) ? parsed : 0
	}
	return 0
}

const parseInteger = (value: unknown): number => Math.trunc(parseNumber(value))

const parseString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

const parseDate = (value: unknown): Date | null => {
	const raw = parseString(value)
	if (!raw) return null
	const parsed = new Date(raw)
	return Number.isNaN(parsed.getTime()) ? null : parsed
}

const toHourOrNull = (value: number): number | null => {
	if (!Number.isFinite(value)) return null
	const hour = Math.trunc(value)
	return hour >= 0 && hour <= 23 ? hour : null
}

const parseHourFromUnknown = (value: unknown): number | null => {
	if (typeof value === 'number') {
		return toHourOrNull(value)
	}
	if (typeof value !== 'string') {
		return null
	}

	const raw = value.trim()
	if (!raw) return null

	const directDate = new Date(raw)
	if (!Number.isNaN(directDate.getTime())) {
		return toHourOrNull(directDate.getHours())
	}

	const normalized = raw.toLowerCase()
	const amPmMatch = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/)
	if (amPmMatch) {
		const hourPart = Number(amPmMatch[1])
		if (!Number.isFinite(hourPart)) return null
		const suffix = amPmMatch[3]
		const normalizedHour = hourPart % 12 + (suffix === 'pm' ? 12 : 0)
		return toHourOrNull(normalizedHour)
	}

	const timeMatch = normalized.match(/^(\d{1,2})(?::\d{2}){0,2}$/)
	if (timeMatch) {
		return toHourOrNull(Number(timeMatch[1]))
	}

	return null
}

const getIncidentHour = (incident: IncidentRecord, incidentDate: Date): number => {
	const hourFromField = parseHourFromUnknown(
		getField(incident, [
			'timeOfIncident',
			'TimeOfIncident',
			'incidentTime',
			'IncidentTime',
			'time',
			'Time',
			'timeOfDay',
			'TimeOfDay',
		])
	)
	if (hourFromField !== null) return hourFromField

	const rawDateValue = parseString(
		getField(incident, ['dateOfIncident', 'DateOfIncident', 'date', 'Date', 'dateInputted', 'DateInputted'])
	)
	if (rawDateValue && /T\d{1,2}:\d{2}/.test(rawDateValue)) {
		const hourFromDate = toHourOrNull(incidentDate.getHours())
		if (hourFromDate !== null) return hourFromDate
	}

	return DEFAULT_DEPLOYMENT_HOUR
}

const getField = (source: IncidentRecord, keys: string[]): unknown => {
	for (const key of keys) {
		if (key in source && source[key] !== null && source[key] !== undefined) {
			return source[key]
		}
	}
	return undefined
}

const toTitleCase = (value: string): string => {
	if (!value) return 'Unknown'
	return value
		.split(' ')
		.filter(Boolean)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ')
}

const getStoreName = (incident: IncidentRecord, fallbackById: Map<number, string>) => {
	const rawName = parseString(getField(incident, ['siteName', 'SiteName', 'location', 'Location', 'store', 'Store']))
	if (rawName) return rawName
	const siteId = parseInteger(getField(incident, ['siteId', 'SiteId', 'fkSiteID', 'FkSiteID']))
	return fallbackById.get(siteId) ?? (siteId > 0 ? `Store ${siteId}` : 'Unknown Store')
}

const getRegionName = (incident: IncidentRecord, fallbackById: Map<number, string>) => {
	const rawName = parseString(getField(incident, ['regionName', 'RegionName']))
	if (rawName) return rawName
	const regionId = parseInteger(getField(incident, ['regionId', 'RegionId', 'fkRegionID', 'FkRegionID']))
	return fallbackById.get(regionId) ?? (regionId > 0 ? `Region ${regionId}` : 'Unknown Region')
}

const getStolenItemTotals = (incident: IncidentRecord) => {
	const rawItems = getField(incident, ['stolenItems', 'StolenItems'])
	const stolenItems = Array.isArray(rawItems) ? rawItems : []
	return stolenItems.reduce((totals, item) => {
		if (!item || typeof item !== 'object') return totals
		const itemRecord = item as IncidentRecord
		const totalAmount = parseNumber(getField(itemRecord, ['totalAmount', 'TotalAmount']))
			|| (parseNumber(getField(itemRecord, ['cost', 'Cost'])) * parseNumber(getField(itemRecord, ['quantity', 'Quantity'])))
		const recovered = parseNumber(getField(itemRecord, ['valueSaved', 'ValueSaved', 'valueRecovered', 'ValueRecovered']))
		const explicitLoss = parseNumber(getField(itemRecord, ['valueLost', 'ValueLost']))
		const derivedLoss = Math.max(0, totalAmount - recovered)
		return {
			totalAmount: totals.totalAmount + Math.max(0, totalAmount),
			totalRecovered: totals.totalRecovered + Math.max(0, recovered),
			totalLost: totals.totalLost + Math.max(0, explicitLoss || derivedLoss),
		}
	}, { totalAmount: 0, totalRecovered: 0, totalLost: 0 })
}

const getRecoveredValue = (incident: IncidentRecord): number => {
	const explicit = parseNumber(getField(incident, [
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
	]))
	if (explicit > 0) return explicit
	return getStolenItemTotals(incident).totalRecovered
}

const getLossValue = (incident: IncidentRecord): number => {
	const explicit = parseNumber(getField(incident, [
		'totalValueLost',
		'TotalValueLost',
		'totalLossValue',
		'TotalLossValue',
		'lossValue',
		'LossValue',
		'valueLost',
		'ValueLost',
	]))
	if (explicit > 0) return explicit
	const stolenTotals = getStolenItemTotals(incident)
	if (stolenTotals.totalLost > 0) return stolenTotals.totalLost
	if (stolenTotals.totalAmount > 0) return Math.max(0, stolenTotals.totalAmount - getRecoveredValue(incident))
	const totalAmount = parseNumber(getField(incident, ['totalAmount', 'TotalAmount', 'amount', 'Amount']))
	return Math.max(0, totalAmount - getRecoveredValue(incident))
}

const getOfficerType = (incident: IncidentRecord): 'uniform' | 'store detectives' => {
	const role = parseString(getField(incident, ['officerRole', 'OfficerRole', 'officerType', 'OfficerType'])).toLowerCase()
	return role.includes('detective') ? 'store detectives' : 'uniform'
}

const getRecommendedOfficerType = (
	counts: Record<'uniform' | 'store detectives', number>
): 'uniform' | 'store detectives' =>
	counts['store detectives'] > counts.uniform ? 'store detectives' : 'uniform'

const normalizeIncident = (
	incident: IncidentRecord,
	storeNameById: Map<number, string>,
	regionNameById: Map<number, string>
): NormalizedIncident | null => {
	const date = parseDate(getField(incident, ['dateOfIncident', 'DateOfIncident', 'date', 'Date', 'dateInputted', 'DateInputted']))
	if (!date) return null
	const incidentHour = getIncidentHour(incident, date)
	const siteId = parseInteger(getField(incident, ['siteId', 'SiteId', 'fkSiteID', 'FkSiteID']))
	const regionId = parseInteger(getField(incident, ['regionId', 'RegionId', 'fkRegionID', 'FkRegionID']))
	const siteName = getStoreName(incident, storeNameById)
	const regionName = getRegionName(incident, regionNameById)
	const type = parseString(getField(incident, ['incidentType', 'IncidentType', 'type', 'Type'])) || 'Unknown'
	const offenderName = parseString(getField(incident, ['offenderName', 'OffenderName']))
	const offenderDob = parseString(getField(incident, ['offenderDOB', 'OffenderDOB']))
	const recoveredValue = getRecoveredValue(incident)
	const lossValue = getLossValue(incident)
	const totalValue = recoveredValue + lossValue
	const incidentId = parseString(getField(incident, ['id', 'Id', 'incidentId', 'IncidentId'])) || crypto.randomUUID()

	const rawStolenItems = getField(incident, ['stolenItems', 'StolenItems'])
	const stolenItems = (Array.isArray(rawStolenItems) ? rawStolenItems : [])
		.filter((item): item is IncidentRecord => Boolean(item && typeof item === 'object'))
		.map((item) => {
			const quantity = Math.max(1, parseInteger(getField(item, ['quantity', 'Quantity'])))
			const productName = parseString(getField(item, ['productName', 'ProductName', 'description', 'Description'])) || 'Unknown Product'
			const barcode = parseString(getField(item, ['barcode', 'Barcode'])) || `N/A-${productName}`
			const totalAmount = parseNumber(getField(item, ['totalAmount', 'TotalAmount']))
			const explicitLoss = parseNumber(getField(item, ['valueLost', 'ValueLost']))
			const recovered = parseNumber(getField(item, ['valueSaved', 'ValueSaved', 'valueRecovered', 'ValueRecovered']))
			const loss = Math.max(0, explicitLoss || totalAmount - recovered)
			return {
				barcode,
				productName,
				quantity,
				lossValue: loss,
			}
		})

	return {
		id: incidentId,
		date,
		day: date.toLocaleDateString('en-GB', { weekday: 'long' }),
		hour: incidentHour,
		type,
		siteId,
		siteName,
		regionId,
		regionName,
		officerType: getOfficerType(incident),
		offenderName,
		offenderId: offenderName ? `${offenderName}|${offenderDob || 'unknown-dob'}` : '',
		recoveredValue,
		lossValue,
		totalValue,
		stolenItems,
	}
}

const calculateRiskLevel = (count: number): 'low' | 'medium' | 'high' | 'critical' => {
	if (count >= 25) return 'critical'
	if (count >= 15) return 'high'
	if (count >= 8) return 'medium'
	return 'low'
}

const calculatePriority = (count: number): 'low' | 'medium' | 'high' | 'critical' => {
	if (count >= 7) return 'critical'
	if (count >= 5) return 'high'
	if (count >= 3) return 'medium'
	return 'low'
}

class AnalyticsService {
	private readonly incidentsPath = '/incidents'

	/** Accepts list envelopes in camelCase or PascalCase from the .NET API. */
	private extractIncidentList(payload: unknown): IncidentRecord[] {
		if (Array.isArray(payload)) return payload.filter((item): item is IncidentRecord => Boolean(item && typeof item === 'object'))
		if (payload && typeof payload === 'object') {
			const record = payload as Record<string, unknown>
			if (Array.isArray(record.items)) return record.items.filter((item): item is IncidentRecord => Boolean(item && typeof item === 'object'))
			if (Array.isArray(record.Items)) return record.Items.filter((item): item is IncidentRecord => Boolean(item && typeof item === 'object'))
			if (Array.isArray(record.data)) return record.data.filter((item): item is IncidentRecord => Boolean(item && typeof item === 'object'))
		}
		return []
	}

	/** Walks paged `/incidents` until a short page or `MAX_PAGES`. */
	private async fetchIncidents(params?: AnalyticsQueryParams): Promise<IncidentRecord[]> {
		const incidents: IncidentRecord[] = []
		const customerHeader = params?.customerId ? { 'X-Customer-Id': params.customerId.toString() } : undefined

		for (let page = 1; page <= MAX_PAGES; page += 1) {
			const search = new URLSearchParams()
			search.append('page', page.toString())
			search.append('pageSize', PAGE_SIZE.toString())
			if (params?.customerId) search.append('customerId', params.customerId.toString())
			if (params?.startDate) search.append('fromDate', params.startDate)
			if (params?.endDate) search.append('toDate', params.endDate)
			const response = await api.get(`${this.incidentsPath}?${search.toString()}`, {
				headers: customerHeader,
			})
			const responseData = response.data as Record<string, unknown>
			const pageIncidents = this.extractIncidentList(responseData.data ?? responseData.Data ?? responseData)
			incidents.push(...pageIncidents)
			if (pageIncidents.length < PAGE_SIZE) break
		}

		return incidents
	}

	private buildCrimeTrends(incidents: NormalizedIncident[], startDate: string, endDate: string): CrimeTrendData {
		const dayMap = new Map<string, { incidents: number; stores: Set<string> }>()
		WEEKDAY_ORDER.forEach((day) => dayMap.set(day, { incidents: 0, stores: new Set() }))
		const hourMap = new Map<number, number>()
		for (let hour = OPERATING_START_HOUR; hour <= OPERATING_END_HOUR; hour += 1) {
			hourMap.set(hour, 0)
		}
		const typeMap = new Map<string, { count: number; totalValue: number }>()
		const storeMap = new Map<string, {
			storeId: number
			storeName: string
			incidents: number
			typeMap: Map<string, { count: number; totalValue: number }>
			dayMap: Map<string, number>
			hourMap: Map<number, number>
		}>()

		incidents.forEach((incident) => {
			const dayStats = dayMap.get(incident.day) ?? { incidents: 0, stores: new Set<string>() }
			dayStats.incidents += 1
			dayStats.stores.add(incident.siteName)
			dayMap.set(incident.day, dayStats)

			if (incident.hour >= OPERATING_START_HOUR && incident.hour <= OPERATING_END_HOUR) {
				hourMap.set(incident.hour, (hourMap.get(incident.hour) ?? 0) + 1)
			}

			const currentType = typeMap.get(incident.type) ?? { count: 0, totalValue: 0 }
			currentType.count += 1
			currentType.totalValue += incident.totalValue
			typeMap.set(incident.type, currentType)

			const storeKey = incident.siteName
			const storeEntry = storeMap.get(storeKey) ?? {
				storeId: incident.siteId,
				storeName: incident.siteName,
				incidents: 0,
				typeMap: new Map<string, { count: number; totalValue: number }>(),
				dayMap: new Map<string, number>(),
				hourMap: new Map<number, number>(),
			}
			storeEntry.incidents += 1
			const storeType = storeEntry.typeMap.get(incident.type) ?? { count: 0, totalValue: 0 }
			storeType.count += 1
			storeType.totalValue += incident.totalValue
			storeEntry.typeMap.set(incident.type, storeType)
			storeEntry.dayMap.set(incident.day, (storeEntry.dayMap.get(incident.day) ?? 0) + 1)
			storeEntry.hourMap.set(incident.hour, (storeEntry.hourMap.get(incident.hour) ?? 0) + 1)
			storeMap.set(storeKey, storeEntry)
		})

		const totalIncidents = incidents.length
		const dayOfWeek = WEEKDAY_ORDER.map((day) => {
			const stats = dayMap.get(day) ?? { incidents: 0, stores: new Set<string>() }
			return {
				day,
				incidents: stats.incidents,
				stores: stats.stores.size,
				percentage: totalIncidents > 0 ? (stats.incidents / totalIncidents) * 100 : 0,
			}
		})

		const totalHoursIncidents = Array.from(hourMap.values()).reduce((sum, count) => sum + count, 0)
		const timeOfDay = Array.from(hourMap.entries()).map(([hour, count]) => {
			const label = hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`
			return {
				hour,
				label,
				incidents: count,
				percentage: totalHoursIncidents > 0 ? (count / totalHoursIncidents) * 100 : 0,
			}
		})

		const incidentTypes: IncidentTypeData[] = Array.from(typeMap.entries())
			.map(([type, stats]) => ({
				type,
				count: stats.count,
				totalValue: stats.totalValue,
				percentage: totalIncidents > 0 ? (stats.count / totalIncidents) * 100 : 0,
			}))
			.sort((a, b) => b.count - a.count)

		const storeDrilldown: Record<string, StoreDrilldownData> = {}
		storeMap.forEach((storeEntry, key) => {
			const types = Array.from(storeEntry.typeMap.entries())
				.map(([type, stats]) => ({
					type,
					count: stats.count,
					totalValue: stats.totalValue,
					percentage: storeEntry.incidents > 0 ? (stats.count / storeEntry.incidents) * 100 : 0,
				}))
				.sort((a, b) => b.count - a.count)

			const peakDay = Array.from(storeEntry.dayMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'
			const peakHour = Array.from(storeEntry.hourMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? OPERATING_START_HOUR

			storeDrilldown[key] = {
				storeId: storeEntry.storeId,
				storeName: storeEntry.storeName,
				incidents: storeEntry.incidents,
				incidentTypes: types,
				peakDay,
				peakHour,
			}
		})

		return {
			dayOfWeek,
			timeOfDay,
			incidentTypes,
			storeDrilldown,
			totalIncidents,
			dateRange: {
				start: startDate,
				end: endDate,
			},
		}
	}

	private buildHotProducts(incidents: NormalizedIncident[], startDate: string, endDate: string): HotProductsData {
		const productMap = new Map<string, {
			barcode: string
			productName: string
			frequency: number
			totalValue: number
			stores: Set<string>
		}>()
		const storeMap = new Map<string, {
			storeId: number
			storeName: string
			totalIncidents: number
			products: Map<string, { barcode: string; productName: string; frequency: number; value: number }>
		}>()

		incidents.forEach((incident) => {
			const storeEntry = storeMap.get(incident.siteName) ?? {
				storeId: incident.siteId,
				storeName: incident.siteName,
				totalIncidents: 0,
				products: new Map<string, { barcode: string; productName: string; frequency: number; value: number }>(),
			}
			storeEntry.totalIncidents += 1

			incident.stolenItems.forEach((item) => {
				const productKey = `${item.barcode}|${item.productName}`
				const existingProduct = productMap.get(productKey) ?? {
					barcode: item.barcode,
					productName: item.productName,
					frequency: 0,
					totalValue: 0,
					stores: new Set<string>(),
				}
				existingProduct.frequency += Math.max(1, item.quantity)
				existingProduct.totalValue += item.lossValue
				existingProduct.stores.add(incident.siteName)
				productMap.set(productKey, existingProduct)

				const storeProduct = storeEntry.products.get(productKey) ?? {
					barcode: item.barcode,
					productName: item.productName,
					frequency: 0,
					value: 0,
				}
				storeProduct.frequency += Math.max(1, item.quantity)
				storeProduct.value += item.lossValue
				storeEntry.products.set(productKey, storeProduct)
			})

			storeMap.set(incident.siteName, storeEntry)
		})

		const topProducts = Array.from(productMap.values())
			.map(product => ({
				barcode: product.barcode,
				productName: product.productName,
				frequency: product.frequency,
				totalValue: product.totalValue,
				storesAffected: product.stores.size,
			}))
			.sort((a, b) => b.frequency - a.frequency)
			.slice(0, 20)

		const storeHeatmap = Array.from(storeMap.values())
			.map((store) => {
				const products = Array.from(store.products.values()).sort((a, b) => b.frequency - a.frequency).slice(0, 20)
				return {
					storeId: store.storeId,
					storeName: store.storeName,
					products,
					totalIncidents: store.totalIncidents,
					riskLevel: calculateRiskLevel(store.totalIncidents),
				}
			})
			.sort((a, b) => b.totalIncidents - a.totalIncidents)

		const totalValueLost = incidents.reduce((sum, incident) => sum + incident.lossValue, 0)
		const totalValueRecovered = incidents.reduce((sum, incident) => sum + incident.recoveredValue, 0)

		return {
			topProducts,
			storeHeatmap,
			totalValueLost,
			totalValueRecovered,
			period: {
				start: startDate,
				end: endDate,
			},
		}
	}

	private buildRepeatOffenders(incidents: NormalizedIncident[]): RepeatOffenderData {
		const offendersMap = new Map<string, NormalizedIncident[]>()
		incidents
			.filter(incident => incident.offenderName)
			.forEach((incident) => {
				const current = offendersMap.get(incident.offenderId) ?? []
				current.push(incident)
				offendersMap.set(incident.offenderId, current)
			})

		const offenders = Array.from(offendersMap.entries())
			.map(([offenderId, offenderIncidents]) => {
				const sorted = [...offenderIncidents].sort((a, b) => a.date.getTime() - b.date.getTime())
				const storesTargeted = Array.from(new Set(sorted.map(item => item.siteName)))
				const incidentCount = sorted.length
				const totalValue = sorted.reduce((sum, incident) => sum + incident.totalValue, 0)
				const incidentTypeFrequency = sorted.reduce((acc, incident) => {
					acc.set(incident.type, (acc.get(incident.type) ?? 0) + 1)
					return acc
				}, new Map<string, number>())
				const modusOperandi = Array.from(incidentTypeFrequency.entries())
					.sort((a, b) => b[1] - a[1])
					.slice(0, 3)
					.map(([type]) => type)

				return {
					offenderId,
					name: sorted[0].offenderName || 'Unknown Offender',
					incidentCount,
					firstIncident: sorted[0].date.toISOString(),
					lastIncident: sorted[sorted.length - 1].date.toISOString(),
					storesTargeted,
					totalValue,
					riskLevel: calculateRiskLevel(incidentCount),
					modusOperandi,
					incidents: sorted,
				}
			})
			.sort((a, b) => b.incidentCount - a.incidentCount)

		const mostActive = offenders.map(({ incidents, ...offender }) => offender)

		const crossStoreMovements = offenders
			.filter(offender => offender.storesTargeted.length > 1)
			.map((offender) => {
				const movements = offender.incidents
					.slice(1)
					.map((current, index) => {
						const previous = offender.incidents[index]
						return {
							fromStore: previous.siteName,
							toStore: current.siteName,
							date: current.date.toISOString(),
							incidentType: current.type,
						}
					})
					.filter(move => move.fromStore !== move.toStore)
				return {
					offenderId: offender.offenderId,
					offenderName: offender.name,
					movements,
					totalStores: offender.storesTargeted.length,
				}
			})
			.filter(item => item.movements.length > 0)
			.slice(0, 15)

		const offenderNodes = offenders.slice(0, 20).map((offender, index) => ({
			id: offender.offenderId,
			name: offender.name,
			type: 'offender' as const,
			x: Math.cos((index / Math.max(1, Math.min(20, offenders.length))) * 2 * Math.PI) * 120,
			y: Math.sin((index / Math.max(1, Math.min(20, offenders.length))) * 2 * Math.PI) * 120,
		}))

		const storeNames = Array.from(new Set(offenders.flatMap(offender => offender.storesTargeted))).slice(0, 20)
		const storeNodes = storeNames.map((storeName, index) => ({
			id: `store-${storeName}`,
			name: storeName,
			type: 'store' as const,
			x: Math.cos((index / Math.max(1, storeNames.length)) * 2 * Math.PI) * 180,
			y: Math.sin((index / Math.max(1, storeNames.length)) * 2 * Math.PI) * 180,
		}))

		const linkMap = new Map<string, { source: string; target: string; incidentCount: number }>()
		offenders.slice(0, 20).forEach((offender) => {
			offender.incidents.forEach((incident) => {
				const target = `store-${incident.siteName}`
				const key = `${offender.offenderId}|${target}`
				const current = linkMap.get(key) ?? { source: offender.offenderId, target, incidentCount: 0 }
				current.incidentCount += 1
				linkMap.set(key, current)
			})
		})

		const networkLinks = Array.from(linkMap.values()).map((link) => ({
			source: link.source,
			target: link.target,
			incidentCount: link.incidentCount,
			strength: Math.min(1, 0.2 + link.incidentCount / 10),
		}))

		return {
			mostActive,
			crossStoreMovements,
			networkMap: {
				nodes: [...offenderNodes, ...storeNodes],
				links: networkLinks,
			},
			totalOffenders: mostActive.length,
		}
	}

	private buildDeployment(incidents: NormalizedIncident[]): DeploymentRecommendation {
		const byDayHour = new Map<string, {
			day: string
			hour: number
			count: number
			officerTypeCounts: Record<'uniform' | 'store detectives', number>
		}>()
		const byStore = new Map<string, {
			storeId: number
			storeName: string
			count: number
			firstHalf: number
			secondHalf: number
			hourCounts: Map<number, number>
			officerTypeCounts: Record<'uniform' | 'store detectives', number>
		}>()

		const midpoint = incidents.length > 0
			? new Date((Math.min(...incidents.map(i => i.date.getTime())) + Math.max(...incidents.map(i => i.date.getTime()))) / 2)
			: new Date()

		incidents.forEach((incident) => {
			if (incident.hour < OPERATING_START_HOUR || incident.hour > OPERATING_END_HOUR) return
			const key = `${incident.day}|${incident.hour}`
			const dayHour = byDayHour.get(key) ?? {
				day: incident.day,
				hour: incident.hour,
				count: 0,
				officerTypeCounts: { uniform: 0, 'store detectives': 0 },
			}
			dayHour.count += 1
			dayHour.officerTypeCounts[incident.officerType] += 1
			byDayHour.set(key, dayHour)

			const storeKey = incident.siteName
			const store = byStore.get(storeKey) ?? {
				storeId: incident.siteId,
				storeName: incident.siteName,
				count: 0,
				firstHalf: 0,
				secondHalf: 0,
				hourCounts: new Map<number, number>(),
				officerTypeCounts: { uniform: 0, 'store detectives': 0 },
			}
			store.count += 1
			if (incident.date < midpoint) store.firstHalf += 1
			else store.secondHalf += 1
			store.hourCounts.set(incident.hour, (store.hourCounts.get(incident.hour) ?? 0) + 1)
			store.officerTypeCounts[incident.officerType] += 1
			byStore.set(storeKey, store)
		})

		const bestTimes = Array.from(byDayHour.values())
			.sort((a, b) => b.count - a.count)
			.slice(0, 40)
			.map((item) => {
				const officerType = getRecommendedOfficerType(item.officerTypeCounts)
				const priority = calculatePriority(item.count)
				const recommendedOfficers = Math.max(1, Math.min(6, Math.ceil(item.count / 2)))
				const hourLabel = item.hour === 12 ? '12 PM' : item.hour > 12 ? `${item.hour - 12} PM` : `${item.hour} AM`
				const weekend = item.day === 'Friday' || item.day === 'Saturday' || item.day === 'Sunday'
				const evening = item.hour >= 18
				const reason = weekend && evening
					? 'High weekend evening incident concentration'
					: evening
						? 'Elevated evening incident activity'
						: 'Historical incident concentration'
				return {
					day: item.day,
					hour: item.hour,
					hourLabel,
					recommendedOfficers,
					officerType,
					recommendedLPM: priority === 'critical' || priority === 'high',
					priority,
					reason,
					expectedIncidents: item.count,
				}
			})

		const storeRankings = Array.from(byStore.values())
			.map((store) => {
				const riskLevel = calculateRiskLevel(store.count)
				const trend: StoreRiskRanking['trend'] = store.secondHalf > store.firstHalf * 1.15
					? 'increasing'
					: store.secondHalf < store.firstHalf * 0.85
						? 'decreasing'
						: 'stable'
				const recommendedOfficerType = getRecommendedOfficerType(store.officerTypeCounts)
				const recommendedHours = Array.from(store.hourCounts.entries())
					.sort((a, b) => b[1] - a[1])
					.slice(0, 4)
					.map(([hour]) => `${hour}`)
				return {
					storeId: store.storeId,
					storeName: store.storeName,
					riskScore: Math.min(100, Math.max(15, store.count * 4)),
					riskLevel,
					incidentCount: store.count,
					trend,
					recommendedOfficerType,
					recommendedLPM: riskLevel === 'critical' || riskLevel === 'high',
					recommendedHours,
					priority: store.count,
				}
			})
			.sort((a, b) => b.priority - a.priority)

		const topStore = storeRankings[0]
		const overallStrategy = topStore
			? `Prioritize ${topStore.storeName} with ${topStore.recommendedOfficerType} coverage during peak windows, and reinforce critical day/hour slots where incidents concentrate.`
			: 'No significant deployment risks detected for the selected filters.'

		return {
			bestTimes,
			storeRankings,
			overallStrategy,
			lastUpdated: new Date().toISOString(),
		}
	}

	private buildCrimeLinking(incidents: NormalizedIncident[], startDate: string, endDate: string): CrimeLinkingData {
		const clusterCandidates = new Map<string, NormalizedIncident[]>()
		incidents.forEach((incident) => {
			const signature = incident.offenderName
				? `offender:${incident.offenderName.toLowerCase()}|type:${incident.type.toLowerCase()}`
				: `type:${incident.type.toLowerCase()}|store:${incident.siteName.toLowerCase()}`
			const group = clusterCandidates.get(signature) ?? []
			group.push(incident)
			clusterCandidates.set(signature, group)
		})

		let clusterIndex = 1
		const clusters = Array.from(clusterCandidates.values())
			.filter(group => group.length >= 2)
			.map((group) => {
				const sorted = [...group].sort((a, b) => a.date.getTime() - b.date.getTime())
				const sameStore = new Set(sorted.map(item => item.siteName)).size === 1
				const sameType = new Set(sorted.map(item => item.type)).size === 1
				const commonFeatures = [
					sameType ? `Same incident type: ${sorted[0].type}` : 'Mixed incident types',
					sameStore ? `Same store: ${sorted[0].siteName}` : 'Cross-store activity',
					sorted[0].offenderName ? `Suspected repeat offender: ${sorted[0].offenderName}` : 'Pattern-linked incidents',
				]

				const linkedIncidents = sorted.map(item => ({
					incidentId: item.id,
					date: item.date.toISOString(),
					storeName: item.siteName,
					incidentType: item.type,
					offenderId: item.offenderId || undefined,
					offenderName: item.offenderName || undefined,
					value: item.totalValue,
					similarityScore: sameType && sameStore ? 0.95 : sameType || sameStore ? 0.85 : 0.75,
					matchingFeatures: commonFeatures,
				}))

				const suspectedOffender = sorted[0].offenderName
					? {
						id: sorted[0].offenderId || `offender-${clusterIndex}`,
						name: sorted[0].offenderName,
						confidence: sameType && sameStore ? 0.92 : 0.8,
					}
					: undefined

				const cluster = {
					clusterId: `CLUSTER-${String(clusterIndex).padStart(3, '0')}`,
					incidents: linkedIncidents,
					commonFeatures,
					suspectedOffender,
					totalValue: linkedIncidents.reduce((sum, incident) => sum + incident.value, 0),
					dateRange: {
						start: linkedIncidents[0]?.date ?? startDate,
						end: linkedIncidents[linkedIncidents.length - 1]?.date ?? endDate,
					},
				}
				clusterIndex += 1
				return cluster
			})
			.sort((a, b) => b.incidents.length - a.incidents.length)

		const offenderGroups = new Map<string, NormalizedIncident[]>()
		incidents.filter(i => i.offenderName).forEach((incident) => {
			const current = offenderGroups.get(incident.offenderId) ?? []
			current.push(incident)
			offenderGroups.set(incident.offenderId, current)
		})

		let chainIndex = 1
		const offenderChains = Array.from(offenderGroups.entries())
			.map(([offenderId, offenderIncidents]) => {
				const sorted = [...offenderIncidents].sort((a, b) => a.date.getTime() - b.date.getTime())
				if (sorted.length < 2) return null
				const linkedIncidents = sorted.map(item => ({
					incidentId: item.id,
					date: item.date.toISOString(),
					storeName: item.siteName,
					incidentType: item.type,
					offenderId,
					offenderName: item.offenderName,
					value: item.totalValue,
					similarityScore: 0.9,
					matchingFeatures: ['Shared offender profile', 'Repeated incident behaviour'],
				}))
				const chain = {
					chainId: `CHAIN-${String(chainIndex).padStart(3, '0')}`,
					offenderId,
					offenderName: sorted[0].offenderName || 'Unknown Offender',
					incidents: linkedIncidents,
					timeline: linkedIncidents.map(incident => ({
						date: incident.date,
						store: incident.storeName,
						incidentType: incident.incidentType,
					})),
					totalValue: linkedIncidents.reduce((sum, incident) => sum + incident.value, 0),
					pattern: new Set(sorted.map(item => item.siteName)).size > 1 ? 'Cross-store progression' : 'Repeated same-store pattern',
				}
				chainIndex += 1
				return chain
			})
			.filter((chain): chain is NonNullable<typeof chain> => Boolean(chain))
			.sort((a, b) => b.incidents.length - a.incidents.length)

		const uniqueLinkedIncidentIds = new Set<string>()
		clusters.forEach((cluster) => {
			cluster.incidents.forEach((incident) => {
				if (incident.incidentId) {
					uniqueLinkedIncidentIds.add(incident.incidentId)
				}
			})
		})
		offenderChains.forEach((chain) => {
			chain.incidents.forEach((incident) => {
				if (incident.incidentId) {
					uniqueLinkedIncidentIds.add(incident.incidentId)
				}
			})
		})
		const totalLinkedIncidents = uniqueLinkedIncidentIds.size

		return {
			clusters,
			offenderChains,
			totalLinkedIncidents,
			period: {
				start: startDate,
				end: endDate,
			},
		}
	}

	/**
	 * Get complete analytics hub data
	 */
	async getAnalyticsHub(params?: AnalyticsQueryParams): Promise<AnalyticsHubData> {
		const incidentsRaw = await this.fetchIncidents(params)
		const allowedRegionIds = new Set((params?.regionIds ?? []).filter(id => Number.isFinite(id)))
		const allowedStoreIds = new Set((params?.storeIds ?? []).filter(id => Number.isFinite(id)))
		const storeNameById = new Map((params?.stores ?? []).map(store => [parseInteger(store.id), store.name]))
		const regionNameById = new Map((params?.regions ?? []).map(region => [parseInteger(region.id), region.name]))

		const normalized = incidentsRaw
			.map(incident => normalizeIncident(incident, storeNameById, regionNameById))
			.filter((incident): incident is NormalizedIncident => Boolean(incident))
			.filter((incident) => {
				if (allowedRegionIds.size > 0 && !allowedRegionIds.has(incident.regionId)) return false
				if (allowedStoreIds.size > 0 && !allowedStoreIds.has(incident.siteId)) return false
				return true
			})

		const sortedIncidents = [...normalized].sort((a, b) => a.date.getTime() - b.date.getTime())
		const inferredStart = sortedIncidents[0]?.date.toISOString().split('T')[0] ?? new Date().toISOString().split('T')[0]
		const inferredEnd = sortedIncidents[sortedIncidents.length - 1]?.date.toISOString().split('T')[0] ?? inferredStart
		const startDate = params?.startDate ?? inferredStart
		const endDate = params?.endDate ?? inferredEnd

		return {
			crimeTrends: this.buildCrimeTrends(sortedIncidents, startDate, endDate),
			hotProducts: this.buildHotProducts(sortedIncidents, startDate, endDate),
			repeatOffenders: this.buildRepeatOffenders(sortedIncidents),
			deploymentRecommendations: this.buildDeployment(sortedIncidents),
			crimeLinking: this.buildCrimeLinking(sortedIncidents, startDate, endDate),
			metadata: {
				generatedAt: new Date().toISOString(),
				dateRange: {
					start: startDate,
					end: endDate,
				},
				customerId: params?.customerId,
			},
		}
	}

	/**
	 * Get crime trend analytics
	 */
	async getCrimeTrends(params?: AnalyticsQueryParams): Promise<CrimeTrendData> {
		const data = await this.getAnalyticsHub(params)
		return data.crimeTrends
	}

	/**
	 * Get hot products analytics
	 */
	async getHotProducts(params?: AnalyticsQueryParams): Promise<HotProductsData> {
		const data = await this.getAnalyticsHub(params)
		return data.hotProducts
	}

	/**
	 * Get repeat offender analytics
	 */
	async getRepeatOffenders(params?: AnalyticsQueryParams): Promise<RepeatOffenderData> {
		const data = await this.getAnalyticsHub(params)
		return data.repeatOffenders
	}

	/**
	 * Get deployment recommendations
	 */
	async getDeploymentRecommendations(
		params?: AnalyticsQueryParams
	): Promise<DeploymentRecommendation> {
		const data = await this.getAnalyticsHub(params)
		return data.deploymentRecommendations
	}

	/**
	 * Get crime linking data
	 */
	async getCrimeLinking(params?: AnalyticsQueryParams): Promise<CrimeLinkingData> {
		const data = await this.getAnalyticsHub(params)
		return data.crimeLinking
	}
}

export const analyticsService = new AnalyticsService()

