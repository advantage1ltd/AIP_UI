import { useMemo } from 'react'
import {
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isSameDay,
	isSameMonth,
	isToday,
	startOfMonth,
	startOfWeek,
} from 'date-fns'
import { cn } from '@/lib/utils'

/** Minimal shape so we avoid importing page types (no circular deps). */
export interface MonthCalendarTask {
	date: Date
}

export interface MonthCalendarGridProps {
	selectedDate: Date
	onSelectDay: (day: Date) => void
	tasks?: MonthCalendarTask[]
	className?: string
}

const WEEK_STARTS_ON = 1 as const

const WEEKDAY_LABELS_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export const MonthCalendarGrid = ({
	selectedDate,
	onSelectDay,
	tasks = [],
	className,
}: MonthCalendarGridProps) => {
	const cells = useMemo(() => {
		const monthStart = startOfMonth(selectedDate)
		const monthEnd = endOfMonth(selectedDate)
		const gridStart = startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON })
		const gridEnd = endOfWeek(monthEnd, { weekStartsOn: WEEK_STARTS_ON })
		return eachDayOfInterval({ start: gridStart, end: gridEnd })
	}, [selectedDate])

	const tasksPerDayKey = useMemo(() => {
		const map = new Map<string, number>()
		for (const t of tasks) {
			const d = new Date(t.date)
			const key = format(d, 'yyyy-MM-dd')
			map.set(key, (map.get(key) ?? 0) + 1)
		}
		return map
	}, [tasks])

	return (
		<div
			className={cn('rounded-lg border border-gray-200 bg-gray-50/40 p-2 sm:p-3', className)}
			role="grid"
			aria-label="Month calendar"
		>
			<div className="grid grid-cols-7 gap-0.5 text-center pb-2 border-b border-gray-100 mb-2">
				{WEEKDAY_LABELS_SHORT.map((label) => (
					<div
						key={label}
						className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 py-1"
						role="columnheader"
					>
						{label}
					</div>
				))}
			</div>
			<div className="grid grid-cols-7 gap-1">
				{cells.map((cellDate) => {
					const inMonth = isSameMonth(cellDate, selectedDate)
					const selected = isSameDay(cellDate, selectedDate)
					const today = isToday(cellDate)
					const key = format(cellDate, 'yyyy-MM-dd')
					const taskCount = tasksPerDayKey.get(key) ?? 0

					return (
						<button
							key={key}
							type="button"
							role="gridcell"
							onClick={() => onSelectDay(cellDate)}
							className={cn(
								'relative flex min-h-10 flex-col items-center justify-start rounded-md py-1.5 text-sm transition-colors',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
								!inMonth && 'text-gray-300 hover:bg-white/80',
								inMonth && !selected && 'text-gray-900 hover:bg-blue-50',
								selected && 'bg-blue-600 font-semibold text-white shadow-sm hover:bg-blue-700',
								today && !selected && 'ring-2 ring-blue-400 ring-offset-0'
							)}
							aria-label={format(cellDate, 'EEEE, MMMM d, yyyy')}
							aria-current={today ? 'date' : undefined}
							aria-pressed={selected}
						>
							<span>{format(cellDate, 'd')}</span>
							{taskCount > 0 ? (
								<span
									className={cn(
										'mt-0.5 h-1 w-1 shrink-0 rounded-full',
										selected ? 'bg-white/90' : 'bg-blue-500'
									)}
									aria-hidden
								/>
							) : (
								<span className="mt-0.5 h-1 w-1 shrink-0 rounded-full opacity-0" aria-hidden />
							)}
						</button>
					)
				})}
			</div>
		</div>
	)
}
