import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import { Employee } from "./EmployeesTable"
import { UserRole } from "@/types/user"
import { lookupTableService, LookupTableItem } from "@/services/lookupTableService"
import { employeeService, EmployeeRegistrationRequest } from "@/services/employeeService"
import { Upload, User, FileText, Shield, MapPin, Briefcase, CreditCard, Camera, Calendar } from "lucide-react"

const formSchema = z.object({
  // Basic Information
  aipAccessLevel: z.string().min(1, "AIP Access Level is required"),
  title: z.string().optional(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  surname: z.string().min(2, "Last name must be at least 2 characters"),
  startDate: z.string().min(1, "Start date is required"),
  
  // Contact Information
  email: z.string().email("Invalid email format").optional(),
  contactNumber: z.string().optional(),
  
  // Address Information
  houseName: z.string().optional(),
  numberAndStreet: z.string().min(1, "Number and street is required"),
  town: z.string().min(1, "Town is required"),
  county: z.string().min(1, "County is required"),
  postCode: z.string().min(1, "Post code is required"),
  region: z.string().min(1, "Region is required"),
  
  // Employment Information
  position: z.string().min(1, "Position is required"),
  employeeNumber: z.string().min(1, "Employee number is required"),
  employeeStatus: z.string().optional(),
  employmentType: z.string().optional(),
  department: z.string().optional(),
  
  // SIA Information
  siaLicenceType: z.string().min(1, "SIA Licence Type is required"),
  siaLicenceExpiry: z.string().min(1, "SIA Licence Expiry is required"),
  siaLicenceNumber: z.string().optional(),
  
  // Personal Information
  nationality: z.string().min(1, "Nationality is required"),
  rightToWorkCondition: z.string().min(1, "Right to work condition is required"),
  
  // Driving License Information
  drivingLicenceType: z.string().min(1, "Driving licence is required"),
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
  fullRotasIssued: z.string().optional(),
  inductionAndTrainingBooked: z.string().optional(),
  location: z.string().optional(),
  trainer: z.string().optional(),
  
  status: z.enum(["active", "inactive"]).optional(),
})

type FormData = z.infer<typeof formSchema>

interface EmployeeFormProps {
  onSubmit?: (data: FormData) => Promise<void>
  onCancel: () => void
  initialData?: Employee
  isLoading?: boolean
}

// All dropdown data is now loaded dynamically from lookup tables

export function EmployeeForm({ onSubmit, onCancel, initialData, isLoading }: EmployeeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photoFile || null)
  const [trainers, setTrainers] = useState<LookupTableItem[]>([])
  const [isLoadingTrainers, setIsLoadingTrainers] = useState(false)
  const [counties, setCounties] = useState<LookupTableItem[]>([])
  const [regions, setRegions] = useState<LookupTableItem[]>([])
  const [isLoadingCounties, setIsLoadingCounties] = useState(false)
  const [isLoadingRegions, setIsLoadingRegions] = useState(false)
  const [userRoles, setUserRoles] = useState<LookupTableItem[]>([])
  const [positions, setPositions] = useState<LookupTableItem[]>([])
  const [siaLicenceTypes, setSiaLicenceTypes] = useState<LookupTableItem[]>([])
  const [drivingLicenceTypes, setDrivingLicenceTypes] = useState<LookupTableItem[]>([])
  const [rightToWorkConditions, setRightToWorkConditions] = useState<LookupTableItem[]>([])
  const [isLoadingUserRoles, setIsLoadingUserRoles] = useState(false)
  const [isLoadingPositions, setIsLoadingPositions] = useState(false)
  const [isLoadingSiaLicenceTypes, setIsLoadingSiaLicenceTypes] = useState(false)
  const [isLoadingDrivingLicenceTypes, setIsLoadingDrivingLicenceTypes] = useState(false)
  const [isLoadingRightToWorkConditions, setIsLoadingRightToWorkConditions] = useState(false)
  const [workingTimeDirectives, setWorkingTimeDirectives] = useState<LookupTableItem[]>([])
  const [isLoadingWorkingTimeDirectives, setIsLoadingWorkingTimeDirectives] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      aipAccessLevel: initialData?.aipAccessLevel || "",
      title: initialData?.title || "",
      firstName: initialData?.firstName || "",
      surname: initialData?.surname || "",
      startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
      houseName: initialData?.houseName || "",
      numberAndStreet: initialData?.numberAndStreet || "",
      town: initialData?.town || "",
      county: initialData?.county || "",
      postCode: initialData?.postCode || "",
      region: initialData?.region || "",
      position: initialData?.position || "",
      employeeNumber: initialData?.employeeNumber || "",
      siaLicenceType: initialData?.siaLicenceType || "",
      siaLicenceExpiry: initialData?.siaLicenceExpiry ? new Date(initialData.siaLicenceExpiry).toISOString().split('T')[0] : "",
      nationality: initialData?.nationality || "",
      rightToWorkCondition: initialData?.rightToWorkCondition || "",
      drivingLicenceType: initialData?.drivingLicenceType || "",
      dateDLChecked: initialData?.dateDLChecked ? new Date(initialData.dateDLChecked).toISOString().split('T')[0] : "",
      drivingLicenceCopyTaken: initialData?.drivingLicenceCopyTaken || false,
      sixMonthlyCheck: initialData?.sixMonthlyCheck || false,
      graydonCheckAuthorised: initialData?.graydonCheckAuthorised || false,
      graydonCheckDetails: initialData?.graydonCheckDetails || "",
      initialOralReferencesComplete: initialData?.initialOralReferencesComplete || false,
      initialOralReferencesDate: initialData?.initialOralReferencesDate ? new Date(initialData.initialOralReferencesDate).toISOString().split('T')[0] : "",
      writtenRefsComplete: initialData?.writtenRefsComplete || false,
      writtenRefsCompleteDate: initialData?.writtenRefsCompleteDate ? new Date(initialData.writtenRefsCompleteDate).toISOString().split('T')[0] : "",
      quickStarterFormCompleted: initialData?.quickStarterFormCompleted || false,
      workingTimeDirective: initialData?.workingTimeDirective || "",
      contractOfEmploymentSigned: initialData?.contractOfEmploymentSigned || false,
      photoTaken: initialData?.photoTaken || false,
      photoFile: initialData?.photoFile || "",
      idCardIssued: initialData?.idCardIssued || false,
      equipmentIssued: initialData?.equipmentIssued || false,
      uniformIssued: initialData?.uniformIssued || false,
      nextOfKinDetailsComplete: initialData?.nextOfKinDetailsComplete || false,
             peopleHoursPin: initialData?.peopleHoursPin || "",
       fullRotasIssued: initialData?.fullRotasIssued ? new Date(initialData.fullRotasIssued).toISOString().split('T')[0] : "",
       inductionAndTrainingBooked: initialData?.inductionAndTrainingBooked ? new Date(initialData.inductionAndTrainingBooked).toISOString().split('T')[0] : "",
       location: initialData?.location || "",
       trainer: initialData?.trainer || "",
      status: "active",
    },
  })

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        // Create a canvas to resize and compress the image
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Set canvas size for optimal display (256x256 for good quality)
          const maxSize = 256
          let { width, height } = img
          
          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          // Draw and compress the image
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Convert to base64 with better quality
          const compressedImage = canvas.toDataURL('image/jpeg', 0.8)
          
          setPhotoPreview(compressedImage)
          form.setValue('photoFile', compressedImage)
          form.setValue('photoTaken', true)
        }
        img.src = reader.result as string
      }
             reader.readAsDataURL(file)
     }
   }

   // Load lookup data on component mount
   useEffect(() => {
     const loadLookupData = async () => {
       // Load trainers
       setIsLoadingTrainers(true)
       try {
         const trainersData = await lookupTableService.getTrainers()
         setTrainers(trainersData)
       } catch (error) {
         console.error('Failed to load trainers:', error)
       } finally {
         setIsLoadingTrainers(false)
       }

       // Load counties
       setIsLoadingCounties(true)
       try {
         const countiesData = await lookupTableService.getByCategory('Counties')
         setCounties(countiesData)
       } catch (error) {
         console.error('Failed to load counties:', error)
       } finally {
         setIsLoadingCounties(false)
       }

       // Load regions
       setIsLoadingRegions(true)
       try {
         const regionsData = await lookupTableService.getByCategory('Regions')
         setRegions(regionsData)
       } catch (error) {
         console.error('Failed to load regions:', error)
       } finally {
         setIsLoadingRegions(false)
       }

       // Load user roles
       setIsLoadingUserRoles(true)
       try {
         const userRolesData = await lookupTableService.getByCategory('UserRoles')
         setUserRoles(userRolesData)
       } catch (error) {
         console.error('Failed to load user roles:', error)
       } finally {
         setIsLoadingUserRoles(false)
       }

       // Load positions
       setIsLoadingPositions(true)
       try {
         const positionsData = await lookupTableService.getByCategory('Positions')
         setPositions(positionsData)
       } catch (error) {
         console.error('Failed to load positions:', error)
       } finally {
         setIsLoadingPositions(false)
       }

       // Load SIA licence types
       setIsLoadingSiaLicenceTypes(true)
       try {
         const siaLicenceTypesData = await lookupTableService.getByCategory('SiaLicenceTypes')
         setSiaLicenceTypes(siaLicenceTypesData)
       } catch (error) {
         console.error('Failed to load SIA licence types:', error)
       } finally {
         setIsLoadingSiaLicenceTypes(false)
       }

       // Load driving licence types
       setIsLoadingDrivingLicenceTypes(true)
       try {
         const drivingLicenceTypesData = await lookupTableService.getByCategory('DrivingLicenceTypes')
         setDrivingLicenceTypes(drivingLicenceTypesData)
       } catch (error) {
         console.error('Failed to load driving licence types:', error)
       } finally {
         setIsLoadingDrivingLicenceTypes(false)
       }

       // Load right to work conditions
       setIsLoadingRightToWorkConditions(true)
       try {
         const rightToWorkConditionsData = await lookupTableService.getByCategory('RightToWorkConditions')
         setRightToWorkConditions(rightToWorkConditionsData)
       } catch (error) {
         console.error('Failed to load right to work conditions:', error)
       } finally {
         setIsLoadingRightToWorkConditions(false)
       }

       // Load working time directives
       setIsLoadingWorkingTimeDirectives(true)
       try {
         const workingTimeDirectivesData = await lookupTableService.getByCategory('WorkingTimeDirectives')
         setWorkingTimeDirectives(workingTimeDirectivesData)
       } catch (error) {
         console.error('Failed to load working time directives:', error)
       } finally {
         setIsLoadingWorkingTimeDirectives(false)
       }
     }

     loadLookupData()
   }, [])

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      if (onSubmit) {
        // Use custom onSubmit if provided
        await onSubmit(data)
      } else {
        // Use real API service
        const employeeData: EmployeeRegistrationRequest = {
          aipAccessLevel: data.aipAccessLevel,
          title: data.title,
          firstName: data.firstName,
          surname: data.surname,
          startDate: data.startDate,
          email: data.email,
          contactNumber: data.contactNumber,
          houseName: data.houseName,
          numberAndStreet: data.numberAndStreet,
          town: data.town,
          county: data.county,
          postCode: data.postCode,
          region: data.region,
          position: data.position,
          employeeNumber: data.employeeNumber,
          employeeStatus: data.employeeStatus,
          employmentType: data.employmentType,
          department: data.department,
          siaLicenceType: data.siaLicenceType,
          siaLicenceExpiry: data.siaLicenceExpiry,
          siaLicenceNumber: data.siaLicenceNumber,
          nationality: data.nationality,
          rightToWorkCondition: data.rightToWorkCondition,
          drivingLicenceType: data.drivingLicenceType,
          dateDLChecked: data.dateDLChecked,
          drivingLicenceCopyTaken: data.drivingLicenceCopyTaken,
          sixMonthlyCheck: data.sixMonthlyCheck,
          graydonCheckAuthorised: data.graydonCheckAuthorised,
          graydonCheckDetails: data.graydonCheckDetails,
          initialOralReferencesComplete: data.initialOralReferencesComplete,
          initialOralReferencesDate: data.initialOralReferencesDate,
          writtenRefsComplete: data.writtenRefsComplete,
          writtenRefsCompleteDate: data.writtenRefsCompleteDate,
          quickStarterFormCompleted: data.quickStarterFormCompleted,
          workingTimeDirective: data.workingTimeDirective,
          workingTimeDirectiveComplete: data.workingTimeDirectiveComplete,
          contractOfEmploymentSigned: data.contractOfEmploymentSigned,
          photoTaken: data.photoTaken,
          photoFile: data.photoFile,
          idCardIssued: data.idCardIssued,
          equipmentIssued: data.equipmentIssued,
          uniformIssued: data.uniformIssued,
          nextOfKinDetailsComplete: data.nextOfKinDetailsComplete,
          peopleHoursPin: data.peopleHoursPin,
          fullRotasIssued: data.fullRotasIssued,
          inductionAndTrainingBooked: data.inductionAndTrainingBooked,
          location: data.location,
          trainer: data.trainer,
          status: data.status
        }

        if (initialData?.id) {
          // Update existing employee
          await employeeService.updateEmployee(Number(initialData.id), employeeData)
        } else {
          // Create new employee
          await employeeService.registerEmployee(employeeData)
        }
      }
      
      // Close form or show success message
      onCancel()
    } catch (error) {
      console.error('Error submitting employee form:', error)
      setSubmitError(error instanceof Error ? error.message : 'An error occurred while saving the employee')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        
        {/* Basic Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="aipAccessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AIP Access Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingUserRoles ? "Loading roles..." : "Select access level"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role.lookupId} value={role.value}>
                          {role.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Mr, Mrs, Ms, Dr, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Number</FormLabel>
                  <FormControl>
                    <Input placeholder="EMP001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Address Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="houseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>House Name</FormLabel>
                  <FormControl>
                    <Input placeholder="The Cottage" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numberAndStreet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number and Street</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="town"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Town</FormLabel>
                  <FormControl>
                    <Input placeholder="Birmingham" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="county"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>County</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingCounties ? "Loading counties..." : "Select county"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {counties.map((county) => (
                        <SelectItem key={county.lookupId} value={county.value}>
                          {county.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Code</FormLabel>
                  <FormControl>
                    <Input placeholder="B1 1AA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingRegions ? "Loading regions..." : "Select region"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.lookupId} value={region.value}>
                          {region.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Employment Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Employment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingPositions ? "Loading positions..." : "Select position"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position.lookupId} value={position.value}>
                          {position.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <FormControl>
                    <Input placeholder="British" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rightToWorkCondition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Right to Work Condition</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingRightToWorkConditions ? "Loading conditions..." : "Select condition"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rightToWorkConditions.map((condition) => (
                        <SelectItem key={condition.lookupId} value={condition.value}>
                          {condition.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* SIA Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              SIA Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="siaLicenceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SIA Licence Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingSiaLicenceTypes ? "Loading licence types..." : "Select licence type"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {siaLicenceTypes.map((type) => (
                        <SelectItem key={type.lookupId} value={type.value}>
                          {type.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="siaLicenceExpiry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SIA Licence Expiry</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Driving License Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Driving License Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="drivingLicenceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driving Licence</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingDrivingLicenceTypes ? "Loading licence types..." : "Select licence type"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {drivingLicenceTypes.map((type) => (
                        <SelectItem key={type.lookupId} value={type.value}>
                          {type.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateDLChecked"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date D/L Checked</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="drivingLicenceCopyTaken"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Copy taken?</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sixMonthlyCheck"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>6 monthly check?</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Checks and References Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Checks and References
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="graydonCheckAuthorised"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Graydon check Authorised?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="graydonCheckDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Graydon check details</FormLabel>
                    <FormControl>
                      <Input placeholder="Details..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initialOralReferencesComplete"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Initial oral References complete?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initialOralReferencesDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="writtenRefsComplete"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Written References complete?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="writtenRefsCompleteDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quickStarterFormCompleted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Quick starter form complete?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Employment Documentation Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Employment Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="workingTimeDirective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Working Time Directive</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingWorkingTimeDirectives ? "Loading options..." : "Select option"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {workingTimeDirectives.map((option) => (
                        <SelectItem key={option.lookupId} value={option.value}>
                          {option.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contractOfEmploymentSigned"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Contract of Employment signed?</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photoTaken"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Photo taken?</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photoFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo Upload</FormLabel>
                  <div className="space-y-4">
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="cursor-pointer"
                      />
                    </FormControl>
                    
                                         {/* Photo Preview/Placeholder */}
                     <div className="flex items-center justify-center">
                       {photoPreview ? (
                         <div className="relative group">
                                                         <div className="w-33 h-30 rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden bg-gray-50 flex items-center justify-center">
                              <img
                                src={photoPreview}
                                alt="Employee photo"
                                className="w-full h-full object-cover"
                                style={{ imageRendering: 'auto' }}
                              />
                            </div>
                           <button
                             type="button"
                             onClick={() => {
                               setPhotoPreview(null)
                               form.setValue('photoFile', '')
                               form.setValue('photoTaken', false)
                             }}
                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-sm"
                             title="Remove photo"
                           >
                             ×
                           </button>
                           {/* Hover overlay for better UX */}
                           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                             <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium transition-opacity duration-200">
                               Click to remove
                             </span>
                           </div>
                         </div>
                       ) : (
                         <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:border-gray-400 transition-colors">
                           <Camera className="h-8 w-8 text-gray-400 mb-2" />
                           <p className="text-xs text-gray-500 text-center px-2">
                             No photo uploaded
                           </p>
                         </div>
                       )}
                     </div>
                    
                    <p className="text-xs text-gray-500">
                      Upload a professional headshot (JPG, PNG, max 5MB)
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="idCardIssued"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>ID card issued?</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="equipmentIssued"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Equipment issued?</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="uniformIssued"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Uniform issued?</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nextOfKinDetailsComplete"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Next of kin details complete?</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="peopleHoursPin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>People Hours PIN</FormLabel>
                  <FormControl>
                    <Input placeholder="PIN number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Training and Induction Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Training and Induction
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField
               control={form.control}
               name="fullRotasIssued"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Full Rotas Issued</FormLabel>
                   <FormControl>
                     <Input type="date" {...field} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />

             <FormField
               control={form.control}
               name="inductionAndTrainingBooked"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Induction and Training Booked</FormLabel>
                   <FormControl>
                     <Input type="date" {...field} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Training location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

                         <FormField
               control={form.control}
               name="trainer"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Trainer</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                     <FormControl>
                       <SelectTrigger>
                         <SelectValue placeholder={isLoadingTrainers ? "Loading trainers..." : "Select trainer"} />
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       {trainers.map((trainer) => (
                         <SelectItem key={trainer.lookupId} value={trainer.value}>
                           {trainer.value}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <FormMessage />
                 </FormItem>
               )}
             />
          </CardContent>
        </Card>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {submitError}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isSubmitting}>
            {isLoading || isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
