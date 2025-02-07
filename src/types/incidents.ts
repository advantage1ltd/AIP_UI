export enum IncidentType {
  ARREST = 'A - Arrest - Saved?',
  DETER = 'B - Deter - Saved?',
  THEFT = 'C - Theft - Loss?',
  CRIMINAL_DAMAGE = 'D - Criminal Damage?',
  CREDIT_CARD_FRAUD = 'E - Credit Card Fraud?',
  SUSPICIOUS_BEHAVIOUR = 'F - Suspicious Behaviour?',
  UNDERAGE_PURCHASE = 'G - Underage Purchase?',
  ANTI_SOCIAL = 'H - Anti-Social Behaviour?',
  OTHER = 'I - Other?'
}

export type IncidentInvolved =
  | 'J - Self Scan Tills?'
  | 'L - Threats And Intimidation?'
  | 'N - Ban From Store?'
  | 'M - Scan And Go?'
  | 'K - Abusive behaviour?'
  | 'M - Spitting?'
  | 'O - Violent Behavior (Physical)?'
  | 'Q - Police Failed to Attend?'

export type OffenderSex = 'Male' | 'Female' | 'N/A or N/K'

export interface OffenderAddress {
  houseNumber: string
  numberAndStreet: string
  villageOrSuburb: string
  town: string
  county: string
  postCode: string
}

export interface StolenItem {
  id: string
  description: string
  cost: number
  quantity: number
  totalAmount: number
}

export interface Incident {
  id?: string;
  officerName: string
  officerRole: string
  customerName: string
  siteName: string
  offenderName: string
  typeOfIncident: IncidentType
  incidentInvolved: IncidentInvolved[]
  policeInvolvement: boolean
  urnNumber?: string
  dateOfIncident: string
  timeOfIncident: string
  incidentDetails: string
  storeComments: string
  offenderSex: OffenderSex
  offenderAge: number
  offenderDOB: string
  offenderPlaceOfBirth: string
  offenderAddress: OffenderAddress
  personalDetailsVerified: boolean
  policeID: string
  crimeReferenceNumber: string
  totalValueRecovered: number
  stolenItems: StolenItem[]
  dutyManagerName: string
  dateInputted: string
  userThatInput: string
}
