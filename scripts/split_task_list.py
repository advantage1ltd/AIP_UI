from pathlib import Path

root = Path(__file__).resolve().parents[1] / 'src' / 'components' / 'action-calendar'
src_path = root / 'TaskList.tsx'
lines = src_path.read_text(encoding='utf-8').splitlines()
out = root

hook = '''/** Loads assignable employees for action-calendar task editing. */
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
'''
(out / 'useTaskListEmployees.ts').write_text(hook, encoding='utf-8')

# rebuild TaskList without inline employee fetch
new_lines = []
skip = False
for i, line in enumerate(lines):
	if line.strip() == 'useEffect(() => {':
		# employee fetch block starts at line 35 (index 34)
		if i >= 34 and 'fetchEmployees' in '\n'.join(lines[i : i + 25]):
			skip = True
			continue
	if skip:
		if line.strip() == '}, [toast])':
			skip = False
		continue
	if line.strip().startswith('const assignableEmployees = useMemo('):
		continue
	if line.strip() == 'const hasAssignableEmployees = assignableEmployees.length > 0':
		continue
	new_lines.append(line)

text = '\n'.join(new_lines)
text = text.replace(
	"import { employeeService } from '@/services/employeeService'\nimport { Employee } from '@/types/employee'\n",
	"import { useTaskListEmployees } from './useTaskListEmployees'\n",
)
text = text.replace(
	'export function TaskList({ tasks, onOpenProgress, onUpdateTask, onDeleteTask, canManageTasks, canUpdateStatus }: TaskListProps) {',
	'/**\n * Action calendar task cards and edit dialog.\n */\nexport function TaskList({ tasks, onOpenProgress, onUpdateTask, onDeleteTask, canManageTasks, canUpdateStatus }: TaskListProps) {',
)
text = text.replace(
	'  const [employees, setEmployees] = useState<Employee[]>([])\n  const [loadingEmployees, setLoadingEmployees] = useState(false)\n  const { toast } = useToast()\n',
	'  const { employees, loadingEmployees, assignableEmployees } = useTaskListEmployees()\n  const hasAssignableEmployees = assignableEmployees.length > 0\n  const { toast } = useToast()\n',
)
src_path.write_text(text, encoding='utf-8')
print('TaskList split complete', len(text.splitlines()), 'lines')
