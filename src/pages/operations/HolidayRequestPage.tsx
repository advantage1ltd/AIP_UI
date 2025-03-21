import { useState, useEffect, useMemo } from "react";
import { format, addDays, addWeeks, differenceInDays, addYears, isBefore } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DayPicker } from 'react-day-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { mockOfficers } from "@/data/mockOfficers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Pencil, Trash2, Eye, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  X,
} from "lucide-react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface HolidayRequest {
  id: string;
  officerId: string;
  officerName: string;
  startDate: Date;
  endDate: Date;
  returnToWorkDate: Date;
  dateOfRequest: Date;
  authorisedBy: string;
  dateAuthorised: Date | null;
  status: 'pending' | 'approved' | 'denied';
  authorisationReason: string;
  comment: string;
}

const mockManagers = [
  { id: "m1", name: "John Smith", role: "Senior Manager" },
  { id: "m2", name: "Sarah Johnson", role: "Department Head" },
  { id: "m3", name: "Michael Brown", role: "Team Lead" },
  { id: "m4", name: "Emily Davis", role: "Operations Manager" },
];

const mockRequests: HolidayRequest[] = [
  {
    id: "hr001",
    officerId: mockOfficers[0].id,
    officerName: mockOfficers[0].name,
    startDate: new Date(2024, 8, 15), // Sept 15, 2024
    endDate: new Date(2024, 8, 25), // Sept 25, 2024
    returnToWorkDate: new Date(2024, 8, 26), // Sept 26, 2024
    dateOfRequest: new Date(2024, 5, 10), // June 10, 2024
    authorisedBy: "m1",
    dateAuthorised: new Date(2024, 5, 12), // June 12, 2024
    status: 'approved',
    authorisationReason: "Annual leave request approved as per policy",
    comment: "Family vacation"
  },
  {
    id: "hr002",
    officerId: mockOfficers[1].id,
    officerName: mockOfficers[1].name,
    startDate: new Date(2024, 7, 5), // Aug 5, 2024
    endDate: new Date(2024, 7, 12), // Aug 12, 2024
    returnToWorkDate: new Date(2024, 7, 13), // Aug 13, 2024
    dateOfRequest: new Date(2024, 4, 20), // May 20, 2024
    authorisedBy: "m2",
    dateAuthorised: null,
    status: 'pending',
    authorisationReason: "",
    comment: "Wedding anniversary trip"
  },
  {
    id: "hr003",
    officerId: mockOfficers[2].id,
    officerName: mockOfficers[2].name,
    startDate: new Date(2024, 9, 10), // Oct 10, 2024
    endDate: new Date(2024, 9, 17), // Oct 17, 2024
    returnToWorkDate: new Date(2024, 9, 18), // Oct 18, 2024
    dateOfRequest: new Date(2024, 6, 5), // July 5, 2024
    authorisedBy: "m3",
    dateAuthorised: new Date(2024, 6, 7), // July 7, 2024
    status: 'denied',
    authorisationReason: "Staffing shortage during high-demand period",
    comment: "Please reschedule for November if possible"
  },
  {
    id: "hr004",
    officerId: mockOfficers[3].id,
    officerName: mockOfficers[3].name,
    startDate: new Date(2024, 11, 22), // Dec 22, 2024
    endDate: new Date(2024, 11, 29), // Dec 29, 2024
    returnToWorkDate: new Date(2024, 11, 30), // Dec 30, 2024
    dateOfRequest: new Date(2024, 8, 15), // Sept 15, 2024
    authorisedBy: "m4",
    dateAuthorised: new Date(2024, 8, 17), // Sept 17, 2024
    status: 'approved',
    authorisationReason: "Holiday leave approved as per company policy",
    comment: "Christmas holiday with family"
  },
  {
    id: "hr005",
    officerId: mockOfficers[0].id,
    officerName: mockOfficers[0].name,
    startDate: new Date(2025, 1, 10), // Feb 10, 2025
    endDate: new Date(2025, 1, 14), // Feb 14, 2025
    returnToWorkDate: new Date(2025, 1, 15), // Feb 15, 2025
    dateOfRequest: new Date(2024, 10, 5), // Nov 5, 2024
    authorisedBy: "m2",
    dateAuthorised: null,
    status: 'pending',
    authorisationReason: "",
    comment: "Winter vacation"
  },
];

const getStatusBadgeClass = (status: 'pending' | 'approved' | 'denied') => {
  switch (status) {
    case 'approved':
      return "bg-green-100 text-green-800";
    case 'denied':
      return "bg-red-100 text-red-800";
    case 'pending':
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

const formSchema = z.object({
  officerId: z.string().min(1, "Officer is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }).min(addDays(new Date(), 60), "Start date must be at least 60 days from today"),
  endDate: z.date({
    required_error: "End date is required",
  }),
  returnToWorkDate: z.date({
    required_error: "Return to work date is required",
  }),
  authorisedBy: z.string().min(1, "Authorising manager is required"),
  dateAuthorised: z.date().optional(),
  status: z.enum(['pending', 'approved', 'denied']).default('pending'),
  authorisationReason: z.string().min(1, "Please provide a reason for approval/denial").optional(),
  comment: z.string().optional(),
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true;
  
  const dayDiff = differenceInDays(data.endDate, data.startDate);
  return dayDiff >= 0 && dayDiff <= 14;
}, {
  message: "End date must be within 14 days of start date",
  path: ["endDate"]
}).refine((data) => {
  if (!data.endDate || !data.returnToWorkDate) return true;
  
  const dayDiff = differenceInDays(data.returnToWorkDate, data.endDate);
  return dayDiff >= 1;
}, {
  message: "Return date must be at least one day after end date",
  path: ["returnToWorkDate"]
});

export default function HolidayRequestPage() {
  const [requests, setRequests] = useState<HolidayRequest[]>(mockRequests);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<HolidayRequest | null>(null);
  const [viewingRequest, setViewingRequest] = useState<HolidayRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const itemsPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIfMobile();
    
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const officerName = request.officerName.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return officerName.includes(searchLower);
    });
  }, [requests, searchTerm]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  
  const paginatedRequests = useMemo(() => {
    return filteredRequests.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredRequests, currentPage, itemsPerPage]);
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      officerId: "",
      startDate: undefined,
      endDate: undefined,
      returnToWorkDate: undefined,
      authorisedBy: "",
      dateAuthorised: undefined,
      status: 'pending',
      authorisationReason: "",
      comment: "",
    },
  });

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");

  useEffect(() => {
    if (editingRequest) {
      form.reset({
        officerId: editingRequest.officerId,
        startDate: new Date(editingRequest.startDate),
        endDate: new Date(editingRequest.endDate),
        returnToWorkDate: new Date(editingRequest.returnToWorkDate),
        authorisedBy: editingRequest.authorisedBy,
        dateAuthorised: editingRequest.dateAuthorised,
        status: editingRequest.status,
        authorisationReason: editingRequest.authorisationReason,
        comment: editingRequest.comment,
      });
    }
  }, [editingRequest, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newRequest: HolidayRequest = {
      id: editingRequest?.id || Math.random().toString(36).substr(2, 9),
      officerId: values.officerId,
      officerName: mockOfficers.find(o => o.id === values.officerId)?.name || '',
      startDate: values.startDate,
      endDate: values.endDate,
      returnToWorkDate: values.returnToWorkDate,
      dateOfRequest: new Date(),
      authorisedBy: values.authorisedBy,
      dateAuthorised: values.dateAuthorised,
      status: values.status,
      authorisationReason: values.authorisationReason || '',
      comment: values.comment || '',
    };

    if (editingRequest) {
      setRequests(requests.map(r => r.id === editingRequest.id ? newRequest : r));
      toast({
        title: "Holiday request updated",
        description: "The holiday request has been successfully updated.",
      });
    } else {
      setRequests([...requests, newRequest]);
      toast({
        title: "Holiday request created",
        description: "The holiday request has been successfully created.",
      });
    }

    setIsDialogOpen(false);
    setEditingRequest(null);
    form.reset();
  };

  const handleDelete = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
    toast({
      title: "Holiday request deleted",
      description: "The holiday request has been successfully deleted.",
    });
  };

  const handleEdit = (request: HolidayRequest) => {
    setEditingRequest(request);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">
      <div className="container mx-auto py-2 xs:py-3 sm:py-4 lg:py-6 px-1 xs:px-2 sm:px-4 lg:px-6 max-w-full lg:max-w-7xl overflow-hidden">
        <div className="flex flex-col space-y-2 sm:space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div className="bg-purple-100 p-1.5 sm:p-2 rounded-lg">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Holiday Requests</h1>
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500">Manage officer holiday and leave requests</p>
              </div>
          </div>
            <div className="flex flex-col xs:flex-row gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                  <Button 
                    variant="default"
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-1 sm:gap-2 w-full xs:w-auto px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    Create Holiday Request
                  </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Holiday Request Form</DialogTitle>
                <DialogDescription>
                  Fill in the details below to submit a holiday request.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Officer Information Section */}
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold">Officer Information</h3>
                    <FormField
                      control={form.control}
                      name="officerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Officer Name</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an officer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockOfficers.map((officer) => (
                                <SelectItem key={officer.id} value={officer.id}>
                                  {officer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Leave Dates Section */}
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold">Leave Dates</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                              onChange={e => {
                                const date = new Date(e.target.value);
                                field.onChange(date);
                                form.setValue("endDate", undefined);
                                form.setValue("returnToWorkDate", undefined);
                              }}
                              min={format(addDays(new Date(), 60), "yyyy-MM-dd")}
                            />
                            <FormDescription>
                              Must be at least 60 days from today ({format(addDays(new Date(), 60), "dd/MM/yyyy")})
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                              onChange={e => {
                                const date = new Date(e.target.value);
                                field.onChange(date);
                                if (date) {
                                  form.setValue("returnToWorkDate", addDays(date, 1));
                                }
                              }}
                              disabled={!startDate}
                              min={startDate ? format(startDate, "yyyy-MM-dd") : undefined}
                              max={startDate ? format(addDays(startDate, 14), "yyyy-MM-dd") : undefined}
                            />
                            <FormDescription>
                              Must be within 14 days of start date
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="returnToWorkDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Return to Work Date</FormLabel>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                              onChange={e => {
                                const date = new Date(e.target.value);
                                field.onChange(date);
                              }}
                              disabled={!endDate}
                              min={endDate ? format(addDays(endDate, 1), "yyyy-MM-dd") : undefined}
                            />
                            <FormDescription>
                              Must be at least one day after end date
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Authorization Section */}
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold">Authorization Details</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="authorisedBy"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Authorised By</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select authorising manager" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockManagers.map((manager) => (
                                  <SelectItem key={manager.id} value={manager.id}>
                                    {manager.name} - {manager.role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Select the manager who will authorise this request
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="denied">Denied</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="authorisationReason"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Reason</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Provide reason for approval or denial"
                                className="bg-white"
                                disabled={form.getValues("status") === "pending"}
                              />
                            </FormControl>
                            <FormDescription>
                              Required when approving or denying the request
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateAuthorised"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date Authorised</FormLabel>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                              onChange={e => {
                                const date = new Date(e.target.value);
                                field.onChange(date);
                              }}
                              disabled={form.getValues("status") === "pending"}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingRequest ? "Update Request" : "Create Request"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* View Details Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Holiday Request Details</DialogTitle>
                <DialogDescription>
                  View complete details of the holiday request
                </DialogDescription>
              </DialogHeader>

              {viewingRequest && (
                <div className="space-y-6">
                  {/* Officer Details */}
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold">Officer Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Officer ID</label>
                        <p className="mt-1">{viewingRequest.officerId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Date of Request</label>
                        <p className="mt-1">{format(viewingRequest.dateOfRequest, 'dd/MM/yyyy')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Holiday Dates */}
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold">Holiday Dates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium">Start Date</label>
                        <p className="mt-1">{format(viewingRequest.startDate, 'dd/MM/yyyy')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">End Date</label>
                        <p className="mt-1">{format(viewingRequest.endDate, 'dd/MM/yyyy')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Return to Work</label>
                        <p className="mt-1">{format(viewingRequest.returnToWorkDate, 'dd/MM/yyyy')}</p>
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-sm font-medium">Duration</label>
                        <p className="mt-1">
                          {differenceInDays(viewingRequest.endDate, viewingRequest.startDate) + 1} days
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Authorization Details */}
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold">Authorization Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Authorized By</label>
                        <p className="mt-1">
                          {mockManagers.find(m => m.id === viewingRequest.authorisedBy)?.name || viewingRequest.authorisedBy}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <p className="mt-1">
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                getStatusBadgeClass(viewingRequest.status)
                          )}>
                            {viewingRequest.status.charAt(0).toUpperCase() + viewingRequest.status.slice(1)}
                          </span>
                        </p>
                      </div>
                      {viewingRequest.status !== 'pending' && (
                        <>
                          <div>
                            <label className="text-sm font-medium">Date Authorized</label>
                            <p className="mt-1">
                              {viewingRequest.dateAuthorised 
                                ? format(viewingRequest.dateAuthorised, 'dd/MM/yyyy')
                                : 'Not set'}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <label className="text-sm font-medium">Reason</label>
                            <p className="mt-1 text-sm whitespace-pre-wrap">{viewingRequest.authorisationReason}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Comments */}
                  {viewingRequest.comment && (
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      <h3 className="text-lg font-semibold">Comments</h3>
                      <p className="text-sm whitespace-pre-wrap">{viewingRequest.comment}</p>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-3 md:gap-4">
            <Card className="bg-gradient-to-br from-purple-800 to-purple-900 border-purple-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 pb-0.5 sm:pb-1 md:pb-2">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-white">Total Requests</CardTitle>
                <CalendarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-purple-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 pt-0 md:pt-1">
                <div className="text-sm sm:text-base lg:text-lg font-bold text-white">{requests.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-800 to-green-900 border-green-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 pb-0.5 sm:pb-1 md:pb-2">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-white">Approved</CardTitle>
                <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-green-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 pt-0 md:pt-1">
                <div className="text-sm sm:text-base lg:text-lg font-bold text-white">
                  {requests.filter(r => r.status === "approved").length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-700 to-yellow-800 border-yellow-600 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 pb-0.5 sm:pb-1 md:pb-2">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-white">Pending</CardTitle>
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-yellow-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 pt-0 md:pt-1">
                <div className="text-sm sm:text-base lg:text-lg font-bold text-white">
                  {requests.filter(r => r.status === "pending").length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-800 to-red-900 border-red-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 pb-0.5 sm:pb-1 md:pb-2">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-white">Declined</CardTitle>
                <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-red-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 pt-0 md:pt-1">
                <div className="text-sm sm:text-base lg:text-lg font-bold text-white">
                  {requests.filter(r => r.status === "denied").length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table with search bar positioned above it */}
        <div className="mt-3 sm:mt-4 lg:mt-6 space-y-2 sm:space-y-3">
          {/* Search positioned above table */}
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2">
            <h3 className="text-sm sm:text-base font-medium text-gray-800">Holiday Request Records</h3>
            <div className="relative w-full xs:w-44 sm:w-60">
              <Input
                type="text"
                placeholder="Search by officer name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="pl-8 h-8 sm:h-9 text-xs sm:text-sm w-full"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
              {searchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                >
                  <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
          </div>

          {/* Table itself */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <div className="min-w-[300px] max-w-full px-1 sm:px-0">
                <Table className="w-full table-auto">
          <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm text-gray-900 py-1.5 sm:py-2 md:py-3">Officer</TableHead>
                      <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm text-gray-900 py-1.5 sm:py-2 md:py-3 whitespace-nowrap hidden sm:table-cell">Date Requested</TableHead>
                      <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm text-gray-900 py-1.5 sm:py-2 md:py-3 whitespace-nowrap">Start Date</TableHead>
                      <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm text-gray-900 py-1.5 sm:py-2 md:py-3 whitespace-nowrap hidden xs:table-cell">End Date</TableHead>
                      <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm text-gray-900 py-1.5 sm:py-2 md:py-3 whitespace-nowrap hidden md:table-cell">Return Date</TableHead>
                      <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm text-gray-900 py-1.5 sm:py-2 md:py-3">Status</TableHead>
                      <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm text-gray-900 py-1.5 sm:py-2 md:py-3 w-[90px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 sm:py-6 md:py-8">
                          <p className="text-gray-500 text-[10px] sm:text-xs lg:text-sm">No holiday requests found matching your search</p>
                          <Button
                            variant="link"
                            onClick={() => setIsDialogOpen(true)}
                            className="text-purple-600 hover:text-purple-700 mt-1 sm:mt-2 text-[10px] sm:text-xs lg:text-sm"
                          >
                            Create your first holiday request
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRequests.map((request) => (
                        <TableRow key={request.id} className="hover:bg-gray-50 transition-colors text-[10px] sm:text-xs lg:text-sm">
                          <TableCell className="py-1.5 sm:py-2 md:py-3">
                            <div className="font-medium text-[11px] sm:text-sm text-purple-700">
                              {request.officerName}
                            </div>
                            {/* Mobile view extras */}
                            <div className="xs:hidden text-[9px] text-gray-500 mt-0.5">
                              Ends: {format(request.endDate, 'dd/MM/yyyy')}
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5 sm:py-2 md:py-3 hidden sm:table-cell whitespace-nowrap">
                            {format(request.dateOfRequest, 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="py-1.5 sm:py-2 md:py-3 whitespace-nowrap">
                            {format(request.startDate, 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="py-1.5 sm:py-2 md:py-3 whitespace-nowrap hidden xs:table-cell">
                            {format(request.endDate, 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="py-1.5 sm:py-2 md:py-3 whitespace-nowrap hidden md:table-cell">
                            {format(request.returnToWorkDate, 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="py-1.5 sm:py-2 md:py-3">
                  <span className={cn(
                              "inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium",
                              getStatusBadgeClass(request.status)
                  )}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </TableCell>
                          <TableCell className="py-1.5 sm:py-2 md:py-3">
                            <div className="flex items-center justify-end gap-0.5 sm:gap-1 md:gap-2">
                    <Button
                                variant="outline"
                                size="sm"
                      onClick={() => {
                        setViewingRequest(request);
                        setIsViewDialogOpen(true);
                      }}
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
                      title="View Details"
                    >
                                <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                                <span className="sr-only">View</span>
                    </Button>
                    <Button
                                variant="outline"
                                size="sm"
                      onClick={() => {
                                  setEditingRequest(request);
                                  setIsDialogOpen(true);
                                }}
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                title="Edit Request"
                              >
                                <Pencil className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(request.id)}
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      title="Delete Request"
                    >
                                <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                                <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
                      ))
            )}
          </TableBody>
        </Table>
              </div>
            </div>
          </div>

          {/* Pagination - conditionally shown when records exceed itemsPerPage (10) on desktop */}
          {filteredRequests.length > 0 && (
            <div className="flex justify-between items-center text-[10px] sm:text-xs text-gray-500 pt-1 sm:pt-2">
              <div>
                Showing {paginatedRequests.length} of {filteredRequests.length} records
              </div>
              
              {/* Always show pagination on mobile, only show on desktop if records > 10 */}
              {(filteredRequests.length > itemsPerPage || isMobile) && (
                <div className="flex justify-center overflow-x-auto">
                  <Pagination>
                    <PaginationContent className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1">
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-auto flex items-center justify-center text-[10px] sm:text-xs`}
                          aria-disabled={currentPage === 1}
                        >
                          <span className="sr-only">Go to previous page</span>
                        </PaginationPrevious>
                      </PaginationItem>
                      
                      {/* Mobile Pagination Counter */}
                      <PaginationItem className="sm:hidden">
                        <span className="h-7 px-2 flex items-center justify-center text-[10px] font-medium text-gray-600">
                          {currentPage} / {totalPages || 1}
                        </span>
                      </PaginationItem>
                      
                      {/* Desktop Pagination Numbers */}
                      {(() => {
                        const paginationItems = [];
                        const totalButtons = Math.min(totalPages, 5);
                        
                        let startPage = 1;
                        if (totalPages > 5) {
                          if (currentPage <= 3) {
                            startPage = 1;
                          } else if (currentPage >= totalPages - 2) {
                            startPage = totalPages - 4;
                          } else {
                            startPage = currentPage - 2;
                          }
                        }
                        
                        for (let i = 0; i < totalButtons; i++) {
                          const pageNumber = startPage + i;
                          paginationItems.push(
                            <PaginationItem key={pageNumber} className="hidden sm:inline-block">
                              <PaginationLink
                                onClick={() => handlePageChange(pageNumber)}
                                isActive={currentPage === pageNumber}
                                className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 flex items-center justify-center rounded-md text-[10px] sm:text-xs"
                                aria-label={`Go to page ${pageNumber}`}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        
                        return paginationItems;
                      })()}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={`${currentPage === totalPages || totalPages === 0 ? 'pointer-events-none opacity-50' : ''} h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-auto flex items-center justify-center text-[10px] sm:text-xs`}
                          aria-disabled={currentPage === totalPages || totalPages === 0}
                        >
                          <span className="sr-only">Go to next page</span>
                        </PaginationNext>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
