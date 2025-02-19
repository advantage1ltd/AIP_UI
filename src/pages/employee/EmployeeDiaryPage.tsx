import React from 'react';
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

// Define activity categories
const activityCategories = [
  { id: 'employment', label: 'Employment', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'training', label: 'Training', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'leave', label: 'Leave', icon: <CalendarIconIcon className="h-4 w-4" /> },
  { id: 'incidents', label: 'Incidents', icon: <AlertTriangle className="h-4 w-4" /> },
  { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
  { id: 'performance', label: 'Performance', icon: <Target className="h-4 w-4" /> },
  { id: 'equipment', label: 'Equipment', icon: <Shield className="h-4 w-4" /> },
  { id: 'certifications', label: 'Certifications', icon: <Award className="h-4 w-4" /> },
] as const;

// Define the form schema
const formSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  employeeName: z.string().min(1, 'Employee name is required'),
  activityDate: z.date({
    required_error: 'Activity date is required',
  }),
  activityCategory: z.string().min(1, 'Activity category is required'),
  activityType: z.string().min(1, 'Activity type is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.string().min(1, 'Status is required'),
  attachments: z.array(z.string()).optional(),
  notes: z.string().optional(),
  relatedDocuments: z.array(z.string()).optional(),
  nextReviewDate: z.date().optional(),
  actionRequired: z.boolean().default(false),
  actionDeadline: z.date().optional(),
  recordedBy: z.string().min(1, 'Recorder name is required'),
});

// Activity types by category
const activityTypesByCategory = {
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
};

// Mock data interface
interface EmployeeActivity {
  id: string;
  employeeId: string;
  employeeName: string;
  activityDate: Date;
  activityCategory: string;
  activityType: string;
  description: string;
  status: string;
  attachments?: string[];
  notes?: string;
  relatedDocuments?: string[];
  nextReviewDate?: Date;
  actionRequired: boolean;
  actionDeadline?: Date;
  recordedBy: string;
}

const EmployeeDiaryPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [editingEntry, setEditingEntry] = React.useState<EmployeeActivity | null>(null);
  const [activeTab, setActiveTab] = React.useState('all');
  const [selectedEmployee, setSelectedEmployee] = React.useState<string | null>(null);
  const itemsPerPage = 10;
  const [errorLog, setErrorLog] = React.useState<Array<{ message: string; timestamp: Date; data?: any }>>([]);

  // Mock employees data
  const employees = [
    { id: 'EMP001', name: 'John Doe', role: 'Security Officer' },
    { id: 'EMP002', name: 'Jane Smith', role: 'Security Supervisor' },
    { id: 'EMP003', name: 'Mike Johnson', role: 'Security Officer' },
    { id: 'EMP004', name: 'Sarah Williams', role: 'Security Officer' },
  ];

  // Mock activities data
  const [activities, setActivities] = React.useState<EmployeeActivity[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      activityDate: new Date(),
      activityCategory: 'employment',
      activityType: 'New Hire',
      description: 'Initial employment contract signed',
      status: 'Completed',
      attachments: ['contract.pdf'],
      recordedBy: 'HR Manager',
      actionRequired: false,
    },
    {
      id: '2',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      activityDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      activityCategory: 'training',
      activityType: 'Initial Training',
      description: 'Completed initial security training program',
      status: 'Completed',
      nextReviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      recordedBy: 'Training Manager',
      actionRequired: false,
    },
    {
      id: '3',
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      activityDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      activityCategory: 'incidents',
      activityType: 'Security Incident',
      description: 'Responded to unauthorized access attempt at main entrance',
      status: 'Completed',
      attachments: ['incident_report.pdf'],
      recordedBy: 'Security Supervisor',
      actionRequired: true,
      actionDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: '4',
      employeeId: 'EMP003',
      employeeName: 'Mike Johnson',
      activityDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      activityCategory: 'leave',
      activityType: 'Annual Leave',
      description: 'Annual leave request for summer vacation',
      status: 'Approved',
      recordedBy: 'HR Manager',
      actionRequired: false,
    },
    {
      id: '5',
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      activityDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      activityCategory: 'performance',
      activityType: 'Quarterly Review',
      description: 'Excellent performance in Q2 2024. Exceeded expectations in emergency response.',
      status: 'Completed',
      attachments: ['performance_review.pdf'],
      recordedBy: 'Operations Manager',
      actionRequired: false,
    },
    {
      id: '6',
      employeeId: 'EMP004',
      employeeName: 'Sarah Williams',
      activityDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      activityCategory: 'equipment',
      activityType: 'Equipment Issue',
      description: 'Issued new radio and body camera',
      status: 'Completed',
      attachments: ['equipment_form.pdf'],
      recordedBy: 'Equipment Manager',
      actionRequired: false,
    },
    {
      id: '7',
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      activityDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      activityCategory: 'certifications',
      activityType: 'SIA License',
      description: 'SIA License renewal completed',
      status: 'Completed',
      attachments: ['sia_license.pdf'],
      recordedBy: 'Training Manager',
      actionRequired: false,
    },
    {
      id: '8',
      employeeId: 'EMP003',
      employeeName: 'Mike Johnson',
      activityDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      activityCategory: 'training',
      activityType: 'Health & Safety Training',
      description: 'Completed annual health and safety refresher course',
      status: 'Completed',
      attachments: ['training_certificate.pdf'],
      recordedBy: 'Health & Safety Officer',
      actionRequired: true,
      actionDeadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    {
      id: '9',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      activityDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      activityCategory: 'documents',
      activityType: 'Policy Acknowledgment',
      description: 'Signed updated security procedures manual',
      status: 'Completed',
      attachments: ['policy_acknowledgment.pdf'],
      recordedBy: 'HR Manager',
      actionRequired: false,
    },
    {
      id: '10',
      employeeId: 'EMP004',
      employeeName: 'Sarah Williams',
      activityDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      activityCategory: 'performance',
      activityType: 'Commendation',
      description: 'Received commendation for exceptional handling of emergency situation',
      status: 'Completed',
      attachments: ['commendation_letter.pdf'],
      recordedBy: 'Operations Manager',
      actionRequired: false,
    }
  ]);

  // Get category badge color
  const getCategoryBadge = (category: string) => {
    const variants: Record<string, string> = {
      'employment': 'bg-blue-100 text-blue-800',
      'training': 'bg-green-100 text-green-800',
      'leave': 'bg-purple-100 text-purple-800',
      'incidents': 'bg-red-100 text-red-800',
      'documents': 'bg-yellow-100 text-yellow-800',
      'performance': 'bg-orange-100 text-orange-800',
      'equipment': 'bg-indigo-100 text-indigo-800',
      'certifications': 'bg-pink-100 text-pink-800',
    };
    return variants[category] || 'bg-gray-100 text-gray-800';
  };

  // Filter activities based on search query and active tab
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = 
      activity.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.activityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedEmployee && selectedEmployee !== 'all') return matchesSearch && activity.employeeId === selectedEmployee;
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && activity.activityCategory === activeTab;
  });

  // Sort activities by date (most recent first)
  const sortedActivities = [...filteredActivities].sort((a, b) => 
    b.activityDate.getTime() - a.activityDate.getTime()
  );

  // Pagination
  const totalPages = Math.ceil(sortedActivities.length / itemsPerPage);
  const paginatedActivities = sortedActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: '',
      employeeName: '',
      activityCategory: '',
      activityType: '',
      description: '',
      status: 'Pending',
      attachments: [],
      notes: '',
      relatedDocuments: [],
      actionRequired: false,
      recordedBy: 'System User',
      activityDate: new Date(),
    },
  });

  // Function to log errors
  const logError = (message: string, data?: any) => {
    console.error(`[EmployeeDiaryPage Error] ${message}`, data);
    setErrorLog(prev => [...prev, { message, timestamp: new Date(), data }]);
  };

  // Wrap state updates in try-catch
  const safeStateUpdate = <T extends unknown>(
    updateFn: (value: T) => void,
    newValue: T,
    actionName: string
  ) => {
    try {
      updateFn(newValue);
    } catch (error) {
      logError(`Error updating state in ${actionName}:`, error);
      toast({
        title: "Error",
        description: `Failed to update ${actionName}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Modified handleSubmit with better error tracking
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log('[EmployeeDiaryPage] Starting form submission');
      console.log('[EmployeeDiaryPage] Form values:', values);

      // Validate required fields
      if (!values.employeeId) {
        console.error('[EmployeeDiaryPage] Missing employeeId');
        throw new Error('Employee ID is required');
      }
      if (!values.employeeName) {
        console.error('[EmployeeDiaryPage] Missing employeeName');
        throw new Error('Employee Name is required');
      }
      if (!values.activityCategory) {
        console.error('[EmployeeDiaryPage] Missing activityCategory');
        throw new Error('Activity Category is required');
      }
      if (!values.activityType) {
        console.error('[EmployeeDiaryPage] Missing activityType');
        throw new Error('Activity Type is required');
      }
      if (!values.description) {
        console.error('[EmployeeDiaryPage] Missing description');
        throw new Error('Description is required');
      }
      if (!values.status) {
        console.error('[EmployeeDiaryPage] Missing status');
        throw new Error('Status is required');
      }
      if (!values.recordedBy) {
        console.error('[EmployeeDiaryPage] Missing recordedBy');
        throw new Error('Recorder name is required');
      }

      if (editingEntry) {
        console.log('[EmployeeDiaryPage] Updating existing entry:', editingEntry.id);
        setActivities(current =>
          current.map(activity =>
            activity.id === editingEntry.id
              ? { ...values, id: activity.id } as EmployeeActivity
              : activity
          )
        );
        toast({
          title: "Activity Updated",
          description: "Employee activity record has been updated.",
        });
      } else {
        console.log('[EmployeeDiaryPage] Creating new entry');
        const newActivity: EmployeeActivity = {
          id: Date.now().toString(),
          employeeId: values.employeeId,
          employeeName: values.employeeName,
          activityDate: values.activityDate || new Date(),
          activityCategory: values.activityCategory,
          activityType: values.activityType,
          description: values.description,
          status: values.status,
          attachments: values.attachments || [],
          notes: values.notes || '',
          relatedDocuments: values.relatedDocuments || [],
          nextReviewDate: values.nextReviewDate,
          actionRequired: values.actionRequired || false,
          actionDeadline: values.actionDeadline,
          recordedBy: values.recordedBy
        };

        console.log('[EmployeeDiaryPage] New activity object:', newActivity);

        setActivities(current => {
          console.log('[EmployeeDiaryPage] Current activities length:', current.length);
          const updated = [newActivity, ...current];
          console.log('[EmployeeDiaryPage] Updated activities length:', updated.length);
          return updated;
        });

        toast({
          title: "Activity Added",
          description: "New employee activity has been recorded.",
        });
      }

      // Reset form and close dialog
      console.log('[EmployeeDiaryPage] Resetting form and closing dialog');
      safeStateUpdate(setIsDialogOpen, false, 'dialog state');
      safeStateUpdate(setEditingEntry, null, 'editing state');
      form.reset();

    } catch (error) {
      logError('Error in handleSubmit:', error);
      console.error('[EmployeeDiaryPage] Error in handleSubmit:', error);
      
      // Show more specific error message
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save the activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Modified handleEdit with error tracking
  const handleEdit = (activity: EmployeeActivity) => {
    try {
      console.log('[EmployeeDiaryPage] Editing activity:', activity.id);
      safeStateUpdate(setEditingEntry, activity, 'editing entry');
      form.reset(activity);
      safeStateUpdate(setIsDialogOpen, true, 'dialog state');
    } catch (error) {
      logError('Error in handleEdit:', error);
      toast({
        title: "Error",
        description: "Failed to edit the activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Modified handleDelete with error tracking
  const handleDelete = (id: string) => {
    try {
      console.log('[EmployeeDiaryPage] Deleting activity:', id);
      if (window.confirm('Are you sure you want to delete this activity record?')) {
        setActivities(current => {
          const filtered = current.filter(activity => activity.id !== id);
          console.log('[EmployeeDiaryPage] Activities after deletion:', filtered.length);
          return filtered;
        });
        toast({
          title: "Activity Deleted",
          description: "The activity record has been permanently deleted.",
          variant: "destructive",
        });
      }
    } catch (error) {
      logError('Error in handleDelete:', error);
      toast({
        title: "Error",
        description: "Failed to delete the activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add error boundary effect
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logError('Unhandled error:', event.error);
      console.error('[EmployeeDiaryPage] Unhandled error:', event);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Debug logging for form state
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      console.log('[EmployeeDiaryPage] Form values changed:', value);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Add error log viewer (only visible in development)
  const ErrorLogViewer = process.env.NODE_ENV === 'development' ? (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          console.log('[EmployeeDiaryPage] Error Log:', errorLog);
          toast({
            title: "Error Log",
            description: (
              <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                <code className="text-white">
                  {JSON.stringify(errorLog, null, 2)}
                </code>
              </pre>
            ),
          });
        }}
      >
        View Error Log ({errorLog.length})
      </Button>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Employee Activity Diary</CardTitle>
              <CardDescription>Comprehensive record of all employee-related activities and interactions</CardDescription>
            </div>
            <div className="flex gap-4">
              <Select
                value={selectedEmployee || undefined}
                onValueChange={(value) => setSelectedEmployee(value || null)}
              >
                <SelectTrigger className="w-[200px]">
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
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-blue-900 text-white hover:bg-blue-800"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingEntry ? 'Edit Activity Record' : 'Add New Activity Record'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingEntry 
                        ? 'Update the activity record details below.' 
                        : 'Record a new employee activity or interaction.'}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="employeeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Employee</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  const employee = employees.find(e => e.id === value);
                                  if (employee) {
                                    form.setValue('employeeName', employee.name);
                                  }
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select employee" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {employees.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id}>
                                      {employee.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="activityDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Activity Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full bg-white pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="activityCategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  form.setValue('activityType', '');
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {activityCategories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      {category.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="activityType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Activity Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {form.watch('activityCategory') &&
                                    activityTypesByCategory[form.watch('activityCategory') as keyof typeof activityTypesByCategory]?.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Provide a detailed description of the activity"
                                  className="bg-white resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="actionRequired"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Follow-up Required
                                </FormLabel>
                                <FormDescription>
                                  Check if this activity requires follow-up action
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      <Separator />
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-blue-900 text-white hover:bg-blue-800"
                        >
                          {editingEntry ? 'Update' : 'Add'} Record
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-6">
                <TabsList className="h-auto p-1 bg-muted/50">
                  <TabsTrigger 
                    value="all" 
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                      activeTab === "all" ? "bg-white shadow-sm" : "hover:bg-muted"
                    )}
                  >
                    <Shield className="h-4 w-4" />
                    <span>All</span>
                  </TabsTrigger>
                  {activityCategories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                        activeTab === category.id ? "bg-white shadow-sm" : "hover:bg-muted"
                      )}
                    >
                      {category.icon}
                      <span className="hidden md:inline">{category.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search activities..."
                    className="pl-8 bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="all" className="mt-6 space-y-6">
                {paginatedActivities.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No activities found</h3>
                    <p className="text-muted-foreground mt-2">
                      Start by adding a new activity record.
                    </p>
                  </div>
                ) : (
                  paginatedActivities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className={cn(
                        "relative pb-8",
                        index === paginatedActivities.length - 1 ? "pb-0" : "border-l border-gray-200 dark:border-gray-800"
                      )}
                    >
                      <div className="relative flex items-start group">
                        <div className="h-9 flex items-center">
                          <div className={cn(
                            "relative z-10 w-8 h-8 flex items-center justify-center rounded-full -ml-4",
                            getCategoryBadge(activity.activityCategory)
                          )}>
                            {activityCategories.find(cat => cat.id === activity.activityCategory)?.icon}
                          </div>
                        </div>
                        <div className="flex-1 ml-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {activity.employeeName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {format(activity.activityDate, 'PPP')}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge className={cn("rounded-md font-medium", getCategoryBadge(activity.activityCategory))}>
                              {activity.activityType}
                            </Badge>
                            {activity.actionRequired && (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                                Action Required
                                {activity.actionDeadline && (
                                  <span className="ml-2">
                                    Due: {format(activity.actionDeadline, 'PP')}
                                  </span>
                                )}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            {activity.description}
                          </div>
                          {activity.attachments && activity.attachments.length > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-500">
                                {activity.attachments.length} attachment(s)
                              </span>
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(activity)}
                              className="h-8 px-2 hover:bg-blue-100 hover:text-blue-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(activity.id)}
                              className="h-8 px-2 hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              {activityCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-6 space-y-6">
                  {paginatedActivities
                    .filter(activity => activity.activityCategory === category.id)
                    .map((activity, index, filteredArray) => (
                      <div
                        key={activity.id}
                        className={cn(
                          "relative pb-8",
                          index === filteredArray.length - 1 ? "pb-0" : "border-l border-gray-200 dark:border-gray-800"
                        )}
                      >
                        <div className="relative flex items-start group">
                          <div className="h-9 flex items-center">
                            <div className={cn(
                              "relative z-10 w-8 h-8 flex items-center justify-center rounded-full -ml-4",
                              getCategoryBadge(activity.activityCategory)
                            )}>
                              {category.icon}
                            </div>
                          </div>
                          <div className="flex-1 ml-4">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {activity.employeeName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {format(activity.activityDate, 'PPP')}
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge className={cn("rounded-md font-medium", getCategoryBadge(activity.activityCategory))}>
                                {activity.activityType}
                              </Badge>
                              {activity.actionRequired && (
                                <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                                  Action Required
                                  {activity.actionDeadline && (
                                    <span className="ml-2">
                                      Due: {format(activity.actionDeadline, 'PP')}
                                    </span>
                                  )}
                                </Badge>
                              )}
                            </div>
                            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                              {activity.description}
                            </div>
                            {activity.attachments && activity.attachments.length > 0 && (
                              <div className="mt-2 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-500">
                                  {activity.attachments.length} attachment(s)
                                </span>
                              </div>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(activity)}
                                className="h-8 px-2 hover:bg-blue-100 hover:text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(activity.id)}
                                className="h-8 px-2 hover:bg-red-100 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-8">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedActivities.length)} of {sortedActivities.length} activities
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {ErrorLogViewer}
    </div>
  );
};

export default EmployeeDiaryPage;
