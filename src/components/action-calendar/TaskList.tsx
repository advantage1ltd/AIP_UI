/**
 * Action calendar task cards and edit dialog.
 * Flow: task cards → permission-gated edit/delete → TaskListEditDialog updates parent callbacks.
 */
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TaskListEditDialog } from './TaskListEditDialog'
import { Button } from '@/components/ui/button'
import { Task } from '@/pages/ActionCalendar'
import { cn } from '@/lib/utils'
import { Clock, AlertCircle, CheckCircle2, PauseCircle, User, Calendar, ArrowUpCircle, MinusCircle, ArrowDownCircle, Pencil, Trash2, Activity } from 'lucide-react'
import { format, isToday } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { useTaskListEmployees } from './useTaskListEmployees'
import type { Employee } from '@/types/employee'

interface TaskListProps {
  tasks: Task[]
  onOpenProgress: (task: Task) => void
  onUpdateTask?: (taskId: string, updatedTask: Partial<Task>) => void
  onDeleteTask?: (taskId: string) => void
  canManageTasks: boolean
  canUpdateStatus: (task: Task) => boolean
}

export function TaskList({ tasks, onOpenProgress, onUpdateTask, onDeleteTask, canManageTasks, canUpdateStatus }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedTask, setEditedTask] = useState<Partial<Task>>({})
  const { employees, loadingEmployees, assignableEmployees } = useTaskListEmployees()
  const hasAssignableEmployees = assignableEmployees.length > 0
  const { toast } = useToast()

  const currentAssigneeMissing = Boolean(
    editedTask.assignee && !employees.some(employee => employee.userId === editedTask.assignee)
  )

  const getEmployeeDisplayName = (employee: Employee) =>
    `${employee.firstName} ${employee.surname}${employee.employeeNumber ? ` (${employee.employeeNumber})` : ''}`

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return <ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
      case 'medium':
        return <MinusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
      case 'low':
        return <ArrowDownCircle className="h-4 w-4 sm:h-5 sm:w-5" />
      default:
        return null
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300'
      case 'medium':
        return 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300'
      case 'low':
        return 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300'
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
    }
  }

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
      case 'in-progress':
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
      case 'blocked':
        return <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
      default:
        return <PauseCircle className="h-4 w-4 sm:h-5 sm:w-5" />
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
      case 'blocked':
        return 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
    }
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setEditedTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignee: task.assignee,
      date: task.date
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (selectedTask && onUpdateTask) {
      onUpdateTask(selectedTask.id, editedTask)
      setIsEditDialogOpen(false)
      setSelectedTask(null)
      setEditedTask({})
      toast({
        title: "Task Updated",
        description: "Task details have been successfully updated.",
      })
    }
  }

  const handleDeleteTask = (taskId: string) => {
    if (onDeleteTask) {
      onDeleteTask(taskId)
      toast({
        title: "Task Deleted",
        description: "Task has been successfully deleted.",
      })
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 text-center">
        <div className="rounded-full bg-purple-100 p-2 sm:p-3 dark:bg-purple-900">
          <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="mt-2 sm:mt-4 text-base sm:text-lg font-semibold text-purple-700 dark:text-purple-400">No Tasks Scheduled</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">No tasks are scheduled for this period.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="transition-all hover:shadow-md border-l-4 dark:bg-gray-900/50" style={{
          borderLeftColor: task.priority === 'high' ? 'rgb(239 68 68)' : 
                          task.priority === 'medium' ? 'rgb(245 158 11)' : 
                          'rgb(34 197 94)'
        }}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
              <div className="space-y-2 sm:space-y-3 flex-1">
                <div className="space-y-1">
                  <h4 className="font-semibold text-base sm:text-lg">{task.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{task.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    {task.assigneeName || task.assignee}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className={cn(
                      isToday(task.date) ? "text-red-500" : ""
                    )}>
                      Due: {format(task.date, 'dd/MM/yyyy')}
                    </span>
                  </div>
                </div>
                {task.statusNotes && (
                  <div className="text-xs sm:text-sm italic text-muted-foreground bg-muted/50 p-2 sm:p-3 rounded-md border border-muted">
                    {task.statusNotes}
                  </div>
                )}
              </div>
              <div className="flex sm:flex-col gap-2 sm:gap-3 items-start sm:items-end mt-2 sm:mt-0">
                {canManageTasks && (
                  <div className="flex gap-1 sm:gap-2 order-last sm:order-first">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditTask(task)}
                      className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:text-blue-700"
                    >
                      <Pencil className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                      <span className="sr-only">Edit task</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                      className="h-10 w-10 sm:h-12 sm:w-12 bg-red-50 border-red-200 hover:bg-red-100 hover:text-red-700"
                    >
                      <Trash2 className="h-6 w-6 sm:h-7 sm:w-7 text-red-600" />
                      <span className="sr-only">Delete task</span>
                    </Button>
                  </div>
                )}
                <div className="flex sm:flex-col gap-2 items-center sm:items-end">
                  <Badge className={cn(
                    "transition-colors flex items-center gap-1 text-xs sm:text-sm px-2 py-1",
                    getPriorityColor(task.priority)
                  )}>
                    {getPriorityIcon(task.priority)}
                    {task.priority}
                  </Badge>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 sm:h-10 px-3 sm:px-4 min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm gap-1 sm:gap-2 transition-colors font-medium border",
                      getStatusColor(task.status),
                      "capitalize"
                    )}
                    onClick={() => onOpenProgress(task)}
                    disabled={!canUpdateStatus(task)}
                    aria-disabled={!canUpdateStatus(task)}
                    aria-label={canUpdateStatus(task) ? "Report progress" : "You do not have permission to update this task"}
                  >
                    {getStatusIcon(task.status)}
                    <span className="flex items-center gap-1">
                      {task.status}
                      <Activity className="h-3 w-3 text-muted-foreground" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <TaskListEditDialog
        open={isEditDialogOpen}
        selectedTask={selectedTask}
        editedTask={editedTask}
        employees={employees}
        loadingEmployees={loadingEmployees}
        hasAssignableEmployees={hasAssignableEmployees}
        currentAssigneeMissing={currentAssigneeMissing}
        getEmployeeDisplayName={getEmployeeDisplayName}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setSelectedTask(null)
            setEditedTask({})
          }
        }}
        onEditedTaskChange={(patch) => setEditedTask((prev) => ({ ...prev, ...patch }))}
        onSave={handleSaveEdit}
      />
    </div>
  )
}
