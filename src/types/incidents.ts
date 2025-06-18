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
  numberAndStreet?: string;
  town?: string;
  postCode?: string;
}

export interface StolenItem {
  id: string;
  category?: string;
  description?: string;
  productName?: string;
  cost: number;
  quantity: number;
  totalAmount: number;
}

export interface Incident {
  id: string;
  customerId?: string;
  customerName?: string;
  siteName?: string;
  officerName?: string;
  officerRole?: string;
  dutyManagerName?: string;
  dateInputted: string | Date;
  dateOfIncident: string | Date;
  timeOfIncident?: string;
  incidentType?: string;
  description?: string;
  storeComments?: string;
  totalValueRecovered?: number;
  policeInvolvement?: boolean;
  urnNumber?: string;
  crimeRefNumber?: string;
  offenderName?: string;
  offenderSex?: string;
  offenderDOB?: string | Date;
  offenderAddress?: OffenderAddress;
  incidentInvolved?: string[];
  stolenItems?: StolenItem[];
  viewConfig?: {
    enabledPages: string[];
  };
}
