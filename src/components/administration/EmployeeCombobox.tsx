import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Employee } from '@/types/employee';

const formatEmployeeLabel = (emp: Employee): string => {
	const raw = emp.fullName?.trim();
	if (raw) return raw;
	const parts = [emp.firstName, emp.surname].filter(Boolean).join(' ').trim();
	return parts || `Employee #${emp.id}`;
};

const employeeSearchValue = (emp: Employee): string =>
	[
		emp.firstName,
		emp.surname,
		emp.fullName,
		emp.employeeNumber,
		emp.position,
		String(emp.id),
	]
		.filter(Boolean)
		.join(' ')
		.toLowerCase();

export interface EmployeeComboboxProps {
	employees: Employee[];
	loading: boolean;
	value?: number;
	onChange: (employeeId: number | undefined) => void;
	/** Shown when `value` is set but the employee row is not in `employees` yet (e.g. during fetch). */
	fallbackLabel?: string;
	id?: string;
	disabled?: boolean;
	triggerClassName?: string;
	invalid?: boolean;
}

export const EmployeeCombobox = ({
	employees,
	loading,
	value,
	onChange,
	fallbackLabel,
	id,
	disabled,
	triggerClassName,
	invalid,
}: EmployeeComboboxProps) => {
	const [open, setOpen] = useState(false);

	const displayLabel = useMemo(() => {
		if (value == null) return null;
		const hit = employees.find((e) => e.id === value);
		if (hit) return formatEmployeeLabel(hit);
		const trimmed = fallbackLabel?.trim();
		if (trimmed) return trimmed;
		return `Employee #${value}`;
	}, [value, employees, fallbackLabel]);

	const triggerDisabled =
		disabled || (loading && employees.length === 0 && value == null);

	const placeholder = loading ? 'Loading employees…' : 'Search or select an employee…';

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					type="button"
					variant="outline"
					role="combobox"
					aria-expanded={open}
					aria-haspopup="listbox"
					aria-label={displayLabel ? `Selected employee: ${displayLabel}` : placeholder}
					disabled={triggerDisabled}
					className={cn(
						'w-full justify-between font-normal h-10 px-3',
						!displayLabel && 'text-muted-foreground',
						invalid && 'border-red-500',
						triggerClassName,
					)}
				>
					<span className="truncate text-left">
						{displayLabel ?? placeholder}
					</span>
					{loading ? (
						<Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-70" aria-hidden />
					) : (
						<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden />
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[min(100vw-2rem,420px)] p-0" align="start">
				<Command shouldFilter>
					<CommandInput
						placeholder="Search by name, number, or ID…"
						disabled={loading && employees.length === 0}
					/>
					<CommandList>
						{loading && employees.length === 0 ? (
							<div className="flex items-center gap-2 py-6 justify-center text-sm text-muted-foreground">
								<Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
								Loading employees…
							</div>
						) : employees.length === 0 ? (
							<CommandEmpty>No employees available.</CommandEmpty>
						) : (
							<>
								<CommandEmpty>No employee matches your search.</CommandEmpty>
								<CommandGroup heading="Employees">
									{employees.map((emp) => {
										const label = formatEmployeeLabel(emp);
										const selected = value === emp.id;
										return (
											<CommandItem
												key={emp.id}
												value={employeeSearchValue(emp)}
												keywords={[label, String(emp.id), emp.employeeNumber ?? ''].filter(Boolean)}
												onSelect={() => {
													onChange(emp.id);
													setOpen(false);
												}}
												className="cursor-pointer"
											>
												<Check
													className={cn(
														'mr-2 h-4 w-4 shrink-0',
														selected ? 'opacity-100' : 'opacity-0',
													)}
													aria-hidden
												/>
												<span className="truncate">
													<span className="font-medium">{label}</span>
													{emp.employeeNumber ? (
														<span className="ml-2 text-xs text-muted-foreground tabular-nums">
															#{emp.employeeNumber}
														</span>
													) : null}
												</span>
											</CommandItem>
										);
									})}
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};
