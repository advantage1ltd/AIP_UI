/**
 * Data Analytics Hub: filters (customer, region, store, date range), summary strip, and tabbed modules.
 * Flow: filter state → useAnalyticsHubQuery → tabbed hub modules and CSV export from loaded payload.
 */

import { useState, useEffect, useMemo } from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useAnalyticsHubQuery } from '@/hooks/useAnalyticsHubQuery'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CrimeTrendExplorer } from './components/CrimeTrendExplorer'
import { HotProductsDashboard } from './components/HotProductsDashboard'
import { RepeatOffenderAnalysis } from './components/RepeatOffenderAnalysis'
import { ResourceDeploymentEngine } from './components/ResourceDeploymentEngine'
import { CrimeLinkingPanel } from './components/CrimeLinkingPanel'
import {
	BarChart3,
	RefreshCw,
	Download,
	Filter,
	AlertCircle,
} from 'lucide-react'
import { format, subDays } from 'date-fns'
import type { Region, Site } from '@/types/dashboard'
import { useCustomerSelection } from '@/contexts/CustomerSelectionContext'
import { MapPin, Building2 } from 'lucide-react'
import { customerService } from '@/services/customerService'
import { regionService } from '@/services/regionService'
import { siteService } from '@/services/siteService'
import { logger } from '@/utils/logger'
import { downloadAnalyticsHubCsv } from '@/utils/analyticsExport'

type UnknownRecord = Record<string, unknown>

const toStringValue = (value: unknown) => (value == null ? '' : String(value))
const toNumberValue = (value: unknown) => {
	const n = Number(value)
	return Number.isFinite(n) ? n : 0
}

const extractList = (payload: unknown): unknown[] => {
	if (Array.isArray(payload)) {
		return payload
	}
	if (payload && typeof payload === 'object') {
		const record = payload as UnknownRecord
		const candidates = [record.items, record.Items, record.data, record.Data, record.results, record.Results]
		for (const candidate of candidates) {
			if (Array.isArray(candidate)) {
				return candidate
			}
		}
	}
	return []
}

const normalizeRegion = (region: unknown): Region | null => {
	if (!region || typeof region !== 'object') return null
	const record = region as UnknownRecord
	const id = toStringValue(record.id ?? record.regionID ?? record.RegionID ?? record.regionId ?? record.RegionId)
	if (!id) return null
	return {
		id,
		name: toStringValue(record.name ?? record.regionName ?? record.RegionName) || `Region ${id}`,
		customerId: toNumberValue(record.customerId ?? record.CustomerId ?? record.fkCustomerID ?? record.FkCustomerID),
		code: toStringValue(record.code ?? record.regionCode ?? record.RegionCode),
		status: toStringValue(record.status ?? record.RecordIsDeletedYN ?? record.recordIsDeletedYN) || 'active',
		createdAt: toStringValue(record.createdAt ?? record.dateCreated ?? record.DateCreated),
		updatedAt: toStringValue(record.updatedAt ?? record.dateModified ?? record.DateModified),
	}
}

const normalizeSite = (site: unknown): Site | null => {
	if (!site || typeof site !== 'object') return null
	const record = site as UnknownRecord
	const id = toStringValue(record.id ?? record.siteID ?? record.SiteID ?? record.siteId ?? record.SiteId)
	if (!id) return null
	return {
		id,
		locationName: toStringValue(record.locationName ?? record.LocationName ?? record.name) || `Store ${id}`,
		regionId: toStringValue(record.regionId ?? record.RegionId ?? record.fkRegionID ?? record.FkRegionID),
		customerId: toNumberValue(record.customerId ?? record.CustomerId ?? record.fkCustomerID ?? record.FkCustomerID),
		buildingName: toStringValue(record.buildingName ?? record.BuildingName),
		street: toStringValue(record.street ?? record.numberandStreet ?? record.NumberAndStreet),
		town: toStringValue(record.town ?? record.Town),
		county: toStringValue(record.county ?? record.County),
		postcode: toStringValue(record.postcode ?? record.Postcode),
		isCoreSite: Boolean(record.isCoreSite ?? record.coreSiteYN ?? record.CoreSiteYN),
		sinNumber: toStringValue(record.sinNumber ?? record.SinNumber ?? record.SINNumber),
		telephone: toStringValue(record.telephone ?? record.telephoneNumber ?? record.TelephoneNumber),
		status: toStringValue(record.status ?? record.RecordIsDeletedYN ?? record.recordIsDeletedYN) || 'active',
		createdAt: toStringValue(record.createdAt ?? record.dateCreated ?? record.DateCreated),
		updatedAt: toStringValue(record.updatedAt ?? record.dateModified ?? record.DateModified),
	}
}

const formatMoney = (value: number) =>
	`£${value.toLocaleString('en-GB', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	})}`

const toTitleCase = (value: string) =>
	value.length > 0 ? `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}` : value

type DatePreset = 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom'

const toDateInputValue = (date: Date) => format(date, 'yyyy-MM-dd')

const fromDateInputValue = (value: string): Date | null => {
	if (!value) return null
	const parsed = new Date(`${value}T00:00:00`)
	return Number.isNaN(parsed.getTime()) ? null : parsed
}

const debugLogsEnabled = import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true'

const DataAnalyticsHub = () => {
	const { toast } = useToast()

	const [analyticsErrorMessage, setAnalyticsErrorMessage] = useState<string | null>(null)
	const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 90))
	const [endDate, setEndDate] = useState<Date>(new Date())
	const [datePreset, setDatePreset] = useState<DatePreset>('last-90-days')
	const [regions, setRegions] = useState<Region[]>([])
	const [sites, setSites] = useState<Site[]>([])
	const [customerOptions, setCustomerOptions] = useState<Array<{ id: string; name: string }>>([])
	const [loadingCustomers, setLoadingCustomers] = useState(true)
	const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>('all')
	const [selectedRegionId, setSelectedRegionId] = useState<string>('all')
	const [selectedStoreId, setSelectedStoreId] = useState<string>('all')
	const [loadingFilters, setLoadingFilters] = useState(true)
	const { selectedCustomerId, setSelectedCustomerId, isAdmin } = useCustomerSelection()

	const effectiveCustomerId = useMemo(() => {
		if (selectedCustomerFilter !== 'all') {
			const parsed = Number(selectedCustomerFilter)
			return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
		}
		return selectedCustomerId ?? undefined
	}, [selectedCustomerFilter, selectedCustomerId])

	useEffect(() => {
		if (!isAdmin && selectedCustomerId) {
			setSelectedCustomerFilter(String(selectedCustomerId))
		}
	}, [isAdmin, selectedCustomerId])

	useEffect(() => {
		if (!isAdmin) return
		if (selectedCustomerFilter !== 'all') return
		if (customerOptions.length === 0) return
		const firstCustomerId = customerOptions[0]?.id
		if (!firstCustomerId) return
		setSelectedCustomerFilter(firstCustomerId)
		const parsed = Number(firstCustomerId)
		setSelectedCustomerId(Number.isFinite(parsed) ? parsed : null)
	}, [isAdmin, customerOptions, selectedCustomerFilter, setSelectedCustomerId])

	// Load customers for admin filter dropdown.
	useEffect(() => {
		const loadCustomers = async () => {
			const startedAt = performance.now()
			setLoadingCustomers(true)
			try {
				const customers = await customerService.getAvailableCustomers()
				setCustomerOptions(customers.map((customer) => ({
					id: String(customer.id),
					name: customer.name,
				})))
				if (debugLogsEnabled) {
					logger.debug('[DataAnalyticsHub] customers loaded', {
						count: customers.length,
						elapsedMs: Math.round(performance.now() - startedAt),
					})
				}
			} catch (err) {
				console.error('Failed to load customers:', err)
				toast({
					title: 'Warning',
					description: 'Failed to load customer options.',
					variant: 'destructive',
				})
			} finally {
				if (debugLogsEnabled) {
					logger.debug('[DataAnalyticsHub] customer loading finished', {
						elapsedMs: Math.round(performance.now() - startedAt),
					})
				}
				setLoadingCustomers(false)
			}
		}

		loadCustomers()
	}, [toast])

	// Load filters (regions and sites)
	useEffect(() => {
		const loadFilters = async () => {
			const startedAt = performance.now()
			if (isAdmin && !effectiveCustomerId) {
				setRegions([])
				setSites([])
				setLoadingFilters(false)
				if (debugLogsEnabled) {
					logger.debug('[DataAnalyticsHub] filter loading skipped', {
						reason: 'admin-no-customer-selected',
						elapsedMs: Math.round(performance.now() - startedAt),
					})
				}
				return
			}
			setLoadingFilters(true)
			try {
				let regionsRaw: unknown[] = []
				let sitesRaw: unknown[] = []
				if (effectiveCustomerId) {
					const [regionResponse, siteResponse] = await Promise.all([
						regionService.getRegionsByCustomer(effectiveCustomerId),
						siteService.getSitesByCustomer(effectiveCustomerId),
					])
					regionsRaw = extractList(regionResponse.data)
					sitesRaw = extractList(siteResponse.data)
				} else {
					const [regionResponse, siteResponse] = await Promise.all([
						regionService.getRegions(),
						siteService.getSites(),
					])
					regionsRaw = extractList(regionResponse.data)
					sitesRaw = extractList(siteResponse.data)
				}
				const regionsData = regionsRaw
					.map(normalizeRegion)
					.filter((region): region is Region => Boolean(region))
				const sitesData = sitesRaw
					.map(normalizeSite)
					.filter((site): site is Site => Boolean(site))
				setRegions(regionsData)
				setSites(sitesData)
				if (debugLogsEnabled) {
					logger.debug('[DataAnalyticsHub] filter options loaded', {
						effectiveCustomerId,
						regionCount: regionsData.length,
						siteCount: sitesData.length,
						elapsedMs: Math.round(performance.now() - startedAt),
					})
				}
			} catch (err) {
				console.error('Failed to load filter options:', err)
				toast({
					title: 'Warning',
					description: 'Failed to load filter options. Some filters may not be available.',
					variant: 'destructive',
				})
			} finally {
				if (debugLogsEnabled) {
					logger.debug('[DataAnalyticsHub] filter loading finished', {
						effectiveCustomerId,
						elapsedMs: Math.round(performance.now() - startedAt),
					})
				}
				setLoadingFilters(false)
			}
		}

		loadFilters()
	}, [effectiveCustomerId, isAdmin, toast])

	useEffect(() => {
		if (selectedRegionId === 'all') return
		const hasRegion = regions.some(region => region.id === selectedRegionId)
		if (!hasRegion) {
			setSelectedRegionId('all')
		}
	}, [regions, selectedRegionId])

	// Filter sites by selected region
	const filteredSites = useMemo(() => {
		if (selectedRegionId === 'all') {
			return sites
		}
		return sites.filter((site) => {
			// Handle different Site type structures
			const siteRegionId = (site as any).regionId || (site as any).fkRegionID || (site as any).regionID
			return String(siteRegionId) === selectedRegionId
		})
	}, [sites, selectedRegionId])

	useEffect(() => {
		if (selectedStoreId === 'all') return
		const hasStore = filteredSites.some((site) => {
			const siteId = (site as any).siteID || (site as any).id
			return String(siteId) === selectedStoreId
		})
		if (!hasStore) {
			setSelectedStoreId('all')
		}
	}, [filteredSites, selectedStoreId])

	const analyticsQueryFilters = useMemo(
		() => ({
			startDate: format(startDate, 'yyyy-MM-dd'),
			endDate: format(endDate, 'yyyy-MM-dd'),
			customerId: effectiveCustomerId,
			regionIds: selectedRegionId !== 'all' ? [Number(selectedRegionId)] : undefined,
			storeIds: selectedStoreId !== 'all' ? [Number(selectedStoreId)] : undefined,
		}),
		[startDate, endDate, effectiveCustomerId, selectedRegionId, selectedStoreId]
	)

	const storeOptions = useMemo(
		() =>
			sites.map((site) => ({
				id: (site as any).siteID || (site as any).id,
				name:
					(site as any).locationName ||
					(site as any).name ||
					`Store ${(site as any).siteID || (site as any).id}`,
			})),
		[sites]
	)

	const regionOptions = useMemo(
		() =>
			regions.map((region) => ({
				id: region.id,
				name: region.name,
			})),
		[regions]
	)

	const analyticsQueryEnabled = !loadingFilters && !(isAdmin && !effectiveCustomerId)

	const {
		data,
		isLoading: analyticsLoading,
		isFetching: analyticsFetching,
		error: analyticsQueryError,
		refetch: refetchAnalytics,
	} = useAnalyticsHubQuery(analyticsQueryFilters, {
		enabled: analyticsQueryEnabled,
		stores: storeOptions,
		regions: regionOptions,
	})

	const loading = analyticsLoading || (analyticsFetching && !data)
	const error =
		isAdmin && !effectiveCustomerId && !loadingFilters
			? 'Select a customer to load analytics data.'
			: analyticsErrorMessage

	useEffect(() => {
		if (!analyticsQueryError) {
			setAnalyticsErrorMessage(null)
			return
		}

		const message =
			analyticsQueryError instanceof Error
				? analyticsQueryError.message
				: 'Failed to load analytics data'
		setAnalyticsErrorMessage(message)
		console.error('Failed to load analytics data:', analyticsQueryError)
		toast({
			title: 'Error',
			description: 'Failed to load analytics data. Please try again.',
			variant: 'destructive',
		})
	}, [analyticsQueryError, toast])

	// Reset store selection when region changes
	useEffect(() => {
		if (selectedRegionId === 'all') {
			return
		}
		const regionSites = filteredSites
		const currentStoreInRegion = regionSites.some((s) => {
			const siteId = (s as any).siteID || (s as any).id
			return String(siteId) === selectedStoreId
		})
		if (selectedStoreId !== 'all' && !currentStoreInRegion) {
			setSelectedStoreId('all')
		}
	}, [selectedRegionId, filteredSites, selectedStoreId])

	const handleStartDateChange = (date: Date | null) => {
		if (!date) return
		setDatePreset('custom')
		setStartDate(date)
		if (date > endDate) {
			setEndDate(date)
		}
	}

	const handleEndDateChange = (date: Date | null) => {
		if (!date) return
		setDatePreset('custom')
		setEndDate(date)
		if (date < startDate) {
			setStartDate(date)
		}
	}

	const handlePresetChange = (preset: DatePreset) => {
		setDatePreset(preset)
		if (preset === 'custom') return

		const now = new Date()
		const end = new Date(now)
		const start = new Date(now)

		if (preset === 'last-7-days') {
			start.setDate(now.getDate() - 6)
		} else if (preset === 'last-30-days') {
			start.setDate(now.getDate() - 29)
		} else {
			start.setDate(now.getDate() - 89)
		}

		setStartDate(start)
		setEndDate(end)
	}

	const handleCustomerChange = (value: string) => {
		setSelectedCustomerFilter(value)
		setSelectedRegionId('all')
		setSelectedStoreId('all')
		if (value === 'all') {
			setSelectedCustomerId(null)
			return
		}
		const parsed = Number(value)
		setSelectedCustomerId(Number.isFinite(parsed) ? parsed : null)
	}

	const handleRefresh = () => {
		void refetchAnalytics()
	}

	const handleExport = () => {
		if (!data) {
			toast({
				title: 'Nothing to export',
				description: 'Load analytics data for the selected filters before exporting.',
				variant: 'destructive',
			})
			return
		}

		downloadAnalyticsHubCsv(data)
		toast({
			title: 'Export started',
			description: 'Analytics summary downloaded as CSV.',
		})
	}

	const analyticsSummary = useMemo(() => {
		if (!data) {
			return {
				totalIncidents: 0,
				offendersTracked: 0,
				totalStolen: 0,
				valueSaved: 0,
				valueLost: 0,
				recoveryRate: 0,
				overallRisk: 'Low',
				riskCounts: { high: 0, medium: 0, low: 0 },
				topRiskStoreLabel: 'N/A',
				insights: [] as string[],
			}
		}

		const totalIncidents = data.crimeTrends.totalIncidents
		const offendersTracked = data.repeatOffenders.totalOffenders
		const valueLost = data.hotProducts.totalValueLost
		const valueSaved = data.hotProducts.totalValueRecovered
		const totalStolen = valueSaved + valueLost
		const linkedIncidentRatio = totalIncidents > 0
			? (data.crimeLinking.totalLinkedIncidents / totalIncidents) * 100
			: 0
		const totalImpact = valueSaved + valueLost
		const recoveryRate = totalImpact > 0 ? (valueSaved / totalImpact) * 100 : 0
		const riskCounts = data.deploymentRecommendations.storeRankings.reduce(
			(acc, store) => {
				const normalizedRisk = store.riskLevel.toLowerCase()
				if (normalizedRisk === 'critical' || normalizedRisk === 'high') {
					acc.high += 1
				} else if (normalizedRisk === 'medium') {
					acc.medium += 1
				} else {
					acc.low += 1
				}
				return acc
			},
			{ high: 0, medium: 0, low: 0 }
		)
		const highRiskStores = riskCounts.high
		const topRiskStore = data.deploymentRecommendations.storeRankings[0]
		const topOffender = data.repeatOffenders.mostActive[0]
		const topRiskStoreLabel = topRiskStore
			? `${topRiskStore.storeName} (${toTitleCase(topRiskStore.riskLevel)})`
			: 'N/A'
		const overallRisk = riskCounts.high > 0 ? 'High' : riskCounts.medium > 0 ? 'Medium' : 'Low'

		const topStoreHeatmap = topRiskStore
			? data.hotProducts.storeHeatmap.find((store) => store.storeName === topRiskStore.storeName)
			: undefined
		const topStoreUnrecoveredLoss = topStoreHeatmap
			? topStoreHeatmap.products.reduce((sum, product) => sum + product.value, 0)
			: topRiskStore && totalIncidents > 0
				? (valueLost / totalIncidents) * topRiskStore.incidentCount
				: 0

		const insights = [
			`${topRiskStore?.storeName ?? 'Top store'} recovered ${recoveryRate.toFixed(1)}% of stolen value across the selected range`,
			`${topRiskStore?.storeName ?? 'Top store'} has the highest estimated unrecovered loss at ${formatMoney(topStoreUnrecoveredLoss)}`,
			topOffender
				? `${topOffender.name.toLowerCase()} leads recovered value at ${formatMoney(topOffender.totalValue)}`
				: 'No offender profile data available',
			`${highRiskStores} high-risk stores identified`,
			`Linked incident confidence ${linkedIncidentRatio.toFixed(1)}%`,
		]

		return {
			totalIncidents,
			offendersTracked,
			totalStolen,
			valueSaved,
			valueLost,
			recoveryRate,
			overallRisk,
			riskCounts,
			topRiskStoreLabel,
			insights: insights.slice(0, 3),
		}
	}, [data])

	if (error && !data) {
		return (
			<div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
				<Card>
					<CardHeader className="p-4 sm:p-6">
						<CardTitle className="text-lg sm:text-xl">Data Analytics Hub</CardTitle>
						<CardDescription className="text-xs sm:text-sm">Error loading analytics data</CardDescription>
					</CardHeader>
					<CardContent className="p-4 sm:p-6">
						<div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-4">
							<AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500" />
							<p className="text-sm sm:text-base text-red-600 text-center">{error}</p>
							<Button onClick={handleRefresh} className="text-sm">
								<RefreshCw className="h-4 w-4 mr-2" />
								Retry
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<ErrorBoundary>
			<div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#EFF4FF]">
				<div className="mx-auto max-w-screen-2xl space-y-4 px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6">
				<Card className="border-slate-200 bg-white">
					<CardHeader className="p-4 sm:p-5">
						<div className="space-y-4">
							<div className="space-y-1">
								<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
									<BarChart3 className="h-4 w-4 text-indigo-600 sm:h-5 sm:w-5" />
									Crime Analytics & AI Hub
								</CardTitle>
								<CardDescription className="text-[11px] sm:text-xs">
									Comprehensive crime analytics, AI-driven risk insights, and repeat offender intelligence.
								</CardDescription>
							</div>

							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
								<div className="space-y-1">
									<label className="text-[11px] font-medium text-slate-600">Customer</label>
									<Select value={selectedCustomerFilter} onValueChange={handleCustomerChange} disabled={loadingCustomers || !isAdmin}>
										<SelectTrigger className="h-9 text-xs sm:text-sm"><SelectValue placeholder="Select customer" /></SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Customers</SelectItem>
											{customerOptions.map((customer) => (
												<SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1">
									<label className="text-[11px] font-medium text-slate-600">Start date</label>
									<Input
										type="date"
										value={toDateInputValue(startDate)}
										max={toDateInputValue(endDate)}
										onChange={(event) => handleStartDateChange(fromDateInputValue(event.target.value))}
										className="h-9 w-full text-xs sm:text-sm"
									/>
								</div>
								<div className="space-y-1">
									<label className="text-[11px] font-medium text-slate-600">End date</label>
									<Input
										type="date"
										value={toDateInputValue(endDate)}
										min={toDateInputValue(startDate)}
										max={toDateInputValue(new Date())}
										onChange={(event) => handleEndDateChange(fromDateInputValue(event.target.value))}
										className="h-9 w-full text-xs sm:text-sm"
									/>
								</div>
								<div className="space-y-1">
									<label className="text-[11px] font-medium text-slate-600">Date range</label>
									<Select value={datePreset} onValueChange={value => handlePresetChange(value as DatePreset)}>
										<SelectTrigger className="h-9 text-xs sm:text-sm"><SelectValue /></SelectTrigger>
										<SelectContent>
											<SelectItem value='last-7-days'>Last 7 days</SelectItem>
											<SelectItem value='last-30-days'>Last 30 days</SelectItem>
											<SelectItem value='last-90-days'>Last 90 days</SelectItem>
											<SelectItem value='custom'>Custom</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
								<Select value={selectedRegionId} onValueChange={setSelectedRegionId} disabled={loadingFilters}>
									<SelectTrigger className="h-9 text-xs sm:text-sm">
										<Building2 className="mr-2 h-4 w-4 flex-shrink-0" />
										<SelectValue placeholder="All Regions" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Regions</SelectItem>
										{regions.map((region) => (
											<SelectItem key={region.id} value={String(region.id)}>{region.name}</SelectItem>
										))}
									</SelectContent>
								</Select>

								<Select value={selectedStoreId} onValueChange={setSelectedStoreId} disabled={loadingFilters || filteredSites.length === 0}>
									<SelectTrigger className="h-9 text-xs sm:text-sm">
										<MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
										<SelectValue placeholder="All Stores" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Stores</SelectItem>
										{filteredSites.map((site) => {
											const siteId = (site as any).siteID || (site as any).id
											const siteName = (site as any).locationName || (site as any).name || `Store ${siteId}`
											return <SelectItem key={siteId} value={String(siteId)}>{siteName}</SelectItem>
										})}
									</SelectContent>
								</Select>
							</div>

							<div className="flex flex-wrap gap-2">
								<Button variant="outline" onClick={handleRefresh} disabled={loading} size="sm" className="h-8 text-xs">
									<RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
									Refresh
								</Button>
								<Button variant="outline" onClick={handleExport} size="sm" className="h-8 text-xs">
									<Download className="mr-1.5 h-3.5 w-3.5" />
									Export
								</Button>
								{(selectedCustomerFilter !== 'all' || selectedRegionId !== 'all' || selectedStoreId !== 'all') && (
									<Button
										variant="outline"
										onClick={() => {
											if (isAdmin) {
												setSelectedCustomerFilter('all')
												setSelectedCustomerId(null)
											}
											setSelectedRegionId('all')
											setSelectedStoreId('all')
										}}
										size="sm"
										className="h-8 text-xs"
									>
										<Filter className="mr-1.5 h-3.5 w-3.5" />
										Clear filters
									</Button>
								)}
							</div>

							{data && (
								<div className="rounded-lg border border-blue-100 bg-[#D6E3F7] p-3">
									<div className="grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-6 sm:text-xs">
										<div>
											<p className="font-semibold uppercase text-slate-500">Date Range</p>
											<p className="mt-1 font-semibold text-slate-900">
												{format(new Date(data.metadata.dateRange.start), 'MMM dd')} - {format(new Date(data.metadata.dateRange.end), 'MMM dd, yy')}
											</p>
										</div>
										<div>
											<p className="font-semibold uppercase text-slate-500">Total Incidents</p>
											<p className="mt-1 font-semibold text-slate-900">{analyticsSummary.totalIncidents.toLocaleString()}</p>
										</div>
										<div>
											<p className="font-semibold uppercase text-slate-500">Total Stolen</p>
											<p className="mt-1 font-semibold text-slate-900">{formatMoney(analyticsSummary.totalStolen)}</p>
										</div>
										<div>
											<p className="font-semibold uppercase text-slate-500">Value Saved</p>
											<p className="mt-1 font-semibold text-emerald-700">{formatMoney(analyticsSummary.valueSaved)}</p>
										</div>
										<div>
											<p className="font-semibold uppercase text-slate-500">Value Lost</p>
											<p className="mt-1 font-semibold text-rose-700">{formatMoney(analyticsSummary.valueLost)}</p>
										</div>
										<div>
											<p className="font-semibold uppercase text-slate-500">Recovery Rate</p>
											<p className="mt-1 font-semibold text-indigo-700">{analyticsSummary.recoveryRate.toFixed(1)}%</p>
										</div>
									</div>
									<div className="mt-2 grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-6 sm:text-xs">
										<div>
											<p className="font-semibold uppercase text-slate-500">Offenders Tracked</p>
											<p className="mt-1 font-semibold text-slate-900">{analyticsSummary.offendersTracked.toLocaleString()}</p>
										</div>
									</div>
									<div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
										<span className="inline-flex items-center rounded-full bg-indigo-600 px-2 py-0.5 font-semibold text-white">AI Risk Engine</span>
										<span className="text-slate-600">Overall risk: <span className="font-semibold text-slate-900">{analyticsSummary.overallRisk}</span></span>
										<span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-rose-700">{analyticsSummary.riskCounts.high} high</span>
										<span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">{analyticsSummary.riskCounts.medium} medium</span>
										<span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">{analyticsSummary.riskCounts.low} low</span>
										<span className="text-slate-600">Top store: <span className="font-semibold text-slate-900">{analyticsSummary.topRiskStoreLabel}</span></span>
									</div>
									<div className="mt-4 space-y-2.5">
										{analyticsSummary.insights.map((insight) => (
											<div
												key={insight}
												className="min-h-[2.75rem] rounded-md border border-slate-100 bg-white px-3 py-2.5 text-xs leading-relaxed text-slate-700 sm:min-h-[3rem] sm:px-4 sm:py-3 sm:text-sm"
											>
												{insight}
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</CardHeader>
				</Card>

				{/* Loading State */}
				{loading && !data && (
					<div className="space-y-4 sm:space-y-6">
						{Array.from({ length: 5 }).map((_, i) => (
							<Card key={i}>
								<CardHeader className="p-4 sm:p-6">
									<Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
									<Skeleton className="h-3 sm:h-4 w-48 sm:w-64 mt-2" />
								</CardHeader>
								<CardContent className="p-4 sm:p-6 pt-0">
									<Skeleton className="h-64 sm:h-80 md:h-96 w-full" />
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Analytics Modules - single focused view at a time */}
				{data && (
					<Card className="overflow-hidden border-slate-200 bg-white">
						<CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
							<CardTitle className="text-sm sm:text-base font-semibold">
								Select an analytics view to focus on a single insight at a time
							</CardTitle>
							<CardDescription className="text-xs sm:text-sm">
								All views respect the date range, region and store filters from the header above.
							</CardDescription>
						</CardHeader>
						<CardContent className="p-4 sm:p-6 pt-0 overflow-x-hidden">
							<Tabs defaultValue="crime-trends" className="w-full">
								<div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
									<TabsList className="mb-4 grid h-auto min-w-max grid-cols-2 gap-1 rounded-md bg-slate-100 p-1 sm:min-w-0 sm:grid-cols-3 lg:grid-cols-5">
										<TabsTrigger value="crime-trends" className="whitespace-nowrap rounded-sm py-2 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white sm:text-sm">Crime Trends</TabsTrigger>
										<TabsTrigger value="deployment" className="whitespace-nowrap rounded-sm py-2 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white sm:text-sm">Deployment</TabsTrigger>
										<TabsTrigger value="hot-products" className="whitespace-nowrap rounded-sm py-2 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white sm:text-sm">Hot Products</TabsTrigger>
										<TabsTrigger value="repeat-offenders" className="whitespace-nowrap rounded-sm py-2 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white sm:text-sm">Offenders</TabsTrigger>
										<TabsTrigger value="crime-linking" className="whitespace-nowrap rounded-sm py-2 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white sm:text-sm">Crime Linking</TabsTrigger>
									</TabsList>
								</div>

								<TabsContent value="crime-trends" className="mt-3 sm:mt-4 overflow-x-hidden">
									<ErrorBoundary>
										<CrimeTrendExplorer data={data.crimeTrends} loading={loading} />
									</ErrorBoundary>
								</TabsContent>

								<TabsContent value="deployment" className="mt-3 sm:mt-4 overflow-x-hidden">
									<ErrorBoundary>
										<ResourceDeploymentEngine
											data={data.deploymentRecommendations}
											loading={loading}
										/>
									</ErrorBoundary>
								</TabsContent>

								<TabsContent value="hot-products" className="mt-3 sm:mt-4 overflow-x-hidden">
									<ErrorBoundary>
										<HotProductsDashboard data={data.hotProducts} loading={loading} />
									</ErrorBoundary>
								</TabsContent>

								<TabsContent value="repeat-offenders" className="mt-3 sm:mt-4 overflow-x-hidden">
									<ErrorBoundary>
										<RepeatOffenderAnalysis
											data={data.repeatOffenders}
											loading={loading}
										/>
									</ErrorBoundary>
								</TabsContent>

								<TabsContent value="crime-linking" className="mt-3 sm:mt-4 overflow-x-hidden">
									<ErrorBoundary>
										<CrimeLinkingPanel data={data.crimeLinking} loading={loading} />
									</ErrorBoundary>
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>
				)}

				{/* Error State (partial data) */}
				{error && data && (
					<Card className="border-yellow-200 bg-yellow-50 overflow-hidden">
						<CardContent className="p-3 sm:p-4">
							<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-yellow-800">
								<div className="flex items-center gap-2 flex-1 min-w-0">
									<AlertCircle className="h-4 w-4 flex-shrink-0" />
									<span className="text-xs sm:text-sm break-words">
										Some data may be outdated. Error: {error}
									</span>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleRefresh}
									className="w-full sm:w-auto text-xs sm:text-sm flex-shrink-0"
								>
									<RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
									Retry
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
				</div>
			</div>
		</ErrorBoundary>
	)
}

export default DataAnalyticsHub

