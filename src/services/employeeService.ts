import { api, EMPLOYEE_ENDPOINTS, ApiResponse, handleApiError } from '@/config/api'
import { Employee } from '@/types/employee'

export interface EmployeeRegistrationRequest {
  aipAccessLevel: string
  title?: string
  firstName: string
  surname: string
  startDate: string
  email?: string
  contactNumber?: string
  houseName?: string
  numberAndStreet: string
  town: string
  county: string
  postCode: string
  region: string
  position: string
  employeeNumber: string
  employeeStatus?: string
  employmentType?: string
  department?: string
  siaLicenceType: string
  siaLicenceExpiry: string
  siaLicenceNumber?: string
  nationality: string
  rightToWorkCondition: string
  drivingLicenceType: string
  dateDLChecked?: string
  drivingLicenceCopyTaken?: boolean
  sixMonthlyCheck?: boolean
  graydonCheckAuthorised?: boolean
  graydonCheckDetails?: string
  initialOralReferencesComplete?: boolean
  initialOralReferencesDate?: string
  writtenRefsComplete?: boolean
  writtenRefsCompleteDate?: string
  quickStarterFormCompleted?: boolean
  workingTimeDirective?: string
  workingTimeDirectiveComplete?: boolean
  contractOfEmploymentSigned?: boolean
  photoTaken?: boolean
  photoFile?: string
  idCardIssued?: boolean
  equipmentIssued?: boolean
  uniformIssued?: boolean
  nextOfKinDetailsComplete?: boolean
  peopleHoursPin?: string
  fullRotasIssued?: string
  inductionAndTrainingBooked?: string
  location?: string
  trainer?: string
  status?: 'active' | 'inactive'
}

export interface EmployeeRegistrationResponse {
  id: number
  employeeNumber: string
  firstName: string
  surname: string
  email?: string
  position: string
  status: string
  createdAt: string
}

export interface EmployeeDetailResponse {
  id: number
  aipAccessLevel: string
  title?: string
  firstName: string
  surname: string
  startDate: string
  email?: string
  contactNumber?: string
  houseName?: string
  numberAndStreet: string
  town: string
  county: string
  postCode: string
  region: string
  position: string
  employeeNumber: string
  employeeStatus?: string
  employmentType?: string
  department?: string
  siaLicenceType: string
  siaLicenceExpiry: string
  siaLicenceNumber?: string
  nationality: string
  rightToWorkCondition: string
  drivingLicenceType: string
  dateDLChecked?: string
  drivingLicenceCopyTaken?: boolean
  sixMonthlyCheck?: boolean
  graydonCheckAuthorised?: boolean
  graydonCheckDetails?: string
  initialOralReferencesComplete?: boolean
  initialOralReferencesDate?: string
  writtenRefsComplete?: boolean
  writtenRefsCompleteDate?: string
  quickStarterFormCompleted?: boolean
  workingTimeDirective?: string
  workingTimeDirectiveComplete?: boolean
  contractOfEmploymentSigned?: boolean
  photoTaken?: boolean
  photoFile?: string
  idCardIssued?: boolean
  equipmentIssued?: boolean
  uniformIssued?: boolean
  nextOfKinDetailsComplete?: boolean
  peopleHoursPin?: string
  fullRotasIssued?: string
  inductionAndTrainingBooked?: string
  location?: string
  trainer?: string
  status?: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface EmployeeStatistics {
  totalEmployees: number
  activeEmployees: number
  inactiveEmployees: number
  newEmployeesThisMonth: number
  employeesByPosition: Record<string, number>
  employeesByRegion: Record<string, number>
}

class EmployeeService {
  /**
   * Register a new employee
   */
  async registerEmployee(data: EmployeeRegistrationRequest): Promise<EmployeeRegistrationResponse> {
    try {
      const response = await api.post<ApiResponse<EmployeeRegistrationResponse>>(
        EMPLOYEE_ENDPOINTS.REGISTER,
        data
      )
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Get all employees with optional filtering
   */
  async getEmployees(params?: {
    page?: number
    pageSize?: number
    search?: string
    status?: 'active' | 'inactive'
    position?: string
    region?: string
  }): Promise<{ employees: EmployeeDetailResponse[]; total: number; page: number; pageSize: number }> {
    try {
      const response = await api.get<ApiResponse<{
        employees: EmployeeDetailResponse[]
        total: number
        page: number
        pageSize: number
      }>>(EMPLOYEE_ENDPOINTS.LIST, { params })
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: number): Promise<EmployeeDetailResponse> {
    try {
      const response = await api.get<ApiResponse<EmployeeDetailResponse>>(
        EMPLOYEE_ENDPOINTS.DETAIL(id.toString())
      )
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Update employee
   */
  async updateEmployee(id: number, data: Partial<EmployeeRegistrationRequest>): Promise<EmployeeDetailResponse> {
    try {
      const response = await api.put<ApiResponse<EmployeeDetailResponse>>(
        EMPLOYEE_ENDPOINTS.UPDATE(id.toString()),
        data
      )
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Delete employee
   */
  async deleteEmployee(id: number): Promise<void> {
    try {
      await api.delete(EMPLOYEE_ENDPOINTS.DELETE(id.toString()))
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Get employee statistics
   */
  async getEmployeeStatistics(): Promise<EmployeeStatistics> {
    try {
      const response = await api.get<ApiResponse<EmployeeStatistics>>(
        EMPLOYEE_ENDPOINTS.STATISTICS
      )
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Upload employee photo
   */
  async uploadEmployeePhoto(id: number, photoFile: File): Promise<{ photoUrl: string }> {
    try {
      const formData = new FormData()
      formData.append('photo', photoFile)

      const response = await api.post<ApiResponse<{ photoUrl: string }>>(
        `${EMPLOYEE_ENDPOINTS.DETAIL(id.toString())}/photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Get employees by customer assignment
   */
  async getEmployeesByCustomer(customerId: number): Promise<EmployeeDetailResponse[]> {
    try {
      const response = await api.get<ApiResponse<EmployeeDetailResponse[]>>(
        `${EMPLOYEE_ENDPOINTS.LIST}/by-customer/${customerId}`
      )
      return response.data.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Assign employee to customer
   */
  async assignEmployeeToCustomer(employeeId: number, customerId: number): Promise<void> {
    try {
      await api.post(`${EMPLOYEE_ENDPOINTS.DETAIL(employeeId.toString())}/assign-customer`, {
        customerId
      })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  /**
   * Remove employee from customer assignment
   */
  async removeEmployeeFromCustomer(employeeId: number, customerId: number): Promise<void> {
    try {
      await api.delete(`${EMPLOYEE_ENDPOINTS.DETAIL(employeeId.toString())}/assign-customer/${customerId}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }
}

export const employeeService = new EmployeeService()
