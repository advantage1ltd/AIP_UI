import { CUSTOMER_PAGES } from '@/config/customerPages';
import { ApiResponse, api } from '@/config/api';
import { PAGE_DEFINITIONS, type PageDefinition } from '@/config/navigation/pageDefinitions';

export interface PageAccess {
	id: string;
	title: string;
	path: string;
	category?: string;
	description?: string;
	sortOrder?: number;
	dbId?: number;
}

export interface PageAccessSettings {
	pageAccessByRole: Record<string, string[]>;
	availablePages: PageAccess[];
}

interface BackendPageAccessDto {
	id: number;
	pageId: string;
	title: string;
	path: string;
	category?: string;
	description?: string;
	isActive: boolean;
	sortOrder: number;
}

interface BackendPageAccessSettingsDto {
	pageAccessByRole: Record<string, string[]>;
	availablePages: BackendPageAccessDto[];
}

const ensureLeadingSlash = (path: string): string => {
	if (!path) {
		return '/';
	}
	return path.startsWith('/') ? path : `/${path}`;
};

const normalizePage = (page: BackendPageAccessDto): PageAccess => ({
	id: page.pageId || page.id.toString(),
	title: page.title,
	path: ensureLeadingSlash(page.path),
	category: page.category,
	description: page.description,
	sortOrder: page.sortOrder,
	dbId: page.id
});

const normalizeSettings = (dto: BackendPageAccessSettingsDto): PageAccessSettings => ({
	pageAccessByRole: dto.pageAccessByRole || {},
	availablePages: dto.availablePages?.map(normalizePage) ?? []
});

const buildDefaultPages = (): PageAccess[] => [
	{ id: 'dashboard', title: 'Dashboard', path: '/dashboard' },
	{ id: 'action-calendar', title: 'Action Calendar', path: '/action-calendar' },
	{ id: 'profile', title: 'Profile', path: '/profile' },
	{ id: 'settings', title: 'Settings', path: '/settings' },
	{ id: 'user-setup', title: 'User Setup', path: '/administration/user-setup' },
	{ id: 'employee-registration', title: 'Employee Registration', path: '/administration/employee-registration' },
	{ id: 'customer-setup', title: 'Customer Setup', path: '/administration/customer-setup' },
	{ id: 'customer-page-settings', title: 'Customer Page Settings', path: '/administration/customer-page-settings' },
	{ id: 'stock-control', title: 'Stock Control', path: '/administration/stock-control' },
	{ id: 'incident-report', title: 'Incident Report', path: '/operations/incident-report' },
	{ id: 'mystery-shopper', title: 'Mystery Shopper', path: '/operations/mystery-shopper' },
	{ id: 'site-visit', title: 'Site Visit', path: '/operations/site-visit' },
	{ id: 'holiday-requests', title: 'Holiday Requests', path: '/operations/holiday-requests' },
	{ id: 'bank-holiday', title: 'Bank Holiday', path: '/operations/bank-holiday' },
	{ id: 'customer-satisfaction', title: 'Customer Satisfaction', path: '/operations/customer-satisfaction' },
	{ id: 'safe-duress-words', title: 'Safe Duress Words', path: '/operations/safe-duress-words' },
	{ id: 'officer-support', title: 'Officer Support', path: '/operations/officer-support' },
	{ id: 'officer-expenses', title: 'Officer Expenses', path: '/operations/officer-expenses' },
	{ id: 'uniform-equipment', title: 'Uniform & Equipment', path: '/employee/uniform-equipment' },
	{ id: 'disciplinary', title: 'Disciplinary', path: '/employee/disciplinary' },
	{ id: 'diary', title: 'Diary', path: '/employee/diary' },
	{ id: 'customer-reporting', title: 'Customer Reporting', path: '/management/customer-reporting' },
	{ id: 'manager-support', title: 'Manager Support', path: '/management/manager-support' },
	{ id: 'incidents-report', title: 'Incidents Report', path: '/management/incidents-report' },
	{ id: 'officer-performance', title: 'Officer Performance', path: '/management/officer-performance' },
	{ id: 'contract-renewal', title: 'Contract Renewal', path: '/compliance/contract-renewal' },
	{ id: 'password-register', title: 'Password Register', path: '/compliance/password-register' },
	{ id: 'asset-register', title: 'Asset Register', path: '/compliance/asset-register' },
	{ id: 'vetting', title: 'Vetting', path: '/recruitment/vetting' },
	{ id: 'cbt', title: 'CBT', path: '/recruitment/cbt' },
	{ id: 'take-test', title: 'Take Test', path: '/recruitment/take-test' },
	{ id: 'crm-dashboard', title: 'CRM Dashboard', path: '/crm/dashboard' },
	{ id: 'crm-contacts', title: 'CRM Contacts', path: '/crm/contacts' },
	{ id: 'crm-leads', title: 'CRM Leads', path: '/crm/leads' },
	{ id: 'crm-deals', title: 'CRM Deals', path: '/crm/deals' },
	{ id: 'crm-pipeline', title: 'CRM Pipeline', path: '/crm/pipeline' },
	{ id: 'crm-tasks', title: 'CRM Tasks', path: '/crm/tasks' },
	{ id: 'daily-activity-report', title: 'Daily Activity Report', path: '/customer/daily-activity-report' },
	{ id: 'incident-graph', title: 'Incident Graph', path: '/customer/incident-graph' },
	{ id: 'customer-incident-report', title: 'Customer Incident Report', path: '/customer/incident-report' },
	{ id: 'satisfaction-reports', title: 'Satisfaction Reports', path: '/customer/satisfaction-report' },
	{ id: 'be-safe-be-secure-graph', title: 'Daily Activity Graphs', path: '/customer/be-safe-be-secure' },
	{ id: 'daily-occurrence-book', title: 'Daily Occurrence Book (DOB)', path: '/customer/daily-occurrence-book' },
	{ id: 'customer-officer-support', title: 'Customer Officer Support', path: '/customer/officer-support' },
	{ id: 'customer-views-config', title: 'Customer Views Config', path: '/customer/views-config' },
	{ id: 'customer-mystery-shopper-report', title: 'Mystery Shopper Report', path: '/customer/mystery-shopper-report' },
	{ id: 'customer-site-visit-reports', title: 'Site Visit Reports', path: '/customer/site-visit-reports' },
	{ id: 'customer-crime-intelligence', title: 'Crime Intelligence', path: '/customer/crime-intelligence' },
	...Object.values(CUSTOMER_PAGES).map(page => ({
		id: page.id,
		title: page.title,
		path: ensureLeadingSlash(page.path)
	}))
];

const buildDefaultSettings = (): PageAccessSettings => {
	const availablePages = buildDefaultPages();
	return {
		pageAccessByRole: {
			Administrator: availablePages.map(page => page.id),
			AdvantageOneHOOfficer: [
				'dashboard', 'action-calendar', 'profile',
				'user-setup', 'employee-registration', 'customer-setup', 'customer-page-settings', 'stock-control',
				'incident-report', 'mystery-shopper', 'site-visit', 'holiday-requests',
				'bank-holiday', 'customer-satisfaction', 'safe-duress-words',
				'officer-support', 'officer-expenses', 'uniform-equipment', 'disciplinary',
				'diary', 'customer-reporting', 'manager-support', 'incidents-report',
				'officer-performance', 'contract-renewal', 'password-register', 'asset-register',
				'vetting', 'cbt', 'take-test', 'crm-dashboard', 'crm-contacts',
				'crm-leads', 'crm-deals', 'crm-pipeline', 'crm-tasks',
				'customer-mystery-shopper-report', 'customer-site-visit-reports', 'customer-crime-intelligence'
			],
			AdvantageOneOfficer: [
				'dashboard', 'action-calendar', 'profile',
				'incident-report', 'mystery-shopper', 'site-visit', 'holiday-requests',
				'bank-holiday', 'customer-satisfaction', 'safe-duress-words',
				'officer-support', 'officer-expenses', 'uniform-equipment', 'disciplinary',
				'diary', 'customer-reporting', 'manager-support', 'incidents-report',
				'officer-performance', 'contract-renewal', 'password-register', 'asset-register',
				'vetting', 'cbt', 'take-test', 'crm-dashboard', 'crm-contacts',
				'crm-leads', 'crm-deals', 'crm-pipeline', 'crm-tasks',
				'daily-activity-report', 'incident-graph', 'customer-incident-report',
				'satisfaction-reports', 'be-safe-be-secure-graph', 'daily-occurrence-book',
				'customer-views-config', 'customer-crime-intelligence'
			],
			CustomerHOManager: [
				'dashboard', 'action-calendar', 'profile',
				'customer-reporting', 'customer-views-config', 'customer-incident-report',
				'satisfaction-reports', 'be-safe-be-secure-graph',
				'daily-activity-report', 'incident-graph', 'customer-crime-intelligence',
				'customer-officer-support', 'daily-occurrence-book'
			],
			CustomerSiteManager: [
				'dashboard', 'action-calendar', 'profile',
				'customer-reporting', 'customer-views-config', 'customer-incident-report',
				'satisfaction-reports', 'be-safe-be-secure-graph',
				'daily-activity-report', 'incident-graph', 'customer-crime-intelligence',
				'customer-officer-support', 'daily-occurrence-book'
			]
		},
		availablePages
	};
};

export const pageAccessApi = {
	saveSettings: async (pageAccessByRole: Record<string, string[]>): Promise<PageAccessSettings> => {
		try {
			const response = await api.put<ApiResponse<BackendPageAccessSettingsDto>>(
				'/PageAccess/settings',
				{ pageAccessByRole }
			);
			if (response.data?.data) {
				return normalizeSettings(response.data.data);
			}
		} catch (error) {
			console.error('❌ [PageAccess API] Failed to save settings', error);
			throw error;
		}
		return buildDefaultSettings();
	},

	getSettings: async (): Promise<PageAccessSettings> => {
		try {
			const response = await api.get<ApiResponse<BackendPageAccessSettingsDto>>('/PageAccess/settings');
			if (response.data?.data) {
				return normalizeSettings(response.data.data);
			}
		} catch (error) {
			console.warn('❌ [PageAccess API] Request failed, using default settings:', error);
		}
		return buildDefaultSettings();
	},

	syncPages: async (pageDefinitions?: PageDefinition[]): Promise<{ created: number; updated: number; total: number; message: string }> => {
		try {
			const pagesToSync = pageDefinitions || PAGE_DEFINITIONS;
			
			// Convert PageDefinition to backend format
			const syncRequest = {
				pages: pagesToSync.map(def => ({
					pageId: def.pageId,
					title: def.title,
					path: def.path,
					category: def.category,
					description: def.description,
					sortOrder: def.sortOrder
				}))
			};

			const response = await api.post<ApiResponse<{ created: number; updated: number; total: number; message: string }>>(
				'/PageAccess/sync-pages',
				syncRequest
			);

			if (response.data?.data) {
				console.log('✅ [PageAccess API] Pages synced successfully:', response.data.data);
				return response.data.data;
			}

			throw new Error('Invalid response from sync endpoint');
		} catch (error) {
			console.error('❌ [PageAccess API] Failed to sync pages:', error);
			throw error;
		}
	}
};