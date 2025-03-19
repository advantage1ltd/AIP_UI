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
  Star
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
      },
      {
        id: '4',
        customerName: 'Midcounties COOP',
        store: 'Store #9015',
        officerName: 'Rachel Parker',
        date: '2025-01-27',
        amount: 1850.00
      },
      {
        id: '5',
        customerName: 'Midcounties COOP',
        store: 'Store #9016',
        officerName: 'Mark Thompson',
        date: '2025-01-26',
        amount: 2100.00
      },
      {
        id: '6',
        customerName: 'Midcounties COOP',
        store: 'Store #9017',
        officerName: 'Sophie Anderson',
        date: '2025-01-25',
        amount: 1950.00
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
  const [selectedCustomer, setSelectedCustomer] = React.useState<string>(customers[2].id);
  const customer = customerData[selectedCustomer as keyof typeof customerData];

  // Log customer selection and data
  React.useEffect(() => {
    console.log('Selected customer:', selectedCustomer);
    console.log('Customer data:', customer);
    console.log('Incident reports:', customer.incidentReports);
  }, [selectedCustomer, customer]);

  // Get current month to determine which 6-month window to show
  const currentMonth = new Date().getMonth();
  const lastSixMonths = customer.monthlyIncidents.slice(
    currentMonth >= 6 ? currentMonth - 6 : 0,
    currentMonth >= 6 ? currentMonth : 6
  );

  // Derive data for component
  const { metrics, incidentReports } = customer;
  
  // In a real app, we would fetch user-specific tasks from an API or context
  // This simulates loading user-specific tasks, which could be empty
  const [userTasks, setUserTasks] = React.useState<typeof tasks | []>([]);
  
  // Simulate loading tasks (in a real app, this would be an API call)
  React.useEffect(() => {
    // Simulate API call to get tasks
    const loadTasks = () => {
      // For demo purposes: randomly decide if the user has tasks
      const hasAssignedTasks = Math.random() > 0.3; // 70% chance to have tasks
      
      if (hasAssignedTasks) {
        setUserTasks(tasks);
      } else {
        setUserTasks([]);
      }
    };
    
    loadTasks();
    
    // In a real app, we would include dependencies like user ID
  }, []);
  
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
  ] as const;

  // Define background colors for each stat card based on type
  const getStatCardColor = (color: string) => {
    switch(color) {
      case 'green': return 'bg-emerald-800';
      case 'yellow': return 'bg-amber-800';
      case 'red': return 'bg-rose-800';
      case 'blue': return 'bg-blue-800';
      default: return 'bg-slate-800';
    }
  };

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
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          {metrics.map((metric, index) => {
            // Define background colors for each stat card
            const bgColors = {
              green: 'bg-emerald-800',
              yellow: 'bg-amber-800',
              red: 'bg-rose-800',
              blue: 'bg-blue-800'
            };
            
            return (
              <Card 
                key={index} 
                className={`min-w-[140px] ${getStatCardColor(metric.color)} text-white border-0 shadow-md`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 md:p-4">
                  <CardTitle className="text-xs font-medium md:text-sm text-white">
                    {metric.title}
                  </CardTitle>
                  <metric.icon className="h-4 w-4 text-white" />
                </CardHeader>
                <CardContent className="p-2 md:p-4">
                  <div className="text-base font-bold md:text-lg lg:text-xl text-white">{metric.value}</div>
                  <p className={`text-xs flex items-center ${metric.trend === 'up' ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {metric.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {metric.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          {/* Tasks and Incidents Section */}
          <div className="lg:col-span-5 space-y-4">
            {/* Monthly Incidents Chart */}
            <Card>
              <CardHeader className="p-2 md:p-4">
                <CardTitle className="text-base font-medium md:text-lg lg:text-xl">Monthly Incidents</CardTitle>
              </CardHeader>
              <CardContent className="h-[160px] md:h-[250px] lg:h-[300px] p-2 md:p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={lastSixMonths} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 8 }} />
                    <YAxis tick={{ fontSize: 8 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="incidents"
                      stroke="#0ea5e9"
                      fillOpacity={1}
                      fill="url(#colorIncidents)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Incidents */}
            <Card>
              <CardHeader className="p-2 md:p-4">
                <CardTitle className="text-base font-medium md:text-lg lg:text-xl">Recent Incidents</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Debug data info */}
                <div className="p-2 text-xs text-muted-foreground">
                  Data count: {incidentReports.length} incidents
                </div>
                <div className="overflow-visible">
                  <IncidentTable data={incidentReports.slice()} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tasks - Only show if there are tasks or if we explicitly want to show the empty state */}
            <Card>
              <CardHeader className="p-2 md:p-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium md:text-lg lg:text-xl">Tasks</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild 
                  className="text-xs h-8 px-2"
                >
                  <Link to="/action-calendar">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    View All
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-2 space-y-2 md:p-4">
                {userTasks.length > 0 ? (
                  userTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                    <Clock className="h-10 w-10 mb-2 text-muted-foreground/50" />
                    <p className="text-sm">No tasks assigned</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild 
                      className="mt-4"
                    >
                      <Link to="/action-calendar">
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add New Task
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Equipment Distribution */}
            <Card>
              <CardHeader className="p-2 md:p-4">
                <CardTitle className="text-base font-medium md:text-lg lg:text-xl">Equipment Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[240px] md:h-[240px] lg:h-[280px] p-2 md:p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={equipmentData}
                      cx="50%"
                      cy="45%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      fontSize={10}
                    >
                      {equipmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={1} />
                      ))}
                    </Pie>
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                      wrapperStyle={{ 
                        fontSize: '11px', 
                        paddingTop: '15px',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center'
                      }}
                      iconSize={10}
                      iconType="circle"
                    />
                    <Tooltip 
                      formatter={(value, name) => [`${value} units`, name]} 
                      contentStyle={{ fontSize: '11px', padding: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Index