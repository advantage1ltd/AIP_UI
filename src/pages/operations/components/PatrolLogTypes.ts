export interface EditFormData {
  patrolId: string;
  patrolType: string;
  logDate: string;
  building: string;
  location: string;
  issue: string;
  additionalInfo: string;
  maximoPorterTracNo: string;
  status: 'Open' | 'Closed';
  trustByesTeamAssign: string;
  actionTaken: string;
}

export const ISSUE_TYPES = [
  'Door Issue',
  'Window Issue',
  'Lighting Issue',
  'HVAC Issue',
  'Plumbing Issue',
  'Electrical Issue',
  'Security Issue',
  'Cleanliness Issue',
  'Safety Issue',
  'Other'
];

export const ACTION_TAKEN_OPTIONS = [
  'Reported to Maintenance',
  'Immediate Fix',
  'Escalated to Management',
  'Documented for Follow-up',
  'No Action Required',
  'Other'
]; 