import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

interface OfficerData {
  name: string
  incidents: number
  valueSaved: number
  responseRate: number
  status: 'Excellent' | 'Good' | 'Needs Improvement' | 'Non-Reporter'
}

const sampleData: OfficerData[] = [
  // Top Performers
  { name: 'John Smith', incidents: 85, valueSaved: 145000, responseRate: 98, status: 'Excellent' },
  { name: 'Sarah Wilson', incidents: 78, valueSaved: 132000, responseRate: 97, status: 'Excellent' },
  { name: 'Mike Johnson', incidents: 72, valueSaved: 128000, responseRate: 95, status: 'Excellent' },
  { name: 'Lisa Anderson', incidents: 65, valueSaved: 115000, responseRate: 94, status: 'Good' },
  { name: 'David Chen', incidents: 62, valueSaved: 108000, responseRate: 92, status: 'Good' },
  
  // Non-Reporters
  { name: 'Tom Wilson', incidents: 12, valueSaved: 18000, responseRate: 40, status: 'Non-Reporter' },
  { name: 'Chris Brown', incidents: 18, valueSaved: 28000, responseRate: 45, status: 'Non-Reporter' },
  { name: 'Alex Turner', incidents: 15, valueSaved: 22000, responseRate: 65, status: 'Non-Reporter' },
  { name: 'Maria Garcia', incidents: 22, valueSaved: 35000, responseRate: 72, status: 'Needs Improvement' },
  { name: 'Emily Davis', incidents: 25, valueSaved: 42000, responseRate: 75, status: 'Needs Improvement' }
]

const OfficerPerformance = () => {
  const [startDate, setStartDate] = useState<Date>(new Date('2024-02-02'))
  const [endDate, setEndDate] = useState<Date>(new Date('2025-02-19'))
  const [selectedCustomer, setSelectedCustomer] = useState<string>('1')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('top-performers')
  
  const pageSize = 10

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent':
        return 'bg-green-100 text-green-800'
      case 'Good':
        return 'bg-blue-100 text-blue-800'
      case 'Needs Improvement':
        return 'bg-yellow-100 text-yellow-800'
      case 'Non-Reporter':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (rate: number) => {
    if (rate >= 95) return 'bg-green-500'
    if (rate >= 85) return 'bg-blue-500'
    if (rate >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const filteredData = sampleData.filter(officer => {
    if (activeTab === 'top-performers') {
      return officer.responseRate >= 85
    } else {
      return officer.responseRate < 85
    }
  })

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize)

  // Calculate statistics
  const stats = {
    totalOfficers: sampleData.length,
    activeOfficers: sampleData.filter(o => o.responseRate >= 70).length,
    totalIncidents: sampleData.reduce((sum, o) => sum + o.incidents, 0),
    totalValueSaved: sampleData.reduce((sum, o) => sum + o.valueSaved, 0),
    averageResponseRate: Math.round(sampleData.reduce((sum, o) => sum + o.responseRate, 0) / sampleData.length)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Officer Performance</h1>
            <p className="text-sm text-gray-500 mt-1">Top performing officers and reporting status</p>
          </div>
          <Button variant="outline">View All Officers</Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Officers</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalOfficers}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.activeOfficers} active officers
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Incidents</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalIncidents}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Across all officers
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Value Saved</p>
                  <p className="text-2xl font-bold mt-1">£{stats.totalValueSaved.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Total amount recovered
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <PoundSterling className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Average Response</p>
                  <p className="text-2xl font-bold mt-1">{stats.averageResponseRate}%</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Overall response rate
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                  <DatePicker
                    date={startDate}
                    setDate={setStartDate}
                    placeholder="Start Date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                  <DatePicker
                    date={endDate}
                    setDate={setEndDate}
                    placeholder="End Date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Customer</label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Select Customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Central England Co-Operative</SelectItem>
                      <SelectItem value="2">Tesco</SelectItem>
                      <SelectItem value="3">Sainsbury's</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="mt-7">Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Tabs */}
        <Tabs defaultValue="top-performers" onValueChange={value => {
          setActiveTab(value)
          setCurrentPage(1)
        }}>
          <TabsList>
            <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
            <TabsTrigger value="non-reporters">Non-Reporters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="top-performers" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="px-6 py-3">Officer</th>
                        <th className="px-6 py-3">Incidents</th>
                        <th className="px-6 py-3">Value Saved</th>
                        <th className="px-6 py-3">Response Rate</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((officer, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-6 py-4">{officer.name}</td>
                          <td className="px-6 py-4">{officer.incidents}</td>
                          <td className="px-6 py-4">£{officer.valueSaved.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={officer.responseRate} 
                                className={`h-2 w-24 ${getProgressColor(officer.responseRate)}`}
                              />
                              <span>{officer.responseRate}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getStatusColor(officer.status)}>
                              {officer.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="non-reporters" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="px-6 py-3">Officer</th>
                        <th className="px-6 py-3">Incidents</th>
                        <th className="px-6 py-3">Value Saved</th>
                        <th className="px-6 py-3">Response Rate</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((officer, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-6 py-4">{officer.name}</td>
                          <td className="px-6 py-4">{officer.incidents}</td>
                          <td className="px-6 py-4">£{officer.valueSaved.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={officer.responseRate} 
                                className={`h-2 w-24 ${getProgressColor(officer.responseRate)}`}
                              />
                              <span>{officer.responseRate}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getStatusColor(officer.status)}>
                              {officer.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfficerPerformance 