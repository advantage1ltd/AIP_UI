/** Zod schema for employee registration and edit. */
import * as z from 'zod'

export const employeeFormSchema = z.object({
  // Basic Information - Backend Required Fields
  employeeNumber: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  surname: z.string().min(2, "Last name must be at least 2 characters"),
  startDate: z.string().min(1, "Start date is required").refine((date) => {
    if (!date) return false
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    return selectedDate <= today
  }, {
    message: "Start date cannot be in the future"
  }),
  position: z.string().min(1, "Position is required"),
  employeeStatus: z.string().min(1, "Employee status is required"),
  employmentType: z.string().min(1, "Employment type is required"),
  
  // Contact Information
  email: z.string().email("Invalid email format").optional(),
  contactNumber: z.string().optional(),
  
  // Address Information
  houseName: z.string().optional(),
  numberAndStreet: z.string().optional(),
  town: z.string().optional(),
  county: z.string().optional(),
  postCode: z.string().optional(),
  region: z.string().optional(),
  
  // SIA licence (HR record — optional; app roles are assigned in User Setup)
  siaLicenceType: z.string().optional(),
  siaLicenceExpiry: z.string().optional().refine((date) => {
    if (!date) return true // Optional field
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    return selectedDate >= today
  }, {
    message: "SIA licence expiry date cannot be in the past"
  }),
  
  // Personal Information
  nationality: z.string().optional(),
  rightToWorkCondition: z.string().optional(),
  
  // Driving License Information
  drivingLicenceType: z.string().optional(),
  dateDLChecked: z.string().optional(),
  drivingLicenceCopyTaken: z.boolean().optional(),
  sixMonthlyCheck: z.boolean().optional(),
  
  // Checks and References
  graydonCheckAuthorised: z.boolean().optional(),
  graydonCheckDetails: z.string().optional(),
  initialOralReferencesComplete: z.boolean().optional(),
  initialOralReferencesDate: z.string().optional(),
  writtenRefsComplete: z.boolean().optional(),
  writtenRefsCompleteDate: z.string().optional(),
  quickStarterFormCompleted: z.boolean().optional(),
  
  // Employment Documentation
  workingTimeDirective: z.string().optional(),
  workingTimeDirectiveComplete: z.boolean().optional(),
  contractOfEmploymentSigned: z.boolean().optional(),
  photoTaken: z.boolean().optional(),
  photoFile: z.string().optional(),
  idCardIssued: z.boolean().optional(),
  equipmentIssued: z.boolean().optional(),
  uniformIssued: z.boolean().optional(),
  nextOfKinDetailsComplete: z.boolean().optional(),
  
  // Training and Induction
  peopleHoursPin: z.string().optional(),
  fullRotasIssued: z.string().optional().refine((date) => {
    if (!date) return true // Optional field
    const selectedDate = new Date(date)
    return !isNaN(selectedDate.getTime())
  }, {
    message: "Please enter a valid date"
  }),
  inductionAndTrainingBooked: z.string().optional().refine((date) => {
    if (!date) return true // Optional field
    const selectedDate = new Date(date)
    return !isNaN(selectedDate.getTime())
  }, {
    message: "Please enter a valid date"
  }),
  location: z.string().optional(),
  trainer: z.string().optional(),
  
  status: z.enum(["active", "inactive"]).optional(),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>
