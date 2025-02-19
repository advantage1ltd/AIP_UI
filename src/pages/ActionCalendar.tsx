// src/components/administration/UserDialog.tsx
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { AddTaskForm } from "@/components/action-calendar/AddTaskForm"
import { TaskList } from "@/components/action-calendar/TaskList"
import { Plus, CalendarDays, ListTodo } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { startOfWeek, endOfWeek, isSameWeek, isSameDay, isSameMonth } from "date-fns"

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
  const { toast } = useToast()

  const handleAddTask = (newTask: Omit<Task, 'id' | 'status'>) => {
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
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus, statusNotes: notes } : task
    ))
    toast({
      title: "Task Updated",
      description: "Task status has been successfully updated.",
    })
  }

  const handleUpdateTask = (taskId: string, updatedTask: Partial<Task>) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, ...updatedTask } : task
    ))
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Action Calendar
          </h2>
          <p className="text-lg text-muted-foreground mt-2">
            Manage and track your tasks efficiently
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
              <Plus className="h-5 w-5" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <AddTaskForm onSubmit={handleAddTask} selectedDate={date} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-5 xl:col-span-4 border-purple-100 dark:border-purple-900/20 shadow-xl min-h-[700px] flex flex-col">
          <CardHeader className="pb-4 flex-none">
            <CardTitle className="flex items-center gap-2 text-xl font-medium text-purple-700 dark:text-purple-400">
              <CalendarDays className="h-6 w-6" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              className="rounded-md border shadow-sm w-full max-w-full p-6"
              classNames={{
                head_cell: "text-muted-foreground font-medium text-center w-12",
                cell: "h-12 w-12 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100",
                day_range_end: "day-range-end",
                day_selected: "bg-purple-600 text-white hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "day-outside opacity-50",
                nav_button: "text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full",
                row: "flex w-full mt-2",
              }}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-7 xl:col-span-8 border-purple-100 dark:border-purple-900/20 shadow-xl min-h-[700px]">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl font-medium text-purple-700 dark:text-purple-400">
                <ListTodo className="h-6 w-6" />
                Tasks Overview
              </CardTitle>
            </div>
            <Tabs defaultValue="day" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-purple-50 dark:bg-purple-900/20">
                <TabsTrigger 
                  value="day"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-purple-800 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-200"
                >
                  Day
                </TabsTrigger>
                <TabsTrigger 
                  value="week"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-purple-800 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-200"
                >
                  Week
                </TabsTrigger>
                <TabsTrigger 
                  value="month"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-purple-800 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-200"
                >
                  Month
                </TabsTrigger>
              </TabsList>
              <TabsContent value="day" className="mt-6 space-y-6">
                <TaskList 
                  tasks={tasks.filter(task => 
                    isSameDay(new Date(task.date), date)
                  )}
                  onUpdateStatus={handleUpdateTaskStatus}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                />
              </TabsContent>
              <TabsContent value="week" className="mt-6 space-y-6">
                <TaskList 
                  tasks={tasks.filter(task => 
                    isSameWeek(new Date(task.date), date)
                  )}
                  onUpdateStatus={handleUpdateTaskStatus}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                />
              </TabsContent>
              <TabsContent value="month" className="mt-6 space-y-6">
                <TaskList 
                  tasks={tasks.filter(task => 
                    isSameMonth(new Date(task.date), date)
                  )}
                  onUpdateStatus={handleUpdateTaskStatus}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                />
              </TabsContent>
            </Tabs>
          </CardHeader>
          <CardContent className="p-6">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <ListTodo className="h-16 w-16 text-purple-200 mb-4" />
                <h3 className="text-xl font-medium text-purple-700 dark:text-purple-400 mb-2">No tasks yet</h3>
                <p className="text-muted-foreground">
                  Create your first task to get started
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ActionCalendar