import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: string
  type: 'task' | 'alert' | 'update'
  title: string
  description: string
  timestamp: Date
  status?: 'pending' | 'completed' | 'failed'
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'task',
    title: 'Security Check Completed',
    description: 'Daily security inspection for Site A completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'completed'
  },
  // Add more activities...
]

export const RecentActivity = () => {
  return (
    <div className="rounded-xl border">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
      </div>
      <div className="divide-y">
        {activities.map((activity) => (
          <div key={activity.id} className="p-6 hover:bg-accent/5">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">{activity.title}</h3>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {activity.description}
            </p>
            {activity.status && (
              <span className={`
                mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${activity.status === 'completed' ? 'bg-green-100 text-green-700' : 
                  activity.status === 'failed' ? 'bg-red-100 text-red-700' : 
                  'bg-yellow-100 text-yellow-700'}
              `}>
                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 