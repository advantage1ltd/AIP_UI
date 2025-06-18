import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  AlertCircle,
  Star,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  FileText,
  TrendingUp,
  CheckCircle,
  Building2,
  Store,
  ChevronLeft,
  ChevronRightIcon
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts'
import { cn } from '@/lib/utils'
import { IncidentTable } from '@/components/dashboard/IncidentTable'
import { DashboardGreeting } from '@/components/dashboard/DashboardGreeting'

// Types and Interfaces
interface CustomerStoreData {
  name: string
  metrics: {
    [key in CustomerRole]: Metric[]
  }
  incidentData: {
    daily: IncidentDataPoint[]
    weekly: IncidentDataPoint[]
    monthly: IncidentDataPoint[]
    yearly: IncidentDataPoint[]
  }
  recentIncidents: RecentIncident[]
}

type CustomerRole = 'Administrator' | 'CustomerSiteManager' | 'CustomerHOManager'

interface Metric {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ElementType
  color: string
}

interface IncidentDataPoint {
  date?: string
  week?: string
  month?: string
  year?: string
  uniformOfficers: number
  storeDetectives: number
}

interface RecentIncident {
  id: string
  customerName: string
  store: string
  officerName: string
  date: string
  amount: number
}

interface RegionData {
  name: string
}

interface Store {
  id: string
  name: string
}

interface Region {
  id: string
  name: string
}

interface CustomerDashboardProps {
  userRole: CustomerRole
  displayName?: string
}

interface DailyActivity {
  id: string
  type: string
  location: string
  officer: string
  time: string
  status: 'completed' | 'in-progress'
}

// Constants
const stores: Store[] = [
  { id: 'store1', name: 'Store #123' },
  { id: 'store2', name: 'Store #456' },
  { id: 'store3', name: 'Store #789' }
]

const regions: Region[] = [
  { id: 'region1', name: 'North Region' },
  { id: 'region2', name: 'South Region' },
  { id: 'region3', name: 'East Region' },
  { id: 'region4', name: 'West Region' }
]

// Mock data with proper typing
const customerStoreData: Record<string, CustomerStoreData> = {
  'store1': {
    name: 'Store #123',
    metrics: {
      'Administrator': [
        { 
          title: 'Overall Activity Score',
          value: '94%',
          change: '+8%',
          trend: 'up',
          icon: Activity,
          color: 'green'
        },
        {
          title: 'Total Incidents',
          value: '15',
          change: '-20%',
          trend: 'down',
          icon: AlertCircle,
          color: 'amber'
        },
        {
          title: 'Active Sites',
          value: '12',
          change: '+1',
          trend: 'up',
          icon: Building2,
          color: 'blue'
        },
        {
          title: 'Total Officers',
          value: '86',
          change: '+8',
          trend: 'up',
          icon: Users,
          color: 'purple'
        }
      ],
      'CustomerSiteManager': [
        { 
          title: 'Daily Activity Score',
          value: '94%',
          change: '+8%',
          trend: 'up',
          icon: Activity,
          color: 'green'
        },
        {
          title: 'Incidents Today',
          value: '2',
          change: '-33%',
          trend: 'down',
          icon: AlertCircle,
          color: 'amber'
        },
        {
          title: 'Customer Satisfaction',
          value: '4.9/5',
          change: '+0.1',
          trend: 'up',
          icon: Star,
          color: 'blue'
        },
        {
          title: 'Active Officers',
          value: '8',
          change: '+1',
          trend: 'up',
          icon: Users,
          color: 'purple'
        }
      ],
      'CustomerHOManager': [
        { 
          title: 'Overall Activity Score',
          value: '91%',
          change: '+5%',
          trend: 'up',
          icon: Activity,
          color: 'green'
        },
        {
          title: 'Total Incidents',
          value: '15',
          change: '-20%',
          trend: 'down',
          icon: AlertCircle,
          color: 'amber'
        },
        {
          title: 'Active Sites',
          value: '12',
          change: '+1',
          trend: 'up',
          icon: Building2,
          color: 'blue'
        },
        {
          title: 'Total Officers',
          value: '86',
          change: '+8',
          trend: 'up',
          icon: Users,
          color: 'purple'
        }
      ]
    },
    incidentData: {
      daily: [
        { date: 'Mon', uniformOfficers: 3, storeDetectives: 2 },
        { date: 'Tue', uniformOfficers: 5, storeDetectives: 4 },
        { date: 'Wed', uniformOfficers: 2, storeDetectives: 3 },
        { date: 'Thu', uniformOfficers: 4, storeDetectives: 2 },
        { date: 'Fri', uniformOfficers: 6, storeDetectives: 5 },
        { date: 'Sat', uniformOfficers: 7, storeDetectives: 6 },
        { date: 'Sun', uniformOfficers: 4, storeDetectives: 3 }
      ],
      weekly: [
        { week: 'Week 1', uniformOfficers: 18, storeDetectives: 15 },
        { week: 'Week 2', uniformOfficers: 22, storeDetectives: 18 },
        { week: 'Week 3', uniformOfficers: 25, storeDetectives: 20 },
        { week: 'Week 4', uniformOfficers: 20, storeDetectives: 16 }
      ],
      monthly: [
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
      yearly: [
        { year: '2020', uniformOfficers: 180, storeDetectives: 144 },
        { year: '2021', uniformOfficers: 220, storeDetectives: 176 },
        { year: '2022', uniformOfficers: 280, storeDetectives: 224 },
        { year: '2023', uniformOfficers: 310, storeDetectives: 248 },
        { year: '2024', uniformOfficers: 325, storeDetectives: 260 }
      ]
    },
    recentIncidents: [
      {
        id: '1',
        customerName: 'Store #123',
        store: 'Electronics Section',
        officerName: 'John Smith',
        date: '2024-03-15',
        amount: 1250.00
      },
      {
        id: '2',
        customerName: 'Store #123',
        store: 'Main Entrance',
        officerName: 'Sarah Wilson',
        date: '2024-03-14',
        amount: 850.00
      }
    ]
  },
  'store2': {
    name: 'Store #456',
    metrics: {
      'Administrator': [
        { 
          title: 'Overall Activity Score',
          value: '87%',
          change: '+3%',
          trend: 'up',
          icon: Activity,
          color: 'green'
        },
        {
          title: 'Total Incidents',
          value: '22',
          change: '-8%',
          trend: 'down',
          icon: AlertCircle,
          color: 'amber'
        },
        {
          title: 'Active Sites',
          value: '18',
          change: '+2',
          trend: 'up',
          icon: Building2,
          color: 'blue'
        },
        {
          title: 'Total Officers',
          value: '124',
          change: '+15',
          trend: 'up',
          icon: Users,
          color: 'purple'
        }
      ],
      'CustomerSiteManager': [
        { 
          title: 'Daily Activity Score',
          value: '87%',
          change: '+3%',
          trend: 'up',
          icon: Activity,
          color: 'green'
        },
        {
          title: 'Incidents Today',
          value: '4',
          change: '-12%',
          trend: 'down',
          icon: AlertCircle,
          color: 'amber'
        },
        {
          title: 'Customer Satisfaction',
          value: '4.6/5',
          change: '+0.3',
          trend: 'up',
          icon: Star,
          color: 'blue'
        },
        {
          title: 'Active Officers',
          value: '10',
          change: '+2',
          trend: 'up',
          icon: Users,
          color: 'purple'
        }
      ],
      'CustomerHOManager': [
        { 
          title: 'Overall Activity Score',
          value: '85%',
          change: '+2%',
          trend: 'up',
          icon: Activity,
          color: 'green'
        },
        {
          title: 'Total Incidents',
          value: '22',
          change: '-8%',
          trend: 'down',
          icon: AlertCircle,
          color: 'amber'
        },
        {
          title: 'Active Sites',
          value: '18',
          change: '+2',
          trend: 'up',
          icon: Building2,
          color: 'blue'
        },
        {
          title: 'Total Officers',
          value: '124',
          change: '+15',
          trend: 'up',
          icon: Users,
          color: 'purple'
        }
      ]
    },
    incidentData: {
      daily: [
        { date: 'Mon', uniformOfficers: 4, storeDetectives: 3 },
        { date: 'Tue', uniformOfficers: 6, storeDetectives: 5 },
        { date: 'Wed', uniformOfficers: 3, storeDetectives: 2 },
        { date: 'Thu', uniformOfficers: 5, storeDetectives: 4 },
        { date: 'Fri', uniformOfficers: 8, storeDetectives: 6 },
        { date: 'Sat', uniformOfficers: 9, storeDetectives: 7 },
        { date: 'Sun', uniformOfficers: 5, storeDetectives: 4 }
      ],
      weekly: [
        { week: 'Week 1', uniformOfficers: 22, storeDetectives: 18 },
        { week: 'Week 2', uniformOfficers: 28, storeDetectives: 22 },
        { week: 'Week 3', uniformOfficers: 32, storeDetectives: 25 },
        { week: 'Week 4', uniformOfficers: 26, storeDetectives: 20 }
      ],
      monthly: [
        { month: 'Jan', uniformOfficers: 30, storeDetectives: 24 },
        { month: 'Feb', uniformOfficers: 28, storeDetectives: 22 },
        { month: 'Mar', uniformOfficers: 40, storeDetectives: 32 },
        { month: 'Apr', uniformOfficers: 22, storeDetectives: 18 },
        { month: 'May', uniformOfficers: 30, storeDetectives: 24 },
        { month: 'Jun', uniformOfficers: 18, storeDetectives: 14 },
        { month: 'Jul', uniformOfficers: 25, storeDetectives: 20 },
        { month: 'Aug', uniformOfficers: 32, storeDetectives: 26 },
        { month: 'Sep', uniformOfficers: 38, storeDetectives: 30 },
        { month: 'Oct', uniformOfficers: 42, storeDetectives: 34 },
        { month: 'Nov', uniformOfficers: 35, storeDetectives: 28 },
        { month: 'Dec', uniformOfficers: 32, storeDetectives: 26 }
      ],
      yearly: [
        { year: '2020', uniformOfficers: 220, storeDetectives: 176 },
        { year: '2021', uniformOfficers: 260, storeDetectives: 208 },
        { year: '2022', uniformOfficers: 320, storeDetectives: 256 },
        { year: '2023', uniformOfficers: 350, storeDetectives: 280 },
        { year: '2024', uniformOfficers: 372, storeDetectives: 298 }
      ]
    },
    recentIncidents: [
      {
        id: '1',
        customerName: 'Store #456',
        store: 'Clothing Department',
        officerName: 'Mike Johnson',
        date: '2024-03-15',
        amount: 950.00
      },
      {
        id: '2',
        customerName: 'Store #456',
        store: 'Customer Service',
        officerName: 'Lisa Chen',
        date: '2024-03-14',
        amount: 1200.00
      }
    ]
  },
  'store3': {
    name: 'Store #789',
    metrics: {
      'Administrator': [
        { 
          title: 'Overall Activity Score',
          value: '96%',
          change: '+12%',
          trend: 'up',
          icon: Activity,
          color: 'green'
        },
        {
          title: 'Total Incidents',
          value: '18',
          change: '-25%',
          trend: 'down',
          icon: AlertCircle,
          color: 'amber'
        },
        {
          title: 'Active Sites',
          value: '28',
          change: '+4',
          trend: 'up',
          icon: Building2,
          color: 'blue'
        },
        {
          title: 'Total Officers',
          value: '196',
          change: '+22',
          trend: 'up',
          icon: Users,
          color: 'purple'
        }
      ],
      'CustomerSiteManager': [
        { 
          title: 'Daily Activity Score',
          value: '96%',
          change: '+12%',
          trend: 'up',
          icon: Activity,
          color: 'green'
        },
        {
          title: 'Incidents Today',
          value: '1',
          change: '-50%',
          trend: 'down',
          icon: AlertCircle,
          color: 'amber'
        },
        {
          title: 'Customer Satisfaction',
          value: '4.8/5',
          change: '+0.2',
          trend: 'up',
          icon: Star,
          color: 'blue'
        },
        {
          title: 'Active Officers',
          value: '14',
          change: '+3',
          trend: 'up',
          icon: Users,
          color: 'purple'
        }
      ],
      'CustomerHOManager': [
        { 
          title: 'Overall Activity Score',
          value: '93%',
          change: '+7%',
          trend: 'up',
          icon: Activity,
          color: 'green'
        },
        {
          title: 'Total Incidents',
          value: '18',
          change: '-25%',
          trend: 'down',
          icon: AlertCircle,
          color: 'amber'
        },
        {
          title: 'Active Sites',
          value: '28',
          change: '+4',
          trend: 'up',
          icon: Building2,
          color: 'blue'
        },
        {
          title: 'Total Officers',
          value: '196',
          change: '+22',
          trend: 'up',
          icon: Users,
          color: 'purple'
        }
      ]
    },
    incidentData: {
      daily: [
        { date: 'Mon', uniformOfficers: 2, storeDetectives: 1 },
        { date: 'Tue', uniformOfficers: 3, storeDetectives: 2 },
        { date: 'Wed', uniformOfficers: 1, storeDetectives: 1 },
        { date: 'Thu', uniformOfficers: 2, storeDetectives: 2 },
        { date: 'Fri', uniformOfficers: 4, storeDetectives: 3 },
        { date: 'Sat', uniformOfficers: 5, storeDetectives: 4 },
        { date: 'Sun', uniformOfficers: 3, storeDetectives: 2 }
      ],
      weekly: [
        { week: 'Week 1', uniformOfficers: 12, storeDetectives: 10 },
        { week: 'Week 2', uniformOfficers: 15, storeDetectives: 12 },
        { week: 'Week 3', uniformOfficers: 18, storeDetectives: 14 },
        { week: 'Week 4', uniformOfficers: 14, storeDetectives: 11 }
      ],
      monthly: [
        { month: 'Jan', uniformOfficers: 18, storeDetectives: 14 },
        { month: 'Feb', uniformOfficers: 16, storeDetectives: 12 },
        { month: 'Mar', uniformOfficers: 24, storeDetectives: 19 },
        { month: 'Apr', uniformOfficers: 14, storeDetectives: 11 },
        { month: 'May', uniformOfficers: 20, storeDetectives: 16 },
        { month: 'Jun', uniformOfficers: 12, storeDetectives: 9 },
        { month: 'Jul', uniformOfficers: 16, storeDetectives: 13 },
        { month: 'Aug', uniformOfficers: 22, storeDetectives: 18 },
        { month: 'Sep', uniformOfficers: 26, storeDetectives: 21 },
        { month: 'Oct', uniformOfficers: 28, storeDetectives: 22 },
        { month: 'Nov', uniformOfficers: 24, storeDetectives: 19 },
        { month: 'Dec', uniformOfficers: 20, storeDetectives: 16 }
      ],
      yearly: [
        { year: '2020', uniformOfficers: 140, storeDetectives: 112 },
        { year: '2021', uniformOfficers: 180, storeDetectives: 144 },
        { year: '2022', uniformOfficers: 220, storeDetectives: 176 },
        { year: '2023', uniformOfficers: 240, storeDetectives: 192 },
        { year: '2024', uniformOfficers: 260, storeDetectives: 208 }
      ]
    },
    recentIncidents: [
      {
        id: '1',
        customerName: 'Store #789',
        store: 'Parking Lot',
        officerName: 'David Lee',
        date: '2024-03-15',
        amount: 2100.00
      },
      {
        id: '2',
        customerName: 'Store #789',
        store: 'Food Court',
        officerName: 'Emma White',
        date: '2024-03-13',
        amount: 750.00
      }
    ]
  }
}

const regionalData: Record<string, RegionData> = {
  'region1': { name: 'North Region' },
  'region2': { name: 'South Region' },
  'region3': { name: 'East Region' },
  'region4': { name: 'West Region' }
}

const satisfactionData = [
  { month: 'Jan', score: 4.5 },
  { month: 'Feb', score: 4.6 },
  { month: 'Mar', score: 4.7 },
  { month: 'Apr', score: 4.8 },
  { month: 'May', score: 4.8 },
  { month: 'Jun', score: 4.9 }
]

const beSafeData = [
  { month: 'Jan', insecureAreas: 88, compliance: 85, systems: 90 },
  { month: 'Feb', insecureAreas: 90, compliance: 87, systems: 92 },
  { month: 'Mar', insecureAreas: 92, compliance: 89, systems: 94 },
  { month: 'Apr', insecureAreas: 94, compliance: 91, systems: 96 },
  { month: 'May', insecureAreas: 95, compliance: 93, systems: 97 },
  { month: 'Jun', insecureAreas: 96, compliance: 94, systems: 98 },
  { month: 'Jul', insecureAreas: null, compliance: null, systems: null },
  { month: 'Aug', insecureAreas: null, compliance: null, systems: null },
  { month: 'Sep', insecureAreas: null, compliance: null, systems: null },
  { month: 'Oct', insecureAreas: null, compliance: null, systems: null },
  { month: 'Nov', insecureAreas: null, compliance: null, systems: null },
  { month: 'Dec', insecureAreas: null, compliance: null, systems: null }
]

const dailyActivities: DailyActivity[] = [
  {
    id: '1',
    type: 'Site Visit',
    location: 'Store #123',
    officer: 'John Smith',
    time: '09:30',
    status: 'completed'
  },
  {
    id: '2',
    type: 'Customer Satisfaction Survey',
    location: 'Store #456',
    officer: 'Sarah Wilson',
    time: '11:15',
    status: 'in-progress'
  },
  {
    id: '3',
    type: 'Incident Response',
    location: 'Store #789',
    officer: 'Mike Johnson',
    time: '14:45',
    status: 'completed'
  }
]

function CustomerDashboard({ userRole, displayName }: CustomerDashboardProps) {
  console.log('🏢 CustomerDashboard props:', { userRole, displayName })
  
  // State management
  const [error, setError] = React.useState<Error | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedPeriod, setSelectedPeriod] = React.useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [selectedStore, setSelectedStore] = React.useState<string>(stores[0].id)
  const [selectedRegion, setSelectedRegion] = React.useState<string>(regions[0].id)

  // Fetch data on mount
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        // In production, replace with actual API calls
        // const response = await fetch('/api/customer-dashboard')
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

  // Memoized data calculations
  const isSiteManager = userRole === 'CustomerSiteManager'
  const currentStoreData = React.useMemo(() => 
    customerStoreData[selectedStore as keyof typeof customerStoreData],
    [selectedStore]
  )
  const metrics = React.useMemo(() => 
    currentStoreData?.metrics[userRole] || [],
    [currentStoreData, userRole]
  )

  // Get incident data based on selected period
  const getIncidentData = React.useCallback(() => {
    if (!currentStoreData) return []
    return currentStoreData.incidentData[selectedPeriod] || []
  }, [currentStoreData, selectedPeriod])

  // Get data key for chart x-axis
  const getDataKey = React.useCallback(() => {
    switch (selectedPeriod) {
      case 'daily': return 'date'
      case 'weekly': return 'week'
      case 'monthly': return 'month'
      case 'yearly': return 'year'
      default: return 'month'
    }
  }, [selectedPeriod])

  const incidentData = React.useMemo(() => getIncidentData(), [getIncidentData])
  const dataKey = getDataKey()
  const recentIncidents = currentStoreData?.recentIncidents || []

  // Error UI
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

  // Loading UI
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
        {/* Dashboard Greeting */}
        <DashboardGreeting className="mb-6" />

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold md:text-lg lg:text-xl">
              {isSiteManager ? 'Customer Dashboard' : 'Customer Dashboard'}
              <span className="ml-2 text-blue-700 font-bold">{displayName ? `(${displayName})` : ''}</span>
            </h1>
            {isSiteManager ? (
              <Store className="h-5 w-5 text-gray-500" />
            ) : (
              <Building2 className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {isSiteManager ? (
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="w-full text-sm md:w-[200px]">
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full text-sm md:w-[200px]">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          {metrics.map((metric, index) => (
            <Card
              key={index}
              className={cn(
                "relative overflow-hidden border-none shadow-lg",
                metric.color === 'green' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
                metric.color === 'amber' ? 'bg-gradient-to-br from-amber-500 to-amber-700' :
                metric.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                'bg-gradient-to-br from-purple-500 to-purple-700'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm md:text-base text-white/90">
                    {metric.title}
                  </CardTitle>
                  <metric.icon className="h-4 w-4 md:h-5 md:w-5 text-white/90" />
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-1 md:pt-2">
                <div className="text-xl font-bold md:text-2xl lg:text-3xl text-white">
                  {metric.value}
                </div>
                <div className="flex items-center mt-1">
                  <span className={cn(
                    "text-xs flex items-center px-2 py-0.5 rounded-full bg-white/20 text-white"
                  )}>
                    {metric.trend === 'up' ? 
                      <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    }
                    {metric.change}
                  </span>
                  <span className="ml-2 text-xs text-white/70">
                    {metric.trend === 'up' ? 'increase' : 'decrease'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Data */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Incident Graph */}
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
                    {(["daily", "weekly", "monthly", "yearly"] as const).map((period) => (
                      <button
                        key={period}
                        className={`px-3 py-1 rounded-md transition-colors capitalize ${
                          period === selectedPeriod
                            ? "bg-white shadow-sm text-emerald-500 font-medium" 
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setSelectedPeriod(period)}
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
                      data={incidentData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="uniformOfficersGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#10B981" stopOpacity={0.2} />
                        </linearGradient>
                        <linearGradient id="storeDetectivesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                      <XAxis
                        dataKey={dataKey}
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

            {/* Be Safe Be Secure Graph */}
            <Card>
              <CardHeader className="p-2 md:p-4">
                <CardTitle className="text-base font-medium md:text-lg">Be Safe Be Secure Compliance</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={beSafeData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      barCategoryGap="20%"
                    >
                      <defs>
                        <linearGradient id="insecureAreasGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity={1} />
                          <stop offset="100%" stopColor="#D97706" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                          <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="systemsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity={1} />
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
                        domain={[75, 100]} 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-gray-500"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                          fontSize: '14px',
                        }}
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)', radius: 4 }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="rect"
                      />
                      <Bar 
                        dataKey="insecureAreas" 
                        fill="url(#insecureAreasGradient)"
                        name="Insecure Areas"
                        radius={[4, 4, 0, 0]}
                        stroke="rgba(245, 158, 11, 0.3)"
                        strokeWidth={1}
                      />
                      <Bar 
                        dataKey="compliance" 
                        fill="url(#complianceGradient)"
                        name="Compliance"
                        radius={[4, 4, 0, 0]}
                        stroke="rgba(16, 185, 129, 0.3)"
                        strokeWidth={1}
                      />
                      <Bar 
                        dataKey="systems" 
                        fill="url(#systemsGradient)"
                        name="Systems"
                        radius={[4, 4, 0, 0]}
                        stroke="rgba(59, 130, 246, 0.3)"
                        strokeWidth={1}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Incidents Table */}
            <Card>
              <CardHeader className="p-2 md:p-4">
                <CardTitle className="text-base font-medium md:text-lg">Recent Incidents</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-2 pb-4 md:px-4">
                  <IncidentTable data={recentIncidents} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Daily Activities and Satisfaction */}
          <div className="space-y-6">
            {/* Daily Activities */}
            <Card>
              <CardHeader className="p-2 md:p-4">
                <CardTitle className="text-base font-medium md:text-lg">Daily Activities</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-4">
                <div className="space-y-4">
                  {dailyActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className={cn(
                        "mt-0.5 p-1.5 rounded-full",
                        activity.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                      )}>
                        {activity.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Activity className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{activity.type}</p>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                        <p className="text-xs text-gray-600">{activity.location}</p>
                        <p className="text-xs text-gray-500">{activity.officer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Satisfaction Report */}
            <Card>
              <CardHeader className="p-2 md:p-4">
                <CardTitle className="text-base font-medium md:text-lg">Satisfaction Trend</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-4">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={satisfactionData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[4, 5]} />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#f59e0b" 
                        fill="#f59e0b" 
                        fillOpacity={0.6}
                        name="Satisfaction Score"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard 