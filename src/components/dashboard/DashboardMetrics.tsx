import { 
  TrendingUp, 
  Users, 
  Calendar, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  description: string
}

const MetricCard = ({ title, value, change, icon, description }: MetricCardProps) => {
  const isPositive = change && change > 0

  return (
    <div className="rounded-xl p-6 border">
      <div className="flex items-center justify-between">
        <span className="p-2 rounded-lg bg-muted">
          {icon}
        </span>
        {change && (
          <span className={`flex items-center text-sm ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <h3 className="mt-4 text-2xl font-semibold text-foreground">{value}</h3>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

export const DashboardMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Tasks"
        value="2,420"
        change={12}
        icon={<Calendar className="w-6 h-6 text-primary-600" />}
        description="Active tasks this month"
      />
      <MetricCard
        title="Active Users"
        value="1,210"
        change={-5}
        icon={<Users className="w-6 h-6 text-primary-600" />}
        description="Users currently online"
      />
      <MetricCard
        title="Performance"
        value="98.2%"
        change={3}
        icon={<TrendingUp className="w-6 h-6 text-primary-600" />}
        description="System uptime and reliability"
      />
      <MetricCard
        title="Incidents"
        value="6"
        change={-25}
        icon={<AlertCircle className="w-6 h-6 text-primary-600" />}
        description="Open incidents requiring attention"
      />
    </div>
  )
} 