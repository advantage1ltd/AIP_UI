/**
 * Backend may mix casing; Settings sometimes aligns by path. Match assigned ids to catalog pages reliably.
 */
const normalizeKey = (value: string | undefined): string => String(value ?? '').toLowerCase().trim()

export const filterAssignedCustomerPages = <T extends { pageId: string; path?: string }>(
	availablePages: T[],
	assignedPageIds: string[],
): T[] => {
	if (!assignedPageIds.length) return []
	const assignedSet = new Set<string>()
	for (const raw of assignedPageIds) {
		const k = normalizeKey(raw)
		if (k.length > 0) assignedSet.add(k)
	}
	return availablePages.filter((page) => {
		const idKey = normalizeKey(page.pageId)
		if (idKey.length > 0 && assignedSet.has(idKey)) return true
		const pathKey = normalizeKey(page.path)
		return pathKey.length > 0 && assignedSet.has(pathKey)
	})
}
