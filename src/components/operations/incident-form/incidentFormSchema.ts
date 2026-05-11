/** Zod schema for operations incident report form. */
import * as z from 'zod'

export const incidentFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  customerName: z.string().min(1, "Customer name is required"),
  siteId: z.string().optional(),
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
    isRecovered: z.boolean().optional(),
    recoveredQuantity: z.number().optional(),
    valueSaved: z.number().optional(),
    valueLost: z.number().optional(),
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
  gender: z.enum(['Male', 'Female', 'N/A or N/K']).default('N/A or N/K'),
  offenderDOB: z.date().optional(),
  offenderPlaceOfBirth: z.string().optional(),
  offenderMarks: z.string().max(500, 'Marks must be under 500 characters').optional(),
  policeID: z.string().optional(),
  crimeRefNumber: z.string().optional(),
  arrestSaveComment: z.string().optional(),
  offenderDetailsVerified: z.boolean().default(false),
  verificationMethod: z.string().optional(),
  verificationEvidenceImage: z.string().optional(),
}).superRefine((values, context) => {
  if (values.offenderDetailsVerified && !values.verificationMethod) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Verification method is required when details are verified.',
      path: ['verificationMethod'],
    })
  }
})

export type IncidentFormValues = z.infer<typeof incidentFormSchema>
