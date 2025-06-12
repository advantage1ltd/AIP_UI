import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getUser } from '@/services/auth'
import {
  FileWarning,
  FileSearch,
  Building,
  Calendar,
  CalendarRange,
  BadgeCheck,
  ClipboardCheck,
  Key,
  HelpCircle,
  Wallet,
  Shirt,
  Bell,
  Clock,
  CheckCircle,
  Target,
  Award,
  TrendingUp,
  Shield,
  Users,
  Eye,
  MapPin,
  AlertTriangle,
  Activity,
  Star,
  Timer,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ChevronLeft,
  ChevronRightIcon
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Types and Interfaces
interface OfficerData {
  name: string
  badgeNumber: string
  role: string
  avatar: string
  shiftStatus: string
  shiftStart: string
  shiftEnd: string
  location: string
  stats: {
    incidentsThisMonth: number
    incidentsLastMonth: number
    totalValueSaved: number
    responseTime: number
    completionRate: number
    holidayBooked: number
    hoursWorked: number
    sitesVisited: number
  }
  monthlyTarget: {
    incidents: number
    valueSaved: number
    current: {
      incidents: number
      valueSaved: number
    }
  }
  recentActivities: Activity[]
  upcomingTasks: Task[]
}

interface Activity {
  id: string
  type: 'incident' | 'patrol' | 'report'
  title: string
  location: string
  time: string
  value?: number
  status: 'resolved' | 'submitted' | 'in-progress'
}

interface Task {
  id: string
  type: string
  title: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
}

interface Incident {
  id: string
  date: string
  siteName: string
  type: string
  value: number
  assignedTo: string
}

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down'
  icon: React.ElementType
  gradient: string
  subtitle?: string
}

interface ProgressCardProps {
  title: string
  current: number
  target: number
  unit: string
  color: string
}

// Mock data with proper typing
const officerData: OfficerData = {
  name: "John Smith",
  badgeNumber: "ADV-001",
  role: "Advantage One Officer",
  avatar: "/api/placeholder/40/40",
  shiftStatus: "On Duty",
  shiftStart: "08:00",
  shiftEnd: "20:00",
  location: "Central Manchester Store",
  stats: {
    incidentsThisMonth: 24,
    incidentsLastMonth: 18,
    totalValueSaved: 45600,
    responseTime: 95,
    completionRate: 92,
    holidayBooked: 5,
    hoursWorked: 156,
    sitesVisited: 12
  },
  monthlyTarget: {
    incidents: 30,
    valueSaved: 50000,
    current: {
      incidents: 24,
      valueSaved: 45600
    }
  },
  recentActivities: [
    {
      id: "ACT-001",
      type: "incident",
      title: "Theft Prevention",
      location: "Electronics Section",
      time: "2 hours ago",
      value: 299.99,
      status: "resolved"
    },
    {
      id: "ACT-002",
      type: "report",
      title: "Incident Report Submitted",
      location: "Customer Service",
      time: "1 day ago",
      value: 150.00,
      status: "submitted"
    }
  ],
  upcomingTasks: [
    {
      id: "TASK-001",
      type: "Site Visit",
      title: "Site Visit",
      dueDate: "Tomorrow",
      priority: "high"
    },
    {
      id: "TASK-002",
      type: "inspection",
      title: "Customer Satisfaction Survey",
      dueDate: "2 days",
      priority: "medium"
    }
  ]
}

const incidentReports: Incident[] = [
  {
    id: "INC-001",
    date: "2024-03-15",
    siteName: "Manchester Central Store",
    type: "Theft Prevention",
    value: 299.99,
    assignedTo: "John Smith"
  },
  {
    id: "INC-002",
    date: "2024-03-14",
    siteName: "Liverpool Main Store",
    type: "Suspicious Activity",
    value: 0,
    assignedTo: "John Smith"
  },
  {
    id: "INC-003",
    date: "2024-03-14",
    siteName: "Birmingham Store",
    type: "Vehicle Damage",
    value: 450.00,
    assignedTo: "John Smith"
  },
  {
    id: "INC-004",
    date: "2024-03-13",
    siteName: "Leeds Shopping Centre",
    type: "Inventory Loss",
    value: 1250.00,
    assignedTo: "John Smith"
  },
  {
    id: "INC-005",
    date: "2024-03-13",
    siteName: "Newcastle Mall",
    type: "Customer Dispute",
    value: 0,
    assignedTo: "John Smith"
  }
]

// Components
const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  gradient,
  subtitle 
}) => (
  <Card className={`relative overflow-hidden border-0 shadow-lg ${gradient}`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">{value}</p>
            {subtitle && <p className="text-white/70 text-xs">{subtitle}</p>}
          </div>
          {change && (
            <div className="flex items-center gap-1">
              {trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 text-white/80" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-white/80" />
              )}
              <span className="text-white/80 text-sm">{change}</span>
            </div>
          )}
        </div>
        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      
      {/* Background Pattern */}
      <div className="absolute -bottom-6 -right-6 opacity-10">
        <Icon className="h-24 w-24 text-white" />
      </div>
    </CardContent>
  </Card>
)

const QuickActionCard = ({ 
  icon: Icon, 
  title, 
  link, 
  description, 
  color = "blue",
  badge
}: {
  icon: any
  title: string
  link: string
  description: string
  color?: string
  badge?: string
}) => {
  const colorClasses = {
    blue: "border-blue-200 hover:border-blue-300 hover:bg-blue-50",
    green: "border-green-200 hover:border-green-300 hover:bg-green-50",
    purple: "border-purple-200 hover:border-purple-300 hover:bg-purple-50",
    orange: "border-orange-200 hover:border-orange-300 hover:bg-orange-50",
    red: "border-red-200 hover:border-red-300 hover:bg-red-50",
    indigo: "border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
  }

  const iconColors = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100",
    orange: "text-orange-600 bg-orange-100",
    red: "text-red-600 bg-red-100",
    indigo: "text-indigo-600 bg-indigo-100"
  }

  return (
    <Link to={link}>
      <Card className={`transition-all duration-200 ${colorClasses[color as keyof typeof colorClasses]} group cursor-pointer`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`rounded-lg p-3 ${iconColors[color as keyof typeof iconColors]} group-hover:scale-110 transition-transform`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                {badge && (
                  <Badge variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              <div className="flex items-center text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                Access now
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'incident': return AlertTriangle
      case 'patrol': return Shield
      case 'report': return FileWarning
      default: return Activity
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'incident': return 'bg-red-500'
      case 'patrol': return 'bg-blue-500'
      case 'report': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const Icon = getActivityIcon(activity.type)

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border bg-white hover:shadow-md transition-shadow">
      <div className={`rounded-full p-2 ${getActivityColor(activity.type)} text-white`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">{activity.title}</h4>
          <span className="text-xs text-gray-500">{activity.time}</span>
        </div>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {activity.location}
        </p>
        {activity.value && (
          <p className="text-sm font-medium text-green-600">
            Value: £{activity.value.toFixed(2)}
          </p>
        )}
        <Badge 
          variant={activity.status === 'resolved' ? 'default' : 'secondary'}
          className="text-xs"
        >
          {activity.status}
        </Badge>
      </div>
    </div>
  )
}

const ProgressCard: React.FC<ProgressCardProps> = ({ title, current, target, unit, color }) => {
  const percentage = Math.min((current / target) * 100, 100)
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">{title}</h3>
            <Badge variant={percentage >= 80 ? 'default' : 'secondary'}>
              {percentage.toFixed(0)}%
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current: {current.toLocaleString()} {unit}</span>
              <span className="text-gray-600">Target: {target.toLocaleString()} {unit}</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
          
          <div className="text-sm text-gray-600">
            {target - current > 0 ? (
              <>Need {(target - current).toLocaleString()} more {unit} to reach target</>
            ) : (
              <>🎉 Target achieved! {(current - target).toLocaleString()} {unit} ahead</>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Add IncidentTable component
const IncidentTable: React.FC = () => {
  const [page, setPage] = React.useState(1)
  const pageSize = 5
  const totalPages = Math.ceil(incidentReports.length / pageSize)
  
  const paginatedIncidents = React.useMemo(() => 
    incidentReports.slice((page - 1) * pageSize, page * pageSize),
    [page]
  )

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Officer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Site Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedIncidents.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell className="font-medium">{incident.assignedTo}</TableCell>
              <TableCell>{new Date(incident.date).toLocaleDateString()}</TableCell>
              <TableCell>{incident.siteName}</TableCell>
              <TableCell>{incident.type}</TableCell>
              <TableCell className="text-right">
                {incident.value > 0 ? `£${incident.value.toFixed(2)}` : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, incidentReports.length)} of {incidentReports.length} incidents
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function OfficerDashboard({ displayName }: { displayName?: string }) {
  // Error handling state
  const [error, setError] = React.useState<Error | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  
  // Get the logged-in user information
  const loggedInUser = getUser()
  const userName = loggedInUser?.displayName || loggedInUser?.username || displayName || officerData.name
  const userRole = loggedInUser?.role || officerData.role

  // Fetch data on mount
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        // In production, replace with actual API calls
        // const response = await fetch('/api/dashboard')
        // const data = await response.json()
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'))
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error.message}</p>
            <Button 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {userName}
            </h1>
            <div className="text-gray-600 flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-200">
                {officerData.shiftStatus}
              </Badge>
              <span>•</span>
              <span>{userRole}</span>              
              <span className="flex items-center gap-1"></span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Incidents This Month"
            value={officerData.stats.incidentsThisMonth}
            change="+33% from last month"
            trend="up"
            icon={Shield}
            gradient="bg-gradient-to-br from-blue-500 to-blue-700"
            subtitle={`Target: ${officerData.monthlyTarget.incidents}`}
          />
          <StatCard
            title="Value Saved"
            value={`£${(officerData.stats.totalValueSaved / 1000).toFixed(1)}k`}
            change="+£12k from last month"
            trend="up"
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
            subtitle="This month"
          />
          <StatCard
            title="Response Rate"
            value={`${officerData.stats.responseTime}%`}
            change="+5% improvement"
            trend="up"
            icon={Timer}
            gradient="bg-gradient-to-br from-purple-500 to-purple-700"
            subtitle="Average response time"
          />
          <StatCard
            title="Holiday Booked"
            value={`${officerData.stats.holidayBooked} days`}
            icon={CalendarRange}
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            subtitle="This year"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Monthly Progress and Incident Table */}
          <div className="lg:col-span-2 space-y-6">
            {/* Monthly Targets */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Monthly Progress
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <ProgressCard
                  title="Incidents Handled"
                  current={officerData.monthlyTarget.current.incidents}
                  target={officerData.monthlyTarget.incidents}
                  unit="incidents"
                  color="blue"
                />
                <ProgressCard
                  title="Value Saved"
                  current={officerData.monthlyTarget.current.valueSaved}
                  target={officerData.monthlyTarget.valueSaved}
                  unit="£"
                  color="green"
                />
              </div>
            </div>

            {/* Incident Reports Table */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileWarning className="h-5 w-5 text-red-600" />
                Recent Incidents
              </h2>
              <Card>
                <CardContent className="p-4">
                  <IncidentTable />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Activity & Notifications */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {officerData.recentActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Upcoming Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {officerData.upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' : 
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-gray-600">Due: {task.dueDate}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 