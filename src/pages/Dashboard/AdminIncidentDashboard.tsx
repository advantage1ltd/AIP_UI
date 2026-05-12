import React from 'react'
import {
	Activity,
	AlertCircle,
	BarChart3,
	CalendarRange,
	Clock,
	Download,
	Filter,
	LineChart,
	PoundSterling,
	RefreshCw,
	ShieldAlert,
	ShieldCheck,
	Sparkles,
	Store,
	TrendingDown,
	TrendingUp
} from 'lucide-react'
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis
} from 'recharts'
import { DashboardGreeting } from '@/components/dashboard/DashboardGreeting'
import { IncidentTable } from '@/components/dashboard/IncidentTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/config/api'
import { usePageAccess } from '@/contexts/PageAccessContext'
import { customerService } from '@/services/customerService'
import { getUser } from '@/services/auth'
import { extractApiResponseData } from '@/utils/apiResponseHelper'
import {
	incidentOfficerMatchesUser,
	type IncidentDashboardScope,
} from '@/utils/dashboardScope'
import { roleDisplayName, normalizeRoleId, harmonizeRole } from '@/utils/roles'
import {
	buildAdminIncidentAnalytics,
	filterIncidentsByDateRange,
	normalizeAdminIncidents
} from './adminIncidentAnalytics'

type DatePreset = 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom'

const getPresetRange = (preset: Exclude<DatePreset, 'custom'>) => {
	const endDate = new Date()
	endDate.setHours(23, 59, 59, 999)
	const startDate = new Date(endDate)
	if (preset === 'last-7-days') startDate.setDate(startDate.getDate() - 6)
	if (preset === 'last-30-days') startDate.setDate(startDate.getDate() - 29)
	if (preset === 'last-90-days') startDate.setDate(startDate.getDate() - 89)
	startDate.setHours(0, 0, 0, 0)
	return { startDate, endDate }
}

const formatCurrency = (value: number) =>
	`£${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`

const formatDateInputValue = (date: Date) => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

const formatHumanDate = (date: Date) =>
	date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

const formatTimeOfDay = (date: Date) =>
	date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

type RiskLevel = 'low' | 'medium' | 'high'

const getRiskLevel = (score: number): RiskLevel => {
	if (score >= 75) return 'high'
	if (score >= 45) return 'medium'
	return 'low'
}

const riskLevelStyles: Record<RiskLevel, { badge: string; bar: string }> = {
	low: {
		badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
		bar: 'bg-emerald-500',
	},
	medium: {
		badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
		bar: 'bg-amber-500',
	},
	high: {
		badge: 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
		bar: 'bg-rose-500',
	},
}

const PRESET_LABELS: Record<DatePreset, string> = {
	'last-7-days': 'Last 7 days',
	'last-30-days': 'Last 30 days',
	'last-90-days': 'Last 90 days',
	custom: 'Custom range'
}

const CHART_PALETTE = {
	primary: '#4f46e5',
	primarySoft: '#818cf8',
	success: '#10b981',
	successSoft: '#34d399',
	danger: '#f43f5e',
	dangerSoft: '#fb7185',
	warning: '#f59e0b',
	warningSoft: '#fbbf24',
	info: '#0ea5e9',
	infoSoft: '#38bdf8',
	purple: '#a855f7',
	teal: '#14b8a6'
}

const PIE_COLORS = [
	CHART_PALETTE.primary,
	CHART_PALETTE.info,
	CHART_PALETTE.success,
	CHART_PALETTE.warning,
	CHART_PALETTE.danger,
	CHART_PALETTE.purple,
	CHART_PALETTE.teal,
	CHART_PALETTE.primarySoft
]

const surfaceStyles = {
	page: 'min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-4 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30 sm:p-6',
	heroShell: 'relative overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 shadow-[0_24px_52px_-24px_rgb(2_6_23_/_0.9)]',
	heroGradient: 'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(129,140,248,0.32),transparent_42%),radial-gradient(circle_at_85%_10%,rgba(56,189,248,0.22),transparent_36%),linear-gradient(to_bottom_right,rgba(99,102,241,0.2),transparent_58%)]',
	filtersShell: 'overflow-hidden border-slate-200/70 bg-white shadow-[0_1px_2px_rgb(15_23_42_/_0.04)] dark:border-slate-800 dark:bg-slate-900',
	filtersHeader: 'flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/80',
	kpiNeutral: 'relative overflow-hidden border-slate-200/70 bg-white shadow-[0_1px_2px_rgb(15_23_42_/_0.04)] transition-all hover:shadow-[0_8px_24px_-8px_rgb(15_23_42_/_0.12)] dark:border-slate-800 dark:bg-slate-900',
	chartShell: 'overflow-hidden border-slate-200/70 bg-white shadow-[0_1px_2px_rgb(15_23_42_/_0.04)] dark:border-slate-800 dark:bg-slate-900',
	chartBody: 'border-t border-slate-100 p-4 dark:border-slate-800',
	tableShell: 'overflow-hidden border-slate-200/70 bg-white shadow-[0_1px_2px_rgb(15_23_42_/_0.04)] dark:border-slate-800 dark:bg-slate-900'
} as const

const semanticTone = {
	incident: {
		cardBg: 'bg-indigo-50/70 dark:bg-indigo-950/40',
		iconBg: 'bg-indigo-100 dark:bg-indigo-900/80',
		iconText: 'text-indigo-700 dark:text-indigo-300'
	},
	loss: {
		cardBg: 'bg-rose-50/70 dark:bg-rose-950/40',
		iconBg: 'bg-rose-100 dark:bg-rose-900/80',
		iconText: 'text-rose-700 dark:text-rose-300'
	},
	recovered: {
		cardBg: 'bg-emerald-50/70 dark:bg-emerald-950/40',
		iconBg: 'bg-emerald-100 dark:bg-emerald-900/80',
		iconText: 'text-emerald-700 dark:text-emerald-300'
	},
	average: {
		cardBg: 'bg-amber-50/70 dark:bg-amber-950/40',
		iconBg: 'bg-amber-100 dark:bg-amber-900/80',
		iconText: 'text-amber-700 dark:text-amber-300'
	}
} as const

const tooltipStyle: React.CSSProperties = {
	borderRadius: 12,
	border: '1px solid hsl(var(--border))',
	backgroundColor: 'hsl(var(--card))',
	color: 'hsl(var(--card-foreground))',
	boxShadow: '0 12px 24px -8px rgb(15 23 42 / 0.12)',
	fontSize: 12
}

interface SectionHeadingProps {
	title: string
	description?: string
	icon?: React.ReactNode
	accent?: string
	right?: React.ReactNode
}

const SectionHeading = ({ title, description, icon, accent, right }: SectionHeadingProps) => (
	<div className='flex items-start justify-between gap-3 border-b border-slate-100/80 px-5 py-4 dark:border-slate-800/80'>
		<div className='flex items-start gap-3'>
			{icon ? (
				<span
					className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm dark:text-slate-50'
					style={{ backgroundColor: accent ?? CHART_PALETTE.primary }}
				>
					{icon}
				</span>
			) : null}
			<div className='space-y-0.5'>
				<h3 className='text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-[15px]'>{title}</h3>
				{description ? <p className='text-xs text-slate-500 dark:text-slate-400'>{description}</p> : null}
			</div>
		</div>
		{right ? <div className='shrink-0'>{right}</div> : null}
	</div>
)

interface KpiTone {
	accent: string
	bg: string
	text: string
}

interface KpiCardProps {
	label: string
	value: string | number
	icon: React.ReactNode
	tone: KpiTone
	helper?: React.ReactNode
	delta?: { label: string; positive?: boolean }
	isLoading?: boolean
}

const KpiCard = ({ label, value, icon, tone, helper, delta, isLoading }: KpiCardProps) => (
	<Card className={`${surfaceStyles.kpiNeutral} backdrop-blur-sm`}>
		<span
			className='absolute inset-y-0 left-0 w-1'
			style={{ backgroundColor: tone.accent }}
			aria-hidden
		/>
		<span
			className='pointer-events-none absolute inset-0 opacity-70'
			style={{ background: `linear-gradient(145deg, ${tone.accent}12, transparent 42%)` }}
			aria-hidden
		/>
		<CardContent className='p-5'>
			<div className='flex items-start justify-between gap-3'>
				<div className='min-w-0 flex-1'>
					<p className='text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400'>
						{label}
					</p>
					{isLoading ? (
						<Skeleton className='mt-3 h-8 w-28' />
					) : (
						<p className='mt-2 truncate text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100'>
							{value}
						</p>
					)}
					<div className='mt-2 flex items-center gap-2'>
						{delta && !isLoading ? (
							<span
								className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
									delta.positive
										? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
										: 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
								}`}
							>
								{delta.positive ? (
									<TrendingUp className='h-3 w-3' />
								) : (
									<TrendingDown className='h-3 w-3' />
								)}
								{delta.label}
							</span>
						) : null}
						{helper && !isLoading ? (
							<span className='text-xs text-slate-500 dark:text-slate-400'>{helper}</span>
						) : null}
					</div>
				</div>
				<span
					className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.bg} ${tone.text}`}
				>
					{icon}
				</span>
			</div>
		</CardContent>
	</Card>
)

const ChartLoadingState = () => (
	<div className='flex h-full w-full flex-col gap-3 px-2 py-4'>
		<Skeleton className='h-3 w-24' />
		<Skeleton className='h-full w-full' />
	</div>
)

interface ChartEmptyStateProps {
	message: string
}

const ChartEmptyState = ({ message }: ChartEmptyStateProps) => (
	<div className='flex h-full w-full flex-col items-center justify-center gap-2 text-center'>
		<div className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'>
			<BarChart3 className='h-5 w-5' />
		</div>
		<p className='max-w-xs text-sm text-slate-500 dark:text-slate-400'>{message}</p>
	</div>
)

export const AdminIncidentDashboard = () => {
	const viewer = getUser()
	const { currentRole, isTestMode, testRole } = usePageAccess()
	const effectiveNavigationRole = isTestMode && testRole ? testRole : currentRole
	const harmonizedNavRole =
		normalizeRoleId(effectiveNavigationRole ?? '') ??
		normalizeRoleId(viewer?.pageAccessRole ?? viewer?.role ?? '') ??
		harmonizeRole(viewer?.pageAccessRole ?? viewer?.role)

	const scope: IncidentDashboardScope =
		harmonizedNavRole === 'customer'
			? 'customer-tenant'
			: harmonizedNavRole === 'securityofficer'
				? 'officer-self'
				: 'staff-full'

	const initialCustomerId =
		scope === 'customer-tenant' &&
		viewer &&
		'customerId' in viewer &&
		typeof viewer.customerId === 'number' &&
		Number.isFinite(viewer.customerId)
			? String(viewer.customerId)
			: 'all'

	const [customerOptions, setCustomerOptions] = React.useState<Array<{ id: string; name: string }>>(() =>
		scope === 'customer-tenant' &&
		viewer &&
		'customerId' in viewer &&
		typeof viewer.customerId === 'number' &&
		Number.isFinite(viewer.customerId)
			? [
					{
						id: String(viewer.customerId),
						name:
							'customerName' in viewer && viewer.customerName
								? String(viewer.customerName)
								: 'Your organisation',
					},
				]
			: [{ id: 'all', name: 'All customers' }]
	)
	const [selectedCustomer, setSelectedCustomer] = React.useState(initialCustomerId)
	const [datePreset, setDatePreset] = React.useState<DatePreset>('last-30-days')
	const [startDate, setStartDate] = React.useState<Date>(getPresetRange('last-30-days').startDate)
	const [endDate, setEndDate] = React.useState<Date>(getPresetRange('last-30-days').endDate)
	const [rawIncidents, setRawIncidents] = React.useState<unknown[]>([])
	const [isLoading, setIsLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)
	const [refreshToken, setRefreshToken] = React.useState(0)
	const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null)
	const [trendView, setTrendView] = React.useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')

	React.useEffect(() => {
		if (scope === 'customer-tenant') return

		const loadCustomers = async () => {
			try {
				const customers = await customerService.getAvailableCustomers()
				const normalized = customers.map(c => ({ id: c.id, name: c.name }))
				setCustomerOptions([{ id: 'all', name: 'All customers' }, ...normalized])
			} catch (customerError) {
				console.error('Failed to load customers for admin analytics', customerError)
			}
		}
		void loadCustomers()
	}, [scope])

	React.useEffect(() => {
		const loadIncidents = async () => {
			try {
				setIsLoading(true)
				setError(null)
				const params: Record<string, string | number> = { pageSize: 5000, pageNumber: 1 }
				const headers: Record<string, string> = {}
				const effectiveCustomer =
					scope === 'customer-tenant'
						? initialCustomerId !== 'all'
							? initialCustomerId
							: selectedCustomer
						: selectedCustomer

				if (effectiveCustomer !== 'all') {
					params.customerId = effectiveCustomer
					headers['X-Customer-Id'] = effectiveCustomer
				}

				const sessionUser = getUser()
				if (scope === 'officer-self' && sessionUser) {
					const officerLabel = `${sessionUser.firstName ?? ''} ${sessionUser.lastName ?? ''}`.trim()
					if (officerLabel) {
						params.officerName = officerLabel
					}
				}

				const response = await api.get(
					'/incidents',
					Object.keys(headers).length > 0 ? { params, headers } : { params }
				)
				const incidents = extractApiResponseData(response.data)
				setRawIncidents(incidents)
				setLastUpdated(new Date())
			} catch (loadError) {
				console.error('Failed to load admin incidents', loadError)
				setError('Unable to load incident analytics right now.')
			} finally {
				setIsLoading(false)
			}
		}
		void loadIncidents()
	}, [selectedCustomer, refreshToken, scope, initialCustomerId])

	const normalizedIncidents = React.useMemo(() => {
		const base = normalizeAdminIncidents(rawIncidents)
		if (scope !== 'officer-self') return base
		const u = getUser()
		return base.filter(inc => incidentOfficerMatchesUser(inc.officerName, u))
	}, [rawIncidents, scope])
	const incidentsInRange = React.useMemo(
		() => filterIncidentsByDateRange(normalizedIncidents, startDate, endDate),
		[normalizedIncidents, startDate, endDate]
	)
	const analytics = React.useMemo(
		() => buildAdminIncidentAnalytics(incidentsInRange),
		[incidentsInRange]
	)

	const tableIncidents = React.useMemo(
		() =>
			incidentsInRange.slice(0, 10).map(incident => ({
				id: incident.id,
				customerName: incident.customerName,
				siteName: incident.storeName,
				officerName: incident.officerName,
				date: incident.date.toISOString(),
				timeOfIncident: incident.timeOfIncident,
				amount: incident.lossValue,
				recoveredAmount: incident.recoveredValue,
				lossAmount: incident.lossValue,
				incidentType: incident.incidentType
			})),
		[incidentsInRange]
	)

	const totalRecovered = analytics.kpis.totalRecoveredValue
	const totalLoss = analytics.kpis.totalLossValue
	const totalIncidents = analytics.kpis.totalIncidents
	const recoveryRate = totalLoss > 0 ? Math.round((totalRecovered / totalLoss) * 100) : null

	const estimatedCoveragePercent = totalIncidents > 0
		? Math.round(
				((totalIncidents - analytics.kpis.estimatedLossSamples) / totalIncidents) * 100
			)
		: 100

	const effectiveCustomerFilter =
		scope === 'customer-tenant' ? initialCustomerId : selectedCustomer
	const selectedCustomerName =
		customerOptions.find(option => option.id === effectiveCustomerFilter)?.name ?? 'All customers'
	const topStore = analytics.topStoresByIncidents[0]
	const topIncidentType = analytics.incidentsByType[0]
	const peakHour = analytics.peakHours.reduce<{ label: string; incidentCount: number } | null>(
		(highest, current) => (!highest || current.incidentCount > highest.incidentCount ? current : highest),
		null
	)
	const theftIncidents = incidentsInRange.filter(incident => incident.incidentType.toLowerCase().includes('theft')).length

	const alerts = React.useMemo(
		() =>
			incidentsInRange.slice(0, 6).map(incident => ({
				id: incident.id,
				type: incident.incidentType,
				customer: incident.customerName,
				store: incident.storeName,
				time: formatTimeOfDay(incident.date),
				value: incident.lossValue
			})),
		[incidentsInRange]
	)

	const aiRiskIndicators = React.useMemo(() => {
		const end = new Date(endDate)
		end.setHours(23, 59, 59, 999)
		const currentWindowStart = new Date(end)
		currentWindowStart.setDate(currentWindowStart.getDate() - 6)
		currentWindowStart.setHours(0, 0, 0, 0)

		const previousWindowEnd = new Date(currentWindowStart)
		previousWindowEnd.setMilliseconds(-1)
		const previousWindowStart = new Date(previousWindowEnd)
		previousWindowStart.setDate(previousWindowStart.getDate() - 6)
		previousWindowStart.setHours(0, 0, 0, 0)

		const currentWeekIncidents = normalizedIncidents.filter(incident =>
			incident.date >= currentWindowStart && incident.date <= end
		)
		const previousWeekIncidents = normalizedIncidents.filter(incident =>
			incident.date >= previousWindowStart && incident.date <= previousWindowEnd
		)

		const currentWeekCount = currentWeekIncidents.length
		const previousWeekCount = previousWeekIncidents.length
		const velocityDelta = previousWeekCount > 0
			? Math.round(((currentWeekCount - previousWeekCount) / previousWeekCount) * 100)
			: currentWeekCount > 0
				? 100
				: 0
		const incidentVelocityScore = Math.min(
			100,
			Math.max(
				0,
				Math.round((currentWeekCount / 40) * 60 + Math.max(0, velocityDelta) * 0.6)
			)
		)

		const offenderFrequency = normalizedIncidents.reduce((acc, incident) => {
			const offenderName = incident.offenderName.trim().toLowerCase()
			if (!offenderName) return acc
			acc.set(offenderName, (acc.get(offenderName) ?? 0) + 1)
			return acc
		}, new Map<string, number>())
		const repeatOffenderCount = Array.from(offenderFrequency.values()).filter(count => count >= 2).length
		const repeatOffenderScore = Math.min(100, Math.round(repeatOffenderCount * 28))

		const last90Start = new Date(end)
		last90Start.setDate(last90Start.getDate() - 89)
		last90Start.setHours(0, 0, 0, 0)
		const incidentsLast90Days = normalizedIncidents.filter(incident =>
			incident.date >= last90Start && incident.date <= end
		)
		const valueAtRisk = incidentsLast90Days.reduce((sum, incident) => sum + incident.lossValue, 0)
		const valueAtRiskScore = Math.min(100, Math.round((valueAtRisk / 25000) * 100))

		const policeInvolvedCount = incidentsInRange.filter(incident => incident.policeInvolvement).length
		const policeInvolvementRate = totalIncidents > 0
			? Math.round((policeInvolvedCount / totalIncidents) * 100)
			: 0
		const policeInvolvementScore = Math.min(100, Math.round(policeInvolvementRate * 1.6))

		return [
			{
				label: 'Incident Velocity',
				subtitle: `${currentWeekCount.toLocaleString()} incidents in last 7 days vs ${previousWeekCount.toLocaleString()} prior week`,
				score: incidentVelocityScore,
				level: getRiskLevel(incidentVelocityScore),
			},
			{
				label: 'Repeat Offender Activity',
				subtitle: `${repeatOffenderCount.toLocaleString()} repeat offenders identified`,
				score: repeatOffenderScore,
				level: getRiskLevel(repeatOffenderScore),
			},
			{
				label: 'Value at Risk',
				subtitle: `Total value impact (last 90 days): ${formatCurrency(valueAtRisk)}`,
				score: valueAtRiskScore,
				level: getRiskLevel(valueAtRiskScore),
			},
			{
				label: 'Police Involvement Rate',
				subtitle: `${policeInvolvementRate}% of incidents involved police`,
				score: policeInvolvementScore,
				level: getRiskLevel(policeInvolvementScore),
			},
		]
	}, [endDate, incidentsInRange, normalizedIncidents, totalIncidents])

	const trendData = React.useMemo(() => {
		const grouped = new Map<string, { label: string; recoveredValue: number; lossValue: number }>()

		incidentsInRange.forEach((incident) => {
			const date = incident.date
			let key = ''
			let label = ''

			if (trendView === 'daily') {
				key = date.toISOString().split('T')[0]
				label = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
			} else if (trendView === 'weekly') {
				const weekStart = new Date(date)
				weekStart.setDate(date.getDate() - date.getDay())
				key = weekStart.toISOString().split('T')[0]
				label = `Wk ${weekStart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`
			} else if (trendView === 'monthly') {
				key = `${date.getFullYear()}-${date.getMonth() + 1}`
				label = date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
			} else {
				key = `${date.getFullYear()}`
				label = `${date.getFullYear()}`
			}

			if (!grouped.has(key)) {
				grouped.set(key, { label, recoveredValue: 0, lossValue: 0 })
			}

			const bucket = grouped.get(key)!
			bucket.recoveredValue += incident.recoveredValue
			bucket.lossValue += incident.lossValue
		})

		return Array.from(grouped.entries())
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map(([, value]) => value)
	}, [incidentsInRange, trendView])

	const handlePresetChange = (value: DatePreset) => {
		setDatePreset(value)
		if (value !== 'custom') {
			const range = getPresetRange(value)
			setStartDate(range.startDate)
			setEndDate(range.endDate)
		}
	}

	const handleStartDateChange = (value: string) => {
		setDatePreset('custom')
		setStartDate(new Date(`${value}T00:00:00`))
	}

	const handleEndDateChange = (value: string) => {
		setDatePreset('custom')
		setEndDate(new Date(`${value}T23:59:59`))
	}

	const handleRefresh = () => setRefreshToken(token => token + 1)

	const handleExport = () => {
		if (incidentsInRange.length === 0) return
		const headers = ['Date', 'Customer', 'Store', 'Officer', 'Incident Type', 'Loss', 'Recovered']
		const rows = incidentsInRange.map(incident => [
			formatHumanDate(incident.date),
			incident.customerName,
			incident.storeName,
			incident.officerName,
			incident.incidentType,
			incident.lossValue.toString(),
			incident.recoveredValue.toString()
		])
		const csv = [headers, ...rows]
			.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
			.join('\n')
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `incidents-${formatDateInputValue(startDate)}-to-${formatDateInputValue(endDate)}.csv`
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(url)
	}

	const hasNoIncidents = !isLoading && incidentsInRange.length === 0

	const scopeHint =
		scope === 'officer-self'
			? 'Showing incidents where you are recorded as the officer.'
			: scope === 'customer-tenant'
				? `Showing incidents for ${selectedCustomerName}.`
				: null

	return (
		<div className='min-h-screen bg-slate-50 p-4 sm:p-6'>
			<div className='mx-auto max-w-[1680px] space-y-5'>
				<DashboardGreeting />

				{scopeHint ? (
					<p className='rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'>
						{scopeHint}
					</p>
				) : null}

				<Card className='border-slate-200 bg-white'>
					<CardContent className='flex flex-col gap-4 p-4 lg:flex-row lg:items-end'>
						<div className='grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4'>
							<div className='space-y-1.5'>
								<label className='text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500'>Customer</label>
								{scope === 'customer-tenant' ? (
									<div
										className='flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
										aria-live='polite'
									>
										<span className='truncate font-medium'>{selectedCustomerName}</span>
										<Badge variant='secondary' className='ml-auto shrink-0 text-[10px]'>
											{viewer ? roleDisplayName(viewer.pageAccessRole ?? viewer.role) : 'Customer'}
										</Badge>
									</div>
								) : scope === 'officer-self' ? (
									<div
										className='flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
										aria-live='polite'
									>
										All assigned customers · filtered to your incidents
									</div>
								) : (
									<Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
										<SelectTrigger className='h-10'>
											<SelectValue placeholder='Select customer' />
										</SelectTrigger>
										<SelectContent>
											{customerOptions.map(option => (
												<SelectItem key={option.id} value={option.id}>
													{option.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</div>
							<div className='space-y-1.5'>
								<label className='text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500'>Date range</label>
								<Select value={datePreset} onValueChange={value => handlePresetChange(value as DatePreset)}>
									<SelectTrigger className='h-10'><SelectValue /></SelectTrigger>
									<SelectContent>
										<SelectItem value='last-7-days'>Last 7 days</SelectItem>
										<SelectItem value='last-30-days'>Last 30 days</SelectItem>
										<SelectItem value='last-90-days'>Last 90 days</SelectItem>
										<SelectItem value='custom'>Custom</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-1.5'>
								<label className='text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500'>Start date</label>
								<Input type='date' className='h-10' value={formatDateInputValue(startDate)} onChange={event => handleStartDateChange(event.target.value)} />
							</div>
							<div className='space-y-1.5'>
								<label className='text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500'>End date</label>
								<Input type='date' className='h-10' value={formatDateInputValue(endDate)} onChange={event => handleEndDateChange(event.target.value)} />
							</div>
						</div>
						<div className='flex items-center gap-2'>
							<Button type='button' variant='outline' size='sm' onClick={handleRefresh}>
								<RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
								Refresh
							</Button>
							<Button type='button' size='sm' onClick={handleExport} disabled={incidentsInRange.length === 0}>
								<Download className='mr-2 h-4 w-4' />
								Export CSV
							</Button>
						</div>
					</CardContent>
				</Card>

				{error && (
					<div role='alert' className='flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
						<AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
						<span>{error}</span>
					</div>
				)}

				<div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
					<Card className='border-0 bg-[#0D6EFD] text-white'>
						<CardContent className='p-4'>
							<p className='text-xs text-white/90'>Total Incidents</p>
							<p className='mt-1 text-3xl font-semibold'>{totalIncidents.toLocaleString()}</p>
							<p className='mt-1 text-xs text-white/80'>{PRESET_LABELS[datePreset]}</p>
						</CardContent>
					</Card>
					<Card className='border-0 bg-[#8B1D3B] text-white'>
						<CardContent className='p-4'>
							<p className='text-xs text-white/90'>Lost Value</p>
							<p className='mt-1 text-3xl font-semibold'>{formatCurrency(totalLoss)}</p>
							<p className='mt-1 text-xs text-white/80'>Coverage {estimatedCoveragePercent}%</p>
						</CardContent>
					</Card>
					<Card className='border-0 bg-[#198754] text-white'>
						<CardContent className='p-4'>
							<p className='text-xs text-white/90'>Value Recovered</p>
							<p className='mt-1 text-3xl font-semibold'>{formatCurrency(totalRecovered)}</p>
							<p className='mt-1 text-xs text-white/80'>{recoveryRate === null ? 'No baseline' : `${recoveryRate}% recovery rate`}</p>
						</CardContent>
					</Card>
					<Card className='border-0 bg-[#DC3545] text-white'>
						<CardContent className='p-4'>
							<p className='text-xs text-white/90'>Theft Incidents</p>
							<p className='mt-1 text-3xl font-semibold'>{theftIncidents.toLocaleString()}</p>
							<p className='mt-1 text-xs text-white/80'>{topIncidentType?.type ?? 'No incident type'}</p>
						</CardContent>
					</Card>
				</div>

				<div className='grid gap-4 xl:grid-cols-12'>
					<div className='space-y-4 xl:col-span-8'>
						<Card className='border-slate-200 bg-white'>
							<div className='flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
								<div>
									<h3 className='text-sm font-semibold text-slate-900'>Incident Reports</h3>
									<p className='text-xs text-slate-500'>Recovered vs loss trend for {selectedCustomerName}</p>
								</div>
								<div className='inline-flex rounded-md bg-slate-100 p-1'>
									{(['daily', 'weekly', 'monthly', 'yearly'] as const).map(view => (
										<button
											key={view}
											type='button'
											onClick={() => setTrendView(view)}
											className={`rounded px-3 py-1 text-xs font-medium capitalize ${trendView === view ? 'bg-white text-emerald-600 shadow' : 'text-slate-500'}`}
										>
											{view}
										</button>
									))}
								</div>
							</div>
							<CardContent className='h-[280px] p-3 sm:h-[320px]'>
								{isLoading ? (
									<ChartLoadingState />
								) : hasNoIncidents ? (
									<ChartEmptyState message='No trend data for selected filters.' />
								) : (
									<ResponsiveContainer width='100%' height='100%'>
										<AreaChart data={trendData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
											<defs>
												<linearGradient id='recoveredGradient' x1='0' y1='0' x2='0' y2='1'>
													<stop offset='5%' stopColor={CHART_PALETTE.success} stopOpacity={0.35} />
													<stop offset='95%' stopColor={CHART_PALETTE.success} stopOpacity={0} />
												</linearGradient>
												<linearGradient id='lossGradient' x1='0' y1='0' x2='0' y2='1'>
													<stop offset='5%' stopColor={CHART_PALETTE.danger} stopOpacity={0.3} />
													<stop offset='95%' stopColor={CHART_PALETTE.danger} stopOpacity={0} />
												</linearGradient>
											</defs>
											<CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' vertical={false} />
											<XAxis dataKey='label' stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} />
											<YAxis stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} />
											<Tooltip contentStyle={tooltipStyle} />
											<Area type='monotone' name='Recovered' dataKey='recoveredValue' stroke={CHART_PALETTE.success} strokeWidth={2} fill='url(#recoveredGradient)' />
											<Area type='monotone' name='Loss' dataKey='lossValue' stroke={CHART_PALETTE.danger} strokeWidth={2} fill='url(#lossGradient)' />
										</AreaChart>
									</ResponsiveContainer>
								)}
							</CardContent>
						</Card>

						<Card className='border-slate-200 bg-white'>
							<div className='flex items-center justify-between border-b border-slate-100 px-4 py-3'>
								<h3 className='text-sm font-semibold text-slate-900'>Recent Incidents</h3>
								<span className='text-xs text-slate-500'>{incidentsInRange.length} records</span>
							</div>
							<CardContent className='p-3'>
								{isLoading ? (
									<div className='space-y-3'>
										<Skeleton className='h-10 w-full' />
										<Skeleton className='h-10 w-full' />
										<Skeleton className='h-10 w-full' />
									</div>
								) : incidentsInRange.length === 0 ? (
									<ChartEmptyState message='No incidents found for selected filters.' />
								) : (
									<IncidentTable incidents={tableIncidents} title='Recent Incidents (Filtered)' />
								)}
							</CardContent>
						</Card>
					</div>

					<div className='space-y-4 xl:col-span-4'>
						<Card className='border-slate-200 bg-white'>
							<div className='flex items-center gap-2 border-b border-slate-100 px-4 py-3'>
								<BarChart3 className='h-4 w-4 text-indigo-600' />
								<h3 className='text-sm font-semibold text-slate-900'>AI Risk Indicators</h3>
							</div>
							<CardContent className='space-y-4 p-4'>
								{aiRiskIndicators.map(indicator => {
									const levelStyle = riskLevelStyles[indicator.level]
									return (
										<div key={indicator.label} className='space-y-1.5 border-b border-slate-100 pb-3 last:border-0 last:pb-0'>
											<div className='flex items-center justify-between gap-2'>
												<span className='text-xs font-semibold text-slate-800'>{indicator.label}</span>
												<span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${levelStyle.badge}`}>
													{indicator.level}
												</span>
											</div>
											<div className='h-2 w-full rounded-full bg-slate-100'>
												<div className={`h-2 rounded-full ${levelStyle.bar}`} style={{ width: `${Math.min(100, indicator.score)}%` }} />
											</div>
											<p className='text-xs text-slate-500'>{indicator.subtitle}</p>
										</div>
									)
								})}
								<div className='rounded-lg bg-slate-50 p-2 text-xs text-slate-500'>
									Peak hour: <span className='font-medium text-slate-700'>{peakHour?.label ?? 'N/A'}</span> · Top store: <span className='font-medium text-slate-700'>{topStore?.storeName ?? 'N/A'}</span>
								</div>
							</CardContent>
						</Card>

						<Card className='border-slate-200 bg-white'>
							<div className='flex items-center gap-2 border-b border-slate-100 px-4 py-3'>
								<ShieldAlert className='h-4 w-4 text-rose-600' />
								<h3 className='text-sm font-semibold text-slate-900'>Alerts</h3>
							</div>
							<CardContent className='space-y-2 p-4'>
								{alerts.length === 0 ? (
									<p className='text-xs text-slate-500'>No alerts in selected range.</p>
								) : (
									alerts.map(alert => (
										<div key={alert.id} className='rounded-lg border border-slate-100 p-2'>
											<div className='flex items-start justify-between gap-2'>
												<p className='text-xs font-medium text-slate-800'>{alert.type}</p>
												<span className='text-[11px] text-slate-500'>{alert.time}</span>
											</div>
											<p className='mt-1 text-[11px] text-slate-500'>{alert.customer} · {alert.store}</p>
											<p className='mt-1 text-[11px] font-medium text-rose-600'>{formatCurrency(alert.value)}</p>
										</div>
									))
								)}
							</CardContent>
						</Card>

						<Card className='border-slate-200 bg-white'>
							<div className='flex items-center gap-2 border-b border-slate-100 px-4 py-3'>
								<Activity className='h-4 w-4 text-blue-600' />
								<h3 className='text-sm font-semibold text-slate-900'>Heatmap Preview</h3>
							</div>
							<CardContent className='space-y-2 p-4'>
								{analytics.topStoresByIncidents.slice(0, 5).map(store => {
									const maxIncidents = Math.max(1, analytics.topStoresByIncidents[0]?.incidentCount ?? 1)
									const width = (store.incidentCount / maxIncidents) * 100
									return (
										<div key={store.storeName} className='space-y-1'>
											<div className='flex items-center justify-between text-xs'>
												<span className='truncate text-slate-700'>{store.storeName}</span>
												<span className='text-slate-500'>{store.incidentCount}</span>
											</div>
											<div className='h-2 rounded-full bg-slate-100'>
												<div className='h-2 rounded-full bg-blue-500' style={{ width: `${width}%` }} />
											</div>
										</div>
									)
								})}
								{analytics.topStoresByIncidents.length === 0 ? (
									<p className='text-xs text-slate-500'>No store pattern data available.</p>
								) : null}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AdminIncidentDashboard
