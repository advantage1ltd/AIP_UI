import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, BookOpen, Plus, Search, Filter, Calendar, Clock, AlertTriangle, User, MapPin, Eye, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { findCustomerById } from "@/hooks/useAvailableCustomers"
import { useToast } from "@/hooks/use-toast"
import type { 
  DailyOccurrenceEntry, 
  OccurrenceType, 
  OccurrenceSeverity, 
  OccurrenceStatus,
  CreateOccurrenceRequest,
  UpdateOccurrenceRequest,
  DailyOccurrenceBookFilters,
  DailyOccurrenceBookStats
} from "@/types/dailyOccurrenceBook"

const OCCURRENCE_TYPES: { value: OccurrenceType; label: string }[] = [
  { value: 'general_observation', label: 'General Observation' },
  { value: 'security_incident', label: 'Security Incident' },
  { value: 'safety_concern', label: 'Safety Concern' },
  { value: 'visitor_log', label: 'Visitor Log' },
  { value: 'maintenance_issue', label: 'Maintenance Issue' },
  { value: 'equipment_fault', label: 'Equipment Fault' },
  { value: 'staff_arrival_departure', label: 'Staff Arrival/Departure' },
  { value: 'emergency_test', label: 'Emergency Test' },
  { value: 'weather_condition', label: 'Weather Condition' },
  { value: 'other', label: 'Other' }
]

const SEVERITY_LEVELS: { value: OccurrenceSeverity; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
]

const STATUS_OPTIONS: { value: OccurrenceStatus; label: string; color: string }[] = [
  { value: 'open', label: 'Open', color: 'bg-blue-100 text-blue-800' },
  { value: 'investigating', label: 'Investigating', color: 'bg-purple-100 text-purple-800' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' }
]

export default function CustomerDailyOccurrenceBook() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  // State management
  const [occurrences, setOccurrences] = useState<DailyOccurrenceEntry[]>([])
  const [stats, setStats] = useState<DailyOccurrenceBookStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<{ id: number; name: string } | null>(null)
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)
  const [selectedSiteName, setSelectedSiteName] = useState<string | null>(null)
  const [sites, setSites] = useState<any[]>([])
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedOccurrence, setSelectedOccurrence] = useState<DailyOccurrenceEntry | null>(null)
  
  // Filter states
  const [filters, setFilters] = useState<DailyOccurrenceBookFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  
  // Form state for creating/editing occurrences
  const [formData, setFormData] = useState<Partial<CreateOccurrenceRequest>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    severity: 'low',
    occurrenceType: 'general_observation',
    followUpRequired: false,
    managerNotified: false
  })

  // Fetch site name
  const fetchSiteName = async (customerId: number, siteId: string) => {
    try {
      const response = await fetch('/api/dashboard/sites', {
        headers: {
          'X-Customer-Id': customerId.toString()
        }
      })
      
      if (response.ok) {
        const sites = await response.json()
        const site = sites.find((s: any) => s.id === siteId)
        if (site) {
          setSelectedSiteName(site.locationName)
          console.log('CustomerDailyOccurrenceBook: Found site name:', site.locationName)
        }
      }
    } catch (error) {
      console.error('Failed to fetch site name:', error)
    }
  }

  // Load customer data
  useEffect(() => {
    const loadCustomer = async () => {
      try {
        if (authLoading || !user) return

        const urlCustomerId = searchParams.get('customerId')
        const urlSiteId = searchParams.get('siteId')
        const userCustomerId = user?.customerId

        // Determine target customer ID
        const targetCustomerId = urlCustomerId ? parseInt(urlCustomerId) : userCustomerId

        console.log('CustomerDailyOccurrenceBook: URL customerId:', urlCustomerId)
        console.log('CustomerDailyOccurrenceBook: URL siteId:', urlSiteId)
        console.log('CustomerDailyOccurrenceBook: User customerId:', userCustomerId)
        console.log('CustomerDailyOccurrenceBook: Target customerId:', targetCustomerId)

        if (!targetCustomerId) {
          setError('No customer ID provided')
          setLoading(false)
          return
        }

        // Find customer in available customers
        const customerData = await findCustomerById(targetCustomerId, user)
        if (!customerData) {
          setError('Customer not found or access denied')
          setLoading(false)
          return
        }

        console.log('CustomerDailyOccurrenceBook: Found customer:', customerData)

        // Verify access
        if (user.role === 'AdvantageOneOfficer' && user.assignedCustomerIds && !user.assignedCustomerIds.includes(targetCustomerId)) {
          setError('Access denied: You are not assigned to this customer')
          setLoading(false)
          return
        }

        console.log('CustomerDailyOccurrenceBook: Access granted - setting customer')
        setCustomer({ id: targetCustomerId, name: customerData.companyName })
        
        if (urlSiteId) {
          setSelectedSiteId(urlSiteId)
          await fetchSiteName(targetCustomerId, urlSiteId)
        }

      } catch (err) {
        console.error('CustomerDailyOccurrenceBook: Error loading customer:', err)
        setError('Failed to load customer data')
      } finally {
        setLoading(false)
      }
    }

    loadCustomer()
  }, [user, authLoading, searchParams])

  // Fetch sites for the customer
  useEffect(() => {
    const fetchSites = async () => {
      if (!customer) return

      try {
        const response = await fetch('/api/dashboard/sites', {
          headers: {
            'X-Customer-Id': customer.id.toString()
          }
        })
        
        if (response.ok) {
          const sitesData = await response.json()
          setSites(sitesData)
        }
      } catch (error) {
        console.error('Failed to fetch sites:', error)
      }
    }

    fetchSites()
  }, [customer])

  // Fetch occurrences data
  const fetchOccurrences = async () => {
    if (!customer) return

    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        customerId: customer.id.toString(),
        ...(selectedSiteId && { siteId: selectedSiteId }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.occurrenceType?.length && { occurrenceType: filters.occurrenceType.join(',') }),
        ...(filters.severity?.length && { severity: filters.severity.join(',') }),
        ...(filters.status?.length && { status: filters.status.join(',') }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/customers/${customer.id}/daily-occurrence-book?${queryParams}`)
      const result = await response.json()

      if (result.success) {
        setOccurrences(result.data)
        setStats(result.stats)
      } else {
        throw new Error(result.message || 'Failed to fetch occurrence data')
      }
    } catch (error) {
      console.error('Error fetching occurrences:', error)
      setError('Failed to load occurrence data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOccurrences()
  }, [customer, selectedSiteId, filters, searchTerm])

  // Handle form submission for creating/updating occurrences
  const handleSubmit = async (isEdit = false) => {
    if (!customer || !selectedSiteId) {
      toast({
        title: "Error",
        description: "Customer and site must be selected",
        variant: "destructive"
      })
      return
    }

    try {
      const requestData = {
        ...formData,
        customerId: customer.id,
        siteId: selectedSiteId,
        ...(isEdit && selectedOccurrence && { id: selectedOccurrence.id })
      }

      const url = isEdit 
        ? `/api/customers/${customer.id}/daily-occurrence-book/${selectedOccurrence?.id}`
        : `/api/customers/${customer.id}/daily-occurrence-book`
      
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: isEdit ? "Occurrence Updated" : "Occurrence Created",
          description: result.message || `Occurrence has been ${isEdit ? 'updated' : 'created'} successfully`,
          variant: "default"
        })
        
        setCreateDialogOpen(false)
        setEditDialogOpen(false)
        setFormData({
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          severity: 'low',
          occurrenceType: 'general_observation',
          followUpRequired: false,
          managerNotified: false
        })
        setSelectedOccurrence(null)
        
        await fetchOccurrences()
      } else {
        throw new Error(result.message || `Failed to ${isEdit ? 'update' : 'create'} occurrence`)
      }
    } catch (error) {
      console.error('Error submitting occurrence:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${isEdit ? 'update' : 'create'} occurrence`,
        variant: "destructive"
      })
    }
  }

  // Handle occurrence deletion
  const handleDelete = async (occurrence: DailyOccurrenceEntry) => {
    if (!customer) return

    try {
      const response = await fetch(`/api/customers/${customer.id}/daily-occurrence-book/${occurrence.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Occurrence Deleted",
          description: "Occurrence has been deleted successfully",
          variant: "default"
        })
        
        await fetchOccurrences()
      } else {
        throw new Error(result.message || 'Failed to delete occurrence')
      }
    } catch (error) {
      console.error('Error deleting occurrence:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete occurrence",
        variant: "destructive"
      })
    }
  }

  // Get severity badge color
  const getSeverityColor = (severity: OccurrenceSeverity) => {
    return SEVERITY_LEVELS.find(s => s.value === severity)?.color || 'bg-gray-100 text-gray-800'
  }

  // Get status badge color
  const getStatusColor = (status: OccurrenceStatus) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800'
  }

  if (loading && !customer) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          {error || 'Customer not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/management/customer-reporting')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customer Reporting
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Daily Occurrence Book (DOB)
            </h1>
            <p className="text-muted-foreground">
              {customer.name} {selectedSiteName && `- ${selectedSiteName}`}
            </p>
          </div>
        </div>
        
        <Button onClick={() => setCreateDialogOpen(true)} disabled={!selectedSiteId}>
          <Plus className="h-4 w-4 mr-2" />
          Add Occurrence
        </Button>
      </div>

      {/* Site Selection */}
      {sites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Site Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedSiteId || ''} onValueChange={setSelectedSiteId}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select a site to view occurrences" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.locationName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {!selectedSiteId ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select a Site</h3>
          <p className="text-muted-foreground">
            Please select a site above to view and manage daily occurrence records.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Entries</p>
                      <p className="text-2xl font-bold">{stats.totalEntries}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Open Occurrences</p>
                      <p className="text-2xl font-bold">{stats.openOccurrences}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Follow-ups Pending</p>
                      <p className="text-2xl font-bold">{stats.followUpsPending}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">This Week</p>
                      <p className="text-2xl font-bold">{stats.entriesThisWeek}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search occurrences..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select 
                    value={filters.occurrenceType?.join(',') || 'all'} 
                    onValueChange={(value) => setFilters({...filters, occurrenceType: value === 'all' ? undefined : [value as OccurrenceType]})}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {OCCURRENCE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={filters.severity?.join(',') || 'all'} 
                    onValueChange={(value) => setFilters({...filters, severity: value === 'all' ? undefined : [value as OccurrenceSeverity]})}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      {SEVERITY_LEVELS.map((severity) => (
                        <SelectItem key={severity.value} value={severity.value}>
                          {severity.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={filters.status?.join(',') || 'all'} 
                    onValueChange={(value) => setFilters({...filters, status: value === 'all' ? undefined : [value as OccurrenceStatus]})}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Occurrences Table */}
          <Card>
            <CardHeader>
              <CardTitle>Occurrence Records</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : occurrences.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Occurrences Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || Object.keys(filters).length > 0 
                      ? 'Try adjusting your search criteria or filters.'
                      : 'No occurrences have been recorded for this site yet.'
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {occurrences.map((occurrence) => (
                        <TableRow key={occurrence.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {new Date(occurrence.date).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {occurrence.time}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {OCCURRENCE_TYPES.find(t => t.value === occurrence.occurrenceType)?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {occurrence.title}
                          </TableCell>
                          <TableCell>
                            <Badge className={getSeverityColor(occurrence.severity)}>
                              {SEVERITY_LEVELS.find(s => s.value === occurrence.severity)?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(occurrence.status)}>
                              {STATUS_OPTIONS.find(s => s.value === occurrence.status)?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{occurrence.reportedBy.name}</div>
                                <div className="text-sm text-muted-foreground">{occurrence.reportedBy.role}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate max-w-[120px]">{occurrence.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOccurrence(occurrence)
                                  setViewDialogOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOccurrence(occurrence)
                                  setFormData({
                                    ...occurrence,
                                    witnessNames: occurrence.witnessNames || []
                                  })
                                  setEditDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(occurrence)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Create Occurrence Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Occurrence</DialogTitle>
            <DialogDescription>
              Enter the occurrence details below. All required fields must be completed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="occurrenceType">Type</Label>
                <Select value={formData.occurrenceType} onValueChange={(value) => setFormData({...formData, occurrenceType: value as OccurrenceType})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCURRENCE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select value={formData.severity} onValueChange={(value) => setFormData({...formData, severity: value as OccurrenceSeverity})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_LEVELS.map((severity) => (
                      <SelectItem key={severity.value} value={severity.value}>
                        {severity.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Brief title for the occurrence"
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Specific location within the site"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Detailed description of the occurrence"
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="actionTaken">Action Taken</Label>
              <Textarea
                id="actionTaken"
                value={formData.actionTaken || ''}
                onChange={(e) => setFormData({...formData, actionTaken: e.target.value})}
                placeholder="What action was taken at the time"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="followUpRequired"
                checked={formData.followUpRequired}
                onCheckedChange={(checked) => setFormData({...formData, followUpRequired: checked})}
              />
              <Label htmlFor="followUpRequired">Follow-up Required</Label>
            </div>
            
            {formData.followUpRequired && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="followUpDate">Follow-up Date</Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={formData.followUpDate || ''}
                    onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="followUpNotes">Follow-up Notes</Label>
                  <Textarea
                    id="followUpNotes"
                    value={formData.followUpNotes || ''}
                    onChange={(e) => setFormData({...formData, followUpNotes: e.target.value})}
                    placeholder="Notes for follow-up"
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                id="managerNotified"
                checked={formData.managerNotified}
                onCheckedChange={(checked) => setFormData({...formData, managerNotified: checked})}
              />
              <Label htmlFor="managerNotified">Manager Notified</Label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSubmit(false)}>
                Create Occurrence
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Occurrence Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open)
        if (!open) {
          setSelectedOccurrence(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Occurrence</DialogTitle>
            <DialogDescription>
              Update the occurrence details below. All required fields must be completed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4">
            {/* Same form fields as create dialog */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-time">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-occurrenceType">Type</Label>
                <Select value={formData.occurrenceType} onValueChange={(value) => setFormData({...formData, occurrenceType: value as OccurrenceType})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCURRENCE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-severity">Severity</Label>
                <Select value={formData.severity} onValueChange={(value) => setFormData({...formData, severity: value as OccurrenceSeverity})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_LEVELS.map((severity) => (
                      <SelectItem key={severity.value} value={severity.value}>
                        {severity.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title || ''}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Brief title for the occurrence"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location || ''}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Specific location within the site"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Detailed description of the occurrence"
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-actionTaken">Action Taken</Label>
              <Textarea
                id="edit-actionTaken"
                value={formData.actionTaken || ''}
                onChange={(e) => setFormData({...formData, actionTaken: e.target.value})}
                placeholder="What action was taken at the time"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-followUpRequired"
                checked={formData.followUpRequired}
                onCheckedChange={(checked) => setFormData({...formData, followUpRequired: checked})}
              />
              <Label htmlFor="edit-followUpRequired">Follow-up Required</Label>
            </div>
            
            {formData.followUpRequired && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-followUpDate">Follow-up Date</Label>
                  <Input
                    id="edit-followUpDate"
                    type="date"
                    value={formData.followUpDate || ''}
                    onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-followUpNotes">Follow-up Notes</Label>
                  <Textarea
                    id="edit-followUpNotes"
                    value={formData.followUpNotes || ''}
                    onChange={(e) => setFormData({...formData, followUpNotes: e.target.value})}
                    placeholder="Notes for follow-up"
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-managerNotified"
                checked={formData.managerNotified}
                onCheckedChange={(checked) => setFormData({...formData, managerNotified: checked})}
              />
              <Label htmlFor="edit-managerNotified">Manager Notified</Label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSubmit(true)}>
                Update Occurrence
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Occurrence Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Occurrence Details</DialogTitle>
            <DialogDescription>
              View the complete details of this occurrence below.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOccurrence && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <p className="font-medium">{new Date(selectedOccurrence.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Time</Label>
                  <p className="font-medium">{selectedOccurrence.time}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Type</Label>
                  <p className="font-medium">
                    {OCCURRENCE_TYPES.find(t => t.value === selectedOccurrence.occurrenceType)?.label}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Severity</Label>
                  <Badge className={getSeverityColor(selectedOccurrence.severity)}>
                    {SEVERITY_LEVELS.find(s => s.value === selectedOccurrence.severity)?.label}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Title</Label>
                <p className="font-medium">{selectedOccurrence.title}</p>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Location</Label>
                <p className="font-medium">{selectedOccurrence.location}</p>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Description</Label>
                <p className="mt-1">{selectedOccurrence.description}</p>
              </div>
              
              {selectedOccurrence.actionTaken && (
                <div>
                  <Label className="text-sm text-muted-foreground">Action Taken</Label>
                  <p className="mt-1">{selectedOccurrence.actionTaken}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Reported By</Label>
                  <p className="font-medium">{selectedOccurrence.reportedBy.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOccurrence.reportedBy.role}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedOccurrence.status)}>
                    {STATUS_OPTIONS.find(s => s.value === selectedOccurrence.status)?.label}
                  </Badge>
                </div>
              </div>
              
              {selectedOccurrence.followUpRequired && (
                <div>
                  <Label className="text-sm text-muted-foreground">Follow-up Information</Label>
                  <div className="mt-1 space-y-2">
                    {selectedOccurrence.followUpDate && (
                      <p><span className="font-medium">Date:</span> {new Date(selectedOccurrence.followUpDate).toLocaleDateString()}</p>
                    )}
                    {selectedOccurrence.followUpNotes && (
                      <p><span className="font-medium">Notes:</span> {selectedOccurrence.followUpNotes}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p><span className="font-medium">Created:</span> {new Date(selectedOccurrence.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Updated:</span> {new Date(selectedOccurrence.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}