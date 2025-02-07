import { useState } from 'react'
import { Calendar, Clock, User } from 'lucide-react'

interface Task {
  id: string
  title: string
  assignee: string
  dueDate: Date
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in-progress' | 'completed'
}

export const TaskScheduler = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Site Inspection - Location A',
      assignee: 'John Doe',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
      priority: 'high',
      status: 'pending'
    },
    // Add more tasks...
  ])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming Tasks</h2>
          <button 
            className="px-4 py-2 bg-primary-500 text-white rounded-lg
              hover:bg-primary-600 focus:outline-none focus:ring-2 
              focus:ring-primary-500 focus:ring-offset-2"
          >
            Add Task
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{task.title}</h3>
              <span className={`
                px-2.5 py-0.5 rounded-full text-xs font-medium
                ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'}
              `}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {task.assignee}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(task.dueDate).toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 