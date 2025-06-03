import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'

// Mock officer data - in real app, this would come from API/context
const officerData = {
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
    responseTime: 95, // percentage
    completionRate: 92, // percentage
    holidayBooked: 5, // days booked this year
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
      type: "incident",
      title: "Theft Prevention",
      location: "Electronics Section",
      time: "2 hours ago",
      value: 299.99,
      status: "resolved"
    },
    {
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
      type: "Site Visit",
      title: "Site Visit",
      dueDate: "Tomorrow",
      priority: "high"
    },
    {
      type: "inspection",
      title: "Customer Satisfaction Survey",
      dueDate: "2 days",
      priority: "medium"
    }
  ]
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  gradient,
  subtitle 
}: {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down'
  icon: any
  gradient: string
  subtitle?: string
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

const ActivityItem = ({ activity }: { activity: any }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'incident': return AlertTriangle
      case 'patrol': return Shield
      case 'report': return FileWarning
      default: return Activity
    }
  }

  const getActivityColor = (type: string) => {
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

const ProgressCard = ({ title, current, target, unit, color }: {
  title: string
  current: number
  target: number
  unit: string
  color: string
}) => {
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

export default function OfficerDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {officerData.name}
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-200">
                {officerData.shiftStatus}
              </Badge>
              <span>•</span>
              <span>{officerData.role}</span>              
              <span className="flex items-center gap-1">
              
              </span>
            </p>
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
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Quick Actions
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <QuickActionCard
                  icon={FileWarning}
                  title="Report Incident"
                  link="/operations/incident-report"
                  description="Quick incident reporting with photo capture"
                  color="red"
                  badge="Priority"
                />
               
                <QuickActionCard
                  icon={Calendar}
                  title="Schedule"
                  link="/operations/holiday-requests"
                  description="View Holiday Schedule and request time off"
                  color="green"
                />
                <QuickActionCard
                  icon={Wallet}
                  title="Expenses"
                  link="/operations/officer-expenses"
                  description="Submit and track expense claims"
                  color="orange"
                />
                <QuickActionCard
                  icon={HelpCircle}
                  title="Support"
                  link="/operations/officer-support"
                  description="View security updates and sign declarations"
                  color="indigo"
                />
              </div>
            </div>

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
                {officerData.recentActivities.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
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
                {officerData.upcomingTasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
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

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="font-medium">{officerData.stats.completionRate}%</span>
                  </div>
                  <Progress value={officerData.stats.completionRate} className="h-2" />
                </div>
                
                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hours Worked</span>
                    <span className="font-medium">{officerData.stats.hoursWorked}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sites Visited</span>
                    <span className="font-medium">{officerData.stats.sitesVisited}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 