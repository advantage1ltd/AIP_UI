import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { 
  Activity, 
  AlertCircle, 
  Calendar,
  Clock,
  Users,
  Shield,
  TrendingUp,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Home,
  Settings,
  HelpCircle,
  LogOut,
  User,
  Plus,
  Currency,
  Star
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { TaskCard } from '../components/dashboard/TaskCard'
import { IncidentTable } from '../components/dashboard/IncidentTable'
import { OfficerPerformance } from '../components/dashboard/OfficerPerformance'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { cn } from '../lib/utils'

// Customer-specific data
const customerData = {
  'customer1': {
    metrics: [
      { title: 'Total Saved YTD', value: '£196K', change: '+15%', trend: 'up', icon: Currency, color: 'green' },
      { title: 'Customer Satisfaction', value: '4.8/5', change: '+0.3', trend: 'up', icon: Star, color: 'yellow' },
      { title: 'Incidents Today', value: '8', change: '-3%', trend: 'down', icon: AlertCircle, color: 'red' },
      { title: 'Active Guards', value: '342', change: '+12%', trend: 'up', icon: Users, color: 'blue' }
    ],
    monthlyIncidents: [
      { month: 'Jan', incidents: 40 },
      { month: 'Feb', incidents: 30 },
      { month: 'Mar', incidents: 45 },
      { month: 'Apr', incidents: 25 },
      { month: 'May', incidents: 35 },
      { month: 'Jun', incidents: 20 },
      { month: 'Jul', incidents: 28 },
      { month: 'Aug', incidents: 32 },
      { month: 'Sep', incidents: 38 },
      { month: 'Oct', incidents: 42 },
      { month: 'Nov', incidents: 36 },
      { month: 'Dec', incidents: 30 }
    ],
    incidentReports: [
      {
        id: '1',
        customerName: 'Central England COOP',
        store: 'Store #1234',
        officerName: 'John Smith',
        date: '2025-01-30',
        amount: 1250.00
      },
      {
        id: '2',
        customerName: 'Central England COOP',
        store: 'Store #1235',
        officerName: 'Jane Doe',
        date: '2025-01-29',
        amount: 850.00
      },
      {
        id: '3',
        customerName: 'Central England COOP',
        store: 'Store #1236',
        officerName: 'Mike Johnson',
        date: '2025-01-28',
        amount: 2100.00
      }
    ]
  },
  'customer2': {
    metrics: [
      { title: 'Total Saved YTD', value: '£250K', change: '+20%', trend: 'up', icon: Currency, color: 'green' },
      { title: 'Customer Satisfaction', value: '4.5/5', change: '+0.2', trend: 'up', icon: Star, color: 'yellow' },
      { title: 'Incidents Today', value: '5', change: '-10%', trend: 'down', icon: AlertCircle, color: 'red' },
      { title: 'Active Guards', value: '420', change: '+15%', trend: 'up', icon: Users, color: 'blue' }
    ],
    monthlyIncidents: [
      { month: 'Jan', incidents: 35 },
      { month: 'Feb', incidents: 28 },
      { month: 'Mar', incidents: 40 },
      { month: 'Apr', incidents: 22 },
      { month: 'May', incidents: 30 },
      { month: 'Jun', incidents: 18 },
      { month: 'Jul', incidents: 25 },
      { month: 'Aug', incidents: 30 },
      { month: 'Sep', incidents: 35 },
      { month: 'Oct', incidents: 38 },
      { month: 'Nov', incidents: 32 },
      { month: 'Dec', incidents: 28 }
    ],
    incidentReports: [
      {
        id: '1',
        customerName: 'HOE COOP',
        store: 'Store #5678',
        officerName: 'Sarah Wilson',
        date: '2025-01-30',
        amount: 1500.00
      },
      {
        id: '2',
        customerName: 'HOE COOP',
        store: 'Store #5679',
        officerName: 'Tom Brown',
        date: '2025-01-29',
        amount: 950.00
      },
      {
        id: '3',
        customerName: 'HOE COOP',
        store: 'Store #5680',
        officerName: 'Lisa Chen',
        date: '2025-01-28',
        amount: 1800.00
      }
    ]
  },
  'customer3': {
    metrics: [
      { title: 'Total Saved YTD', value: '£175K', change: '+12%', trend: 'up', icon: Currency, color: 'green' },
      { title: 'Customer Satisfaction', value: '4.9/5', change: '+0.4', trend: 'up', icon: Star, color: 'yellow' },
      { title: 'Incidents Today', value: '3', change: '-15%', trend: 'down', icon: AlertCircle, color: 'red' },
      { title: 'Active Guards', value: '280', change: '+8%', trend: 'up', icon: Users, color: 'blue' }
    ],
    monthlyIncidents: [
      { month: 'Jan', incidents: 30 },
      { month: 'Feb', incidents: 25 },
      { month: 'Mar', incidents: 35 },
      { month: 'Apr', incidents: 20 },
      { month: 'May', incidents: 28 },
      { month: 'Jun', incidents: 15 },
      { month: 'Jul', incidents: 22 },
      { month: 'Aug', incidents: 26 },
      { month: 'Sep', incidents: 32 },
      { month: 'Oct', incidents: 36 },
      { month: 'Nov', incidents: 30 },
      { month: 'Dec', incidents: 25 }
    ],
    incidentReports: [
      {
        id: '1',
        customerName: 'Midcounties COOP',
        store: 'Store #9012',
        officerName: 'David Lee',
        date: '2025-01-30',
        amount: 1750.00
      },
      {
        id: '2',
        customerName: 'Midcounties COOP',
        store: 'Store #9013',
        officerName: 'Emma White',
        date: '2025-01-29',
        amount: 1100.00
      },
      {
        id: '3',
        customerName: 'Midcounties COOP',
        store: 'Store #9014',
        officerName: 'Chris Taylor',
        date: '2025-01-28',
        amount: 2300.00
      }
    ]
  }
};

const tasks = [
  {
    id: '1',
    title: 'Review Security Protocols',
    description: 'Conduct a comprehensive review of current security protocols and identify areas for improvement.',
    assignee: 'John Smith',
    dueDate: new Date(2025, 1, 15),
    priority: 'high',
    status: 'in-progress'
  },
  {
    id: '2',
    title: 'Staff Training Session',
    description: 'Organize and conduct quarterly security training session for new staff members.',
    assignee: 'Sarah Johnson',
    dueDate: new Date(2025, 1, 20),
    priority: 'medium',
    status: 'pending'
  }
] as const;

const equipmentData = [
  { name: 'Laptops', value: 245, color: '#0ea5e9' },  // sky-500
  { name: 'Phones', value: 180, color: '#22c55e' },   // green-500
  { name: 'iPads', value: 120, color: '#f59e0b' },    // amber-500
  { name: 'Radios', value: 95, color: '#ef4444' },    // red-500
  { name: 'Other', value: 75, color: '#8b5cf6' }      // violet-500
];

const customers = [
  { id: 'customer1', name: 'Central England COOP' },
  { id: 'customer2', name: 'HOE COOP' },
  { id: 'customer3', name: 'Midcounties COOP' }
] as const;

const notifications = [
  {
    id: '1',
    title: 'New Incident Report',
    description: 'Location B reported unauthorized access attempt',
    time: '10 minutes ago',
    type: 'alert'
  },
  {
    id: '2',
    title: 'Guard Schedule Updated',
    description: 'Changes to night shift rotation for next week',
    time: '1 hour ago',
    type: 'info'
  }
]

const officerStats = [
  // Top Performers
  {
    id: '1',
    name: 'John Smith',
    incidents: 85,
    valueSaved: 145000,
    responseRate: 98,
    status: 'excellent'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    incidents: 78,
    valueSaved: 132000,
    responseRate: 97,
    status: 'excellent'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    incidents: 72,
    valueSaved: 128000,
    responseRate: 95,
    status: 'excellent'
  },
  {
    id: '4',
    name: 'Lisa Anderson',
    incidents: 65,
    valueSaved: 115000,
    responseRate: 94,
    status: 'good'
  },
  {
    id: '5',
    name: 'David Chen',
    incidents: 62,
    valueSaved: 108000,
    responseRate: 92,
    status: 'good'
  },
  // Non-Reporters and Needs Improvement
  {
    id: '6',
    name: 'Emily Davis',
    incidents: 25,
    valueSaved: 42000,
    responseRate: 75,
    status: 'needs-improvement'
  },
  {
    id: '7',
    name: 'Chris Brown',
    incidents: 18,
    valueSaved: 28000,
    responseRate: 45,
    status: 'non-reporter'
  },
  {
    id: '8',
    name: 'Alex Turner',
    incidents: 15,
    valueSaved: 22000,
    responseRate: 65,
    status: 'non-reporter'
  },
  {
    id: '9',
    name: 'Maria Garcia',
    incidents: 22,
    valueSaved: 35000,
    responseRate: 72,
    status: 'needs-improvement'
  },
  {
    id: '10',
    name: 'Tom Wilson',
    incidents: 12,
    valueSaved: 18000,
    responseRate: 40,
    status: 'non-reporter'
  }
] as const;

const Index = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [selectedCustomer, setSelectedCustomer] = React.useState<string>(customers[0].id);

  // Get current month to determine which 6-month window to show
  const currentMonth = new Date().getMonth(); // 0-11
  const isSecondHalf = currentMonth >= 6;

  // Get the current customer's data or use default data if no customer is selected
  const currentCustomerData = selectedCustomer ? customerData[selectedCustomer as keyof typeof customerData] : customerData.customer1;

  // Use the current customer's data
  const metrics = currentCustomerData.metrics;
  const allMonthlyIncidents = currentCustomerData.monthlyIncidents;
  const monthlyIncidents = isSecondHalf 
    ? allMonthlyIncidents.slice(6, 12)  // Jul-Dec
    : allMonthlyIncidents.slice(0, 6);   // Jan-Jun

  const incidentReports = currentCustomerData.incidentReports;

  const getMetricColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 ring-blue-600/10 dark:bg-blue-900/20 dark:text-blue-300',
      red: 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-900/20 dark:text-red-300',
      green: 'bg-green-50 text-green-700 ring-green-600/10 dark:bg-green-900/20 dark:text-green-300',
      yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-600/10 dark:bg-yellow-900/20 dark:text-yellow-300'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your dashboard</p>
        </div>
        <Select value={selectedCustomer} onValueChange={(value: string) => setSelectedCustomer(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          const gradients = {
            'Total Saved YTD': "from-slate-800 via-slate-700 to-slate-800",
            'Customer Satisfaction': "from-slate-800 via-indigo-900 to-slate-800",
            'Incidents Today': "from-slate-800 via-rose-900 to-slate-800",
            'Active Guards': "from-slate-800 via-blue-900 to-slate-800"
          }
          return (
            <Card key={metric.title} className={cn(
              `bg-gradient-to-br ${gradients[metric.title as keyof typeof gradients]} dark:from-slate-900 dark:to-slate-800 border-slate-600/50`,
              "transition-all hover:shadow-lg hover:-translate-y-0.5"
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {metric.value}
                </div>
                <p className={cn(
                  "text-xs",
                  metric.trend === 'up' ? 'text-emerald-300' : 'text-red-300'
                )}>
                  {metric.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tasks and Trends Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Tasks Section */}
        <Card className={cn(
          "bg-white dark:bg-slate-800",
          "transition-all hover:shadow-lg"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium">Recent Tasks</CardTitle>
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Incidents Chart */}
        <Card className={cn(
          "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
          "transition-all hover:shadow-lg"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div>
              <CardTitle className="text-lg font-medium dark:text-white">Incident Trends</CardTitle>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Monthly incident reports
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyIncidents} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incidentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false}
                    stroke="#334155" 
                    opacity={0.2} 
                  />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={true}
                    axisLine={true}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={true}
                    axisLine={true}
                    tickCount={5}
                    domain={[0, 60]}
                    padding={{ top: 20, bottom: 20 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg bg-slate-800 p-2 shadow-sm border border-slate-700">
                            <p className="text-sm text-white">{`${payload[0].value} Incidents`}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="incidents"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#incidentGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports and Equipment Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Incident Reports Table */}
        <Card className={cn(
          "bg-white dark:bg-slate-800",
          "transition-all hover:shadow-lg"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium">Recent Incident Reports</CardTitle>
            <Button variant="ghost" size="sm">
              View All Reports
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <IncidentTable data={incidentReports} />
          </CardContent>
        </Card>

        {/* Equipment Status Chart */}
        <Card className={cn(
          "bg-white dark:bg-slate-800",
          "transition-all hover:shadow-lg"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div>
              <CardTitle className="text-lg font-medium">Equipment Status</CardTitle>
              <p className="text-sm text-muted-foreground">
                Total Equipment: {equipmentData.reduce((acc, curr) => acc + curr.value, 0)} units
              </p>
            </div>
            <Button variant="ghost" size="sm">
              View Details
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={equipmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value})`}
                    labelLine={false}
                  >
                    {equipmentData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="stroke-background hover:opacity-80 transition-opacity"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const total = equipmentData.reduce((acc, curr) => acc + curr.value, 0);
                        const percentage = ((data.value / total) * 100).toFixed(1);
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-1 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Equipment
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {data.name}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Count
                                </span>
                                <span className="font-bold" style={{ color: data.color }}>
                                  {data.value} units ({percentage}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend 
                    verticalAlign="middle" 
                    align="right"
                    layout="vertical"
                    formatter={(value, entry: any) => (
                      <span className="text-sm">
                        <span style={{ color: entry.color }} className="font-medium">{value}</span>
                        <span className="text-muted-foreground ml-2">
                          ({entry.payload.value} units)
                        </span>
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Officer Performance Table */}
      <div className="mt-6">
        <Card className={cn(
          "bg-white dark:bg-slate-800",
          "transition-all hover:shadow-lg"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div>
              <CardTitle className="text-lg font-medium">Officer Performance</CardTitle>
              <p className="text-sm text-muted-foreground">
                Top performing officers and reporting status
              </p>
            </div>
            <Button variant="ghost" size="sm">
              View All Officers
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <OfficerPerformance data={officerStats} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Index
