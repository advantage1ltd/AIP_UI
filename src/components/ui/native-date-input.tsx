import * as React from 'react'

import { cn } from '@/lib/utils'

export const toDateInputValue = (d: Date): string => {
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}

export const parseDateInputValue = (s: string): Date | undefined => {
	if (!s) return undefined
	const parts = s.split('-').map(Number)
	const y = parts[0]
	const mo = parts[1]
	const day = parts[2]
	if (y === undefined || mo === undefined || day === undefined) return undefined
	const d = new Date(y, mo - 1, day)
	return Number.isNaN(d.getTime()) ? undefined : d
}

export type NativeDateInputProps = Omit<
	React.InputHTMLAttributes<HTMLInputElement>,
	'type' | 'value' | 'onChange' | 'min' | 'max'
> & {
	value?: Date
	/** Called when the user picks or clears a calendar day */
	onDateChange?: (date: Date | undefined) => void
	minDate?: Date
	maxDate?: Date
}

export const NativeDateInput = React.forwardRef<HTMLInputElement, NativeDateInputProps>(
	({ className, value, onDateChange, minDate, maxDate, disabled, ...props }, ref) => {
		const minAttr = minDate ? toDateInputValue(minDate) : undefined
		const maxAttr = maxDate ? toDateInputValue(maxDate) : undefined
		const valAttr = value ? toDateInputValue(value) : ''

		return (
			<input
				ref={ref}
				{...props}
				type="date"
				disabled={disabled}
				className={cn(
					'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
					'disabled:cursor-not-allowed disabled:opacity-50',
					className
				)}
				value={valAttr}
				min={minAttr}
				max={maxAttr}
				onChange={(e) => {
					const next = parseDateInputValue(e.target.value)
					onDateChange?.(next)
				}}
			/>
		)
	}
)
NativeDateInput.displayName = 'NativeDateInput'
