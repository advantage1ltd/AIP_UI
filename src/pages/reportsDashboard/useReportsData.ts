/**
 * Loads incidents for ReportsDashboard and owns filter/date-range state.
 */
import { useState } from 'react'
import { useIncidentsListQuery } from '@/hooks/useIncidentsListQuery'
import type { ReportsDateRange } from './types'

export const useReportsIncidentData = () => {
	const { data = [], isLoading, isFetching, error } = useIncidentsListQuery()

	return {
		incidents: data,
		loading: isLoading,
		isFetching,
		error,
	}
}

export const useReportsFilters = () => {
	const [activeTab, setActiveTab] = useState('overview')
	const [dateRange, setDateRange] = useState<ReportsDateRange | undefined>({
		from: new Date(new Date().setDate(new Date().getDate() - 30)),
		to: new Date(),
	})
	const [customerFilter, setCustomerFilter] = useState<string>('all')
	const [storeFilter, setStoreFilter] = useState<string>('all')
	const [incidentTypeFilter, setIncidentTypeFilter] = useState<string>('all')
	const [incidentInvolvedFilter, setIncidentInvolvedFilter] = useState<string>('all')

	return {
		activeTab,
		setActiveTab,
		dateRange,
		setDateRange,
		customerFilter,
		setCustomerFilter,
		storeFilter,
		setStoreFilter,
		incidentTypeFilter,
		setIncidentTypeFilter,
		incidentInvolvedFilter,
		setIncidentInvolvedFilter,
	}
}
