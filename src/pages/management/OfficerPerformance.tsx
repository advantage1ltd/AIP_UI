import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, ChevronRight, Users, TrendingUp, AlertCircle, PoundSterling } from 'lucide-react'

// Types
type PerformanceStatus = 'Excellent' | 'Good' | 'Needs Improvement' | 'Non-Reporter'

interface OfficerData {
  name: string
  incidents: number
  valueSaved: number
  responseRate: number
  status: PerformanceStatus
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  iconBgColor: string
  iconColor: string
}

interface TableHeaderProps {
  headers: string[]
}

// Constants
const STATUS_STYLES = {
  'Excellent': 'bg-green-100 text-green-800',
  'Good': 'bg-blue-100 text-blue-800',
  'Needs Improvement': 'bg-yellow-100 text-yellow-800',
  'Non-Reporter': 'bg-red-100 text-red-800'
} as const

const PROGRESS_COLORS = {
  high: 'bg-green-500',
  good: 'bg-blue-500',
  medium: 'bg-yellow-500',
  low: 'bg-red-500'
} as const

const CUSTOMERS = [
  { id: '1', name: 'Central England Co-Operative' },
  { id: '2', name: 'Tesco' },
  { id: '3', name: "Sainsbury's" }
] as const

// Sample Data
const sampleData: OfficerData[] = [
  { name: 'John Smith', incidents: 85, valueSaved: 145000, responseRate: 98, status: 'Excellent' },
  { name: 'Sarah Wilson', incidents: 78, valueSaved: 132000, responseRate: 97, status: 'Excellent' },
  { name: 'Mike Johnson', incidents: 72, valueSaved: 128000, responseRate: 95, status: 'Excellent' },
  { name: 'Lisa Anderson', incidents: 65, valueSaved: 115000, responseRate: 94, status: 'Good' },
  { name: 'David Chen', incidents: 62, valueSaved: 108000, responseRate: 92, status: 'Good' },
  { name: 'Tom Wilson', incidents: 12, valueSaved: 18000, responseRate: 40, status: 'Non-Reporter' },
  { name: 'Chris Brown', incidents: 18, valueSaved: 28000, responseRate: 45, status: 'Non-Reporter' },
  { name: 'Alex Turner', incidents: 15, valueSaved: 22000, responseRate: 65, status: 'Non-Reporter' },
  { name: 'Maria Garcia', incidents: 22, valueSaved: 35000, responseRate: 72, status: 'Needs Improvement' },
  { name: 'Emily Davis', incidents: 25, valueSaved: 42000, responseRate: 75, status: 'Needs Improvement' }
]

// Utility Functions
const getProgressColor = (rate: number): string => {
  if (rate >= 95) return PROGRESS_COLORS.high
  if (rate >= 85) return PROGRESS_COLORS.good
  if (rate >= 70) return PROGRESS_COLORS.medium
  return PROGRESS_COLORS.low
}

// Components
const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, iconBgColor, iconColor }) => (
  <Card className={`${iconBgColor} hover:opacity-95 transition-all h-full`}>
    <CardContent className="p-1.5 xs:p-2 sm:p-4">
      <div className="flex items-center justify-between gap-1.5 xs:gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] xs:text-xs sm:text-sm font-medium text-white/80 truncate">{title}</p>
          <p className="text-sm xs:text-xl sm:text-2xl font-bold mt-0.5 text-white truncate">{value}</p>
          <p className="text-[8px] xs:text-xs sm:text-sm text-white/70 mt-0.5 truncate">{subtitle}</p>
        </div>
        <div className={`${iconColor} p-1 xs:p-2.5 sm:p-3 rounded-full bg-white/10 flex-shrink-0`}>
          {React.cloneElement(icon as React.ReactElement, { className: `h-3 w-3 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white` })}
        </div>
      </div>
    </CardContent>
  </Card>
)

const TableHeader: React.FC<TableHeaderProps> = ({ headers }) => (
  <tr className="border-b">
    {headers.map((header, index) => (
      <th key={index} className="px-2 py-2.5 xs:px-3 xs:py-3 sm:px-4 md:px-6 text-xs whitespace-nowrap">{header}</th>
    ))}
  </tr>
)

const OfficerPerformance = () => {
  const [startDate, setStartDate] = useState<Date>(new Date('2024-02-02'))
  const [endDate, setEndDate] = useState<Date>(new Date('2025-02-19'))
  const [selectedCustomer, setSelectedCustomer] = useState<string>('1')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('top-performers')
  
  const pageSize = 10

  // Filtered and paginated data
  const filteredData = sampleData.filter(officer => 
    activeTab === 'top-performers' ? officer.responseRate >= 85 : officer.responseRate < 85
  )

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize)

  // Statistics
  const stats = {
    totalOfficers: sampleData.length,
    activeOfficers: sampleData.filter(o => o.responseRate >= 70).length,
    totalIncidents: sampleData.reduce((sum, o) => sum + o.incidents, 0),
    totalValueSaved: sampleData.reduce((sum, o) => sum + o.valueSaved, 0),
    averageResponseRate: Math.round(sampleData.reduce((sum, o) => sum + o.responseRate, 0) / sampleData.length)
  }

  const statCards = [
    {
      title: 'Total Officers',
      value: stats.totalOfficers,
      subtitle: `${stats.activeOfficers} active officers`,
      icon: <Users />,
      iconBgColor: 'bg-blue-600',
      iconColor: 'bg-blue-500/20'
    },
    {
      title: 'Total Incidents',
      value: stats.totalIncidents,
      subtitle: 'Across all officers',
      icon: <AlertCircle />,
      iconBgColor: 'bg-rose-600',
      iconColor: 'bg-rose-500/20'
    },
    {
      title: 'Value Saved',
      value: `£${stats.totalValueSaved.toLocaleString()}`,
      subtitle: 'Total amount recovered',
      icon: <PoundSterling />,
      iconBgColor: 'bg-emerald-600',
      iconColor: 'bg-emerald-500/20'
    },
    {
      title: 'Average Response',
      value: `${stats.averageResponseRate}%`,
      subtitle: 'Overall response rate',
      icon: <TrendingUp />,
      iconBgColor: 'bg-violet-600',
      iconColor: 'bg-violet-500/20'
    }
  ]

  return (
    <div className="container mx-auto px-1 xs:px-3 sm:px-4 py-2 xs:py-4 sm:py-6 md:px-6 lg:px-8 max-w-7xl">
      <div className="space-y-2 xs:space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col xs:flex-row justify-between xs:items-center gap-2">
          <div>
            <h1 className="text-base xs:text-xl sm:text-2xl font-bold">Officer Performance</h1>
            <p className="text-[9px] xs:text-xs sm:text-sm text-gray-500 mt-0.5">Top performing officers and reporting status</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 xs:gap-3 sm:gap-4">
          {statCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        {/* Filters */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-1.5 xs:p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-2 xs:gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 xs:gap-4 flex-1">
                <div>
                  <label className="block text-[9px] xs:text-xs sm:text-sm font-medium text-gray-600 mb-0.5 xs:mb-1">
                    Start Date
                  </label>
                  <DatePicker date={startDate} setDate={setStartDate} placeholder="Start Date" />
                </div>
                <div>
                  <label className="block text-[9px] xs:text-xs sm:text-sm font-medium text-gray-600 mb-0.5 xs:mb-1">
                    End Date
                  </label>
                  <DatePicker date={endDate} setDate={setEndDate} placeholder="End Date" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[9px] xs:text-xs sm:text-sm font-medium text-gray-600 mb-0.5 xs:mb-1">
                    Customer
                  </label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="w-full h-7 xs:h-8 sm:h-9 text-[9px] xs:text-xs sm:text-sm">
                      <SelectValue placeholder="Select Customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {CUSTOMERS.map(customer => (
                        <SelectItem key={customer.id} value={customer.id} className="text-[9px] xs:text-xs sm:text-sm">
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full sm:w-auto h-7 xs:h-8 sm:h-9 text-[9px] xs:text-xs sm:text-sm">Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Tabs */}
        <div className="space-y-2 xs:space-y-3 sm:space-y-4">
          <Tabs defaultValue="top-performers" onValueChange={value => {
            setActiveTab(value)
            setCurrentPage(1)
          }}>
            <TabsList className="w-full xs:w-auto h-7 xs:h-8 sm:h-9">
              <TabsTrigger value="top-performers" className="flex-1 xs:flex-none text-[9px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8">
                Top Performers
              </TabsTrigger>
              <TabsTrigger value="non-reporters" className="flex-1 xs:flex-none text-[9px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8">
                Non-Reporters
              </TabsTrigger>
            </TabsList>
            
            {['top-performers', 'non-reporters'].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-2">
                <Card>
                  <CardContent className="p-0 sm:p-4">
                    <div className="relative overflow-x-auto -mx-1 xs:mx-0">
                      <div className="min-w-[360px] xs:min-w-full">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50">
                            <tr className="border-b">
                              {['Officer', 'Incidents', 'Value Saved', 'Response Rate', 'Status'].map((header, index) => (
                                <th key={index} className="px-1 py-1.5 xs:px-3 xs:py-3 sm:px-4 md:px-6 text-[9px] xs:text-xs whitespace-nowrap">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {paginatedData.map((officer, index) => (
                              <tr key={index} className="bg-white hover:bg-gray-50">
                                <td className="px-1 py-1.5 xs:px-3 xs:py-3 sm:px-4 md:px-6 text-[9px] xs:text-xs sm:text-sm font-medium">
                                  {officer.name}
                                </td>
                                <td className="px-1 py-1.5 xs:px-3 xs:py-3 sm:px-4 md:px-6 text-[9px] xs:text-xs sm:text-sm">
                                  {officer.incidents}
                                </td>
                                <td className="px-1 py-1.5 xs:px-3 xs:py-3 sm:px-4 md:px-6 text-[9px] xs:text-xs sm:text-sm">
                                  £{officer.valueSaved.toLocaleString()}
                                </td>
                                <td className="px-1 py-1.5 xs:px-3 xs:py-3 sm:px-4 md:px-6">
                                  <div className="flex items-center gap-1 xs:gap-2">
                                    <Progress 
                                      value={officer.responseRate} 
                                      className={`h-1 xs:h-1.5 sm:h-2 w-6 xs:w-16 sm:w-24 ${getProgressColor(officer.responseRate)}`}
                                    />
                                    <span className="text-[9px] xs:text-xs sm:text-sm">{officer.responseRate}%</span>
                                  </div>
                                </td>
                                <td className="px-1 py-1.5 xs:px-3 xs:py-3 sm:px-4 md:px-6">
                                  <Badge className={`${STATUS_STYLES[officer.status]} text-[8px] xs:text-xs sm:text-sm px-1 py-0.5 xs:px-2`}>
                                    {officer.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Pagination */}
        <div className="flex flex-col xs:flex-row items-center justify-between gap-2 px-1 xs:px-2">
          <div className="text-[9px] xs:text-xs sm:text-sm text-gray-500 order-2 xs:order-1">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex items-center space-x-1 xs:space-x-2 order-1 xs:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-5 w-5 xs:h-8 xs:w-8"
            >
              <ChevronLeft className="h-2.5 w-2.5 xs:h-4 xs:w-4" />
            </Button>
            <div className="text-[9px] xs:text-xs sm:text-sm min-w-[60px] xs:min-w-[100px] text-center">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-5 w-5 xs:h-8 xs:w-8"
            >
              <ChevronRight className="h-2.5 w-2.5 xs:h-4 xs:w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfficerPerformance 