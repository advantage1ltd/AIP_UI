import { http, HttpResponse } from 'msw'
import { BASE_API_URL } from '@/config/api'
import db from '../../db.json'
import { 
	getAuthFromRequest, 
	logAuthDetails, 
	createUnauthorizedResponse, 
	createForbiddenResponse,
	applyCustomerFilter,
	checkPermission
} from './authUtils'

// Mock incident data for 2025
const mockIncidents = [
	// Central England Coop (ID: 21) - 5 incidents
	{
		id: 'CEC001',
		customerId: 21,
		customerName: 'Central England Coop',
		siteName: 'Birmingham Central',
		siteId: 'CEC-BRM-01',
		regionId: 'CEC-WEST',
		regionName: 'West Midlands',
		location: 'Birmingham Central Store',
		officerName: 'John Smith',
		officerRole: 'Security Officer',
		officerType: 'Uniform',
		dutyManagerName: 'Sarah Johnson',
		dateOfIncident: '2025-01-15',
		timeOfIncident: '14:30',
		incidentType: 'Theft',
		type: 'Theft',
		actionCode: 'T',
		description: 'Shoplifting of high-value items',
		valueRecovered: 250.00,
		quantityRecovered: 5,
		stolenItems: [
			{ id: 'SI001', category: 'Electronics', description: 'Headphones', productName: 'Sony WH-1000XM4', cost: 50.00, quantity: 5, totalAmount: 250.00 }
		],
		status: 'resolved',
		policeInvolvement: true,
		crimeRefNumber: 'WMP-2025-001'
	},
	{
		id: 'CEC002',
		customerId: 21,
		customerName: 'Central England Coop',
		siteName: 'Coventry North',
		siteId: 'CEC-COV-01',
		regionId: 'CEC-WEST',
		regionName: 'West Midlands',
		location: 'Coventry North Store',
		officerName: 'Emma White',
		officerRole: 'Store Detective',
		officerType: 'Plain Clothes',
		dutyManagerName: 'Sarah Johnson',
		dateOfIncident: '2025-02-20',
		timeOfIncident: '16:45',
		incidentType: 'Violence',
		type: 'Violence',
		actionCode: 'V',
		description: 'Verbal abuse towards staff',
		valueRecovered: 0,
		quantityRecovered: 0,
		status: 'resolved',
		policeInvolvement: false
	},
	{
		id: 'CEC003',
		customerId: 21,
		customerName: 'Central England Coop',
		siteName: 'Leicester South',
		siteId: 'CEC-LEI-01',
		regionId: 'CEC-EAST',
		regionName: 'East Midlands',
		location: 'Leicester South Store',
		officerName: 'Mark Thompson',
		officerRole: 'Security Officer',
		officerType: 'Uniform',
		dutyManagerName: 'Sarah Johnson',
		dateOfIncident: '2025-03-05',
		timeOfIncident: '10:15',
		incidentType: 'Criminal Damage',
		type: 'Criminal Damage',
		actionCode: 'D',
		description: 'Damage to store front window',
		valueRecovered: 0,
		quantityRecovered: 0,
		status: 'resolved',
		policeInvolvement: true,
		crimeRefNumber: 'LEC-2025-045'
	},
	{
		id: 'CEC004',
		customerId: 21,
		customerName: 'Central England Coop',
		siteName: 'Nottingham East',
		siteId: 'CEC-NOT-01',
		regionId: 'CEC-EAST',
		regionName: 'East Midlands',
		location: 'Nottingham East Store',
		officerName: 'Chris Parker',
		officerRole: 'Store Detective',
		officerType: 'Plain Clothes',
		dutyManagerName: 'Sarah Johnson',
		dateOfIncident: '2025-03-15',
		timeOfIncident: '13:20',
		incidentType: 'Fraud',
		type: 'Fraud',
		actionCode: 'F',
		description: 'Attempted credit card fraud at self-checkout',
		valueRecovered: 145.75,
		quantityRecovered: 1,
		status: 'resolved',
		policeInvolvement: true,
		crimeRefNumber: 'NOT-2025-078'
	},
	{
		id: 'CEC005',
		customerId: 21,
		customerName: 'Central England Coop',
		siteName: 'Derby Central',
		siteId: 'CEC-DER-01',
		regionId: 'CEC-EAST',
		regionName: 'East Midlands',
		location: 'Derby Central Store',
		officerName: 'Alice Cooper',
		officerRole: 'Security Officer',
		officerType: 'Uniform',
		dutyManagerName: 'Sarah Johnson',
		dateOfIncident: '2025-03-28',
		timeOfIncident: '15:40',
		incidentType: 'Anti-Social Behavior',
		type: 'Anti-Social Behavior',
		actionCode: 'B',
		description: 'Group of youths causing disturbance',
		valueRecovered: 0,
		quantityRecovered: 0,
		status: 'resolved',
		policeInvolvement: false
	},
	// Midcounties COOP (ID: 23) - 5 incidents
	{
		id: 'MCC001',
		customerId: 23,
		customerName: 'Midcounties COOP',
		siteName: 'Oxford Central',
		siteId: 'MCC-OXF-01',
		regionId: 'MCC-SOUTH',
		regionName: 'South Region',
		location: 'Oxford Central Store',
		officerName: 'David Brown',
		officerRole: 'Security Officer',
		officerType: 'Uniform',
		dutyManagerName: 'Michael Clark',
		dateOfIncident: '2025-04-10',
		timeOfIncident: '11:20',
		incidentType: 'Theft',
		type: 'Theft',
		actionCode: 'T',
		description: 'Self-scan theft attempt',
		valueRecovered: 175.50,
		quantityRecovered: 8,
		stolenItems: [
			{ id: 'SI002', category: 'Groceries', description: 'Premium items', productName: 'Various', cost: 21.94, quantity: 8, totalAmount: 175.50 }
		],
		status: 'resolved',
		policeInvolvement: false
	},
	{
		id: 'MCC002',
		customerId: 23,
		customerName: 'Midcounties COOP',
		siteName: 'Swindon East',
		siteId: 'MCC-SWI-01',
		regionId: 'MCC-SOUTH',
		regionName: 'South Region',
		location: 'Swindon East Store',
		officerName: 'Lisa Taylor',
		officerRole: 'Store Detective',
		officerType: 'Plain Clothes',
		dutyManagerName: 'Michael Clark',
		dateOfIncident: '2025-04-15',
		timeOfIncident: '15:30',
		incidentType: 'Suspicious',
		type: 'Suspicious Activity',
		actionCode: 'S',
		description: 'Suspicious behavior around self-scan area',
		valueRecovered: 45.00,
		quantityRecovered: 3,
		status: 'resolved',
		policeInvolvement: false
	},
	{
		id: 'MCC003',
		customerId: 23,
		customerName: 'Midcounties COOP',
		siteName: 'Cheltenham North',
		siteId: 'MCC-CHE-01',
		regionId: 'MCC-WEST',
		regionName: 'West Region',
		location: 'Cheltenham North Store',
		officerName: 'Ryan Hughes',
		officerRole: 'Security Officer',
		officerType: 'Uniform',
		dutyManagerName: 'Michael Clark',
		dateOfIncident: '2025-04-22',
		timeOfIncident: '14:15',
		incidentType: 'Assault',
		type: 'Assault',
		actionCode: 'A',
		description: 'Physical altercation between customers',
		valueRecovered: 0,
		quantityRecovered: 0,
		status: 'resolved',
		policeInvolvement: true,
		crimeRefNumber: 'GLO-2025-112'
	},
	{
		id: 'MCC004',
		customerId: 23,
		customerName: 'Midcounties COOP',
		siteName: 'Gloucester Central',
		siteId: 'MCC-GLO-01',
		regionId: 'MCC-WEST',
		regionName: 'West Region',
		location: 'Gloucester Central Store',
		officerName: 'Paul Roberts',
		officerRole: 'Store Detective',
		officerType: 'Plain Clothes',
		dutyManagerName: 'Michael Clark',
		dateOfIncident: '2025-05-01',
		timeOfIncident: '12:45',
		incidentType: 'Theft',
		type: 'Theft',
		actionCode: 'T',
		description: 'Concealment of high-value items',
		valueRecovered: 320.00,
		quantityRecovered: 4,
		stolenItems: [
			{ id: 'SI003', category: 'Cosmetics', description: 'Premium beauty products', productName: 'Various', cost: 80.00, quantity: 4, totalAmount: 320.00 }
		],
		status: 'resolved',
		policeInvolvement: true,
		crimeRefNumber: 'GLO-2025-118'
	},
	{
		id: 'MCC005',
		customerId: 23,
		customerName: 'Midcounties COOP',
		siteName: 'Stroud Main',
		siteId: 'MCC-STR-01',
		regionId: 'MCC-WEST',
		regionName: 'West Region',
		location: 'Stroud Main Store',
		officerName: 'Helen Davies',
		officerRole: 'Security Officer',
		officerType: 'Uniform',
		dutyManagerName: 'Michael Clark',
		dateOfIncident: '2025-05-08',
		timeOfIncident: '16:30',
		incidentType: 'Criminal Damage',
		type: 'Criminal Damage',
		actionCode: 'D',
		description: 'Vandalism to store equipment',
		valueRecovered: 0,
		quantityRecovered: 0,
		status: 'resolved',
		policeInvolvement: true,
		crimeRefNumber: 'GLO-2025-125'
	},
	// Heart of England (ID: 22) - 4 incidents
	{
		id: 'HOE001',
		customerId: 22,
		customerName: 'Heart of England',
		siteName: 'Nuneaton Central',
		siteId: 'HOE-NUN-01',
		regionId: 'HOE-CENTRAL',
		regionName: 'Central Region',
		location: 'Nuneaton Central Store',
		officerName: 'James Wilson',
		officerRole: 'Security Officer',
		officerType: 'Uniform',
		dutyManagerName: 'Robert Lewis',
		dateOfIncident: '2025-05-12',
		timeOfIncident: '13:15',
		incidentType: 'Theft',
		type: 'Theft',
		actionCode: 'T',
		description: 'Organized theft attempt',
		valueRecovered: 420.00,
		quantityRecovered: 12,
		stolenItems: [
			{ id: 'SI004', category: 'Alcohol', description: 'Premium spirits', productName: 'Various', cost: 35.00, quantity: 12, totalAmount: 420.00 }
		],
		status: 'resolved',
		policeInvolvement: true,
		crimeRefNumber: 'WAR-2025-123'
	},
	{
		id: 'HOE002',
		customerId: 22,
		customerName: 'Heart of England',
		siteName: 'Rugby West',
		siteId: 'HOE-RUG-01',
		regionId: 'HOE-CENTRAL',
		regionName: 'Central Region',
		location: 'Rugby West Store',
		officerName: 'Sophie Martin',
		officerRole: 'Store Detective',
		officerType: 'Plain Clothes',
		dutyManagerName: 'Robert Lewis',
		dateOfIncident: '2025-05-20',
		timeOfIncident: '17:45',
		incidentType: 'Violence',
		type: 'Violence',
		actionCode: 'V',
		description: 'Aggressive behavior and threats to staff',
		valueRecovered: 0,
		quantityRecovered: 0,
		status: 'resolved',
		policeInvolvement: true,
		crimeRefNumber: 'WAR-2025-124'
	},
	{
		id: 'HOE003',
		customerId: 22,
		customerName: 'Heart of England',
		siteName: 'Leamington Central',
		siteId: 'HOE-LEA-01',
		regionId: 'HOE-SOUTH',
		regionName: 'South Region',
		location: 'Leamington Central Store',
		officerName: 'Tom Baker',
		officerRole: 'Security Officer',
		officerType: 'Uniform',
		dutyManagerName: 'Robert Lewis',
		dateOfIncident: '2025-06-01',
		timeOfIncident: '09:30',
		incidentType: 'Fraud',
		type: 'Fraud',
		actionCode: 'F',
		description: 'Counterfeit currency attempt',
		valueRecovered: 200.00,
		quantityRecovered: 1,
		status: 'resolved',
		policeInvolvement: true,
		crimeRefNumber: 'WAR-2025-130'
	},
	{
		id: 'HOE004',
		customerId: 22,
		customerName: 'Heart of England',
		siteName: 'Stratford Main',
		siteId: 'HOE-STR-01',
		regionId: 'HOE-SOUTH',
		regionName: 'South Region',
		location: 'Stratford Main Store',
		officerName: 'Lucy Chen',
		officerRole: 'Store Detective',
		officerType: 'Plain Clothes',
		dutyManagerName: 'Robert Lewis',
		dateOfIncident: '2025-06-15',
		timeOfIncident: '14:20',
		incidentType: 'Theft',
		type: 'Theft',
		actionCode: 'T',
		description: 'Multiple items concealed in bag',
		valueRecovered: 165.00,
		quantityRecovered: 6,
		stolenItems: [
			{ id: 'SI005', category: 'Health & Beauty', description: 'Fragrances', productName: 'Various', cost: 27.50, quantity: 6, totalAmount: 165.00 }
		],
		status: 'resolved',
		policeInvolvement: false
	}
]

// Helper function to get customer ID from request
const getCustomerId = (request: Request): number | null => {
	// First try to get from localStorage (like other services)
	try {
		const storedUser = localStorage.getItem('user')
		if (storedUser) {
			const userData = JSON.parse(storedUser)
			// For customer users, use customerId
			if (['CustomerSiteManager', 'CustomerHOManager'].includes(userData.role)) {
				return userData.customerId || userData.companyId
			}
			// For Advantage One users, check query param first, then default to null (show all)
			if (['AdvantageOneOfficer', 'AdvantageOneHOOfficer', 'Administrator'].includes(userData.role)) {
				const customerId = new URL(request.url).searchParams.get('customerId')
				return customerId ? parseInt(customerId) : null
			}
		}
	} catch (err) {
		console.error('Failed to parse user data from localStorage:', err)
	}
	
	// Fallback to X-Customer-Id header or query param
	const customerId = request.headers.get('X-Customer-Id') || new URL(request.url).searchParams.get('customerId')
	return customerId ? parseInt(customerId) : null
}

// Helper function to check if user is authorized to access incidents
const isAuthorizedForIncidents = (request: Request): boolean => {
	// Try to get user from localStorage (similar to how other services work)
	try {
		const storedUser = localStorage.getItem('user')
		const userRole = localStorage.getItem('userRole')
		
		console.log('🔍 [MSW] Stored user:', storedUser ? 'Present' : 'Missing')
		console.log('🔍 [MSW] User role from localStorage:', userRole)
		
		if (!storedUser || !userRole) {
			console.log('🔍 [MSW] No user data in localStorage')
			return false
		}
		
		const userData = JSON.parse(storedUser)
		console.log('🔍 [MSW] Parsed user data:', userData)
		
		// Administrator and AdvantageOne users can access all incidents
		if (['Administrator', 'AdvantageOneHOOfficer', 'AdvantageOneOfficer'].includes(userData.role)) {
			console.log('🔍 [MSW] User authorized as Administrator/AdvantageOne officer')
			return true
		}
		// Customer users need a valid customer ID
		if (['CustomerSiteManager', 'CustomerHOManager'].includes(userData.role)) {
			const hasCustomerId = !!(userData.customerId || userData.companyId)
			console.log('🔍 [MSW] Customer user, has customer ID:', hasCustomerId)
			return hasCustomerId
		}
		
		console.log('🔍 [MSW] User role not recognized:', userData.role)
		return false
		
	} catch (err) {
		console.error('🔍 [MSW] Failed to parse user data from localStorage:', err)
		return false
	}
}

// Enhanced helper function to filter incidents by customer with access control
const filterIncidentsByCustomer = (incidents: any[], customerId: number | null): any[] => {
	// If no customer ID provided, return all incidents (for Administrator access)
	if (!customerId) {
		return incidents.map(incident => standardizeIncident(incident))
	}
	
	// Only return incidents for the specific customer, and standardize them
	return incidents
		.filter(incident => incident.customerId === customerId)
		.map(incident => standardizeIncident(incident))
}

// Helper function to check customer access
const hasCustomerAccess = (request: Request, targetCustomerId: number): boolean => {
	const requestCustomerId = getCustomerId(request)
	return requestCustomerId === targetCustomerId
}

// Action code mapping for standardization
const actionCodeMapping: Record<string, string> = {
	'T': 'Theft',
	'V': 'Violence',
	'S': 'Suspicious Activity',
	'A': 'Assault',
	'D': 'Criminal Damage',
	'F': 'Fraud',
	'B': 'Anti-Social Behavior',
	'O': 'Other'
}

// Helper function to standardize incident data structure
const standardizeIncident = (incident: any) => {
	return {
		...incident,
		// Standardize date fields
		date: incident.date || incident.dateOfIncident || '',
		dateOfIncident: incident.date || incident.dateOfIncident || '',
		
		// Standardize value fields
		value: incident.value || incident.valueRecovered || incident.totalValueRecovered || 0,
		valueRecovered: incident.valueRecovered || incident.totalValueRecovered || incident.value || 0,
		totalValueRecovered: incident.totalValueRecovered || incident.valueRecovered || incident.value || 0,
		
		// Standardize location fields
		location: incident.location || incident.siteName || '',
		siteName: incident.siteName || incident.location || '',
		store: incident.store || incident.siteName || incident.location || '',
		
		// Standardize incident type fields
		incidentType: incident.incidentType || incident.type || actionCodeMapping[incident.actionCode] || 'Other',
		type: incident.type || incident.incidentType || actionCodeMapping[incident.actionCode] || 'Other',
		
		// Standardize officer fields
		officerName: incident.officerName || incident.assignedTo || '',
		assignedTo: incident.assignedTo || incident.officerName || '',
		
		// Ensure quantity field exists
		quantityRecovered: incident.quantityRecovered || 0
	}
}

export const incidentHandlers = [
	// Test handler to verify handlers are working - UPDATED WITH UNIFIED AUTH
	http.get(`${BASE_API_URL}/incidents/test`, async ({ request }) => {
		console.log('🔍 [MSW] === TEST HANDLER CALLED (UNIFIED AUTH) ===')
		
		// NEW: Use unified auth system
		const auth = getAuthFromRequest(request)
		logAuthDetails(request, auth, 'incidents/test')
		
		if (!auth.isAuthenticated) {
			return createUnauthorizedResponse(auth.errorMessage)
		}
		
		// NEW: Check permissions using unified system
		if (!checkPermission(auth, 'incidents', 'read')) {
			return createForbiddenResponse('Missing permission: incidents:read')
		}
		
		// NEW: Apply unified customer filtering
		const dbIncidents = db.dashboard?.incidents || []
		const { data: customerIncidents, effectiveCustomerId } = applyCustomerFilter(dbIncidents, auth)
		
		return HttpResponse.json({
			success: true,
			message: '✅ Unified auth system working',
			authDetails: {
				userRole: auth.user?.role,
				customerId: auth.customerId,
				effectiveCustomerId,
				hasGlobalAccess: auth.hasGlobalAccess,
				accessibleCustomers: auth.accessibleCustomerIds
			},
			dataStats: {
				totalIncidents: dbIncidents.length,
				customerIncidents: customerIncidents.length,
				sampleIncident: customerIncidents[0] || null
			}
		})
	}),

	// Get all incidents with customer filtering
	http.get(`${BASE_API_URL}/incidents`, async ({ request }) => {
		console.log('🔍 [MSW] === INCIDENTS LIST HANDLER CALLED ===')
		
		// Check if user is authorized to access incidents
		if (!isAuthorizedForIncidents(request)) {
			return HttpResponse.json({
				success: false,
				message: 'Unauthorized - Access denied'
			}, { status: 401 })
		}
		
		const customerId = getCustomerId(request)
		
		// Use database incidents instead of mockIncidents
		const dbIncidents = db.dashboard?.incidents || []
		const incidents = filterIncidentsByCustomer(dbIncidents, customerId)
		
		console.log('🔍 Found incidents for customer', customerId || 'ALL', ':', incidents.length)
		
		// Support pagination for the IncidentReportPage component
		const url = new URL(request.url)
		const page = parseInt(url.searchParams.get('page') || '1')
		const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
		const search = url.searchParams.get('search') || ''
		
		// Apply search filter if provided
		let filteredIncidents = incidents
		if (search) {
			const searchLower = search.toLowerCase()
			filteredIncidents = incidents.filter(incident => 
				incident.siteName?.toLowerCase().includes(searchLower) ||
				incident.customerName?.toLowerCase().includes(searchLower) ||
				incident.officerName?.toLowerCase().includes(searchLower) ||
				incident.incidentType?.toLowerCase().includes(searchLower) ||
				incident.description?.toLowerCase().includes(searchLower)
			)
		}
		
		// Calculate pagination
		const totalCount = filteredIncidents.length
		const totalPages = Math.ceil(totalCount / pageSize)
		const startIndex = (page - 1) * pageSize
		const endIndex = startIndex + pageSize
		const paginatedIncidents = filteredIncidents.slice(startIndex, endIndex)
		
		return HttpResponse.json({
			success: true,
			data: paginatedIncidents,
			pagination: {
				currentPage: page,
				totalPages,
				pageSize,
				totalCount,
				hasPrevious: page > 1,
				hasNext: page < totalPages
			}
		})
	}),

	// Get incident graph data with comprehensive filtering
	http.get(`${BASE_API_URL}/incidents/graph-data`, async ({ request }) => {
		console.log('🔍 [MSW] === GRAPH DATA HANDLER CALLED ===')
		
		// Check if user is authorized to access incidents
		if (!isAuthorizedForIncidents(request)) {
			console.error('🔍 [MSW] Unauthorized access to graph data')
			return HttpResponse.json({
				success: false,
				message: 'Unauthorized - Access denied'
			}, { status: 401 })
		}
		
		const customerId = getCustomerId(request)
		
		const url = new URL(request.url)
		const startDate = url.searchParams.get('startDate')
		const endDate = url.searchParams.get('endDate')
		const region = url.searchParams.get('region') || 'all'
		const officerType = url.searchParams.get('officerType') || 'all'
		const graphType = url.searchParams.get('graphType') || 'value'
		
		console.log('🔍 [MSW] Graph data request params:', { customerId, startDate, endDate, region, officerType, graphType })
		
		// Get incidents for this customer only
		const dbIncidents = db.dashboard?.incidents || []
		console.log('🔍 [MSW] Total incidents in DB:', dbIncidents.length)
		
		let incidents = filterIncidentsByCustomer(dbIncidents, customerId)
		console.log('🔍 [MSW] Incidents after customer filter:', incidents.length)

		// Apply additional filters
		if (startDate) {
			incidents = incidents.filter(i => (i.dateOfIncident || i.date) >= startDate)
			console.log('🔍 [MSW] Incidents after start date filter:', incidents.length)
		}
		if (endDate) {
			incidents = incidents.filter(i => (i.dateOfIncident || i.date) <= endDate)
			console.log('🔍 [MSW] Incidents after end date filter:', incidents.length)
		}
		if (region !== 'all') {
			incidents = incidents.filter(i => i.regionName.toLowerCase() === region.toLowerCase())
			console.log('🔍 [MSW] Incidents after region filter:', incidents.length)
		}
		if (officerType !== 'all') {
			incidents = incidents.filter(i => i.officerType.toLowerCase() === officerType.toLowerCase())
			console.log('🔍 [MSW] Incidents after officer type filter:', incidents.length)
		}

		// Aggregate for graph
		let graphData: any[] = []
		if (graphType === 'type') {
			const typeMap: Record<string, { type: string; count: number; code: string }> = {}
			incidents.forEach(i => {
				const code = i.actionCode
				const type = i.incidentType
				if (!typeMap[code]) {
					typeMap[code] = { type, count: 0, code }
				}
				typeMap[code].count += 1
			})
			graphData = Object.values(typeMap)
		} else {
			const locMap: Record<string, { location: string; value: number; quantity: number }> = {}
			incidents.forEach(i => {
				const loc = i.location
				if (!locMap[loc]) {
					locMap[loc] = { location: loc, value: 0, quantity: 0 }
				}
				locMap[loc].value += i.valueRecovered || 0
				locMap[loc].quantity += i.quantityRecovered || 0
			})
			graphData = Object.values(locMap)
		}

		// Calculate totals for this customer only
		const totalValue = incidents.reduce((sum, i) => sum + (i.valueRecovered || 0), 0)
		const totalQuantity = incidents.reduce((sum, i) => sum + (i.quantityRecovered || 0), 0)
		const totalIncidents = incidents.length

		console.log('🔍 [MSW] Final aggregated data:', { 
			incidentsCount: incidents.length, 
			graphDataLength: graphData.length, 
			totalValue, 
			totalQuantity, 
			totalIncidents,
			fullGraphData: graphData,
			sampleIncident: incidents[0]
		})

		return HttpResponse.json({
			success: true,
			data: {
				incidents: graphData,
				totals: {
					totalValue,
					totalQuantity,
					totalIncidents
				},
				filters: {
					customerId,
					region,
					officerType,
					graphType,
					startDate,
					endDate
				}
			}
		})
	}),

	// Get incident types summary with customer filtering
	http.get(`${BASE_API_URL}/incidents/types-summary`, async ({ request }) => {
		// Check if user is authorized to access incidents
		if (!isAuthorizedForIncidents(request)) {
			return HttpResponse.json({
				success: false,
				message: 'Unauthorized - Access denied'
			}, { status: 401 })
		}
		
		const customerId = getCustomerId(request)
		
		const url = new URL(request.url)
		const startDate = url.searchParams.get('startDate')
		const endDate = url.searchParams.get('endDate')
		const region = url.searchParams.get('region') || 'all'
		const officerType = url.searchParams.get('officerType') || 'all'

		// Get incidents for this customer only
		const dbIncidents = db.dashboard?.incidents || []
		let incidents = filterIncidentsByCustomer(dbIncidents, customerId)

		// Apply filters
		if (startDate) {
			incidents = incidents.filter(i => (i.dateOfIncident || i.date) >= startDate)
		}
		if (endDate) {
			incidents = incidents.filter(i => (i.dateOfIncident || i.date) <= endDate)
		}
		if (region !== 'all') {
			incidents = incidents.filter(i => i.regionName.toLowerCase() === region.toLowerCase())
		}
		if (officerType !== 'all') {
			incidents = incidents.filter(i => i.officerType.toLowerCase() === officerType.toLowerCase())
		}

		// Group by type for this customer only
		const typeMap: Record<string, { code: string; type: string; count: number }> = {}
		incidents.forEach(i => {
			const code = i.actionCode
			const type = i.incidentType
			if (!typeMap[code]) {
				typeMap[code] = { code, type, count: 0 }
			}
			typeMap[code].count += 1
		})

		return HttpResponse.json({
			success: true,
			data: Object.values(typeMap)
		})
	}),

	// Create new incident
	http.post(`${BASE_API_URL}/incidents`, async ({ request }) => {
		console.log('🔍 [MSW] === CREATE INCIDENT HANDLER CALLED ===')
		
		// Check if user is authorized to access incidents
		if (!isAuthorizedForIncidents(request)) {
			return HttpResponse.json({
				success: false,
				message: 'Unauthorized - Access denied'
			}, { status: 401 })
		}
		
		try {
			const newIncident = await request.json() as any
			const incidentId = `INC-${Date.now()}`
			
			// Add standard fields
			const incidentToCreate = {
				...newIncident,
				id: incidentId,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			}
			
			// In a real app, this would save to the database
			console.log('🔍 [MSW] Creating incident:', incidentToCreate)
			
			return HttpResponse.json({
				success: true,
				data: incidentToCreate,
				message: 'Incident created successfully'
			}, { status: 201 })
		} catch (error) {
			return HttpResponse.json({
				success: false,
				message: 'Failed to create incident'
			}, { status: 400 })
		}
	}),

	// Update existing incident
	http.put(`${BASE_API_URL}/incidents/:id`, async ({ request, params }) => {
		console.log('🔍 [MSW] === UPDATE INCIDENT HANDLER CALLED ===')
		
		// Check if user is authorized to access incidents
		if (!isAuthorizedForIncidents(request)) {
			return HttpResponse.json({
				success: false,
				message: 'Unauthorized - Access denied'
			}, { status: 401 })
		}
		
		try {
			const { id } = params
			const updatedIncident = await request.json() as any
			
			// Add standard fields
			const incidentToUpdate = {
				...updatedIncident,
				id,
				updatedAt: new Date().toISOString()
			}
			
			// In a real app, this would update the database
			console.log('🔍 [MSW] Updating incident:', id, incidentToUpdate)
			
			return HttpResponse.json({
				success: true,
				data: incidentToUpdate,
				message: 'Incident updated successfully'
			})
		} catch (error) {
			return HttpResponse.json({
				success: false,
				message: 'Failed to update incident'
			}, { status: 400 })
		}
	}),

	// Delete incident
	http.delete(`${BASE_API_URL}/incidents/:id`, async ({ request, params }) => {
		console.log('🔍 [MSW] === DELETE INCIDENT HANDLER CALLED ===')
		
		// Check if user is authorized to access incidents
		if (!isAuthorizedForIncidents(request)) {
			return HttpResponse.json({
				success: false,
				message: 'Unauthorized - Access denied'
			}, { status: 401 })
		}
		
		const { id } = params
		
		// In a real app, this would delete from the database
		console.log('🔍 [MSW] Deleting incident:', id)
		
		return HttpResponse.json({
			success: true,
			message: 'Incident deleted successfully'
		})
	}),

	// Get available regions for a customer
	http.get(`${BASE_API_URL}/incidents/regions`, async ({ request }) => {
		console.log('🔍 [MSW] === REGIONS HANDLER CALLED ===')
		
		// Check if user is authorized to access incidents
		if (!isAuthorizedForIncidents(request)) {
			return HttpResponse.json({
				success: false,
				message: 'Unauthorized - Access denied'
			}, { status: 401 })
		}
		
		const customerId = getCustomerId(request)
		
		// Get regions for this customer only
		const dbIncidents = db.dashboard?.incidents || []
		const incidents = filterIncidentsByCustomer(dbIncidents, customerId)
		const regions = [...new Set(incidents.map(i => i.regionName))]

		return HttpResponse.json({
			success: true,
			data: regions
		})
	}),

	// Get incident by ID with customer access check
	http.get(`${BASE_API_URL}/incidents/:id`, async ({ params, request }) => {
		const { id } = params
		const customerId = getCustomerId(request)
		
		if (!customerId) {
			return HttpResponse.json({
				success: false,
				message: 'Unauthorized - Customer ID required'
			}, { status: 401 })
		}
		
		const dbIncidents = db.dashboard?.incidents || []
		const incident = dbIncidents.find(inc => inc.id === id)
		
		if (!incident) {
			return HttpResponse.json({
				success: false,
				message: 'Incident not found'
			}, { status: 404 })
		}
		
		// Check if incident belongs to the requesting customer
		if (incident.customerId !== customerId) {
			return HttpResponse.json({
				success: false,
				message: 'Access denied - Incident belongs to different customer'
			}, { status: 403 })
		}
		
		return HttpResponse.json({
			success: true,
			data: incident
		})
	})
]