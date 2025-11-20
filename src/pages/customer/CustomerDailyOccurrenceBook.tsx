import { useState, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, BookOpen, Plus, Search, Calendar, Clock, User, MapPin, Eye, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { findCustomerById } from "@/hooks/useAvailableCustomers"
import { useToast } from "@/hooks/use-toast"
import { siteService } from "@/services/siteService"
import { getAuthHeaders } from "@/services/auth"
import { BASE_API_URL } from "@/config/api"
import type { 
  DailyOccurrenceEntry,
  DailyOccurrenceBookFilters,
  DailyOccurrenceBookStats,
  CreateOccurrenceRequest,
  UpdateOccurrenceRequest,
  DailyOccurrenceCode
} from "@/types/dailyOccurrenceBook"

const DOB_CODES: { value: DailyOccurrenceCode; label: string; description: string }[] = [
  { value: 'A', label: 'Arrest', description: 'Arrest' },
  { value: 'B', label: 'Deter', description: 'Deter' },
  { value: 'C', label: 'Theft', description: 'Theft' },
  { value: 'D', label: 'Violent Behaviour', description: 'Violent Behaviour' },
  { value: 'E', label: 'Abusive Behaviour', description: 'Abusive Behaviour' },
  { value: 'F', label: 'Ban from Store', description: 'Ban from Store' },
  { value: 'G', label: 'Criminal Damage', description: 'Criminal Damage' },
  { value: 'H', label: 'Underage Purchase', description: 'Underage Purchase' },
  { value: 'J', label: 'Credit Card Fraud', description: 'Credit Card Fraud' },
  { value: 'K', label: 'Anti-Social Behaviour', description: 'Anti-Social Behaviour' },
  { value: 'L', label: 'Suspicious Behaviour', description: 'Suspicious Behaviour' },
  { value: 'M', label: 'Other', description: 'Other' }
]

type OccurrenceFormState = Partial<CreateOccurrenceRequest> & { id?: string }

const getCodeMeta = (code?: string) => DOB_CODES.find((c) => c.value === code)?.label ?? code ?? 'Unknown'

const ALL_SITES_OPTION = 'all-sites'

const getDefaultFormState = (): OccurrenceFormState => ({
	date: new Date().toISOString().split('T')[0],
	time: new Date().toTimeString().slice(0, 5),
	code: 'A' as DailyOccurrenceCode,
	storeName: '',
	storeNumber: '',
	officerName: '',
	details: '',
	signature: ''
})

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
  const [selectedSiteId, setSelectedSiteId] = useState<string>(ALL_SITES_OPTION)
  const [selectedSiteName, setSelectedSiteName] = useState<string | null>(null)
  const [sites, setSites] = useState<any[]>([])
  const selectedSite = useMemo(() => {
    if (!selectedSiteId || selectedSiteId === ALL_SITES_OPTION) return null
    return sites.find((site) => String(site.siteID ?? site.id ?? '') === selectedSiteId) ?? null
  }, [sites, selectedSiteId])
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedOccurrence, setSelectedOccurrence] = useState<DailyOccurrenceEntry | null>(null)
  
  // Filter states
  const [filters, setFilters] = useState<DailyOccurrenceBookFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const hasActiveFilters = Boolean(
    filters.storeNumber ||
    filters.storeName ||
    filters.officerName ||
    (filters.code && filters.code.length) ||
    filters.dateFrom ||
    filters.dateTo
  )
  
  // Form state for creating/editing occurrences
  const [formData, setFormData] = useState<OccurrenceFormState>(getDefaultFormState())

  const siteOptions = useMemo(() => {
    const baseOptions = sites
      .map((site) => {
        const derivedId = String(site.siteID ?? site.id ?? '')
        const storeNumberRaw = site.sinNumber ?? site.storeNumber ?? site.siteID ?? derivedId
        return {
          id: derivedId,
          name: site.locationName ?? `Site ${derivedId}`,
          storeNumber: storeNumberRaw ? String(storeNumberRaw) : ''
        }
      })
      .filter((option) => option.id.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name))

    if (formData.siteId && !baseOptions.some((option) => option.id === formData.siteId)) {
      baseOptions.unshift({
        id: formData.siteId,
        name: formData.storeName ? `${formData.storeName} (legacy)` : `Site ${formData.siteId}`,
        storeNumber: formData.storeNumber ?? ''
      })
    }

    return baseOptions
  }, [sites, formData.siteId, formData.storeName, formData.storeNumber])

  useEffect(() => {
    if (!selectedSite || editDialogOpen) return
    const derivedId = String(selectedSite.siteID ?? selectedSite.id ?? '')
    setSelectedSiteName(selectedSite.locationName ?? null)
    setFormData((prev) => ({
      ...prev,
      siteId: prev?.siteId ?? derivedId,
      storeName: prev?.storeName && prev.storeName.length > 0 ? prev.storeName : selectedSite.locationName ?? '',
      storeNumber: prev?.storeNumber && prev.storeNumber.length > 0
        ? prev.storeNumber
        : String(selectedSite.sinNumber ?? selectedSite.storeNumber ?? selectedSite.siteID ?? '')
    }))
  }, [selectedSite, editDialogOpen])

  const handleSiteSelection = (siteId: string) => {
    const site = sites.find((s) => String(s.siteID ?? s.id ?? '') === siteId)
    setFormData((prev) => ({
      ...prev,
      siteId,
      storeName: site?.locationName ?? prev.storeName ?? '',
      storeNumber: site
        ? String(site.sinNumber ?? site.storeNumber ?? site.siteID ?? '')
        : prev.storeNumber ?? ''
    }))
  }

  // Fetch site name
  const fetchSiteName = async (customerId: number, siteId: string) => {
    try {
      const response = await siteService.getSitesByCustomer(customerId)
      if (response.success && response.data) {
        const site = response.data.find((s) => String(s.siteID) === siteId)
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
        const userCustomerId = user && ('customerId' in user) ? (user as any).customerId : undefined

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
        const customerData = await findCustomerById(targetCustomerId)
        if (!customerData) {
          setError('Customer not found or access denied')
          setLoading(false)
          return
        }

        console.log('CustomerDailyOccurrenceBook: Found customer:', customerData)

        // Verify access
        if (user && user.role === 'AdvantageOneOfficer' && 'assignedCustomerIds' in user && (user as any).assignedCustomerIds && !(user as any).assignedCustomerIds.includes(targetCustomerId)) {
          setError('Access denied: You are not assigned to this customer')
          setLoading(false)
          return
        }

        console.log('CustomerDailyOccurrenceBook: Access granted - setting customer')
        setCustomer({ id: targetCustomerId, name: customerData.name })
        
        if (urlSiteId) {
          setSelectedSiteId(urlSiteId)
          await fetchSiteName(targetCustomerId, urlSiteId)
        } else {
          setSelectedSiteId(ALL_SITES_OPTION)
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
        const response = await siteService.getSitesByCustomer(customer.id)
        if (response.success && response.data) {
          setSites(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch sites:', error)
      }
    }

    fetchSites()
  }, [customer])

  useEffect(() => {
    if (selectedSiteId === ALL_SITES_OPTION) {
      setSelectedSiteName(null)
    }
  }, [selectedSiteId])

  // Fetch occurrences data
  const fetchOccurrences = async () => {
    if (!customer) return

    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        customerId: customer.id.toString(),
        ...(selectedSiteId && selectedSiteId !== ALL_SITES_OPTION && { siteId: selectedSiteId }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.storeNumber && { storeNumber: filters.storeNumber }),
        ...(filters.storeName && { storeName: filters.storeName }),
        ...(filters.officerName && { officerName: filters.officerName }),
        ...(filters.code?.length && { code: filters.code.join(',') }),
        ...(searchTerm && { search: searchTerm })
      })

      const url = `${BASE_API_URL}/customers/${customer.id}/daily-occurrence-book?${queryParams}`
      const headers = getAuthHeaders()
      const authHeaders = headers as Record<string, string>
      
      console.log('Fetching occurrences:', { url, hasAuth: !!authHeaders.Authorization })
      
      const response = await fetch(url, {
        headers: headers
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          body: errorText.substring(0, 500)
        })
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Expected JSON but got:', {
          contentType: contentType,
          url: url,
          preview: text.substring(0, 500)
        })
        throw new Error('Server returned non-JSON response. Check if the API endpoint exists.')
      }
      
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
    if (!customer) {
      toast({
        title: 'Error',
        description: 'Customer must be selected',
        variant: 'destructive'
      })
      return
    }

    const resolvedSiteId = formData.siteId ?? selectedSiteId

    if (!resolvedSiteId) {
      toast({
        title: 'Missing site',
        description: 'Please select a site for this occurrence',
        variant: 'destructive'
      })
      return
    }

    if (!formData.storeName || !formData.storeNumber || !formData.officerName || !formData.code || !formData.details || !formData.signature) {
      toast({
        title: 'Missing information',
        description: 'Store details, officer name, code, details, and signature are required.',
        variant: 'destructive'
      })
      return
    }

    try {
      const { dateCommenced, ...restFormData } = formData as OccurrenceFormState & { dateCommenced?: string }

      const requestData = {
        ...restFormData,
        customerId: customer.id,
        siteId: resolvedSiteId,
        ...(isEdit && selectedOccurrence && { id: selectedOccurrence.id })
      }

      const url = isEdit 
        ? `${BASE_API_URL}/customers/${customer.id}/daily-occurrence-book/${selectedOccurrence?.id}`
        : `${BASE_API_URL}/customers/${customer.id}/daily-occurrence-book`
      
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
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
        setFormData(getDefaultFormState())
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
      const response = await fetch(`${BASE_API_URL}/customers/${customer.id}/daily-occurrence-book/${occurrence.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
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

  const renderOccurrenceForm = (prefix: string) => (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${prefix}-store-name`}>Store</Label>
          <Select
            value={formData.siteId ?? ''}
            onValueChange={handleSiteSelection}
            disabled={siteOptions.length === 0}
          >
            <SelectTrigger id={`${prefix}-store-name`}>
              <SelectValue placeholder={siteOptions.length ? 'Select a site' : 'No sites available'} />
            </SelectTrigger>
            <SelectContent>
              {siteOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.storeName && (
            <p className="mt-1 text-sm text-muted-foreground">
              Selected: {formData.storeName}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor={`${prefix}-store-number`}>Store Number</Label>
          <Input
            id={`${prefix}-store-number`}
            value={formData.storeNumber ?? ''}
            onChange={(event) => setFormData({ ...formData, storeNumber: event.target.value })}
            placeholder="Store number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${prefix}-date`}>Date</Label>
          <Input
            id={`${prefix}-date`}
            type="date"
            value={formData.date}
            onChange={(event) => setFormData({ ...formData, date: event.target.value })}
          />
        </div>
        <div>
          <Label htmlFor={`${prefix}-time`}>Time</Label>
          <Input
            id={`${prefix}-time`}
            type="time"
            value={formData.time}
            onChange={(event) => setFormData({ ...formData, time: event.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`${prefix}-officer`}>Officer Name</Label>
        <Input
          id={`${prefix}-officer`}
          value={formData.officerName ?? ''}
          onChange={(event) => setFormData({ ...formData, officerName: event.target.value })}
          placeholder="Officer full name"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${prefix}-code`}>Incident Code</Label>
          <Select
            value={formData.code ?? 'A'}
            onValueChange={(value) => setFormData({ ...formData, code: value as DailyOccurrenceCode })}
          >
            <SelectTrigger id={`${prefix}-code`}>
              <SelectValue placeholder="Select code" />
            </SelectTrigger>
            <SelectContent>
              {DOB_CODES.map((code) => (
                <SelectItem key={code.value} value={code.value}>
                  {code.value} — {code.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={`${prefix}-signature`}>Signature</Label>
          <Input
            id={`${prefix}-signature`}
            value={formData.signature ?? ''}
            onChange={(event) => setFormData({ ...formData, signature: event.target.value })}
            placeholder="Officer signature"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${prefix}-crime-date`}>Crime Report Sent to HO (Date)</Label>
          <Input
            id={`${prefix}-crime-date`}
            type="date"
            value={formData.crimeReportCompletedDate ?? ''}
            onChange={(event) =>
              setFormData({ ...formData, crimeReportCompletedDate: event.target.value || undefined })
            }
          />
        </div>
        <div>
          <Label htmlFor={`${prefix}-crime-time`}>Crime Report Sent to HO (Time)</Label>
          <Input
            id={`${prefix}-crime-time`}
            type="time"
            value={formData.crimeReportCompletedTime ?? ''}
            onChange={(event) =>
              setFormData({ ...formData, crimeReportCompletedTime: event.target.value || undefined })
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`${prefix}-details`}>Details</Label>
        <Textarea
          id={`${prefix}-details`}
          value={formData.details ?? ''}
          onChange={(event) => setFormData({ ...formData, details: event.target.value })}
          placeholder="Detailed description of the occurrence"
          rows={5}
        />
      </div>
    </div>
  )

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
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/management/customer-reporting')}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Customer Reporting</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <span className="truncate">Daily Occurrence Book (DOB)</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">
              {customer.name} {selectedSiteId === ALL_SITES_OPTION ? ' - All Sites' : (selectedSiteName ? `- ${selectedSiteName}` : '')}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => setCreateDialogOpen(true)} 
          disabled={!selectedSiteId || selectedSiteId === ALL_SITES_OPTION}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Add Occurrence</span>
          <span className="sm:hidden">Add</span>
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
            <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select a site to view occurrences" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SITES_OPTION}>
                  All Sites
                </SelectItem>
                {sites.map((site, index) => (
                  <SelectItem key={site.siteID || site.id || `site-${index}`} value={String(site.siteID || site.id || '')}>
                    {site.locationName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

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
                      <p className="text-sm text-muted-foreground">Entries This Week</p>
                      <p className="text-2xl font-bold">{stats.entriesThisWeek}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Entries This Month</p>
                      <p className="text-2xl font-bold">{stats.entriesThisMonth}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Stores</p>
                      <p className="text-2xl font-bold">{Object.keys(stats.byStore ?? {}).length}</p>
                    </div>
                    <MapPin className="h-8 w-8 text-sky-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {stats && Object.keys(stats.byCode ?? {}).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Incident Codes</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(stats.byCode).map(([code, count]) => (
                  <div key={code} className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">{getCodeMeta(code)}</p>
                    <p className="text-lg font-semibold">{code} · {count}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search occurrences..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <Input
                    placeholder="Store number"
                    value={filters.storeNumber ?? ''}
                    onChange={(event) => setFilters({ ...filters, storeNumber: event.target.value || undefined })}
                  />
                  <Input
                    placeholder="Store name"
                    value={filters.storeName ?? ''}
                    onChange={(event) => setFilters({ ...filters, storeName: event.target.value || undefined })}
                  />
                  <Input
                    placeholder="Officer name"
                    value={filters.officerName ?? ''}
                    onChange={(event) => setFilters({ ...filters, officerName: event.target.value || undefined })}
                  />
                  <Select
                    value={filters.code?.[0] ?? 'all'}
                    onValueChange={(value) =>
                      setFilters({ ...filters, code: value === 'all' ? undefined : [value as DailyOccurrenceCode] })
                    }
                  >
                    <SelectTrigger className="w-full capitalize">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All codes</SelectItem>
                      {DOB_CODES.map((code) => (
                        <SelectItem key={code.value} value={code.value}>
                          {code.value} — {code.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="date-from" className="text-xs uppercase tracking-wide text-muted-foreground">Date from</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={filters.dateFrom ?? ''}
                      onChange={(event) => setFilters({ ...filters, dateFrom: event.target.value || undefined })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="date-to" className="text-xs uppercase tracking-wide text-muted-foreground">Date to</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={filters.dateTo ?? ''}
                      onChange={(event) => setFilters({ ...filters, dateTo: event.target.value || undefined })}
                    />
                  </div>
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
                    {searchTerm || hasActiveFilters 
                      ? 'Try adjusting your search criteria or filters.'
                      : 'No occurrences have been recorded for this site yet.'
                    }
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Store</TableHead>
                          <TableHead>Officer</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Crime Report Sent to HO</TableHead>
                          <TableHead>Details</TableHead>
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
                              <div className="flex flex-col">
                                <span className="font-medium truncate">{occurrence.storeName ?? '—'}</span>
                                <span className="text-xs text-muted-foreground">#{occurrence.storeNumber ?? 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{occurrence.officerName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-semibold">
                                {occurrence.code} — {getCodeMeta(occurrence.code)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {occurrence.crimeReportCompletedDate ? (
                                <div className="text-sm">
                                  <div>{new Date(occurrence.crimeReportCompletedDate).toLocaleDateString()}</div>
                                  <div className="text-muted-foreground">{occurrence.crimeReportCompletedTime}</div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Pending</span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-[220px]">
                              <p className="text-sm text-muted-foreground line-clamp-2">{occurrence.details}</p>
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
                                      id: occurrence.id,
                                      customerId: occurrence.customerId,
                                      siteId: occurrence.siteId,
                                      storeName: occurrence.storeName ?? '',
                                      storeNumber: occurrence.storeNumber ?? '',
                                      date: occurrence.date,
                                      time: occurrence.time,
                                      officerName: occurrence.officerName,
                                      code: occurrence.code,
                                      crimeReportCompletedDate: occurrence.crimeReportCompletedDate,
                                      crimeReportCompletedTime: occurrence.crimeReportCompletedTime,
                                      details: occurrence.details,
                                      signature: occurrence.signature
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

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {occurrences.map((occurrence) => (
                      <Card key={occurrence.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base truncate">{occurrence.storeName ?? 'Unnamed store'}</h3>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(occurrence.date).toLocaleDateString()} {occurrence.time}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
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
                                    id: occurrence.id,
                                    customerId: occurrence.customerId,
                                    siteId: occurrence.siteId,
                                    storeName: occurrence.storeName ?? '',
                                    storeNumber: occurrence.storeNumber ?? '',
                                    date: occurrence.date,
                                    time: occurrence.time,
                                    officerName: occurrence.officerName,
                                    code: occurrence.code,
                                    crimeReportCompletedDate: occurrence.crimeReportCompletedDate,
                                    crimeReportCompletedTime: occurrence.crimeReportCompletedTime,
                                    details: occurrence.details,
                                    signature: occurrence.signature
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
                          </div>

                          <div className="flex flex-col gap-1 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>{occurrence.officerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>Store #{occurrence.storeNumber ?? 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span className="font-semibold">{occurrence.code}</span>
                              <span>{getCodeMeta(occurrence.code)}</span>
                            </div>
                            <p className="text-muted-foreground">{occurrence.details}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>

      {/* Create Occurrence Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Add New Occurrence</DialogTitle>
            <DialogDescription>
              Enter the occurrence details below. All required fields must be completed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4">
            {renderOccurrenceForm('create')}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false)
                  setFormData(getDefaultFormState())
                }}
              >
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Edit Occurrence</DialogTitle>
            <DialogDescription>
              Update the occurrence details below. All required fields must be completed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4">
            {renderOccurrenceForm('edit')}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false)
                  setSelectedOccurrence(null)
                  setFormData(getDefaultFormState())
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button onClick={() => handleSubmit(true)} className="w-full sm:w-auto">
                Update Occurrence
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Occurrence Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Occurrence Details</DialogTitle>
            <DialogDescription>
              View the complete details of this occurrence below.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOccurrence && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <p className="font-medium">{new Date(selectedOccurrence.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Time</Label>
                  <p className="font-medium">{selectedOccurrence.time}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Store</Label>
                  <p className="font-medium">{selectedOccurrence.storeName ?? '—'}</p>
                  <p className="text-sm text-muted-foreground">#{selectedOccurrence.storeNumber ?? 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Officer Name</Label>
                  <p className="font-medium">{selectedOccurrence.officerName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Code</Label>
                  <p className="font-medium">
                    {selectedOccurrence.code} — {getCodeMeta(selectedOccurrence.code)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Crime Report Sent to HO</Label>
                  {selectedOccurrence.crimeReportCompletedDate ? (
                    <p className="font-medium">
                      {new Date(selectedOccurrence.crimeReportCompletedDate).toLocaleDateString()}{' '}
                      {selectedOccurrence.crimeReportCompletedTime}
                    </p>
                  ) : (
                    <p className="font-medium">Pending</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Signature</Label>
                  <p className="font-medium">{selectedOccurrence.signature}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Details</Label>
                <p className="mt-1 whitespace-pre-line">{selectedOccurrence.details}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Reported By</Label>
                <p className="font-medium">{selectedOccurrence.reportedBy.name}</p>
                <p className="text-sm text-muted-foreground">{selectedOccurrence.reportedBy.role}</p>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p><span className="font-medium">Created:</span> {new Date(selectedOccurrence.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Updated:</span> {selectedOccurrence.updatedAt
                      ? new Date(selectedOccurrence.updatedAt).toLocaleString()
                      : 'Not updated'}</p>
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