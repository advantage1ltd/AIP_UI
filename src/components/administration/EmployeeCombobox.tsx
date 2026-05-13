import React, { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Employee } from '@/types/employee';

const toEmployeeId = (rawId: unknown): number | null => {
	const parsed = typeof rawId === 'number' ? rawId : Number(rawId);
	return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : null;
};

const formatEmployeeLabel = (employee: Employee): string => {
	const fullName = employee.fullName?.trim();
	if (fullName) return fullName;
	const parts = [employee.firstName, employee.surname].filter(Boolean).join(' ').trim();
	return parts || `Employee #${employee.id}`;
};

export interface EmployeeComboboxProps {
	employees: Employee[];
	loading: boolean;
	value?: number;
	onChange: (employeeId: number | undefined) => void;
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
	const normalizedEmployees = useMemo(() => {
		return employees
			.map((employee) => {
				const normalizedId = toEmployeeId((employee as { id?: unknown }).id);
				if (normalizedId == null) return null;
				return { ...employee, id: normalizedId };
			})
			.filter(Boolean) as Array<Employee & { id: number }>;
	}, [employees]);

	const selectedEmployeeId = toEmployeeId(value);
	const selectedEmployeeLabel = useMemo(() => {
		if (selectedEmployeeId == null) return undefined;
		const hit = normalizedEmployees.find((employee) => employee.id === selectedEmployeeId);
		if (hit) return formatEmployeeLabel(hit);
		return fallbackLabel?.trim() || undefined;
	}, [selectedEmployeeId, normalizedEmployees, fallbackLabel]);

	return (
		<Select
			value={selectedEmployeeId != null ? String(selectedEmployeeId) : undefined}
			onValueChange={(selectedValue) => {
				const employeeId = toEmployeeId(selectedValue);
				onChange(employeeId ?? undefined);
			}}
			disabled={disabled || loading || normalizedEmployees.length === 0}
		>
			<SelectTrigger
				id={id}
				className={cn(invalid && 'border-red-500', triggerClassName)}
				aria-label={selectedEmployeeLabel ? `Selected employee: ${selectedEmployeeLabel}` : 'Select employee'}
			>
				<SelectValue placeholder={loading ? 'Loading employees...' : 'Select employee'} />
				{loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin opacity-70" aria-hidden /> : null}
			</SelectTrigger>

			<SelectContent>
				{normalizedEmployees.length === 0 ? (
					<SelectItem value="__no_employees__" disabled>
						No employees available
					</SelectItem>
				) : (
					normalizedEmployees.map((employee) => (
						<SelectItem key={employee.id} value={String(employee.id)}>
							<span className="font-medium">{formatEmployeeLabel(employee)}</span>
							{employee.employeeNumber ? (
								<span className="ml-2 text-xs text-muted-foreground">#{employee.employeeNumber}</span>
							) : null}
						</SelectItem>
					))
				)}
			</SelectContent>
		</Select>
	);
};
