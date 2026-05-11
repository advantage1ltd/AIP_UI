/**
 * Customer reporting dashboard: incident analytics tabs fed by incidentService.
 * Flow: shared incident filters → tabbed charts/tables → drill-down links into operations routes.
 */
import { useState, useMemo, useEffect } from "react"
import { useSelector } from "react-redux"
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  AreaChart
} from "recharts"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { NativeDateInput } from "@/components/ui/native-date-input"
import { Badge } from "@/components/ui/badge"
import { 
  ChartContainer, 
  ChartLegend, 
  ChartLegendContent,
  ChartStyle,
  ChartTooltip, 
  ChartTooltipContent
} from "@/components/ui/chart"
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Bar, 
  Line, 
  Pie, 
  Cell, 
  Area
} from "recharts"
import { 
  Calendar,
  ChevronDown, 
  ChevronRight, 
  Download, 
  Filter, 
  FileText, 
  MapPin, 
  PieChart as PieChartIcon, 
  RefreshCw, 
  TrendingUp, 
  ShoppingBag,
  Clock,
  Shield,
  Users,
  ShieldCheck
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

// Import incident service to fetch data from API
import { incidentService } from '@/services/incidentService'
import {
  Incident,
  IncidentType, 
  IncidentInvolved
} from "@/types/incidents"

import { COLORS, incidentTypeColors } from './reportsDashboard/constants'
import { parseIncidentHour } from './reportsDashboard/utils'
import { StatsCard } from './reportsDashboard/StatsCard'
import { useReportsFilters, useReportsIncidentData } from './reportsDashboard/useReportsData'

const ReportsDashboard = () => {

  const { incidents, loading } = useReportsIncidentData()
  const {
    activeTab,
    setActiveTab,
    dateRange,
    setDateRange,
    customerFilter,
    setCustomerFilter,
    storeFilter,
    setStoreFilter,
    incidentTypeFilter,
    setIncidentTypeFilter,
    incidentInvolvedFilter,
    setIncidentInvolvedFilter,
  } = useReportsFilters()


  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  // Calculate previous period incidents for comparison
  const previousPeriodIncidents = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    
    const currentPeriodDays = Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    
    const previousPeriodEnd = new Date(dateRange.from);
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
    
    const previousPeriodStart = new Date(previousPeriodEnd);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - currentPeriodDays);
    
    return incidents.filter(incident => {
      const date = new Date(incident.date);
      return date >= previousPeriodStart && date <= previousPeriodEnd;
    }).length;
  }, [incidents, dateRange]);

  // Filter incidents based on selected filters
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      // Date range filter
      const incidentDate = new Date(incident.date)
      const isInDateRange = dateRange?.from && dateRange?.to 
        ? (incidentDate >= dateRange.from && incidentDate <= dateRange.to)
        : true
        
      // Customer filter
      const matchesCustomer = customerFilter === "all" || incident.customerName === customerFilter
      
      // Store filter
      const matchesStore = storeFilter === "all" || incident.siteName === storeFilter
      
      // Incident type filter
      const matchesType = incidentTypeFilter === "all" || incident.incidentType === incidentTypeFilter
      
      // Incident involved filter (using incidentInvolved array if available)
      const matchesInvolved = incidentInvolvedFilter === "all" || 
        (incident.incidentInvolved && incident.incidentInvolved.includes(incidentInvolvedFilter))
      
      return isInDateRange && matchesCustomer && matchesStore && matchesType && matchesInvolved
    })
  }, [incidents, dateRange, customerFilter, storeFilter, incidentTypeFilter, incidentInvolvedFilter])

  // Get unique customer and store names for filters
  const customers = useMemo(() => {
    return [...new Set(incidents.map(incident => incident.customerName))].filter(Boolean)
  }, [incidents])
  
  const stores = useMemo(() => {
    return [...new Set(incidents.map(incident => incident.siteName))].filter(Boolean)
  }, [incidents])
  
  // Get incident types for filters
  const incidentTypes = useMemo(() => {
    return Object.values(IncidentType)
  }, [])
  
  // Get incident involved categories for filters
  const incidentInvolvedCategories = useMemo(() => {
    return Object.values(IncidentInvolved)
  }, [])

  // Prepare data for different charts
  const incidentsByType = useMemo(() => {
    const counts: Record<string, number> = {}
    
    // Initialize with all incident types for consistent chart display
    Object.values(IncidentType).forEach(type => {
      counts[type] = 0
    })
    
    filteredIncidents.forEach(incident => {
      const type = incident.incidentType
      counts[type] = (counts[type] || 0) + 1
    })
    
    return Object.entries(counts).map(([type, count]) => ({
      name: type,
      value: count,
      color: incidentTypeColors[type] || '#94a3b8' // Fallback color
    }))
  }, [filteredIncidents])

  const incidentsByStore = useMemo(() => {
    const counts: Record<string, number> = {}
    
    filteredIncidents.forEach(incident => {
      const store = incident.siteName
      counts[store] = (counts[store] || 0) + 1
    })
    
    return Object.entries(counts).map(([store, count]) => ({
      name: store,
      incidents: count
    }))
  }, [filteredIncidents])

  const theftTrendByMonth = useMemo(() => {
    const months: Record<string, number> = {}
    
    filteredIncidents
      .filter(incident => incident.incidentType === IncidentType.THEFT)
      .forEach(incident => {
        const raw = incident.date ?? incident.dateOfIncident
        if (!raw) return
        const date = new Date(raw)
        if (Number.isNaN(date.getTime())) return
        const monthYear = format(date, 'MMM yyyy')
        
        months[monthYear] = (months[monthYear] || 0) + 1
      })
    
    // Convert to array and sort by date
    return Object.entries(months)
      .map(([month, count]) => ({
        month,
        incidents: count
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month)
        const dateB = new Date(b.month)
        return dateA.getTime() - dateB.getTime()
      })
  }, [filteredIncidents])

  // Analytics calculations
  const totalIncidents = filteredIncidents.length
  const totalThefts = filteredIncidents.filter(i => i.incidentType === IncidentType.THEFT).length
  const totalRecovered = filteredIncidents.reduce((sum, incident) => 
    sum + (incident.value || 0), 0)

  const theftPercentage = totalIncidents > 0 
    ? Math.round((totalThefts / totalIncidents) * 100) 
    : 0

  // Prepare data for incident involvement chart
  const incidentsByInvolvement = useMemo(() => {
    const counts: Record<string, number> = {}
    
    // Initialize with all involvement categories for consistent chart display
    Object.values(IncidentInvolved).forEach(type => {
      counts[type] = 0
    })
    
    filteredIncidents.forEach(incident => {
      if (incident.incidentInvolved && incident.incidentInvolved.length > 0) {
        incident.incidentInvolved.forEach(involved => {
          counts[involved] = (counts[involved] || 0) + 1
        })
      }
    })
    
    return Object.entries(counts)
      .filter(([_, count]) => count > 0) // Only show categories with incidents
      .map(([type, count]) => ({
        name: type,
        value: count,
        color: incidentTypeColors[type] || '#94a3b8' // Fallback color
      }))
      .sort((a, b) => b.value - a.value) // Sort by count descending
  }, [filteredIncidents])

  /** Stolen line items grouped by product category (counts), for pie charts. */
  const theftCategoryPieData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const inc of filteredIncidents) {
      for (const item of inc.stolenItems ?? []) {
        const cat = item.category?.trim() || 'Other'
        counts.set(cat, (counts.get(cat) ?? 0) + 1)
      }
    }
    const palette = ['#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#94a3b8']
    return Array.from(counts.entries())
      .map(([name, value], i) => ({
        name,
        value,
        color: palette[i % palette.length],
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [filteredIncidents])

  /** Value of stolen items by category (from incident stolen line items). */
  const financialImpactByCategory = useMemo(() => {
    const map = new Map<string, { category: string; stolen: number; recovered: number }>()
    for (const inc of filteredIncidents) {
      for (const item of inc.stolenItems ?? []) {
        const cat = item.category?.trim() || 'Other'
        if (!map.has(cat)) {
          map.set(cat, { category: cat, stolen: 0, recovered: 0 })
        }
        const row = map.get(cat)!
        const amt = Number(item.totalAmount ?? (Number(item.cost) || 0) * (Number(item.quantity) || 0))
        if (item.isRecovered) {
          row.recovered += Number(item.valueSaved ?? amt)
        } else {
          row.stolen += amt
        }
      }
    }
    return Array.from(map.values())
      .filter((r) => r.stolen > 0 || r.recovered > 0)
      .sort((a, b) => b.stolen + b.recovered - (a.stolen + a.recovered))
  }, [filteredIncidents])

  const financialTotalsFromStolenItems = useMemo(() => {
    const stolen = financialImpactByCategory.reduce((s, r) => s + r.stolen, 0)
    const recovered = financialImpactByCategory.reduce((s, r) => s + r.recovered, 0)
    const denom = stolen + recovered
    const pct = denom > 0 ? Math.round((recovered / denom) * 1000) / 10 : 0
    return { stolen, recovered, pct }
  }, [financialImpactByCategory])

  /** Average £ value per stolen line item (filtered incidents). */
  const avgStolenLineItemValue = useMemo(() => {
    let total = 0
    let count = 0
    for (const inc of filteredIncidents) {
      for (const item of inc.stolenItems ?? []) {
        total += Number(item.totalAmount ?? 0)
        count += 1
      }
    }
    if (count === 0) return null
    return total / count
  }, [filteredIncidents])

  /** Most common weekday for theft-type incidents (by local date). */
  const peakTheftDayLabel = useMemo(() => {
    const counts = new Map<string, number>()
    for (const inc of filteredIncidents) {
      if (inc.incidentType !== IncidentType.THEFT) continue
      const raw = inc.date ?? inc.dateOfIncident
      if (!raw) continue
      const d = new Date(raw)
      if (Number.isNaN(d.getTime())) continue
      const day = format(d, 'EEEE')
      counts.set(day, (counts.get(day) ?? 0) + 1)
    }
    if (counts.size === 0) return null
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
  }, [filteredIncidents])

  /** Mode hour for theft incidents where `timeOfIncident` is present. */
  const peakTheftHourLabel = useMemo(() => {
    const counts = new Map<number, number>()
    for (const inc of filteredIncidents) {
      if (inc.incidentType !== IncidentType.THEFT) continue
      const hour = parseIncidentHour(inc.timeOfIncident)
      if (hour === null) continue
      counts.set(hour, (counts.get(hour) ?? 0) + 1)
    }
    if (counts.size === 0) return null
    const [hour, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
    return { hour, count: n }
  }, [filteredIncidents])

  /** Highest store incident count vs mean across stores (only theft counts all incidents per site). */
  const storeTheftConcentrationRatio = useMemo(() => {
    const bySite: Record<string, number> = {}
    for (const inc of filteredIncidents) {
      if (inc.incidentType !== IncidentType.THEFT) continue
      const site = inc.siteName || 'Unknown'
      bySite[site] = (bySite[site] ?? 0) + 1
    }
    const vals = Object.values(bySite)
    if (vals.length === 0) return null
    const max = Math.max(...vals)
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length
    if (mean <= 0) return null
    return Math.round((max / mean) * 10) / 10
  }, [filteredIncidents])

  /** Top stolen-item category by line count (same ordering as category pie). */
  const topTheftCategoryLabel = useMemo(() => {
    if (theftCategoryPieData.length === 0) return null
    return theftCategoryPieData[0].name
  }, [theftCategoryPieData])

  const riskFactorSummaryLines = useMemo(() => {
    const lines: string[] = []
    if (storeTheftConcentrationRatio != null) {
      lines.push(
        `The busiest site has ${storeTheftConcentrationRatio}× the average theft count per site (among sites with at least one theft in this view).`
      )
    }
    if (topTheftCategoryLabel) {
      lines.push(`Most recorded stolen-item category: ${topTheftCategoryLabel}.`)
    }
    if (peakTheftHourLabel) {
      lines.push(
        `Among thefts with a time of incident, the most common hour is ${peakTheftHourLabel.hour}:00 (${peakTheftHourLabel.count} record${peakTheftHourLabel.count === 1 ? '' : 's'}).`
      )
    }
    if (lines.length === 0) {
      lines.push('Record time of incident and item categories on theft reports to unlock automatic concentration and timing insights.')
    }
    return lines
  }, [storeTheftConcentrationRatio, topTheftCategoryLabel, peakTheftHourLabel])

  /** Top product/description labels from stolen line items. */
  const topStolenProductRows = useMemo(() => {
    const map = new Map<string, { name: string; value: number; recovery: number; loss: number }>()
    for (const inc of filteredIncidents) {
      for (const item of inc.stolenItems ?? []) {
        const label = item.productName?.trim() || item.description?.trim() || 'Unknown product'
        const prev = map.get(label) ?? { name: label, value: 0, recovery: 0, loss: 0 }
        prev.value += 1
        if (item.isRecovered) {
          prev.recovery += 1
        } else {
          prev.loss += 1
        }
        map.set(label, prev)
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 15)
  }, [filteredIncidents])

  // Filter UI section
  const renderFilters = () => (
    <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-md shadow-sm">
      <div className="flex-1 space-y-2">
        <Label className="text-xs font-medium">Date Range</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <NativeDateInput
            value={dateRange?.from}
            onDateChange={(d) =>
              setDateRange((prev) => {
                const next = { ...prev, from: d }
                if (next.to && d && next.to < d) next.to = d
                return next.from || next.to ? next : undefined
              })
            }
            className="bg-white"
            aria-label="Filter start date"
          />
          <NativeDateInput
            value={dateRange?.to}
            onDateChange={(d) => setDateRange((prev) => ({ ...prev, to: d }))}
            minDate={dateRange?.from}
            className="bg-white"
            aria-label="Filter end date"
          />
        </div>
      </div>
      
      <div className="flex-1 space-y-2">
        <Label htmlFor="customer" className="text-xs font-medium">Customer</Label>
        <Select value={customerFilter} onValueChange={setCustomerFilter}>
          <SelectTrigger id="customer" className="bg-white">
            <SelectValue placeholder="All Customers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customers.map(customer => (
              <SelectItem key={customer} value={customer}>{customer}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1 space-y-2">
        <Label htmlFor="store" className="text-xs font-medium">Store</Label>
        <Select value={storeFilter} onValueChange={setStoreFilter}>
          <SelectTrigger id="store" className="bg-white">
            <SelectValue placeholder="All Stores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {stores.map(store => (
              <SelectItem key={store} value={store}>{store}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1 space-y-2">
        <Label htmlFor="incident-type" className="text-xs font-medium">Incident Type</Label>
        <Select value={incidentTypeFilter} onValueChange={setIncidentTypeFilter}>
          <SelectTrigger id="incident-type" className="bg-white">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {incidentTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1 space-y-2">
        <Label htmlFor="incident-involved" className="text-xs font-medium">Incident Involved</Label>
        <Select value={incidentInvolvedFilter} onValueChange={setIncidentInvolvedFilter}>
          <SelectTrigger id="incident-involved" className="bg-white">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {incidentInvolvedCategories.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
  
  return (
    <div className="min-h-screen bg-[#EFF4FF] p-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Incidents Analysis Dashboard</h1>
            <p className="text-muted-foreground">Analytics and insights for security management</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs bg-white">
              <RefreshCw className="mr-2 h-3 w-3" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="text-xs bg-white">
              <Download className="mr-2 h-3 w-3" />
              Export
            </Button>
          </div>
        </div>
        
        {renderFilters()}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          title="Total Incidents" 
          value={totalIncidents} 
          icon={FileText}
          change={`${totalIncidents > previousPeriodIncidents ? '+' : ''}${totalIncidents - previousPeriodIncidents} vs. previous period`}
          changeType={totalIncidents > previousPeriodIncidents ? "negative" : "positive"}
          backgroundClass="from-green-600 to-emerald-700" // Changed to green background
        />
        <StatsCard 
          title="Theft Rate" 
          value={`${theftPercentage}%`} 
          icon={ShoppingBag}
          change={`${theftPercentage > 48 ? '+' : ''}${theftPercentage - 48}% vs. previous period`}
          changeType={theftPercentage > 48 ? "negative" : "positive"}
          backgroundClass="from-rose-600 to-pink-700" // Specific background
        />
        <StatsCard 
          title="Value Recovered" 
          value={`£${totalRecovered.toLocaleString()}`} 
          icon={ShieldCheck}
          change={`Recovery rate: ${Math.round((totalRecovered / (filteredIncidents.reduce((sum, incident) => sum + (incident.value || 0), 0) || 1)) * 100)}%`}
          changeType="positive"
          backgroundClass="from-emerald-600 to-green-700" // Specific background
        />
        <StatsCard 
          title="Total Incidents" 
          value={totalIncidents} 
          icon={Shield}
          change={`${totalIncidents > previousPeriodIncidents ? '+' : ''}${totalIncidents - previousPeriodIncidents} vs. previous period`}
          changeType={totalIncidents > previousPeriodIncidents ? "negative" : "positive"}
          backgroundClass="from-green-600 to-emerald-700" // Changed to green background
        />
      </div>
      
      {/* Incident Types Overview */}
      <Card className="mb-6 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Incident Types Distribution</CardTitle>
          <CardDescription>Breakdown of incident types across all stores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incidentsByType.filter(item => item.value > 0)} // Only show types with incidents
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${String(name).replace(/\?$/, '')} (${(percent * 100).toFixed(0)}%)`}
                >
                  {incidentsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => {
                    const label = String(name).replace(/\?$/, ''); // Remove trailing question mark
                    return [`${value} incidents`, label];
                  }}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
            {Object.entries(IncidentType).slice(0, 4).map(([key, value]) => {
              const count = incidentsByType.find(t => t.name === value)?.value || 0;
              const color = incidentTypeColors[value];
              return (
                <div key={key} className="flex items-start space-x-2">
                  <div className="w-3 h-3 rounded-full mt-1" style={{ backgroundColor: color }}></div>
                  <div>
                    <div className="text-xs font-medium">{value.replace(/\?$/, '')}</div>
                    <div className="text-xs text-muted-foreground">{count} incidents</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Incident Involvement Breakdown */}
      <Card className="mb-6 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Incident Involvement Categories</CardTitle>
          <CardDescription>Analysis of specific circumstances involved in incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={incidentsByInvolvement}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  width={140}
                  tickFormatter={(value) => String(value).replace(/\?$/, '')}
                />
                <Tooltip
                  formatter={(value) => [`${value} incidents`]}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                  labelFormatter={(value) => value}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {incidentsByInvolvement.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Self-Checkout Incidents</h4>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-blue-700">Self Scan Tills</span>
                  <span className="text-xs font-medium text-blue-700">
                    {incidentsByInvolvement.find(i => i.name === IncidentInvolved.SELF_SCAN_TILLS)?.value || 0} incidents
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-blue-700">Scan And Go</span>
                  <span className="text-xs font-medium text-blue-700">
                    {incidentsByInvolvement.find(i => i.name === IncidentInvolved.SCAN_AND_GO)?.value || 0} incidents
                  </span>
                </div>
                <div className="text-xs text-blue-700 mt-2">
                  These incidents may require specific staff training on self-checkout monitoring.
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Aggressive Behavior</h4>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-red-700">Abusive Behaviour</span>
                  <span className="text-xs font-medium text-red-700">
                    {incidentsByInvolvement.find(i => i.name === IncidentInvolved.ABUSIVE_BEHAVIOUR)?.value || 0} incidents
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-red-700">Threats And Intimidation</span>
                  <span className="text-xs font-medium text-red-700">
                    {incidentsByInvolvement.find(i => i.name === IncidentInvolved.THREATS_AND_INTIMIDATION)?.value || 0} incidents
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-red-700">Violent Behaviour</span>
                  <span className="text-xs font-medium text-red-700">
                    {incidentsByInvolvement.find(i => i.name === IncidentInvolved.VIOLENT_BEHAVIOR)?.value || 0} incidents
                  </span>
                </div>
                <div className="text-xs text-red-700 mt-2">
                  De-escalation training recommended for staff at high-risk locations.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Police Involvement Analysis */}
      <Card className="mb-6 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Police Involvement Analysis
          </CardTitle>
          <CardDescription>Assessment of incidents requiring police intervention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: Police involvement by incident type */}
            <div>
              <h4 className="text-sm font-medium mb-3">Police Involvement by Incident Type</h4>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.values(IncidentType).map(type => {
                      const typeIncidents = filteredIncidents.filter(i => i.incidentType === type);
                      const policeCount = typeIncidents.filter(i => i.policeInvolvement).length;
                      const percentage = typeIncidents.length > 0 
                        ? Math.round((policeCount / typeIncidents.length) * 100) 
                        : 0;
                      
                      return {
                        name: type.replace(/\?$/, ''),
                        count: policeCount,
                        percentage
                      };
                    }).filter(item => item.count > 0).sort((a, b) => b.count - a.count)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "percentage" ? `${value}%` : value,
                        name === "percentage" ? "Police Rate" : "Incidents"
                      ]}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                    />
                    <Bar dataKey="count" name="Incidents" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Right column: Police attendance metrics */}
            <div>
              <h4 className="text-sm font-medium mb-3">Police Response Statistics</h4>
              <div className="space-y-5">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-indigo-900">Overall Police Involvement Rate</div>
                      <div className="text-xs text-indigo-700 mt-1">Percentage of incidents requiring police</div>
                    </div>
                    <div className="text-2xl font-bold text-indigo-700">
                                                  {Math.round((filteredIncidents.filter(i => i.policeInvolvement).length / filteredIncidents.length) * 100)}%
                    </div>
                  </div>
                  <Progress 
                    value={Math.round((filteredIncidents.filter(i => i.policeInvolvement).length / filteredIncidents.length) * 100)}
                    className="h-2 mt-2 bg-indigo-200"
                  />
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <div className="text-sm font-medium text-indigo-900 mb-2">Police Attendance Issues</div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-indigo-700">Failed to Attend Rate</div>
                    <div className="text-sm font-medium text-indigo-900">
                      {filteredIncidents.filter(i => i.incidentInvolved?.includes(IncidentInvolved.POLICE_FAILED_TO_ATTEND)).length} incidents
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-xs text-indigo-700">
                      Police failed to attend in {Math.round((filteredIncidents.filter(i => i.incidentInvolved?.includes(IncidentInvolved.POLICE_FAILED_TO_ATTEND)).length / filteredIncidents.filter(i => i.policeInvolvement).length) * 100)}% of cases where they were called.
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="text-xs text-indigo-600 mb-1">Arrests Made</div>
                    <div className="text-xl font-bold text-indigo-700">
                      {filteredIncidents.filter(i => i.incidentType === IncidentType.ARREST).length}
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="text-xs text-indigo-600 mb-1">Violent Incidents</div>
                    <div className="text-xl font-bold text-indigo-700">
                      {filteredIncidents.filter(i => i.incidentInvolved?.includes(IncidentInvolved.VIOLENT_BEHAVIOR)).length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Overview and Assessment */}
      <Card className="p-0 overflow-hidden border-blue-200 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Security Risk Assessment
          </CardTitle>
          <CardDescription>
            Overall security posture and risk evaluation for your business
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Risk Score */}
            <div className="lg:col-span-1">
              <div className="flex flex-col items-center justify-center h-full p-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border">
                <div className="relative mb-2">
                  <svg className="w-32 h-32">
                    <circle 
                      className="text-gray-200" 
                      strokeWidth="8" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="56" 
                      cx="64" 
                      cy="64"
                    />
                    <circle 
                      className="text-red-500" 
                      strokeWidth="8" 
                      strokeDasharray={360} 
                      strokeDashoffset={360 * (1 - 0.68)} 
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="56" 
                      cx="64" 
                      cy="64"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-3xl font-bold">68</p>
                    <p className="text-xs text-muted-foreground">Risk Score</p>
                  </div>
                </div>
                <div className="text-center">
                  <Badge className="bg-amber-500 mb-1">Moderate Risk</Badge>
                  <p className="text-xs text-muted-foreground">Based on 32 risk factors</p>
                </div>
              </div>
            </div>
            
            {/* Security Metrics */}
            <div className="lg:col-span-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-red-600" />
                    <h3 className="text-sm font-medium text-red-700">Theft Trend</h3>
                  </div>
                  <p className="text-xl font-bold text-red-800">+16.4%</p>
                  <p className="text-xs text-red-600">Month-over-month increase</p>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <h3 className="text-sm font-medium text-amber-700">Avg. Response</h3>
                  </div>
                  <p className="text-xl font-bold text-amber-800">8.2 min</p>
                  <p className="text-xs text-amber-600">Improved by 1.3 minutes</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-medium text-blue-700">Security Staff</h3>
                  </div>
                  <p className="text-xl font-bold text-blue-800">74%</p>
                  <p className="text-xs text-blue-600">Of recommended coverage</p>
                </div>
                
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-sm font-medium text-emerald-700">Prevention</h3>
                  </div>
                  <p className="text-xl font-bold text-emerald-800">52%</p>
                  <p className="text-xs text-emerald-600">Of incidents prevented</p>
                </div>
              </div>
              
              <div className="bg-[#EFF4FF] p-4 rounded-lg border">
                <h3 className="text-sm font-medium mb-2">Executive Summary</h3>
                <p className="text-sm text-slate-700 mb-3">
                  Your security posture shows moderate risk levels with concerning trends in high-value retail theft. 
                  The 16.4% increase in theft incidents requires immediate attention. Key concerns include understaffing 
                  at high-risk stores, insufficient security camera coverage in electronics sections, and peak vulnerability 
                  periods during weekend evenings.
                </p>
                
                <h4 className="text-xs font-medium text-slate-700 mt-3 mb-1">CRITICAL RECOMMENDATIONS</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="bg-white p-2 rounded border text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="font-medium">Increase Security Staffing</span>
                    </div>
                    <p className="mt-1 pl-3 text-slate-600">+4 staff needed at high-risk stores</p>
                  </div>
                  <div className="bg-white p-2 rounded border text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="font-medium">Enhance Camera Systems</span>
                    </div>
                    <p className="mt-1 pl-3 text-slate-600">Review CCTV coverage with each site risk assessment</p>
                  </div>
                  <div className="bg-white p-2 rounded border text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="font-medium">Staff Training</span>
                    </div>
                    <p className="mt-1 pl-3 text-slate-600">Focus on theft prevention protocols</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High-Risk Stores Summary Card */}
      <Card className="p-0 overflow-hidden border-red-200 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2 bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-600" />
            High-Risk Stores - Shoplifting Hotspots
          </CardTitle>
          <CardDescription>
            Stores with the highest shoplifting incidents across your locations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                  <BarChart
                    data={incidentsByStore
                      .sort((a, b) => b.incidents - a.incidents)
                      .slice(0, 10)
                      .map((store) => ({
                        ...store,
                        risk: store.incidents > 20 ? 'High' : store.incidents > 10 ? 'Medium' : 'Low',
                      }))}
                    margin={{ top: 10, right: 30, left: 120, bottom: 20 }}
                    layout="vertical"
                    className="overflow-visible"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fontSize: 12 }}
                      width={110}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === "incidents") return [`${value} incidents`];
                        return [value];
                      }}
                      labelFormatter={(label) => `Store: ${label}`}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="incidents"
                      name="Theft Incidents"
                      fill="#f43f5e" 
                      radius={[0, 4, 4, 0]} 
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Store Layout Heatmap */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">In-Store Shoplifting Hotspot Map</h3>
                  <Select defaultValue="store1">
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      {incidentsByStore
                        .sort((a, b) => b.incidents - a.incidents)
                        .slice(0, 5)
                        .map((store, index) => (
                          <SelectItem key={index} value={`store${index + 1}`}>{store.name}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative bg-white rounded-lg border h-[250px] overflow-hidden block">
                  {/* Store Layout Background */}
                  <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 gap-0.5 p-2">
                    {Array.from({ length: 96 }).map((_, index) => (
                      <div key={index} className="border border-slate-100"></div>
                    ))}
                  </div>
                  
                  {/* Entrance */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-slate-200 text-slate-700 px-4 py-1 text-xs font-medium border-t border-slate-300 z-10">
                    Entrance
                  </div>
                  
                  {/* Checkout Area */}
                  <div className="absolute top-2 right-2 w-[100px] h-[50px] bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-700 border border-slate-300 z-10">
                    Checkout Area
                  </div>
                  
                  {/* Heatmap Hotspots */}
                  <div className="absolute top-[15%] right-[20%] w-24 h-24 bg-red-500 rounded-full opacity-60 flex items-center justify-center z-10">
                    <div className="text-xs text-white font-bold">Electronics<br/>41%</div>
                  </div>
                  
                  <div className="absolute top-[30%] left-[25%] w-20 h-20 bg-red-400 rounded-full opacity-50 flex items-center justify-center z-10">
                    <div className="text-xs text-white font-bold">Cosmetics<br/>23%</div>
                  </div>
                  
                  <div className="absolute bottom-[25%] left-[15%] w-16 h-16 bg-amber-500 rounded-full opacity-50 flex items-center justify-center z-10">
                    <div className="text-xs text-white font-bold">Clothing<br/>17%</div>
                  </div>
                  
                  <div className="absolute bottom-[30%] right-[30%] w-16 h-16 bg-amber-400 rounded-full opacity-50 flex items-center justify-center z-10">
                    <div className="text-xs text-white font-bold">Fragrance<br/>12%</div>
                  </div>
                  
                  <div className="absolute top-[55%] left-[45%] w-12 h-12 bg-blue-500 rounded-full opacity-40 flex items-center justify-center z-10">
                    <div className="text-xs text-white font-bold">Food<br/>7%</div>
                  </div>
                  
                  {/* Security Camera Positions */}
                  <div className="absolute top-3 left-3 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center border-2 border-white z-10" title="Security Camera">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute top-3 right-[110px] w-5 h-5 bg-green-600 rounded-full flex items-center justify-center border-2 border-white z-10" title="Security Camera">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute bottom-3 left-[30%] w-5 h-5 bg-green-600 rounded-full flex items-center justify-center border-2 border-white z-10" title="Security Camera">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  
                  {/* Blind Spots (Gaps in Coverage) */}
                  <div className="absolute top-[15%] left-[45%] w-16 h-16 border-2 border-dashed border-red-400 rounded-full z-10" title="Security Blind Spot"></div>
                  <div className="absolute bottom-[25%] right-[15%] w-14 h-14 border-2 border-dashed border-red-400 rounded-full z-10" title="Security Blind Spot"></div>
                </div>
                <div className="flex justify-between mt-2">
                  <div className="flex items-center text-xs gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      <span>Camera</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border-2 border-dashed border-red-400 rounded-full"></div>
                      <span>Blind spot</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    <Download className="h-3 w-3 mr-1" />
                    Export Map
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#EFF4FF] rounded-lg p-4 border">
                <h3 className="text-sm font-semibold mb-3">High-Risk Insights</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-medium text-slate-500">TOP 3 HIGH-RISK STORES</h4>
                    <ul className="mt-2 space-y-2">
                      {incidentsByStore
                        .sort((a, b) => b.incidents - a.incidents)
                        .slice(0, 3)
                        .map((store, index) => (
                          <li key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                            <span className="font-medium">{store.name}</span>
                            <Badge className="bg-red-500">{store.incidents} incidents</Badge>
                          </li>
                        ))}
                    </ul>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <h4 className="text-xs font-medium text-slate-500">INCIDENT BREAKDOWN</h4>
                    <div className="mt-2 space-y-2">
                      <div className="bg-white p-2 rounded border">
                        <div className="flex justify-between text-xs">
                          <span>Avg. value per stolen line item:</span>
                          <span className="font-semibold text-red-600">
                            {avgStolenLineItemValue != null
                              ? `£${avgStolenLineItemValue.toFixed(2)}`
                              : '—'}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <div className="flex justify-between text-xs">
                          <span>Peak shoplifting day (theft incidents):</span>
                          <span className="font-semibold text-amber-600">
                            {peakTheftDayLabel ?? '—'}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <div className="flex justify-between text-xs">
                          <span>Peak shoplifting time (thefts with time recorded):</span>
                          <span className="font-semibold text-amber-600">
                            {peakTheftHourLabel != null
                              ? `~${peakTheftHourLabel.hour}:00 (${peakTheftHourLabel.count} records)`
                              : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <h4 className="text-xs font-medium text-slate-500">RISK FACTORS</h4>
                    <ul className="mt-2 text-xs space-y-2">
                      {riskFactorSummaryLines.map((line, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <h4 className="text-xs font-medium text-slate-500">RECOMMENDED ACTIONS</h4>
                    <ul className="mt-2 text-xs space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                        <span>Use the High-Risk Stores and Stolen Items tabs to prioritise follow-up by site and category.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                        <span>When peak day or hour appears above, align staffing or patrols with those windows.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                        <span>Share filtered results with regional or store management for operational planning.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Security coverage</CardTitle>
                  <CardDescription className="text-xs">
                    Camera, EAS, and staffing coverage scores are not part of the incident export. Connect a site or audit
                    data source to show real coverage metrics here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-2 text-xs text-muted-foreground">
                  No coverage data loaded.
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Card className="p-0 overflow-hidden">
        <Tabs defaultValue="theft" value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-0">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <CardTitle>Theft Analysis Dashboard</CardTitle>
              <TabsList className="w-full md:w-auto overflow-x-auto">
                <TabsTrigger value="theft">Theft Patterns</TabsTrigger>
                <TabsTrigger value="products">Stolen Items</TabsTrigger>
                <TabsTrigger value="stores">High-Risk Stores</TabsTrigger>
                <TabsTrigger value="security">Security Analysis</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>
            </div>
            <CardDescription className="mt-2">
              Analyze theft data across time, location, and items to identify patterns
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            {/* Theft Analysis Tab */}
            <TabsContent value="theft" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Theft by Time of Day
                    </CardTitle>
                    <CardDescription>Peak hours for shoplifting incidents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { hour: '6-8 AM', incidents: 5, rate: '2.4%' },
                            { hour: '8-10 AM', incidents: 12, rate: '5.8%' },
                            { hour: '10-12 PM', incidents: 18, rate: '8.6%' },
                            { hour: '12-2 PM', incidents: 23, rate: '11.0%' },
                            { hour: '2-4 PM', incidents: 29, rate: '13.9%' },
                            { hour: '4-6 PM', incidents: 34, rate: '16.3%' },
                            { hour: '6-8 PM', incidents: 25, rate: '12.0%' },
                            { hour: '8-10 PM', incidents: 15, rate: '7.2%' },
                          ]}
                          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                          <YAxis 
                            yAxisId="left"
                            orientation="left"
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Number of Incidents', angle: -90, position: 'insideLeft', fontSize: 12, dx: -15 }}
                          />
                          <Tooltip 
                            formatter={(value, name) => [`${value} incidents`, 'Frequency']}
                            labelFormatter={(label) => `Time: ${label}`}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                          />
                          <Legend />
                          <Bar 
                            yAxisId="left"
                            dataKey="incidents" 
                            name="Theft Incidents" 
                            fill="#6366f1" 
                            radius={[4, 4, 0, 0]} 
                            barSize={30}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-4">
                      <Badge variant="outline" className="text-indigo-600 font-medium">
                        Peak Theft Time: 4-6 PM (16.3% of incidents)
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-2 bg-gradient-to-r from-orange-50 to-amber-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-orange-600" />
                      Theft by Day of Week
                    </CardTitle>
                    <CardDescription>Identifying high-risk days for theft</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { day: 'Monday', incidents: 12, rate: '10.2%' },
                            { day: 'Tuesday', incidents: 10, rate: '8.5%' },
                            { day: 'Wednesday', incidents: 8, rate: '6.8%' },
                            { day: 'Thursday', incidents: 15, rate: '12.7%' },
                            { day: 'Friday', incidents: 25, rate: '21.2%' },
                            { day: 'Saturday', incidents: 30, rate: '25.4%' },
                            { day: 'Sunday', incidents: 18, rate: '15.2%' },
                          ]}
                          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Number of Incidents', angle: -90, position: 'insideLeft', fontSize: 12, dx: -15 }}
                          />
                          <Tooltip 
                            formatter={(value, name) => [`${value} incidents`, 'Frequency']}
                            labelFormatter={(label) => `Day: ${label}`}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                          />
                          <Legend />
                          <Bar 
                            dataKey="incidents" 
                            name="Theft Incidents" 
                            fill="#f97316"
                            radius={[4, 4, 0, 0]} 
                            barSize={30}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-4">
                      <Badge variant="outline" className="text-orange-600 font-medium">
                        Highest Risk Day: Saturday (25.4% of incidents)
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2 bg-gradient-to-r from-emerald-50 to-teal-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    Theft Location Heatmap
                  </CardTitle>
                  <CardDescription>In-store theft hotspots and patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-9">
                      <div className="bg-white rounded-lg border h-[350px] relative overflow-hidden">
                        <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 gap-0.5 p-2">
                          {Array.from({ length: 96 }).map((_, index) => (
                            <div key={index} className="border border-slate-100"></div>
                          ))}
                        </div>
                        
                        {/* Entrance */}
                        <div className="absolute top-[45%] left-0 w-16 h-10 flex items-center justify-center z-10">
                          <div className="text-xs font-medium">Entrance</div>
                        </div>
                        
                        {/* Checkout Area - High Risk */}
                        <div className="absolute top-[25%] left-[15%] w-20 h-20 bg-red-500 rounded-full opacity-60 flex items-center justify-center z-10">
                          <div className="text-xs text-white font-bold">Checkout<br/>32%</div>
                        </div>
                        
                        {/* Electronics - Very High Risk */}
                        <div className="absolute top-[30%] right-[20%] w-24 h-24 bg-red-600 rounded-full opacity-70 flex items-center justify-center z-10">
                          <div className="text-xs text-white font-bold">Electronics<br/>41%</div>
                        </div>
                        
                        {/* Cosmetics - High Risk */}
                        <div className="absolute bottom-[30%] right-[30%] w-20 h-20 bg-red-500 rounded-full opacity-60 flex items-center justify-center z-10">
                          <div className="text-xs text-white font-bold">Cosmetics<br/>18%</div>
                        </div>
                        
                        {/* Clothing - Medium Risk */}
                        <div className="absolute bottom-[40%] left-[30%] w-16 h-16 bg-amber-500 rounded-full opacity-60 flex items-center justify-center z-10">
                          <div className="text-xs text-white font-bold">Clothing<br/>14%</div>
                        </div>
                        
                        {/* Food - Low Risk */}
                        <div className="absolute top-[60%] left-[40%] w-12 h-12 bg-blue-500 rounded-full opacity-50 flex items-center justify-center z-10">
                          <div className="text-xs text-white font-bold">Food<br/>9%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-3">
                      <div className="bg-white rounded-lg border p-3 h-full">
                        <h4 className="text-sm font-medium mb-2">Theft Hotspots</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-600"></div>
                            <span className="text-xs">Very High Risk (30%+)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-xs">High Risk (15-30%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-xs">Medium Risk (10-15%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-xs">Low Risk (&lt;10%)</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t">
                          <h4 className="text-sm font-medium mb-2">Risk Insights</h4>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            <li>• Insights reflect filtered incidents and stolen line items in this period</li>
                            <li>• Category and product charts need category/product fields on stolen items</li>
                            <li>• Compare stores using incident counts and financial impact tabs</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Theft Trend Analysis
                    </CardTitle>
                    <CardDescription>Month-over-month theft incident trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                        <LineChart 
                          data={theftTrendByMonth}
                          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Incidents', angle: -90, position: 'insideLeft', fontSize: 12, dx: -15 }}
                          />
                          <Tooltip 
                            formatter={(value) => [`${value} incidents`]}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="incidents" 
                            name="Theft Incidents" 
                            stroke="#8b5cf6" 
                            strokeWidth={2}
                            dot={{ stroke: '#8b5cf6', strokeWidth: 2, r: 4, fill: 'white' }} 
                            activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#8b5cf6' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-2 bg-gradient-to-r from-sky-50 to-blue-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-sky-600" />
                      Incident involvement
                    </CardTitle>
                    <CardDescription>Flags recorded on incidents in the selected period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                        <PieChart>
                          <Pie
                            data={incidentsByInvolvement.map(({ name, value, color }) => ({
                              name,
                              value,
                              color,
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {incidentsByInvolvement.map((entry, index) => (
                              <Cell key={`inv-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value} incidents`, String(name)]}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                          />
                          <Legend 
                            layout="vertical" 
                            verticalAlign="middle"
                            align="right"
                            iconType="circle"
                            formatter={(value, entry) => <span className="text-xs">{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <Card className="shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2 bg-gradient-to-r from-emerald-50 to-green-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-emerald-600" />
                    Most Frequently Stolen Items
                  </CardTitle>
                  <CardDescription>Top products targeted by shoplifters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topStolenProductRows}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 120, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" domain={[0, 'dataMax + 5']} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tick={{ fontSize: 12 }}
                          width={110}
                        />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === "Items Stolen") return [`${value} line items`];
                            if (name === "Recovered") return [`${value} recovered`];
                            if (name === "Lost") return [`${value} not recovered`];
                            return [value];
                          }}
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="value" 
                          name="Items Stolen" 
                          fill="#10b981" 
                          radius={[0, 4, 4, 0]} 
                          barSize={20}
                        />
                        <Bar 
                          dataKey="recovery" 
                          name="Recovered" 
                          fill="#3b82f6" 
                          radius={[0, 4, 4, 0]} 
                          barSize={10}
                          style={{ marginTop: '10px' }}
                        />
                        <Bar 
                          dataKey="loss" 
                          name="Lost" 
                          fill="#f43f5e" 
                          radius={[0, 4, 4, 0]} 
                          barSize={10}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-yellow-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-amber-600" />
                      Theft by Product Category
                    </CardTitle>
                    <CardDescription>Distribution across product types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={theftCategoryPieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={{ stroke: '#c0c0c0', strokeWidth: 1 }}
                          >
                            {theftCategoryPieData.map((entry, index) => (
                              <Cell key={`cat-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value} stolen line items`, String(name)]}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-2 bg-gradient-to-r from-rose-50 to-red-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-rose-600" />
                      Financial Impact Analysis
                    </CardTitle>
                    <CardDescription>Value of stolen items vs recovered items</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={financialImpactByCategory}
                          margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="category" 
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Value (£)', angle: -90, position: 'insideLeft', fontSize: 12, dx: -15 }}
                          />
                          <Tooltip 
                            formatter={(value) => [`£${value.toLocaleString()}`]}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                          />
                          <Legend />
                          <Bar 
                            dataKey="stolen" 
                            name="Value Stolen" 
                            fill="#f43f5e" 
                            radius={[4, 4, 0, 0]} 
                            barSize={25}
                          />
                          <Bar 
                            dataKey="recovered" 
                            name="Value Recovered" 
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                            barSize={25}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-4">
                      <Badge variant="outline" className="text-rose-600 font-medium">
                        {financialTotalsFromStolenItems.stolen + financialTotalsFromStolenItems.recovered > 0
                          ? `Recorded value — stolen: £${financialTotalsFromStolenItems.stolen.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} · recovered: £${financialTotalsFromStolenItems.recovered.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} (${financialTotalsFromStolenItems.pct}% recovered share)`
                          : 'No stolen item values in filtered incidents'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Stores Comparison Tab */}
            <TabsContent value="stores" className="space-y-6">
              <Card className="shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2 bg-gradient-to-r from-red-50 to-rose-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    High-Risk Stores
                  </CardTitle>
                  <CardDescription>Locations with highest theft rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={incidentsByStore
                          .sort((a, b) => b.incidents - a.incidents)
                          .slice(0, 8)
                          .map((store) => ({
                            ...store,
                            risk: store.incidents > 20 ? 'High' : store.incidents > 10 ? 'Medium' : 'Low',
                          }))}
                        margin={{ top: 10, right: 30, left: 120, bottom: 20 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tick={{ fontSize: 12 }}
                          width={110}
                        />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === "Incidents") return [`${value} incidents`];
                            return [value];
                          }}
                          labelFormatter={(label) => `Store: ${label}`}
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="incidents"
                          name="Incidents"
                          fill="#f43f5e" 
                          radius={[0, 4, 4, 0]} 
                          barSize={25}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Store Comparison Table */}
              <Card className="shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-gray-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-slate-600" />
                    Store Comparison
                  </CardTitle>
                  <CardDescription>Comprehensive analysis across all locations</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200">
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Store</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Theft Incidents</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Risk Level</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Theft per 1000 Customers</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Most Stolen Item</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Peak Theft Time</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Recovery Rate</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {incidentsByStore
                          .sort((a, b) => b.incidents - a.incidents)
                          .map((store, index) => {
                            const riskLevel = store.incidents > 20 ? 'High' : store.incidents > 10 ? 'Medium' : 'Low';
                            const riskColorClass = 
                              riskLevel === 'High' ? 'bg-red-100 text-red-800' : 
                              riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800' : 
                              'bg-blue-100 text-blue-800';

                            return (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-[#EFF4FF]'}>
                                <td className="px-4 py-3 text-sm font-medium text-slate-900">{store.name}</td>
                                <td className="px-4 py-3 text-sm text-center">{store.incidents}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${riskColorClass}`}>
                                    {riskLevel}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-center text-muted-foreground">—</td>
                                <td className="px-4 py-3 text-sm text-center text-muted-foreground">—</td>
                                <td className="px-4 py-3 text-sm text-center text-muted-foreground">—</td>
                                <td className="px-4 py-3 text-sm text-center text-muted-foreground">—</td>
                                <td className="px-4 py-3 text-center text-muted-foreground text-sm">—</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      Risk Factors Analysis
                    </CardTitle>
                    <CardDescription>
                      Store layout, footfall, and inventory attributes are not in the incident export; correlation scores are
                      not shown.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-purple-100 bg-purple-50 p-4 text-sm text-purple-900">
                      Use incident counts, financial impact, and filters above to compare sites. Statistical correlation with
                      store characteristics requires linking external site master or survey data.
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-sky-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      Geographic Distribution
                    </CardTitle>
                    <CardDescription>Regional analysis of theft incidents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-center p-6">
                        <MapPin className="h-10 w-10 text-blue-400 mx-auto mb-2" />
                        <p className="text-sm text-blue-700">
                          A regional map can be added when incidents include consistent region or coordinates. Use the
                          store and date filters to compare locations with the charts above.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Multi-store Trend Analysis */}
              <Card className="shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    Multi-Store Theft Trends
                  </CardTitle>
                  <CardDescription>Comparative trend analysis across top 5 highest-risk stores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { month: 'Jan', 'Store A': 24, 'Store B': 18, 'Store C': 12, 'Store D': 10, 'Store E': 8 },
                          { month: 'Feb', 'Store A': 22, 'Store B': 16, 'Store C': 15, 'Store D': 8, 'Store E': 10 },
                          { month: 'Mar', 'Store A': 26, 'Store B': 20, 'Store C': 13, 'Store D': 12, 'Store E': 8 },
                          { month: 'Apr', 'Store A': 28, 'Store B': 22, 'Store C': 16, 'Store D': 14, 'Store E': 12 },
                          { month: 'May', 'Store A': 32, 'Store B': 24, 'Store C': 18, 'Store D': 15, 'Store E': 14 },
                          { month: 'Jun', 'Store A': 30, 'Store B': 26, 'Store C': 20, 'Store D': 16, 'Store E': 15 },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          label={{ value: 'Theft Incidents', angle: -90, position: 'insideLeft', dx: -15 }}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value} incidents`]}
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="Store A" 
                          stroke="#f43f5e" 
                          strokeWidth={2}
                          dot={{ fill: '#f43f5e', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Store B" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          dot={{ fill: '#8b5cf6', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Store C" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Store D" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Store E" 
                          stroke="#f97316" 
                          strokeWidth={2}
                          dot={{ fill: '#f97316', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <h4 className="text-sm font-medium text-indigo-700 mb-2">Trend Insights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded border border-indigo-100">
                        <div className="text-indigo-600 font-semibold text-sm">Highest Growth Rate</div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="font-medium">Store A</span>
                          <Badge className="bg-red-500">+33% in 6 months</Badge>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border border-indigo-100">
                        <div className="text-indigo-600 font-semibold text-sm">Common Pattern</div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="font-medium">Seasonal Peak</span>
                          <Badge className="bg-amber-500">May-June</Badge>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border border-indigo-100">
                        <div className="text-indigo-600 font-semibold text-sm">Recommendation</div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="font-medium">Increase Security</span>
                          <Badge className="bg-emerald-500">Before Peaks</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Analysis Tab */}
            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-gray-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-slate-600" />
                      Security Measures Effectiveness
                    </CardTitle>
                    <CardDescription>Impact of current security measures on theft prevention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center rounded-lg border border-dashed bg-slate-50 px-4 text-center text-sm text-muted-foreground">
                      Security measure effectiveness is not calculated from incident exports. Wire a loss-prevention or audit API to
                      populate this chart.
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Security Staffing Impact
                    </CardTitle>
                    <CardDescription>Correlation between security staff levels and theft incidents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center rounded-lg border border-dashed bg-slate-50 px-4 text-center text-sm text-muted-foreground">
                      Staffing correlation charts require staffing levels and floor areas per site. These fields are not part of the
                      standard incident payload.
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="shadow-sm hover:shadow-md transition-all lg:col-span-1">
                  <CardHeader className="pb-2 bg-gradient-to-r from-emerald-50 to-green-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-emerald-600" />
                      Response Time Analysis
                    </CardTitle>
                    <CardDescription>Impact of response time on theft prevention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-[200px] flex flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50 px-4 py-8 text-center text-sm text-muted-foreground">
                      Response-time buckets are not captured on incidents. Add timestamps or dispatch workflow data to enable this
                      breakdown.
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm hover:shadow-md transition-all lg:col-span-2">
                  <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-yellow-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-amber-600" />
                      Security Gaps Analysis
                    </CardTitle>
                    <CardDescription>Critical vulnerabilities and recommended security measures</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-amber-50 border-y border-amber-100">
                            <th className="px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">Gap Area</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-amber-700 uppercase tracking-wider">Risk Level</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">Impact</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">Recommended Measure</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-amber-700 uppercase tracking-wider">Priority</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-100">
                          <tr className="bg-white">
                            <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={5}>
                              Automated gap analysis is not generated from incident data. Use operational audits and site visits to
                              record vulnerabilities; an API can populate this table later.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-gray-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-slate-600" />
                    Financial Impact & ROI Analysis
                  </CardTitle>
                  <CardDescription>Security investment effectiveness and financial return</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[220px] flex flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50 px-4 py-10 text-center text-sm text-muted-foreground">
                    ROI and security investment figures require finance and capex feeds. They are not inferred from incident records
                    alone.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Incidents by Type */}
                <Card className="shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-violet-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-indigo-600" />
                      Incidents by Type
                    </CardTitle>
                    <CardDescription>Distribution of incidents by category</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={incidentsByType}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {incidentsByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => {
                              const numValue = parseFloat(value as string);
                              const percentage = (numValue / totalIncidents * 100).toFixed(1);
                              return [`${value} incidents (${percentage}%)`];
                            }}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Incidents by Store */}
                <Card className="shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-sky-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      Incidents by Store
                    </CardTitle>
                    <CardDescription>Total number of incidents per store location</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={incidentsByStore}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                          <Tooltip 
                            formatter={(value) => [`${value} incidents`]}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                          />
                          <Legend />
                          <Bar 
                            dataKey="incidents" 
                            name="Total Incidents" 
                            fill="#3b82f6"
                            radius={[0, 4, 4, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Trend Line Chart */}
              <Card className="shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2 bg-gradient-to-r from-emerald-50 to-teal-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Incident Trends
                  </CardTitle>
                  <CardDescription>Monthly trend of all incident types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={theftTrendByMonth}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value) => [`${value} incidents`]}
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="incidents" 
                          name="Theft Incidents" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ stroke: '#10b981', strokeWidth: 2, r: 4, fill: 'white' }} 
                          activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#10b981' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Report Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Monthly Reports</h3>
                <p className="text-sm text-muted-foreground">Detailed monthly analysis</p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Quarterly Reports</h3>
                <p className="text-sm text-muted-foreground">Quarterly trends and analysis</p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-3 rounded-lg">
                <PieChartIcon className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium">Custom Reports</h3>
                <p className="text-sm text-muted-foreground">Create tailored reports</p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ReportsDashboard 