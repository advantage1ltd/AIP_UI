import React, { useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, CalendarIcon } from 'lucide-react';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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

// Constants
const ITEMS_PER_PAGE = 10;

// Define the form schema
const formSchema = z.object({
  officerName: z.string().min(1, 'Officer name is required'),
  supervisorName: z.string().min(1, 'Supervisor name is required'),
  incidentDate: z.date({
    required_error: 'Incident date is required',
  }),
  violationType: z.string().min(1, 'Violation type is required'),
  severity: z.string().min(1, 'Severity level is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  actionTaken: z.string().min(1, 'Action taken is required'),
  followUpDate: z.date().optional(),
  status: z.string().min(1, 'Status is required'),
  witnessStatements: z.string().optional(),
  evidenceRefs: z.string().optional(),
});

// Badge style mappings
const SEVERITY_STYLES = {
  'Minor': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Moderate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Major': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'Critical': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

const STATUS_STYLES = {
  'Open': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Under Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Pending Action': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'Closed': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  'Appealed': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

// Options for select inputs
const VIOLATION_TYPES = [
  { id: 'attendance', label: 'Attendance/Tardiness' },
  { id: 'procedure', label: 'Security Procedure Violation' },
  { id: 'conduct', label: 'Unprofessional Conduct' },
  { id: 'uniform', label: 'Uniform/Appearance' },
  { id: 'report', label: 'Report Writing/Documentation' },
  { id: 'post', label: 'Post Abandonment' },
  { id: 'sleeping', label: 'Sleeping on Duty' },
  { id: 'communication', label: 'Communication Protocol Breach' },
  { id: 'equipment', label: 'Equipment Misuse' },
  { id: 'other', label: 'Other Violation' },
];

const SEVERITY_LEVELS = ['Minor', 'Moderate', 'Major', 'Critical'];
const ACTION_TYPES = ['Verbal Warning', 'Written Warning', 'Final Warning', 'Suspension', 'Termination', 'Remedial Training'];
const STATUS_OPTIONS = ['Open', 'Under Review', 'Pending Action', 'Closed', 'Appealed'];

// Mock data
const MOCK_OFFICERS = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Mike Johnson' },
  { id: '4', name: 'Sarah Williams' },
];

const MOCK_SUPERVISORS = [
  { id: '1', name: 'David Chen' },
  { id: '2', name: 'Maria Garcia' },
  { id: '3', name: 'James Wilson' },
  { id: '4', name: 'Lisa Thompson' },
];

// Interface for disciplinary records
interface DisciplinaryRecord {
  id: string;
  officerName: string;
  supervisorName: string;
  incidentDate: Date;
  violationType: string;
  severity: string;
  description: string;
  actionTaken: string;
  followUpDate?: Date;
  status: string;
  witnessStatements?: string;
  evidenceRefs?: string;
}

// Reusable form components
const FormDatePicker = ({ control, name, label }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="flex flex-col">
        <FormLabel className="text-xs sm:text-sm">{label}</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                className={cn(
                  "w-full bg-white pl-2 sm:pl-3 text-left font-normal h-9 sm:h-10 text-xs sm:text-sm",
                  !field.value && "text-muted-foreground"
                )}
              >
                {field.value ? (
                  format(field.value, "PP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
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
        <FormMessage className="text-xs" />
      </FormItem>
    )}
  />
);

const FormSelectField = ({ control, name, label, options, placeholder }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-xs sm:text-sm">{label}</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger className="bg-white h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {options.map((option) => (
              <SelectItem 
                key={typeof option === 'string' ? option : option.id} 
                value={typeof option === 'string' ? option : option.label}
                className="text-xs sm:text-sm"
              >
                {typeof option === 'string' ? option : option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage className="text-xs" />
      </FormItem>
    )}
  />
);

const FormTextareaField = ({ control, name, label, placeholder }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="col-span-1 sm:col-span-2">
        <FormLabel className="text-xs sm:text-sm">{label}</FormLabel>
        <FormControl>
          <Textarea 
            placeholder={placeholder}
            className="bg-white resize-none min-h-[60px] text-xs sm:text-sm"
            {...field}
          />
        </FormControl>
        <FormMessage className="text-xs" />
      </FormItem>
    )}
  />
);

const DisciplinaryPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRecord, setEditingRecord] = useState<DisciplinaryRecord | null>(null);

  // Initial record data
  const [disciplinaryRecords, setDisciplinaryRecords] = useState<DisciplinaryRecord[]>([
    {
      id: '1',
      officerName: 'John Doe',
      supervisorName: 'David Chen',
      incidentDate: new Date(),
      violationType: 'Attendance/Tardiness',
      severity: 'Minor',
      description: 'Late arrival to post by 15 minutes without prior notification',
      actionTaken: 'Verbal Warning',
      status: 'Closed',
      witnessStatements: 'Site supervisor statement attached',
    },
    {
      id: '2',
      officerName: 'Sarah Williams',
      supervisorName: 'Maria Garcia',
      incidentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      violationType: 'Security Procedure Violation',
      severity: 'Moderate',
      description: 'Failed to follow proper access control procedures when allowing visitor entry',
      actionTaken: 'Written Warning',
      status: 'Open',
      witnessStatements: 'Statements from reception staff collected',
      evidenceRefs: 'CCTV footage #AC-2024-05-12',
    },
    {
      id: '3',
      officerName: 'Mike Johnson',
      supervisorName: 'James Wilson',
      incidentDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      violationType: 'Uniform/Appearance',
      severity: 'Minor',
      description: 'Reported to duty with incomplete uniform - missing name badge and improper footwear',
      actionTaken: 'Verbal Warning',
      status: 'Closed',
      witnessStatements: '',
    },
    {
      id: '4',
      officerName: 'Jane Smith',
      supervisorName: 'Lisa Thompson',
      incidentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      violationType: 'Sleeping on Duty',
      severity: 'Major',
      description: 'Found asleep while on night shift at client premises. Customer complaint received.',
      actionTaken: 'Final Warning',
      status: 'Under Review',
      witnessStatements: 'Client manager statement included',
      evidenceRefs: 'Incident report #SI-2024-05-16',
    },
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      officerName: '',
      supervisorName: '',
      violationType: '',
      severity: '',
      description: '',
      actionTaken: '',
      status: '',
      witnessStatements: '',
      evidenceRefs: '',
    },
  });

  // Filter records based on search query
  const filteredRecords = disciplinaryRecords.filter((record) =>
    record.officerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.violationType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    if (editingRecord) {
      setDisciplinaryRecords(records =>
        records.map(record =>
          record.id === editingRecord.id
            ? { ...values, id: record.id } as DisciplinaryRecord
            : record
        )
      );
      toast({
        title: "Record Updated",
        description: "Disciplinary record has been successfully updated.",
      });
    } else {
      setDisciplinaryRecords(records => [
        { ...values, id: Date.now().toString() } as DisciplinaryRecord,
        ...records,
      ]);
      toast({
        title: "Record Added",
        description: "New disciplinary record has been successfully added.",
      });
    }
    setIsDialogOpen(false);
    setEditingRecord(null);
    form.reset();
  }, [editingRecord, form]);

  const handleEdit = useCallback((record: DisciplinaryRecord) => {
    setEditingRecord(record);
    form.reset(record);
    setIsDialogOpen(true);
  }, [form]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setDisciplinaryRecords(records => records.filter(record => record.id !== id));
      toast({
        title: "Record Deleted",
        description: "Disciplinary record has been permanently deleted.",
        variant: "destructive",
      });
    }
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingRecord(null);
    form.reset();
  }, [form]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  return (
    <div className="container mx-auto px-1 sm:px-4 lg:px-6 py-2 sm:py-6 lg:py-8 max-w-screen-2xl">
      <Card className="shadow-sm border">
        <CardHeader className="p-2 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
            <div className="flex-1">
              <CardTitle className="text-base sm:text-xl lg:text-2xl font-bold">Disciplinary Records</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5 sm:mt-1">Manage and track disciplinary actions for security officers</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-900 text-white hover:bg-blue-800 h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm w-full sm:w-auto">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Add New Record
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95%] max-w-[600px] p-2 sm:p-4 lg:p-6 max-h-[95vh] overflow-y-auto">
                <DialogHeader className="pb-2 sm:pb-4">
                  <DialogTitle className="text-sm sm:text-lg font-semibold">
                    {editingRecord ? 'Edit Disciplinary Record' : 'Add New Disciplinary Record'}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm mt-0.5 sm:mt-1">
                    {editingRecord 
                      ? 'Update the disciplinary record details below.' 
                      : 'Fill in the details to add a new disciplinary record.'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <FormSelectField 
                        control={form.control}
                        name="officerName"
                        label="Officer Name"
                        options={MOCK_OFFICERS}
                        placeholder="Select officer"
                      />
                      <FormSelectField 
                        control={form.control}
                        name="supervisorName"
                        label="Supervisor Name"
                        options={MOCK_SUPERVISORS}
                        placeholder="Select supervisor"
                      />
                      <FormDatePicker 
                        control={form.control}
                        name="incidentDate"
                        label="Incident Date"
                      />
                      <FormSelectField 
                        control={form.control}
                        name="violationType"
                        label="Violation Type"
                        options={VIOLATION_TYPES}
                        placeholder="Select violation type"
                      />
                      <FormSelectField 
                        control={form.control}
                        name="severity"
                        label="Severity Level"
                        options={SEVERITY_LEVELS}
                        placeholder="Select severity"
                      />
                      <FormSelectField 
                        control={form.control}
                        name="actionTaken"
                        label="Action Taken"
                        options={ACTION_TYPES}
                        placeholder="Select action"
                      />
                      <FormSelectField 
                        control={form.control}
                        name="status"
                        label="Status"
                        options={STATUS_OPTIONS}
                        placeholder="Select status"
                      />
                      <FormTextareaField 
                        control={form.control}
                        name="description"
                        label="Description"
                        placeholder="Provide a detailed description of the incident"
                      />
                      <FormTextareaField 
                        control={form.control}
                        name="witnessStatements"
                        label="Witness Statements"
                        placeholder="Enter any witness statements or references"
                      />
                      <FormTextareaField 
                        control={form.control}
                        name="evidenceRefs"
                        label="Evidence References"
                        placeholder="Add reference numbers for any evidence"
                      />
                    </div>
                    <Separator className="my-2 sm:my-4" />
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={closeDialog} 
                        className="w-full sm:w-auto h-8 sm:h-10 text-xs sm:text-sm"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-blue-900 text-white hover:bg-blue-800 w-full sm:w-auto h-8 sm:h-10 text-xs sm:text-sm"
                      >
                        {editingRecord ? 'Update' : 'Add'} Record
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 lg:p-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-6">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                className="pl-7 bg-white h-8 sm:h-10 w-full text-xs sm:text-sm"
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search disciplinary records"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto" style={{ minWidth: "280px" }}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted">
                    <TableHead className="p-1.5 sm:p-3 lg:p-4 font-medium whitespace-nowrap text-xs sm:text-sm">Officer</TableHead>
                    <TableHead className="p-1.5 sm:p-3 lg:p-4 font-medium whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">Violation</TableHead>
                    <TableHead className="p-1.5 sm:p-3 lg:p-4 font-medium whitespace-nowrap hidden sm:table-cell text-xs sm:text-sm">Date</TableHead>
                    <TableHead className="p-1.5 sm:p-3 lg:p-4 font-medium whitespace-nowrap text-xs sm:text-sm">Severity</TableHead>
                    <TableHead className="p-1.5 sm:p-3 lg:p-4 font-medium whitespace-nowrap hidden md:table-cell text-xs sm:text-sm">Action</TableHead>
                    <TableHead className="p-1.5 sm:p-3 lg:p-4 font-medium whitespace-nowrap text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="p-1.5 sm:p-3 lg:p-4 font-medium whitespace-nowrap hidden lg:table-cell text-xs sm:text-sm">Supervisor</TableHead>
                    <TableHead className="p-1.5 sm:p-3 lg:p-4 font-medium text-right text-xs sm:text-sm w-[60px] sm:w-auto">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.length > 0 ? (
                    paginatedRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-muted/50">
                        <TableCell className="p-1.5 sm:p-3 lg:p-4 font-medium truncate max-w-[70px] sm:max-w-[150px] text-xs sm:text-sm">
                          {record.officerName}
                        </TableCell>
                        <TableCell className="p-1.5 sm:p-3 lg:p-4 text-xs sm:text-sm truncate max-w-[90px] sm:max-w-[150px] hidden sm:table-cell">
                          {record.violationType}
                        </TableCell>
                        <TableCell className="p-1.5 sm:p-3 lg:p-4 hidden sm:table-cell text-xs sm:text-sm">
                          {format(record.incidentDate, 'PP')}
                        </TableCell>
                        <TableCell className="p-1.5 sm:p-3 lg:p-4">
                          <Badge className={cn("rounded-md text-[9px] sm:text-xs font-medium py-0.5 px-1 sm:px-1.5", SEVERITY_STYLES[record.severity] || 'bg-gray-100 text-gray-800')}>
                            {record.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-1.5 sm:p-3 lg:p-4 hidden md:table-cell text-xs sm:text-sm">
                          {record.actionTaken}
                        </TableCell>
                        <TableCell className="p-1.5 sm:p-3 lg:p-4">
                          <Badge className={cn("rounded-md text-[9px] sm:text-xs font-medium py-0.5 px-1 sm:px-1.5", STATUS_STYLES[record.status] || 'bg-gray-100 text-gray-800')}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-1.5 sm:p-3 lg:p-4 hidden lg:table-cell text-xs sm:text-sm">
                          {record.supervisorName}
                        </TableCell>
                        <TableCell className="p-1.5 sm:p-3 lg:p-4 text-right w-[60px] sm:w-auto">
                          <div className="flex justify-end gap-1 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(record)}
                              className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                              aria-label="Edit record"
                            >
                              <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(record.id)}
                              className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-red-100 hover:text-red-600"
                              aria-label="Delete record"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 sm:py-8">
                        <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
                          <p className="text-xs sm:text-sm text-gray-500">No disciplinary records found.</p>
                          <Button 
                            onClick={() => setIsDialogOpen(true)}
                            className="bg-blue-900 text-white hover:bg-blue-800 text-xs h-7 sm:h-9"
                            aria-label="Add new disciplinary record"
                          >
                            <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                            Add New Record
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {filteredRecords.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-2 sm:mt-4 gap-2 sm:gap-3">
              <div className="text-[10px] sm:text-sm text-muted-foreground order-2 sm:order-1">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length)} of {filteredRecords.length} records
              </div>
              {filteredRecords.length > ITEMS_PER_PAGE && (
                <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex-1 sm:flex-none h-7 sm:h-9 text-xs"
                    aria-label="Previous page"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex-1 sm:flex-none h-7 sm:h-9 text-xs"
                    aria-label="Next page"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DisciplinaryPage;
