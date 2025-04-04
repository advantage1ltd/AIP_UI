export enum IncidentType {
  ARREST = 'Arrest - Saved?',
  DETER = 'Deter - Saved?',
  THEFT = 'Theft - Loss?',
  CRIMINAL_DAMAGE = 'Criminal Damage?',
  CREDIT_CARD_FRAUD = 'Credit Card Fraud?',
  SUSPICIOUS_BEHAVIOUR = 'Suspicious Behaviour?',
  UNDERAGE_PURCHASE = 'Underage Purchase?',
  ANTI_SOCIAL = 'Anti-Social Behaviour?',
  OTHER = 'Other?'
}

export enum IncidentInvolved {
  SELF_SCAN_TILLS = 'Self Scan Tills?',
  ABUSIVE_BEHAVIOUR = 'Abusive behaviour?',
  THREATS_AND_INTIMIDATION = 'Threats And Intimidation?',
  SPITTING = 'Spitting?',
  BAN_FROM_STORE = 'Ban From Store?',
  VIOLENT_BEHAVIOR = 'Violent Behavior (Physical)?',
  SCAN_AND_GO = 'Scan And Go?',
  POLICE_FAILED_TO_ATTEND = 'Police Failed to Attend?'
}

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
  category: string;
  name: string;
  productName: string;
  value: number;
  quantity: number;
  total: number;
}

export interface Incident {
  id: string;
  dateInputted: string;
  incidentDate: string;
  incidentTime: string;
  siteName: string;
  customerName: string;
  incidentType: string;
  involvedType?: string;
  description: string;
  status: 'Open' | 'Closed';
  stolenItems?: any[];
  totalValue: number;
  totalValueRecovered: number;
  reportedBy: string;
  witnesses?: string;
  locationInStore?: string;
  timeOfDay?: string;
  dayOfWeek?: string;
  securityResponseTime?: number;
  cameraFootage?: boolean;
  securityStaffPresent?: boolean;
  policeInvolved?: boolean;
  
  // Fields that might be used elsewhere in the application
  officerName?: string;
  officerRole?: string;
  dateOfIncident?: string;
  timeOfIncident?: string;
  officerReport?: string;
  categoryId?: number;
  officeLocation?: string;
  assignedTo?: string;
}
