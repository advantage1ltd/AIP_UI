/**
 * Full-app resilience audit matrix used to track high-risk data-loading paths.
 */
export type PaginationMode = 'server' | 'client' | 'none'

export interface ResilienceAuditEntry {
	id: string
	routeOrScope: string
	filePath: string
	dataSource: string
	paginationMode: PaginationMode
	fetchCap: string
	clientAggregation: boolean
	refetchTriggers: string[]
	priority: 'critical' | 'high' | 'medium'
}

export const resilienceAuditMatrix: ResilienceAuditEntry[] = [
	{
		id: 'incident-report',
		routeOrScope: 'operations/incident-report',
		filePath: 'src/pages/operations/IncidentReportPage.tsx',
		dataSource: 'incidentsApi.getIncidents + incidentsApi.getIncidentStats',
		paginationMode: 'server',
		fetchCap: 'pageSize=10',
		clientAggregation: false,
		refetchTriggers: ['page', 'debounced-search', 'date filters', 'region/customer/site filters'],
		priority: 'critical',
	},
	{
		id: 'incident-graph',
		routeOrScope: 'customer/incident-graph',
		filePath: 'src/pages/customer/IncidentGraph.tsx',
		dataSource: 'incidentGraphService.fetchGraphData + fetchTypesData',
		paginationMode: 'none',
		fetchCap: 'summary endpoint only',
		clientAggregation: false,
		refetchTriggers: ['customer', 'date filters', 'region filter', 'officer type', 'graph type'],
		priority: 'critical',
	},
	{
		id: 'crime-intelligence',
		routeOrScope: 'customer/crime-intelligence',
		filePath: 'src/pages/customer/CustomerCrimeIntelligence.tsx',
		dataSource: 'crimeIntelligenceService.getInsights',
		paginationMode: 'none',
		fetchCap: 'summary endpoint only',
		clientAggregation: false,
		refetchTriggers: ['customer', 'site', 'region', 'date filters'],
		priority: 'critical',
	},
	{
		id: 'employee-registration',
		routeOrScope: 'administration/employee-registration',
		filePath: 'src/pages/administration/EmployeeRegistration.tsx',
		dataSource: 'employeeService.getEmployeesAsFrontendInterface',
		paginationMode: 'server',
		fetchCap: 'pageSize=50',
		clientAggregation: true,
		refetchTriggers: ['initial load', 'create', 'update', 'delete'],
		priority: 'high',
	},
	{
		id: 'crm-contacts',
		routeOrScope: 'crm/contacts',
		filePath: 'src/pages/crm/CRMContacts.tsx',
		dataSource: 'crmContactService.search',
		paginationMode: 'none',
		fetchCap: 'server search endpoint',
		clientAggregation: false,
		refetchTriggers: ['debounced search', 'status filter', 'create/update/delete'],
		priority: 'high',
	},
	{
		id: 'action-calendar',
		routeOrScope: 'action-calendar',
		filePath: 'src/pages/ActionCalendar.tsx',
		dataSource: 'actionCalendarService.getTasks + getStatistics',
		paginationMode: 'server',
		fetchCap: 'pageSize=200',
		clientAggregation: true,
		refetchTriggers: ['initial load', 'manual refresh', 'create/update/delete'],
		priority: 'high',
	},
	{
		id: 'customers-table',
		routeOrScope: 'administration/customer-setup',
		filePath: 'src/components/customer-setup/CustomersTable.tsx',
		dataSource: 'customerService.getAllCustomers',
		paginationMode: 'client',
		fetchCap: 'full customer list',
		clientAggregation: true,
		refetchTriggers: ['initial load', 'create/update/delete'],
		priority: 'medium',
	},
]
