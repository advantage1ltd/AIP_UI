/**
 * Thin React Query wrapper for paginated tables.
 * Keeps the previous page visible while the next page loads when `keepPreviousPage` is true.
 * Flow: page index in query key → fetch page → optional `keepPreviousData` for stable table UX.
 */
import { keepPreviousData, type QueryKey, useQuery, type UseQueryOptions } from '@tanstack/react-query'

type PaginatedQueryFnResult<TData> = Promise<TData>

interface UsePaginatedQueryOptions<TData>
	extends Omit<UseQueryOptions<TData, Error, TData, QueryKey>, 'queryKey' | 'queryFn'> {
	queryKey: QueryKey
	queryFn: () => PaginatedQueryFnResult<TData>
	keepPreviousPage?: boolean
}

export const usePaginatedQuery = <TData>({
	queryKey,
	queryFn,
	keepPreviousPage = true,
	...options
}: UsePaginatedQueryOptions<TData>) =>
	useQuery({
		queryKey,
		queryFn,
		placeholderData: keepPreviousPage ? keepPreviousData : undefined,
		...options,
	})
