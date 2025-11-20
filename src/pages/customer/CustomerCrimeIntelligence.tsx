import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, RefreshCcw, Target, TrendingUp, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell
} from 'recharts'

import { useAuth } from '@/contexts/AuthContext'
import { useCustomerSelection } from '@/contexts/CustomerSelectionContext'
import { findCustomerById } from '@/hooks/useAvailableCustomers'
import { siteService } from '@/services/siteService'
import { incidentGraphService, type RegionOption } from '@/services/incidentGraphService'
import { crimeIntelligenceService } from '@/services/crimeIntelligenceService'
import type { Site } from '@/types/customer'
import { CrimeInsightListItem, CrimeInsightTimeBucket, CrimeIntelligenceResponse } from '@/types/crimeIntelligence'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'

const chartColors = ['#6366f1', '#f97316', '#22c55e', '#0ea5e9', '#ec4899', '#facc15']

const defaultRangeDays = 90

const getIsoDate = (date?: Date | null) => {
	if (!date) return undefined
	return date.toISOString().split('T')[0]
}

const buildAnalystNotes = (insights: CrimeIntelligenceResponse): string[] => {
	const notes: string[] = []

	if (insights.topStores?.length) {
		const top = insights.topStores[0]
		notes.push(`${top.name} accounts for ${top.percentage.toFixed(1)}% of all incidents in this period.`)
	}

	if (insights.topProducts?.length) {
		const hot = insights.topProducts[0]
		notes.push(`"${hot.name}" is the most frequently stolen item with ${hot.count} units recorded.`)
	}

	if (insights.timeBuckets?.length) {
		const peak = [...insights.timeBuckets].sort((a, b) => b.count - a.count)[0]
		if (peak) {
			notes.push(`Incident activity peaks during ${peak.bucket.toLowerCase()} (${peak.percentage.toFixed(1)}% of cases).`)
		}
	}

	if (!notes.length) {
		notes.push('No significant trends detected for the selected filters.')
	}

	return notes
}

export default function CustomerCrimeIntelligence() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { toast } = useToast()
	const { user, isLoading: authLoading } = useAuth()
	const { isAdmin } = useCustomerSelection()

	const [customer, setCustomer] = useState<{ id: number; name: string } | null>(null)
	const [sites, setSites] = useState<Site[]>([])
	const [regions, setRegions] = useState<RegionOption[]>([])
	const [selectedSiteId, setSelectedSiteId] = useState<string>('all')
	const [selectedRegionId, setSelectedRegionId] = useState<string>('all')
	const [startDate, setStartDate] = useState<Date | undefined>(() => {
		const date = new Date()
		date.setDate(date.getDate() - defaultRangeDays)
		return date
	})
	const [endDate, setEndDate] = useState<Date | undefined>(new Date())

	const [insights, setInsights] = useState<CrimeIntelligenceResponse | null>(null)
	const [loadingInsights, setLoadingInsights] = useState(false)
	const [pageError, setPageError] = useState<string | null>(null)
	const [isResolvingCustomer, setIsResolvingCustomer] = useState(true)

	const urlCustomerId = searchParams.get('customerId')
	const urlSiteId = searchParams.get('siteId')

	const resolvedCustomerId = useMemo(() => {
		if (urlCustomerId) return parseInt(urlCustomerId, 10)
		if (user && 'customerId' in user) {
			return (user as any).customerId ?? null
		}
		return null
	}, [urlCustomerId, user])

	const customerFiltersReady = !!customer && !!resolvedCustomerId

	const loadCustomer = useCallback(async () => {
		if (authLoading) return
		if (!resolvedCustomerId) {
			if (isAdmin) {
				setPageError('Please select a customer from the sidebar to view insights.')
			} else {
				setPageError('No customer ID detected for your profile.')
			}
			setIsResolvingCustomer(false)
			return
		}

		try {
			const customerData = await findCustomerById(resolvedCustomerId)
			if (!customerData) {
				setPageError('Customer not found.')
			} else {
				setCustomer(customerData)
				if (urlSiteId) {
					setSelectedSiteId(urlSiteId)
				}
			}
		} catch (error) {
			console.error('CrimeIntelligence:Failed to load customer', error)
			setPageError('Unable to load customer context.')
		} finally {
			setIsResolvingCustomer(false)
		}
	}, [authLoading, resolvedCustomerId, isAdmin, urlSiteId])

	useEffect(() => {
		loadCustomer()
	}, [loadCustomer])

	const loadSites = useCallback(async () => {
		if (!resolvedCustomerId) return
		try {
			const response = await siteService.getSitesByCustomer(resolvedCustomerId)
			if (response.success) {
				setSites(response.data)
			}
		} catch (error) {
			console.error('CrimeIntelligence:Failed to fetch sites', error)
		}
	}, [resolvedCustomerId])

	const loadRegions = useCallback(async () => {
		if (!resolvedCustomerId) return
		try {
			const response = await incidentGraphService.fetchRegions(resolvedCustomerId)
			if (response.success) {
				setRegions(response.data)
			}
		} catch (error) {
			console.error('CrimeIntelligence:Failed to fetch regions', error)
		}
	}, [resolvedCustomerId])

	useEffect(() => {
		if (customerFiltersReady) {
			loadSites()
			loadRegions()
		}
	}, [customerFiltersReady, loadSites, loadRegions])

	const fetchInsights = useCallback(async () => {
		if (!resolvedCustomerId) return
		setLoadingInsights(true)
		setPageError(null)
		try {
			const response = await crimeIntelligenceService.getInsights({
				customerId: resolvedCustomerId,
				siteId: selectedSiteId !== 'all' ? selectedSiteId : undefined,
				regionId: selectedRegionId !== 'all' ? selectedRegionId : undefined,
				startDate: getIsoDate(startDate),
				endDate: getIsoDate(endDate)
			})

			if (!response.success) {
				 throw new Error(response.message || 'Failed to fetch insights')
			}

			setInsights(response)
		} catch (error) {
			console.error('CrimeIntelligence:Failed to fetch insights', error)
			const message = error instanceof Error ? error.message : 'Unable to load insights'
			setPageError(message)
			toast({
				variant: 'destructive',
				title: 'Unable to load data',
				description: message
			})
		} finally {
			setLoadingInsights(false)
		}
	}, [resolvedCustomerId, selectedSiteId, selectedRegionId, startDate, endDate, toast])

	useEffect(() => {
		if (customerFiltersReady) {
			fetchInsights()
		}
	}, [customerFiltersReady, fetchInsights])

	const filteredSites = useMemo(() => {
		if (!sites.length) return []
		return sites
	}, [sites])

	const analystNotes = useMemo(() => (insights ? buildAnalystNotes(insights) : []), [insights])

	const renderHeroMetrics = () => {
		if (loadingInsights || !insights) {
			return (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{Array.from({ length: 4 }).map((_, idx) => (
						<Card key={`hero-skeleton-${idx}`} className="p-4">
							<Skeleton className="h-4 w-24 mb-4" />
							<Skeleton className="h-8 w-32" />
						</Card>
					))}
				</div>
			)
		}

		if (!insights.heroMetrics.length) return null

		return (
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{insights.heroMetrics.map(metric => (
					<Card key={metric.title} className="shadow-sm border border-slate-200">
						<CardHeader className="pb-2">
							<CardTitle className="text-sm text-slate-500">{metric.title}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<p className="text-3xl font-semibold tracking-tight">{metric.value}</p>
							{metric.subtext && (
								<p className="text-xs text-slate-500">{metric.subtext}</p>
							)}
							{metric.trend && (
								<p className={`text-xs font-medium ${metric.trendIsPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
									{metric.trend}
								</p>
							)}
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	const renderBarChart = (title: string, data: CrimeInsightListItem[], emptyLabel: string) => (
		<Card className="shadow-sm border border-slate-200">
			<CardHeader>
				<CardTitle className="text-base font-semibold">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				{loadingInsights ? (
					<Skeleton className="h-[220px] w-full" />
				) : data.length ? (
					<div className="h-[260px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={data} margin={{ left: 16, right: 16 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
								<XAxis dataKey="name" tick={{ fontSize: 12 }} />
								<YAxis tick={{ fontSize: 12 }} />
								<Tooltip />
								<Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				) : (
					<p className="text-sm text-slate-500">{emptyLabel}</p>
				)}
			</CardContent>
		</Card>
	)

	const renderPieChart = (title: string, data: CrimeInsightListItem[]) => (
		<Card className="shadow-sm border border-slate-200">
			<CardHeader>
				<CardTitle className="text-base font-semibold">{title}</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{loadingInsights ? (
					<Skeleton className="h-[220px] w-full" />
				) : data.length ? (
					<div className="grid gap-4 lg:grid-cols-2">
						<div className="h-[260px]">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={data}
										dataKey="count"
										nameKey="name"
										innerRadius={60}
										outerRadius={100}
										paddingAngle={4}
									>
										{data.map((_, index) => (
											<Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
										))}
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
						</div>
						<ul className="space-y-2">
							{data.map((item, index) => (
								<li key={item.name} className="flex items-center justify-between text-sm">
									<span className="flex items-center gap-2">
										<span
											className="inline-block h-2 w-2 rounded-full"
											style={{ backgroundColor: chartColors[index % chartColors.length] }}
										/>
										{item.name}
									</span>
									<span className="text-slate-500">{item.count.toLocaleString()} ({item.percentage.toFixed(1)}%)</span>
								</li>
							))}
						</ul>
					</div>
				) : (
					<p className="text-sm text-slate-500">No incident type distribution available.</p>
				)}
			</CardContent>
		</Card>
	)

	const renderTimeChart = (title: string, data: CrimeInsightTimeBucket[]) => (
		<Card className="shadow-sm border border-slate-200">
			<CardHeader>
				<CardTitle className="text-base font-semibold">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				{loadingInsights ? (
					<Skeleton className="h-[220px] w-full" />
				) : data.length ? (
					<div className="h-[260px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={data} margin={{ left: 16, right: 16 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
								<XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
								<YAxis tick={{ fontSize: 12 }} />
								<Tooltip />
								<Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				) : (
					<p className="text-sm text-slate-500">No time-of-day data available.</p>
				)}
			</CardContent>
		</Card>
	)

	const renderProductsTable = () => (
		<Card className="shadow-sm border border-slate-200">
			<CardHeader>
				<CardTitle className="text-base font-semibold">Most Stolen Products</CardTitle>
			</CardHeader>
			<CardContent>
				{loadingInsights ? (
					<Skeleton className="h-[200px] w-full" />
				) : insights?.topProducts?.length ? (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="text-left text-slate-500">
								<tr>
									<th className="pb-2">Product</th>
									<th className="pb-2">Qty</th>
									<th className="pb-2">Value (£)</th>
									<th className="pb-2">% of total</th>
								</tr>
							</thead>
							<tbody>
								{insights.topProducts.map((item) => (
									<tr key={item.name} className="border-t border-slate-100">
										<td className="py-2 font-medium">{item.name}</td>
										<td className="py-2">{item.count.toLocaleString()}</td>
										<td className="py-2">{(item.value || 0).toLocaleString()}</td>
										<td className="py-2">{item.percentage.toFixed(1)}%</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<p className="text-sm text-slate-500">No stolen product data available.</p>
				)}
			</CardContent>
		</Card>
	)

	const renderHotProduct = () => (
		<Card className="shadow-sm border border-amber-200 bg-amber-50/40">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-800">
					<Target className="h-4 w-4" />
					Hot Product Spotlight
				</CardTitle>
				{insights?.hotProduct && (
					<Badge variant="secondary" className="bg-white text-amber-700 border border-amber-200">
						High Risk
					</Badge>
				)}
			</CardHeader>
			<CardContent>
				{loadingInsights ? (
					<div className="space-y-2">
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-4 w-3/4" />
					</div>
				) : insights?.hotProduct ? (
					<div className="space-y-2 text-sm text-amber-900">
						<p className="text-lg font-semibold text-amber-800">{insights.hotProduct.productName}</p>
						<p className="text-amber-700">
							{insights.hotProduct.quantity.toLocaleString()} units flagged • £{insights.hotProduct.totalValue.toLocaleString()}
						</p>
						<ul className="space-y-1 text-amber-800">
							{insights.hotProduct.category && <li>Category: {insights.hotProduct.category}</li>}
							{insights.hotProduct.mostTargetedStore && <li>Hot store: {insights.hotProduct.mostTargetedStore}</li>}
							{insights.hotProduct.typicalTime && <li>Peak time: {insights.hotProduct.typicalTime}</li>}
						</ul>
					</div>
				) : (
					<p className="text-sm text-amber-800">Insufficient product data to highlight a trend.</p>
				)}
			</CardContent>
		</Card>
	)

	if (isResolvingCustomer || authLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="space-y-4 text-center">
					<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
					<p className="text-sm text-slate-500">Loading customer context...</p>
				</div>
			</div>
		)
	}

	if (pageError) {
		return (
			<div className="container mx-auto p-4 space-y-4">
				<Button variant="ghost" onClick={() => navigate(-1)} className="w-fit">
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Button>
				<Card className="border border-rose-200 bg-rose-50">
					<CardContent className="flex items-center gap-3 py-6">
						<AlertTriangle className="h-5 w-5 text-rose-500" />
						<div>
							<p className="text-rose-600 font-medium">{pageError}</p>
							{isAdmin && (
								<p className="text-sm text-rose-500 mt-1">Select a customer from the sidebar to unlock crime intelligence insights.</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<Button variant="ghost" onClick={() => navigate(-1)} className="w-fit px-2">
							<ArrowLeft className="h-4 w-4 mr-1" />
							Back
						</Button>
						<Badge variant="outline" className="text-xs">Customer Insight</Badge>
					</div>
					<h1 className="text-2xl font-semibold text-slate-900">
						{customer?.name} - Crime Intelligence
					</h1>
					<p className="text-sm text-slate-500">
						Live incident telemetry across stores, products, and time-of-day patterns.
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={fetchInsights}
					disabled={loadingInsights}
					className="w-full md:w-auto"
				>
					<RefreshCcw className={`h-4 w-4 mr-2 ${loadingInsights ? 'animate-spin' : ''}`} />
					Refresh data
				</Button>
			</div>

			<Card className="border border-slate-200">
				<CardHeader>
					<CardTitle className="text-base font-semibold">Filters</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 lg:grid-cols-4 md:grid-cols-2">
					<div className="space-y-2">
						<p className="text-sm font-medium text-slate-600">Start Date</p>
						<DatePicker date={startDate} setDate={setStartDate} />
					</div>
					<div className="space-y-2">
						<p className="text-sm font-medium text-slate-600">End Date</p>
						<DatePicker date={endDate} setDate={setEndDate} />
					</div>
					<div className="space-y-2">
						<p className="text-sm font-medium text-slate-600">Region</p>
						<Select value={selectedRegionId} onValueChange={value => setSelectedRegionId(value)}>
							<SelectTrigger>
								<SelectValue placeholder="All regions" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Regions</SelectItem>
								{regions.map(region => (
									<SelectItem key={region.id} value={region.id}>
										{region.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<p className="text-sm font-medium text-slate-600">Site</p>
						<Select value={selectedSiteId} onValueChange={value => setSelectedSiteId(value)}>
							<SelectTrigger>
								<SelectValue placeholder="All sites" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Sites</SelectItem>
								{filteredSites.map(site => (
									<SelectItem key={site.siteID} value={site.siteID?.toString() || ''}>
										{site.locationName}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{renderHeroMetrics()}

			<div className="grid gap-4 lg:grid-cols-2">
				{renderBarChart('Hot Stores', insights?.topStores || [], 'No store-level crime data available.')}
				{renderPieChart('Incident Mix', insights?.topIncidentTypes || [])}
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				{renderTimeChart('Time-of-Day Activity', insights?.timeBuckets || [])}
				{renderBarChart('Regional Exposure', insights?.topRegions || [], 'No regional breakdown available.')}
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-4">
					{renderProductsTable()}
					<Card className="shadow-sm border border-slate-200">
						<CardHeader className="flex items-center gap-2">
							<TrendingUp className="h-4 w-4 text-slate-500" />
							<CardTitle className="text-base font-semibold">Analyst Notes</CardTitle>
						</CardHeader>
						<CardContent>
							{loadingInsights ? (
								<div className="space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-4 w-2/3" />
								</div>
							) : (
								<ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
									{analystNotes.map((note, idx) => (
										<li key={`note-${idx}`}>{note}</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>
				</div>
				{renderHotProduct()}
			</div>

			{insights?.generatedAt && (
				<p className="text-xs text-slate-400 text-right">
					Last generated {format(new Date(insights.generatedAt), 'dd MMM yyyy HH:mm')}
				</p>
			)}
		</div>
	)
}

