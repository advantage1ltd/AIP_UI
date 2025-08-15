import { http, HttpResponse, delay } from 'msw'
import { BASE_API_URL } from '@/config/api'

// Mock employee data store
let employeeStore: any[] = [
  {
    id: 1,
    employeeNumber: 'EMP001',
    firstName: 'John',
    surname: 'Doe',
    email: 'john.doe@advantageone.com',
    position: 'Security Officer',
    employeeStatus: 'Active',
    startDate: '2024-01-15T00:00:00.000Z',
    department: 'Operations',
    region: 'West Midlands',
    title: 'Mr',
    aipAccessLevel: 'AdvantageOneOfficer',
    contactNumber: '07700 900000',
    houseName: '',
    numberAndStreet: '123 Main Street',
    town: 'Birmingham',
    county: 'West Midlands',
    postCode: 'B1 1AA',
    siaLicenceType: 'Door Supervisor',
    siaLicenceExpiry: '2025-12-31T00:00:00.000Z',
    siaLicenceNumber: 'SIA123456',
    nationality: 'British',
    rightToWorkCondition: 'British Citizen',
    drivingLicenceType: 'Full UK Licence',
    dateDLChecked: '2024-01-10T00:00:00.000Z',
    drivingLicenceCopyTaken: true,
    sixMonthlyCheck: false,
    graydonCheckAuthorised: true,
    graydonCheckDetails: 'Authorised for credit checks',
    initialOralReferencesComplete: true,
    initialOralReferencesDate: '2024-01-12T00:00:00.000Z',
    writtenRefsComplete: true,
    writtenRefsCompleteDate: '2024-01-14T00:00:00.000Z',
    quickStarterFormCompleted: true,
    workingTimeDirective: 'Standard',
    workingTimeDirectiveComplete: true,
    contractOfEmploymentSigned: true,
    photoTaken: true,
    photoFile: null,
    idCardIssued: true,
    equipmentIssued: true,
    uniformIssued: true,
    nextOfKinDetailsComplete: true,
    peopleHoursPin: '1234',
    fullRotasIssued: 'Full rota issued',
    inductionAndTrainingBooked: 'Booked for next week',
    location: 'Birmingham',
    trainer: 'Sarah Johnson',
    createdAt: '2024-01-15T00:00:00.000Z',
    createdBy: 'admin.test',
    updatedAt: '2024-01-15T00:00:00.000Z',
    updatedBy: 'admin.test'
  },
  {
    id: 2,
    employeeNumber: 'EMP002',
    firstName: 'Jane',
    surname: 'Smith',
    email: 'jane.smith@advantageone.com',
    position: 'Senior Security Officer',
    employeeStatus: 'Active',
    startDate: '2024-02-01T00:00:00.000Z',
    department: 'Operations',
    region: 'East Midlands',
    title: 'Ms',
    aipAccessLevel: 'AdvantageOneOfficer',
    contactNumber: '07700 900001',
    houseName: '',
    numberAndStreet: '456 High Street',
    town: 'Nottingham',
    county: 'Nottinghamshire',
    postCode: 'NG1 1AA',
    siaLicenceType: 'Door Supervisor',
    siaLicenceExpiry: '2025-11-30T00:00:00.000Z',
    siaLicenceNumber: 'SIA789012',
    nationality: 'British',
    rightToWorkCondition: 'British Citizen',
    drivingLicenceType: 'Full UK Licence',
    dateDLChecked: '2024-01-25T00:00:00.000Z',
    drivingLicenceCopyTaken: true,
    sixMonthlyCheck: false,
    graydonCheckAuthorised: true,
    graydonCheckDetails: 'Authorised for credit checks',
    initialOralReferencesComplete: true,
    initialOralReferencesDate: '2024-01-28T00:00:00.000Z',
    writtenRefsComplete: true,
    writtenRefsCompleteDate: '2024-01-30T00:00:00.000Z',
    quickStarterFormCompleted: true,
    workingTimeDirective: 'Standard',
    workingTimeDirectiveComplete: true,
    contractOfEmploymentSigned: true,
    photoTaken: true,
    photoFile: null,
    idCardIssued: true,
    equipmentIssued: true,
    uniformIssued: true,
    nextOfKinDetailsComplete: true,
    peopleHoursPin: '5678',
    fullRotasIssued: 'Full rota issued',
    inductionAndTrainingBooked: 'Completed',
    location: 'Nottingham',
    trainer: 'Mike Wilson',
    createdAt: '2024-02-01T00:00:00.000Z',
    createdBy: 'admin.test',
    updatedAt: '2024-02-01T00:00:00.000Z',
    updatedBy: 'admin.test'
  }
]

let nextId = 3

// Helper function to create API response
const createApiResponse = (success: boolean, data: any, message: string) => ({
  success,
  data,
  message
})

// Helper function to create error response
const createErrorResponse = (status: number, message: string) => {
  return new HttpResponse(
    JSON.stringify({
      success: false,
      message,
      errors: [message]
    }),
    { status }
  )
}

export const employeeHandlers = [
  // POST /api/employee - Register new employee
  http.post(`${BASE_API_URL}/employee`, async ({ request }) => {
    try {
      await delay(500) // Simulate network delay
      
      const requestData = await request.json()
      console.log('🚀 [MSW Employee] Registration request received:', requestData)
      
      // Validate required fields
      const requiredFields = ['EmployeeNumber', 'FirstName', 'Surname', 'Position', 'EmployeeStatus', 'EmploymentType']
      const missingFields = requiredFields.filter(field => !requestData[field])
      
      if (missingFields.length > 0) {
        console.warn('⚠️ [MSW Employee] Missing required fields:', missingFields)
        return createErrorResponse(400, `Missing required fields: ${missingFields.join(', ')}`)
      }
      
      // Check if employee number already exists
      const existingEmployee = employeeStore.find(emp => emp.employeeNumber === requestData.EmployeeNumber)
      if (existingEmployee) {
        console.warn('⚠️ [MSW Employee] Employee number already exists:', requestData.EmployeeNumber)
        return createErrorResponse(400, 'Employee number must be unique')
      }
      
      // Create new employee
      const newEmployee = {
        id: nextId++,
        employeeNumber: requestData.EmployeeNumber,
        firstName: requestData.FirstName,
        surname: requestData.Surname,
        email: requestData.Email,
        position: requestData.Position,
        employeeStatus: requestData.EmployeeStatus,
        startDate: requestData.StartDate || new Date().toISOString(),
        department: requestData.Department,
        region: requestData.Region,
        title: requestData.Title || 'Mr',
        aipAccessLevel: requestData.AipAccessLevel,
        contactNumber: requestData.ContactNumber,
        houseName: requestData.HouseName || '',
        numberAndStreet: requestData.NumberAndStreet,
        town: requestData.Town,
        county: requestData.County,
        postCode: requestData.PostCode,
        siaLicenceType: requestData.SiaLicenceType,
        siaLicenceExpiry: requestData.SiaLicenceExpiry,
        siaLicenceNumber: requestData.SiaLicenceNumber,
        nationality: requestData.Nationality,
        rightToWorkCondition: requestData.RightToWorkCondition,
        drivingLicenceType: requestData.DrivingLicenceType,
        dateDLChecked: requestData.DateDLChecked,
        drivingLicenceCopyTaken: requestData.DrivingLicenceCopyTaken || false,
        sixMonthlyCheck: requestData.SixMonthlyCheck || false,
        graydonCheckAuthorised: requestData.GraydonCheckAuthorised || false,
        graydonCheckDetails: requestData.GraydonCheckDetails,
        initialOralReferencesComplete: requestData.InitialOralReferencesComplete || false,
        initialOralReferencesDate: requestData.InitialOralReferencesDate,
        writtenRefsComplete: requestData.WrittenRefsComplete || false,
        writtenRefsCompleteDate: requestData.WrittenRefsCompleteDate,
        quickStarterFormCompleted: requestData.QuickStarterFormCompleted || false,
        workingTimeDirective: requestData.WorkingTimeDirective,
        workingTimeDirectiveComplete: requestData.WorkingTimeDirectiveComplete || false,
        contractOfEmploymentSigned: requestData.ContractOfEmploymentSigned || false,
        photoTaken: requestData.PhotoTaken || false,
        photoFile: requestData.PhotoFile,
        idCardIssued: requestData.IdCardIssued || false,
        equipmentIssued: requestData.EquipmentIssued || false,
        uniformIssued: requestData.UniformIssued || false,
        nextOfKinDetailsComplete: requestData.NextOfKinDetailsComplete || false,
        peopleHoursPin: requestData.PeopleHoursPin,
        fullRotasIssued: requestData.FullRotasIssued,
        inductionAndTrainingBooked: requestData.InductionAndTrainingBooked,
        location: requestData.Location,
        trainer: requestData.Trainer,
        createdAt: new Date().toISOString(),
        createdBy: 'admin.test', // Mock current user
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin.test'
      }
      
      employeeStore.push(newEmployee)
      
      console.log('✅ [MSW Employee] Employee created successfully:', newEmployee)
      
      // Return response in the format expected by the frontend
      const response = {
        id: newEmployee.id,
        employeeNumber: newEmployee.employeeNumber,
        firstName: newEmployee.firstName,
        surname: newEmployee.surname,
        email: newEmployee.email,
        position: newEmployee.position,
        status: newEmployee.employeeStatus,
        createdAt: newEmployee.createdAt
      }
      
      return HttpResponse.json(createApiResponse(true, response, 'Employee registered successfully'))
    } catch (error) {
      console.error('❌ [MSW Employee] Error creating employee:', error)
      return createErrorResponse(500, 'Failed to create employee')
    }
  }),

  // GET /api/employee - Get all employees
  http.get(`${BASE_API_URL}/employee`, async ({ request }) => {
    try {
      await delay(300)
      
      const url = new URL(request.url)
      const page = parseInt(url.searchParams.get('page') || '1')
      const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
      const search = url.searchParams.get('search') || ''
      const status = url.searchParams.get('status')
      const position = url.searchParams.get('position')
      const region = url.searchParams.get('region')
      
      console.log('🔍 [MSW Employee] Get employees request:', { page, pageSize, search, status, position, region })
      
      // Filter employees based on search criteria
      let filteredEmployees = employeeStore
      
      if (search) {
        const searchLower = search.toLowerCase()
        filteredEmployees = filteredEmployees.filter(emp => 
          emp.firstName.toLowerCase().includes(searchLower) ||
          emp.surname.toLowerCase().includes(searchLower) ||
          emp.employeeNumber.toLowerCase().includes(searchLower) ||
          emp.email?.toLowerCase().includes(searchLower)
        )
      }
      
      if (status) {
        filteredEmployees = filteredEmployees.filter(emp => emp.employeeStatus === status)
      }
      
      if (position) {
        filteredEmployees = filteredEmployees.filter(emp => emp.position === position)
      }
      
      if (region) {
        filteredEmployees = filteredEmployees.filter(emp => emp.region === region)
      }
      
      // Calculate pagination
      const total = filteredEmployees.length
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex)
      
      // Map to expected response format
      const employees = paginatedEmployees.map(emp => ({
        id: emp.id,
        employeeNumber: emp.employeeNumber,
        firstName: emp.firstName,
        surname: emp.surname,
        email: emp.email,
        position: emp.position,
        status: emp.employeeStatus,
        department: emp.department,
        region: emp.region,
        startDate: emp.startDate,
        createdAt: emp.createdAt
      }))
      
      console.log('✅ [MSW Employee] Returning employees:', { total, page, pageSize, count: employees.length })
      
      return HttpResponse.json(createApiResponse(true, {
        employees,
        total,
        page,
        pageSize
      }, `Found ${total} employee(s)`))
    } catch (error) {
      console.error('❌ [MSW Employee] Error getting employees:', error)
      return createErrorResponse(500, 'Failed to get employees')
    }
  }),

  // GET /api/employee/:id - Get employee by ID
  http.get(`${BASE_API_URL}/employee/:id`, async ({ params }) => {
    try {
      await delay(200)
      
      const id = parseInt(params.id as string)
      console.log('🔍 [MSW Employee] Get employee by ID:', id)
      
      const employee = employeeStore.find(emp => emp.id === id)
      
      if (!employee) {
        console.warn('⚠️ [MSW Employee] Employee not found:', id)
        return createErrorResponse(404, 'Employee not found')
      }
      
      console.log('✅ [MSW Employee] Employee found:', employee)
      
      return HttpResponse.json(createApiResponse(true, employee, 'Employee retrieved successfully'))
    } catch (error) {
      console.error('❌ [MSW Employee] Error getting employee:', error)
      return createErrorResponse(500, 'Failed to get employee')
    }
  }),

  // PUT /api/employee/:id - Update employee
  http.put(`${BASE_API_URL}/employee/:id`, async ({ request, params }) => {
    try {
      await delay(400)
      
      const id = parseInt(params.id as string)
      const requestData = await request.json()
      
      console.log('🔄 [MSW Employee] Update employee request:', { id, data: requestData })
      
      const employeeIndex = employeeStore.findIndex(emp => emp.id === id)
      
      if (employeeIndex === -1) {
        console.warn('⚠️ [MSW Employee] Employee not found for update:', id)
        return createErrorResponse(404, 'Employee not found')
      }
      
      // Update employee data
      const updatedEmployee = {
        ...employeeStore[employeeIndex],
        ...requestData,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin.test'
      }
      
      employeeStore[employeeIndex] = updatedEmployee
      
      console.log('✅ [MSW Employee] Employee updated successfully:', updatedEmployee)
      
      // Return response in expected format
      const response = {
        id: updatedEmployee.id,
        employeeNumber: updatedEmployee.employeeNumber,
        firstName: updatedEmployee.firstName,
        surname: updatedEmployee.surname,
        email: updatedEmployee.email,
        position: updatedEmployee.position,
        status: updatedEmployee.employeeStatus,
        department: updatedEmployee.department,
        region: updatedEmployee.region,
        startDate: updatedEmployee.startDate,
        createdAt: updatedEmployee.createdAt,
        updatedAt: updatedEmployee.updatedAt
      }
      
      return HttpResponse.json(createApiResponse(true, response, 'Employee updated successfully'))
    } catch (error) {
      console.error('❌ [MSW Employee] Error updating employee:', error)
      return createErrorResponse(500, 'Failed to update employee')
    }
  }),

  // DELETE /api/employee/:id - Delete employee
  http.delete(`${BASE_API_URL}/employee/:id`, async ({ params }) => {
    try {
      await delay(300)
      
      const id = parseInt(params.id as string)
      console.log('🗑️ [MSW Employee] Delete employee request:', id)
      
      const employeeIndex = employeeStore.findIndex(emp => emp.id === id)
      
      if (employeeIndex === -1) {
        console.warn('⚠️ [MSW Employee] Employee not found for deletion:', id)
        return createErrorResponse(404, 'Employee not found')
      }
      
      const deletedEmployee = employeeStore.splice(employeeIndex, 1)[0]
      
      console.log('✅ [MSW Employee] Employee deleted successfully:', deletedEmployee)
      
      return HttpResponse.json(createApiResponse(true, null, 'Employee deleted successfully'))
    } catch (error) {
      console.error('❌ [MSW Employee] Error deleting employee:', error)
      return createErrorResponse(500, 'Failed to delete employee')
    }
  }),

  // GET /api/employee/statistics - Get employee statistics
  http.get(`${BASE_API_URL}/employee/statistics`, async () => {
    try {
      await delay(200)
      
      console.log('📊 [MSW Employee] Get statistics request')
      
      const totalEmployees = employeeStore.length
      const activeEmployees = employeeStore.filter(emp => emp.employeeStatus === 'Active').length
      const inactiveEmployees = totalEmployees - activeEmployees
      
      // Group by region
      const employeesByRegion = employeeStore.reduce((acc, emp) => {
        const region = emp.region || 'Unknown'
        acc[region] = (acc[region] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      // Group by position
      const employeesByPosition = employeeStore.reduce((acc, emp) => {
        const position = emp.position || 'Unknown'
        acc[position] = (acc[position] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const statistics = {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        employeesByRegion,
        employeesByPosition
      }
      
      console.log('✅ [MSW Employee] Statistics calculated:', statistics)
      
      return HttpResponse.json(createApiResponse(true, statistics, 'Employee statistics retrieved successfully'))
    } catch (error) {
      console.error('❌ [MSW Employee] Error getting statistics:', error)
      return createErrorResponse(500, 'Failed to get employee statistics')
    }
  })
]
