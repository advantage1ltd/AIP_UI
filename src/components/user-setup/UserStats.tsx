import { Card, CardContent } from "@/components/ui/card"
import { Users2, ShieldCheck, Clock } from "lucide-react"
import { User } from "@/data/users"

interface UserStatsProps {
  users: User[]
}

export function UserStats({ users }: UserStatsProps) {
  // Calculate stats
  const activeUsers = users.filter(u => u.status === 'active').length
  const adminCount = users.filter(u => u.role === 'Admin').length
  const recentLogins = users.filter(u => {
    const loginDate = new Date(u.lastLogin)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - loginDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff <= 7
  }).length

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Users */}
      <Card className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/60">Total Users</p>
              <h3 className="text-2xl font-bold text-white mt-2">
                {users.length}
              </h3>
              <p className="text-sm text-white/80 mt-1">
                {activeUsers} active
              </p>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <Users2 className="h-5 w-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Users */}
      <Card className="bg-gradient-to-br from-purple-600 via-purple-500 to-purple-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/60">Admin Users</p>
              <h3 className="text-2xl font-bold text-white mt-2">
                {adminCount}
              </h3>
              <p className="text-sm text-white/80 mt-1">
                {((adminCount / users.length) * 100).toFixed(1)}% of total
              </p>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/60">Recent Logins</p>
              <h3 className="text-2xl font-bold text-white mt-2">
                {recentLogins}
              </h3>
              <p className="text-sm text-white/80 mt-1">
                Last 7 days
              </p>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
