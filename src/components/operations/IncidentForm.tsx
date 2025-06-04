import { useState, useCallback, memo, useEffect } from "react"
import { Incident, IncidentType, IncidentInvolved, StolenItem } from "@/types/incidents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { format } from "date-fns"
import { CalendarIcon, PlusCircle, Trash2, Package, QrCode } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  MOCK_CUSTOMERS, 
  MOCK_STORES, 
  MOCK_OFFICERS, 
  MOCK_OFFICER_ROLES 
} from "@/data/mockDropdownData"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { v4 as uuidv4 } from "uuid"
import React from "react"

const formSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  siteName: z.string().min(1, "Site name is required"),
  officerName: z.string().min(1, "Officer name is required"),
  officerRole: z.string().min(1, "Officer role is required"),
  dateOfIncident: z.date({
    required_error: "Date of incident is required",
  }),
  timeOfIncident: z.string().min(1, "Time of incident is required"),
  incidentType: z.string().min(1, "Incident type is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  incidentDetails: z.string().min(10, "Incident details must be at least 10 characters").optional(),
  storeComments: z.string().optional(),
  incidentInvolved: z.array(z.string()).min(1, "At least one incident type must be selected"),
  policeInvolvement: z.boolean().default(false),
  urnNumber: z.string().optional(),
  totalValueRecovered: z.string().optional(),
  stolenItems: z.array(z.object({
    id: z.string(),
    description: z.string(),
    cost: z.number(),
    quantity: z.number(),
    totalAmount: z.number(),
    category: z.string(),
    productName: z.string(),
  })).optional(),
  dutyManagerName: z.string().min(1, "Duty manager name is required"),
  status: z.enum(['pending', 'resolved', 'in-progress']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  actionTaken: z.string().optional(),
  evidenceAttached: z.boolean().default(false),
  witnessStatements: z.array(z.string()).optional(),
  involvedParties: z.array(z.string()).optional(),
  reportNumber: z.string().optional(),
  offenderName: z.string().optional(),
  offenderAddress: z.object({
    houseName: z.string().optional(),
    numberAndStreet: z.string().optional(),
    villageOrSuburb: z.string().optional(),
    town: z.string().optional(),
    county: z.string().optional(),
    postCode: z.string().optional(),
  }),
  offenderSex: z.enum(['Male', 'Female', 'N/A or N/K']).default('N/A or N/K'),
  offenderDOB: z.date().optional(),
  offenderPlaceOfBirth: z.string().optional(),
  policeID: z.string().optional(),
  crimeRefNumber: z.string().optional(),
})

const incidentTypes: IncidentType[] = [
  IncidentType.ARREST,
  IncidentType.DETER,
  IncidentType.THEFT,
  IncidentType.CRIMINAL_DAMAGE,
  IncidentType.CREDIT_CARD_FRAUD,
  IncidentType.SUSPICIOUS_BEHAVIOUR,
  IncidentType.UNDERAGE_PURCHASE,
  IncidentType.ANTI_SOCIAL,
  IncidentType.OTHER
]

const incidentInvolved: IncidentInvolved[] = [
  IncidentInvolved.SELF_SCAN_TILLS,
  IncidentInvolved.THREATS_AND_INTIMIDATION,
  IncidentInvolved.BAN_FROM_STORE,
  IncidentInvolved.SCAN_AND_GO,
  IncidentInvolved.ABUSIVE_BEHAVIOUR,
  IncidentInvolved.SPITTING,
  IncidentInvolved.VIOLENT_BEHAVIOR,
  IncidentInvolved.POLICE_FAILED_TO_ATTEND
]

// Update the retail categories
const retailCategories = {
  'COOP': [
    { id: 'alcohol', label: 'Alcohol' },
    { id: 'tobacco', label: 'Tobacco' },
    { id: 'meat', label: 'Meat' },
    { id: 'fish', label: 'Fish' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'confectionery', label: 'Confectionery' },
    { id: 'health-beauty', label: 'Health & Beauty' },
    { id: 'household', label: 'Household' },
    { id: 'grocery', label: 'Grocery' },
    { id: 'frozen', label: 'Frozen' },
    { id: 'produce', label: 'Produce' },
    { id: 'bakery', label: 'Bakery' },
    { id: 'other', label: 'Other' }
  ],
  'Tesco': [
    { id: 'f&f', label: 'F&F Clothing' },
    { id: 'fresh', label: 'Fresh & Chilled' },
    { id: 'grocery', label: 'Grocery & Packaged' },
    { id: 'BWS', label: 'Beers, Wines & Spirits' },
    { id: 'health', label: 'Health & Beauty' },
    { id: 'electronics', label: 'Electronics & Entertainment' },
    { id: 'home', label: 'Home & Seasonal' },
  ]
} as const

export interface IncidentFormProps {
  initialData?: Incident | null
  onSubmit: (incident: Incident) => void
  onCancel: () => void
  onScanBarcode: () => void
  isLoading?: boolean
}

const IncidentForm: React.FC<IncidentFormProps> = memo(({ initialData, onSubmit, onCancel, onScanBarcode, isLoading = false }) => {
  const [stolenItems, setStolenItems] = useState<StolenItem[]>(initialData?.stolenItems || [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: initialData?.customerName || "",
      siteName: initialData?.siteName || "",
      officerName: initialData?.officerName || "",
      officerRole: initialData?.officerRole || "",
      dateOfIncident: initialData?.dateOfIncident ? new Date(initialData.dateOfIncident) : new Date(),
      timeOfIncident: initialData?.timeOfIncident || "",
      incidentType: initialData?.incidentType || "",
      description: initialData?.description || "",
      incidentDetails: initialData?.incidentDetails || initialData?.description || "",
      storeComments: initialData?.storeComments || "",
      incidentInvolved: initialData?.incidentInvolved || [],
      policeInvolvement: initialData?.policeInvolvement || false,
      urnNumber: initialData?.urnNumber || "",
      totalValueRecovered: initialData?.totalValueRecovered?.toString() || "",
      stolenItems: initialData?.stolenItems || [],
      dutyManagerName: initialData?.dutyManagerName || "",
      status: initialData?.status || 'pending',
      priority: initialData?.priority || 'medium',
      actionTaken: initialData?.actionTaken || "",
      evidenceAttached: initialData?.evidenceAttached || false,
      witnessStatements: initialData?.witnessStatements || [],
      involvedParties: initialData?.involvedParties || [],
      reportNumber: initialData?.reportNumber || "",
      offenderName: initialData?.offenderName || "",
      offenderAddress: initialData?.offenderAddress || {
        houseName: "",
        numberAndStreet: "",
        villageOrSuburb: "",
        town: "",
        county: "",
        postCode: "",
      },
      offenderSex: initialData?.offenderSex || 'N/A or N/K',
      offenderDOB: initialData?.offenderDOB ? new Date(initialData.offenderDOB) : undefined,
      offenderPlaceOfBirth: initialData?.offenderPlaceOfBirth || "",
      policeID: initialData?.policeID || "",
      crimeRefNumber: initialData?.crimeRefNumber || "",
    },
  })

  useEffect(() => {
    if (initialData) {
      setStolenItems(initialData.stolenItems || [])
    }
  }, [initialData])

  // Add useEffect to update totalValueRecovered when stolen items change
  React.useEffect(() => {
    const totalValue = stolenItems.reduce((sum, item) => sum + item.totalAmount, 0);
    form.setValue('totalValueRecovered', totalValue.toString(), { shouldValidate: false });
  }, [stolenItems, form]);

  // Update incidentDetails value whenever description changes
  const descriptionValue = form.watch('description')
  React.useEffect(() => {
    form.setValue('incidentDetails', descriptionValue, { shouldValidate: true })
  }, [descriptionValue, form])

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    // Guard for dateOfIncident
    const isValidDateOfIncident = values.dateOfIncident && !isNaN(new Date(values.dateOfIncident).getTime())
    // Guard for timeOfIncident (should be a string, but check if it's valid for new Date)
    const isValidTimeOfIncident = values.timeOfIncident && !isNaN(new Date(values.timeOfIncident).getTime())

    const formattedData: Incident = {
      id: initialData?.id || uuidv4(),
      customerName: values.customerName,
      siteName: values.siteName,
      officerName: values.officerName,
      officerRole: values.officerRole,
      dateOfIncident: isValidDateOfIncident ? new Date(values.dateOfIncident).toISOString() : '',
      timeOfIncident: values.timeOfIncident,
      incidentType: values.incidentType,
      description: values.description,
      incidentInvolved: values.incidentInvolved,
      policeInvolvement: values.policeInvolvement,
      dutyManagerName: values.dutyManagerName,
      status: values.status,
      priority: values.priority,
      evidenceAttached: values.evidenceAttached,
      offenderAddress: values.offenderAddress,
      offenderSex: values.offenderSex,
      stolenItems: stolenItems.map(item => ({
        ...item,
        totalAmount: item.cost * item.quantity
      })),
      // Optional fields
      incidentDetails: values.incidentDetails,
      storeComments: values.storeComments,
      urnNumber: values.urnNumber,
      totalValueRecovered: parseFloat(values.totalValueRecovered || '0'),
      actionTaken: values.actionTaken,
      witnessStatements: values.witnessStatements,
      involvedParties: values.involvedParties,
      reportNumber: values.reportNumber,
      offenderName: values.offenderName,
      offenderDOB: values.offenderDOB,
      offenderPlaceOfBirth: values.offenderPlaceOfBirth,
      policeID: values.policeID,
      crimeRefNumber: values.crimeRefNumber,
      // Additional fields
      dateInputted: new Date().toISOString(),
      timeOfDay: values.timeOfIncident && isValidDateOfIncident ? format(new Date(`${values.dateOfIncident.toDateString()}T${values.timeOfIncident}`), 'HH:mm') : '',
      dayOfWeek: isValidDateOfIncident ? format(new Date(values.dateOfIncident), 'EEEE') : '',
    }
    console.log('Submitting incident:', formattedData)
    onSubmit(formattedData)
  }

  const addStolenItem = () => {
    setStolenItems([
      ...stolenItems,
      {
        id: Date.now().toString(),
        category: "",
        description: "",
        productName: "",
        cost: 0,
        quantity: 1,
        totalAmount: 0,
      },
    ])
  }

  const updateStolenItem = (index: number, field: keyof StolenItem, value: any) => {
    const updatedItems = [...stolenItems]
    const item = updatedItems[index]
    
    const updatedItem = {
      ...item,
      [field]: value
    }
    
    // Update totalAmount if cost or quantity changes
    if (field === 'cost' || field === 'quantity') {
      updatedItem.totalAmount = updatedItem.cost * updatedItem.quantity
    }
    
    updatedItems[index] = updatedItem
    setStolenItems(updatedItems)
  }

  const removeStolenItem = (index: number) => {
    setStolenItems(stolenItems.filter((_, i) => i !== index))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="bg-[#F8F3F1]">
        <div className="w-full max-w-[98%] mx-auto px-4 py-4">
          {/* Header */}
          <div className="space-y-2 mb-4">
            <h1 className="text-xl font-semibold text-gray-900">New Incident Report</h1>
            <p className="text-sm text-gray-500">Fill in the details of the security incident below. All fields marked with * are required.</p>
          </div>

          {/* Form Content */}
          <div className="space-y-4">
            {/* Main Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-5">
                <div className="flex items-center gap-2 sm:gap-3 mb-4">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600">📋</div>
                  <div>
                    <h2 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900">Basic Information</h2>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Customer Name *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MOCK_CUSTOMERS.map((customer) => (
                              <SelectItem key={customer.id} value={customer.name}>
                                {customer.name}
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
                    name="siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Store Name *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select store" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MOCK_STORES.map((store) => (
                              <SelectItem key={store.id} value={store.name}>
                                {store.name}
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
                    name="officerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Officer Name *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select officer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MOCK_OFFICERS.map((officer) => (
                              <SelectItem key={officer.id} value={officer.name}>
                                {officer.name}
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
                    name="officerRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Officer Role *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MOCK_OFFICER_ROLES.map((role) => (
                              <SelectItem key={role.id} value={role.name}>
                                {role.name}
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
                    name="dutyManagerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Duty Manager Name *</FormLabel>
                        <FormControl>
                          <Input className="h-11" {...field} placeholder="Enter duty manager name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Incident Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-5">
                <div className="flex items-center gap-2 sm:gap-3 mb-4">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600">🕒</div>
                  <div>
                    <h2 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900">Incident Details</h2>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <FormField
                    control={form.control}
                    name="dateOfIncident"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Date of Incident *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full h-11 pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeOfIncident"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Time of Incident *</FormLabel>
                        <FormControl>
                          <Input type="time" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="incidentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Type of Incident *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {incidentTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-5">
                <div className="flex items-center gap-2 sm:gap-3 mb-4">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600">📝</div>
                  <div>
                    <h2 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900">Description</h2>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Incident Details *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the incident in detail"
                            className="min-h-[150px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Hidden field for incidentDetails */}
                  <FormField
                    control={form.control}
                    name="incidentDetails"
                    render={({ field }) => (
                      <input type="hidden" {...field} />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="storeComments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Store Comments</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any store-specific comments"
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Police Involvement */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-5">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <div className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600">👮</div>
                <div>
                  <h2 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900">Police Involvement</h2>
                </div>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="policeInvolvement"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 lg:gap-8">
                        <FormLabel className="text-base font-medium sm:min-w-[150px] lg:min-w-[180px]">Was Police Involved?</FormLabel>
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={field.value === true}
                              onChange={() => field.onChange(true)}
                              className="h-5 w-5"
                            />
                            <span className="text-base">Yes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={field.value === false}
                              onChange={() => field.onChange(false)}
                              className="h-5 w-5"
                            />
                            <span className="text-base">No</span>
                          </div>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('policeInvolvement') && (
                  <div className="space-y-3 sm:space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="urnNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">URN Number</FormLabel>
                            <FormControl>
                              <Input className="h-11" {...field} placeholder="Enter URN Number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="crimeRefNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Crime Reference Number</FormLabel>
                            <FormControl>
                              <Input className="h-11" {...field} placeholder="Enter reference number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Offender Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-5">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <div className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600">👤</div>
                <div>
                  <h2 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900">Offender Details</h2>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="offenderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Offender Name</FormLabel>
                        <FormControl>
                          <Input className="h-11" {...field} placeholder="Enter offender name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="offenderSex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Offender Sex</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="N/A or N/K" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="N/A or N/K">N/A or N/K</SelectItem>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="offenderDOB"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Offender DOB</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full h-11 pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3 sm:space-y-4 pt-4 border-t">
                  <FormField
                    control={form.control}
                    name="offenderAddress.numberAndStreet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Address</FormLabel>
                        <FormControl>
                          <Input className="h-11" {...field} placeholder="Enter street address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="offenderAddress.town"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Town</FormLabel>
                          <FormControl>
                            <Input className="h-11" {...field} placeholder="Enter town" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="offenderAddress.postCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Post Code</FormLabel>
                          <FormControl>
                            <Input className="h-11" {...field} placeholder="Enter post code" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Incident Categories */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-5">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <div className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600">🏷️</div>
                <div>
                  <h2 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900">Incident Categories</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {incidentInvolved.map((type) => (
                  <FormField
                    key={type}
                    control={form.control}
                    name="incidentInvolved"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(type)}
                            onCheckedChange={(checked) => {
                              const current = field.value || []
                              const updated = checked
                                ? [...current, type]
                                : current.filter((value) => value !== type)
                              field.onChange(updated)
                            }}
                            className="h-5 w-5 mt-1"
                          />
                        </FormControl>
                        <FormLabel className="text-base font-normal">
                          {type}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Stolen Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600">💰</div>
                  <div>
                    <h2 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900">Stolen Items</h2>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    onClick={onScanBarcode}
                    variant="outline"
                    size="lg"
                    className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
                  >
                    <QrCode className="h-5 w-5" />
                    Scan Barcode
                  </Button>
                  <Button
                    type="button"
                    onClick={addStolenItem}
                    variant="outline"
                    size="lg"
                    className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
                  >
                    <PlusCircle className="h-5 w-5" />
                    Add Item
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="hidden sm:grid sm:grid-cols-12 gap-4">
                  <div className="col-span-2">
                    <Label className="text-base font-medium">Category</Label>
                  </div>
                  <div className="col-span-3">
                    <Label className="text-base font-medium">Product Name</Label>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-base font-medium">Description</Label>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-base font-medium">Cost</Label>
                  </div>
                  <div className="col-span-1">
                    <Label className="text-base font-medium">Qty</Label>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-base font-medium">Total</Label>
                  </div>
                </div>

                {stolenItems.length > 0 ? (
                  <div className="space-y-4">
                    {stolenItems.map((item, index) => (
                      <div key={index} className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 items-start sm:items-center border-b sm:border-0 pb-4 sm:pb-0">
                        <div className="w-full sm:col-span-2">
                          <Label className="sm:hidden mb-1 block text-sm font-medium">Category</Label>
                          <Select
                            value={item.category}
                            onValueChange={(value) => updateStolenItem(index, "category", value)}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {retailCategories.COOP.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-full sm:col-span-3">
                          <Label className="sm:hidden mb-1 block text-sm font-medium">Product Name</Label>
                          <Input
                            className="h-11"
                            value={item.productName}
                            onChange={(e) => updateStolenItem(index, "productName", e.target.value)}
                            placeholder="Product name"
                          />
                        </div>
                        <div className="w-full sm:col-span-2">
                          <Label className="sm:hidden mb-1 block text-sm font-medium">Description</Label>
                          <Input
                            className="h-11"
                            value={item.description}
                            onChange={(e) => updateStolenItem(index, "description", e.target.value)}
                            placeholder="Item description"
                          />
                        </div>
                        <div className="w-full sm:col-span-2">
                          <Label className="sm:hidden mb-1 block text-sm font-medium">Cost</Label>
                          <Input
                            className="h-11"
                            type="number"
                            step="0.01"
                            value={item.cost}
                            onChange={(e) => updateStolenItem(index, "cost", parseFloat(e.target.value))}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="w-full sm:col-span-1">
                          <Label className="sm:hidden mb-1 block text-sm font-medium">Quantity</Label>
                          <Input
                            className="h-11"
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateStolenItem(index, "quantity", parseInt(e.target.value))}
                            placeholder="1"
                          />
                        </div>
                        <div className="w-full sm:col-span-2 flex items-center gap-2">
                          <div className="flex-1">
                            <Label className="sm:hidden mb-1 block text-sm font-medium">Total</Label>
                            <Input
                              className="h-11 text-right"
                              type="number"
                              value={item.totalAmount}
                              disabled
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStolenItem(index)}
                            className="text-red-500 hover:text-red-600 h-12 w-12 flex items-center justify-center"
                          >
                            <Trash2 className="h-7 w-7" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 lg:py-12 border border-dashed rounded-lg">
                    <div className="flex justify-center mb-4">
                      <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                    </div>
                    <p className="text-base text-gray-600">No items added</p>
                    <p className="text-sm text-gray-500">Click "Add Item" to start recording stolen items</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 sm:pt-6 border-t mt-4 sm:mt-6">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium">Total Items:</span>
                    <span className="text-lg font-semibold">{stolenItems.length}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <span className="text-base font-medium">Total Value Recovered:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg sm:text-xl font-semibold">£</span>
                      <span className="text-lg sm:text-xl font-semibold">
                        {stolenItems.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">(Auto-saved)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end items-center gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="h-9 px-4 text-sm"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="h-9 px-4 text-sm bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
})

IncidentForm.displayName = 'IncidentForm'

export { IncidentForm }
