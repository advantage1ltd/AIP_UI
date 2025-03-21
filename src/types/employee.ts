export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  startDate: Date;
  status: 'active' | 'inactive' | 'terminated';
  employmentType: 'full-time' | 'part-time' | 'contract';
  supervisor?: string;
  email: string;
  contactNumber?: string;
}

export type ActivityCategory = 
  | 'employment'
  | 'training'
  | 'leave'
  | 'incidents'
  | 'documents'
  | 'performance'
  | 'equipment'
  | 'certifications';

export type ActivityStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'on_hold';

export type ActivitySource = 
  | 'manual'
  | 'hr_system'
  | 'training_system'
  | 'leave_system'
  | 'performance_system'
  | 'document_system'
  | 'equipment_system'
  | 'certification_system';

export interface EmployeeActivity {
  id: string;
  employeeId: string;
  employeeName: string;
  activityDate: Date;
  activityCategory: ActivityCategory;
  activityType: string;
  description: string;
  status: ActivityStatus;
  source: ActivitySource;
  sourceReference?: string;
  attachments: string[];
  notes?: string;
  relatedDocuments: string[];
  nextReviewDate?: Date;
  actionRequired: boolean;
  actionDeadline?: Date;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivitySyncStatus {
  source: ActivitySource;
  status: 'active' | 'inactive' | 'error';
  lastSynced: Date | null;
  error?: string;
} 