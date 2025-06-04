import React, { Suspense } from 'react'
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePageAccess } from "@/contexts/PageAccessContext"

// Lazy load the dashboard components
const OfficerDashboard = React.lazy(() => import('./Dashboard/OfficerDashboard'))
const CustomerDashboard = React.lazy(() => import('./Dashboard/CustomerDashboard'))

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
      { month: 'Jan', uniformOfficers: 40, storeDetectives: 32 },
      { month: 'Feb', uniformOfficers: 30, storeDetectives: 24 },
      { month: 'Mar', uniformOfficers: 45, storeDetectives: 36 },
      { month: 'Apr', uniformOfficers: 25, storeDetectives: 20 },
      { month: 'May', uniformOfficers: 35, storeDetectives: 28 },
      { month: 'Jun', uniformOfficers: 20, storeDetectives: 16 },
      { month: 'Jul', uniformOfficers: 28, storeDetectives: 22 },
      { month: 'Aug', uniformOfficers: 32, storeDetectives: 26 },
      { month: 'Sep', uniformOfficers: 38, storeDetectives: 30 },
      { month: 'Oct', uniformOfficers: 42, storeDetectives: 34 },
      { month: 'Nov', uniformOfficers: 36, storeDetectives: 29 },
      { month: 'Dec', uniformOfficers: 30, storeDetectives: 24 }
    ],
    yearlyIncidents: [
      { year: '2020', uniformOfficers: 280, storeDetectives: 224 },
      { year: '2021', uniformOfficers: 320, storeDetectives: 256 },
      { year: '2022', uniformOfficers: 350, storeDetectives: 280 },
      { year: '2023', uniformOfficers: 375, storeDetectives: 300 },
      { year: '2024', uniformOfficers: 401, storeDetectives: 321 }
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
    dailyIncidents: [
      { date: 'Mon', uniformOfficers: 10, storeDetectives: 8 },
      { date: 'Tue', uniformOfficers: 15, storeDetectives: 12 },
      { date: 'Wed', uniformOfficers: 13, storeDetectives: 10 },
      { date: 'Thu', uniformOfficers: 18, storeDetectives: 14 },
      { date: 'Fri', uniformOfficers: 22, storeDetectives: 18 },
      { date: 'Sat', uniformOfficers: 20, storeDetectives: 16 },
      { date: 'Sun', uniformOfficers: 16, storeDetectives: 13 }
    ],
    weeklyIncidents: [
      { week: 'Week 1', uniformOfficers: 38, storeDetectives: 30 },
      { week: 'Week 2', uniformOfficers: 35, storeDetectives: 28 },
      { week: 'Week 3', uniformOfficers: 40, storeDetectives: 32 },
      { week: 'Week 4', uniformOfficers: 37, storeDetectives: 30 }
    ],
    monthlyIncidents: [
      { month: 'Jan', uniformOfficers: 35, storeDetectives: 28 },
      { month: 'Feb', uniformOfficers: 28, storeDetectives: 22 },
      { month: 'Mar', uniformOfficers: 40, storeDetectives: 32 },
      { month: 'Apr', uniformOfficers: 22, storeDetectives: 18 },
      { month: 'May', uniformOfficers: 30, storeDetectives: 24 },
      { month: 'Jun', uniformOfficers: 18, storeDetectives: 14 },
      { month: 'Jul', uniformOfficers: 25, storeDetectives: 20 },
      { month: 'Aug', uniformOfficers: 30, storeDetectives: 24 },
      { month: 'Sep', uniformOfficers: 35, storeDetectives: 28 },
      { month: 'Oct', uniformOfficers: 38, storeDetectives: 30 },
      { month: 'Nov', uniformOfficers: 32, storeDetectives: 26 },
      { month: 'Dec', uniformOfficers: 28, storeDetectives: 22 }
    ],
    yearlyIncidents: [
      { year: '2020', uniformOfficers: 260, storeDetectives: 208 },
      { year: '2021', uniformOfficers: 290, storeDetectives: 232 },
      { year: '2022', uniformOfficers: 320, storeDetectives: 256 },
      { year: '2023', uniformOfficers: 345, storeDetectives: 276 },
      { year: '2024', uniformOfficers: 361, storeDetectives: 289 }
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
    dailyIncidents: [
      { date: 'Mon', uniformOfficers: 8, storeDetectives: 6 },
      { date: 'Tue', uniformOfficers: 12, storeDetectives: 10 },
      { date: 'Wed', uniformOfficers: 10, storeDetectives: 8 },
      { date: 'Thu', uniformOfficers: 14, storeDetectives: 11 },
      { date: 'Fri', uniformOfficers: 18, storeDetectives: 14 },
      { date: 'Sat', uniformOfficers: 16, storeDetectives: 13 },
      { date: 'Sun', uniformOfficers: 13, storeDetectives: 10 }
    ],
    weeklyIncidents: [
      { week: 'Week 1', uniformOfficers: 32, storeDetectives: 26 },
      { week: 'Week 2', uniformOfficers: 30, storeDetectives: 24 },
      { week: 'Week 3', uniformOfficers: 35, storeDetectives: 28 },
      { week: 'Week 4', uniformOfficers: 33, storeDetectives: 26 }
    ],
    monthlyIncidents: [
      { month: 'Jan', uniformOfficers: 30, storeDetectives: 24 },
      { month: 'Feb', uniformOfficers: 25, storeDetectives: 20 },
      { month: 'Mar', uniformOfficers: 35, storeDetectives: 28 },
      { month: 'Apr', uniformOfficers: 20, storeDetectives: 16 },
      { month: 'May', uniformOfficers: 28, storeDetectives: 22 },
      { month: 'Jun', uniformOfficers: 15, storeDetectives: 12 },
      { month: 'Jul', uniformOfficers: 22, storeDetectives: 18 },
      { month: 'Aug', uniformOfficers: 26, storeDetectives: 21 },
      { month: 'Sep', uniformOfficers: 32, storeDetectives: 26 },
      { month: 'Oct', uniformOfficers: 36, storeDetectives: 29 },
      { month: 'Nov', uniformOfficers: 30, storeDetectives: 24 },
      { month: 'Dec', uniformOfficers: 25, storeDetectives: 20 }
    ],
    yearlyIncidents: [
      { year: '2020', uniformOfficers: 220, storeDetectives: 176 },
      { year: '2021', uniformOfficers: 250, storeDetectives: 200 },
      { year: '2022', uniformOfficers: 280, storeDetectives: 224 },
      { year: '2023', uniformOfficers: 300, storeDetectives: 240 },
      { year: '2024', uniformOfficers: 324, storeDetectives: 259 }
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

const TestComponents = () => {
  return (
    <div className="space-y-6 p-4 border border-gray-200 rounded-md my-4">
      <h2 className="text-xl font-bold">Test Components</h2>
      
      <div>
        <h3 className="font-medium mb-2">Accordion Test</h3>
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is this working?</AccordionTrigger>
            <AccordionContent>
              Yes. This is our custom accordion component.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h3 className="font-medium mb-2">Dropdown Test</h3>
        <DropdownMenu>
          <DropdownMenuTrigger className="border rounded-md px-4 py-2">
            Click me
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Item 1
            </DropdownMenuItem>
            <DropdownMenuItem>
              Item 2
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div>
        <h3 className="font-medium mb-2">ScrollArea Test</h3>
        <ScrollArea className="h-32 w-full border rounded-md">
          <div className="p-4">
            <h4>Scrollable Content</h4>
            <p>This is a test of the ScrollArea component.</p>
            <p>Scroll down to see more content.</p>
            <div className="h-64 bg-gray-100 mt-2 p-4">
              Tall content to enable scrolling
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

const Index = () => {
  const location = useLocation();
  const { currentRole, isTestMode, testRole } = usePageAccess();
  const effectiveRole = isTestMode && testRole ? testRole : currentRole;

  // Show appropriate dashboard based on role
  if (effectiveRole === 'advantage-officer' || effectiveRole === 'advantage-ho') {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="space-y-4 text-center">
            <div className="text-lg font-medium">Loading Officer Dashboard...</div>
            <div className="text-sm text-gray-500">Please wait</div>
          </div>
        </div>
      }>
        <OfficerDashboard />
      </Suspense>
    )
  } else if (effectiveRole === 'customer-site' || effectiveRole === 'customer-ho') {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="space-y-4 text-center">
            <div className="text-lg font-medium">Loading Customer Dashboard...</div>
            <div className="text-sm text-gray-500">Please wait</div>
          </div>
        </div>
      }>
        <CustomerDashboard userRole={effectiveRole as 'customer-site' | 'customer-ho'} />
      </Suspense>
    )
  }

  const [selectedCustomer, setSelectedCustomer] = React.useState<string>(customers[2].id);
  const customer = customerData[selectedCustomer as keyof typeof customerData];
  const [activePeriod, setActivePeriod] = React.useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly');

  // Log customer selection and data
  React.useEffect(() => {
    console.log('Selected customer:', selectedCustomer);
    console.log('Customer data:', customer);
    console.log('Incident reports:', customer.incidentReports);
  }, [selectedCustomer, customer]);

  // Get the appropriate data based on selected time period
  const getChartData = () => {
    switch (activePeriod) {
      case 'Daily':
        return customer.dailyIncidents;
      case 'Weekly':
        return customer.weeklyIncidents;
      case 'Monthly':
        return customer.monthlyIncidents;
      case 'Yearly':
        return customer.yearlyIncidents;
      default:
        return customer.monthlyIncidents;
    }
  };

  // Get x-axis key based on active period
  const getDataKey = () => {
    switch (activePeriod) {
      case 'Daily': return 'date';
      case 'Weekly': return 'week';
      case 'Monthly': return 'month';
      case 'Yearly': return 'year';
      default: return 'month';
    }
  };

  // Get current chart data
  const chartData = getChartData();
  const dataKey = getDataKey();

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {metrics.map((metric, index) => {
            // Define gradient backgrounds based on color
            const getGradientClass = (color: string) => {
              switch(color) {
                case 'green': return 'bg-gradient-to-br from-emerald-500 to-emerald-700';
                case 'yellow': return 'bg-gradient-to-br from-amber-500 to-amber-700';
                case 'red': return 'bg-gradient-to-br from-rose-400 to-rose-600';
                case 'blue': return 'bg-gradient-to-br from-blue-400 to-blue-600';
                default: return 'bg-gradient-to-br from-slate-600 to-slate-800';
              }
            };
            
            // Define visualization element based on metric type
            const renderVisualization = (color: string) => {
              switch(color) {
                case 'green': 
                  return (
                    <div className="absolute bottom-3 right-3 opacity-30">
                      <svg width="48" height="24" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 24L8 12L16 18L32 6L40 12L48 0" stroke="white" strokeWidth="2" />
                      </svg>
                    </div>
                  );
                case 'yellow': 
                  return (
                    <div className="absolute bottom-3 right-3 opacity-30">
                      <svg width="48" height="24" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 18L8 12L16 16L24 4L32 8L40 2L48 12" stroke="white" strokeWidth="2" />
                      </svg>
                    </div>
                  );
                case 'red': 
                  return (
                    <div className="absolute bottom-3 right-3 opacity-30">
                      <svg width="48" height="24" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="6" width="6" height="18" rx="1" fill="white" opacity="0.3" />
                        <rect x="10" y="12" width="6" height="12" rx="1" fill="white" opacity="0.4" />
                        <rect x="20" y="0" width="6" height="24" rx="1" fill="white" opacity="0.6" />
                        <rect x="30" y="8" width="6" height="16" rx="1" fill="white" opacity="0.3" />
                        <rect x="40" y="4" width="6" height="20" rx="1" fill="white" opacity="0.4" />
                      </svg>
                    </div>
                  );
                case 'blue': 
                  return (
                    <div className="absolute bottom-3 right-3 opacity-30">
                      <svg width="48" height="24" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 13C8.66667 7.66667 13 8.33333 16 9C19 9.66667 20.6667 12.3333 24 13C27.3333 13.6667 31.6667 13 38 5" stroke="white" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </div>
                  );
                default:
                  return null;
              }
            };
            
            return (
              <Card 
                key={index} 
                className={`min-w-[140px] ${getGradientClass(metric.color)} text-white border-0 shadow-md overflow-hidden relative`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-4 pb-2 md:pb-3">
                  <CardTitle className="text-xs font-medium md:text-sm text-white">
                    {metric.title}
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <metric.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-1 md:pt-2 z-10 relative">
                  <div className="text-xl font-bold md:text-2xl lg:text-3xl text-white">{metric.value}</div>
                  <div className="flex items-center mt-1">
                    <span className={`text-xs flex items-center px-2 py-0.5 rounded-full ${
                      metric.trend === 'up' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-white/20 text-white'
                    }`}>
                      {metric.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {metric.change}
                    </span>
                    <span className="ml-2 text-xs text-white/70">{metric.trend === 'up' ? 'increase' : 'decrease'}</span>
                  </div>
                  <div className="text-xs text-white/60 mt-1">Jan 01 - Jan 10</div>
                  {renderVisualization(metric.color)}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          {/* Tasks and Incidents Section */}
          <div className="lg:col-span-5 space-y-4">
            {/* Monthly Incidents Chart - Improved to Incident Reports with time toggles */}
            <Card>
              <CardHeader className="p-2 md:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <CardTitle className="text-base font-medium md:text-lg lg:text-xl">Incident Reports</CardTitle>
                <div className="flex items-center space-x-1">
                  <div className="bg-gray-100 rounded-lg p-0.5 flex text-xs md:text-sm">
                    {["Daily", "Weekly", "Monthly", "Yearly"].map((period, index) => (
                      <button
                        key={period}
                        className={`px-3 py-1 rounded-md transition-colors ${
                          period === activePeriod 
                            ? "bg-white shadow-sm text-emerald-500 font-medium" 
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setActivePeriod(period as 'Daily' | 'Weekly' | 'Monthly' | 'Yearly')}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[200px] md:h-[280px] lg:h-[320px] p-2 md:p-4">
                <div className="flex items-center justify-end mb-2 space-x-4">
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block mr-1"></span>
                    <span className="text-xs text-gray-500">Uniform Officers</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block mr-1"></span>
                    <span className="text-xs text-gray-500">Store Detectives</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={chartData} 
                    margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorUniformOfficers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorStoreDetectives" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey={dataKey} 
                      tick={{ fontSize: 10, fill: '#6B7280' }} 
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '0.5rem', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
                        border: 'none', 
                        fontSize: '0.75rem' 
                      }}
                      itemStyle={{ padding: '2px 0' }}
                      formatter={(value) => [`${value}`, '']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Area
                      type="monotone"
                      name="Uniform Officers"
                      dataKey="uniformOfficers"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorUniformOfficers)"
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      name="Store Detectives"
                      dataKey="storeDetectives"
                      stroke="#F59E0B"
                      fillOpacity={1}
                      fill="url(#colorStoreDetectives)"
                      activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2, fill: 'white' }}
                      strokeWidth={2}
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
                <div className="px-2 pb-4 md:px-4 overflow-visible">
                  <IncidentTable data={incidentReports.slice()} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Recent Tasks - Replaces Tasks */}
            <Card>
              <CardHeader className="p-2 md:p-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium md:text-lg lg:text-xl">Recent Tasks</CardTitle>
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
              <CardContent className="p-0">
                <div className="divide-y">
                  {/* Activity 1 */}
                  <div className="flex items-start gap-3 p-3 hover:bg-slate-50">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-rose-500 text-white">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-slate-900">Task Completed</p>
                        <span className="text-xs text-slate-500">40 mins ago</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">John Smith completed security audit task</p>
                    </div>
                  </div>

                  {/* Activity 2 */}
                  <div className="flex items-start gap-3 p-3 hover:bg-slate-50">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-violet-500 text-white">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-slate-900">New Contract</p>
                        <span className="text-xs text-slate-500">1 day ago</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">Emma White added Tesco Express contract</p>
                    </div>
                  </div>

                  {/* Activity 3 */}
                  <div className="flex items-start gap-3 p-3 hover:bg-slate-50">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500 text-white">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-slate-900">Report Published</p>
                        <span className="text-xs text-slate-500">40 mins ago</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">Lisa Chen published monthly security report</p>
                    </div>
                  </div>

                  {/* Activity 4 */}
                  <div className="flex items-start gap-3 p-3 hover:bg-slate-50">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-slate-900">Site Visit Scheduled</p>
                        <span className="text-xs text-slate-500">1 day ago</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">Michael Brown scheduled visit to Store #4526</p>
                    </div>
                  </div>

                  {/* Activity 5 */}
                  <div className="flex items-start gap-3 p-3 hover:bg-slate-50">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-slate-900">Comment Added</p>
                        <span className="text-xs text-slate-500">1 day ago</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">David Lee added comment on incident report #2345</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Equipment Distribution - Modernized */}
            <Card className="overflow-hidden">
              <CardHeader className="p-2 md:p-4 flex flex-row items-center justify-between bg-gradient-to-r from-slate-50 to-white border-b">
                <CardTitle className="text-base font-medium md:text-lg lg:text-xl">Equipment Distribution</CardTitle>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[100px] h-7 text-xs border-slate-200">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Devices</SelectItem>
                    <SelectItem value="active" className="text-xs">Active Only</SelectItem>
                    <SelectItem value="inactive" className="text-xs">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="pt-5 px-2 pb-2 md:pt-6 md:px-4 md:pb-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-full md:w-1/2 h-[180px] sm:h-[200px] md:h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={equipmentData}
                      cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                          cornerRadius={4}
                          stroke="transparent"
                    >
                      {equipmentData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              className="drop-shadow-sm hover:opacity-90 transition-opacity"
                            />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} units`, name]} 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            borderRadius: '0.5rem', 
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
                            border: 'none', 
                            fontSize: '0.75rem',
                            padding: '8px'
                          }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2">
                    <div className="divide-y">
                      {equipmentData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded mr-2" 
                              style={{ backgroundColor: item.color }} 
                            />
                            <span className="text-sm text-slate-700">{item.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-slate-900">{item.value}</span>
                            <span className="text-xs text-slate-500 ml-1">units</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Total Devices</span>
                        <span className="text-base font-semibold text-slate-900">
                          {equipmentData.reduce((sum, item) => sum + item.value, 0)}
                        </span>
                      </div>
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

export default Index