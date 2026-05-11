import * as React from 'react'

import { NativeDateInput } from '@/components/ui/native-date-input'

export interface DatePickerProps {
	date?: Date
	setDate: (date?: Date) => void
	placeholder?: string
	allowYearSelect?: boolean
	fromYear?: number
	toYear?: number
	className?: string
	disabled?: boolean
	/** Earliest selectable day (merged with year window when allowYearSelect is true) */
	minDate?: Date
	/** Latest selectable day (merged with year window when allowYearSelect is true) */
	maxDate?: Date
}

const mergeMin = (a: Date | undefined, b: Date | undefined): Date | undefined => {
	if (!a) return b
	if (!b) return a
	return new Date(Math.max(a.getTime(), b.getTime()))
}

const mergeMax = (a: Date | undefined, b: Date | undefined): Date | undefined => {
	if (!a) return b
	if (!b) return a
	return new Date(Math.min(a.getTime(), b.getTime()))
}

export function DatePicker({
	date,
	setDate,
	placeholder = 'Pick a date',
	allowYearSelect = false,
	fromYear = 1990,
	toYear = new Date().getFullYear() + 15,
	className,
	disabled,
	minDate: minDateProp,
	maxDate: maxDateProp,
}: DatePickerProps) {
	const yearMin = allowYearSelect ? new Date(fromYear, 0, 1) : undefined
	const yearMax = allowYearSelect ? new Date(toYear, 11, 31) : undefined
	const mergedMin = mergeMin(yearMin, minDateProp)
	const mergedMax = mergeMax(yearMax, maxDateProp)

	return (
		<NativeDateInput
			value={date}
			onDateChange={setDate}
			minDate={mergedMin}
			maxDate={mergedMax}
			disabled={disabled}
			className={className}
			aria-label={placeholder}
			title={placeholder}
		/>
	)
}
