/**
 * Page access settings client for `/PageAccess` (role → page id mappings).
 * Normalizes legacy role keys and numeric database ids to stable `pageId` strings used by routing and guards.
 * Falls back to in-app catalog defaults when the API is unavailable or omits inactive pages.
 * Flow: fetch settings → harmonize roles and page ids → merge with navigation catalog for guards and admin UI.
 */
import { CUSTOMER_PAGES } from '@/config/customerPages';
import { ApiResponse, api, isBackendUnavailableError } from '@/config/api';
import { PAGE_DEFINITIONS, type PageDefinition } from '@/config/navigation/pageDefinitions';
import { harmonizeRole, mergePageAccessByCanonicalRoles, type UserRole } from '@/utils/roles';
import { logger } from '@/utils/logger'

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

interface BackendSyncPagesResult {
	created: number;
	updated: number;
	total: number;
	message: string;
}

/** CamelCase (`ApiResponse`) and PascalCase (.NET) envelopes. */
type FlexibleEnvelope<T> = {
	data?: T;
	Data?: T;
	success?: boolean;
	Success?: boolean;
	message?: string;
	Message?: string;
};

const unpackEnvelope = <T,>(
	raw: FlexibleEnvelope<T> | undefined
): { payload: T | undefined; ok: boolean; message?: string } => {
	if (!raw) return { payload: undefined, ok: false };
	const payload = raw.data ?? raw.Data;
	const ok = raw.success ?? raw.Success ?? false;
	const message = raw.message ?? raw.Message;
	return { payload, ok, message };
};

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

// Map any persisted role key (legacy included) to a canonical bucket key.
const normalizeRoleKey = (roleKey: string): UserRole => harmonizeRole(roleKey);

const normalizeSettings = (dto: BackendPageAccessSettingsDto): PageAccessSettings => {
	// First, normalize all pages to create a mapping from dbId to pageId
	const normalizedPages = dto.availablePages?.map(normalizePage) ?? [];
	
	// Create a mapping from database ID (number) to pageId (string)
	const dbIdToPageIdMap = new Map<number, string>();
	// Also create a mapping from numeric string to pageId
	const numericStringToPageIdMap = new Map<string, string>();
	
	normalizedPages.forEach(page => {
		if (page.dbId !== undefined) {
			dbIdToPageIdMap.set(page.dbId, page.id);
			numericStringToPageIdMap.set(page.dbId.toString(), page.id);
		}
	});
	
	// Helper function to convert a page identifier (numeric ID or pageId string) to pageId string
	const convertToPageId = (identifier: string | number): string => {
		// If it's already a non-numeric string (pageId), return as-is
		if (typeof identifier === 'string' && isNaN(Number(identifier))) {
			return identifier;
		}
		
		// Try to find by numeric ID
		const numId = typeof identifier === 'number' ? identifier : Number(identifier);
		if (!isNaN(numId) && dbIdToPageIdMap.has(numId)) {
			return dbIdToPageIdMap.get(numId)!;
		}
		
		// Try to find by numeric string
		const numStr = String(identifier);
		if (numericStringToPageIdMap.has(numStr)) {
			return numericStringToPageIdMap.get(numStr)!;
		}
		
		// If not found in mapping, return as string (might be a pageId already)
		return String(identifier);
	};
	
	// Normalize role keys and convert numeric IDs to pageId strings
	const normalizedPageAccessByRole: Record<string, string[]> = {};
	if (dto.pageAccessByRole) {
		for (const [roleKey, pageIds] of Object.entries(dto.pageAccessByRole)) {
			const normalizedKey = normalizeRoleKey(roleKey);
			// Convert all page IDs (which might be numeric database IDs) to pageId strings
			const convertedPageIds = pageIds.map(convertToPageId);
			const existingPages = normalizedPageAccessByRole[normalizedKey] ?? [];
			normalizedPageAccessByRole[normalizedKey] = Array.from(new Set([...existingPages, ...convertedPageIds]));
			
			// Log conversion for debugging (only in dev mode)
			if (import.meta.env.DEV && pageIds.length > 0) {
				const hasNumericIds = pageIds.some(id => !isNaN(Number(id)) && isFinite(Number(id)));
				if (hasNumericIds && normalizedKey === 'securityofficer') {
					logger.debug(`[PageAccess API] Converted ${roleKey} page IDs`);
					logger.debug('📊 Conversion Summary:', {
						total: pageIds.length,
						hasNumericIds,
						hasCustomerIncidentReport: convertedPageIds.includes('customer-incident-report')
					});
					logger.debug('📋 All Original IDs:', pageIds);
					logger.debug('📋 All Converted IDs:', convertedPageIds);
					logger.debug('🔍 Conversion Examples (first 10):', 
						pageIds.slice(0, 10).map((original, idx) => ({
							original,
							converted: convertedPageIds[idx],
							changed: original !== convertedPageIds[idx]
						}))
					);
					
					// Check for specific customer pages
					const customerPages = ['customer-incident-report', 'customer-incident-graph', 'customer-satisfaction-report'];
					customerPages.forEach(pageId => {
						const index = convertedPageIds.indexOf(pageId);
						const originalValue = index >= 0 ? pageIds[index] : 'NOT FOUND';
						logger.debug(`🔍 ${pageId}:`, {
							found: index >= 0,
							index,
							originalValue,
							convertedValue: index >= 0 ? convertedPageIds[index] : 'N/A'
						});
					});
				}
			}
		}
	}
	
	return {
		pageAccessByRole: mergePageAccessByCanonicalRoles(normalizedPageAccessByRole),
		availablePages: mergeAvailablePagesWithFallbackDefinitions(normalizedPages)
	};
};

const buildDefaultPages = (): PageAccess[] => {
	const basePages: PageAccess[] = [
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
		{ id: 'management-customer-reporting', title: 'Customer Reporting', path: '/management/customer-reporting' },
		{ id: 'manager-support', title: 'Manager Support', path: '/management/manager-support' },
		{ id: 'officer-performance', title: 'Officer Performance', path: '/management/officer-performance' },
		{ id: 'contract-renewal', title: 'Contract Renewal', path: '/compliance/contract-renewal' },
		{ id: 'password-register', title: 'Password Register', path: '/compliance/password-register' },
		{ id: 'asset-register', title: 'Asset Register', path: '/compliance/asset-register' },
		{ id: 'vetting', title: 'Vetting', path: '/recruitment/vetting' },
		{ id: 'cbt', title: 'CBT', path: '/recruitment/cbt' },
		{ id: 'take-test', title: 'Take Test', path: '/recruitment/take-test' },
		{ id: 'crm-dashboard', title: 'CRM Dashboard', path: '/crm/dashboard' },
		{ id: 'crm-contacts', title: 'CRM Contacts', path: '/crm/contacts' },
		{ id: 'crm-pipeline', title: 'Sales Pipeline', path: '/crm/pipeline' },
		{ id: 'customer-views-config', title: 'Customer Views Config', path: '/customer/views-config' },
		{ id: 'customer-crime-intelligence', title: 'Crime Intelligence', path: '/customer/crime-intelligence' },
	];

	const customerPages = Object.values(CUSTOMER_PAGES).map(page => ({
		id: page.id,
		title: page.title,
		path: ensureLeadingSlash(page.path),
		category: page.category,
		description: page.description
	}));

	const pageMap = new Map<string, PageAccess>();
	[...basePages, ...customerPages].forEach(page => {
		pageMap.set(page.id, page);
	});

	return Array.from(pageMap.values());
};

/**
 * API settings only return active PageAccess rows. If a page id is granted in role mappings but missing from that list,
 * hasAccess() denies the route because it cannot resolve path ↔ id. Merge catalog defaults for any missing ids.
 */
const mergeAvailablePagesWithFallbackDefinitions = (apiPages: PageAccess[]): PageAccess[] => {
	const defaults = buildDefaultPages()
	const seenIds = new Set(apiPages.map((p) => p.id.toLowerCase()))
	const merged = [...apiPages]
	for (const def of defaults) {
		const key = def.id.toLowerCase()
		if (!seenIds.has(key)) {
			merged.push(def)
			seenIds.add(key)
		}
	}
	return merged
}

const buildDefaultSettings = (): PageAccessSettings => {
	const availablePages = buildDefaultPages();
	return {
		pageAccessByRole: {
			administrator: availablePages.map(page => page.id),
			manager: [
				'dashboard', 'action-calendar', 'profile',
				'user-setup', 'employee-registration', 'customer-setup', 'customer-page-settings', 'stock-control',
				'incident-report', 'site-visit', 'holiday-requests',
				'bank-holiday', 'customer-satisfaction', 'safe-duress-words',
				'officer-support', 'officer-expenses', 'uniform-equipment', 'disciplinary',
				'diary', 'manager-support',
				'officer-performance', 'contract-renewal', 'password-register', 'asset-register',
				'vetting', 'cbt', 'take-test', 'crm-dashboard', 'crm-contacts',
				'crm-pipeline',
				'customer-site-visit-reports', 'customer-crime-intelligence'
			],
			securityofficer: [
				'dashboard', 'action-calendar', 'profile',
				'incident-report', 'site-visit', 'holiday-requests',
				'bank-holiday', 'customer-satisfaction', 'safe-duress-words',
				'officer-support', 'officer-expenses', 'uniform-equipment', 'disciplinary',
				'diary', 'management-customer-reporting', 'manager-support',
				'officer-performance', 'contract-renewal', 'password-register', 'asset-register',
				'vetting', 'cbt', 'take-test',
				'customer-daily-activity-report', 'customer-incident-graph', 'customer-incident-report',
				'customer-satisfaction-report', 'customer-be-safe-be-secure', 'daily-occurrence-book',
				'customer-officer-support', 'customer-views-config', 'customer-crime-intelligence',
				'customer-site-visit-reports'
			],
			customer: [
				'dashboard', 'action-calendar', 'profile',
				'management-customer-reporting', 'customer-views-config', 'customer-incident-report',
				'customer-satisfaction-report', 'customer-be-safe-be-secure',
				'customer-daily-activity-report', 'customer-incident-graph', 'customer-crime-intelligence',
				'customer-officer-support', 'daily-occurrence-book'
			]
		},
		availablePages
	};
};

/** Admin page-access settings: load, save role mappings, and sync the page catalog with the backend. */
export const pageAccessApi = {
	saveSettings: async (pageAccessByRole: Record<string, string[]>, availablePages: PageAccess[] = []): Promise<PageAccessSettings> => {
		try {
			// Keep using PageIds (not Titles) for reliability and consistency
			// PageIds are unique identifiers that won't change, while Titles might vary
			// The backend accepts both, but PageIds are more reliable
			const mergedByRole = mergePageAccessByCanonicalRoles(pageAccessByRole);

			// Log what we're sending
			const roleCount = Object.keys(mergedByRole).length;
			const totalPages = Object.values(mergedByRole).reduce((sum, pages) => sum + pages.length, 0);
			logger.debug(`💾 [PageAccess API] Saving settings: ${roleCount} roles, ${totalPages} total page assignments (using PageIds)`);
			
			// Log sample of what's being sent for debugging
			if (import.meta.env.DEV) {
				const sampleRole = Object.keys(mergedByRole)[0];
				if (sampleRole && mergedByRole[sampleRole as UserRole]) {
					const samplePages = mergedByRole[sampleRole as UserRole];
					logger.debug(`💾 [PageAccess API] Sample - ${sampleRole}: ${samplePages.slice(0, 5).join(', ')}${samplePages.length > 5 ? '...' : ''}`);
				}
				
				// Log full payload for Customer Reporting debugging
				const officerPages = mergedByRole.securityofficer;
				if (officerPages?.length) {
					const hasCustomerReporting = officerPages.some(id => 
						id === 'management-customer-reporting' || id.includes('customer-reporting')
					);
					if (hasCustomerReporting) {
						logger.debug(`🔍 [PageAccess API] securityofficer has Customer Reporting in payload:`, 
							officerPages.filter(id => 
								id === 'management-customer-reporting' || id.includes('customer-reporting')
							)
						);
					}
				}
			}
			
			logger.debug(`💾 [PageAccess API] Making PUT request to /PageAccess/settings`);
			const response = await api.put<ApiResponse<BackendPageAccessSettingsDto>>(
				'/PageAccess/settings',
				{ pageAccessByRole: mergedByRole }
			);
			
			const apiResponse = response.data as FlexibleEnvelope<BackendPageAccessSettingsDto>;
			const { payload: responseData, ok: isSuccess } = unpackEnvelope(apiResponse);
			
			logger.debug(`💾 [PageAccess API] Received response:`, {
				status: response.status,
				hasData: !!responseData,
				success: isSuccess
			});
			
			if (responseData && isSuccess) {
				const savedRoleCount = Object.keys(responseData.pageAccessByRole).length;
				const savedTotalPages = Object.values(responseData.pageAccessByRole).reduce((sum, pages) => sum + pages.length, 0);
				logger.debug(`✅ [PageAccess API] Settings saved successfully: ${savedRoleCount} roles, ${savedTotalPages} total page assignments`);
				return normalizeSettings(responseData);
			}
			
			logger.debug('⚠️ [PageAccess API] Save response missing data field');
		} catch (error: unknown) {
			const errorPayload = error as {
				message?: string;
				response?: { data?: unknown; status?: number; statusText?: string };
			};
			logger.error('[PageAccess API] Failed to save settings', {
				status: errorPayload?.response?.status,
				message: errorPayload?.message,
			});
			throw error;
		}
		throw new Error('Failed to save page access settings');
	},

	getSettings: async (): Promise<PageAccessSettings> => {
		try {
			const response = await api.get<ApiResponse<BackendPageAccessSettingsDto>>('/PageAccess/settings');
			
			const apiResponse = response.data as FlexibleEnvelope<BackendPageAccessSettingsDto>;
			const { payload: responseData, ok: isSuccess, message: envelopeMessage } = unpackEnvelope(apiResponse);
			
			if (isSuccess && responseData) {
				const normalized = normalizeSettings(responseData);
				
				// Log if we're getting defaults from backend (check for default customer pages in officer role)
				if (import.meta.env.DEV) {
					const officerPages = normalized.pageAccessByRole['securityofficer'] || [];
					const hasDefaultCustomerPages = [
						'customer-incident-report',
						'customer-incident-graph',
						'customer-satisfaction-report',
						'customer-daily-activity-report'
					].some(pageId => officerPages.includes(pageId));
					
					if (hasDefaultCustomerPages) {
						logger.debug('⚠️ [PageAccess API] Backend returned settings with default customer pages for officers. This may indicate defaults are being used instead of database settings.');
					}
				}
				
				return normalized;
			}
			
			// If response is not successful, log and fall back
			logger.error('⚠️ [PageAccess API] Invalid response structure, falling back to defaults');
			logger.error('⚠️ [PageAccess API] Response:', {
				success: isSuccess,
				hasData: !!responseData,
				message: envelopeMessage
			});
			throw new Error('Page access settings response was invalid');
		} catch (error) {
			if (isBackendUnavailableError(error)) {
				if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true') {
					logger.debug('⚠️ [PageAccess API] Backend unavailable, using fallback defaults');
				}
			} else {
				logger.error('❌ [PageAccess API] Request failed, using defaults:', {
					message: error instanceof Error ? error.message : String(error),
					type: error instanceof Error ? error.constructor.name : typeof error,
					note: 'Page access settings request failed'
				});
			}
			throw error;
		}
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

			const response = await api.post<ApiResponse<BackendSyncPagesResult>>(
				'/PageAccess/sync-pages',
				syncRequest
			);

			const apiResponse = response.data as FlexibleEnvelope<BackendSyncPagesResult>;
			const { payload: responseData } = unpackEnvelope(apiResponse);
			
			if (responseData) {
				logger.debug('✅ [PageAccess API] Pages synced successfully:', responseData);
				return responseData;
			}

			throw new Error('Invalid response from sync endpoint');
		} catch (error) {
			logger.error('❌ [PageAccess API] Failed to sync pages:', error);
			throw error;
		}
	}
};