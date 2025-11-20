import { http, HttpResponse } from 'msw'
import {
	DailyOccurrenceEntry,
	CreateOccurrenceRequest,
	UpdateOccurrenceRequest,
	DailyOccurrenceBookResponse,
	SingleOccurrenceResponse,
	OccurrenceStatsResponse,
	DailyOccurrenceBookStats
} from '@/types/dailyOccurrenceBook'

const CODE_DESCRIPTIONS: Record<string, string> = {
	A: 'Arrest',
	B: 'Deter',
	C: 'Theft',
	D: 'Violent Behaviour',
	E: 'Abusive Behaviour',
	F: 'Ban from Store',
	G: 'Criminal Damage',
	H: 'Underage Purchase',
	J: 'Credit Card Fraud',
	K: 'Anti-Social Behaviour',
	L: 'Suspicious Behaviour',
	M: 'Other'
}

const resolveCodeDescription = (code: string) => CODE_DESCRIPTIONS[code] ?? 'Other'

const now = new Date()
const isoDate = (offsetDays = 0) => {
	const date = new Date(now)
	date.setDate(date.getDate() + offsetDays)
	return date.toISOString().split('T')[0]
}

const isoDateTime = (offsetHours = 0) => {
	const date = new Date(now)
	date.setHours(date.getHours() + offsetHours)
	return date.toISOString()
}

let occurrenceStore: DailyOccurrenceEntry[] = [
	{
		id: 'DOB-001',
		customerId: 21,
		siteId: '1',
		siteName: 'Central Store',
		storeName: 'Central Store',
		storeNumber: 'CS-100',
		dateCommenced: isoDate(-120),
		date: isoDate(0),
		time: '09:15',
		officerName: 'Amelia Stone',
		code: 'C',
		codeDescription: resolveCodeDescription('C'),
		crimeReportCompletedDate: isoDate(0),
		crimeReportCompletedTime: '11:00',
		details: 'Customer attempted to leave with concealed electronics. Items recovered and customer details shared with head office.',
		signature: 'Amelia Stone',
		reportedBy: {
			id: '2',
			name: 'Amelia Stone',
			role: 'Security Officer'
		},
		createdAt: isoDateTime(-2),
		updatedAt: isoDateTime(-1),
		createdBy: '2',
		updatedBy: '2'
	},
	{
		id: 'DOB-002',
		customerId: 21,
		siteId: '1',
		siteName: 'Central Store',
		storeName: 'Central Store',
		storeNumber: 'CS-100',
		dateCommenced: isoDate(-120),
		date: isoDate(-1),
		time: '17:40',
		officerName: 'Jordan Clark',
		code: 'F',
		codeDescription: resolveCodeDescription('F'),
		details: 'Previously banned individual attempted entry. Person escorted off site and ban reiterated.',
		signature: 'Jordan Clark',
		reportedBy: {
			id: '3',
			name: 'Jordan Clark',
			role: 'Security Supervisor'
		},
		createdAt: isoDateTime(-26),
		updatedAt: isoDateTime(-25),
		createdBy: '3',
		updatedBy: '3'
	}
]

const generateStats = (entries: DailyOccurrenceEntry[]): DailyOccurrenceBookStats => {
	const current = new Date()
	const weekAgo = new Date(current)
	weekAgo.setDate(current.getDate() - 7)
	const monthAgo = new Date(current)
	monthAgo.setDate(current.getDate() - 30)

	const byCode = entries.reduce<Record<string, number>>((acc, entry) => {
		acc[entry.code] = (acc[entry.code] ?? 0) + 1
		return acc
	}, {})

	const byStore = entries.reduce<Record<string, number>>((acc, entry) => {
		const key = entry.storeNumber ?? 'unknown'
		acc[key] = (acc[key] ?? 0) + 1
		return acc
	}, {})

	return {
		totalEntries: entries.length,
		entriesThisWeek: entries.filter((entry) => new Date(entry.date) >= weekAgo).length,
		entriesThisMonth: entries.filter((entry) => new Date(entry.date) >= monthAgo).length,
		byCode,
		byStore
	}
}

const filterOccurrences = (
	entries: DailyOccurrenceEntry[],
	customerId: number,
	siteId?: string,
	filters: Record<string, string | null> = {}
) => {
	return entries.filter((entry) => {
		if (entry.customerId !== customerId) return false
		if (siteId && entry.siteId !== siteId) return false
		if (filters.dateFrom && entry.date < filters.dateFrom) return false
		if (filters.dateTo && entry.date > filters.dateTo) return false
		if (filters.storeNumber && entry.storeNumber !== filters.storeNumber) return false
		if (filters.storeName && !(entry.storeName ?? '').toLowerCase().includes(filters.storeName.toLowerCase())) return false
		if (filters.officerName && !entry.officerName.toLowerCase().includes(filters.officerName.toLowerCase())) return false
		if (filters.code) {
			const codes = filters.code.split(',')
			if (!codes.includes(entry.code)) return false
		}
		if (filters.search) {
			const haystack = [
				entry.details,
				entry.officerName,
				entry.storeName,
				entry.storeNumber,
				entry.codeDescription
			]
				.join(' ')
				.toLowerCase()
			if (!haystack.includes(filters.search.toLowerCase())) return false
		}
		return true
	})
}

const createErrorResponse = (status: number, message: string) =>
	HttpResponse.json({ success: false, error: message, data: null }, { status })

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const generateId = () => `DOB-${(occurrenceStore.length + 1).toString().padStart(3, '0')}`

export const dailyOccurrenceBookHandlers = [
	http.get('/api/customers/:customerId/daily-occurrence-book', async ({ request, params }) => {
		await delay(200)

		const customerId = parseInt(params.customerId as string)
		if (isNaN(customerId)) {
			return createErrorResponse(400, 'Invalid customer ID')
		}

		const url = new URL(request.url)
		const siteId = url.searchParams.get('siteId') || undefined
		const filters = {
			dateFrom: url.searchParams.get('dateFrom'),
			dateTo: url.searchParams.get('dateTo'),
			storeNumber: url.searchParams.get('storeNumber'),
			storeName: url.searchParams.get('storeName'),
			officerName: url.searchParams.get('officerName'),
			code: url.searchParams.get('code'),
			search: url.searchParams.get('search')
		}

		const filtered = filterOccurrences(occurrenceStore, customerId, siteId, filters)
		filtered.sort((a, b) => {
			const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
			if (dateDiff !== 0) return dateDiff
			return b.time.localeCompare(a.time)
		})

		const response: DailyOccurrenceBookResponse = {
			success: true,
			data: filtered,
			stats: generateStats(filtered),
			message: `Found ${filtered.length} entries`
		}

		return HttpResponse.json(response)
	}),

	http.post('/api/customers/:customerId/daily-occurrence-book', async ({ request, params }) => {
		await delay(200)

		const customerId = parseInt(params.customerId as string)
		if (isNaN(customerId)) {
			return createErrorResponse(400, 'Invalid customer ID')
		}

		const requestData: CreateOccurrenceRequest = await request.json()
		const requiredFields: (keyof CreateOccurrenceRequest)[] = [
			'storeName',
			'storeNumber',
			'date',
			'time',
			'officerName',
			'code',
			'details',
			'signature',
			'siteId'
		]

		const missing = requiredFields.filter((field) => !requestData[field])
		if (missing.length) {
			return createErrorResponse(400, `Missing required fields: ${missing.join(', ')}`)
		}

		const timestamp = new Date().toISOString()
		const newEntry: DailyOccurrenceEntry = {
			id: generateId(),
			customerId,
			siteId: requestData.siteId,
			siteName: requestData.storeName,
			storeName: requestData.storeName,
			storeNumber: requestData.storeNumber,
			dateCommenced: requestData.dateCommenced,
			date: requestData.date,
			time: requestData.time,
			officerName: requestData.officerName,
			code: requestData.code,
			codeDescription: resolveCodeDescription(requestData.code),
			crimeReportCompletedDate: requestData.crimeReportCompletedDate,
			crimeReportCompletedTime: requestData.crimeReportCompletedTime,
			details: requestData.details,
			signature: requestData.signature,
			reportedBy: {
				id: '2',
				name: 'Training Officer',
				role: 'Security Officer'
			},
			createdAt: timestamp,
			updatedAt: timestamp,
			createdBy: '2',
			updatedBy: '2'
		}

		occurrenceStore.unshift(newEntry)

		const response: SingleOccurrenceResponse = {
			success: true,
			data: newEntry,
			message: 'Occurrence created successfully'
		}

		return HttpResponse.json(response)
	}),

	http.get('/api/customers/:customerId/daily-occurrence-book/:occurrenceId', ({ params }) => {
		const customerId = parseInt(params.customerId as string)
		const occurrenceId = params.occurrenceId as string

		if (isNaN(customerId)) {
			return createErrorResponse(400, 'Invalid customer ID')
		}

		const occurrence = occurrenceStore.find(
			(entry) => entry.customerId === customerId && entry.id === occurrenceId
		)

		if (!occurrence) {
			return createErrorResponse(404, 'Occurrence not found')
		}

		const response: SingleOccurrenceResponse = {
			success: true,
			data: occurrence,
			message: 'Occurrence retrieved successfully'
		}

		return HttpResponse.json(response)
	}),

	http.put('/api/customers/:customerId/daily-occurrence-book/:occurrenceId', async ({ request, params }) => {
		await delay(200)

		const customerId = parseInt(params.customerId as string)
		const occurrenceId = params.occurrenceId as string

		if (isNaN(customerId)) {
			return createErrorResponse(400, 'Invalid customer ID')
		}

		const updateData: UpdateOccurrenceRequest = await request.json()

		const index = occurrenceStore.findIndex(
			(entry) => entry.customerId === customerId && entry.id === occurrenceId
		)

		if (index === -1) {
			return createErrorResponse(404, 'Occurrence not found')
		}

		const existing = occurrenceStore[index]
		const updated: DailyOccurrenceEntry = {
			...existing,
			...updateData,
			codeDescription: updateData.code ? resolveCodeDescription(updateData.code) : existing.codeDescription,
			updatedAt: new Date().toISOString(),
			updatedBy: '2'
		}

		occurrenceStore[index] = updated

		const response: SingleOccurrenceResponse = {
			success: true,
			data: updated,
			message: 'Occurrence updated successfully'
		}

		return HttpResponse.json(response)
	}),

	http.delete('/api/customers/:customerId/daily-occurrence-book/:occurrenceId', ({ params }) => {
		const customerId = parseInt(params.customerId as string)
		const occurrenceId = params.occurrenceId as string

		if (isNaN(customerId)) {
			return createErrorResponse(400, 'Invalid customer ID')
		}

		const index = occurrenceStore.findIndex(
			(entry) => entry.customerId === customerId && entry.id === occurrenceId
		)

		if (index === -1) {
			return createErrorResponse(404, 'Occurrence not found')
		}

		occurrenceStore.splice(index, 1)

		return HttpResponse.json({ success: true, message: 'Occurrence deleted successfully' })
	}),

	http.get('/api/customers/:customerId/daily-occurrence-book/stats', ({ request, params }) => {
		const customerId = parseInt(params.customerId as string)
		if (isNaN(customerId)) {
			return createErrorResponse(400, 'Invalid customer ID')
		}

		const url = new URL(request.url)
		const siteId = url.searchParams.get('siteId') || undefined

		const filtered = filterOccurrences(occurrenceStore, customerId, siteId, {})
		const response: OccurrenceStatsResponse = {
			success: true,
			data: generateStats(filtered),
			message: 'Statistics retrieved successfully'
		}

		return HttpResponse.json(response)
	})
]
