import type {
	AdminIncidentAnalytics,
	AdminIncidentByDayItem,
	AdminIncidentByHourItem,
	AdminIncidentByTypeItem,
	AdminIncidentKpiSummary,
	AdminIncidentStoreItem,
	AdminIncidentTrendItem,
	NormalizedAdminIncident
} from '@/types/dashboard'

const DAY_ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const getNumericValue = (value: unknown): number | null => {
	if (typeof value === 'number' && Number.isFinite(value)) return value
	if (typeof value === 'string') {
		const parsed = Number(value.replace(/[^0-9.-]+/g, ''))
		return Number.isFinite(parsed) ? parsed : null
	}
	return null
}

const pickNumeric = (source: Record<string, unknown>, keys: string[]): number | null => {
	for (const key of keys) {
		const value = getNumericValue(source[key])
		if (value !== null) return value
	}
	return null
}

const getArrayField = (source: Record<string, unknown>, keys: string[]): Record<string, unknown>[] => {
	for (const key of keys) {
		const value = source[key]
		if (Array.isArray(value)) {
			return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
		}
	}
	return []
}

const parseIncidentDate = (raw: Record<string, unknown>): Date | null => {
	const candidate = (
		raw.DateOfIncident ??
		raw.dateOfIncident ??
		raw.Date ??
		raw.date ??
		raw.incidentDate ??
		raw.createdAt
	)
	if (!candidate) return null
	if (candidate instanceof Date && !Number.isNaN(candidate.getTime())) return candidate
	if (typeof candidate === 'number') {
		const fromEpoch = new Date(candidate)
		return Number.isNaN(fromEpoch.getTime()) ? null : fromEpoch
	}

	const candidateText = String(candidate).trim()
	if (!candidateText) return null

	const parsed = new Date(candidateText)
	if (!Number.isNaN(parsed.getTime())) return parsed

	const slashDateMatch = candidateText.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/)
	if (slashDateMatch) {
		const day = Number(slashDateMatch[1])
		const month = Number(slashDateMatch[2])
		const year = Number(slashDateMatch[3])
		const hour = Number(slashDateMatch[4] ?? 0)
		const minute = Number(slashDateMatch[5] ?? 0)
		const second = Number(slashDateMatch[6] ?? 0)
		const manualDate = new Date(year, month - 1, day, hour, minute, second)
		return Number.isNaN(manualDate.getTime()) ? null : manualDate
	}

	return null
}

const normalizeIncidentType = (raw: Record<string, unknown>): string => {
	const typeValue = (
		raw.IncidentType ??
		raw.incidentType ??
		raw.type ??
		raw.Type ??
		'Unknown'
	)
	const text = String(typeValue).trim()
	return text.length > 0 ? text : 'Unknown'
}

const normalizeStoreName = (raw: Record<string, unknown>): string => {
	const name = (
		raw.SiteName ??
		raw.siteName ??
		raw.StoreName ??
		raw.storeName ??
		raw.store ??
		raw.LocationName ??
		'Unknown store'
	)
	const text = String(name).trim()
	return text.length > 0 ? text : 'Unknown store'
}

const normalizeBoolean = (value: unknown): boolean => {
	if (typeof value === 'boolean') return value
	if (typeof value === 'number') return value > 0
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase()
		return ['true', 'yes', '1', 'y'].includes(normalized)
	}
	return false
}

export const normalizeAdminIncidents = (rawIncidents: unknown[]): NormalizedAdminIncident[] => {
	return rawIncidents
		.map((raw): NormalizedAdminIncident | null => {
			if (!raw || typeof raw !== 'object') return null
			const item = raw as Record<string, unknown>
			const incidentDate = parseIncidentDate(item)
			if (!incidentDate) return null

			const stolenItems = getArrayField(item, ['StolenItems', 'stolenItems', 'Items', 'items'])
			const stolenRecoveredValue = stolenItems.reduce((sum, stolenItem) => (
				sum + Math.max(0, pickNumeric(stolenItem, ['ValueSaved', 'valueSaved']) ?? 0)
			), 0)
			const stolenLossValue = stolenItems.reduce((sum, stolenItem) => (
				sum + Math.max(0, pickNumeric(stolenItem, ['ValueLost', 'valueLost']) ?? 0)
			), 0)
			const stolenTotalAmount = stolenItems.reduce((sum, stolenItem) => (
				sum + Math.max(0, pickNumeric(stolenItem, ['TotalAmount', 'totalAmount']) ?? 0)
			), 0)

			const explicitRecoveredValue = pickNumeric(item, [
				'TotalValueRecovered',
				'totalValueRecovered',
				'TotalRecoveredValue',
				'totalRecoveredValue',
				'RecoveredValue',
				'recoveredValue',
				'ValueRecovered',
				'valueRecovered',
				'ValueSaved',
				'valueSaved'
			])
			const recoveredValue = Math.max(0, explicitRecoveredValue ?? stolenRecoveredValue)

			const explicitLossValue = pickNumeric(item, [
				'TotalValueLost',
				'totalValueLost',
				'TotalLossValue',
				'totalLossValue',
				'LossValue',
				'lossValue',
				'ValueLost',
				'valueLost',
				'TotalLoss',
				'totalLoss'
			])
			const fallbackLossValue = pickNumeric(item, [
				'EstimatedLossValue',
				'estimatedLossValue',
				'PotentialLoss',
				'potentialLoss'
			])
			const totalAmountCandidate = pickNumeric(item, ['TotalAmount', 'totalAmount', 'Amount', 'amount', 'Value', 'value'])
			const derivedLossFromTotalAmount = (
				totalAmountCandidate !== null
					? Math.max(0, totalAmountCandidate - recoveredValue)
					: null
			)
			const derivedLossFromStolenItems = (
				stolenLossValue > 0
					? stolenLossValue
					: (stolenTotalAmount > 0 ? Math.max(0, stolenTotalAmount - stolenRecoveredValue) : null)
			)
			const lossValue = Math.max(
				0,
				explicitLossValue
					?? derivedLossFromStolenItems
					?? derivedLossFromTotalAmount
					?? fallbackLossValue
					?? 0
			)
			const lossValueIsEstimated = explicitLossValue === null

			const timeOfIncident = String(item.TimeOfIncident ?? item.timeOfIncident ?? '').trim()

			return {
				id: String(item.Id ?? item.id ?? crypto.randomUUID()),
				date: incidentDate,
				timeOfIncident: timeOfIncident || undefined,
				incidentType: normalizeIncidentType(item),
				storeName: normalizeStoreName(item),
				customerName: String(item.CustomerName ?? item.customerName ?? '—'),
				officerName: String(item.OfficerName ?? item.officerName ?? '—'),
				offenderName: String(item.OffenderName ?? item.offenderName ?? '').trim(),
				policeInvolvement: normalizeBoolean(item.PoliceInvolvement ?? item.policeInvolvement),
				recoveredValue,
				lossValue,
				lossValueIsEstimated
			}
		})
		.filter((item): item is NormalizedAdminIncident => Boolean(item))
		.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export const filterIncidentsByDateRange = (
	incidents: NormalizedAdminIncident[],
	startDate: Date,
	endDate: Date
) => {
	const normalizedStart = new Date(startDate)
	normalizedStart.setHours(0, 0, 0, 0)
	const normalizedEnd = new Date(endDate)
	normalizedEnd.setHours(23, 59, 59, 999)

	return incidents.filter(incident => (
		incident.date >= normalizedStart && incident.date <= normalizedEnd
	))
}

const buildKpis = (incidents: NormalizedAdminIncident[]): AdminIncidentKpiSummary => {
	const totalIncidents = incidents.length
	const totalRecoveredValue = incidents.reduce((sum, incident) => sum + incident.recoveredValue, 0)
	const totalLossValue = incidents.reduce((sum, incident) => sum + incident.lossValue, 0)
	const averageLossPerIncident = totalIncidents > 0 ? totalLossValue / totalIncidents : 0
	const estimatedLossSamples = incidents.filter(incident => incident.lossValueIsEstimated).length

	return {
		totalIncidents,
		totalRecoveredValue,
		totalLossValue,
		averageLossPerIncident,
		estimatedLossSamples
	}
}

const buildRecoveredVsLossTrend = (incidents: NormalizedAdminIncident[]): AdminIncidentTrendItem[] => {
	const byDate = new Map<string, AdminIncidentTrendItem>()
	for (const incident of incidents) {
		const dateKey = incident.date.toISOString().split('T')[0]
		if (!byDate.has(dateKey)) {
			byDate.set(dateKey, {
				dateKey,
				label: incident.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
				recoveredValue: 0,
				lossValue: 0,
				incidentCount: 0
			})
		}
		const row = byDate.get(dateKey)!
		row.recoveredValue += incident.recoveredValue
		row.lossValue += incident.lossValue
		row.incidentCount += 1
	}
	return Array.from(byDate.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey))
}

const buildIncidentsByType = (incidents: NormalizedAdminIncident[]): AdminIncidentByTypeItem[] => {
	const byType = new Map<string, AdminIncidentByTypeItem>()
	for (const incident of incidents) {
		if (!byType.has(incident.incidentType)) {
			byType.set(incident.incidentType, {
				type: incident.incidentType,
				incidentCount: 0,
				recoveredValue: 0,
				lossValue: 0
			})
		}
		const row = byType.get(incident.incidentType)!
		row.incidentCount += 1
		row.recoveredValue += incident.recoveredValue
		row.lossValue += incident.lossValue
	}
	return Array.from(byType.values()).sort((a, b) => b.incidentCount - a.incidentCount)
}

const buildTopStores = (incidents: NormalizedAdminIncident[]): AdminIncidentStoreItem[] => {
	const byStore = new Map<string, AdminIncidentStoreItem>()
	for (const incident of incidents) {
		if (!byStore.has(incident.storeName)) {
			byStore.set(incident.storeName, {
				storeName: incident.storeName,
				incidentCount: 0,
				recoveredValue: 0,
				lossValue: 0
			})
		}
		const row = byStore.get(incident.storeName)!
		row.incidentCount += 1
		row.recoveredValue += incident.recoveredValue
		row.lossValue += incident.lossValue
	}

	return Array.from(byStore.values())
		.sort((a, b) => b.incidentCount - a.incidentCount)
		.slice(0, 10)
}

const buildPeakHours = (incidents: NormalizedAdminIncident[]): AdminIncidentByHourItem[] => {
	const byHour = new Map<number, number>()
	for (let hour = 0; hour < 24; hour += 1) {
		byHour.set(hour, 0)
	}
	for (const incident of incidents) {
		const hour = incident.date.getHours()
		byHour.set(hour, (byHour.get(hour) ?? 0) + 1)
	}
	return Array.from(byHour.entries()).map(([hour, incidentCount]) => ({
		hour,
		label: `${String(hour).padStart(2, '0')}:00`,
		incidentCount
	}))
}

const buildIncidentsByDay = (incidents: NormalizedAdminIncident[]): AdminIncidentByDayItem[] => {
	const byDay = new Map<string, number>()
	for (const day of DAY_ORDER) byDay.set(day, 0)
	for (const incident of incidents) {
		const day = DAY_ORDER[incident.date.getDay()]
		byDay.set(day, (byDay.get(day) ?? 0) + 1)
	}
	return DAY_ORDER.map(day => ({
		day,
		incidentCount: byDay.get(day) ?? 0
	}))
}

export const buildAdminIncidentAnalytics = (incidents: NormalizedAdminIncident[]): AdminIncidentAnalytics => {
	return {
		kpis: buildKpis(incidents),
		recoveredVsLossTrend: buildRecoveredVsLossTrend(incidents),
		incidentsByType: buildIncidentsByType(incidents),
		topStoresByIncidents: buildTopStores(incidents),
		peakHours: buildPeakHours(incidents),
		incidentsByDay: buildIncidentsByDay(incidents)
	}
}

