import type { User } from '@/types/user'

export type IncidentDashboardScope = 'staff-full' | 'customer-tenant' | 'officer-self'

const normalizePersonKey = (s: string) =>
	s.trim().toLowerCase().replace(/\s+/g, ' ')

/**
 * Lenient match between incident officer field and the logged-in user (name variants).
 */
export const incidentOfficerMatchesUser = (
	officerNameRaw: string,
	user: User | null
): boolean => {
	if (!user) return false
	const officer = normalizePersonKey(officerNameRaw)
	if (!officer || officer === '—' || officer === 'unknown') return false

	const candidates: string[] = []
	const fn = (user.firstName ?? '').trim()
	const ln = (user.lastName ?? '').trim()
	if (fn && ln) {
		candidates.push(`${fn} ${ln}`)
		candidates.push(`${ln}, ${fn}`)
		candidates.push(`${ln} ${fn}`)
	}
	if (user.employeeName?.trim()) candidates.push(user.employeeName.trim())
	if (user.username?.trim()) candidates.push(user.username.trim())

	const normalizedCandidates = candidates.map(normalizePersonKey).filter(Boolean)

	return normalizedCandidates.some((c) => {
		if (!c) return false
		if (officer === c) return true
		if (officer.includes(c) || c.includes(officer)) return true
		const oTokens = officer.split(' ').filter(Boolean)
		const cTokens = c.split(' ').filter(Boolean)
		if (cTokens.length === 0) return false
		return cTokens.every((t) => oTokens.some((ot) => ot === t || ot.includes(t) || t.includes(ot)))
	})
}
