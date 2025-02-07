import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Task } from "@/pages/ActionCalendar"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Clock, AlertCircle, CheckCircle2, PauseCircle, User, Calendar, ArrowUpCircle, MinusCircle, ArrowDownCircle, Pencil, Trash2 } from "lucide-react"
import { format, isToday } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"

interface TaskListProps {
  tasks: Task[]
  onUpdateStatus: (taskId: string, status: Task['status'], notes?: string) => void
  onUpdateTask?: (taskId: string, updatedTask: Partial<Task>) => void
  onDeleteTask?: (taskId: string) => void
}

export function TaskList({ tasks, onUpdateStatus, onUpdateTask, onDeleteTask }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newStatus, setNewStatus] = useState<Task['status']>('pending')
  const [statusNotes, setStatusNotes] = useState("")
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedTask, setEditedTask] = useState<Partial<Task>>({})
  const { toast } = useToast()

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return <ArrowUpCircle className="h-4 w-4" />
      case 'medium':
        return <MinusCircle className="h-4 w-4" />
      case 'low':
        return <ArrowDownCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-200'
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-200'
      case 'low':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-200'
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 border-gray-200'
    }
  }

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'in-progress':
        return <Clock className="h-4 w-4" />
      case 'blocked':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <PauseCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
      case 'in-progress':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20'
      case 'blocked':
        return 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20 hover:bg-gray-500/20'
    }
  }

  const handleStatusUpdate = () => {
    if (selectedTask) {
      onUpdateStatus(selectedTask.id, newStatus, statusNotes)
      setIsUpdateDialogOpen(false)
      setStatusNotes("")
      setSelectedTask(null)
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

  const openUpdateDialog = (task: Task) => {
    setSelectedTask(task)
    setNewStatus(task.status)
    setStatusNotes(task.statusNotes || "")
    setIsUpdateDialogOpen(true)
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
          <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-purple-700 dark:text-purple-400">No Tasks Scheduled</h3>
        <p className="text-muted-foreground">No tasks are scheduled for this period.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="transition-all hover:shadow-md border-l-4 dark:bg-gray-900/50" style={{
          borderLeftColor: task.priority === 'high' ? 'rgb(239 68 68)' : 
                          task.priority === 'medium' ? 'rgb(245 158 11)' : 
                          'rgb(34 197 94)'
        }}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="space-y-1">
                  <h4 className="font-semibold text-lg">{task.title}</h4>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {task.assignee}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className={cn(
                      isToday(task.date) ? "text-red-500" : ""
                    )}>
                      Due: {format(task.date, 'dd/MM/yyyy')}
                    </span>
                  </div>
                </div>
                {task.statusNotes && (
                  <div className="text-sm italic text-muted-foreground bg-muted/50 p-3 rounded-md border border-muted">
                    {task.statusNotes}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 items-end">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditTask(task)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteTask(task.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Badge className={cn(
                  "transition-colors flex items-center gap-1.5",
                  getPriorityColor(task.priority)
                )}>
                  {getPriorityIcon(task.priority)}
                  {task.priority}
                </Badge>
                <Button
                  variant="outline"
                  className={cn(
                    "min-w-[130px] gap-2 transition-colors",
                    getStatusColor(task.status)
                  )}
                  onClick={() => openUpdateDialog(task)}
                >
                  {getStatusIcon(task.status)}
                  {task.status}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Task Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={(value: Task['status']) => setNewStatus(value)}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Status Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about the status update..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} className="bg-purple-600 hover:bg-purple-700">
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedTask.title || ''}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={editedTask.priority}
                onValueChange={(value: Task['priority']) => setEditedTask({ ...editedTask, priority: value })}
              >
                <SelectTrigger id="priority">
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
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={editedTask.assignee}
                onValueChange={(value: string) => setEditedTask({ ...editedTask, assignee: value })}
              >
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="Select Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="John Doe">John Doe</SelectItem>
                  <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                  <SelectItem value="David Johnson">David Johnson</SelectItem>
                  <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                  <SelectItem value="Michael Brown">Michael Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editedTask.date && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {editedTask.date ? format(editedTask.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={editedTask.date}
                    onSelect={(date) => date && setEditedTask({ ...editedTask, date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
