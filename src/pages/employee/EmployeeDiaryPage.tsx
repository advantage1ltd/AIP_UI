/**
 * Employee diary activities and ActivityForm.
 * Flow: activity filters → ActivityForm create/edit → diary timeline grouped by category.
 */
import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Briefcase, CalendarDays, CreditCard, FileText, HardHat, Loader2, RefreshCw, Search, ShieldAlert, Sparkles, User, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { toast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { employeeService } from '@/services/employeeService'
import { employeeDiaryService } from '@/services/employeeDiaryService'
import type { Employee } from '@/types/employee'
import type { EmployeeDiary } from '@/types/employeeDiary'
import { harmonizeRole } from '@/utils/roles'

type UserWithLegacyEmployeeId = { employeeId?: number; EmployeeId?: number | string; role?: string }

const normalizeStatus = (value: string | null | undefined) => String(value ?? '').trim().toLowerCase()
const isPendingStatus = (value: string | null | undefined) => normalizeStatus(value) === 'pending'

const getStatusBadgeVariant = (status: string | null | undefined): 'default' | 'secondary' | 'destructive' => {
	const s = normalizeStatus(status)
	if (s === 'pending') return 'destructive'
	if (s === 'approved' || s === 'completed' || s === 'fulfilled') return 'default'
	return 'secondary'
}

const formatDate = (value?: string | null) => {
	if (!value) return '—'
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return '—'
	return new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short', day: '2-digit' }).format(date)
}

const formatMoney = (value?: number | null) => {
	if (value === null || value === undefined) return '—'
	return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)
}

const getEmployeeLabel = (employee: Employee) => {
	const name = employee.fullName || `${employee.firstName} ${employee.surname}`.trim()
	return `${name} • ${employee.employeeNumber}`
}

const EmployeeDiaryPage = () => {
	const { user, refreshUser } = useAuth()

	const identityRole = useMemo(() => harmonizeRole(user?.role), [user?.role])
	/** Use Identity primary role only — Page Access can mark HO staff as “manager” for menu columns while login remains Security Officer. */
	const canPickEmployee = identityRole === 'administrator' || identityRole === 'manager'

	const linkedEmployeeId = useMemo<number | null>(() => {
		if (!user) return null
		const legacy = user as unknown as UserWithLegacyEmployeeId
		const raw = legacy.employeeId ?? legacy.EmployeeId
		if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw
		if (typeof raw === 'string' && raw.trim() !== '' && Number.isFinite(Number(raw))) {
			const n = Number(raw)
			return n > 0 ? n : null
		}
		return null
	}, [user])

	const needsOfficerEmployeeBootstrap = useMemo(
		() => !canPickEmployee && Boolean(user?.id) && linkedEmployeeId === null,
		[canPickEmployee, user?.id, linkedEmployeeId],
	)

	const [officerBootstrapDone, setOfficerBootstrapDone] = useState(() => !needsOfficerEmployeeBootstrap)

	useEffect(() => {
		if (!needsOfficerEmployeeBootstrap) {
			setOfficerBootstrapDone(true)
			return
		}
		setOfficerBootstrapDone(false)
		let cancelled = false
		void (async () => {
			await refreshUser()
			if (!cancelled) setOfficerBootstrapDone(true)
		})()
		return () => {
			cancelled = true
		}
	}, [needsOfficerEmployeeBootstrap, refreshUser])

	const [employees, setEmployees] = useState<Employee[]>([])
	const [employeesLoading, setEmployeesLoading] = useState(false)
	const [employeesError, setEmployeesError] = useState<string | null>(null)

	const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)
	const [employeeFilter, setEmployeeFilter] = useState('')
	const [diaryRefreshToken, setDiaryRefreshToken] = useState(0)
	const [activeTab, setActiveTab] = useState('holidays')
	const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)

	const [diary, setDiary] = useState<EmployeeDiary | null>(null)
	const [diaryLoading, setDiaryLoading] = useState(false)
	const [diaryError, setDiaryError] = useState<string | null>(null)

	useEffect(() => {
		let isMounted = true
		const loadEmployees = async () => {
			if (!canPickEmployee && !officerBootstrapDone) return

			setEmployeesLoading(true)
			setEmployeesError(null)
			try {
				if (!canPickEmployee) {
					if (linkedEmployeeId === null) {
						if (!isMounted) return
						setEmployees([])
						setSelectedEmployeeId(null)
						setEmployeesError(
							'Your account is not linked to an employee record. Ask an administrator to link your login to your officer profile.',
						)
						return
					}

					// Allow diary load even if employee profile endpoint is blocked/unavailable for officer.
					setSelectedEmployeeId(linkedEmployeeId)
					try {
						const employee = await employeeService.getEmployeeByIdAsFrontendInterface(linkedEmployeeId)
						if (!isMounted) return
						setEmployees([employee])
					} catch (profileErr) {
						console.warn('⚠️ [EmployeeDiary] Could not load employee profile details, continuing with diary fetch:', profileErr)
					}
					return
				}

				const result = await employeeService.getEmployeesAsFrontendInterface({ page: 1, pageSize: 200 })
				if (!isMounted) return
				setEmployees(result.employees)
				setSelectedEmployeeId(null)
			} catch (err) {
				console.error('❌ [EmployeeDiary] Failed to load employees:', err)
				if (!isMounted) return
				setEmployeesError(err instanceof Error ? err.message : 'Failed to load employees')
			} finally {
				if (!isMounted) return
				setEmployeesLoading(false)
			}
		}

		loadEmployees()
		return () => {
			isMounted = false
		}
	}, [canPickEmployee, officerBootstrapDone, linkedEmployeeId])

	useEffect(() => {
		if (!selectedEmployeeId) {
			setDiary(null)
			setDiaryError(null)
			return
		}

		let isMounted = true
		const loadDiary = async () => {
			setDiaryLoading(true)
			setDiaryError(null)
			try {
				const result = await employeeDiaryService.getEmployeeDiary(selectedEmployeeId)
				if (!isMounted) return
				setDiary(result)
				setLastUpdatedAt(new Date())
			} catch (err) {
				console.error('❌ [EmployeeDiary] Failed to load diary:', err)
				if (!isMounted) return
				const message = err instanceof Error ? err.message : 'Failed to load employee diary'
				setDiaryError(message)
				toast({ title: 'Failed to load diary', description: message, variant: 'destructive' })
			} finally {
				if (!isMounted) return
				setDiaryLoading(false)
			}
		}

		loadDiary()
		return () => {
			isMounted = false
		}
	}, [selectedEmployeeId, diaryRefreshToken])

	const filteredEmployees = useMemo(() => {
		const q = employeeFilter.trim().toLowerCase()
		if (!q) return employees
		return employees.filter(e => getEmployeeLabel(e).toLowerCase().includes(q))
	}, [employees, employeeFilter])

	const selectedEmployee = useMemo(() => {
		if (!selectedEmployeeId) return null
		return employees.find(e => e.id === selectedEmployeeId) || null
	}, [employees, selectedEmployeeId])

	const pending = useMemo(() => {
		if (!diary) {
			return {
				holiday: [] as EmployeeDiary['holidays'],
				expenses: [] as EmployeeDiary['expenses'],
				equipmentRequests: [] as EmployeeDiary['equipment']['requests'],
			}
		}

		return {
			holiday: diary.holidays.filter(h => isPendingStatus(h.status)),
			expenses: diary.expenses.filter(e => isPendingStatus(e.status)),
			equipmentRequests: diary.equipment.requests.filter(r => isPendingStatus(r.status)),
		}
	}, [diary])

	const pendingTotal = pending.holiday.length + pending.expenses.length + pending.equipmentRequests.length
	const hasAnyDiaryData = useMemo(() => {
		if (!diary) return false
		return (
			diary.holidays.length > 0 ||
			diary.incidents.length > 0 ||
			diary.expenses.length > 0 ||
			diary.equipment.requests.length > 0 ||
			diary.equipment.issued.length > 0 ||
			diary.training.tests.length > 0
		)
	}, [diary])

	const handleRefreshDiary = () => {
		if (!selectedEmployeeId) return
		setDiaryRefreshToken(n => n + 1)
	}

	const pendingLeadCopy = !canPickEmployee
		? 'You have'
		: 'This employee has'

	useEffect(() => {
		if (!diary) return
		setActiveTab(pendingTotal > 0 ? 'pending' : 'holidays')
	}, [diary, pendingTotal, selectedEmployeeId])

	return (
		<div className="h-full overflow-x-hidden bg-gradient-to-b from-muted/30 to-background">
			<div className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="px-4 md:px-6 py-4">
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div className="space-y-1">
							<Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem>Employee</BreadcrumbItem>
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										<BreadcrumbPage>Diary</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
							<div className="flex flex-wrap items-center gap-2">
								<h1 className="text-xl md:text-2xl font-semibold tracking-tight">
									{canPickEmployee ? 'Employee diary' : 'My diary'}
								</h1>
								<Badge variant="secondary" className="hidden sm:inline-flex">
									{canPickEmployee ? 'Team view' : 'Your record'}
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground">
								{canPickEmployee
									? 'Choose an officer to see holidays, incidents, expenses, licences, equipment and training in one place.'
									: 'Your holidays, incidents, expenses, licences, equipment and training — scoped to your officer profile.'}
							</p>
						</div>

						<div className="flex w-full items-center gap-2 md:w-auto">
							{lastUpdatedAt && (
								<p className="hidden text-xs text-muted-foreground md:block">
									Updated {lastUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
								</p>
							)}
							<Button
								variant="outline"
								onClick={handleRefreshDiary}
								disabled={!selectedEmployeeId || diaryLoading}
								aria-label="Refresh diary"
								className="w-full md:w-auto"
							>
								{diaryLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Refreshing…
									</>
								) : (
									<>
										<RefreshCw className="mr-2 h-4 w-4" />
										Refresh
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="p-4 md:p-6 space-y-6">
				{canPickEmployee ? (
					<Card className="overflow-hidden border-border/60 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
						<CardHeader className="border-b bg-muted/20">
							<CardTitle className="flex items-center gap-2 text-base md:text-lg">
								<Users className="h-5 w-5 text-muted-foreground shrink-0" />
								View diary for an employee
							</CardTitle>
							<CardDescription>
								Search the list, then select who you want to review. Officers always see only their own diary — no picker.
							</CardDescription>
						</CardHeader>
						<CardContent className="p-4 md:p-6 space-y-4">
							{employeesLoading ? (
								<div className="space-y-2">
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full max-w-lg" />
									<Skeleton className="h-4 w-2/3" />
								</div>
							) : (
								<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
									<div className="w-full lg:max-w-xl space-y-3">
										<div className="relative">
											<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
											<Input
												value={employeeFilter}
												onChange={e => setEmployeeFilter(e.target.value)}
												placeholder="Filter by name or employee number…"
												className="pl-9"
												disabled={employees.length === 0}
												aria-label="Filter employees"
											/>
										</div>
										<Select
											value={selectedEmployeeId ? String(selectedEmployeeId) : ''}
											onValueChange={value => setSelectedEmployeeId(value ? Number(value) : null)}
											disabled={employees.length === 0}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select an employee" />
											</SelectTrigger>
											<SelectContent>
												{filteredEmployees.length === 0 ? (
													<div className="px-2 py-6 text-center text-sm text-muted-foreground">
														No employees match your filter.
													</div>
												) : (
													filteredEmployees.map(employee => (
														<SelectItem key={employee.id} value={String(employee.id)}>
															{getEmployeeLabel(employee)}
														</SelectItem>
													))
												)}
											</SelectContent>
										</Select>
										{employeesError && (
											<p className="text-sm text-destructive">{employeesError}</p>
										)}
									</div>
									{selectedEmployeeId ? (
										<div className="flex items-center gap-2 text-sm text-muted-foreground lg:pb-1">
											<Sparkles className="h-4 w-4 shrink-0" />
											<span>Tip: check the Pending tab for items awaiting approval.</span>
										</div>
									) : (
										<p className="text-sm text-muted-foreground lg:pb-1">
											{employees.length > 0
												? `${employees.length} employee${employees.length === 1 ? '' : 's'} loaded — pick one to continue.`
												: 'No employees returned from the server.'}
										</p>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				) : (
					<div className="rounded-xl border border-border/60 bg-card/80 px-4 py-3 md:px-5 md:py-4 shadow-sm">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-start gap-3">
								<div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
									<User className="h-5 w-5" aria-hidden />
								</div>
								<div className="space-y-1 min-w-0">
									<p className="text-sm font-medium text-foreground">Your officer diary</p>
									{employeesLoading ? (
										<Skeleton className="h-4 w-56" />
									) : !officerBootstrapDone ? (
										<p className="text-sm text-muted-foreground">Syncing your officer profile…</p>
									) : employeesError ? (
										<p className="text-sm text-destructive">{employeesError}</p>
									) : diary?.employee ? (
										<p className="text-sm text-muted-foreground truncate">
											<span className="font-medium text-foreground">{diary.employee.fullName}</span>
											{' · '}
											{diary.employee.employeeNumber}
											{diary.employee.position ? ` · ${diary.employee.position}` : ''}
										</p>
									) : selectedEmployeeId ? (
										<p className="text-sm text-muted-foreground">Loading your profile…</p>
									) : (
										<p className="text-sm text-muted-foreground">
											Link your account to an employee record to see diary entries here.
										</p>
									)}
								</div>
							</div>
							{selectedEmployeeId && !employeesError && (
								<Badge variant="outline" className="w-fit shrink-0 border-emerald-200 bg-emerald-50 text-emerald-900">
									Signed-in officer only
								</Badge>
							)}
						</div>
					</div>
				)}

				{canPickEmployee && !selectedEmployeeId && !employeesLoading && (
					<Card className="border-dashed">
						<CardContent className="p-6 text-sm text-muted-foreground">
							Select an employee above to load their diary.
						</CardContent>
					</Card>
				)}

				{selectedEmployeeId && diaryLoading && (
					<Card className="border-border/60">
						<CardContent className="p-4 md:p-6 space-y-4">
							<div className="flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
								<p className="text-sm text-muted-foreground">Loading diary…</p>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-6 gap-3">
								{Array.from({ length: 6 }).map((_, i) => (
									<Skeleton key={i} className="h-20 w-full" />
								))}
							</div>
							<Skeleton className="h-28 w-full" />
							<Skeleton className="h-10 w-80" />
							<Skeleton className="h-64 w-full" />
						</CardContent>
					</Card>
				)}

				{selectedEmployeeId && diaryError && !diaryLoading && (
					<Alert variant="destructive" className="py-3">
						<div className="flex items-start gap-2">
							<AlertCircle className="h-4 w-4 mt-0.5" />
							<div className="space-y-2">
								<p className="text-sm font-medium">Unable to load employee diary</p>
								<p className="text-sm">{diaryError}</p>
								<Button
									variant="outline"
									size="sm"
									className="h-8"
									onClick={handleRefreshDiary}
								>
									Try again
								</Button>
							</div>
						</div>
					</Alert>
				)}

				{diary && (
					<>
						{!diaryLoading && !diaryError && !hasAnyDiaryData && (
							<Card className="border-dashed">
								<CardContent className="p-6">
									<p className="text-sm font-medium text-foreground">No diary records yet</p>
									<p className="mt-1 text-sm text-muted-foreground">
										No holidays, incidents, expenses, equipment, or training entries were found for this profile.
									</p>
								</CardContent>
							</Card>
						)}
						{pendingTotal > 0 && (
							<Card className="border-amber-200">
								<CardHeader>
									<CardTitle className="text-base">Pending approvals</CardTitle>
									<CardDescription>
										{pendingLeadCopy}{' '}
										<span className="font-medium text-foreground">{pendingTotal}</span> pending item(s) across holidays, expenses, and equipment requests.
									</CardDescription>
								</CardHeader>
								<CardContent className="text-sm">
									<div className="flex flex-wrap gap-2">
										{pending.holiday.length > 0 && (
											<Badge variant="secondary">Holidays: {pending.holiday.length}</Badge>
										)}
										{pending.expenses.length > 0 && (
											<Badge variant="secondary">Expenses: {pending.expenses.length}</Badge>
										)}
										{pending.equipmentRequests.length > 0 && (
											<Badge variant="secondary">Equipment: {pending.equipmentRequests.length}</Badge>
										)}
									</div>
								</CardContent>
							</Card>
						)}

						<div className="grid grid-cols-2 md:grid-cols-6 gap-3">
							<Card className="border-white/10 bg-gradient-to-br from-blue-950 to-blue-900 text-white shadow-sm">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-xs text-white/70">Holidays</p>
											<p className="text-lg font-semibold text-white">{diary.stats.holidayCount}</p>
										</div>
										<CalendarDays className="h-5 w-5 text-white/90" />
									</div>
								</CardContent>
							</Card>
							<Card className="border-white/10 bg-gradient-to-br from-rose-950 to-rose-900 text-white shadow-sm">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-xs text-white/70">Incidents</p>
											<p className="text-lg font-semibold text-white">{diary.stats.incidentCount}</p>
										</div>
										<ShieldAlert className="h-5 w-5 text-white/90" />
									</div>
								</CardContent>
							</Card>
							<Card className="border-white/10 bg-gradient-to-br from-emerald-950 to-emerald-900 text-white shadow-sm">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-xs text-white/70">Expenses</p>
											<p className="text-lg font-semibold text-white">{diary.stats.expenseCount}</p>
										</div>
										<CreditCard className="h-5 w-5 text-white/90" />
									</div>
								</CardContent>
							</Card>
							<Card className="border-white/10 bg-gradient-to-br from-amber-950 to-amber-900 text-white shadow-sm">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-xs text-white/70">Equipment requests</p>
											<p className="text-lg font-semibold text-white">{diary.stats.equipmentRequestCount}</p>
										</div>
										<HardHat className="h-5 w-5 text-white/90" />
									</div>
								</CardContent>
							</Card>
							<Card className="border-white/10 bg-gradient-to-br from-indigo-950 to-indigo-900 text-white shadow-sm">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-xs text-white/70">Equipment issued</p>
											<p className="text-lg font-semibold text-white">{diary.stats.equipmentIssuedCount}</p>
										</div>
										<Briefcase className="h-5 w-5 text-white/90" />
									</div>
								</CardContent>
							</Card>
							<Card className="border-white/10 bg-gradient-to-br from-slate-950 to-slate-900 text-white shadow-sm">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-xs text-white/70">Training tests</p>
											<p className="text-lg font-semibold text-white">{diary.stats.trainingTestCount}</p>
										</div>
										<FileText className="h-5 w-5 text-white/90" />
									</div>
								</CardContent>
							</Card>
						</div>

						<Card className={!canPickEmployee ? 'border-border/70 shadow-sm' : undefined}>
							<CardHeader className={!canPickEmployee ? 'space-y-1 pb-3' : undefined}>
								<CardTitle className={!canPickEmployee ? 'text-base' : undefined}>
									{canPickEmployee
										? diary.employee.fullName || selectedEmployee?.fullName || getEmployeeLabel(selectedEmployee || employees[0])
										: 'Contact details'}
								</CardTitle>
								<CardDescription>
									{canPickEmployee ? (
										<>
											{diary.employee.position} • {diary.employee.employeeStatus} • {diary.employee.employeeNumber}
										</>
									) : (
										<>
											{diary.employee.fullName} · {diary.employee.employeeNumber}
											{diary.employee.position ? ` · ${diary.employee.position}` : ''}
										</>
									)}
								</CardDescription>
							</CardHeader>
							<CardContent className={!canPickEmployee ? 'pt-0 text-sm text-muted-foreground' : 'text-sm text-muted-foreground'}>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
									<div><span className="font-medium text-foreground">Email:</span> {diary.employee.email || '—'}</div>
									<div><span className="font-medium text-foreground">Phone:</span> {diary.employee.contactNumber || '—'}</div>
									<div><span className="font-medium text-foreground">Region:</span> {diary.employee.region || '—'}</div>
								</div>
							</CardContent>
						</Card>

						<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
							<TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-7">
								<TabsTrigger value="pending" className="w-full px-2 py-2 text-xs sm:text-sm">
									Pending
									{pendingTotal > 0 && (
										<span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-medium text-amber-800">
											{pendingTotal}
										</span>
									)}
								</TabsTrigger>
								<TabsTrigger value="holidays" className="w-full px-2 py-2 text-xs sm:text-sm">
									Holidays
									<span className="ml-1 text-[10px] opacity-70">({diary.holidays.length})</span>
								</TabsTrigger>
								<TabsTrigger value="incidents" className="w-full px-2 py-2 text-xs sm:text-sm">
									Incidents
									<span className="ml-1 text-[10px] opacity-70">({diary.incidents.length})</span>
								</TabsTrigger>
								<TabsTrigger value="expenses" className="w-full px-2 py-2 text-xs sm:text-sm">
									Expenses
									<span className="ml-1 text-[10px] opacity-70">({diary.expenses.length})</span>
								</TabsTrigger>
								<TabsTrigger value="license" className="w-full px-2 py-2 text-xs sm:text-sm">License</TabsTrigger>
								<TabsTrigger value="equipment" className="w-full px-2 py-2 text-xs sm:text-sm">
									Equipment
									<span className="ml-1 text-[10px] opacity-70">({diary.equipment.requests.length + diary.equipment.issued.length})</span>
								</TabsTrigger>
								<TabsTrigger value="training" className="w-full px-2 py-2 text-xs sm:text-sm">
									Training
									<span className="ml-1 text-[10px] opacity-70">({diary.training.tests.length})</span>
								</TabsTrigger>
							</TabsList>

							<TabsContent value="pending" className="mt-4">
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
									<Card>
										<CardHeader>
											<CardTitle className="text-base">Pending holidays</CardTitle>
											<CardDescription>Status = Pending</CardDescription>
										</CardHeader>
										<CardContent>
											{pending.holiday.length === 0 ? (
												<p className="text-sm text-muted-foreground">No pending holidays.</p>
											) : (
												<ul className="space-y-2">
													{pending.holiday.slice(0, 10).map(h => (
														<li key={h.id} className="text-sm">
															<div className="flex items-center justify-between">
																<span>{formatDate(h.startDate)} – {formatDate(h.endDate)}</span>
																<Badge variant="secondary">Pending</Badge>
															</div>
															<div className="text-xs text-muted-foreground">{h.totalDays} day(s)</div>
														</li>
													))}
												</ul>
											)}
										</CardContent>
									</Card>

									<Card>
										<CardHeader>
											<CardTitle className="text-base">Pending expenses</CardTitle>
											<CardDescription>Status = Pending</CardDescription>
										</CardHeader>
										<CardContent>
											{pending.expenses.length === 0 ? (
												<p className="text-sm text-muted-foreground">No pending expenses.</p>
											) : (
												<ul className="space-y-2">
													{pending.expenses.slice(0, 10).map(e => (
														<li key={e.id} className="text-sm">
															<div className="flex items-center justify-between">
																<span>{formatDate(e.weekStartDate)} – {formatDate(e.weekEndDate)}</span>
																<Badge variant="secondary">Pending</Badge>
															</div>
															<div className="text-xs text-muted-foreground">Total: {formatMoney(e.weekTotal)}</div>
														</li>
													))}
												</ul>
											)}
										</CardContent>
									</Card>

									<Card>
										<CardHeader>
											<CardTitle className="text-base">Pending equipment</CardTitle>
											<CardDescription>Status = Pending</CardDescription>
										</CardHeader>
										<CardContent>
											{pending.equipmentRequests.length === 0 ? (
												<p className="text-sm text-muted-foreground">No pending equipment requests.</p>
											) : (
												<ul className="space-y-2">
													{pending.equipmentRequests.slice(0, 10).map(r => (
														<li key={r.id} className="text-sm">
															<div className="flex items-center justify-between">
																<span>{r.equipmentType}{r.size ? ` (${r.size})` : ''}</span>
																<Badge variant="secondary">Pending</Badge>
															</div>
															<div className="text-xs text-muted-foreground">Qty {r.quantity} • {formatDate(r.createdAt)}</div>
														</li>
													))}
												</ul>
											)}
										</CardContent>
									</Card>
								</div>
							</TabsContent>

							<TabsContent value="holidays" className="mt-4">
								<Card>
									<CardHeader>
										<CardTitle>Booked holidays</CardTitle>
										<CardDescription>Holiday requests from the HolidayRequest table.</CardDescription>
									</CardHeader>
									<CardContent>
										{diary.holidays.length === 0 ? (
											<p className="text-sm text-muted-foreground">No holiday requests found.</p>
										) : (
											<>
												<div className="space-y-2 sm:hidden">
													{diary.holidays.map(h => (
														<div key={`holiday-mobile-${h.id}`} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
															<div className="flex items-start justify-between gap-2">
																<div className="min-w-0 flex-1">
																	<p className="text-sm font-semibold text-slate-800">{formatDate(h.startDate)} - {formatDate(h.endDate)}</p>
																	<p className="mt-1 text-xs text-slate-500">{h.totalDays} day(s)</p>
																</div>
																<Badge variant={getStatusBadgeVariant(h.status)}>{h.status}</Badge>
															</div>
															<div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
																<div>
																	<p className="text-[10px] uppercase tracking-wide text-slate-400">Requested</p>
																	<p className="font-medium text-slate-700">{formatDate(h.dateOfRequest)}</p>
																</div>
																<div>
																	<p className="text-[10px] uppercase tracking-wide text-slate-400">Return</p>
																	<p className="font-medium text-slate-700">{formatDate(h.returnToWorkDate)}</p>
																</div>
															</div>
														</div>
													))}
												</div>
												<div className="hidden overflow-x-auto sm:block">
												<Table>
													<TableHeader className="border-b">
														<TableRow>
															<TableHead>Dates</TableHead>
															<TableHead>Days</TableHead>
															<TableHead>Status</TableHead>
															<TableHead>Requested</TableHead>
															<TableHead>Return</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{diary.holidays.map(h => (
															<TableRow key={h.id}>
																<TableCell className="font-medium">{formatDate(h.startDate)} – {formatDate(h.endDate)}</TableCell>
																<TableCell>{h.totalDays}</TableCell>
																<TableCell>
																	<Badge variant={getStatusBadgeVariant(h.status)}>{h.status}</Badge>
																</TableCell>
																<TableCell>{formatDate(h.dateOfRequest)}</TableCell>
																<TableCell>{formatDate(h.returnToWorkDate)}</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
												</div>
											</>
										)}
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="incidents" className="mt-4">
								<Card>
									<CardHeader>
										<CardTitle>Incident reporting</CardTitle>
										<CardDescription>Incidents created by the linked user or matching officer name.</CardDescription>
									</CardHeader>
									<CardContent>
										{diary.incidents.length === 0 ? (
											<p className="text-sm text-muted-foreground">No incidents found.</p>
										) : (
											<>
												<div className="space-y-2 sm:hidden">
													{diary.incidents.map(i => (
														<div key={`incident-mobile-${i.incidentId}`} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
															<p className="text-sm font-semibold text-slate-800">{i.incidentType}</p>
															<div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
																<div>
																	<p className="text-[10px] uppercase tracking-wide text-slate-400">Date</p>
																	<p className="font-medium text-slate-700">{formatDate(i.dateOfIncident)}</p>
																</div>
																<div>
																	<p className="text-[10px] uppercase tracking-wide text-slate-400">Site</p>
																	<p className="font-medium text-slate-700">{i.siteName || '—'}</p>
																</div>
																<div>
																	<p className="text-[10px] uppercase tracking-wide text-slate-400">Customer</p>
																	<p className="font-medium text-slate-700">{i.customerName || '—'}</p>
																</div>
																<div>
																	<p className="text-[10px] uppercase tracking-wide text-slate-400">Value recovered</p>
																	<p className="font-medium text-slate-700">{formatMoney(i.valueRecovered ?? i.totalValueRecovered ?? null)}</p>
																</div>
															</div>
														</div>
													))}
												</div>
												<div className="hidden overflow-x-auto sm:block">
												<Table>
													<TableHeader className="border-b">
														<TableRow>
															<TableHead>Date</TableHead>
															<TableHead>Store/Site</TableHead>
															<TableHead>Customer</TableHead>
															<TableHead>Type</TableHead>
															<TableHead>Value recovered</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{diary.incidents.map(i => (
															<TableRow key={i.incidentId}>
																<TableCell className="font-medium">{formatDate(i.dateOfIncident)}</TableCell>
																<TableCell>{i.siteName}</TableCell>
																<TableCell>{i.customerName || '—'}</TableCell>
																<TableCell>{i.incidentType}</TableCell>
																<TableCell>{formatMoney(i.valueRecovered ?? i.totalValueRecovered ?? null)}</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
												</div>
											</>
										)}
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="expenses" className="mt-4">
								<Card>
									<CardHeader>
										<CardTitle>Expenses</CardTitle>
										<CardDescription>Officer expense claims linked via the user ID.</CardDescription>
									</CardHeader>
									<CardContent>
										{diary.expenses.length === 0 ? (
											<p className="text-sm text-muted-foreground">No expense claims found.</p>
										) : (
											<>
												<div className="space-y-2 sm:hidden">
													{diary.expenses.map(c => (
														<div key={`expense-mobile-${c.id}`} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
															<div className="flex items-start justify-between gap-2">
																<p className="text-sm font-semibold text-slate-800">{formatDate(c.weekStartDate)} - {formatDate(c.weekEndDate)}</p>
																<Badge variant={getStatusBadgeVariant(c.status)}>{c.status}</Badge>
															</div>
															<div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
																<div>
																	<p className="text-[10px] uppercase tracking-wide text-slate-400">Total</p>
																	<p className="font-medium text-slate-700">{formatMoney(c.weekTotal)}</p>
																</div>
																<div>
																	<p className="text-[10px] uppercase tracking-wide text-slate-400">Approved</p>
																	<p className="font-medium text-slate-700">{c.approvedAt ? `${formatDate(c.approvedAt)} (${c.approvedByName || '—'})` : '—'}</p>
																</div>
															</div>
														</div>
													))}
												</div>
												<div className="hidden overflow-x-auto sm:block">
												<Table>
													<TableHeader className="border-b">
														<TableRow>
															<TableHead>Week</TableHead>
															<TableHead>Status</TableHead>
															<TableHead>Total</TableHead>
															<TableHead>Approved</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{diary.expenses.map(c => (
															<TableRow key={c.id}>
																<TableCell className="font-medium">{formatDate(c.weekStartDate)} – {formatDate(c.weekEndDate)}</TableCell>
																<TableCell><Badge variant={getStatusBadgeVariant(c.status)}>{c.status}</Badge></TableCell>
																<TableCell>{formatMoney(c.weekTotal)}</TableCell>
																<TableCell>{c.approvedAt ? `${formatDate(c.approvedAt)} (${c.approvedByName || '—'})` : '—'}</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
												</div>
											</>
										)}
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="license" className="mt-4">
								<Card>
									<CardHeader>
										<CardTitle>License</CardTitle>
										<CardDescription>License info extracted from the Employee table.</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<Card>
												<CardHeader>
													<CardTitle className="text-base">SIA license</CardTitle>
												</CardHeader>
												<CardContent className="text-sm">
													<div className="flex items-center justify-between">
														<span className="text-muted-foreground">Type</span>
														<span className="font-medium">{diary.license.siaLicenceType || '—'}</span>
													</div>
													<div className="flex items-center justify-between mt-2">
														<span className="text-muted-foreground">Expiry</span>
														<div className="flex items-center gap-2">
															<span className="font-medium">{formatDate(diary.license.siaLicenceExpiry)}</span>
															{diary.license.isSiaLicenceExpired ? (
																<Badge variant="destructive">Expired</Badge>
															) : diary.license.isSiaLicenceExpiringSoon ? (
																<Badge variant="secondary">Expiring soon</Badge>
															) : (
																<Badge variant="secondary">Valid</Badge>
															)}
														</div>
													</div>
												</CardContent>
											</Card>

											<Card>
												<CardHeader>
													<CardTitle className="text-base">Driving license</CardTitle>
												</CardHeader>
												<CardContent className="text-sm">
													<div className="flex items-center justify-between">
														<span className="text-muted-foreground">Type</span>
														<span className="font-medium">{diary.license.drivingLicenceType || '—'}</span>
													</div>
													<div className="flex items-center justify-between mt-2">
														<span className="text-muted-foreground">Last checked</span>
														<span className="font-medium">{formatDate(diary.license.dateDLChecked)}</span>
													</div>
													<div className="flex items-center justify-between mt-2">
														<span className="text-muted-foreground">Copy taken</span>
														<span className="font-medium">{diary.license.drivingLicenceCopyTaken ? 'Yes' : 'No'}</span>
													</div>
												</CardContent>
											</Card>
										</div>
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="equipment" className="mt-4">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
									<Card>
										<CardHeader>
											<CardTitle>Equipment requests</CardTitle>
											<CardDescription>Requests from the Uniform &amp; Equipment Request table.</CardDescription>
										</CardHeader>
										<CardContent>
											{diary.equipment.requests.length === 0 ? (
												<p className="text-sm text-muted-foreground">No requests found.</p>
											) : (
												<>
													<div className="space-y-2 sm:hidden">
														{diary.equipment.requests.map(r => (
															<div key={`equipment-request-mobile-${r.id}`} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
																<div className="flex items-start justify-between gap-2">
																	<p className="text-sm font-semibold text-slate-800">{r.equipmentType}{r.size ? ` (${r.size})` : ''}</p>
																	<Badge variant={getStatusBadgeVariant(r.status)}>{r.status}</Badge>
																</div>
																<div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
																	<div>
																		<p className="text-[10px] uppercase tracking-wide text-slate-400">Quantity</p>
																		<p className="font-medium text-slate-700">{r.quantity}</p>
																	</div>
																	<div>
																		<p className="text-[10px] uppercase tracking-wide text-slate-400">Priority</p>
																		<Badge variant="secondary">{r.priority}</Badge>
																	</div>
																	<div className="col-span-2">
																		<p className="text-[10px] uppercase tracking-wide text-slate-400">Requested</p>
																		<p className="font-medium text-slate-700">{formatDate(r.createdAt)}</p>
																	</div>
																</div>
															</div>
														))}
													</div>
													<div className="hidden overflow-x-auto sm:block">
													<Table>
														<TableHeader className="border-b">
															<TableRow>
																<TableHead>Item</TableHead>
																<TableHead>Qty</TableHead>
																<TableHead>Priority</TableHead>
																<TableHead>Status</TableHead>
																<TableHead>Requested</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{diary.equipment.requests.map(r => (
																<TableRow key={r.id}>
																	<TableCell className="font-medium">{r.equipmentType}{r.size ? ` (${r.size})` : ''}</TableCell>
																	<TableCell>{r.quantity}</TableCell>
																	<TableCell><Badge variant="secondary">{r.priority}</Badge></TableCell>
																	<TableCell><Badge variant={getStatusBadgeVariant(r.status)}>{r.status}</Badge></TableCell>
																	<TableCell>{formatDate(r.createdAt)}</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
													</div>
												</>
											)}
										</CardContent>
									</Card>

									<Card>
										<CardHeader>
											<CardTitle>Equipment issued</CardTitle>
											<CardDescription>Issued items from the Uniform &amp; Equipment Issued table.</CardDescription>
										</CardHeader>
										<CardContent>
											{diary.equipment.issued.length === 0 ? (
												<p className="text-sm text-muted-foreground">No issued items found.</p>
											) : (
												<>
													<div className="space-y-2 sm:hidden">
														{diary.equipment.issued.map(i => (
															<div key={`equipment-issued-mobile-${i.id}`} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
																<p className="text-sm font-semibold text-slate-800">{i.equipmentType}{i.size ? ` (${i.size})` : ''}</p>
																<div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
																	<div>
																		<p className="text-[10px] uppercase tracking-wide text-slate-400">Quantity</p>
																		<p className="font-medium text-slate-700">{i.quantity}</p>
																	</div>
																	<div>
																		<p className="text-[10px] uppercase tracking-wide text-slate-400">Condition</p>
																		<Badge variant="secondary">{i.condition}</Badge>
																	</div>
																	<div>
																		<p className="text-[10px] uppercase tracking-wide text-slate-400">Issued</p>
																		<p className="font-medium text-slate-700">{formatDate(i.dateIssued)}</p>
																	</div>
																	<div>
																		<p className="text-[10px] uppercase tracking-wide text-slate-400">Returned</p>
																		<p className="font-medium text-slate-700">{formatDate(i.dateReturned)}</p>
																	</div>
																</div>
															</div>
														))}
													</div>
													<div className="hidden overflow-x-auto sm:block">
													<Table>
														<TableHeader className="border-b">
															<TableRow>
																<TableHead>Item</TableHead>
																<TableHead>Qty</TableHead>
																<TableHead>Condition</TableHead>
																<TableHead>Issued</TableHead>
																<TableHead>Returned</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{diary.equipment.issued.map(i => (
																<TableRow key={i.id}>
																	<TableCell className="font-medium">{i.equipmentType}{i.size ? ` (${i.size})` : ''}</TableCell>
																	<TableCell>{i.quantity}</TableCell>
																	<TableCell><Badge variant="secondary">{i.condition}</Badge></TableCell>
																	<TableCell>{formatDate(i.dateIssued)}</TableCell>
																	<TableCell>{formatDate(i.dateReturned)}</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
													</div>
												</>
											)}
										</CardContent>
									</Card>
								</div>
							</TabsContent>

							<TabsContent value="training" className="mt-4">
								<div className="space-y-4">
									<Card>
										<CardHeader>
											<CardTitle>Training &amp; induction</CardTitle>
											<CardDescription>Training fields and test attempts.</CardDescription>
										</CardHeader>
										<CardContent className="text-sm">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
												<div><span className="font-medium text-foreground">Induction booked:</span> {formatDate(diary.training.inductionAndTrainingBooked)}</div>
												<div><span className="font-medium text-foreground">Full rotas issued:</span> {formatDate(diary.training.fullRotasIssued)}</div>
												<div><span className="font-medium text-foreground">Trainer:</span> {diary.training.trainer || '—'}</div>
												<div><span className="font-medium text-foreground">Location:</span> {diary.training.location || '—'}</div>
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardHeader>
											<CardTitle>Tests</CardTitle>
											<CardDescription>Attempts from the Take Test table.</CardDescription>
										</CardHeader>
										<CardContent>
											{diary.training.tests.length === 0 ? (
												<p className="text-sm text-muted-foreground">No test attempts found.</p>
											) : (
												<>
													<div className="space-y-2 sm:hidden">
														{diary.training.tests.map(t => (
															<div key={`training-mobile-${t.id}`} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
																<div className="flex items-start justify-between gap-2">
																	<p className="text-sm font-semibold text-slate-800">{t.testTitle}</p>
																	<Badge variant={getStatusBadgeVariant(t.status)}>{t.status}</Badge>
																</div>
																<div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
																	<div>
																		<p className="text-[10px] uppercase tracking-wide text-slate-400">Completed</p>
																		<p className="font-medium text-slate-700">{formatDate(t.completedAt)}</p>
																	</div>
																	<div>
																		<p className="text-[10px] uppercase tracking-wide text-slate-400">Score</p>
																		<p className="font-medium text-slate-700">{Math.round(t.percentageScore)}%</p>
																	</div>
																</div>
															</div>
														))}
													</div>
													<div className="hidden overflow-x-auto sm:block">
													<Table>
														<TableHeader className="border-b">
															<TableRow>
																<TableHead>Test</TableHead>
																<TableHead>Completed</TableHead>
																<TableHead>Score</TableHead>
																<TableHead>Status</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{diary.training.tests.map(t => (
																<TableRow key={t.id}>
																	<TableCell className="font-medium">{t.testTitle}</TableCell>
																	<TableCell>{formatDate(t.completedAt)}</TableCell>
																	<TableCell>{Math.round(t.percentageScore)}%</TableCell>
																	<TableCell><Badge variant={getStatusBadgeVariant(t.status)}>{t.status}</Badge></TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
													</div>
												</>
											)}
										</CardContent>
									</Card>
								</div>
							</TabsContent>
						</Tabs>
					</>
				)}
			</div>
		</div>
	)
}

export default EmployeeDiaryPage
