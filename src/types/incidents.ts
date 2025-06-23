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
  houseName?: string;
  numberAndStreet?: string;
  villageOrSuburb?: string;
  town?: string;
  county?: string;
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
  regionId?: string;
  regionName?: string;
  siteId?: string;
  siteName?: string;
  officerName?: string;
  officerRole?: string;
  dutyManagerName?: string;
  dateInputted: string | Date;
  dateOfIncident: string | Date;
  timeOfIncident?: string;
  incidentType?: string;
  description?: string;
  incidentDetails?: string;
  storeComments?: string;
  totalValueRecovered?: number;
  policeInvolvement?: boolean;
  urnNumber?: string;
  crimeRefNumber?: string;
  
  status?: 'pending' | 'resolved' | 'in-progress';
  priority?: 'low' | 'medium' | 'high';
  actionTaken?: string;
  evidenceAttached?: boolean;
  witnessStatements?: string[];
  involvedParties?: string[];
  reportNumber?: string;
  
  offenderName?: string;
  offenderSex?: string;
  offenderDOB?: string | Date;
  offenderPlaceOfBirth?: string;
  offenderAddress?: OffenderAddress;
  gender?: 'Male' | 'Female' | 'N/A or N/K';
  
  policeID?: string;
  arrestSaveComment?: string;
  
  incidentInvolved?: string[];
  stolenItems?: StolenItem[];
  viewConfig?: {
    enabledPages: string[];
  };
}
