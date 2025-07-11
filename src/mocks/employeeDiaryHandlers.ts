import { http, HttpResponse, delay } from 'msw'
import type { EmployeeActivity, ActivitySource, ActivitySyncStatus } from '@/types/employee'

// Helper function to validate request
const validateRequest = async (request: Request) => {
  try {
    return await request.json()
  } catch (error) {
    throw new Error('Invalid JSON payload')
  }
}

// Helper function to create error response
const createErrorResponse = (status: number, message: string) => {
  return HttpResponse.json(
    { 
      success: false,
      error: message,
      data: null
    },
    { status }
  )
}

// Helper function to transform activity dates
const transformActivity = (activity: any): EmployeeActivity => {
  return {
    ...activity,
    activityDate: new Date(activity.activityDate),
    nextReviewDate: activity.nextReviewDate ? new Date(activity.nextReviewDate) : undefined,
    actionDeadline: activity.actionDeadline ? new Date(activity.actionDeadline) : undefined,
    createdAt: new Date(activity.createdAt),
    updatedAt: new Date(activity.updatedAt)
  };
};

export const employeeDiaryHandlers = [
  // Get all employees
  http.get('/api/employees', async () => {
    await delay(300)
    
    // Get current user from localStorage or context
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    const userRole = currentUser.role || 'AdvantageOneOfficer'
    
    const allEmployees = [
      {
        id: "off-001",
        name: "David Officer",
        role: "Security Officer",
        department: "Operations",
        startDate: "2024-01-15T00:00:00.000Z",
        status: "active",
        employmentType: "full-time",
        email: "david.officer@aip.com"
      },
      {
        id: "off-002",
        name: "Jeremy Officer",
        role: "Security Officer",
        department: "Operations",
        startDate: "2024-01-15T00:00:00.000Z",
        status: "active",
        employmentType: "full-time",
        email: "jeremy.officer@aip.com"
      },
      {
        id: "off-003",
        name: "Nathaniel Officer",
        role: "Security Officer",
        department: "Operations",
        startDate: "2024-01-15T00:00:00.000Z",
        status: "active",
        employmentType: "full-time",
        email: "nathaniel.officer@aip.com"
      }
    ]

    // Role-based filtering
    if (userRole === 'AdvantageOneOfficer') {
      // Officers can only see themselves
      const officerId = currentUser.id
      const filteredEmployees = allEmployees.filter(emp => emp.id === officerId)
      return HttpResponse.json(filteredEmployees)
    } else if (userRole === 'AdvantageOneAdmin' || userRole === 'AdvantageOneManager') {
      // Admins and managers can see all employees
      return HttpResponse.json(allEmployees)
    } else {
      // Other roles see no employees
      return HttpResponse.json([])
    }
  }),

  // Get employee activities
  http.get('/api/employee-activities', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    
    console.log('🔍 [Employee Activities] Request received:', {
      url: url.toString(),
      employeeId
    })
    
    try {
      const response = await fetch('/db.json')
      const data = await response.json()
      
      let activities = data.activities || []
      console.log('📊 [Employee Activities] Raw activities from db.json:')
      console.log('Total activities:', activities.length)
      console.log('First activity:', activities[0])
      console.log('All activity employee IDs:', activities.map(a => `${a.id}: employeeId=${a.employeeId} (${typeof a.employeeId})`))
      
      // Get current user from localStorage or context
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const userRole = currentUser.role || 'AdvantageOneOfficer'
      
      console.log('👤 [Employee Activities] Current user:')
      console.log('User ID:', currentUser.id, '(type:', typeof currentUser.id, ')')
      console.log('User role:', userRole)
      console.log('Full user object:', currentUser)
      
      // Role-based filtering
      if (userRole === 'AdvantageOneOfficer') {
        // Officers can only see their own activities
        const officerId = Number(currentUser.id) // Ensure integer comparison
        console.log('🔒 [Employee Activities] Officer filtering:')
        console.log('Original user ID:', currentUser.id)
        console.log('Converted officer ID:', officerId, '(type:', typeof officerId, ')')
        
        activities = activities.filter((activity: EmployeeActivity) => {
          const activityEmployeeId = Number(activity.employeeId)
          const matches = activityEmployeeId === officerId
          console.log(`🎯 Activity ${activity.id}: employeeId=${activity.employeeId} -> ${activityEmployeeId} === ${officerId} = ${matches}`)
          return matches
        })
        
        console.log('✅ [Employee Activities] Filtered result:')
        console.log('Filtered count:', activities.length)
        console.log('Filtered activities:', activities.map(a => `${a.id} (${a.activityType})`))
      } else if (employeeId) {
        // Admin/Manager filtering by specific employee
        const targetEmployeeId = Number(employeeId)
        console.log('👔 [Employee Activities] Admin/Manager filtering by employeeId:', {
          employeeId,
          targetEmployeeId
        })
        activities = activities.filter((activity: EmployeeActivity) => 
          Number(activity.employeeId) === targetEmployeeId
        )
      } else if (userRole === 'AdvantageOneAdmin' || userRole === 'AdvantageOneManager') {
        // Admins and managers can see all activities without filtering
        console.log('👔 [Employee Activities] Admin/Manager seeing all activities')
      } else {
        // Other roles (like customers) see no activities
        console.log('❌ [Employee Activities] Other role, no activities shown')
        activities = []
      }
      
      // First transform the dates
      activities = activities.map(transformActivity)

      // Then sort by date descending
      activities = activities.sort((a: EmployeeActivity, b: EmployeeActivity) => 
        b.activityDate.getTime() - a.activityDate.getTime()
      )
      
      console.log('📤 [Employee Activities] Final response:', {
        finalCount: activities.length,
        finalActivities: activities.map(a => ({ id: a.id, employeeId: a.employeeId, date: a.activityDate }))
      })

      return HttpResponse.json({
        success: true,
        data: activities,
        total: activities.length
      })
    } catch (error) {
      console.error('❌ [Employee Activities] Error:', error)
      return createErrorResponse(500, 'Failed to fetch activities')
    }
  }),

  // Get activity sources and sync status
  http.get('/api/employee-activities/sources', async () => {
    await delay(300)
    
    const now = new Date()
    const sources: Record<ActivitySource, ActivitySyncStatus> = {
      manual: { 
        source: 'manual',
        status: 'active',
        lastSynced: now
      },
      hr_system: {
        source: 'hr_system',
        status: 'active',
        lastSynced: now
      },
      training_system: {
        source: 'training_system',
        status: 'active',
        lastSynced: now
      },
      leave_system: {
        source: 'leave_system',
        status: 'active',
        lastSynced: now
      },
      performance_system: {
        source: 'performance_system',
        status: 'active',
        lastSynced: now
      },
      document_system: {
        source: 'document_system',
        status: 'active',
        lastSynced: now
      },
      equipment_system: {
        source: 'equipment_system',
        status: 'active',
        lastSynced: now
      },
      certification_system: {
        source: 'certification_system',
        status: 'active',
        lastSynced: now
      }
    }

    return HttpResponse.json({
      success: true,
      data: sources
    })
  }),

  // Create activity
  http.post('/api/employee-activities', async ({ request }) => {
    await delay(300)
    
    try {
      const activity = await validateRequest(request)
      
      // Generate an ID and add timestamps
      const now = new Date()
      const newActivity = {
        ...activity,
        id: `ACT${Math.floor(Math.random() * 10000)}`,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }

      // Transform dates before returning
      const transformedActivity = transformActivity(newActivity)

      return HttpResponse.json({
        success: true,
        data: transformedActivity,
        message: 'Activity created successfully'
      })
    } catch (error) {
      return createErrorResponse(400, 'Invalid activity data')
    }
  }),

  // Update activity
  http.put('/api/employee-activities/:id', async ({ params, request }) => {
    await delay(300)
    
    try {
      const updates = await validateRequest(request)
      
      // Add updated timestamp
      const updatedActivity = {
        ...updates,
        updatedAt: new Date().toISOString()
      }

      // Transform dates before returning
      const transformedActivity = transformActivity(updatedActivity)

      return HttpResponse.json({
        success: true,
        data: transformedActivity,
        message: 'Activity updated successfully'
      })
    } catch (error) {
      return createErrorResponse(400, 'Invalid activity data')
    }
  }),

  // Delete activity
  http.delete('/api/employee-activities/:id', async ({ params }) => {
    await delay(300)
    
    return HttpResponse.json({
      success: true,
      message: 'Activity deleted successfully'
    })
  }),

  // Sync activities from source
  http.post('/api/employee-activities/sync/:source', async ({ params }) => {
    await delay(1000) // Longer delay to simulate sync
    
    return HttpResponse.json({
      success: true,
      message: `Successfully synced activities from ${params.source}`
    })
  })
] 