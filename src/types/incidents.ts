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
  id: string;
  category: string;
  description: string;
  productName: string;
  cost: number;
  quantity: number;
  totalAmount: number;
}

export interface Incident {
  id: string;
  customerName: string;
  siteName: string;
  officerName: string;
  officerRole: string;
  dateOfIncident: string;
  timeOfIncident: string;
  incidentType: string;
  description: string;
  incidentDetails?: string;
  storeComments?: string;
  incidentInvolved: string[];
  policeInvolvement: boolean;
  dutyManagerName: string;
  status: 'pending' | 'resolved' | 'in-progress';
  priority: 'low' | 'medium' | 'high';
  evidenceAttached: boolean;
  offenderAddress?: {
    houseName?: string;
    numberAndStreet?: string;
    villageOrSuburb?: string;
    town?: string;
    county?: string;
    postCode?: string;
  };
  offenderSex?: 'Male' | 'Female' | 'N/A or N/K';
  offenderDOB?: Date;
  offenderPlaceOfBirth?: string;
  policeID?: string;
  crimeRefNumber?: string;
  urnNumber?: string;
  totalValueRecovered: number;
  stolenItems: StolenItem[];
  actionTaken?: string;
  witnessStatements?: string[];
  involvedParties?: string[];
  reportNumber?: string;
  offenderName?: string;
  dateInputted: string;
  timeOfDay: string;
  dayOfWeek: string;
}
