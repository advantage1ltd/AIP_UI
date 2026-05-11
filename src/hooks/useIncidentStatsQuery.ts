/**
 * Incident summary stats (counts and financial totals) for filtered Operations views.
 * Flow: shared list filters → stats key → `/incidents/stats` totals for summary cards.
 */
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { incidentsApi } from '@/services/api/incidents'
import type { GetIncidentsParams } from '@/types/api'
import { incidentQueryKeys } from '@/hooks/incidentQueryKeys'

const pickDefinedFilters = (filters: GetIncidentsParams): GetIncidentsParams => {
	const entries = Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== '')
	return Object.fromEntries(entries)
}

export const useIncidentStatsQuery = (filters: GetIncidentsParams, enabled = true) => {
	const normalizedFilters = useMemo(() => pickDefinedFilters(filters), [filters])

	return useQuery({
		queryKey: incidentQueryKeys.statsWithFilters(normalizedFilters),
		queryFn: () => incidentsApi.getIncidentStats(normalizedFilters),
		enabled,
		staleTime: 60 * 1000,
		refetchOnWindowFocus: true,
	})
}
