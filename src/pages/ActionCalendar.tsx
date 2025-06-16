// src/pages/ActionCalendar.tsx
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { AddTaskForm } from "@/components/action-calendar/AddTaskForm"
import { TaskList } from "@/components/action-calendar/TaskList"
import { usePageAccess } from "@/contexts/PageAccessContext"
import { 
  Plus, 
  CalendarDays, 
  ListTodo, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowUpCircle, 
  MinusCircle, 
  ArrowDownCircle,
  Calendar as CalendarIcon,
  Filter,
  Lock
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { startOfWeek, endOfWeek, isSameWeek, isSameDay, isSameMonth, format, isToday } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type Task = {
  id: string
  title: string
  description: string
  date: Date
  priority: 'low' | 'medium' | 'high'
  assignee: string
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  statusNotes?: string
}

const ActionCalendar = () => {
  const [date, setDate] = useState<Date>(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState<string>("day")
  const { toast } = useToast()
  const { currentRole } = usePageAccess()
  const isAdmin = currentRole === 'administrator'

  const handleAddTask = (newTask: Omit<Task, 'id' | 'status'>) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can create and assign tasks.",
        variant: "destructive"
      })
      return
    }

    const task: Task = {
      ...newTask,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending' as const,
    }
    setTasks([...tasks, task])
    toast({
      title: "Task Added",
      description: "Your task has been successfully created.",
    })
  }

  const handleUpdateTaskStatus = (taskId: string, newStatus: Task['status'], notes?: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can update task status.",
        variant: "destructive"
      })
      return
    }

    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus, statusNotes: notes } : task
    ))
    toast({
      title: "Task Updated",
      description: "Task status has been successfully updated.",
    })
  }

  const handleUpdateTask = (taskId: string, updatedTask: Partial<Task>) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can update tasks.",
        variant: "destructive"
      })
      return
    }

    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, ...updatedTask } : task
    ))
  }

  const handleDeleteTask = (taskId: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete tasks.",
        variant: "destructive"
      })
      return
    }

    setTasks(tasks.filter(task => task.id !== taskId))
  }

  // Task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'completed').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    pending: tasks.filter(task => task.status === 'pending').length,
    blocked: tasks.filter(task => task.status === 'blocked').length,
    highPriority: tasks.filter(task => task.priority === 'high').length,
    dueToday: tasks.filter(task => isSameDay(new Date(task.date), new Date())).length,
  }

  return (
    <div className="w-full h-full bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="px-6 py-4 max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Action Calendar
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isAdmin 
                  ? "Plan, organize, and assign tasks efficiently"
                  : "View your assigned tasks and their status"
                }
              </p>
            </div>
                          <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
                {isAdmin ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2 bg-[#1a1a1a] hover:bg-[#333333]">
                        <Plus className="h-4 w-4" />
                        <span>Create Task</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                      <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                      </DialogHeader>
                      <AddTaskForm onSubmit={handleAddTask} selectedDate={date} />
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2 border-gray-200 text-gray-500 cursor-not-allowed"
                    disabled
                  >
                    <Lock className="h-4 w-4" />
                    <span>Create Task</span>
                  </Button>
                )}
              </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-4 md:px-6 py-4">
        <div className="max-w-[1600px] mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Card className="border-0 shadow-sm bg-blue-600 text-white">
              <CardContent className="p-3 sm:p-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-medium text-blue-100">Total Tasks</p>
                  <ListTodo className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-100" />
                </div>
                <p className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2">{taskStats.total}</p>
                <p className="text-[10px] sm:text-xs text-blue-100 mt-0.5 sm:mt-1">All time</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-green-600 text-white">
              <CardContent className="p-3 sm:p-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-medium text-green-100">Completed</p>
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-100" />
                </div>
                <p className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2">{taskStats.completed}</p>
                <p className="text-[10px] sm:text-xs text-green-100 mt-0.5 sm:mt-1">{taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}% of total</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-amber-600 text-white">
              <CardContent className="p-3 sm:p-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-medium text-amber-100">In Progress</p>
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-100" />
                </div>
                <p className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2">{taskStats.inProgress}</p>
                <p className="text-[10px] sm:text-xs text-amber-100 mt-0.5 sm:mt-1">{taskStats.total > 0 ? Math.round((taskStats.inProgress / taskStats.total) * 100) : 0}% of total</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-red-600 text-white">
              <CardContent className="p-3 sm:p-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-medium text-red-100">Due Today</p>
                  <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-100" />
                </div>
                <p className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2">{taskStats.dueToday}</p>
                <p className="text-[10px] sm:text-xs text-red-100 font-medium mt-0.5 sm:mt-1">Urgent</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-12">
            {/* Calendar Card */}
            <div className=" md:col-span-7 lg:col-span-4 order-2 md:order-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                  <h2 className="text-sm sm:text-md font-medium text-gray-900">Calendar</h2>
                </div>
                <p className="text-sm sm:text-md text-gray-500">{format(date, "MMMM yyyy")}</p>
              </div>
              <Card className="border-0 shadow-sm bg-white overflow-hidden">
                <CardContent className="p-2">
                  <div className="p-3 sm:p-5">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      className="w-full mx-auto"
                      showOutsideDays={true}
                      classNames={{
                        months: "space-y-4 w-full flex justify-center",
                        month: "space-y-4 w-full",
                        caption: "flex items-center justify-between px-2 py-1",
                        caption_label: "text-sm font-medium",
                        nav: "flex items-center gap-1",
                        nav_button: cn(
                          "h-7 w-7 bg-transparent p-0 opacity-75 hover:opacity-100",
                          "text-gray-600 hover:text-gray-900",
                          "hover:bg-gray-100 rounded-md",
                          "flex items-center justify-center transition-all"
                        ),
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex justify-between w-full",
                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
                        row: "flex w-full mt-2 justify-between",
                        cell: cn(
                          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                        ),
                        day: cn(
                          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                          "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          "rounded-md transition-colors"
                        ),
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                      }}
                    />
                  </div>
                  
                  <Separator className="my-3 sm:my-5 mx-3 sm:mx-5" />
                  
                  <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gray-50">
                    <h3 className="text-sm sm:text-md font-medium mb-3 sm:mb-4 text-gray-700">Priority Legend</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500"></div>
                          <span className="text-sm sm:text-md text-gray-700">High Priority</span>
                        </div>
                        <Badge variant="outline" className="text-sm sm:text-md bg-white text-gray-700 border-gray-200">
                          {taskStats.highPriority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-amber-500"></div>
                          <span className="text-sm sm:text-md text-gray-700">Medium Priority</span>
                        </div>
                        <Badge variant="outline" className="text-sm sm:text-md bg-white text-gray-700 border-gray-200">
                          {tasks.filter(t => t.priority === 'medium').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500"></div>
                          <span className="text-sm sm:text-md text-gray-700">Low Priority</span>
                        </div>
                        <Badge variant="outline" className="text-sm sm:text-md bg-white text-gray-700 border-gray-200">
                          {tasks.filter(t => t.priority === 'low').length}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tasks Card */}
            <div className="md:col-span-5 lg:col-span-7 order-1 md:order-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ListTodo className="h-4 w-4 text-gray-700" />
                  <h2 className="text-sm font-medium text-gray-900">Tasks</h2>
                </div>
                <div className="flex items-center gap-2">
                  {isToday(date) && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                      Today
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                    <span>Daily View</span>
                  </Button>
                </div>
              </div>
              
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="p-0">
                  <Tabs defaultValue="day" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="w-full grid grid-cols-3 h-9 sm:h-10 bg-white border-b rounded-none p-0">
                      <TabsTrigger 
                        value="day" 
                        className="text-xs sm:text-sm rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none data-[state=active]:bg-white"
                      >
                        Day
                      </TabsTrigger>
                      <TabsTrigger 
                        value="week" 
                        className="text-xs sm:text-sm rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none data-[state=active]:bg-white"
                      >
                        Week
                      </TabsTrigger>
                      <TabsTrigger 
                        value="month" 
                        className="text-xs sm:text-sm rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none data-[state=active]:bg-white"
                      >
                        Month
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs defaultValue="day" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                    <TabsContent value="day" className="m-0">
                      <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">
                          {format(date, "EEEE, MMMM d, yyyy")}
                        </p>
                        {isToday(date) && (
                          <Badge className="bg-green-500 text-white hover:bg-green-600">Today</Badge>
                        )}
                      </div>
                      <div className="p-4">
                        {tasks.filter(task => isSameDay(new Date(task.date), date)).length > 0 ? (
                          <TaskList 
                            tasks={tasks.filter(task => 
                              isSameDay(new Date(task.date), date)
                            )}
                            onUpdateStatus={handleUpdateTaskStatus}
                            onUpdateTask={handleUpdateTask}
                            onDeleteTask={handleDeleteTask}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="rounded-full bg-gray-100 p-4 mb-4">
                              <ListTodo className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium mb-2 text-gray-900">No Tasks Scheduled</h3>
                            <p className="text-sm text-gray-500 max-w-md">
                              {isAdmin 
                                ? "No tasks are scheduled for this period. Create a new task to get started."
                                : "No tasks have been assigned to you for this period."
                              }
                            </p>
                            {isAdmin && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button className="mt-4 gap-2 bg-[#1a1a1a] hover:bg-[#333333]">
                                    <Plus className="h-4 w-4" />
                                    <span>Create Task</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[550px]">
                                  <DialogHeader>
                                    <DialogTitle>Create New Task</DialogTitle>
                                  </DialogHeader>
                                  <AddTaskForm onSubmit={handleAddTask} selectedDate={date} />
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="week" className="m-0">
                      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border-b flex items-center justify-between">
                        <p className="text-xs sm:text-sm font-medium text-gray-700">
                          Week of {format(startOfWeek(date), "MMM d")} - {format(endOfWeek(date), "MMM d, yyyy")}
                        </p>
                        <Badge variant="outline" className="text-[10px] sm:text-xs bg-blue-50 text-blue-700 border-blue-100">
                          {tasks.filter(task => isSameWeek(new Date(task.date), date)).length} tasks
                        </Badge>
                      </div>
                      <div className="p-4">
                        {tasks.filter(task => isSameWeek(new Date(task.date), date)).length > 0 ? (
                          <TaskList 
                            tasks={tasks.filter(task => 
                              isSameWeek(new Date(task.date), date)
                            )}
                            onUpdateStatus={handleUpdateTaskStatus}
                            onUpdateTask={handleUpdateTask}
                            onDeleteTask={handleDeleteTask}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="rounded-full bg-gray-100 p-4 mb-4">
                              <ListTodo className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium mb-2 text-gray-900">No Tasks Scheduled</h3>
                            <p className="text-sm text-gray-500 max-w-md">
                              {isAdmin 
                                ? "No tasks are scheduled for this period. Create a new task to get started."
                                : "No tasks have been assigned to you for this period."
                              }
                            </p>
                            {isAdmin && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button className="mt-4 gap-2 bg-[#1a1a1a] hover:bg-[#333333]">
                                    <Plus className="h-4 w-4" />
                                    <span>Create Task</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[550px]">
                                  <DialogHeader>
                                    <DialogTitle>Create New Task</DialogTitle>
                                  </DialogHeader>
                                  <AddTaskForm onSubmit={handleAddTask} selectedDate={date} />
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="month" className="m-0">
                      <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">
                          {format(date, "MMMM yyyy")}
                        </p>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                          {tasks.filter(task => isSameMonth(new Date(task.date), date)).length} tasks
                        </Badge>
                      </div>
                      <div className="p-4">
                        {tasks.filter(task => isSameMonth(new Date(task.date), date)).length > 0 ? (
                          <TaskList 
                            tasks={tasks.filter(task => 
                              isSameMonth(new Date(task.date), date)
                            )}
                            onUpdateStatus={handleUpdateTaskStatus}
                            onUpdateTask={handleUpdateTask}
                            onDeleteTask={handleDeleteTask}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="rounded-full bg-gray-100 p-4 mb-4">
                              <ListTodo className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium mb-2 text-gray-900">No Tasks Scheduled</h3>
                            <p className="text-sm text-gray-500 max-w-md">
                              {isAdmin 
                                ? "No tasks are scheduled for this period. Create a new task to get started."
                                : "No tasks have been assigned to you for this period."
                              }
                            </p>
                            {isAdmin && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button className="mt-4 gap-2 bg-[#1a1a1a] hover:bg-[#333333]">
                                    <Plus className="h-4 w-4" />
                                    <span>Create Task</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[550px]">
                                  <DialogHeader>
                                    <DialogTitle>Create New Task</DialogTitle>
                                  </DialogHeader>
                                  <AddTaskForm onSubmit={handleAddTask} selectedDate={date} />
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActionCalendar