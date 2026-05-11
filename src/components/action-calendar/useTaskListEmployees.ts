/** Loads assignable employees for action-calendar task editing. */
import { useEffect, useMemo, useState } from 'react'
import { employeeService } from '@/services/employeeService'
import { Employee } from '@/types/employee'
import { useToast } from '@/hooks/use-toast'
import { logger } from '@/utils/logger'

export const useTaskListEmployees = () => {
	const [employees, setEmployees] = useState<Employee[]>([])
	const [loadingEmployees, setLoadingEmployees] = useState(false)
	const { toast } = useToast()

	useEffect(() => {
		const fetchEmployees = async () => {
			try {
				setLoadingEmployees(true)
				const activeEmployees = await employeeService.getActiveEmployees()
				setEmployees(activeEmployees)
			} catch (error) {
				logger.error('Failed to load employees for action calendar editing:', error)
				toast({
					title: 'Unable to load employees',
					description: 'We could not fetch employee assignments. Please retry or contact support.',
					variant: 'destructive',
				})
			} finally {
				setLoadingEmployees(false)
			}
		}

		void fetchEmployees()
	}, [toast])

	const assignableEmployees = useMemo(
		() => employees.filter((employee) => employee.userId),
		[employees],
	)

	return { employees, loadingEmployees, assignableEmployees }
}
