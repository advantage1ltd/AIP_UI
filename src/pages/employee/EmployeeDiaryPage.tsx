import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Eye, CalendarIcon, Clock, MapPin, Shield, AlertTriangle, FileText, Briefcase, GraduationCap, Target, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIconIcon } from 'lucide-react';

// Use imported components with renamed imports
import { ActivityTimeline as ActivityTimelineImported } from '@/components/employee/ActivityTimeline';
import { ActivityForm as ActivityFormImported } from '@/components/employee/ActivityForm';
import { SyncStatus } from '@/components/employee/SyncStatus';
import { employeeActivityService } from '@/services/employeeActivityService';
import { ACTIVITY_CATEGORIES, ACTIVITY_SOURCES, AUTO_SYNC_INTERVAL, ITEMS_PER_PAGE } from '@/config/activityConfig';
import type { ActivityCategory, ActivitySource, ActivityStatus, ActivitySyncStatus, EmployeeActivity, Employee } from '@/types/employee';

// Constants and Types
const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  employment: 'bg-blue-100 text-blue-800',
  training: 'bg-green-100 text-green-800',
  leave: 'bg-purple-100 text-purple-800',
  incidents: 'bg-red-100 text-red-800',
  documents: 'bg-yellow-100 text-yellow-800',
  performance: 'bg-orange-100 text-orange-800',
  equipment: 'bg-indigo-100 text-indigo-800',
  certifications: 'bg-pink-100 text-pink-800',
};

// Activity types by category
const ACTIVITY_TYPES: Record<ActivityCategory, string[]> = {
  employment: [
    'New Hire',
    'Contract Update',
    'Role Change',
    'Salary Review',
    'Termination',
    'Disciplinary Action',
  ],
  training: [
    'Initial Training',
    'Refresher Course',
    'Certification Training',
    'Skills Development',
    'Health & Safety Training',
    'Compliance Training',
  ],
  leave: [
    'Annual Leave Request',
    'Sick Leave',
    'Compassionate Leave',
    'Unpaid Leave',
    'Training Leave',
    'Other Leave',
  ],
  incidents: [
    'Security Incident',
    'Workplace Accident',
    'Customer Complaint',
    'Policy Violation',
    'Equipment Damage',
    'Near Miss',
  ],
  documents: [
    'Contract Signing',
    'Policy Acknowledgment',
    'NDA',
    'Performance Review',
    'Warning Letter',
    'Certificate',
  ],
  performance: [
    'Annual Review',
    'Quarterly Assessment',
    'KPI Update',
    'Commendation',
    'Warning',
    'Improvement Plan',
  ],
  equipment: [
    'Uniform Issue',
    'Equipment Assignment',
    'Return of Equipment',
    'Damage Report',
    'Replacement Request',
    'Maintenance Record',
  ],
  certifications: [
    'SIA License',
    'First Aid',
    'Fire Safety',
    'Health & Safety',
    'Specialized Training',
    'License Renewal',
  ],
} as const;

// Form schema
const formSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  employeeName: z.string().min(1, 'Employee name is required'),
  activityDate: z.date(),
  activityCategory: z.enum(['employment', 'training', 'leave', 'incidents', 'documents', 'performance', 'equipment', 'certifications'] as const),
  activityType: z.string().min(1, 'Type is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'] as const),
  source: z.enum(['manual', 'hr_system', 'training_system', 'leave_system', 'performance_system', 'document_system', 'equipment_system', 'certification_system'] as const),
  sourceReference: z.string().optional(),
  attachments: z.array(z.string()).default([]),
  notes: z.string().optional(),
  relatedDocuments: z.array(z.string()).default([]),
  nextReviewDate: z.date().optional(),
  actionRequired: z.boolean().default(false),
  actionDeadline: z.date().optional(),
  recordedBy: z.string().min(1, 'Recorder is required'),
});

type FormData = z.infer<typeof formSchema>;

// Define local types for this component
type EmployeeActivityWithoutOptional = {
  id: string;
  employeeId: string;
  employeeName: string;
  activityDate: Date;
  activityCategory: string;
  activityType: string;
  description: string;
  status: string;
  source: ActivitySource;
  recordedBy: string;
  actionRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
  attachments?: string[];
  notes?: string;
  relatedDocuments?: string[];
  nextReviewDate?: Date;
  actionDeadline?: Date;
};

// Mock data
const employees = [
  { id: 'EMP001', name: 'John Doe', role: 'Security Officer' },
  { id: 'EMP002', name: 'Jane Smith', role: 'Security Supervisor' },
  { id: 'EMP003', name: 'Mike Johnson', role: 'Security Officer' },
  { id: 'EMP004', name: 'Sarah Williams', role: 'Security Officer' },
  { id: 'EMP005', name: 'David Rodriguez', role: 'Security Manager' },
  { id: 'EMP006', name: 'Lisa Chen', role: 'Training Coordinator' },
  { id: 'EMP007', name: 'James Wilson', role: 'Senior Security Officer' },
  { id: 'EMP008', name: 'Amanda Taylor', role: 'HR Specialist' },
] as unknown as Employee[];

const mockActivities: EmployeeActivity[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    activityDate: new Date(),
    activityCategory: 'employment',
    activityType: 'New Hire',
    description: 'Initial employment contract signed',
    status: 'completed',
    source: 'manual',
    attachments: ['contract.pdf'],
    relatedDocuments: [],
    recordedBy: 'HR Manager',
    actionRequired: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    activityDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    activityCategory: 'training',
    activityType: 'Initial Training',
    description: 'Completed initial security training program',
    status: 'completed',
    source: 'training_system',
    attachments: [],
    relatedDocuments: [],
    nextReviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    recordedBy: 'Training Manager',
    actionRequired: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    employeeId: 'EMP002',
    employeeName: 'Jane Smith',
    activityDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    activityCategory: 'performance',
    activityType: 'Quarterly Assessment',
    description: 'Excellent performance in team leadership and coordination',
    status: 'completed',
    source: 'performance_system',
    attachments: ['assessment_q2.pdf'],
    relatedDocuments: ['performance_matrix.xlsx'],
    recordedBy: 'David Rodriguez',
    actionRequired: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    employeeId: 'EMP003',
    employeeName: 'Mike Johnson',
    activityDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    activityCategory: 'certifications',
    activityType: 'SIA License',
    description: 'License renewal submitted',
    status: 'in_progress',
    source: 'certification_system',
    attachments: ['license_renewal.pdf'],
    relatedDocuments: [],
    recordedBy: 'Amanda Taylor',
    actionRequired: true,
    actionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    employeeId: 'EMP004',
    employeeName: 'Sarah Williams',
    activityDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    activityCategory: 'leave',
    activityType: 'Annual Leave Request',
    description: 'Two weeks annual leave approved',
    status: 'completed',
    source: 'leave_system',
    attachments: [],
    relatedDocuments: ['leave_calendar.xlsx'],
    recordedBy: 'System',
    actionRequired: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    id: '6',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    activityDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    activityCategory: 'equipment',
    activityType: 'Uniform Issue',
    description: 'Complete uniform kit issued',
    status: 'completed',
    source: 'equipment_system',
    attachments: ['equipment_receipt.pdf'],
    relatedDocuments: [],
    recordedBy: 'Store Manager',
    actionRequired: false,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  },
  {
    id: '7',
    employeeId: 'EMP005',
    employeeName: 'David Rodriguez',
    activityDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    activityCategory: 'training',
    activityType: 'Leadership Workshop',
    description: 'Completed advanced leadership training',
    status: 'completed',
    source: 'training_system',
    attachments: ['certificate.pdf'],
    relatedDocuments: ['leadership_manual.pdf'],
    recordedBy: 'Lisa Chen',
    actionRequired: true,
    actionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: '8',
    employeeId: 'EMP006',
    employeeName: 'Lisa Chen',
    activityDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    activityCategory: 'documents',
    activityType: 'Policy Acknowledgment',
    description: 'Annual policy updates acknowledgment',
    status: 'pending',
    source: 'document_system',
    attachments: [],
    relatedDocuments: ['policy_updates_2023.pdf'],
    recordedBy: 'System',
    actionRequired: true,
    actionDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '9',
    employeeId: 'EMP007',
    employeeName: 'James Wilson',
    activityDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    activityCategory: 'incidents',
    activityType: 'Security Incident',
    description: 'Successfully handled unauthorized access attempt',
    status: 'completed',
    source: 'manual',
    attachments: ['incident_report.pdf'],
    relatedDocuments: ['security_log.xlsx'],
    recordedBy: 'David Rodriguez',
    actionRequired: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
  },
  {
    id: '10',
    employeeId: 'EMP002',
    employeeName: 'Jane Smith',
    activityDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    activityCategory: 'employment',
    activityType: 'Role Change',
    description: 'Promotion to Security Supervisor',
    status: 'completed',
    source: 'hr_system',
    attachments: ['promotion_letter.pdf'],
    relatedDocuments: ['job_description.pdf'],
    recordedBy: 'Amanda Taylor',
    actionRequired: true,
    actionDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
];

// State interface
interface State {
  isDialogOpen: boolean;
  searchQuery: string;
  currentPage: number;
  editingEntry: EmployeeActivity | null;
  activeTab: ActivityCategory | 'all';
  selectedEmployee: string | null;
  activities: EmployeeActivity[];
  syncStatus: Record<ActivitySource, ActivitySyncStatus>;
  isSyncing: boolean;
  errorLog: Array<{ message: string; timestamp: Date; data?: any }>;
}

// Action types
type Action =
  | { type: 'SET_DIALOG_OPEN'; payload: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_EDITING_ENTRY'; payload: EmployeeActivity | null }
  | { type: 'SET_ACTIVE_TAB'; payload: ActivityCategory | 'all' }
  | { type: 'SET_SELECTED_EMPLOYEE'; payload: string | null }
  | { type: 'SET_ACTIVITIES'; payload: EmployeeActivity[] }
  | { type: 'ADD_ACTIVITY'; payload: EmployeeActivity }
  | { type: 'UPDATE_ACTIVITY'; payload: EmployeeActivity }
  | { type: 'DELETE_ACTIVITY'; payload: string }
  | { type: 'SET_SYNC_STATUS'; payload: Record<ActivitySource, ActivitySyncStatus> }
  | { type: 'UPDATE_SYNC_STATUS'; payload: { source: ActivitySource; status: ActivitySyncStatus } }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'LOG_ERROR'; payload: { message: string; data?: any } };

// Mock data for testing
const mockEmployees = [
  { id: '1', name: 'John Doe', role: 'Software Engineer' },
  { id: '2', name: 'Jane Smith', role: 'Product Manager' },
  { id: '3', name: 'Mike Johnson', role: 'Designer' },
  { id: '4', name: 'Sarah Williams', role: 'Marketing Manager' },
] as unknown as Employee[];

const initialSyncStatus: Record<ActivitySource, ActivitySyncStatus> = {
  manual: { source: 'manual', status: 'inactive', lastSynced: null },
  hr_system: { source: 'hr_system', status: 'inactive', lastSynced: null },
  training_system: { source: 'training_system', status: 'inactive', lastSynced: null },
  leave_system: { source: 'leave_system', status: 'inactive', lastSynced: null },
  performance_system: { source: 'performance_system', status: 'inactive', lastSynced: null },
  document_system: { source: 'document_system', status: 'inactive', lastSynced: null },
  equipment_system: { source: 'equipment_system', status: 'inactive', lastSynced: null },
  certification_system: { source: 'certification_system', status: 'inactive', lastSynced: null },
};

const initialState: State = {
  isDialogOpen: false,
  searchQuery: '',
  currentPage: 1,
  editingEntry: null,
  activeTab: 'all',
  selectedEmployee: null,
  activities: mockActivities,
  syncStatus: initialSyncStatus,
  isSyncing: false,
  errorLog: [],
};

// Reducer function defined outside component
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_DIALOG_OPEN':
      return { ...state, isDialogOpen: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload, currentPage: 1 };
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_EDITING_ENTRY':
      return { ...state, editingEntry: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload, currentPage: 1 };
    case 'SET_SELECTED_EMPLOYEE':
      return { ...state, selectedEmployee: action.payload, currentPage: 1 };
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities] };
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.map(activity =>
          activity.id === action.payload.id ? action.payload : activity
        ),
      };
    case 'DELETE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.filter(activity => activity.id !== action.payload),
      };
    case 'SET_SYNC_STATUS':
      return { ...state, syncStatus: action.payload };
    case 'UPDATE_SYNC_STATUS':
      return {
        ...state,
        syncStatus: {
          ...state.syncStatus,
          [action.payload.source]: action.payload.status,
        },
      };
    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload };
    case 'LOG_ERROR':
      return {
        ...state,
        errorLog: [
          ...state.errorLog,
          { message: action.payload.message, timestamp: new Date(), data: action.payload.data },
        ],
      };
    default:
      return state;
  }
}

const EmployeeDiaryPage: React.FC = () => {
  console.log("Initial state with activities:", initialState.activities.length);
  
  // Direct activities state separate from reducer
  const [activities, setActivities] = useState<EmployeeActivity[]>(mockActivities);
  
  useEffect(() => {
    console.log("Component mounted, direct activities:", activities.length);
    
    // Directly set activities to ensure we have data
    if (activities.length === 0) {
      console.log("Forcing activities to mock data");
      setActivities(mockActivities);
    }
  }, [activities.length]);
  
  // State management
  const [state, dispatch] = useReducer(reducer, initialState);
  
  useEffect(() => {
    console.log("Component mounted, state activities:", state.activities.length);
    console.log("Active tab:", state.activeTab);
    
    // Force set activities explicitly to make sure we have data
    dispatch({ type: 'SET_ACTIVITIES', payload: mockActivities });
    
    // Also reset to "all" tab
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'all' });
  }, []);
  
  // Modify the filtered activities logic to be more permissive for debugging
  const filteredActivities = useMemo(() => {
    const searchLower = state.searchQuery.toLowerCase();
    
    console.log("Filtering with tab:", state.activeTab);
    
    return state.activities.filter((activity) => {
      // Handle search filtering
      const matchesSearch = 
        activity.employeeName.toLowerCase().includes(searchLower) ||
        activity.activityType.toLowerCase().includes(searchLower) ||
        activity.description.toLowerCase().includes(searchLower);

      // Handle employee filtering
      if (state.selectedEmployee && state.selectedEmployee !== 'all') {
        if (activity.employeeId !== state.selectedEmployee) return false;
      }
      
      // Handle tab filtering
      if (state.activeTab === 'all') {
        return matchesSearch;
      }
      
      // Important: Compare category ID with current tab
      // Log this comparison to debug tab filtering issues
      console.log(`Tab filter: Activity ${activity.id} with category "${activity.activityCategory}" vs active tab "${state.activeTab}"`);
      
      // Categories need exact string matching
      return matchesSearch && activity.activityCategory === state.activeTab;
    });
  }, [state.activities, state.searchQuery, state.selectedEmployee, state.activeTab]);

  // Form handling
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: '',
      employeeName: '',
      activityCategory: 'employment',
      activityType: '',
      description: '',
      status: 'pending',
      source: 'manual',
      sourceReference: '',
      attachments: [],
      notes: '',
      relatedDocuments: [],
      actionRequired: false,
      recordedBy: 'System User',
      activityDate: new Date(),
    },
  });

  // Data fetching
  const fetchActivities = useCallback(async () => {
    try {
      const activities = await employeeActivityService.fetchEmployeeActivities(
        state.selectedEmployee || undefined
      );
      dispatch({ type: 'SET_ACTIVITIES', payload: activities });
    } catch (error) {
      dispatch({
        type: 'LOG_ERROR',
        payload: { message: 'Error fetching activities', data: error },
      });
      toast({
        title: "Error",
        description: "Failed to fetch activities.",
        variant: "destructive",
      });
    }
  }, [state.selectedEmployee]);

  const checkSyncStatus = useCallback(async () => {
    try {
      const sources = await employeeActivityService.fetchActivitySources();
      dispatch({ type: 'SET_SYNC_STATUS', payload: sources });
    } catch (error) {
      dispatch({
        type: 'LOG_ERROR',
        payload: { message: 'Error checking sync status', data: error },
      });
    }
  }, []);

  // Event handlers
  const handleSync = useCallback(async (source: ActivitySource) => {
    if (state.isSyncing) return;
    
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      await employeeActivityService.syncActivitiesFromSource(source);
      await fetchActivities();
      toast({
        title: "Sync Complete",
        description: `Successfully synced activities from ${ACTIVITY_SOURCES[source].label}`,
      });
    } catch (error) {
      dispatch({
        type: 'LOG_ERROR',
        payload: { message: `Error syncing from ${source}`, data: error },
      });
      toast({
        title: "Sync Error",
        description: `Failed to sync activities from ${ACTIVITY_SOURCES[source].label}`,
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  }, [fetchActivities, state.isSyncing]);

  const handleSubmit = useCallback(async (values: FormData) => {
    try {
      const commonData = {
        employeeId: values.employeeId,
        employeeName: values.employeeName,
        activityDate: values.activityDate,
        activityCategory: values.activityCategory as ActivityCategory,
        activityType: values.activityType,
        description: values.description,
        status: values.status as ActivityStatus,
        source: values.source as ActivitySource,
        attachments: values.attachments || [],
        notes: values.notes,
        relatedDocuments: values.relatedDocuments || [],
        nextReviewDate: values.nextReviewDate,
        actionRequired: values.actionRequired,
        actionDeadline: values.actionDeadline,
        recordedBy: values.recordedBy,
      };

      if (state.editingEntry) {
        const updated = await employeeActivityService.updateActivity(
          state.editingEntry.id,
          commonData
        );
        dispatch({ type: 'UPDATE_ACTIVITY', payload: updated });
        toast({
          title: "Activity Updated",
          description: "Employee activity record has been updated.",
        });
      } else {
        const created = await employeeActivityService.createActivity(commonData);
        dispatch({ type: 'ADD_ACTIVITY', payload: created });
        toast({
          title: "Activity Added",
          description: "New employee activity has been recorded.",
        });
      }

      dispatch({ type: 'SET_DIALOG_OPEN', payload: false });
      dispatch({ type: 'SET_EDITING_ENTRY', payload: null });
      form.reset();
    } catch (error) {
      dispatch({
        type: 'LOG_ERROR',
        payload: { message: 'Error in handleSubmit', data: error },
      });
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save the activity.",
        variant: "destructive",
      });
    }
  }, [state.editingEntry, form]);

  const handleEdit = useCallback((activity: EmployeeActivity) => {
    dispatch({ type: 'SET_EDITING_ENTRY', payload: activity });
    form.reset({
      ...activity,
      activityCategory: activity.activityCategory as ActivityCategory,
      status: activity.status as ActivityStatus,
    });
    dispatch({ type: 'SET_DIALOG_OPEN', payload: true });
  }, [form]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this activity record?')) {
        await employeeActivityService.deleteActivity(id);
        dispatch({ type: 'DELETE_ACTIVITY', payload: id });
        toast({
          title: "Activity Deleted",
          description: "The activity record has been permanently deleted.",
        });
      }
    } catch (error) {
      dispatch({
        type: 'LOG_ERROR',
        payload: { message: 'Error in handleDelete', data: error },
      });
      toast({
        title: "Error",
        description: "Failed to delete the activity.",
        variant: "destructive",
      });
    }
  }, []);

  const handleToggleSourceStatus = useCallback((source: ActivitySource) => {
    const currentStatus = state.syncStatus[source];
    const newStatus: ActivitySyncStatus = {
      ...currentStatus,
      status: currentStatus.status === 'active' ? 'inactive' : 'active',
      lastSynced: currentStatus.status === 'inactive' ? currentStatus.lastSynced : new Date()
    };
    
    dispatch({ 
      type: 'UPDATE_SYNC_STATUS', 
      payload: { 
        source, 
        status: newStatus 
      } 
    });
    
    toast({
      title: `${ACTIVITY_SOURCES[source].label} Sync ${newStatus.status === 'active' ? 'Activated' : 'Deactivated'}`,
      description: `Synchronization for ${ACTIVITY_SOURCES[source].label} is now ${newStatus.status}.`,
    });
  }, [state.syncStatus]);

  // Auto-sync effect
  useEffect(() => {
    const syncSources = async () => {
      if (state.isSyncing) return;
      
      for (const [source, config] of Object.entries(ACTIVITY_SOURCES)) {
        if (config.syncInterval > 0 && state.syncStatus[source as ActivitySource]?.status === 'active') {
          await handleSync(source as ActivitySource);
        }
      }
    };

    const interval = setInterval(syncSources, AUTO_SYNC_INTERVAL);
    return () => clearInterval(interval);
  }, [state.syncStatus, handleSync, state.isSyncing]);

  // Filtered and paginated data - memoized for performance
  const sortedActivities = useMemo(() => 
    [...filteredActivities].sort((a, b) => 
      b.activityDate.getTime() - a.activityDate.getTime()
    )
  , [filteredActivities]);

  const totalPages = Math.ceil(sortedActivities.length / ITEMS_PER_PAGE);
  
  const paginatedActivities = useMemo(() => 
    sortedActivities.slice(
      (state.currentPage - 1) * ITEMS_PER_PAGE,
      state.currentPage * ITEMS_PER_PAGE
    )
  , [sortedActivities, state.currentPage]);

  // Debug current state - moved here after all data is defined
  useEffect(() => {
    console.log("Current state:", {
      activities: state.activities.length,
      filteredActivities: filteredActivities.length,
      paginatedActivities: paginatedActivities.length,
      currentPage: state.currentPage,
      activeTab: state.activeTab,
      searchQuery: state.searchQuery
    });
  }, [state, filteredActivities, paginatedActivities]);

  const handleTabChange = useCallback((value: string) => {
    dispatch({ 
      type: 'SET_ACTIVE_TAB', 
      payload: value === 'all' ? 'all' : value as ActivityCategory
    });
  }, []);

  const handleEmployeeChange = useCallback((value: string) => {
    dispatch({ type: 'SET_SELECTED_EMPLOYEE', payload: value || null });
  }, []);

  const handleDialogChange = useCallback((open: boolean) => {
    dispatch({ type: 'SET_DIALOG_OPEN', payload: open });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  }, []);

  // Render empty state component
  const renderEmptyState = useCallback(() => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">No activities found</h3>
      <p className="text-muted-foreground mt-2">
        Start by adding a new activity record or sync from available sources.
      </p>
    </div>
  ), []);

  // Add this right before the return statement to test
  console.log("Before render:", {
    mockDataLength: mockActivities.length,
    activitiesLength: activities.length,
    stateActivitiesLength: state.activities.length,
    paginatedLength: paginatedActivities.length
  });

  // Add a guaranteed hardcoded activity for rendering
  const FALLBACK_ACTIVITY: EmployeeActivity = {
    id: 'fallback-1',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    activityDate: new Date(),
    activityCategory: 'employment',
    activityType: 'New Hire',
    description: 'Initial employment contract signed',
    status: 'completed',
    source: 'manual',
    attachments: ['contract.pdf'],
    relatedDocuments: [],
    recordedBy: 'HR Manager',
    actionRequired: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-4 max-w-full overflow-hidden">
      <Card className="overflow-hidden">
        <CardHeader className="p-3 md:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold">Employee Activity Diary</CardTitle>
              <CardDescription className="text-sm mt-1">
                Comprehensive record of all employee-related activities and interactions
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <Select
                  value={state.selectedEmployee || undefined}
                  onValueChange={handleEmployeeChange}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog 
                  open={state.isDialogOpen} 
                  onOpenChange={handleDialogChange}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-blue-900 text-white hover:bg-blue-800 w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Activity
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] w-[95vw] max-w-full">
                    <DialogHeader>
                      <DialogTitle>
                        {state.editingEntry ? 'Edit Activity Record' : 'Add New Activity Record'}
                      </DialogTitle>
                      <DialogDescription>
                        {state.editingEntry 
                          ? 'Update the activity record details below.' 
                          : 'Record a new employee activity or interaction.'}
                      </DialogDescription>
                    </DialogHeader>
                    <ActivityFormImported
                      form={form}
                      onSubmit={handleSubmit}
                      onCancel={() => handleDialogChange(false)}
                      isEditing={!!state.editingEntry}
                      employees={employees}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="w-full overflow-x-auto">
                <SyncStatus
                  sources={state.syncStatus}
                  onSync={handleSync}
                  onToggleStatus={handleToggleSourceStatus}
                  isSyncing={state.isSyncing}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  className="pl-8 w-full"
                  value={state.searchQuery}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <Tabs 
                defaultValue="all"
                value={state.activeTab}
                onValueChange={handleTabChange}
              >
                <div className="flex justify-between items-center mb-6 overflow-x-auto pb-2">
                  <TabsList className="h-auto p-1 bg-muted/50 overflow-x-auto flex-nowrap min-w-[320px]">
                    <TabsTrigger 
                      value="all" 
                      className={`flex items-center gap-2 px-3 py-2 flex-shrink-0 ${state.activeTab === 'all' ? 'bg-blue-100 text-blue-800' : ''}`}
                    >
                      <FileText className="h-4 w-4" />
                      <span>All</span>
                    </TabsTrigger>
                    
                    {ACTIVITY_CATEGORIES.map((category) => {
                      const Icon = category.icon;
                      const isActive = state.activeTab === category.id;
                      const categories = state.activities
                        .filter(a => a.activityCategory === category.id)
                        .length;
                      
                      return (
                        <TabsTrigger
                          key={category.id}
                          value={category.id}
                          className={`flex items-center gap-2 px-3 py-2 flex-shrink-0 ${isActive ? CATEGORY_COLORS[category.id] : ''}`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="hidden sm:inline">{category.label}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white' : 'bg-gray-200'}`}>
                            {categories}
                          </span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </div>

                {state.activeTab === 'all' && (
                  <TabsContent value="all" className="mt-4 md:mt-6 space-y-4 md:space-y-6">
                    {filteredActivities.length === 0 ? (
                      renderEmptyState()
                    ) : (
                      filteredActivities.map((activity) => (
                        <ActivityTimelineImported
                          key={activity.id}
                          activity={activity}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))
                    )}
                  </TabsContent>
                )}

                {ACTIVITY_CATEGORIES.map((category) => (
                  state.activeTab === category.id && (
                    <TabsContent key={category.id} value={category.id} className="mt-4 md:mt-6 space-y-4 md:space-y-6">
                      {filteredActivities.length === 0 ? (
                        <div className="text-center py-6 md:py-8">
                          <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted mb-3 md:mb-4">
                            {React.createElement(category.icon, { className: "h-5 w-5 md:h-6 md:w-6 text-muted-foreground" })}
                          </div>
                          <h3 className="text-base md:text-lg font-medium">No {category.label} Activities</h3>
                          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                            No activities found in this category. Try another category or add a new activity.
                          </p>
                          <Button 
                            className="mt-4 bg-blue-900 text-white hover:bg-blue-800"
                            onClick={() => {
                              // Pre-select the current category when adding a new activity
                              form.setValue('activityCategory', category.id as ActivityCategory);
                              dispatch({ type: 'SET_DIALOG_OPEN', payload: true });
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add {category.label} Activity
                          </Button>
                        </div>
                      ) : (
                        filteredActivities.map((activity) => (
                          <ActivityTimelineImported
                            key={activity.id}
                            activity={activity}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        ))
                      )}
                    </TabsContent>
                  )
                ))}
              </Tabs>
            </div>
          </div>

          {filteredActivities.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 md:mt-8">
              <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
                Showing {((state.currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(state.currentPage * ITEMS_PER_PAGE, sortedActivities.length)} of {sortedActivities.length} activities
              </div>
              <div className="flex space-x-2 order-1 sm:order-2 w-full sm:w-auto justify-center sm:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, state.currentPage - 1))}
                  disabled={state.currentPage === 1}
                  className="h-8 px-3"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(totalPages, state.currentPage + 1))}
                  disabled={state.currentPage === totalPages}
                  className="h-8 px-3"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDiaryPage;
