/**
 * Data Analytics Hub Page
 * 
 * Main page that orchestrates all analytics modules:
 * - Crime Trend Explorer
 * - Hot Products Dashboard
 * - Repeat Offender Analysis
 * - Resource Deployment Engine
 * - Crime Linking Panel
 */

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import ErrorBoundary from '@/components/ErrorBoundary'
import { analyticsService } from '@/services/analyticsService'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AnalyticsHubData } from '@/types/analytics'
import { CrimeTrendExplorer } from './components/CrimeTrendExplorer'
import { HotProductsDashboard } from './components/HotProductsDashboard'
import { RepeatOffenderAnalysis } from './components/RepeatOffenderAnalysis'
import { ResourceDeploymentEngine } from './components/ResourceDeploymentEngine'
import { CrimeLinkingPanel } from './components/CrimeLinkingPanel'
import {
	BarChart3,
	RefreshCw,
	Calendar as CalendarIcon,
	Download,
	Filter,
	AlertCircle,
} from 'lucide-react'
import { format, subDays } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { customerDashboardService } from '@/services/dashboardService'
import type { Region, Site } from '@/types/dashboard'
import { useCustomerSelection } from '@/contexts/CustomerSelectionContext'
import { MapPin, Building2 } from 'lucide-react'

const DataAnalyticsHub = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const { toast } = useToast()

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [data, setData] = useState<AnalyticsHubData | null>(null)
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: subDays(new Date(), 90),
		to: new Date(),
	})
	const [regions, setRegions] = useState<Region[]>([])
	const [sites, setSites] = useState<Site[]>([])
	const [selectedRegionId, setSelectedRegionId] = useState<string>('all')
	const [selectedStoreId, setSelectedStoreId] = useState<string>('all')
	const [loadingFilters, setLoadingFilters] = useState(true)
	const { selectedCustomerId } = useCustomerSelection()

	// Load filters (regions and sites)
	useEffect(() => {
		const loadFilters = async () => {
			setLoadingFilters(true)
			try {
				const [regionsData, sitesData] = await Promise.all([
					customerDashboardService.getRegions(),
					customerDashboardService.getSites(),
				])
				setRegions(regionsData)
				setSites(sitesData)
			} catch (err) {
				console.error('Failed to load filter options:', err)
				toast({
					title: 'Warning',
					description: 'Failed to load filter options. Some filters may not be available.',
					variant: 'destructive',
				})
			} finally {
				setLoadingFilters(false)
			}
		}

		loadFilters()
	}, [])

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

	// Load analytics data
	const loadData = async () => {
		setLoading(true)
		setError(null)

		try {
			// Prepare store and region options for consistent naming
			const storeOptions = sites.map((site) => ({
				id: (site as any).siteID || (site as any).id,
				name: (site as any).locationName || (site as any).name || `Store ${(site as any).siteID || (site as any).id}`,
			}))

			const regionOptions = regions.map((region) => ({
				id: region.id,
				name: region.name,
			}))

			const params = {
				startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
				endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
				customerId: selectedCustomerId || undefined,
				regionIds: selectedRegionId !== 'all' ? [Number(selectedRegionId)] : undefined,
				storeIds: selectedStoreId !== 'all' ? [Number(selectedStoreId)] : undefined,
				stores: storeOptions,
				regions: regionOptions,
			}

			const analyticsData = await analyticsService.getAnalyticsHub(params)
			setData(analyticsData)
		} catch (err) {
			console.error('Failed to load analytics data:', err)
			setError(err instanceof Error ? err.message : 'Failed to load analytics data')
			toast({
				title: 'Error',
				description: 'Failed to load analytics data. Please try again.',
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadData()
	}, [dateRange, selectedRegionId, selectedStoreId, selectedCustomerId])

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

	const handleDateRangeChange = (range: DateRange | undefined) => {
		setDateRange(range)
	}

	const handleRefresh = () => {
		loadData()
	}

	const handleExport = () => {
		// TODO: Implement export functionality
		toast({
			title: 'Export',
			description: 'Export functionality will be implemented soon.',
		})
	}

	if (error && !data) {
		return (
			<div className="container mx-auto p-6">
				<Card>
					<CardHeader>
						<CardTitle>Data Analytics Hub</CardTitle>
						<CardDescription>Error loading analytics data</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col items-center justify-center py-12 space-y-4">
							<AlertCircle className="h-12 w-12 text-red-500" />
							<p className="text-red-600">{error}</p>
							<Button onClick={handleRefresh}>
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
			<div className="container mx-auto p-4 sm:p-6 space-y-8">
				{/* Header */}
				<Card>
					<CardHeader>
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div>
								<CardTitle className="flex items-center gap-2 text-2xl">
									<BarChart3 className="h-6 w-6" />
									Data Analytics Hub
								</CardTitle>
								<CardDescription className="mt-2">
									Comprehensive crime analytics and intelligence dashboard
									{(selectedRegionId !== 'all' || selectedStoreId !== 'all') && (
										<span className="block mt-1 text-xs text-blue-600">
											Filters active: {selectedRegionId !== 'all' && 'Region • '}
											{selectedStoreId !== 'all' && 'Store'}
										</span>
									)}
								</CardDescription>
							</div>
							<div className="flex flex-col gap-3">
								<div className="flex flex-col sm:flex-row gap-2">
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className={cn(
													'w-full sm:w-auto justify-start text-left font-normal',
													!dateRange && 'text-muted-foreground'
												)}
											>
												<CalendarIcon className="h-4 w-4 mr-2" />
												{dateRange?.from ? (
													dateRange.to ? (
														<>
															{format(dateRange.from, 'LLL dd, y')} -{' '}
															{format(dateRange.to, 'LLL dd, y')}
														</>
													) : (
														format(dateRange.from, 'LLL dd, y')
													)
												) : (
													'Pick a date range'
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="range"
												selected={dateRange}
												onSelect={handleDateRangeChange}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
									<Select
										value={selectedRegionId}
										onValueChange={setSelectedRegionId}
										disabled={loadingFilters}
									>
										<SelectTrigger className="w-full sm:w-48">
											<Building2 className="h-4 w-4 mr-2" />
											<SelectValue placeholder="All Regions" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Regions</SelectItem>
											{regions.map((region) => (
												<SelectItem key={region.id} value={String(region.id)}>
													{region.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Select
										value={selectedStoreId}
										onValueChange={setSelectedStoreId}
										disabled={loadingFilters || filteredSites.length === 0}
									>
										<SelectTrigger className="w-full sm:w-48">
											<MapPin className="h-4 w-4 mr-2" />
											<SelectValue placeholder="All Stores" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Stores</SelectItem>
											{filteredSites.map((site) => {
												const siteId = (site as any).siteID || (site as any).id
												const siteName = (site as any).locationName || (site as any).name || `Store ${siteId}`
												return (
													<SelectItem key={siteId} value={String(siteId)}>
														{siteName}
													</SelectItem>
												)
											})}
										</SelectContent>
									</Select>
								</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										onClick={handleRefresh}
										disabled={loading}
									>
										<RefreshCw
											className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
										/>
										Refresh
									</Button>
									<Button variant="outline" onClick={handleExport}>
										<Download className="h-4 w-4 mr-2" />
										Export
									</Button>
									{(selectedRegionId !== 'all' || selectedStoreId !== 'all') && (
										<Button
											variant="outline"
											onClick={() => {
												setSelectedRegionId('all')
												setSelectedStoreId('all')
											}}
										>
											<Filter className="h-4 w-4 mr-2" />
											Clear Filters
										</Button>
									)}
								</div>
							</div>
						</div>
						{data && (
							<div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
								<div className="text-center sm:text-left">
									<div className="text-sm text-gray-500">Date Range</div>
									<div className="text-sm font-medium">
										{format(new Date(data.metadata.dateRange.start), 'MMM dd')} -{' '}
										{format(new Date(data.metadata.dateRange.end), 'MMM dd, yyyy')}
									</div>
								</div>
								<div className="text-center sm:text-left">
									<div className="text-sm text-gray-500">Total Incidents</div>
									<div className="text-sm font-medium">
										{data.crimeTrends.totalIncidents.toLocaleString()}
									</div>
								</div>
								<div className="text-center sm:text-left">
									<div className="text-sm text-gray-500">Value Lost</div>
									<div className="text-sm font-medium">
										£{data.hotProducts.totalValueLost.toLocaleString('en-GB', {
											minimumFractionDigits: 0,
											maximumFractionDigits: 0,
										})}
									</div>
								</div>
								<div className="text-center sm:text-left">
									<div className="text-sm text-gray-500">Offenders Tracked</div>
									<div className="text-sm font-medium">
										{data.repeatOffenders.totalOffenders}
									</div>
								</div>
							</div>
						)}
					</CardHeader>
				</Card>

				{/* Loading State */}
				{loading && !data && (
					<div className="space-y-6">
						{Array.from({ length: 5 }).map((_, i) => (
							<Card key={i}>
								<CardHeader>
									<Skeleton className="h-6 w-48" />
									<Skeleton className="h-4 w-64 mt-2" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-96 w-full" />
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Analytics Modules - single focused view at a time */}
				{data && (
					<Card>
						<CardHeader className="pb-4">
							<CardTitle className="text-base">
								Select an analytics view to focus on a single insight at a time
							</CardTitle>
							<CardDescription>
								All views respect the date range, region and store filters from the header above.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Tabs defaultValue="crime-trends" className="w-full">
								<TabsList className="w-full grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 mb-4">
									<TabsTrigger value="crime-trends">Crime Trends</TabsTrigger>
									<TabsTrigger value="deployment">Resource Deployment</TabsTrigger>
									<TabsTrigger value="hot-products">Hot Products &amp; Heatmaps</TabsTrigger>
									<TabsTrigger value="repeat-offenders">Repeat Offenders</TabsTrigger>
									<TabsTrigger value="crime-linking">Crime Linking Panel</TabsTrigger>
								</TabsList>

								<TabsContent value="crime-trends" className="mt-4">
									<ErrorBoundary>
										<CrimeTrendExplorer data={data.crimeTrends} loading={loading} />
									</ErrorBoundary>
								</TabsContent>

								<TabsContent value="deployment" className="mt-4">
									<ErrorBoundary>
										<ResourceDeploymentEngine
											data={data.deploymentRecommendations}
											loading={loading}
										/>
									</ErrorBoundary>
								</TabsContent>

								<TabsContent value="hot-products" className="mt-4">
									<ErrorBoundary>
										<HotProductsDashboard data={data.hotProducts} loading={loading} />
									</ErrorBoundary>
								</TabsContent>

								<TabsContent value="repeat-offenders" className="mt-4">
									<ErrorBoundary>
										<RepeatOffenderAnalysis
											data={data.repeatOffenders}
											loading={loading}
										/>
									</ErrorBoundary>
								</TabsContent>

								<TabsContent value="crime-linking" className="mt-4">
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
					<Card className="border-yellow-200 bg-yellow-50">
						<CardContent className="p-4">
							<div className="flex items-center gap-2 text-yellow-800">
								<AlertCircle className="h-4 w-4" />
								<span className="text-sm">
									Some data may be outdated. Error: {error}
								</span>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleRefresh}
									className="ml-auto"
								>
									<RefreshCw className="h-4 w-4 mr-2" />
									Retry
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</ErrorBoundary>
	)
}

export default DataAnalyticsHub

