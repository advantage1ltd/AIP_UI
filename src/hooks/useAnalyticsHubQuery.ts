/**
 * Loads aggregated analytics hub data for the current filter set via `analyticsService`.
 * Flow: hub filters → `incidentQueryKeys.analyticsHub` → client-side hub payload for DataAnalyticsHub.
 */
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsService, type AnalyticsQueryParams } from '@/services/analyticsService'
import { incidentQueryKeys, type AnalyticsHubQueryFilters } from '@/hooks/incidentQueryKeys'

export const useAnalyticsHubQuery = (
	filters: AnalyticsHubQueryFilters,
	options: {
		enabled?: boolean
		stores?: AnalyticsQueryParams['stores']
		regions?: AnalyticsQueryParams['regions']
	} = {}
) => {
	const { enabled = true, stores, regions } = options
	const normalizedFilters = useMemo(() => filters, [filters])

	return useQuery({
		queryKey: incidentQueryKeys.analyticsHubWithFilters(normalizedFilters),
		queryFn: () =>
			analyticsService.getAnalyticsHub({
				...normalizedFilters,
				stores,
				regions,
			}),
		enabled,
		staleTime: 30 * 1000,
		refetchOnWindowFocus: true,
	})
}
