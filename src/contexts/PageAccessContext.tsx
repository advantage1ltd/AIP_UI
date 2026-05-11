/**
 * Page-access provider: loads role-based page lists from the API and answers hasAccess(path).
 * Wraps the route tree in routes.tsx; ProtectedRoute consults this context when enforcePageAccess is set.
 */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { PageAccess, PageAccessSettings, pageAccessApi } from '@/api/pageAccess';
import { isBackendUnavailableError } from '@/config/api';
import { AuthContext } from '@/contexts/AuthContext';
import { customerPageAccessCache } from '@/services/customerPageAccessCache';
import { PAGE_DEFINITIONS } from '@/config/navigation/pageDefinitions';
import { sessionStore } from '@/state/sessionStore';
import { harmonizeRole, isCustomerRole, normalizeRoleId } from '@/utils/roles';
import { isAlwaysAllowedPath, isPageAccessBootstrapPending, isPageAccessReadyButEmpty } from '@/utils/page-access-guards';
import { logger } from '@/utils/logger';

/** Map routes → canonical pageIds (PAGE_DEFINITIONS). Fixes access when DB PageId differs from Settings ids (e.g. officer toggle uses `management-customer-reporting`). */
const canonicalPageIdByNormalizedPath: Readonly<Record<string, string>> = Object.freeze(
	Object.fromEntries(
		PAGE_DEFINITIONS.map((def) => {
			let path = def.path.trim()
			if (!path.startsWith('/')) path = `/${path}`
			const normalized = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path
			return [normalized.toLowerCase(), def.pageId] as const
		}),
	),
)

interface PageAccessContextType {
	hasAccess: (path: string) => boolean;
	currentRole: string | null;
	setCurrentRole: (role: string | null) => Promise<void>;
	pageAccessByRole: Record<string, string[]>;
	setPageAccessByRole: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
	availablePages: PageAccess[];
	isLoading: boolean;
	status: 'idle' | 'loading' | 'ready' | 'offline';
	error: string | null;
	refreshSettings: () => Promise<void>;
	clearCacheAndReload: () => Promise<void>;
	syncPages: () => Promise<void>;
	isTestMode: boolean;
	setIsTestMode: (isTestMode: boolean) => void;
	testRole: string | null;
	setTestRole: (role: string | null) => void;
}

export const PageAccessContext = createContext<PageAccessContextType | undefined>(undefined);

const EMPTY_PAGE_ACCESS_SETTINGS: PageAccessSettings = {
	pageAccessByRole: {},
	availablePages: []
};
const debugLogsEnabled = import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true';

export const usePageAccess = () => {
	const context = useContext(PageAccessContext);
	if (context === undefined) {
		throw new Error('usePageAccess must be used within a PageAccessProvider');
	}
	return context;
};

export const PageAccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	// Safely get user from auth context, fallback to sessionStore if context not available
	const authContext = useContext(AuthContext);
	const user = authContext?.user || sessionStore.getUser();
	
	const [currentRole, setCurrentRoleState] = useState<string | null>(() => {
		const initialUser = sessionStore.getUser();
		const raw = initialUser?.pageAccessRole ?? initialUser?.role;
		return raw ? harmonizeRole(raw) : null;
	});
	
	useEffect(() => {
		const raw = user?.pageAccessRole ?? user?.role;
		setCurrentRoleState(raw ? harmonizeRole(raw) : null);
	}, [user]);

	const [pageAccessByRole, setPageAccessByRole] = useState<Record<string, string[]>>({});
	const [availablePages, setAvailablePages] = useState<PageAccess[]>([]);
	const [customerAssignedPageIds, setCustomerAssignedPageIds] = useState<Set<string>>(new Set());
	const [isLoading, setIsLoading] = useState(false);
	const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'offline'>('idle');
	const [error, setError] = useState<string | null>(null);
	const [isTestMode, setIsTestMode] = useState(false);
	const [testRole, setTestRole] = useState<string | null>(null);
	
	const initializationRef = useRef(false);
	const lastCustomerContextId = useRef<number | null>(null);
	const settingsLoadAttempted = useRef(false);

	// Stable check for auth token
	const hasAuthToken = useCallback((): boolean => {
		try {
			return Boolean(sessionStore.getToken());
		} catch {
			return false;
		}
	}, []);

	// Canonical role for lookups (legacy JWT/DB values map to administrator | manager | securityofficer | customer)
	const normalizeRoleName = useCallback((role: string | null): string | null => {
		if (!role) return null;
		return harmonizeRole(role);
	}, []);

	// Resolve role key from available roles (case-insensitive)
	const resolveRoleKey = useCallback((roleName: string | null): string | null => {
		if (!roleName) return null;
		
		const normalized = normalizeRoleName(roleName);
		if (!normalized) return null;

		// Check exact match first
		if (pageAccessByRole[normalized]) {
			return normalized;
		}

		// Check case-insensitive match
		const match = Object.keys(pageAccessByRole).find(key => 
			key.toLowerCase() === normalized.toLowerCase()
		);

		return match || normalized;
	}, [pageAccessByRole, normalizeRoleName]);

	// Load page access settings from API
	const loadPageAccessSettings = useCallback(async (): Promise<PageAccessSettings> => {
		if (!hasAuthToken()) {
			return EMPTY_PAGE_ACCESS_SETTINGS;
		}

		try {
			const data = await pageAccessApi.getSettings();
			
			// Log loaded settings for debugging
			if (debugLogsEnabled) {
				logger.debug('[PageAccess] Settings loaded from API');
				logger.debug('📊 Settings Summary:', {
					availablePagesCount: data.availablePages.length,
					rolesCount: Object.keys(data.pageAccessByRole).length,
					roleKeys: Object.keys(data.pageAccessByRole)
				});
				
				// Log security officer pages specifically
				const officerPages = data.pageAccessByRole['securityofficer'] || [];
				const customerPagesInList = officerPages.filter(p => String(p).toLowerCase().includes('customer')).map(p => String(p));
				
				// Check if this looks like default settings (has all default customer pages)
				const defaultCustomerPages = [
					'customer-daily-activity-report',
					'customer-incident-graph',
					'customer-incident-report',
					'customer-satisfaction-report',
					'customer-be-safe-be-secure',
					'daily-occurrence-book',
					'customer-officer-support',
					'customer-views-config',
					'customer-crime-intelligence',
					'customer-site-visit-reports'
				];
				const hasAllDefaultCustomerPages = defaultCustomerPages.every(pageId => 
					officerPages.some(p => String(p).toLowerCase().trim() === pageId.toLowerCase().trim())
				);
				
				if (hasAllDefaultCustomerPages && customerPagesInList.length > 0) {
					logger.debug('⚠️ [PageAccess] WARNING: Settings appear to be DEFAULTS, not from database!');
					logger.debug('⚠️ [PageAccess] Officer has all default customer pages. This suggests defaults are being used instead of database settings.');
					logger.debug('⚠️ [PageAccess] If you disabled customer pages in settings, they should NOT appear here.');
				}
				
				logger.debug('👤 Security officer pages:', {
					count: officerPages.length,
					hasCustomerIncidentReport: officerPages.includes('customer-incident-report'),
					customerPagesCount: customerPagesInList.length,
					hasAllDefaultCustomerPages,
					allPages: officerPages,
					pageTypes: officerPages.map(p => typeof p)
				});
				logger.debug('👤 Security officer pages (as strings):', officerPages.map(p => String(p)).join(', '));
				logger.debug('👤 Has customer-incident-report?', officerPages.map(p => String(p).toLowerCase().trim()).includes('customer-incident-report'));
				logger.debug('👤 Customer pages in list:', customerPagesInList);
				
				// Check available pages for customer-incident-report
				const incidentReportPage = data.availablePages.find(p => 
					p.path === '/customer/incident-report' || p.id === 'customer-incident-report'
				);
				logger.debug('📄 customer-incident-report Page in Available Pages:', {
					found: !!incidentReportPage,
					page: incidentReportPage ? {
						id: incidentReportPage.id,
						dbId: incidentReportPage.dbId,
						path: incidentReportPage.path
					} : null
				});
			}
			
			setPageAccessByRole(data.pageAccessByRole);
			setAvailablePages(data.availablePages);
			setStatus('ready');
			setError(null);
			return data;
		} catch (error) {
			if (!isBackendUnavailableError(error)) {
				logger.error('❌ [PageAccess] Error loading settings:', error);
			} else if (debugLogsEnabled) {
				logger.debug('⚠️ [PageAccess] Backend unavailable while loading settings; switched to offline mode');
			}
			setError(error instanceof Error ? error.message : 'Failed to load page access settings');
			setStatus('offline');
			// Return defaults on error
			return EMPTY_PAGE_ACCESS_SETTINGS;
		}
	}, [hasAuthToken]);

	// Load customer page assignments
	const loadCustomerPageAssignments = useCallback(async (customerId: number | null) => {
		if (!hasAuthToken() || !customerId) {
			setCustomerAssignedPageIds(new Set());
			lastCustomerContextId.current = null;
			return;
		}

		// Skip if already loaded for this customer
		if (lastCustomerContextId.current === customerId) {
			return;
		}

		try {
			const response = await customerPageAccessCache.get(customerId);
			setCustomerAssignedPageIds(new Set(response.assignedPageIds));
			lastCustomerContextId.current = customerId;
		} catch (error: unknown) {
			const status = (() => {
				if (!error || typeof error !== 'object') return undefined;
				const maybeError = error as { response?: { status?: number }; status?: number };
				return maybeError.response?.status ?? maybeError.status;
			})();
			const isExpectedError = status === 403 || status === 404;
			
			if (!isExpectedError && debugLogsEnabled) {
				logger.debug('⚠️ [PageAccess] Error loading customer page assignments:', error);
			}
			
			setCustomerAssignedPageIds(new Set());
			lastCustomerContextId.current = null;
		}
	}, [hasAuthToken]);

	// Check if user has access to a path
	const hasAccess = useCallback((path: string): boolean => {
		const startTime = performance.now();
		try {
			// Normalize path - strip query parameters and hash
			let normalizedPath = path.split('?')[0].split('#')[0];
			normalizedPath = normalizedPath.endsWith('/') && normalizedPath !== '/' ? normalizedPath.slice(0, -1) : normalizedPath;

			// Dashboard and root are always accessible
			if (isAlwaysAllowedPath(normalizedPath)) {
				return true;
			}

			const settingsState = {
				status,
				pageAccessRoleCount: Object.keys(pageAccessByRole).length,
				availablePageCount: availablePages.length
			};

			// Fail closed while settings are initializing for non-dashboard routes.
			if (isPageAccessBootstrapPending(settingsState)) {
				if (debugLogsEnabled) {
					logger.debug('⏳ [PageAccess] Access pending until settings load:', {
						path,
						normalizedPath,
						status
					});
				}
				return false;
			}

			// If settings are marked ready but still empty, deny access.
			if (isPageAccessReadyButEmpty(settingsState)) {
				if (debugLogsEnabled) {
					logger.debug('🔒 [PageAccess] Access denied: settings are ready but empty', {
						path,
						normalizedPath,
						pageAccessByRoleCount: settingsState.pageAccessRoleCount,
						availablePagesCount: settingsState.availablePageCount
					});
				}
				return false;
			}

			// No role = no access (except during initialization which is handled above)
			if (!currentRole) {
				if (debugLogsEnabled && path !== '/dashboard' && path !== '/') {
					logger.debug('❌ [PageAccess] Access denied: No currentRole', {
						path,
						status,
						reason: 'No role assigned'
					});
				}
				return false;
			}

			// Security officers: hub is granted when Settings lists the canonical page id,
			// even if /management/customer-reporting is missing from availablePages (inactive DB row / catalog drift).
			const customerReportingHubPath = '/management/customer-reporting';
			if (
				normalizedPath === customerReportingHubPath &&
				normalizeRoleId(currentRole) === 'securityofficer'
			) {
				const rk = resolveRoleKey(currentRole);
				const ids = rk ? pageAccessByRole[rk] ?? [] : [];
				const hubGranted =
					ids.some((id) => String(id).toLowerCase().trim() === 'management-customer-reporting') ||
					ids.some((id) => String(id).toLowerCase().includes('customer-reporting'));
				if (hubGranted) {
					return true;
				}
			}

			// Find page by path (exact match first, then try without leading slash)
			let page = availablePages.find(p => p.path === normalizedPath);
			if (!page) {
				// Try without leading slash
				const pathWithoutSlash = normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath;
				page = availablePages.find(p => p.path === `/${pathWithoutSlash}` || p.path === pathWithoutSlash);
			}
			
			if (!page) {
				// Page not in available pages - deny access
				if (debugLogsEnabled) {
					logger.debug('🔒 [PageAccess] Page not found in availablePages:', {
						originalPath: path,
						normalizedPath,
						availablePaths: availablePages.slice(0, 20).map(p => ({ path: p.path, id: p.id })),
						totalPages: availablePages.length,
						searchingFor: normalizedPath
					});
				}
				return false;
			}

			const isCustomerPage = Boolean(
				page.path?.startsWith('/customer') || page.category === 'Customer'
			);
			
			if (debugLogsEnabled) {
				logger.debug('🔍 [PageAccess] Found page:', {
					path: normalizedPath,
					pageId: page.id,
					pageIdType: typeof page.id,
					pageDbId: page.dbId,
					pageDbIdType: typeof page.dbId,
					pagePath: page.path,
					pageCategory: page.category,
					pageTitle: page.title
				});
				
				// Check if there are other pages with similar paths or IDs
				const similarPages = availablePages.filter(ap => 
					ap.path === page.path || 
					ap.id === page.id ||
					(ap.dbId && page.dbId && ap.dbId === page.dbId)
				);
				if (similarPages.length > 1) {
					logger.debug('⚠️ [PageAccess] Found multiple pages with same path/ID:', similarPages.map(p => ({
						id: p.id,
						dbId: p.dbId,
						path: p.path
					})));
				}
			}

			// Administrators have full access
			if (normalizeRoleId(currentRole) === 'administrator') {
				return true;
			}

			// Get role permissions
			const roleKey = resolveRoleKey(currentRole);
			if (!roleKey) {
				if (debugLogsEnabled) {
					logger.debug('🔒 [PageAccess] No role key resolved for role:', currentRole, 'Available keys:', Object.keys(pageAccessByRole));
				}
				return false;
			}

			const normalizedStaffRole = normalizeRoleId(currentRole);
			const staffCustomerRouteBypass =
				isCustomerPage &&
				(normalizedStaffRole === 'securityofficer' || normalizedStaffRole === 'manager');

			const allowedPageIds = pageAccessByRole[roleKey];
			if (!allowedPageIds || allowedPageIds.length === 0) {
				if (staffCustomerRouteBypass) {
					if (debugLogsEnabled) {
						logger.debug('✅ [PageAccess] Staff customer route: role has no page list entry; allow catalog customer page', {
							path: normalizedPath,
							roleKey,
						});
					}
					return true;
				}
				if (debugLogsEnabled) {
					logger.debug('🔒 [PageAccess] No page IDs found for role:', roleKey, 'Resolved from:', currentRole);
				}
				return false;
			}

			// Check if role has access to this page
			// Access logic (prioritized):
			// 1. Administrators: Full access (bypassed above)
			// 2. Path-based matching: Check if ANY page with same path is in allowedPageIds (MOST RELIABLE)
			// 3. Page ID matching: Direct ID match (case-insensitive)
			// 4. Officers + Customer pages: Allow if page exists (customer assignment checked at API level)
			// 5. Customer roles + Customer pages: Check customer page assignments
			// 
			// Note: Officers can access customer pages even if not in allowedPageIds because:
			// - Customer assignment is verified at the API/data level when accessing customer data
			// - Route-level access should allow officers to reach customer pages
			// - The actual customer assignment check happens in the backend API
			// 
			// Path-based matching is more reliable because:
			// - Paths are what we're actually checking (the URL)
			// - Paths are stable and predictable
			// - Less prone to ID format mismatches
			
			const pagePathLower = page.path?.toLowerCase().trim();
			const pageIdLower = page.id?.toLowerCase().trim();
			let hasRoleAccess = false;
			
			// PRIMARY: Path-based matching (most reliable)
			// Check if any page with the same path has an ID in the allowed list
			if (pagePathLower) {
				// Find all pages with the same path
				const pagesWithSamePath = availablePages.filter(ap => {
					const apPath = ap.path?.toLowerCase().trim();
					return apPath === pagePathLower;
				});
				
				// Check if any of these pages have an ID in the allowed list
				hasRoleAccess = pagesWithSamePath.some(pageWithPath => {
					const pageId = pageWithPath.id?.toLowerCase().trim();
					const pageDbId = pageWithPath.dbId ? String(pageWithPath.dbId).toLowerCase().trim() : null;
					
					return allowedPageIds.some(allowedId => {
						const allowedIdStr = String(allowedId).toLowerCase().trim();
						// Match by page ID
						if (pageId && allowedIdStr === pageId) {
							return true;
						}
						// Match by dbId
						if (pageDbId && allowedIdStr === pageDbId) {
							return true;
						}
						return false;
					});
				});
				
				if (debugLogsEnabled && hasRoleAccess) {
					logger.debug('✅ [PageAccess] Access granted via PATH-based matching:', {
						path: pagePathLower,
						matchingPages: pagesWithSamePath.map(p => ({ id: p.id, dbId: p.dbId }))
					});
				}
			}
			
			// SECONDARY: Direct page ID matching (if path-based didn't work)
			if (!hasRoleAccess && pageIdLower) {
				// Try exact match first (fastest)
				if (allowedPageIds.includes(page.id)) {
					hasRoleAccess = true;
				} else {
					// Try case-insensitive match
					hasRoleAccess = allowedPageIds.some(allowedId => {
						const allowedIdStr = String(allowedId).toLowerCase().trim();
						return allowedIdStr === pageIdLower;
					});
				}
				
				// Also try dbId match
				if (!hasRoleAccess && page.dbId !== undefined) {
					const dbIdStr = String(page.dbId).toLowerCase().trim();
					hasRoleAccess = allowedPageIds.some(allowedId => {
						const allowedIdStr = String(allowedId).toLowerCase().trim();
						return allowedIdStr === dbIdStr;
					});
				}
				
				if (debugLogsEnabled && hasRoleAccess) {
					logger.debug('✅ [PageAccess] Access granted via ID-based matching:', {
						pageId: page.id,
						pageDbId: page.dbId
					});
				}
			}

			// TERTIARY: canonical pageId for route from PAGE_DEFINITIONS (Settings may use canonical id while DB row PageId differs)
			if (!hasRoleAccess) {
				const canonicalPageId = canonicalPageIdByNormalizedPath[normalizedPath.toLowerCase()]
				if (canonicalPageId) {
					const canonLower = canonicalPageId.toLowerCase().trim()
					hasRoleAccess = allowedPageIds.some(
						(id) => String(id).toLowerCase().trim() === canonLower,
					)
					if (debugLogsEnabled && hasRoleAccess) {
						logger.debug('✅ [PageAccess] Access granted via canonical path → pageId:', {
							path: normalizedPath,
							canonicalPageId,
						})
					}
				}
			}
			
			if (debugLogsEnabled && !hasRoleAccess) {
				const debugInfo = {
					originalPath: path,
					normalizedPath,
					pageId: page.id,
					pageDbId: page.dbId,
					currentRole,
					roleKey,
					allowedPageIdsCount: allowedPageIds.length,
					allowedPageIds: allowedPageIds.slice(0, 30), // Show first 30
					pageIdInAllowed: allowedPageIds.includes(page.id),
					pageDbIdInAllowed: page.dbId ? allowedPageIds.includes(page.dbId.toString()) : false,
					hasAccess: false,
					pagePath: page.path,
					pageCategory: page.category
				};
				
				logger.debug('[PageAccess] Access denied for:', normalizedPath);
				
				// Explicit string logging for debugging
				logger.debug('🔍 ACTUAL VALUES:');
				logger.debug('  Page ID:', page.id, '(type:', typeof page.id + ')');
				logger.debug('  Page DB ID:', page.dbId, '(type:', typeof page.dbId + ')');
				logger.debug('  Page Path:', page.path);
				logger.debug('  Page ID (normalized):', page.id?.toLowerCase().trim());
				logger.debug('  Allowed IDs count:', allowedPageIds.length);
				logger.debug('  Allowed IDs (as strings):', allowedPageIds.map(id => String(id)).join(', '));
				logger.debug('  Looking for "customer-incident-report":', allowedPageIds.map(id => String(id).toLowerCase().trim()).includes('customer-incident-report'));
				
				// Check path-based matching
				const pagesWithSamePath = availablePages.filter(ap => {
					const apPath = ap.path?.toLowerCase().trim();
					return apPath === pagePathLower;
				});
				const pathBasedMatch = pagesWithSamePath.some(pageWithPath => {
					const pageId = pageWithPath.id?.toLowerCase().trim();
					const pageDbId = pageWithPath.dbId ? String(pageWithPath.dbId).toLowerCase().trim() : null;
					return allowedPageIds.some(allowedId => {
						const allowedIdStr = String(allowedId).toLowerCase().trim();
						return (pageId && allowedIdStr === pageId) || (pageDbId && allowedIdStr === pageDbId);
					});
				});
				
				logger.debug('📄 Page Info:', {
					id: page.id,
					dbId: page.dbId,
					path: page.path,
					category: page.category,
					pagesWithSamePath: pagesWithSamePath.length,
					pathBasedMatchAvailable: pathBasedMatch
				});
				logger.debug('👤 User Role:', {
					currentRole,
					roleKey,
					resolved: roleKey ? '✅' : '❌'
				});
				logger.debug('📋 Allowed Page IDs (Full List):', allowedPageIds);
				logger.debug('📋 Allowed Page IDs (Full List - Strings):', allowedPageIds.map(id => String(id)));
				logger.debug('📋 Allowed Page IDs (First 30):', allowedPageIds.slice(0, 30));
				logger.debug('📋 Allowed Page IDs (Types):', allowedPageIds.map(id => ({ id, type: typeof id, stringValue: String(id) })));
				// Enhanced search with case-insensitive comparison
				const exactMatch = allowedPageIds.find(id => String(id).toLowerCase().trim() === pageIdLower);
				const dbIdMatch = page.dbId ? allowedPageIds.find(id => String(id).toLowerCase().trim() === String(page.dbId).toLowerCase().trim()) : null;
				
				logger.debug('🔍 Search Results:', {
					'path-based match': pathBasedMatch,
					'page.id in allowed? (exact)': allowedPageIds.includes(page.id),
					'page.id in allowed? (case-insensitive)': !!exactMatch,
					'page.dbId in allowed?': page.dbId ? allowedPageIds.includes(page.dbId.toString()) : 'N/A',
					'page.dbId match (case-insensitive)': !!dbIdMatch,
					'page.id type': typeof page.id,
					'page.dbId type': typeof page.dbId,
					'exact match found': exactMatch || null,
					'dbId match found': dbIdMatch || null,
					'pageId normalized': pageIdLower,
					'allowedIds sample (normalized)': allowedPageIds.slice(0, 5).map(id => String(id).toLowerCase().trim())
				});
				logger.debug('🔎 Looking for:', {
					pageId: page.id,
					pageIdNormalized: pageIdLower,
					pageDbId: page.dbId?.toString(),
					pageIdType: typeof page.id,
					pageDbIdType: typeof page.dbId,
					pagePath: page.path
				});
				// Check all customer pages to see which ones are in the allowed list
				const customerPageIds = ['customer-incident-report', 'customer-incident-graph', 'customer-satisfaction-report', 'customer-daily-activity-report'];
				const customerPageMatches = customerPageIds.map(customerPageId => {
					const exactMatch = allowedPageIds.includes(customerPageId);
					const caseInsensitiveMatch = allowedPageIds.some(id => String(id).toLowerCase().trim() === customerPageId.toLowerCase().trim());
					const foundId = allowedPageIds.find(id => String(id).toLowerCase().trim() === customerPageId.toLowerCase().trim());
					return {
						pageId: customerPageId,
						exactMatch,
						caseInsensitiveMatch,
						foundId: foundId || null,
						foundIdType: foundId ? typeof foundId : null
					};
				});
				
				const allowedPagesWithSamePath = pagesWithSamePath.filter(ap => {
					const apIdLower = ap.id?.toLowerCase().trim();
					const apDbIdStr = ap.dbId ? String(ap.dbId).toLowerCase().trim() : null;
					return allowedPageIds.some(allowedId => {
						const allowedIdStr = String(allowedId).toLowerCase().trim();
						return allowedIdStr === apIdLower || allowedIdStr === apDbIdStr;
					});
				});
				
				logger.debug('🔍 Direct Comparison:', {
					'customer-incident-report in array (exact)': allowedPageIds.includes('customer-incident-report'),
					'customer-incident-report in array (case-insensitive)': allowedPageIds.some(id => String(id).toLowerCase().trim() === 'customer-incident-report'),
					'dbId in array': page.dbId ? allowedPageIds.includes(String(page.dbId)) : false,
					'dbId in array (case-insensitive)': page.dbId ? allowedPageIds.some(id => String(id).toLowerCase().trim() === String(page.dbId).toLowerCase().trim()) : false,
					'customer pages matches': customerPageMatches,
					'pages with same path': pagesWithSamePath.map(p => ({ id: p.id, dbId: p.dbId, path: p.path })),
					'allowed pages with same path': allowedPagesWithSamePath.map(p => ({ id: p.id, dbId: p.dbId, path: p.path })),
					'path-based match would work': pathBasedMatch
				});
				
				// Show all allowed IDs that contain "incident" or "customer"
				const relevantIds = allowedPageIds.filter(id => {
					const idStr = String(id).toLowerCase();
					return idStr.includes('incident') || idStr.includes('customer');
				});
				logger.debug('🔍 Relevant Allowed IDs (containing "incident" or "customer"):', relevantIds);
				logger.debug('🔍 All Allowed IDs:', allowedPageIds.map(id => String(id)).join(', '));
			}


			if (!hasRoleAccess && !staffCustomerRouteBypass) {
				return false;
			}

			if (staffCustomerRouteBypass && debugLogsEnabled && !hasRoleAccess) {
				logger.debug('✅ [PageAccess] Staff customer route bypass (assignment enforced by APIs):', {
					path: normalizedPath,
					pageId: page.id,
					roleKey,
				});
			}

			// For customer roles accessing customer pages, check customer assignments
			const customerRoleDetected = isCustomerRole(currentRole);

			if (customerRoleDetected && isCustomerPage && customerAssignedPageIds.size > 0) {
				const hasCustomerAssignment = customerAssignedPageIds.has(page.id);
				if (debugLogsEnabled) {
					logger.debug('🔍 [PageAccess] Customer assignment check:', {
						path,
						pageId: page.id,
						isCustomerRole,
						isCustomerPage,
						customerAssignedPageIdsCount: customerAssignedPageIds.size,
						hasCustomerAssignment,
						decision: hasCustomerAssignment ? '✅ ALLOWED' : '❌ DENIED'
					});
				}
				return hasCustomerAssignment;
			}

			// Success - access granted
			if (debugLogsEnabled) {
				const endTime = performance.now();
				const duration = endTime - startTime;
				logger.debug('✅ [PageAccess] Access GRANTED:', {
					path,
					pageId: page.id,
					pagePath: page.path,
					currentRole,
					roleKey,
					duration: `${duration.toFixed(2)}ms`,
						reason: customerRoleDetected && isCustomerPage 
						? 'Customer role with customer page (no assignment check needed)' 
						: 'Role has access to page'
				});
			}
			return true;
		} catch (error) {
			logger.error('🔒 [PageAccess] Error checking access:', error);
			logger.error('📋 Error Context:', {
				path,
				currentRole,
				errorMessage: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined
			});
			return false;
		}
	}, [currentRole, pageAccessByRole, availablePages, customerAssignedPageIds, status, resolveRoleKey]);

	// Refresh settings
	const refreshSettings = useCallback(async (): Promise<void> => {
		if (!hasAuthToken()) {
			setStatus('idle');
			setError(null);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			await loadPageAccessSettings();
		} catch (error) {
			logger.error('❌ [PageAccess] Error refreshing settings:', error);
		} finally {
			setIsLoading(false);
		}
	}, [hasAuthToken, loadPageAccessSettings]);

	// Clear cache and reload
	const clearCacheAndReload = useCallback(async (): Promise<void> => {
		settingsLoadAttempted.current = false;
		await refreshSettings();
	}, [refreshSettings]);

	// Sync pages (admin only)
	const syncPages = useCallback(async (): Promise<void> => {
		if (!hasAuthToken() || currentRole !== 'administrator') {
			return;
		}

		try {
			await pageAccessApi.syncPages(PAGE_DEFINITIONS);
			await refreshSettings();
		} catch (error) {
			logger.error('❌ [PageAccess] Error syncing pages:', error);
		}
	}, [hasAuthToken, currentRole, refreshSettings]);

	// Set current role with data loading
	const setCurrentRole = useCallback(async (role: string | null) => {
		const normalizedRole = normalizeRoleName(role);
		setCurrentRoleState(normalizedRole);

		if (!normalizedRole || !hasAuthToken()) {
			setCustomerAssignedPageIds(new Set());
			lastCustomerContextId.current = null;
			return;
		}

		// Load customer assignments if needed
		const customerRoleDetected = isCustomerRole(normalizedRole);
		if (customerRoleDetected && user) {
			const customerId = 'customerId' in user ? user.customerId : null;
			await loadCustomerPageAssignments(customerId);
		} else {
			setCustomerAssignedPageIds(new Set());
			lastCustomerContextId.current = null;
		}
	}, [normalizeRoleName, hasAuthToken, user, loadCustomerPageAssignments]);

	useEffect(() => {
		// Prevent multiple initializations
		if (initializationRef.current) {
			return;
		}

		const initialize = async () => {
			// Skip if no auth token
			if (!hasAuthToken()) {
				setStatus('idle');
				setIsLoading(false);
				return;
			}

			// Skip if already attempted
			if (settingsLoadAttempted.current) {
				return;
			}

			settingsLoadAttempted.current = true;
			initializationRef.current = true;

			try {
				setIsLoading(true);
				setStatus('loading');

				// Load settings
				await loadPageAccessSettings();

				// Set role from user (in case it wasn't set yet)
				if (user) {
					const userRole = user.pageAccessRole || user.role || null;
					const normalizedRole = normalizeRoleName(userRole);
					
					if (normalizedRole) {
						setCurrentRoleState(normalizedRole);
						
						// Load customer assignments if needed
						const customerRoleDetected = isCustomerRole(normalizedRole);
						if (customerRoleDetected && 'customerId' in user) {
							await loadCustomerPageAssignments(user.customerId);
						}
					}
				}
			} catch (error) {
				logger.error('❌ [PageAccess] Initialization error:', error);
				setStatus('offline');
				
				// Set role from user even on error
				if (user) {
					const userRole = user.pageAccessRole || user.role || null;
					const normalizedRole = normalizeRoleName(userRole);
					if (normalizedRole) {
						setCurrentRoleState(normalizedRole);
					}
				}
			} finally {
				setIsLoading(false);
			}
		};

		initialize();
	}, [hasAuthToken, user, loadPageAccessSettings, normalizeRoleName, loadCustomerPageAssignments]);

	// Reset when user logs out
	useEffect(() => {
		if (!hasAuthToken()) {
			setCurrentRoleState(null);
			setPageAccessByRole({});
			setAvailablePages([]);
			setCustomerAssignedPageIds(new Set());
			setStatus('idle');
			setError(null);
			initializationRef.current = false;
			settingsLoadAttempted.current = false;
			lastCustomerContextId.current = null;
		}
	}, [hasAuthToken]);

	return (
		<PageAccessContext.Provider value={{
			hasAccess,
			currentRole,
			setCurrentRole,
			pageAccessByRole,
			setPageAccessByRole,
			availablePages,
			isLoading,
			status,
			error,
			refreshSettings,
			clearCacheAndReload,
			syncPages,
			isTestMode,
			setIsTestMode,
			testRole,
			setTestRole
		}}>
			{children}
		</PageAccessContext.Provider>
	);
};
