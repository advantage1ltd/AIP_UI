/**
 * Edit dialog for action-calendar tasks (assignee, priority, due date).
 * Flow: controlled fields from parent → assignee lookup → save through onSave callback.
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { format, parse, isValid } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Task } from '@/pages/ActionCalendar'
import type { Employee } from '@/types/employee'

export type TaskListEditDialogProps = {
	open: boolean
	selectedTask: Task | null
	editedTask: Partial<Task>
	employees: Employee[]
	loadingEmployees: boolean
	hasAssignableEmployees: boolean
	currentAssigneeMissing: boolean
	getEmployeeDisplayName: (employee: Employee) => string
	onOpenChange: (open: boolean) => void
	onEditedTaskChange: (patch: Partial<Task>) => void
	onSave: () => void
}

export const TaskListEditDialog = ({
	open,
	selectedTask,
	editedTask,
	employees,
	loadingEmployees,
	hasAssignableEmployees,
	currentAssigneeMissing,
	getEmployeeDisplayName,
	onOpenChange,
	onEditedTaskChange,
	onSave,
}: TaskListEditDialogProps) => (
	<Dialog open={open} onOpenChange={onOpenChange}>
		<DialogContent className="w-[95vw] max-w-[500px] p-4 sm:p-6">
			<DialogHeader>
				<DialogTitle>Edit Task</DialogTitle>
				<DialogDescription>
					Update the task details below. All fields are required.
				</DialogDescription>
			</DialogHeader>
			<div className="space-y-4 py-2 sm:py-4">
				<div className="space-y-2">
					<Label htmlFor="edit-title">Title</Label>
					<Input
						id="edit-title"
						value={editedTask.title || ''}
						onChange={(e) => onEditedTaskChange({ title: e.target.value })}
						className="w-full"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="edit-description">Description</Label>
					<Textarea
						id="edit-description"
						value={editedTask.description || ''}
						onChange={(e) => onEditedTaskChange({ description: e.target.value })}
						className="min-h-[100px]"
					/>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="edit-priority">Priority</Label>
						<Select
							value={(editedTask.priority ?? selectedTask?.priority ?? 'medium') as Task['priority']}
							onValueChange={(value: Task['priority']) => onEditedTaskChange({ priority: value })}
						>
							<SelectTrigger id="edit-priority">
								<SelectValue placeholder="Select Priority" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="high">High</SelectItem>
								<SelectItem value="medium">Medium</SelectItem>
								<SelectItem value="low">Low</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="edit-assignee">Assignee</Label>
						{!loadingEmployees && employees.length > 0 && !hasAssignableEmployees && (
							<p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded p-2">
								Employees without user accounts cannot be assigned tasks. Create accounts under Administration → Users.
							</p>
						)}
						<Select
							value={editedTask.assignee ?? selectedTask?.assignee ?? ''}
							onValueChange={(value) => {
								if (value.startsWith('no-user-')) return
								onEditedTaskChange({ assignee: value })
							}}
							disabled={loadingEmployees || employees.length === 0}
						>
							<SelectTrigger id="edit-assignee">
								{loadingEmployees ? (
									<div className="flex items-center gap-2 text-muted-foreground">
										<Loader2 className="h-4 w-4 animate-spin" />
										Loading employees...
									</div>
								) : (
									<SelectValue placeholder="Select assignee" />
								)}
							</SelectTrigger>
							<SelectContent>
								{loadingEmployees ? (
									<SelectItem value="loading" disabled>
										<div className="flex items-center gap-2 text-muted-foreground">
											<Loader2 className="h-4 w-4 animate-spin" />
											Loading employees...
										</div>
									</SelectItem>
								) : employees.length === 0 ? (
									<SelectItem value="no-employees" disabled>
										No employees available
									</SelectItem>
								) : (
									<>
										{employees.map((employee) => (
											<SelectItem
												key={employee.id}
												value={employee.userId ?? `no-user-${employee.id}`}
												disabled={!employee.userId}
												className={cn('text-sm', !employee.userId && 'text-muted-foreground')}
											>
												{getEmployeeDisplayName(employee)}
												{!employee.userId && ' — no user account'}
											</SelectItem>
										))}
										{currentAssigneeMissing && editedTask.assignee && (
											<SelectItem value={editedTask.assignee} disabled className="text-xs italic text-muted-foreground">
												Current assignee (no longer active)
											</SelectItem>
										)}
									</>
								)}
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="space-y-2">
					<Label htmlFor="edit-due-date">Due Date</Label>
					<Input
						id="edit-due-date"
						type="date"
						value={editedTask.date ? format(editedTask.date, 'yyyy-MM-dd') : ''}
						onChange={(e) => {
							const value = e.target.value
							if (!value) return
							const parsed = parse(value, 'yyyy-MM-dd', new Date())
							if (isValid(parsed)) {
								onEditedTaskChange({ date: parsed })
							}
						}}
						className="w-full min-h-10"
					/>
				</div>
			</div>
			<DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
				<Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
				<Button onClick={onSave}>Save Changes</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
)
