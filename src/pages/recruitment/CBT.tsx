/**
 * Recruitment CBT administration: tests, questions, and assignments.
 * Flow: test catalog → question editor → assign sessions to candidates.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	AlertTriangle,
	AlignLeft,
	BookOpen,
	CheckCircle,
	CheckSquare,
	Clock,
	ChevronLeft,
	ChevronRight,
	Edit2,
	Eye,
	FileText,
	List,
	Plus,
	Search,
	Timer,
	Trash2,
	Type,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { recruitmentTestService } from '@/services/recruitmentTestService'
import type {
	RecruitmentAdminOption,
	RecruitmentAdminQuestion,
	RecruitmentAdminTest,
	RecruitmentAttemptDetail,
	RecruitmentAttemptSummary,
	RecruitmentQuestionType,
	RecruitmentTestSummary,
} from '@/types/recruitment-tests'

type TestStatus = 'draft' | 'active' | 'scheduled' | 'completed'
interface BulkQuestionDraft {
	id: string
	text: string
	type: RecruitmentQuestionType
	points: number
	correctAnswerText: string
	options: RecruitmentAdminOption[]
}

const normalizeStatus = (value: string | null | undefined) => String(value ?? '').trim().toLowerCase()
const cbtDateFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

/** Safely get test id from a list item (handles camelCase and PascalCase from API) */
function getTestId(t: RecruitmentTestSummary & { TestId?: string }): string {
	return String((t as RecruitmentTestSummary).testId ?? t.TestId ?? '').trim()
}

const makeId = () => {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const createDefaultOptions = (): RecruitmentAdminOption[] => ([
	{ optionId: null, text: '', sortOrder: 1, isCorrect: false },
	{ optionId: null, text: '', sortOrder: 2, isCorrect: false },
])

const createBulkDraft = (): BulkQuestionDraft => ({
	id: makeId(),
	text: '',
	type: 'multiple-choice',
	points: 1,
	correctAnswerText: '',
	options: createDefaultOptions(),
})

const normalizeBulkOptions = (options: RecruitmentAdminOption[]) => options
	.map(option => ({ ...option, text: option.text.trim() }))
	.filter(option => option.text !== '')
	.map((option, index) => ({ ...option, sortOrder: index + 1 }))

const parseDateInput = (value: string, endOfDay = false) => {
	if (!value) return null
	const parts = value.split('-').map(part => Number(part))
	if (parts.length !== 3 || parts.some(Number.isNaN)) return null
	const [year, month, day] = parts
	const date = endOfDay
		? new Date(year, month - 1, day, 23, 59, 59, 999)
		: new Date(year, month - 1, day, 0, 0, 0, 0)
	if (Number.isNaN(date.getTime())) return null
	return date
}

const parseDateTime = (value?: string | null) => {
	if (!value) return null
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return null
	return date
}

const formatDate = (value?: string | null) => {
	const date = parseDateTime(value)
	return date ? cbtDateFormatter.format(date) : '—'
}

const escapeCsvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`

const applyBulkTypeDefaults = (draft: BulkQuestionDraft, nextType: RecruitmentQuestionType): BulkQuestionDraft => {
	const normalizedType = normalizeStatus(nextType) as RecruitmentQuestionType
	const isChoice = normalizedType === 'multiple-choice' || normalizedType === 'multiple-answer'
	const isTrueFalse = normalizedType === 'true-false'
	const isText = normalizedType === 'text' || normalizedType === 'essay'

	const options = isChoice
		? (draft.options.length >= 2 ? draft.options : createDefaultOptions())
		: []

	const sanitizedOptions = options.map((option, index) => ({ ...option, sortOrder: index + 1 }))
	const correctAnswerText = isTrueFalse ? (draft.correctAnswerText || 'true') : isText ? draft.correctAnswerText : ''

	if (normalizedType === 'multiple-choice') {
		const firstCorrect = sanitizedOptions.findIndex(option => option.isCorrect)
		const normalizedOptions = sanitizedOptions.map((option, index) => ({
			...option,
			isCorrect: index === firstCorrect && firstCorrect !== -1,
		}))
		return { ...draft, type: normalizedType, options: normalizedOptions, correctAnswerText }
	}

	return { ...draft, type: normalizedType, options: sanitizedOptions, correctAnswerText }
}

const CBT = () => {
	const TESTS_PAGE_SIZE = 9
	const RESULTS_PAGE_SIZE = 10

	const [activeTab, setActiveTab] = useState<'tests' | 'results'>('tests')
	const [searchTerm, setSearchTerm] = useState('')
	const [filterStatus, setFilterStatus] = useState<'all' | TestStatus>('all')
	const [testsPage, setTestsPage] = useState(1)
	const [resultsPage, setResultsPage] = useState(1)

	const [testsLoading, setTestsLoading] = useState(false)
	const [testsError, setTestsError] = useState<string | null>(null)
	const [tests, setTests] = useState<RecruitmentTestSummary[]>([])

	const [attemptsLoading, setAttemptsLoading] = useState(false)
	const [attemptsError, setAttemptsError] = useState<string | null>(null)
	const [attempts, setAttempts] = useState<RecruitmentAttemptSummary[]>([])

	const [createDialogOpen, setCreateDialogOpen] = useState(false)
	const [editMode, setEditMode] = useState(false)

	const [currentTest, setCurrentTest] = useState<RecruitmentAdminTest | null>(null)
	const [currentTestHasAttempts, setCurrentTestHasAttempts] = useState(false)
	const [testSaving, setTestSaving] = useState(false)

	const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
	const [currentQuestion, setCurrentQuestion] = useState<RecruitmentAdminQuestion | null>(null)
	const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
	const [bulkQuestions, setBulkQuestions] = useState<BulkQuestionDraft[]>([createBulkDraft()])

	const [resultDetailsOpen, setResultDetailsOpen] = useState(false)
	const [currentResult, setCurrentResult] = useState<RecruitmentAttemptDetail | null>(null)
	const [resultLoading, setResultLoading] = useState(false)

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [deleteSubmitting, setDeleteSubmitting] = useState(false)
	const [pendingDelete, setPendingDelete] = useState<{ testId: string; title: string } | null>(null)

	const [resultsFilterTestId, setResultsFilterTestId] = useState<string>('all')
	const [resultsDateFrom, setResultsDateFrom] = useState<string>('')
	const [resultsDateTo, setResultsDateTo] = useState<string>('')

	const loadTests = useCallback(async () => {
		setTestsLoading(true)
		setTestsError(null)
		try {
			const data = await recruitmentTestService.getAdminTests()
			setTests(data)
		} catch (err) {
			console.error('❌ [CBT] Failed to load tests:', err)
			const message = err instanceof Error ? err.message : 'Failed to load tests'
			setTestsError(message)
			toast({ title: 'Failed to load tests', description: message, variant: 'destructive' })
		} finally {
			setTestsLoading(false)
		}
	}, [])

	const loadAttempts = useCallback(async () => {
		setAttemptsLoading(true)
		setAttemptsError(null)
		try {
			const data = await recruitmentTestService.getAdminAttempts(resultsFilterTestId === 'all' ? undefined : resultsFilterTestId)
			setAttempts(data)
		} catch (err) {
			console.error('❌ [CBT] Failed to load attempts:', err)
			const message = err instanceof Error ? err.message : 'Failed to load attempts'
			setAttemptsError(message)
			toast({ title: 'Failed to load attempts', description: message, variant: 'destructive' })
		} finally {
			setAttemptsLoading(false)
		}
	}, [resultsFilterTestId])

	useEffect(() => {
		void loadTests()
	}, [loadTests])

	useEffect(() => {
		void loadAttempts()
	}, [loadAttempts])

	const filteredTests = useMemo(() => {
		const term = searchTerm.trim().toLowerCase()
		return tests.filter(t => {
			const matchesSearch = term === '' || t.title.toLowerCase().includes(term) || (t.description ?? '').toLowerCase().includes(term)
			const matchesStatus = filterStatus === 'all' || normalizeStatus(t.status) === filterStatus
			return matchesSearch && matchesStatus
		})
	}, [filterStatus, searchTerm, tests])

	const totalTestPages = Math.max(1, Math.ceil(filteredTests.length / TESTS_PAGE_SIZE))
	const paginatedTests = useMemo(() => {
		const start = (testsPage - 1) * TESTS_PAGE_SIZE
		return filteredTests.slice(start, start + TESTS_PAGE_SIZE)
	}, [filteredTests, testsPage])

	const stats = useMemo(() => {
		const total = tests.length
		const active = tests.filter(t => normalizeStatus(t.status) === 'active').length
		const completed = tests.filter(t => normalizeStatus(t.status) === 'completed').length
		const passRate = attempts.length > 0
			? `${Math.round((attempts.filter(a => normalizeStatus(a.status) === 'passed').length / attempts.length) * 100)}%`
			: '0%'

		return [
			{
				title: 'Total Tests',
				value: total,
				icon: BookOpen,
				accent: 'text-indigo-200',
				ring: 'bg-indigo-500/15 ring-1 ring-inset ring-indigo-400/20',
				card: 'border-indigo-400/20 bg-gradient-to-br from-indigo-950/70 via-slate-950/70 to-slate-950/60',
			},
			{
				title: 'Completed',
				value: completed,
				icon: CheckCircle,
				accent: 'text-emerald-200',
				ring: 'bg-emerald-500/15 ring-1 ring-inset ring-emerald-400/20',
				card: 'border-emerald-400/20 bg-gradient-to-br from-emerald-950/65 via-slate-950/70 to-slate-950/60',
			},
			{
				title: 'Active',
				value: active,
				icon: Clock,
				accent: 'text-amber-200',
				ring: 'bg-amber-500/15 ring-1 ring-inset ring-amber-400/20',
				card: 'border-amber-400/20 bg-gradient-to-br from-amber-950/60 via-slate-950/70 to-slate-950/60',
			},
			{
				title: 'Pass Rate',
				value: passRate,
				icon: AlertTriangle,
				accent: 'text-rose-200',
				ring: 'bg-rose-500/15 ring-1 ring-inset ring-rose-400/20',
				card: 'border-rose-400/20 bg-gradient-to-br from-rose-950/65 via-slate-950/70 to-slate-950/60',
			},
		]
	}, [attempts, tests])

	const getStatusColor = (status: string) => {
		switch (normalizeStatus(status)) {
			case 'active':
				return 'bg-emerald-100 text-emerald-800'
			case 'scheduled':
				return 'bg-blue-100 text-blue-800'
			case 'draft':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
			case 'completed':
				return 'bg-amber-100 text-amber-800'
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
		}
	}

	const sortedCurrentQuestions = useMemo(() => {
		if (!currentTest?.questions?.length) return []
		return [...currentTest.questions].sort((a, b) => a.sortOrder - b.sortOrder)
	}, [currentTest?.questions])

	const filteredAttempts = useMemo(() => {
		const from = parseDateInput(resultsDateFrom)
		const to = parseDateInput(resultsDateTo, true)
		return attempts.filter(attempt => {
			if (resultsFilterTestId !== 'all' && attempt.testId !== resultsFilterTestId) return false
			const completedAt = parseDateTime(attempt.completedAt)
			if (!completedAt) return false
			if (from && completedAt < from) return false
			if (to && completedAt > to) return false
			return true
		})
	}, [attempts, resultsDateFrom, resultsDateTo, resultsFilterTestId])

	const totalResultsPages = Math.max(1, Math.ceil(filteredAttempts.length / RESULTS_PAGE_SIZE))
	const paginatedAttempts = useMemo(() => {
		const start = (resultsPage - 1) * RESULTS_PAGE_SIZE
		return filteredAttempts.slice(start, start + RESULTS_PAGE_SIZE)
	}, [filteredAttempts, resultsPage])

	useEffect(() => {
		setTestsPage(prev => Math.min(Math.max(1, prev), totalTestPages))
	}, [totalTestPages])

	useEffect(() => {
		setResultsPage(prev => Math.min(Math.max(1, prev), totalResultsPages))
	}, [totalResultsPages])

	useEffect(() => {
		setTestsPage(1)
	}, [searchTerm, filterStatus])

	useEffect(() => {
		setResultsPage(1)
	}, [resultsDateFrom, resultsDateTo, resultsFilterTestId])

	const handleExportResultsCsv = () => {
		if (filteredAttempts.length === 0) return
		const headers = [
			'AttemptId',
			'OfficerName',
			'OfficerId',
			'TestTitle',
			'TestId',
			'Score',
			'TotalPoints',
			'PercentageScore',
			'Status',
			'CompletedAt',
		]

		const rows = filteredAttempts.map(attempt => ([
			attempt.attemptId,
			attempt.officerName,
			attempt.officerId,
			attempt.testTitle,
			attempt.testId,
			attempt.score,
			attempt.totalPoints,
			attempt.percentageScore,
			attempt.status,
			attempt.completedAt ?? '',
		]).map(escapeCsvCell).join(','))

		const csv = [headers.join(','), ...rows].join('\n')
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)
		const anchor = document.createElement('a')
		const fromLabel = resultsDateFrom || 'all'
		const toLabel = resultsDateTo || 'all'
		anchor.href = url
		anchor.download = `cbt-results-${fromLabel}_to_${toLabel}.csv`
		anchor.click()
		URL.revokeObjectURL(url)
	}

	const openCreateDialog = () => {
		setEditMode(false)
		setCurrentTest({
			testId: '',
			title: '',
			description: '',
			durationMinutes: 30,
			totalPoints: 100,
			passThresholdPercentage: 80,
			status: 'draft',
			scheduledDate: null,
			questions: [],
		})
		setCreateDialogOpen(true)
	}

	const openEditDialog = async (testIdOrSummary: string | (RecruitmentTestSummary & { TestId?: string })) => {
		const testId = typeof testIdOrSummary === 'string' ? testIdOrSummary : getTestId(testIdOrSummary)
		if (!testId) {
			toast({ title: 'Invalid test', description: 'Test ID is missing.', variant: 'destructive' })
			return
		}
		setEditMode(true)
		setTestSaving(true)
		try {
			const [test, testAttempts] = await Promise.all([
				recruitmentTestService.getAdminTestById(testId),
				recruitmentTestService.getAdminAttempts(testId),
			])
			setCurrentTest({ ...test, passThresholdPercentage: test.passThresholdPercentage ?? 80 })
			setCurrentTestHasAttempts(testAttempts.length > 0)
			setCreateDialogOpen(true)
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to load test'
			type AxResponse = { status?: number; data?: unknown; config?: { url?: string; baseURL?: string } }
			const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: AxResponse }).response : null
			console.error('❌ [CBT] Failed to load test:', {
				message,
				testId,
				...(ax && { httpStatus: ax.status, requestUrl: ax.config?.url, baseURL: ax.config?.baseURL, responseBody: ax.data }),
				...(err instanceof Error && (err as Error & { cause?: unknown }).cause !== undefined && { cause: (err as Error & { cause?: unknown }).cause }),
			}, err)
			toast({ title: 'Failed to load test', description: message, variant: 'destructive' })
		} finally {
			setTestSaving(false)
		}
	}

	const saveTest = async (test: RecruitmentAdminTest) => {
		setTestSaving(true)
		try {
			const payload: RecruitmentAdminTest = {
				...test,
				title: test.title.trim(),
				status: (normalizeStatus(test.status) as TestStatus) || 'draft',
				passThresholdPercentage: Math.min(100, Math.max(0, test.passThresholdPercentage)),
				questions: test.questions.map(q => ({
					...q,
					questionId: q.questionId || makeId(),
					type: normalizeStatus(q.type),
					text: q.text,
					options: q.options.map((o, idx) => ({
						...o,
						sortOrder: o.sortOrder ?? (idx + 1),
						optionId: o.optionId ?? null,
					})),
				})),
			}

			const saved = editMode && payload.testId
				? await recruitmentTestService.updateAdminTest(payload.testId, payload)
				: await recruitmentTestService.createAdminTest(payload)

			setCurrentTest(saved)
			setCreateDialogOpen(false)
			toast({ title: 'Saved', description: 'Test saved successfully' })
			await loadTests()
		} catch (err) {
			console.error('❌ [CBT] Failed to save test:', err)
			const message = err instanceof Error ? err.message : 'Failed to save test'
			toast({ title: 'Save failed', description: message, variant: 'destructive' })
		} finally {
			setTestSaving(false)
		}
	}

	const deleteTest = async (testId: string) => {
		if (!testId) return
		try {
			await recruitmentTestService.deleteAdminTest(testId)
			toast({ title: 'Deleted', description: 'Test deleted successfully' })
			await loadTests()
		} catch (err) {
			console.error('❌ [CBT] Failed to delete test:', err)
			const message = err instanceof Error ? err.message : 'Failed to delete test'
			toast({ title: 'Delete failed', description: message, variant: 'destructive' })
		}
	}

	const openDeleteDialog = (payload: { testId: string; title: string }) => {
		if (!payload.testId) {
			toast({ title: 'Invalid test', description: 'Test ID is missing.', variant: 'destructive' })
			return
		}
		setPendingDelete(payload)
		setDeleteDialogOpen(true)
	}

	const handleConfirmDelete = async () => {
		if (!pendingDelete?.testId) return
		if (deleteSubmitting) return
		setDeleteSubmitting(true)
		try {
			await deleteTest(pendingDelete.testId)
			setDeleteDialogOpen(false)
			setPendingDelete(null)
		} finally {
			setDeleteSubmitting(false)
		}
	}

	const upsertQuestion = async (question: RecruitmentAdminQuestion) => {
		if (!currentTest) return

		const isEdit = Boolean(currentQuestion)
		const normalized: RecruitmentAdminQuestion = {
			...question,
			questionId: question.questionId || makeId(),
			type: normalizeStatus(question.type) as RecruitmentQuestionType,
			sortOrder: question.sortOrder || (currentTest.questions.length + 1),
			options: question.options.map((o, idx) => ({
				...o,
				sortOrder: o.sortOrder || (idx + 1),
				optionId: o.optionId ?? null,
			})),
		}

		const nextQuestions = isEdit
			? currentTest.questions.map(q => (q.questionId === normalized.questionId ? normalized : q))
			: [...currentTest.questions, normalized]

		const nextTest: RecruitmentAdminTest = { ...currentTest, questions: nextQuestions }
		setCurrentTest(nextTest)
		setQuestionDialogOpen(false)
		setCurrentQuestion(null)

		await saveTest(nextTest)
	}

	const removeQuestion = async (questionId: string) => {
		if (!currentTest) return

		const nextTest: RecruitmentAdminTest = {
			...currentTest,
			questions: currentTest.questions.filter(q => q.questionId !== questionId),
		}
		setCurrentTest(nextTest)
		await saveTest(nextTest)
	}

	const handleAddBulkQuestionRow = () => {
		setBulkQuestions(prev => [...prev, createBulkDraft()])
	}

	const handleRemoveBulkQuestionRow = (id: string) => {
		setBulkQuestions(prev => prev.filter(q => q.id !== id))
	}

	const handleBulkQuestionChange = (id: string, patch: Partial<BulkQuestionDraft>) => {
		setBulkQuestions(prev => prev.map(q => (q.id === id ? { ...q, ...patch } : q)))
	}

	const handleBulkQuestionTypeChange = (id: string, type: RecruitmentQuestionType) => {
		setBulkQuestions(prev => prev.map(q => (q.id === id ? applyBulkTypeDefaults(q, type) : q)))
	}

	const handleBulkOptionChange = (questionId: string, optionIndex: number, patch: Partial<RecruitmentAdminOption>) => {
		setBulkQuestions(prev => prev.map(question => {
			if (question.id !== questionId) return question
			const nextOptions = question.options.map((option, index) => (
				index === optionIndex ? { ...option, ...patch } : option
			))
			return { ...question, options: nextOptions }
		}))
	}

	const handleAddBulkOption = (questionId: string) => {
		setBulkQuestions(prev => prev.map(question => {
			if (question.id !== questionId) return question
			const nextOptions = [
				...question.options,
				{ optionId: null, text: '', sortOrder: question.options.length + 1, isCorrect: false },
			]
			return { ...question, options: nextOptions }
		}))
	}

	const handleRemoveBulkOption = (questionId: string, optionIndex: number) => {
		setBulkQuestions(prev => prev.map(question => {
			if (question.id !== questionId) return question
			if (question.options.length <= 2) return question
			const nextOptions = question.options
				.filter((_, index) => index !== optionIndex)
				.map((option, index) => ({ ...option, sortOrder: index + 1 }))
			return { ...question, options: nextOptions }
		}))
	}

	const handleBulkOptionCorrectSingle = (questionId: string, optionIndex: number, checked: boolean) => {
		setBulkQuestions(prev => prev.map(question => {
			if (question.id !== questionId) return question
			const nextOptions = question.options.map((option, index) => ({
				...option,
				isCorrect: index === optionIndex ? checked : false,
			}))
			return { ...question, options: nextOptions }
		}))
	}

	const handleBulkOptionCorrectMulti = (questionId: string, optionIndex: number, checked: boolean) => {
		setBulkQuestions(prev => prev.map(question => {
			if (question.id !== questionId) return question
			const nextOptions = question.options.map((option, index) => (
				index === optionIndex ? { ...option, isCorrect: checked } : option
			))
			return { ...question, options: nextOptions }
		}))
	}

	const saveBulkQuestions = async () => {
		if (!currentTest) return

		const errors: string[] = []

		const defaults = bulkQuestions
			.map((draft, index) => {
				const text = draft.text.trim()
				const normalizedType = normalizeStatus(draft.type) as RecruitmentQuestionType
				const isChoice = normalizedType === 'multiple-choice' || normalizedType === 'multiple-answer'
				const isText = normalizedType === 'text' || normalizedType === 'essay'
				const hasAnyContent = text !== ''
					|| draft.options.some(option => option.text.trim() !== '')
					|| draft.correctAnswerText.trim() !== ''

				if (!text) {
					if (hasAnyContent) {
						errors.push(`Question ${index + 1}: add question text.`)
					}
					return null
				}

				const normalizedOptions = isChoice ? normalizeBulkOptions(draft.options) : []
				if (isChoice) {
					if (normalizedOptions.length < 2) {
						errors.push(`Question ${index + 1}: add at least two options.`)
					}
					const correctCount = normalizedOptions.filter(option => option.isCorrect).length
					if (normalizedType === 'multiple-choice' && correctCount !== 1) {
						errors.push(`Question ${index + 1}: select exactly one correct option.`)
					}
					if (normalizedType === 'multiple-answer' && correctCount < 1) {
						errors.push(`Question ${index + 1}: select at least one correct option.`)
					}
				}

				const correctAnswerText = normalizedType === 'true-false'
					? (draft.correctAnswerText === 'false' ? 'false' : 'true')
					: isText
						? (draft.correctAnswerText.trim() || null)
						: null

				return {
					questionId: makeId(),
					type: normalizedType,
					text,
					points: Math.max(1, draft.points),
					sortOrder: currentTest.questions.length + index + 1,
					correctAnswerText,
					options: normalizedOptions,
				} as RecruitmentAdminQuestion
			})
			.filter(Boolean) as RecruitmentAdminQuestion[]

		if (errors.length > 0) {
			const errorMessage = errors.length > 3
				? `${errors.slice(0, 3).join(' ')} (+${errors.length - 3} more)`
				: errors.join(' ')
			toast({ title: 'Fix bulk questions', description: errorMessage, variant: 'destructive' })
			return
		}

		if (defaults.length === 0) {
			toast({ title: 'Nothing to save', description: 'Add at least one question before saving.', variant: 'destructive' })
			return
		}

		const nextTest: RecruitmentAdminTest = {
			...currentTest,
			questions: [...currentTest.questions, ...defaults],
		}
		setCurrentTest(nextTest)
		setBulkDialogOpen(false)
		setBulkQuestions([createBulkDraft()])
		await saveTest(nextTest)
	}

	const openResultDetails = async (attemptId: number) => {
		setResultDetailsOpen(true)
		setResultLoading(true)
		setCurrentResult(null)
		try {
			const detail = await recruitmentTestService.getAdminAttemptById(attemptId)
			setCurrentResult(detail)
		} catch (err) {
			console.error('❌ [CBT] Failed to load attempt details:', err)
			const message = err instanceof Error ? err.message : 'Failed to load attempt details'
			toast({ title: 'Failed to load details', description: message, variant: 'destructive' })
		} finally {
			setResultLoading(false)
		}
	}
	return (
		<div className="min-h-screen bg-[#EFF4FF] w-full overflow-x-hidden">
			<div className="container mx-auto max-w-screen-2xl px-4 py-4 lg:px-8 lg:py-8 space-y-4 sm:space-y-5 lg:space-y-6">
				<div className="rounded-xl border border-slate-200 bg-white shadow-sm">
					<div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
						<div className="space-y-2">
							<Badge variant="outline" className="border-slate-200 text-xs uppercase tracking-wide text-slate-500">CBT administration</Badge>
							<div>
								<h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Assessment test console</h1>
								<p className="text-sm text-slate-500">Create, schedule, and monitor CBT assessments in one place.</p>
							</div>
						</div>
						<div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
							<Button className="h-10 w-full sm:w-auto" onClick={openCreateDialog}>
								<Plus className="h-4 w-4 mr-2" />
								Create new test
							</Button>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
					{stats.map((stat) => (
						<Card key={stat.title} className="border-slate-200 bg-white shadow-sm">
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs font-medium uppercase tracking-wide text-slate-500">{stat.title}</p>
										<p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
									</div>
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 ring-1 ring-inset ring-blue-100">
										<stat.icon className="h-5 w-5 text-blue-600" />
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				<Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
					<CardContent className="p-4 sm:p-6">
						<Tabs defaultValue="tests" value={activeTab} onValueChange={(v) => setActiveTab(v as 'tests' | 'results')}>
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<TabsList className="rounded-full bg-slate-100 p-1">
								<TabsTrigger value="tests">Tests</TabsTrigger>
								<TabsTrigger value="results">Results</TabsTrigger>
								</TabsList>
								<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
									<div className="relative w-full sm:w-[260px]">
										<Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
										<Input
											type="text"
											placeholder="Search tests..."
											className="h-10 pl-8"
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
										/>
									</div>
									<Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as 'all' | TestStatus)}>
										<SelectTrigger className="h-10 w-full sm:w-[180px]">
											<SelectValue placeholder="Filter by status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All statuses</SelectItem>
											<SelectItem value="draft">Draft</SelectItem>
											<SelectItem value="active">Active</SelectItem>
											<SelectItem value="scheduled">Scheduled</SelectItem>
											<SelectItem value="completed">Completed</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<TabsContent value="tests" className="space-y-4 pt-4">
								{testsLoading ? (
									<div className="text-center py-12 text-sm text-slate-500 dark:text-slate-400">Loading tests...</div>
								) : testsError ? (
									<div className="text-center py-12 text-sm text-slate-500 dark:text-slate-400">{testsError}</div>
								) : filteredTests.length > 0 ? (
									<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
										{paginatedTests.map((t, idx) => {
											const id = getTestId(t)
											return (
												<Card key={id || `test-${idx}`} className="border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
													<CardContent className="p-4">
														<div className="flex items-start justify-between gap-3">
															<div className="space-y-1">
																<h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t.title}</h3>
																<p className="text-xs text-slate-500 dark:text-slate-400">{t.description || 'No description provided.'}</p>
															</div>
															<Badge className={getStatusColor(t.status)}>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}</Badge>
														</div>

														<div className="mt-4 grid gap-2 text-xs text-slate-500 dark:text-slate-400">
															<div className="flex items-center gap-2">
																<Timer className="h-4 w-4" />
																<span>{t.durationMinutes} min duration</span>
															</div>
															<div className="flex items-center gap-2">
																<FileText className="h-4 w-4" />
																<span>{t.questionCount} questions</span>
															</div>
															<div className="flex items-center gap-2">
																<AlertTriangle className="h-4 w-4" />
																<span>{t.totalPoints} total points</span>
															</div>
															{t.scheduledDate && (
																<div className="flex items-center gap-2 text-slate-400">
																	<span>Scheduled {formatDate(t.scheduledDate)}</span>
																</div>
															)}
														</div>

														<div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
															<Button variant="ghost" size="sm" className="px-0 text-slate-500" onClick={() => openEditDialog(t)}>
																<Eye className="mr-2 h-4 w-4" />
																View
															</Button>
															<div className="flex gap-1">
																<Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => openEditDialog(t)} aria-label="Edit test">
																	<Edit2 className="h-4 w-4" />
																</Button>
																<Button
																	variant="ghost"
																	size="sm"
																	className="h-9 w-9 p-0"
																	onClick={() => openDeleteDialog({ testId: id, title: t.title })}
																	aria-label="Delete test"
																>
																	<Trash2 className="h-4 w-4" />
																</Button>
															</div>
														</div>
													</CardContent>
												</Card>
											)
										})}
									</div>
								) : (
									<div className="text-center py-12">
										<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
											<FileText className="h-6 w-6 text-slate-500" />
										</div>
										<h3 className="mt-3 text-lg font-medium text-slate-900 dark:text-slate-100">No tests yet</h3>
										<p className="text-sm text-slate-500">
											{searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filters.' : 'Create your first CBT assessment to get started.'}
										</p>
									</div>
								)}
								{filteredTests.length > TESTS_PAGE_SIZE && (
									<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
										<span>
											Showing {(testsPage - 1) * TESTS_PAGE_SIZE + 1}-{Math.min(testsPage * TESTS_PAGE_SIZE, filteredTests.length)} of {filteredTests.length}
										</span>
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setTestsPage(p => Math.max(1, p - 1))}
												disabled={testsPage === 1}
											>
												<ChevronLeft className="mr-1 h-3.5 w-3.5" />
												<span className="hidden sm:inline">Previous</span>
											</Button>
											<span>Page {testsPage} of {totalTestPages}</span>
											<Button
												variant="outline"
												size="sm"
												onClick={() => setTestsPage(p => Math.min(totalTestPages, p + 1))}
												disabled={testsPage === totalTestPages}
											>
												<span className="hidden sm:inline">Next</span>
												<ChevronRight className="ml-1 h-3.5 w-3.5" />
											</Button>
										</div>
									</div>
								)}
							</TabsContent>

							<TabsContent value="results" className="space-y-4 pt-4">
								<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
									<div className="space-y-2">
										<div className="text-sm text-slate-500">Completed attempts</div>
										<div className="grid gap-2 sm:grid-cols-3">
											<div className="grid gap-1">
												<Label htmlFor="results-from">From</Label>
												<Input
													id="results-from"
													type="date"
													value={resultsDateFrom}
													onChange={(e) => setResultsDateFrom(e.target.value)}
												/>
											</div>
											<div className="grid gap-1">
												<Label htmlFor="results-to">To</Label>
												<Input
													id="results-to"
													type="date"
													value={resultsDateTo}
													onChange={(e) => setResultsDateTo(e.target.value)}
												/>
											</div>
											<div className="grid gap-1">
												<Label>Test</Label>
												<Select value={resultsFilterTestId} onValueChange={setResultsFilterTestId}>
													<SelectTrigger className="h-10 w-full">
														<SelectValue placeholder="Filter by test" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="all">All Tests</SelectItem>
														{tests.map(t => (
															<SelectItem key={t.testId} value={t.testId}>{t.title}</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										</div>
									</div>
									<Button
										variant="outline"
										onClick={handleExportResultsCsv}
										disabled={filteredAttempts.length === 0}
									>
										Export CSV
									</Button>
								</div>

								{attemptsLoading ? (
									<div className="text-center py-12 text-sm text-slate-500">Loading attempts...</div>
								) : attemptsError ? (
									<div className="text-center py-12 text-sm text-slate-500">{attemptsError}</div>
								) : (
									<div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white dark:border-slate-700 dark:bg-slate-900">
										<div className="overflow-x-auto">
											<table className="w-full text-sm">
												<thead className="sticky top-0 bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
													<tr>
														<th className="px-4 py-3 text-left font-medium">Officer</th>
														<th className="px-4 py-3 text-left font-medium">Test</th>
														<th className="px-4 py-3 text-left font-medium">Date</th>
														<th className="px-4 py-3 text-left font-medium">Score</th>
														<th className="px-4 py-3 text-left font-medium">Status</th>
														<th className="px-4 py-3 text-right font-medium">Actions</th>
													</tr>
												</thead>
												<tbody className="divide-y">
													{paginatedAttempts.length > 0 ? (
														paginatedAttempts.map(a => (
															<tr key={a.attemptId} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
																<td className="px-4 py-3">{a.officerName}</td>
																<td className="px-4 py-3">{a.testTitle}</td>
																<td className="px-4 py-3">{a.completedAt ? formatDate(a.completedAt) : '—'}</td>
																<td className="px-4 py-3">
																	<div className="flex items-center gap-2">
																		<span>{a.score}/{a.totalPoints}</span>
																		<span className="text-xs text-slate-400">({a.percentageScore.toFixed(1)}%)</span>
																	</div>
																	<Progress value={a.percentageScore} className="h-1.5 w-24" />
																</td>
																<td className="px-4 py-3">
																	<Badge className={normalizeStatus(a.status) === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}>
																		{normalizeStatus(a.status) === 'passed' ? 'Passed' : 'Failed'}
																	</Badge>
																</td>
																<td className="px-4 py-3 text-right">
																	<Button variant="ghost" size="sm" onClick={() => void openResultDetails(a.attemptId)}>
																		<Eye className="mr-2 h-4 w-4" />
																		View details
																	</Button>
																</td>
															</tr>
														))
													) : (
														<tr>
															<td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No attempts found</td>
														</tr>
													)}
												</tbody>
											</table>
										</div>
									</div>
								)}
								{filteredAttempts.length > RESULTS_PAGE_SIZE && (
									<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
										<span>
											Showing {(resultsPage - 1) * RESULTS_PAGE_SIZE + 1}-{Math.min(resultsPage * RESULTS_PAGE_SIZE, filteredAttempts.length)} of {filteredAttempts.length}
										</span>
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setResultsPage(p => Math.max(1, p - 1))}
												disabled={resultsPage === 1}
											>
												<ChevronLeft className="mr-1 h-3.5 w-3.5" />
												<span className="hidden sm:inline">Previous</span>
											</Button>
											<span>Page {resultsPage} of {totalResultsPages}</span>
											<Button
												variant="outline"
												size="sm"
												onClick={() => setResultsPage(p => Math.min(totalResultsPages, p + 1))}
												disabled={resultsPage === totalResultsPages}
											>
												<span className="hidden sm:inline">Next</span>
												<ChevronRight className="ml-1 h-3.5 w-3.5" />
											</Button>
										</div>
									</div>
								)}
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>
			</div>

			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent className="w-[calc(100%-1.5rem)] sm:w-auto sm:max-w-[980px] max-h-[90vh] overflow-y-auto border-slate-200 bg-white p-0">
					<DialogHeader>
						<div className="border-b border-slate-200 px-6 py-4">
							<DialogTitle>{editMode ? 'Edit test' : 'Create new test'}</DialogTitle>
							<DialogDescription>
							{editMode ? 'Update the details and questions for this test' : 'Define the basic details and questions for your new assessment test'}
							</DialogDescription>
						</div>
						{editMode && currentTestHasAttempts && (
							<p className="text-xs text-amber-700">
								This test already has attempts. Admins can still update the test; officers who already attempted remain locked from retaking.
							</p>
						)}
					</DialogHeader>

					{currentTest && (
						<div className="space-y-6 px-6 pb-6">
							<div className="rounded-lg border border-slate-200 p-4">
								<div className="mb-3">
									<h3 className="text-sm font-semibold text-slate-900">Test details</h3>
									<p className="text-xs text-slate-500">Configure the main properties before adding questions.</p>
								</div>
								<div className="grid gap-4">
								<div className="grid gap-2">
									<Label htmlFor="title">Test title</Label>
									<Input
										id="title"
										placeholder="Enter test title"
										value={currentTest.title}
										onChange={(e) => setCurrentTest({ ...currentTest, title: e.target.value })}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="description">Description (optional)</Label>
									<Textarea
										id="description"
										placeholder="Briefly describe the purpose of this test"
										value={currentTest.description ?? ''}
										onChange={(e) => setCurrentTest({ ...currentTest, description: e.target.value })}
									/>
								</div>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
									<div className="grid gap-2">
										<Label htmlFor="duration">Duration (minutes)</Label>
										<Input
											id="duration"
											type="number"
											min="1"
											value={currentTest.durationMinutes}
											onChange={(e) => setCurrentTest({ ...currentTest, durationMinutes: Math.max(1, Number(e.target.value || 1)) })}
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="points">Total points</Label>
										<Input
											id="points"
											type="number"
											min="1"
											value={currentTest.totalPoints}
											onChange={(e) => setCurrentTest({ ...currentTest, totalPoints: Math.max(1, Number(e.target.value || 1)) })}
										/>
									</div>
								<div className="grid gap-2">
									<Label htmlFor="pass-threshold">Pass threshold (%)</Label>
									<Input
										id="pass-threshold"
										type="number"
										min="1"
										max="100"
										value={currentTest.passThresholdPercentage}
										onChange={(e) => setCurrentTest({
											...currentTest,
											passThresholdPercentage: Math.min(100, Math.max(1, Number(e.target.value || 1)))
										})}
									/>
								</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="grid gap-2">
										<Label>Status</Label>
										<Select value={normalizeStatus(currentTest.status)} onValueChange={(v) => setCurrentTest({ ...currentTest, status: v })}>
											<SelectTrigger>
												<SelectValue placeholder="Select status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="draft">Draft</SelectItem>
												<SelectItem value="active">Active</SelectItem>
												<SelectItem value="scheduled">Scheduled</SelectItem>
												<SelectItem value="completed">Completed</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="grid gap-2">
										<Label>Scheduled date (optional)</Label>
										<Input
											type="date"
											value={currentTest.scheduledDate ? String(currentTest.scheduledDate).slice(0, 10) : ''}
											onChange={(e) => setCurrentTest({ ...currentTest, scheduledDate: e.target.value ? e.target.value : null })}
										/>
									</div>
								</div>
								</div>
							</div>

							<div className="rounded-lg border border-slate-200">
								<div className="p-4 flex flex-col gap-3 border-b border-slate-200 bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<div className="font-medium text-slate-900">Questions</div>
										<div className="text-xs text-slate-500">{currentTest.questions.length} total</div>
									</div>
									<div className="flex flex-col gap-2 sm:flex-row">
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setBulkQuestions([createBulkDraft()])
												setBulkDialogOpen(true)
											}}
										>
											<Plus className="h-4 w-4 mr-1" />
											Bulk add
										</Button>
										<Button
											variant="default"
											size="sm"
											onClick={() => {
												setCurrentQuestion(null)
												setQuestionDialogOpen(true)
											}}
										>
											<Plus className="h-4 w-4 mr-1" />
											Add question
										</Button>
									</div>
								</div>

								{currentTest.questions.length === 0 ? (
									<div className="p-8 text-center text-sm text-muted-foreground">No questions yet.</div>
								) : (
									<div className="divide-y">
										{sortedCurrentQuestions.map((q, idx) => (
											<div key={q.questionId} className="p-4 hover:bg-[#EFF4FF]">
													<div className="flex justify-between items-start">
														<div className="space-y-2">
															<div className="flex items-center gap-2">
																<span className="bg-slate-200 text-slate-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium">
																	{idx + 1}
																</span>
																<div className="font-medium">{q.text}</div>
															</div>
															<div className="pl-8 flex items-center gap-2 text-xs text-muted-foreground">
																<Badge variant="outline" className="text-xs">{q.type}</Badge>
																<span>{q.points} {q.points === 1 ? 'point' : 'points'}</span>
															</div>
														</div>
													<div className="flex flex-wrap gap-2">
														<Button
															variant="outline"
															size="sm"
															onClick={() => {
																setCurrentQuestion(q)
																setQuestionDialogOpen(true)
															}}
														>
															<Edit2 className="h-4 w-4 mr-1" />
															Edit
														</Button>
														<Button
															variant="outline"
															size="sm"
															onClick={() => void removeQuestion(q.questionId)}
														>
															<Trash2 className="h-4 w-4 mr-1" />
															Delete
														</Button>
													</div>
													</div>
												</div>
											))}
									</div>
								)}
							</div>
						</div>
					)}

					<DialogFooter className="flex-col-reverse sm:flex-row gap-2">
						<Button className="w-full sm:w-auto" variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={testSaving}>Cancel</Button>
						<Button className="w-full sm:w-auto" onClick={() => currentTest && void saveTest(currentTest)} disabled={testSaving || !currentTest?.title.trim()}>
							{testSaving ? 'Saving...' : editMode ? 'Update test' : 'Create test'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
				<DialogContent className="w-[calc(100%-1.5rem)] sm:w-auto sm:max-w-[1024px] max-h-[92vh] overflow-y-auto border-slate-200 bg-white p-0">
					<DialogHeader className="border-b border-slate-200 px-6 py-4">
						<DialogTitle className="text-xl">{currentQuestion ? 'Edit question' : 'Add question'}</DialogTitle>
						<DialogDescription className="text-sm">Create a question for your test.</DialogDescription>
					</DialogHeader>
					<div className="px-6 pb-6 pt-4">
						<QuestionEditor
							key={currentQuestion?.questionId || 'new'}
							initial={currentQuestion}
							onSubmit={(q) => void upsertQuestion(q)}
						/>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
				<DialogContent className="w-[calc(100%-1.5rem)] sm:w-auto sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Bulk add questions</DialogTitle>
						<DialogDescription>Add multiple questions quickly. You can edit options after saving.</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{bulkQuestions.map((question, index) => (
							<div key={question.id} className="rounded-lg border border-slate-200/70 p-4 space-y-3">
								<div className="flex items-center justify-between">
									<div className="text-sm font-medium">Question {index + 1}</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleRemoveBulkQuestionRow(question.id)}
										disabled={bulkQuestions.length === 1}
									>
										Remove
									</Button>
								</div>
								<div className="grid gap-3 sm:grid-cols-3">
									<div className="grid gap-2 sm:col-span-2">
										<Label htmlFor={`bulk-text-${question.id}`}>Question text</Label>
										<Textarea
											id={`bulk-text-${question.id}`}
											value={question.text}
											onChange={(e) => handleBulkQuestionChange(question.id, { text: e.target.value })}
											placeholder="Enter question text"
											className="min-h-[90px]"
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor={`bulk-points-${question.id}`}>Points</Label>
										<Input
											id={`bulk-points-${question.id}`}
											type="number"
											min="1"
											value={question.points}
											onChange={(e) => handleBulkQuestionChange(question.id, { points: Math.max(1, Number(e.target.value || 1)) })}
										/>
										<div className="grid gap-2">
											<Label htmlFor={`bulk-type-${question.id}`}>Type</Label>
											<Select
												value={question.type}
											onValueChange={(value) => handleBulkQuestionTypeChange(question.id, value as RecruitmentQuestionType)}
											>
												<SelectTrigger id={`bulk-type-${question.id}`}>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="multiple-choice">Multiple Choice</SelectItem>
													<SelectItem value="multiple-answer">Multiple Answer</SelectItem>
													<SelectItem value="true-false">True / False</SelectItem>
													<SelectItem value="text">Short answer</SelectItem>
													<SelectItem value="essay">Essay</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>
							{(question.type === 'multiple-choice' || question.type === 'multiple-answer') && (
								<div className="space-y-3">
									<Label>Answer options</Label>
									{question.options.map((option, optionIndex) => (
										<div key={`${question.id}-option-${optionIndex}`} className="flex items-center gap-2">
											{question.type === 'multiple-choice' ? (
												<Checkbox
													checked={option.isCorrect}
													onCheckedChange={(checked) => handleBulkOptionCorrectSingle(question.id, optionIndex, Boolean(checked))}
												/>
											) : (
												<Checkbox
													checked={option.isCorrect}
													onCheckedChange={(checked) => handleBulkOptionCorrectMulti(question.id, optionIndex, Boolean(checked))}
												/>
											)}
											<Input
												value={option.text}
												onChange={(e) => handleBulkOptionChange(question.id, optionIndex, { text: e.target.value })}
												placeholder={`Option ${optionIndex + 1}`}
												className="flex-1"
											/>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => handleRemoveBulkOption(question.id, optionIndex)}
												disabled={question.options.length <= 2}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									))}
									<Button type="button" variant="outline" size="sm" onClick={() => handleAddBulkOption(question.id)}>
										Add Option
									</Button>
								</div>
							)}
							{question.type === 'true-false' && (
								<div className="space-y-3">
									<Label>Correct answer</Label>
									<RadioGroup
										value={question.correctAnswerText || 'true'}
										onValueChange={(value) => handleBulkQuestionChange(question.id, { correctAnswerText: value })}
									>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="true" id={`bulk-true-${question.id}`} />
											<Label htmlFor={`bulk-true-${question.id}`}>True</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="false" id={`bulk-false-${question.id}`} />
											<Label htmlFor={`bulk-false-${question.id}`}>False</Label>
										</div>
									</RadioGroup>
								</div>
							)}
							{(question.type === 'text' || question.type === 'essay') && (
								<div className="space-y-2">
									<Label>Expected answer (optional)</Label>
									<Textarea
										value={question.correctAnswerText}
										onChange={(e) => handleBulkQuestionChange(question.id, { correctAnswerText: e.target.value })}
										placeholder="Optional model answer / marking guide"
									/>
								</div>
							)}
							</div>
						))}
						<Button variant="outline" onClick={handleAddBulkQuestionRow}>
							<Plus className="h-4 w-4 mr-1" />
							Add another question
						</Button>
					</div>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button variant="outline" onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
						<Button onClick={() => void saveBulkQuestions()}>
							Save questions
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={resultDetailsOpen} onOpenChange={setResultDetailsOpen}>
				<DialogContent className="w-[calc(100%-1.5rem)] sm:w-auto sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Attempt details</DialogTitle>
						<DialogDescription>Detailed view of an officer's attempt.</DialogDescription>
					</DialogHeader>

					{resultLoading ? (
						<div className="py-10 text-center text-sm text-muted-foreground">Loading...</div>
					) : currentResult ? (
						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-base">Officer</CardTitle>
									</CardHeader>
									<CardContent className="text-sm space-y-1">
										<div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{currentResult.officerName}</span></div>
										<div><span className="text-muted-foreground">User ID:</span> {currentResult.officerId}</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-base">Test</CardTitle>
									</CardHeader>
									<CardContent className="text-sm space-y-1">
										<div><span className="text-muted-foreground">Title:</span> <span className="font-medium">{currentResult.testTitle}</span></div>
										<div><span className="text-muted-foreground">Completed:</span> {currentResult.completedAt ? formatDate(currentResult.completedAt) : '—'}</div>
									</CardContent>
								</Card>
							</div>

							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-base">Performance</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div className="border rounded-lg p-4 flex flex-col items-center justify-center">
											<div className="text-3xl font-bold">{currentResult.score}</div>
											<div className="text-sm text-muted-foreground">Points Scored</div>
											<div className="text-xs">Out of {currentResult.totalPoints}</div>
										</div>
										<div className="border rounded-lg p-4 flex flex-col items-center justify-center">
											<div className="text-3xl font-bold">{currentResult.percentageScore.toFixed(1)}%</div>
											<div className="text-sm text-muted-foreground">Percentage</div>
											<div className="text-xs">
												<Badge className={normalizeStatus(currentResult.status) === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
													{normalizeStatus(currentResult.status) === 'passed' ? 'Passed' : 'Failed'}
												</Badge>
											</div>
										</div>
										<div className="border rounded-lg p-4 flex flex-col items-center justify-center">
											<div className="text-3xl font-bold">{currentResult.answers.filter(a => a.isCorrect).length}</div>
											<div className="text-sm text-muted-foreground">Correct answers</div>
											<div className="text-xs">Out of {currentResult.answers.length}</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					) : (
						<div className="py-10 text-center text-sm text-muted-foreground">No data.</div>
					)}

					<DialogFooter className="flex-col-reverse sm:flex-row gap-2">
						<Button className="w-full sm:w-auto" variant="outline" onClick={() => setResultDetailsOpen(false)}>Close</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={deleteDialogOpen}
				onOpenChange={(open) => {
					setDeleteDialogOpen(open)
					if (!open) setPendingDelete(null)
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete test?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete{' '}
							<span className="font-medium text-foreground">{pendingDelete?.title || 'this test'}</span>. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteSubmitting}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => void handleConfirmDelete()} disabled={deleteSubmitting}>
							{deleteSubmitting ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}

export default CBT

type QuestionEditorProps = {
	initial: RecruitmentAdminQuestion | null
	onSubmit: (q: RecruitmentAdminQuestion) => void
	disabled?: boolean
}

const QuestionEditor = ({ initial, onSubmit, disabled }: QuestionEditorProps) => {
	const [questionType, setQuestionType] = useState<string>(initial?.type || 'multiple-choice')
	const [questionText, setQuestionText] = useState(initial?.text || '')
	const [questionPoints, setQuestionPoints] = useState<number>(initial?.points || 1)
	const [correctAnswerText, setCorrectAnswerText] = useState<string>(initial?.correctAnswerText ?? '')

	const [options, setOptions] = useState<RecruitmentAdminOption[]>(
		initial?.options?.length
			? initial.options
			: [
				{ optionId: null, text: '', sortOrder: 1, isCorrect: false },
				{ optionId: null, text: '', sortOrder: 2, isCorrect: false },
			]
	)

	const normalizedType = normalizeStatus(questionType) as RecruitmentQuestionType

	useEffect(() => {
		// Reset correct answer fields when changing type
		if (normalizedType === 'multiple-choice' || normalizedType === 'multiple-answer') {
			setCorrectAnswerText('')
		}
		if (normalizedType === 'true-false') {
			setCorrectAnswerText(prev => prev || 'true')
		}
	}, [normalizedType])

	const addOption = () => setOptions(prev => [...prev, { optionId: null, text: '', sortOrder: prev.length + 1, isCorrect: false }])
	const removeOption = (index: number) => {
		if (options.length <= 2) return
		setOptions(prev => prev.filter((_, i) => i !== index).map((o, idx) => ({ ...o, sortOrder: idx + 1 })))
	}

	const updateOption = (index: number, patch: Partial<RecruitmentAdminOption>) => {
		setOptions(prev => prev.map((o, i) => (i === index ? { ...o, ...patch } : o)))
	}

	const setSingleCorrect = (index: number, checked: boolean) => {
		setOptions(prev => prev.map((o, i) => ({ ...o, isCorrect: i === index ? checked : false })))
	}

	const toggleMultiCorrect = (index: number, checked: boolean) => {
		setOptions(prev => prev.map((o, i) => (i === index ? { ...o, isCorrect: checked } : o)))
	}

	const canSubmit = questionText.trim() !== '' && questionPoints > 0

	return (
		<div className="space-y-6">
			<div>
				<Label htmlFor="questionType" className="text-sm font-semibold text-slate-800">Question type</Label>
				<Select value={questionType} onValueChange={setQuestionType} disabled={disabled}>
					<SelectTrigger id="questionType" className="w-full h-11 text-base">
						<SelectValue placeholder="Select question type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="multiple-choice">
							<div className="flex items-center gap-2">
								<CheckSquare className="h-4 w-4" />
								<span>Multiple choice (single answer)</span>
							</div>
						</SelectItem>
						<SelectItem value="multiple-answer">
							<div className="flex items-center gap-2">
								<List className="h-4 w-4" />
								<span>Multiple choice (multiple answers)</span>
							</div>
						</SelectItem>
						<SelectItem value="true-false">
							<div className="flex items-center gap-2">
								<CheckSquare className="h-4 w-4" />
								<span>True/False</span>
							</div>
						</SelectItem>
						<SelectItem value="text">
							<div className="flex items-center gap-2">
								<Type className="h-4 w-4" />
								<span>Short answer</span>
							</div>
						</SelectItem>
						<SelectItem value="essay">
							<div className="flex items-center gap-2">
								<AlignLeft className="h-4 w-4" />
								<span>Essay/long answer</span>
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div>
				<Label htmlFor="questionText" className="text-sm font-semibold text-slate-800">Question text</Label>
				<Textarea
					id="questionText"
					placeholder="Enter your question here"
					value={questionText}
					onChange={(e) => setQuestionText(e.target.value)}
					className="min-h-[120px] text-base"
					disabled={disabled}
				/>
			</div>

			<div>
				<Label htmlFor="points" className="text-sm font-semibold text-slate-800">Points</Label>
				<Input
					id="points"
					type="number"
					min="1"
					value={questionPoints}
					onChange={(e) => setQuestionPoints(Math.max(1, Number(e.target.value || 1)))}
					className="h-11 text-base"
					disabled={disabled}
				/>
			</div>

			{(normalizedType === 'multiple-choice' || normalizedType === 'multiple-answer') && (
				<div className="space-y-3">
					<Label className="text-sm font-semibold text-slate-800">Answer options</Label>
					{options.map((opt, index) => (
						<div key={index} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2">
							{normalizedType === 'multiple-choice' ? (
								<Checkbox
									checked={opt.isCorrect}
									onCheckedChange={(checked) => setSingleCorrect(index, Boolean(checked))}
									disabled={disabled}
								/>
							) : (
								<Checkbox
									checked={opt.isCorrect}
									onCheckedChange={(checked) => toggleMultiCorrect(index, Boolean(checked))}
									disabled={disabled}
								/>
							)}
							<Input
								value={opt.text}
								onChange={(e) => updateOption(index, { text: e.target.value })}
								placeholder={`Option ${index + 1}`}
								className="flex-1 h-10"
								disabled={disabled}
							/>
							<Button type="button" variant="outline" size="icon" onClick={() => removeOption(index)} disabled={disabled || options.length <= 2}>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					))}
					<Button type="button" variant="outline" size="sm" className="h-10 px-4" onClick={addOption} disabled={disabled}>
						Add Option
					</Button>
				</div>
			)}

			{normalizedType === 'true-false' && (
				<div className="space-y-3">
					<Label>Correct answer</Label>
					<RadioGroup value={correctAnswerText} onValueChange={setCorrectAnswerText} disabled={disabled}>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="true" id="true" />
							<Label htmlFor="true">True</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="false" id="false" />
							<Label htmlFor="false">False</Label>
						</div>
					</RadioGroup>
				</div>
			)}

			{(normalizedType === 'text' || normalizedType === 'essay') && (
				<div className="space-y-2">
					<Label>Expected answer (optional)</Label>
					<Textarea
						value={correctAnswerText}
						onChange={(e) => setCorrectAnswerText(e.target.value)}
						placeholder="Optional model answer / marking guide"
						disabled={disabled}
					/>
				</div>
			)}

			<div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
				<Button className="h-11 px-6" onClick={() => onSubmit({
					questionId: initial?.questionId || '',
					type: questionType,
					text: questionText,
					points: questionPoints,
					sortOrder: initial?.sortOrder || 1,
					correctAnswerText: correctAnswerText || null,
					options: options.map((o, idx) => ({ ...o, sortOrder: idx + 1 })),
				})} disabled={disabled || !canSubmit}>
					{initial ? 'Update question' : 'Add question'}
				</Button>
			</div>
		</div>
	)
}