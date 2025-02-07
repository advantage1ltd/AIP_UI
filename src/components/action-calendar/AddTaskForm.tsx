import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Task } from "@/pages/ActionCalendar"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ArrowUpCircle, MinusCircle, ArrowDownCircle } from "lucide-react"

interface AddTaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'status'>) => void
  selectedDate: Date
}

const assignees = [
  "John Doe",
  "Jane Smith",
  "David Johnson",
  "Sarah Wilson",
  "Michael Brown"
]

export function AddTaskForm({ onSubmit, selectedDate }: AddTaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Task['priority']>("medium")
  const [assignee, setAssignee] = useState("")
  const [date, setDate] = useState<Date>(selectedDate)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      description,
      date,
      priority,
      assignee
    })
  }

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return <ArrowUpCircle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <MinusCircle className="h-4 w-4 text-amber-500" />
      case 'low':
        return <ArrowDownCircle className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-purple-100 focus-visible:ring-purple-500"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px] resize-none border-purple-100 focus-visible:ring-purple-500"
          required
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority Level</Label>
          <Select 
            value={priority} 
            onValueChange={(value: Task['priority']) => setPriority(value)}
          >
            <SelectTrigger id="priority" className="border-purple-100 focus:ring-purple-500">
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high" className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="h-4 w-4 text-red-500" />
                  High
                </div>
              </SelectItem>
              <SelectItem value="medium" className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <MinusCircle className="h-4 w-4 text-amber-500" />
                  Medium
                </div>
              </SelectItem>
              <SelectItem value="low" className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="h-4 w-4 text-green-500" />
                  Low
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignee">Assign To</Label>
          <Select 
            value={assignee} 
            onValueChange={setAssignee}
          >
            <SelectTrigger id="assignee" className="border-purple-100 focus:ring-purple-500">
              <SelectValue placeholder="Select Assignee" />
            </SelectTrigger>
            <SelectContent>
              {assignees.map((person) => (
                <SelectItem key={person} value={person}>
                  {person}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal border-purple-100 focus:ring-purple-500",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
              className="rounded-md border shadow-sm"
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
        Create Task
      </Button>
    </form>
  )
}