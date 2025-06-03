import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
  Star,
  CheckCircle,
  FileText,
  Briefcase,
  MapPin,
  MessageSquare
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TaskCard } from '@/components/dashboard/TaskCard'
import { IncidentTable } from '@/components/dashboard/IncidentTable'
import { OfficerPerformance } from '@/components/dashboard/OfficerPerformance'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { cn } from '@/lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

// Customer-specific data
const customerData = {
  'customer1': {
    metrics: [
      { title: 'Total Saved YTD', value: '£196K', change: '+15%', trend: 'up', icon: Currency, color: 'green' },
      { title: 'Customer Satisfaction', value: '4.8/5', change: '+0.3', trend: 'up', icon: Star, color: 'yellow' },
      { title: 'Incidents Today', value: '8', change: '-3%', trend: 'down', icon: AlertCircle, color: 'red' },
      { title: 'Active Guards', value: '342', change: '+12%', trend: 'up', icon: Users, color: 'blue' }
    ],
    dailyIncidents: [
      { date: 'Mon', uniformOfficers: 12, storeDetectives: 8 },
      { date: 'Tue', uniformOfficers: 19, storeDetectives: 14 },
      { date: 'Wed', uniformOfficers: 15, storeDetectives: 11 },
      { date: 'Thu', uniformOfficers: 20, storeDetectives: 17 },
      { date: 'Fri', uniformOfficers: 25, storeDetectives: 20 },
      { date: 'Sat', uniformOfficers: 22, storeDetectives: 19 },
      { date: 'Sun', uniformOfficers: 18, storeDetectives: 15 }
    ],
    weeklyIncidents: [
      { week: 'Week 1', uniformOfficers: 42, storeDetectives: 35 },
      { week: 'Week 2', uniformOfficers: 38, storeDetectives: 30 },
      { week: 'Week 3', uniformOfficers: 45, storeDetectives: 36 },
      { week: 'Week 4', uniformOfficers: 40, storeDetectives: 32 }
    ],
    monthlyIncidents: [
      { month: 'Jan', uniformOfficers: 25, storeDetectives: 20 },
      { month: 'Feb', uniformOfficers: 23, storeDetectives: 18 },
      { month: 'Mar', uniformOfficers: 35, storeDetectives: 27 },
      { month: 'Apr', uniformOfficers: 20, storeDetectives: 15 },
      { month: 'May', uniformOfficers: 27, storeDetectives: 20 },
      { month: 'Jun', uniformOfficers: 15, storeDetectives: 11 },
      { month: 'Jul', uniformOfficers: 22, storeDetectives: 16 },
      { month: 'Aug', uniformOfficers: 28, storeDetectives: 21 },
      { month: 'Sep', uniformOfficers: 36, storeDetectives: 28 },
      { month: 'Oct', uniformOfficers: 35, storeDetectives: 27 },
      { month: 'Nov', uniformOfficers: 32, storeDetectives: 24 },
      { month: 'Dec', uniformOfficers: 28, storeDetectives: 21 }
    ],
    yearlyIncidents: [
      { year: '2019', uniformOfficers: 1800, storeDetectives: 1500 },
      { year: '2020', uniformOfficers: 2000, storeDetectives: 1650 },
      { year: '2021', uniformOfficers: 2200, storeDetectives: 1800 },
      { year: '2022', uniformOfficers: 2400, storeDetectives: 1950 }
    ],
    incidentReports: [
      {
        id: 1,
        type: 'Theft',
        location: 'Store 123',
        date: '2024-03-10',
        time: '14:30',
        status: 'resolved',
        value: 450,
        description: 'Shoplifting incident at electronics section'
      },
      {
        id: 2,
        type: 'Vandalism',
        location: 'Store 456',
        date: '2024-03-09',
        time: '16:45',
        status: 'pending',
        value: 1200,
        description: 'Graffiti on store exterior wall'
      },
      {
        id: 3,
        type: 'Assault',
        location: 'Store 789',
        date: '2024-03-08',
        time: '11:15',
        status: 'investigating',
        value: 0,
        description: 'Verbal altercation between customers'
      }
    ]
  }
}

// Mock tasks data
const tasks = [
  {
    id: 1,
    title: "Review incident reports",
    dueDate: "2024-03-15",
    priority: "high",
    status: "pending"
  },
  {
    id: 2,
    title: "Update security protocols",
    dueDate: "2024-03-20",
    priority: "medium",
    status: "in-progress"
  },
  {
    id: 3,
    title: "Staff training session",
    dueDate: "2024-03-25",
    priority: "low",
    status: "scheduled"
  }
]

// Mock customers data
const customers = [
  { id: 'customer1', name: 'Central England Co-op' },
  { id: 'customer2', name: 'Midcounties Co-op' },
  { id: 'customer3', name: 'Heart of England Co-op' }
]

// Recent tasks data
const recentTasks = [
  {
    id: '1',
    type: 'Task Completed',
    title: 'John Smith completed security audit task',
    time: '40 mins ago',
    icon: CheckCircle,
    iconColor: 'text-emerald-500 bg-emerald-100'
  },
  {
    id: '2',
    type: 'New Contract',
    title: 'Emma White added Tesco Express contract',
    time: '1 day ago',
    icon: FileText,
    iconColor: 'text-violet-500 bg-violet-100'
  },
  {
    id: '3',
    type: 'Report Published',
    title: 'Lisa Chen published monthly security report',
    time: '40 mins ago',
    icon: FileText,
    iconColor: 'text-cyan-500 bg-cyan-100'
  },
  {
    id: '4',
    type: 'Site Visit Scheduled',
    title: 'Michael Brown scheduled visit to Store #4526',
    time: '1 day ago',
    icon: MapPin,
    iconColor: 'text-amber-500 bg-amber-100'
  },
  {
    id: '5',
    type: 'Comment Added',
    title: 'David Lee added comment on incident report #2345',
    time: '1 day ago',
    icon: MessageSquare,
    iconColor: 'text-emerald-500 bg-emerald-100'
  }
]

function DashboardPage() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path
  const [selectedCustomer, setSelectedCustomer] = React.useState<string>(customers[0].id)
  const customer = customerData[selectedCustomer as keyof typeof customerData]
  const [activePeriod, setActivePeriod] = React.useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly')

  // Log customer selection and data
  React.useEffect(() => {
    console.log('Selected customer:', selectedCustomer)
    console.log('Customer data:', customer)
    console.log('Incident reports:', customer?.incidentReports)
  }, [selectedCustomer, customer])

  // Get the appropriate data based on selected time period
  const getChartData = () => {
    if (!customer) return []
    
    switch (activePeriod) {
      case 'Daily':
        return customer.dailyIncidents || []
      case 'Weekly':
        return customer.weeklyIncidents || []
      case 'Monthly':
        return customer.monthlyIncidents || []
      case 'Yearly':
        return customer.yearlyIncidents || []
      default:
        return customer.monthlyIncidents || []
    }
  }

  // Get x-axis key based on active period
  const getDataKey = () => {
    switch (activePeriod) {
      case 'Daily': return 'date'
      case 'Weekly': return 'week'
      case 'Monthly': return 'month'
      case 'Yearly': return 'year'
      default: return 'month'
    }
  }

  // Get current chart data
  const chartData = getChartData()
  const dataKey = getDataKey()

  // Derive data for component with safe defaults
  const metrics = customer?.metrics || []
  const incidentReports = customer?.incidentReports || []
  
  // In a real app, we would fetch user-specific tasks from an API or context
  // This simulates loading user-specific tasks, which could be empty
  const [userTasks, setUserTasks] = React.useState<typeof tasks | []>([])
  
  // Simulate loading tasks (in a real app, this would be an API call)
  React.useEffect(() => {
    // Simulate API call to get tasks
    const loadTasks = () => {
      // For demo purposes: randomly decide if the user has tasks
      const hasAssignedTasks = Math.random() > 0.3 // 70% chance to have tasks
      
      if (hasAssignedTasks) {
        setUserTasks(tasks)
      } else {
        setUserTasks([])
      }
    }
    
    loadTasks()
    
    // In a real app, we would include dependencies like user ID
  }, [])
  
  // Officer stats for the table
  const officerStats = [
    {
      id: '1',
      name: 'John Smith',
      incidents: 45,
      valueSaved: 25600,
      responseRate: 92,
      status: 'excellent'
    },
    {
      id: '2',
      name: 'Jane Doe',
      incidents: 38,
      valueSaved: 19200,
      responseRate: 85,
      status: 'good'
    },
    {
      id: '3',
      name: 'David Johnson',
      incidents: 12,
      valueSaved: 5300,
      responseRate: 45,
      status: 'needs-improvement'
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      incidents: 5,
      valueSaved: 2100,
      responseRate: 20,
      status: 'non-reporter'
    }
  ] as const

  // Define background colors for each stat card based on type
  const getStatCardColor = (color: string) => {
    switch(color) {
      case 'green': return 'bg-emerald-800'
      case 'yellow': return 'bg-amber-800'
      case 'red': return 'bg-rose-800'
      case 'blue': return 'bg-blue-800'
      default: return 'bg-slate-800'
    }
  }

  // Map incident reports to match IncidentTable's expected format with safe access
  const formattedIncidentReports = incidentReports.map(report => ({
    id: report.id.toString(),
    customerName: report.type,  // Using type as customer name since we don't have it
    store: report.location,
    officerName: "N/A",  // Since we don't have officer name in the original data
    date: report.date,
    amount: report.value
  }))

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      <div className="container mx-auto px-2 md:px-4 space-y-4 max-w-full md:max-w-7xl">
        {/* Customer Selection */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4">
          <h1 className="text-base font-semibold md:text-lg lg:text-xl">Dashboard</h1>
          <div className="w-full md:w-auto">
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="w-full text-sm md:w-[200px]">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-sm">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          {/* Total Saved YTD */}
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">Total Saved YTD</CardTitle>
                <Currency className="h-4 w-4 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£175K</div>
              <div className="flex items-center mt-1">
                <span className="flex items-center text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +12%
                </span>
                <span className="ml-2 text-xs opacity-70">increase</span>
              </div>
              <div className="text-xs opacity-70 mt-1">Jan 01 - Jan 10</div>
            </CardContent>
          </Card>

          {/* Customer Satisfaction */}
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                <Star className="h-4 w-4 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.9/5</div>
              <div className="flex items-center mt-1">
                <span className="flex items-center text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +0.4
                </span>
                <span className="ml-2 text-xs opacity-70">increase</span>
              </div>
              <div className="text-xs opacity-70 mt-1">Jan 01 - Jan 10</div>
            </CardContent>
          </Card>

          {/* Incidents Today */}
          <Card className="bg-gradient-to-br from-rose-400 to-rose-500 text-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">Incidents Today</CardTitle>
                <AlertCircle className="h-4 w-4 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <div className="flex items-center mt-1">
                <span className="flex items-center text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  -15%
                </span>
                <span className="ml-2 text-xs opacity-70">decrease</span>
              </div>
              <div className="text-xs opacity-70 mt-1">Jan 01 - Jan 10</div>
            </CardContent>
          </Card>

          {/* Active Guards */}
          <Card className="bg-gradient-to-br from-blue-400 to-blue-500 text-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">Active Guards</CardTitle>
                <Users className="h-4 w-4 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">280</div>
              <div className="flex items-center mt-1">
                <span className="flex items-center text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +8%
                </span>
                <span className="ml-2 text-xs opacity-70">increase</span>
              </div>
              <div className="text-xs opacity-70 mt-1">Jan 01 - Jan 10</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {/* Left Column - Charts */}
          <div className="lg:col-span-5 space-y-4">
            {/* Incident Reports Chart */}
            <Card>
              <CardHeader className="p-2 md:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-base font-medium">Incident Reports</CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                      <span className="text-gray-600">Uniform Officers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div>
                      <span className="text-gray-600">Store Detectives</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="bg-gray-100 rounded-lg p-0.5 flex text-xs md:text-sm">
                    {["Daily", "Weekly", "Monthly", "Yearly"].map((period) => (
                      <button
                        key={period}
                        className={`px-3 py-1 rounded-md transition-colors ${
                          period === activePeriod 
                            ? "bg-white shadow-sm text-emerald-500 font-medium" 
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setActivePeriod(period as typeof activePeriod)}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-2 md:p-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={customer?.monthlyIncidents}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="uniformOfficersGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={2.5} />
                          <stop offset="100%" stopColor="#10B981" stopOpacity={0.3} />
                        </linearGradient>
                        <linearGradient id="storeDetectivesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity={2.5} />
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-gray-500"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-gray-500"
                        ticks={[0, 9, 18, 27, 36]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="uniformOfficers"
                        stackId="1"
                        stroke="#10B981"
                        fill="url(#uniformOfficersGradient)"
                        name="Uniform Officers"
                      />
                      <Area
                        type="monotone"
                        dataKey="storeDetectives"
                        stackId="1"
                        stroke="#F59E0B"
                        fill="url(#storeDetectivesGradient)"
                        name="Store Detectives"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Incidents Table */}
            <Card>
              <CardHeader className="p-2 md:p-4">
                <CardTitle className="text-base font-medium">Recent Incidents</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-4 text-sm text-gray-500">
                  Data count: 6 incidents
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500">
                        <th className="pb-2">Customer</th>
                        <th className="pb-2">Store</th>
                        <th className="pb-2">Officer</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {customer?.incidentReports.map((report) => (
                        <tr key={report.id} className="border-t">
                          <td className="py-3">Midcounties COOP</td>
                          <td className="py-3">{report.location}</td>
                          <td className="py-3">{report.type}</td>
                          <td className="py-3">{report.date}</td>
                          <td className="py-3 text-right">£{report.value.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Recent Tasks */}
            <Card>
              <CardHeader className="p-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium">Recent Tasks</CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="flex gap-3">
                      <div className={`p-2 rounded-full ${task.iconColor}`}>
                        <task.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{task.type}</div>
                        <div className="text-sm text-gray-500">{task.title}</div>
                        <div className="text-xs text-gray-400 mt-1">{task.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Equipment Distribution */}
            <Card>
              <CardHeader className="p-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium">Equipment Distribution</CardTitle>
                  <Select defaultValue="All">
                    <SelectTrigger className="w-24 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Region1">Region 1</SelectItem>
                      <SelectItem value="Region2">Region 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Laptops', value: 245, color: '#0ea5e9' },
                          { name: 'Phones', value: 180, color: '#22c55e' },
                          { name: 'iPads', value: 120, color: '#f59e0b' },
                          { name: 'Radios', value: 95, color: '#ef4444' },
                          { name: 'Other', value: 75, color: '#8b5cf6' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {[
                          { name: 'Laptops', value: 245, color: '#0ea5e9' },
                          { name: 'Phones', value: 180, color: '#22c55e' },
                          { name: 'iPads', value: 120, color: '#f59e0b' },
                          { name: 'Radios', value: 95, color: '#ef4444' },
                          { name: 'Other', value: 75, color: '#8b5cf6' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#0ea5e9]" />
                      <span>Laptops</span>
                      <span className="text-gray-500 ml-auto">245</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                      <span>Phones</span>
                      <span className="text-gray-500 ml-auto">180</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                      <span>iPads</span>
                      <span className="text-gray-500 ml-auto">120</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                      <span>Radios</span>
                      <span className="text-gray-500 ml-auto">95</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
                      <span>Other</span>
                      <span className="text-gray-500 ml-auto">75</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Total Devices</span>
                      <span className="text-gray-500">715</span>
                    </div>
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

export default DashboardPage