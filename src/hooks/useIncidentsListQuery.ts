/**
 * Paginated incident list for Operations and Reports; keyed by `incidentQueryKeys.list`.
 * Flow: table filters → list key → `incidentsApi` paged fetch with optional previous-page retention.
 */
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { incidentsApi } from '@/services/api/incidents'
import type { GetIncidentsParams } from '@/types/api'
import { incidentQueryKeys } from '@/hooks/incidentQueryKeys'

export const useIncidentsListQuery = (
	filters: GetIncidentsParams = {},
	enabled = true
) => {
	const normalizedFilters = useMemo(
		() => ({
			page: 1,
			pageSize: 50,
			...filters,
		}),
		[filters]
	)

	return useQuery({
		queryKey: incidentQueryKeys.list(normalizedFilters),
		queryFn: async () => {
			const response = await incidentsApi.getIncidents(normalizedFilters)
			return response.data
		},
		enabled,
		staleTime: 30 * 1000,
		refetchOnWindowFocus: true,
	})
}
