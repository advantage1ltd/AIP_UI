import { useState } from "react"
import { format } from "date-fns"
import {
  Calendar,
  CheckSquare,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Task {
  id: string
  title: string
  owner: {
    name: string
    avatar?: string
  }
  status: "working" | "done" | "stuck"
  dueDate: string
  priority: "low" | "medium" | "high"
  notes: string
  timeline: {
    start: string
    end: string
  }
  lastUpdated: string
}

const DUMMY_TASKS: Task[] = [
  {
    id: "1",
    title: "Task 1",
    owner: {
      name: "John Doe",
      avatar: "/avatars/01.png",
    },
    status: "working",
    dueDate: "2025-01-30",
    priority: "low",
    notes: "Action items",
    timeline: {
      start: "2025-01-30",
      end: "2025-01-31",
    },
    lastUpdated: "32 minutes ago",
  },
  {
    id: "2",
    title: "Task 2",
    owner: {
      name: "Jane Smith",
    },
    status: "done",
    dueDate: "2025-01-31",
    priority: "high",
    notes: "Meeting notes",
    timeline: {
      start: "2025-02-01",
      end: "2025-02-02",
    },
    lastUpdated: "1 year ago",
  },
  {
    id: "3",
    title: "Task 3",
    owner: {
      name: "Bob Wilson",
    },
    status: "stuck",
    dueDate: "2025-02-01",
    priority: "medium",
    notes: "Other",
    timeline: {
      start: "2025-02-03",
      end: "2025-02-04",
    },
    lastUpdated: "1 year ago",
  },
]

function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(DUMMY_TASKS)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    status: "working",
    priority: "medium",
    notes: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    timeline: {
      start: format(new Date(), "yyyy-MM-dd"),
      end: format(new Date(), "yyyy-MM-dd"),
    },
    owner: {
      name: "Current User",
    },
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy");
  };

  const handleAddTask = () => {
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      ...newTask as Omit<Task, 'id'>,
      lastUpdated: "Just now",
    }
    setTasks([...tasks, task])
    setShowNewTaskDialog(false)
    setNewTask({
      title: "",
      status: "working",
      priority: "medium",
      notes: "",
      dueDate: format(new Date(), "yyyy-MM-dd"),
      timeline: {
        start: format(new Date(), "yyyy-MM-dd"),
        end: format(new Date(), "yyyy-MM-dd"),
      },
      owner: {
        name: "Current User",
      },
    })
  }

  const handleEditTask = () => {
    if (!editingTask) return
    setTasks(tasks.map(task => task.id === editingTask.id ? editingTask : task))
    setEditingTask(null)
    setIsEditDialogOpen(false)
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, lastUpdated: "Just now" }
        : task
    ))
  }

  const handlePriorityChange = (taskId: string, newPriority: Task['priority']) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, priority: newPriority, lastUpdated: "Just now" }
        : task
    ))
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  }

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  // Separate ongoing and completed tasks
  const { ongoingTasks, completedTasks } = filteredTasks.reduce(
    (acc, task) => {
      if (task.status === "done") {
        acc.completedTasks.push(task)
      } else {
        acc.ongoingTasks.push(task)
      }
      return acc
    },
    { ongoingTasks: [] as Task[], completedTasks: [] as Task[] }
  )

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "done":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "working":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "stuck":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  // Calculate task statistics
  const taskStats = {
    working: tasks.filter(task => task.status === "working").length,
    done: tasks.filter(task => task.status === "done").length,
    stuck: tasks.filter(task => task.status === "stuck").length,
    total: tasks.length
  }

  // Table Row Component to reduce duplication
  const TaskRow = ({ task }: { task: Task }) => (
    <TableRow key={task.id}>
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell>{task.title}</TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={getStatusColor(task.status)}
        >
          {task.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={getPriorityColor(task.priority)}
        >
          {task.priority}
        </Badge>
      </TableCell>
      <TableCell>{formatDate(task.dueDate)}</TableCell>
      <TableCell>
        <div className="max-w-[200px] truncate" title={task.notes}>
          {task.notes || "-"}
        </div>
      </TableCell>
      <TableCell>{task.lastUpdated}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() =>
                    handleStatusChange(task.id, "working")
                  }
                >
                  Working on it
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(task.id, "done")}
                >
                  Done
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(task.id, "stuck")}
                >
                  Stuck
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Priority</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() =>
                    handlePriorityChange(task.id, "low")
                  }
                >
                  Low
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handlePriorityChange(task.id, "medium")
                  }
                >
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handlePriorityChange(task.id, "high")
                  }
                >
                  High
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleEdit(task)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteTask(task.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-6">
        {/* Header with Title and Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tasks</h1>
            <p className="text-gray-500">Manage and track your team's tasks</p>
          </div>
          <Button onClick={() => setShowNewTaskDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New task
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-zinc-800 rounded-lg p-4 flex flex-col">
            <span className="text-zinc-400 text-sm">Total Tasks</span>
            <span className="text-2xl font-bold text-white">{taskStats.total}</span>
          </div>
          <div className="bg-blue-900 rounded-lg p-4 flex flex-col">
            <span className="text-blue-300 text-sm">In Progress</span>
            <span className="text-2xl font-bold text-white">{taskStats.working}</span>
          </div>
          <div className="bg-green-900 rounded-lg p-4 flex flex-col">
            <span className="text-green-300 text-sm">Completed</span>
            <span className="text-2xl font-bold text-white">{taskStats.done}</span>
          </div>
          <div className="bg-red-900 rounded-lg p-4 flex flex-col">
            <span className="text-red-300 text-sm">Stuck</span>
            <span className="text-2xl font-bold text-white">{taskStats.stuck}</span>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="working">Working on it</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="stuck">Stuck</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Tasks Tables */}
        <div className="space-y-6">
          {/* Ongoing Tasks */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Ongoing Tasks</h2>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ongoingTasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Completed Tasks</h2>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox />
                      </TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedTasks.map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a new task to track</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={newTask.status}
                onValueChange={value => setNewTask({ ...newTask, status: value as Task['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="working">Working on it</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="stuck">Stuck</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={value => setNewTask({ ...newTask, priority: value as Task['priority'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                placeholder="dd/mm/yyyy"
              />
            </div>
            <div>
              <Label>Timeline</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timelineStart">Start</Label>
                  <Input
                    id="timelineStart"
                    type="date"
                    value={newTask.timeline?.start}
                    onChange={e => setNewTask({
                      ...newTask,
                      timeline: { ...newTask.timeline!, start: e.target.value }
                    })}
                    placeholder="dd/mm/yyyy"
                  />
                </div>
                <div>
                  <Label htmlFor="timelineEnd">End</Label>
                  <Input
                    id="timelineEnd"
                    type="date"
                    value={newTask.timeline?.end}
                    onChange={e => setNewTask({
                      ...newTask,
                      timeline: { ...newTask.timeline!, end: e.target.value }
                    })}
                    placeholder="dd/mm/yyyy"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newTask.notes}
                onChange={e => setNewTask({ ...newTask, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && setIsEditDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Modify the task details</DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingTask.title}
                  onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingTask.status}
                  onValueChange={value => setEditingTask({ ...editingTask, status: value as Task['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="working">Working on it</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="stuck">Stuck</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={editingTask.priority}
                  onValueChange={value => setEditingTask({ ...editingTask, priority: value as Task['priority'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={editingTask.dueDate}
                  onChange={e => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  placeholder="dd/mm/yyyy"
                />
              </div>
              <div>
                <Label>Timeline</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-timelineStart">Start</Label>
                    <Input
                      id="edit-timelineStart"
                      type="date"
                      value={editingTask.timeline.start}
                      onChange={e => setEditingTask({
                        ...editingTask,
                        timeline: { ...editingTask.timeline, start: e.target.value }
                      })}
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-timelineEnd">End</Label>
                    <Input
                      id="edit-timelineEnd"
                      type="date"
                      value={editingTask.timeline.end}
                      onChange={e => setEditingTask({
                        ...editingTask,
                        timeline: { ...editingTask.timeline, end: e.target.value }
                      })}
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingTask.notes}
                  onChange={e => setEditingTask({ ...editingTask, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTask}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Tasks
