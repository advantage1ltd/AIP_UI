/**
 * Shared React Query keys for incident list/detail/stats, analytics hub, and dashboard widgets.
 * Call `invalidateIncidentData` after incident mutations so Operations, Reports, and Analytics stay aligned.
 * Flow: filter snapshots in keys → list/stats/hub queries → broad invalidation after incident writes.
 */
import type { QueryClient } from '@tanstack/react-query'
import type { GetIncidentsParams } from '@/types/api'
import type { AnalyticsQueryParams } from '@/services/analyticsService'

export type AnalyticsHubQueryFilters = Pick<
	AnalyticsQueryParams,
	'customerId' | 'startDate' | 'endDate' | 'regionIds' | 'storeIds'
>

export type DashboardIncidentQueryParams = {
	storeId?: string
	period?: string
}

const pickDefinedFilters = <T extends Record<string, unknown>>(filters: T): T => {
	const entries = Object.entries(filters).filter(
		([, value]) => value !== undefined && value !== null && value !== ''
	)
	return Object.fromEntries(entries) as T
}

const normalizeIncidentFilters = (filters: GetIncidentsParams = {}): GetIncidentsParams =>
	pickDefinedFilters(filters)

const normalizeAnalyticsHubFilters = (
	filters: AnalyticsHubQueryFilters = {}
): AnalyticsHubQueryFilters => pickDefinedFilters(filters)

const normalizeDashboardIncidentParams = (
	params: DashboardIncidentQueryParams = {}
): DashboardIncidentQueryParams => pickDefinedFilters(params)

export const incidentQueryKeys = {
	all: ['incidents'] as const,
	lists: () => [...incidentQueryKeys.all, 'list'] as const,
	list: (filters: GetIncidentsParams = {}) =>
		[...incidentQueryKeys.lists(), normalizeIncidentFilters(filters)] as const,
	details: () => [...incidentQueryKeys.all, 'detail'] as const,
	detail: (id: string) => [...incidentQueryKeys.details(), id] as const,
	stats: () => ['incidents-stats'] as const,
	statsWithFilters: (filters: GetIncidentsParams = {}) =>
		[...incidentQueryKeys.stats(), normalizeIncidentFilters(filters)] as const,
	analyticsHub: () => ['analytics-hub'] as const,
	analyticsHubWithFilters: (filters: AnalyticsHubQueryFilters = {}) =>
		[...incidentQueryKeys.analyticsHub(), normalizeAnalyticsHubFilters(filters)] as const,
	dashboardIncidents: () => ['dashboard-incidents'] as const,
	dashboardIncidentsWithParams: (params: DashboardIncidentQueryParams = {}) =>
		[...incidentQueryKeys.dashboardIncidents(), normalizeDashboardIncidentParams(params)] as const,
}

/** Refetch active incident-derived queries across list, stats, analytics hub, and dashboard views. */
export const invalidateIncidentData = async (queryClient: QueryClient) => {
	await Promise.all([
		queryClient.invalidateQueries({
			queryKey: incidentQueryKeys.all,
			refetchType: 'active',
		}),
		queryClient.invalidateQueries({
			queryKey: incidentQueryKeys.stats(),
			refetchType: 'active',
		}),
		queryClient.invalidateQueries({
			queryKey: incidentQueryKeys.analyticsHub(),
			refetchType: 'active',
		}),
		queryClient.invalidateQueries({
			queryKey: incidentQueryKeys.dashboardIncidents(),
			refetchType: 'active',
		}),
	])
}
