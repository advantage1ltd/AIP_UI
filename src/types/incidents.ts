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
  category: string
  description: string
  productName: string
  cost: number
  quantity: number
  totalAmount: number
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
  incidentDetails: string;
  storeComments?: string;
  incidentInvolved: string[];
  policeInvolvement: boolean;
  urnNumber?: string;
  totalValueRecovered?: number;
  stolenItems?: StolenItem[];
  dutyManagerName: string;
  dateInputted: string;
  userThatInput: string;
  status?: 'pending' | 'resolved' | 'in-progress';
  priority?: 'low' | 'medium' | 'high';
  actionTaken?: string;
  evidenceAttached?: boolean;
  witnessStatements?: string[];
  involvedParties?: string[];
  reportNumber?: string;
  locationDetails?: {
    area: string;
    specificLocation: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  timeDetails?: {
    discoveryTime: string;
    reportedTime: string;
    responseTime?: string;
  };
  offenderName?: string;
  offenderAddress?: {
    houseName?: string;
    numberAndStreet?: string;
    villageOrSuburb?: string;
    town?: string;
    county?: string;
    postCode?: string;
  };
  offenderSex?: 'Male' | 'Female' | 'N/A or N/K';
  offenderDOB?: string;
  offenderPlaceOfBirth?: string;
  policeID?: string;
  crimeRefNumber?: string;
}
