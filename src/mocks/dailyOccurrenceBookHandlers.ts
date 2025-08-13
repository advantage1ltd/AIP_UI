import { http, HttpResponse } from 'msw'
import { 
  DailyOccurrenceEntry, 
  OccurrenceType, 
  OccurrenceSeverity, 
  OccurrenceStatus,
  CreateOccurrenceRequest,
  UpdateOccurrenceRequest,
  DailyOccurrenceBookResponse,
  SingleOccurrenceResponse,
  OccurrenceStatsResponse,
  DailyOccurrenceBookStats
} from '@/types/dailyOccurrenceBook'

// In-memory store for Daily Occurrence Book entries
let occurrenceStore: DailyOccurrenceEntry[] = []

// Initialize with some sample data
const initializeSampleData = () => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const sampleOccurrences: DailyOccurrenceEntry[] = [
    {
      id: 'DOB-001',
      customerId: 21,
      siteId: '1',
      siteName: 'Main Entrance',
      date: today,
      time: '09:30',
      occurrenceType: 'security_incident',
      severity: 'medium',
      status: 'investigating',
      title: 'Suspicious individual observed near entrance',
      description: 'A person in dark clothing was observed loitering near the main entrance for approximately 15 minutes. When approached, they quickly left the area.',
      location: 'Main Entrance Gate',
      reportedBy: {
        id: '2',
        name: 'Oscar Officer',
        role: 'Security Officer',
        badgeNumber: 'ADV-001'
      },
      witnessNames: ['John Doe (Visitor)', 'Jane Smith (Reception)'],
      actionTaken: 'Approached individual, they left immediately. Increased patrols in area.',
      followUpRequired: true,
      followUpBy: '2',
      followUpDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      followUpNotes: 'Review CCTV footage and check for any similar incidents',
      managerNotified: true,
      managerNotifiedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      createdBy: '2',
      updatedBy: '2'
    },
    {
      id: 'DOB-002',
      customerId: 21,
      siteId: '1',
      siteName: 'Main Entrance',
      date: yesterday,
      time: '14:15',
      occurrenceType: 'maintenance_issue',
      severity: 'low',
      status: 'resolved',
      title: 'Flickering light in parking area',
      description: 'Light fixture in parking zone B was flickering intermittently.',
      location: 'Parking Zone B',
      reportedBy: {
        id: '2',
        name: 'Oscar Officer',
        role: 'Security Officer',
        badgeNumber: 'ADV-001'
      },
      actionTaken: 'Reported to maintenance team',
      followUpRequired: false,
      managerNotified: false,
      createdAt: new Date(now.getTime() - 26 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      createdBy: '2',
      updatedBy: '2'
    },
    {
      id: 'DOB-003',
      customerId: 21,
      siteId: '2',
      siteName: 'North Building',
      date: lastWeek,
      time: '22:00',
      occurrenceType: 'emergency_test',
      severity: 'low',
      status: 'closed',
      title: 'Monthly fire alarm test',
      description: 'Conducted monthly fire alarm system test as per schedule.',
      location: 'Entire Building',
      reportedBy: {
        id: '2',
        name: 'Oscar Officer',
        role: 'Security Officer',
        badgeNumber: 'ADV-001'
      },
      actionTaken: 'All alarms functioning correctly. System reset after test.',
      followUpRequired: false,
      managerNotified: true,
      managerNotifiedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: '2',
      updatedBy: '2'
    },
    {
      id: 'DOB-004',
      customerId: 21,
      siteId: '1',
      siteName: 'Main Entrance',
      date: today,
      time: '16:45',
      occurrenceType: 'visitor_log',
      severity: 'low',
      status: 'open',
      title: 'VIP visitor arrival',
      description: 'CEO of partner company arrived for scheduled meeting.',
      location: 'Reception Area',
      reportedBy: {
        id: '2',
        name: 'Oscar Officer',
        role: 'Security Officer',
        badgeNumber: 'ADV-001'
      },
      actionTaken: 'Escorted to executive floor, visitor badge issued.',
      followUpRequired: true,
      followUpBy: '2',
      followUpDate: today,
      followUpNotes: 'Ensure visitor is escorted out at end of meeting',
      managerNotified: false,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      createdBy: '2',
      updatedBy: '2'
    }
  ]

  occurrenceStore = sampleOccurrences
}

// Initialize sample data
initializeSampleData()

// Helper function to generate statistics
const generateStats = (occurrences: DailyOccurrenceEntry[]): DailyOccurrenceBookStats => {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const thisWeek = occurrences.filter(o => new Date(o.date) >= oneWeekAgo)
  const thisMonth = occurrences.filter(o => new Date(o.date) >= oneMonthAgo)
  const openOccurrences = occurrences.filter(o => o.status === 'open' || o.status === 'investigating')
  const highSeverity = occurrences.filter(o => o.severity === 'high' || o.severity === 'critical')
  const followUpsPending = occurrences.filter(o => o.followUpRequired && o.status !== 'closed')

  // Count by type
  const byType: Record<OccurrenceType, number> = {
    general_observation: 0,
    security_incident: 0,
    safety_concern: 0,
    visitor_log: 0,
    maintenance_issue: 0,
    equipment_fault: 0,
    staff_arrival_departure: 0,
    emergency_test: 0,
    weather_condition: 0,
    other: 0
  }

  // Count by severity
  const bySeverity: Record<OccurrenceSeverity, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0
  }

  // Count by status
  const byStatus: Record<OccurrenceStatus, number> = {
    open: 0,
    investigating: 0,
    resolved: 0,
    closed: 0
  }

  occurrences.forEach(occurrence => {
    byType[occurrence.occurrenceType]++
    bySeverity[occurrence.severity]++
    byStatus[occurrence.status]++
  })

  return {
    totalEntries: occurrences.length,
    entriesThisWeek: thisWeek.length,
    entriesThisMonth: thisMonth.length,
    openOccurrences: openOccurrences.length,
    highSeverityOccurrences: highSeverity.length,
    followUpsPending: followUpsPending.length,
    byType,
    bySeverity,
    byStatus
  }
}

// Helper function to filter occurrences
const filterOccurrences = (
  occurrences: DailyOccurrenceEntry[],
  customerId: number,
  siteId?: string,
  filters: any = {}
): DailyOccurrenceEntry[] => {
  return occurrences.filter(occurrence => {
    // Customer filter
    if (occurrence.customerId !== customerId) return false

    // Site filter
    if (siteId && occurrence.siteId !== siteId) return false

    // Date range filter
    if (filters.dateFrom && occurrence.date < filters.dateFrom) return false
    if (filters.dateTo && occurrence.date > filters.dateTo) return false

    // Type filter
    if (filters.occurrenceType) {
      const types = filters.occurrenceType.split(',')
      if (!types.includes(occurrence.occurrenceType)) return false
    }

    // Severity filter
    if (filters.severity) {
      const severities = filters.severity.split(',')
      if (!severities.includes(occurrence.severity)) return false
    }

    // Status filter
    if (filters.status) {
      const statuses = filters.status.split(',')
      if (!statuses.includes(occurrence.status)) return false
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const searchableText = [
        occurrence.title,
        occurrence.description,
        occurrence.location,
        occurrence.reportedBy.name,
        occurrence.actionTaken || ''
      ].join(' ').toLowerCase()
      
      if (!searchableText.includes(searchTerm)) return false
    }

    return true
  })
}

// Helper function to create error response
const createErrorResponse = (status: number, message: string) => {
  return HttpResponse.json(
    { success: false, error: message, data: null },
    { status }
  )
}

// Helper function to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Generate unique ID
const generateId = () => {
  const count = occurrenceStore.length + 1
  return `DOB-${count.toString().padStart(3, '0')}`
}

export const dailyOccurrenceBookHandlers = [
  // GET /api/customers/:customerId/daily-occurrence-book - Get all occurrences for a customer
  http.get('/api/customers/:customerId/daily-occurrence-book', async ({ request, params }) => {
    try {
      await delay(300)
      
      const customerId = parseInt(params.customerId as string)
      if (isNaN(customerId)) {
        return createErrorResponse(400, 'Invalid customer ID')
      }

      const url = new URL(request.url)
      const siteId = url.searchParams.get('siteId')
      const filters = {
        dateFrom: url.searchParams.get('dateFrom'),
        dateTo: url.searchParams.get('dateTo'),
        occurrenceType: url.searchParams.get('occurrenceType'),
        severity: url.searchParams.get('severity'),
        status: url.searchParams.get('status'),
        search: url.searchParams.get('search')
      }

      console.log('📖 [DOB] Fetching occurrences for customer:', customerId, { siteId, filters })

      const filteredOccurrences = filterOccurrences(occurrenceStore, customerId, siteId || undefined, filters)
      const stats = generateStats(filteredOccurrences)

      // Sort by date and time (newest first)
      filteredOccurrences.sort((a, b) => {
        const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime()
        if (dateCompare !== 0) return dateCompare
        return b.time.localeCompare(a.time)
      })

      const response: DailyOccurrenceBookResponse = {
        success: true,
        data: filteredOccurrences,
        stats,
        message: `Found ${filteredOccurrences.length} occurrence(s)`
      }

      return HttpResponse.json(response)
    } catch (error) {
      console.error('❌ [DOB] Error fetching occurrences:', error)
      return createErrorResponse(500, 'Failed to fetch occurrences')
    }
  }),

  // POST /api/customers/:customerId/daily-occurrence-book - Create new occurrence
  http.post('/api/customers/:customerId/daily-occurrence-book', async ({ request, params }) => {
    try {
      await delay(300)
      
      const customerId = parseInt(params.customerId as string)
      if (isNaN(customerId)) {
        return createErrorResponse(400, 'Invalid customer ID')
      }

      const requestData: CreateOccurrenceRequest = await request.json()
      
      // Validate required fields
      if (!requestData.title || !requestData.description || !requestData.location) {
        return createErrorResponse(400, 'Title, description, and location are required')
      }

      const now = new Date().toISOString()
      const newOccurrence: DailyOccurrenceEntry = {
        id: generateId(),
        customerId,
        siteId: requestData.siteId,
        date: requestData.date,
        time: requestData.time,
        occurrenceType: requestData.occurrenceType,
        severity: requestData.severity,
        status: 'open',
        title: requestData.title,
        description: requestData.description,
        location: requestData.location,
        reportedBy: {
          id: '2', // Current user ID (would come from auth in real app)
          name: 'Oscar Officer',
          role: 'Security Officer',
          badgeNumber: 'ADV-001'
        },
        witnessNames: requestData.witnessNames,
        actionTaken: requestData.actionTaken,
        followUpRequired: requestData.followUpRequired,
        followUpBy: requestData.followUpBy,
        followUpDate: requestData.followUpDate,
        followUpNotes: requestData.followUpNotes,
        managerNotified: requestData.managerNotified,
        managerNotifiedAt: requestData.managerNotified ? now : undefined,
        createdAt: now,
        updatedAt: now,
        createdBy: '2',
        updatedBy: '2'
      }

      occurrenceStore.push(newOccurrence)

      console.log('✅ [DOB] Created new occurrence:', newOccurrence.id)

      const response: SingleOccurrenceResponse = {
        success: true,
        data: newOccurrence,
        message: 'Occurrence created successfully'
      }

      return HttpResponse.json(response)
    } catch (error) {
      console.error('❌ [DOB] Error creating occurrence:', error)
      return createErrorResponse(500, 'Failed to create occurrence')
    }
  }),

  // GET /api/customers/:customerId/daily-occurrence-book/:occurrenceId - Get specific occurrence
  http.get('/api/customers/:customerId/daily-occurrence-book/:occurrenceId', async ({ params }) => {
    try {
      await delay(300)
      
      const customerId = parseInt(params.customerId as string)
      const occurrenceId = params.occurrenceId as string

      if (isNaN(customerId)) {
        return createErrorResponse(400, 'Invalid customer ID')
      }

      const occurrence = occurrenceStore.find(
        o => o.id === occurrenceId && o.customerId === customerId
      )

      if (!occurrence) {
        return createErrorResponse(404, 'Occurrence not found')
      }

      const response: SingleOccurrenceResponse = {
        success: true,
        data: occurrence,
        message: 'Occurrence retrieved successfully'
      }

      return HttpResponse.json(response)
    } catch (error) {
      console.error('❌ [DOB] Error fetching occurrence:', error)
      return createErrorResponse(500, 'Failed to fetch occurrence')
    }
  }),

  // PUT /api/customers/:customerId/daily-occurrence-book/:occurrenceId - Update occurrence
  http.put('/api/customers/:customerId/daily-occurrence-book/:occurrenceId', async ({ request, params }) => {
    try {
      await delay(300)
      
      const customerId = parseInt(params.customerId as string)
      const occurrenceId = params.occurrenceId as string

      if (isNaN(customerId)) {
        return createErrorResponse(400, 'Invalid customer ID')
      }

      const updateData: UpdateOccurrenceRequest = await request.json()

      const occurrenceIndex = occurrenceStore.findIndex(
        o => o.id === occurrenceId && o.customerId === customerId
      )

      if (occurrenceIndex === -1) {
        return createErrorResponse(404, 'Occurrence not found')
      }

      const existingOccurrence = occurrenceStore[occurrenceIndex]
      const updatedOccurrence: DailyOccurrenceEntry = {
        ...existingOccurrence,
        ...updateData,
        id: occurrenceId, // Ensure ID doesn't change
        customerId, // Ensure customer ID doesn't change
        updatedAt: new Date().toISOString(),
        updatedBy: '2' // Current user ID
      }

      // Handle manager notification
      if (updateData.managerNotified && !existingOccurrence.managerNotified) {
        updatedOccurrence.managerNotifiedAt = new Date().toISOString()
      }

      occurrenceStore[occurrenceIndex] = updatedOccurrence

      console.log('✅ [DOB] Updated occurrence:', occurrenceId)

      const response: SingleOccurrenceResponse = {
        success: true,
        data: updatedOccurrence,
        message: 'Occurrence updated successfully'
      }

      return HttpResponse.json(response)
    } catch (error) {
      console.error('❌ [DOB] Error updating occurrence:', error)
      return createErrorResponse(500, 'Failed to update occurrence')
    }
  }),

  // DELETE /api/customers/:customerId/daily-occurrence-book/:occurrenceId - Delete occurrence
  http.delete('/api/customers/:customerId/daily-occurrence-book/:occurrenceId', async ({ params }) => {
    try {
      await delay(300)
      
      const customerId = parseInt(params.customerId as string)
      const occurrenceId = params.occurrenceId as string

      if (isNaN(customerId)) {
        return createErrorResponse(400, 'Invalid customer ID')
      }

      const occurrenceIndex = occurrenceStore.findIndex(
        o => o.id === occurrenceId && o.customerId === customerId
      )

      if (occurrenceIndex === -1) {
        return createErrorResponse(404, 'Occurrence not found')
      }

      const deletedOccurrence = occurrenceStore[occurrenceIndex]
      occurrenceStore.splice(occurrenceIndex, 1)

      console.log('🗑️ [DOB] Deleted occurrence:', occurrenceId)

      return HttpResponse.json({
        success: true,
        message: `Occurrence "${deletedOccurrence.title}" deleted successfully`
      })
    } catch (error) {
      console.error('❌ [DOB] Error deleting occurrence:', error)
      return createErrorResponse(500, 'Failed to delete occurrence')
    }
  }),

  // GET /api/customers/:customerId/daily-occurrence-book/stats - Get occurrence statistics
  http.get('/api/customers/:customerId/daily-occurrence-book/stats', async ({ request, params }) => {
    try {
      await delay(300)
      
      const customerId = parseInt(params.customerId as string)
      if (isNaN(customerId)) {
        return createErrorResponse(400, 'Invalid customer ID')
      }

      const url = new URL(request.url)
      const siteId = url.searchParams.get('siteId')

      const filteredOccurrences = filterOccurrences(
        occurrenceStore, 
        customerId, 
        siteId || undefined
      )
      
      const stats = generateStats(filteredOccurrences)

      const response: OccurrenceStatsResponse = {
        success: true,
        data: stats,
        message: 'Statistics retrieved successfully'
      }

      return HttpResponse.json(response)
    } catch (error) {
      console.error('❌ [DOB] Error fetching stats:', error)
      return createErrorResponse(500, 'Failed to fetch statistics')
    }
  })
]