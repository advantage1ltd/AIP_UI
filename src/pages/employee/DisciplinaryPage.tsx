import React from 'react';
import { Plus, Search, Pencil, Trash2, Eye, CalendarIcon } from 'lucide-react';
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

// Mock data interface
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

const DisciplinaryPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [editingRecord, setEditingRecord] = React.useState<DisciplinaryRecord | null>(null);
  const itemsPerPage = 10;

  // Mock data for officers and supervisors
  const officers = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' },
    { id: '4', name: 'Sarah Williams' },
  ];

  const supervisors = [
    { id: '1', name: 'David Chen' },
    { id: '2', name: 'Maria Garcia' },
    { id: '3', name: 'James Wilson' },
    { id: '4', name: 'Lisa Thompson' },
  ];

  // Violation types specific to security industry
  const violationTypes = [
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

  // Mock data
  const [disciplinaryRecords, setDisciplinaryRecords] = React.useState<DisciplinaryRecord[]>([
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
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
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
  };

  const handleEdit = (record: DisciplinaryRecord) => {
    setEditingRecord(record);
    form.reset(record);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setDisciplinaryRecords(records => records.filter(record => record.id !== id));
      toast({
        title: "Record Deleted",
        description: "Disciplinary record has been permanently deleted.",
        variant: "destructive",
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, string> = {
      'Minor': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Moderate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Major': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Critical': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    };
    return variants[severity] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Open': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Under Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Pending Action': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'Closed': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      'Appealed': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Disciplinary Records</CardTitle>
              <CardDescription>Manage and track disciplinary actions for security officers</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-900 text-white hover:bg-blue-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Record
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingRecord ? 'Edit Disciplinary Record' : 'Add New Disciplinary Record'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingRecord 
                      ? 'Update the disciplinary record details below.' 
                      : 'Fill in the details to add a new disciplinary record.'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="officerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Officer Name</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Select officer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {officers.map((officer) => (
                                  <SelectItem key={officer.id} value={officer.name}>
                                    {officer.name}
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
                        name="supervisorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supervisor Name</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Select supervisor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {supervisors.map((supervisor) => (
                                  <SelectItem key={supervisor.id} value={supervisor.name}>
                                    {supervisor.name}
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
                        name="incidentDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Incident Date</FormLabel>
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
                        name="violationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Violation Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Select violation type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {violationTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.label}>
                                    {type.label}
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
                        name="severity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Severity Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Select severity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Minor">Minor</SelectItem>
                                <SelectItem value="Moderate">Moderate</SelectItem>
                                <SelectItem value="Major">Major</SelectItem>
                                <SelectItem value="Critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="actionTaken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Action Taken</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Select action" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Verbal Warning">Verbal Warning</SelectItem>
                                <SelectItem value="Written Warning">Written Warning</SelectItem>
                                <SelectItem value="Final Warning">Final Warning</SelectItem>
                                <SelectItem value="Suspension">Suspension</SelectItem>
                                <SelectItem value="Termination">Termination</SelectItem>
                                <SelectItem value="Remedial Training">Remedial Training</SelectItem>
                              </SelectContent>
                            </Select>
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
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="Under Review">Under Review</SelectItem>
                                <SelectItem value="Pending Action">Pending Action</SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                                <SelectItem value="Appealed">Appealed</SelectItem>
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
                                placeholder="Provide a detailed description of the incident"
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
                        name="witnessStatements"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Witness Statements</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter any witness statements or references"
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
                        name="evidenceRefs"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Evidence References</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Add reference numbers for any evidence (e.g., CCTV footage, documents)"
                                className="bg-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Separator />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-900 text-white hover:bg-blue-800">
                        {editingRecord ? 'Update' : 'Add'} Record
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                className="pl-8 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead>Officer Name</TableHead>
                  <TableHead>Violation Type</TableHead>
                  <TableHead>Incident Date</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Action Taken</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{record.officerName}</TableCell>
                    <TableCell>{record.violationType}</TableCell>
                    <TableCell>{format(record.incidentDate, 'PPP')}</TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-md font-medium", getSeverityBadge(record.severity))}>
                        {record.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.actionTaken}</TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-md font-medium", getStatusBadge(record.status))}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.supervisorName}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(record)}
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(record.id)}
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
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
    </div>
  );
};

export default DisciplinaryPage;
