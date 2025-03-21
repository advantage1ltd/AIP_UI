export interface PatrolLog {
  id: string;
  patrolType: 'Internal' | 'External';
  logDate: string;
  building: string;
  location: string;
  issueDescription: string;
  additionalInfo: string;
  maximoPorterTracNo: string;
  status: 'Open' | 'Closed';
  trustByesTeamAssign: string;
  actionTaken: string;
  archived?: boolean;
}

export interface EditFormData {
  patrolId: string;
  patrolType: 'Internal' | 'External';
  logDate: string;
  building: string;
  location: string;
  issue: string;
  additionalInfo: string;
  maximoPorterTracNo: string;
  actionTaken: string;
  status: 'Open' | 'Closed';
  trustByesTeamAssign: string;
}

export const ISSUE_TYPES = [
  'Empty Cage',
  'Porters Chair',
  'Bed/Cot',
  'Linen Cage Dirty',
  'Linen Cage Clean',
  'Green Tote Box',
  'Pallet Empty',
  'Full Linen Cages'
] as const;

export const ACTION_TAKEN_OPTIONS = [
  'Byes Helpdesk',
  'Emailed Reub',
  'Escalated to Management',
  'Maintenance Notified',
  'Security Team Alerted'
] as const;

export const STAKEHOLDER_EMAILS = {
  'Byes Helpdesk': 'helpdesk@byes.com',
  'Reub': 'reub@company.com',
  'Management': 'management@company.com',
  'Maintenance': 'maintenance@company.com',
  'Security': 'security@company.com'
} as const;

export const ITEMS_PER_PAGE = 5;

export const INITIAL_EDIT_FORM_DATA: EditFormData = {
  patrolId: '00033375',
  patrolType: 'Internal',
  logDate: '',
  building: 'West Wing',
  location: '',
  issue: '',
  additionalInfo: '',
  maximoPorterTracNo: '',
  actionTaken: 'Byes Helpdesk',
  status: 'Open',
  trustByesTeamAssign: 'HelpDesk'
}; 