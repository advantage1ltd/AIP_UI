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
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Action Calendar
          </h2>
          <p className="text-muted-foreground mt-2">
            Manage and track your tasks efficiently
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Plus className="h-5 w-5" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <AddTaskForm onSubmit={handleAddTask} selectedDate={date} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-10">
        <Card className="lg:col-span-4 border-purple-100 dark:border-purple-900/20 shadow-lg min-h-[500px] flex flex-col">
          <CardHeader className="pb-4 flex-none">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-purple-700 dark:text-purple-400">
              <CalendarDays className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              className="rounded-md border shadow-sm w-full max-w-full p-3"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-6 border-purple-100 dark:border-purple-900/20 shadow-lg min-h-[500px]">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-purple-700 dark:text-purple-400">
                <ListTodo className="h-5 w-5" />
                Tasks Overview
              </CardTitle>
            </div>
            <Tabs defaultValue="day" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
              <TabsContent value="day" className="mt-4 space-y-4">
                <TaskList 
                  tasks={tasks.filter(task => 
                    isSameDay(new Date(task.date), date)
                  )}
                  onUpdateStatus={handleUpdateTaskStatus}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                />
              </TabsContent>
              <TabsContent value="week" className="mt-4 space-y-4">
                <TaskList 
                  tasks={tasks.filter(task => 
                    isSameWeek(new Date(task.date), date)
                  )}
                  onUpdateStatus={handleUpdateTaskStatus}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                />
              </TabsContent>
              <TabsContent value="month" className="mt-4 space-y-4">
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
        </Card>
      </div>
    </div>
  )
}

export default ActionCalendar