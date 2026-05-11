/** Canonical application roles (persisted to API as lowercase). */
export type UserRole = 'administrator' | 'manager' | 'securityofficer' | 'customer'

/** Roles on Settings → page access UI / persisted payloads (order = desktop columns / priorities). */
export const SETTINGS_PAGE_ACCESS_ROLES: readonly UserRole[] = [
	'administrator',
	'manager',
	'securityofficer',
	'customer',
]

/** Short descriptions for the page-access settings screen. */
export const PAGE_ACCESS_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
	administrator: 'Full system configuration and oversight',
	manager: 'Cross-functional management and reporting',
	securityofficer: 'Site operations, incidents, and field workflows',
	customer: 'Client-facing dashboards and reports',
}

/** Maps legacy / alternate role strings from DB or JWT to a canonical role. */
const ROLE_ALIASES: Record<string, UserRole> = {
	administrator: 'administrator',
	admin: 'administrator',
	manager: 'manager',
	securityofficer: 'securityofficer',
	customer: 'customer',
	/** Legacy Identity role: head-office staff maps to manager (matches backend ApplicationRoleHarmonizer). */
	advantageonehoofficer: 'manager',
	advantageoneofficer: 'securityofficer',
	customerhomanager: 'customer',
	customersitemanager: 'customer',
}

export const normalizeRoleId = (role: string | null | undefined): UserRole | null => {
	if (!role) return null
	const key = role.trim().toLowerCase()
	const alias = ROLE_ALIASES[key]
	if (alias) return alias
	if (
		key === 'administrator' ||
		key === 'manager' ||
		key === 'securityofficer' ||
		key === 'customer'
	) {
		return key as UserRole
	}
	return null
}

/** Always returns one of the four canonical roles (unknown → customer). */
export const harmonizeRole = (role: string | null | undefined): UserRole => {
	const mapped = normalizeRoleId(role)
	if (mapped) return mapped
	const k = (role ?? '').trim().toLowerCase()
	if (k === 'administrator' || k === 'manager' || k === 'securityofficer' || k === 'customer') {
		return k as UserRole
	}
	return 'customer'
}

/**
 * Merges legacy or sparse role keys into exactly four buckets so sidebar/routes/settings stay aligned.
 * Unknown keys merge into `customer` (same rule as harmonizeRole).
 */
export const mergePageAccessByCanonicalRoles = (
	source: Record<string, string[] | undefined>
): Record<UserRole, string[]> => {
	const buckets: Record<UserRole, Set<string>> = {
		administrator: new Set(),
		manager: new Set(),
		securityofficer: new Set(),
		customer: new Set(),
	}
	for (const [rawKey, pageIds] of Object.entries(source ?? {})) {
		const role = harmonizeRole(rawKey)
		const target = buckets[role]
		for (const id of pageIds ?? []) {
			const s = id != null ? String(id).trim() : ''
			if (s.length > 0) target.add(s)
		}
	}
	return {
		administrator: [...buckets.administrator],
		manager: [...buckets.manager],
		securityofficer: [...buckets.securityofficer],
		customer: [...buckets.customer],
	}
}

export const roleDisplayName = (role: string | null | undefined): string => {
	const normalized = harmonizeRole(role)
	const labels: Record<UserRole, string> = {
		administrator: 'Administrator',
		manager: 'Manager',
		customer: 'Customer',
		securityofficer: 'Security Officer',
	}
	return labels[normalized]
}

export const hasRoleMatch = (
	currentRole: string | null | undefined,
	allowedRoles: Array<string | null | undefined>
): boolean => {
	const current = harmonizeRole(currentRole)
	return allowedRoles.some((allowed) => harmonizeRole(allowed) === current)
}

export const isCustomerRole = (role: string | null | undefined): boolean =>
	harmonizeRole(role) === 'customer'
