import { useState, useEffect, useMemo } from "react";
import { format, addDays, addWeeks, differenceInDays, addYears, isBefore, differenceInBusinessDays } from 'date-fns';
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
import { v4 as uuidv4 } from 'uuid';

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
  totalDays: number;
  type: 'annual' | 'sick' | 'unpaid' | 'other';
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
    comment: "Family vacation",
    totalDays: 11,
    type: 'annual'
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
    comment: "Wedding anniversary trip",
    totalDays: 8,
    type: 'annual'
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
    comment: "Please reschedule for November if possible",
    totalDays: 8,
    type: 'annual'
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
    comment: "Christmas holiday with family",
    totalDays: 8,
    type: 'annual'
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
    comment: "Winter vacation",
    totalDays: 5,
    type: 'annual'
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
  type: z.enum(['annual', 'sick', 'unpaid', 'other'], {
    required_error: "Type of leave is required"
  }),
  startDate: z.date({
    required_error: "Start date is required",
  }).min(addDays(new Date(), 60), "Start date must be at least 60 days from today")
    .transform(date => new Date(date.setHours(0, 0, 0, 0))),
  endDate: z.date({
    required_error: "End date is required",
  }).transform(date => new Date(date.setHours(0, 0, 0, 0))),
  returnToWorkDate: z.date({
    required_error: "Return to work date is required",
  }).transform(date => new Date(date.setHours(0, 0, 0, 0))),
  authorisedBy: z.string().min(1, "Authorising manager is required"),
  dateAuthorised: z.date().optional().nullable(),
  status: z.enum(['pending', 'approved', 'denied']).default('pending'),
  authorisationReason: z.string().optional(),
  comment: z.string().optional(),
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true;
  
  const dayDiff = differenceInDays(data.endDate, data.startDate);
  return dayDiff >= 0 && dayDiff <= 14;
}, {
  message: "End date must be within 14 days of start date and cannot be before start date",
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
      type: "annual",
      startDate: undefined,
      endDate: undefined,
      returnToWorkDate: undefined,
      authorisedBy: "",
      dateAuthorised: null,
      status: 'pending',
      authorisationReason: "",
      comment: "",
    },
    mode: "onTouched",
  });

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");

  useEffect(() => {
    if (editingRequest) {
      form.reset({
        officerId: editingRequest.officerId,
        type: editingRequest.type,
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

  // Create Holiday Request
  const handleCreateRequest = () => {
    setEditingRequest(null);
    form.reset();
    setIsDialogOpen(true);
  };

  // View Holiday Request
  const handleViewRequest = (request: HolidayRequest) => {
    setViewingRequest(request);
    setIsViewDialogOpen(true);
  };

  // Update Holiday Request
  const handleUpdateRequest = (request: HolidayRequest) => {
    setEditingRequest(request);
    form.reset({
      officerId: request.officerId,
      type: request.type,
      startDate: new Date(request.startDate),
      endDate: new Date(request.endDate),
      returnToWorkDate: new Date(request.returnToWorkDate),
      authorisedBy: request.authorisedBy,
      dateAuthorised: request.dateAuthorised,
      status: request.status,
      authorisationReason: request.authorisationReason,
      comment: request.comment,
    });
    setIsDialogOpen(true);
  };

  // Delete Holiday Request with confirmation
  const [deleteRequestId, setDeleteRequestId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (id: string) => {
    setDeleteRequestId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteRequestId) {
      setRequests(requests.filter(r => r.id !== deleteRequestId));
      toast({
        title: "Holiday request deleted",
        description: "The holiday request has been successfully deleted.",
      });
      setIsDeleteDialogOpen(false);
      setDeleteRequestId(null);
    }
  };

  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted successfully with values:", values);
    
    // Calculate total working days
    const totalDays = differenceInBusinessDays(values.endDate, values.startDate) + 1;
    
    // Create the request object based on form values
    const newRequest: HolidayRequest = {
      id: editingRequest?.id || uuidv4(),
      officerId: values.officerId,
      officerName: mockOfficers.find(o => o.id === values.officerId)?.name || '',
      startDate: values.startDate,
      endDate: values.endDate,
      returnToWorkDate: values.returnToWorkDate,
      dateOfRequest: editingRequest?.dateOfRequest || new Date(),
      authorisedBy: values.authorisedBy,
      dateAuthorised: values.dateAuthorised || null,
      status: values.status || 'pending',
      authorisationReason: values.authorisationReason || '',
      comment: values.comment || '',
      totalDays: totalDays > 0 ? totalDays : 0,
      type: values.type,
    };

    // Update or create the request
    if (editingRequest) {
      // Update existing request
      setRequests(prev => prev.map(r => r.id === editingRequest.id ? newRequest : r));
      toast({
        title: "Holiday request updated",
        description: "The holiday request has been successfully updated.",
      });
    } else {
      // Create new request
      setRequests(prev => [newRequest, ...prev]);
      toast({
        title: "Holiday request created",
        description: "The holiday request has been successfully created.",
      });
    }

    // Close the dialog and reset form
    setIsDialogOpen(false);
    setEditingRequest(null);
    form.reset();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">
      <div className="container mx-auto py-2 xs:py-3 sm:py-4 lg:py-6 xl:py-8 2xl:py-10 px-1 xs:px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-12 max-w-screen-2xl">
        <div className="flex flex-col space-y-2 sm:space-y-4 lg:space-y-6 xl:space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 xl:gap-6">
            <div className="flex items-center gap-1.5 sm:gap-3 xl:gap-4">
              <div className="bg-purple-100 p-1.5 sm:p-2 xl:p-3 rounded-lg">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-gray-900">Holiday Requests</h1>
                <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-500">Manage officer holiday and leave requests</p>
              </div>
            </div>
            <div className="flex flex-col xs:flex-row gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
              <Button 
                variant="default"
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-1 sm:gap-2 w-full xs:w-auto px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-9 lg:h-10 xl:h-12 text-xs sm:text-sm xl:text-base"
                onClick={handleCreateRequest}
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
                Create Holiday Request
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-3 md:gap-4 xl:gap-6">
            <Card className="bg-gradient-to-br from-purple-800 to-purple-900 border-purple-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pb-0.5 sm:pb-1 md:pb-2 xl:pb-3">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm xl:text-base font-medium text-white">Total Requests</CardTitle>
                <CalendarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 xl:h-5 xl:w-5 text-purple-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pt-0 md:pt-1 xl:pt-2">
                <div className="text-sm sm:text-base lg:text-lg xl:text-2xl 2xl:text-3xl font-bold text-white">{requests.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-800 to-green-900 border-green-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pb-0.5 sm:pb-1 md:pb-2 xl:pb-3">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm xl:text-base font-medium text-white">Approved</CardTitle>
                <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 xl:h-5 xl:w-5 text-green-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pt-0 md:pt-1 xl:pt-2">
                <div className="text-sm sm:text-base lg:text-lg xl:text-2xl 2xl:text-3xl font-bold text-white">
                  {requests.filter(r => r.status === "approved").length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-700 to-yellow-800 border-yellow-600 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pb-0.5 sm:pb-1 md:pb-2 xl:pb-3">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm xl:text-base font-medium text-white">Pending</CardTitle>
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 xl:h-5 xl:w-5 text-yellow-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pt-0 md:pt-1 xl:pt-2">
                <div className="text-sm sm:text-base lg:text-lg xl:text-2xl 2xl:text-3xl font-bold text-white">
                  {requests.filter(r => r.status === "pending").length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-800 to-red-900 border-red-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pb-0.5 sm:pb-1 md:pb-2 xl:pb-3">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm xl:text-base font-medium text-white">Declined</CardTitle>
                <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 xl:h-5 xl:w-5 text-red-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pt-0 md:pt-1 xl:pt-2">
                <div className="text-sm sm:text-base lg:text-lg xl:text-2xl 2xl:text-3xl font-bold text-white">
                  {requests.filter(r => r.status === "denied").length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table with search bar positioned above it */}
        <div className="mt-3 sm:mt-4 lg:mt-6 xl:mt-8 space-y-2 sm:space-y-3 xl:space-y-4">
          {/* Search positioned above table */}
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xl:gap-4">
            <h3 className="text-sm sm:text-base xl:text-lg font-medium text-gray-800">Holiday Request Records</h3>
            <div className="relative w-full xs:w-44 sm:w-60 xl:w-80">
              <Input
                type="text"
                placeholder="Search by officer name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 h-8 sm:h-9 xl:h-12 text-xs sm:text-sm xl:text-base w-full"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 xl:h-5 xl:w-5 text-gray-400" />
              {searchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 xl:h-8 xl:w-8 p-0"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                >
                  <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 xl:h-4 xl:w-4" />
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
                      <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4">Officer</TableHead>
                      <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4 whitespace-nowrap hidden sm:table-cell">Date Requested</TableHead>
                      <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4 whitespace-nowrap">Start Date</TableHead>
                      <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4 whitespace-nowrap hidden xs:table-cell">End Date</TableHead>
                      <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4 whitespace-nowrap hidden md:table-cell">Return Date</TableHead>
                      <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4">Status</TableHead>
                      <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4 w-[90px] lg:w-[120px] xl:w-[150px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 sm:py-6 md:py-8 xl:py-12">
                          <p className="text-gray-500 text-[10px] sm:text-xs lg:text-sm xl:text-base">No holiday requests found matching your search</p>
                          <Button
                            variant="link"
                            onClick={handleCreateRequest}
                            className="text-purple-600 hover:text-purple-700 mt-1 sm:mt-2 text-[10px] sm:text-xs lg:text-sm xl:text-base"
                          >
                            Create your first holiday request
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRequests.map((request) => (
                        <TableRow key={request.id} className="hover:bg-gray-50 transition-colors text-[10px] sm:text-xs lg:text-sm xl:text-base">
                          <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4">
                            <div className="font-medium text-[11px] sm:text-sm xl:text-base text-purple-700">
                              {request.officerName}
                            </div>
                            {/* Mobile view extras */}
                            <div className="xs:hidden text-[9px] lg:text-xs xl:text-sm text-gray-500 mt-0.5">
                              Ends: {format(request.endDate, 'dd/MM/yyyy')}
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4 hidden sm:table-cell whitespace-nowrap">
                            {format(request.dateOfRequest, 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4 whitespace-nowrap">
                            {format(request.startDate, 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4 whitespace-nowrap hidden xs:table-cell">
                            {format(request.endDate, 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4 whitespace-nowrap hidden md:table-cell">
                            {format(request.returnToWorkDate, 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4">
                            <span className={cn(
                              "inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs lg:text-sm xl:text-base font-medium",
                              getStatusBadgeClass(request.status)
                            )}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4">
                            <div className="flex items-center justify-end gap-0.5 sm:gap-1 md:gap-2 xl:gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setViewingRequest(request);
                                  setIsViewDialogOpen(true);
                                }}
                                className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
                                title="View Details"
                              >
                                <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 xl:h-5 xl:w-5" />
                                <span className="sr-only">View</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingRequest(request);
                                  setIsDialogOpen(true);
                                }}
                                className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                title="Edit Request"
                              >
                                <Pencil className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 xl:h-5 xl:w-5" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(request.id)}
                                className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                title="Delete Request"
                              >
                                <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 xl:h-5 xl:w-5" />
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

          {/* Pagination */}
          {filteredRequests.length > 0 && (
            <div className="flex justify-between items-center text-[10px] sm:text-xs xl:text-sm text-gray-500 pt-1 sm:pt-2 xl:pt-4">
              <div>
                Showing {paginatedRequests.length} of {filteredRequests.length} records
              </div>
              
              {/* Always show pagination on mobile, only show on desktop if records > 10 */}
              {(filteredRequests.length > itemsPerPage || isMobile) && (
                <div className="flex justify-center overflow-x-auto">
                  <Pagination>
                    <PaginationContent className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1 xl:gap-2">
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-auto xl:h-12 xl:w-auto flex items-center justify-center text-[10px] sm:text-xs xl:text-base`}
                          aria-disabled={currentPage === 1}
                        >
                          <span className="sr-only">Go to previous page</span>
                        </PaginationPrevious>
                      </PaginationItem>
                      
                      {/* Mobile Pagination Counter */}
                      <PaginationItem className="sm:hidden">
                        <span className="h-7 px-2 flex items-center justify-center text-[10px] xl:text-sm font-medium text-gray-600">
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
                                className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 xl:h-12 xl:w-12 flex items-center justify-center rounded-md text-[10px] sm:text-xs xl:text-base"
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
                          className={`${currentPage === totalPages || totalPages === 0 ? 'pointer-events-none opacity-50' : ''} h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-auto xl:h-12 xl:w-auto flex items-center justify-center text-[10px] sm:text-xs xl:text-base`}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[90%] xs:w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] md:max-w-[700px] mx-auto p-3 xs:p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-base xs:text-lg sm:text-xl font-semibold text-gray-900">
              {editingRequest ? 'Edit Holiday Request' : 'New Holiday Request'}
            </DialogTitle>
            <DialogDescription className="text-xs xs:text-sm text-gray-500">
              Please note that holiday requests must be submitted at least 60 days in advance.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(
                // Success handler
                onSubmit, 
                // Error handler
                (errors) => {
                  console.log("Form validation errors:", errors);
                  toast({
                    title: "Form validation failed",
                    description: "Please check the form for errors and try again.",
                    variant: "destructive"
                  });
                }
              )} 
              className="space-y-4 xs:space-y-5 sm:space-y-6"
            >
              {/* Officer Selection */}
              <FormField
                control={form.control}
                name="officerId"
                render={({ field }) => (
                  <FormItem className="space-y-1.5 sm:space-y-2">
                    <FormLabel className="text-xs sm:text-sm font-medium text-gray-700">Officer Name</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8 xs:h-9 sm:h-10 text-xs sm:text-sm">
                          <SelectValue placeholder="Select an officer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockOfficers.map((officer) => (
                          <SelectItem key={officer.id} value={officer.id} className="text-xs sm:text-sm">
                            {officer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px] xs:text-xs" />
                  </FormItem>
                )}
              />

              {/* Leave Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-1.5 sm:space-y-2">
                    <FormLabel className="text-xs sm:text-sm font-medium text-gray-700">Type of Leave</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8 xs:h-9 sm:h-10 text-xs sm:text-sm">
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[
                          { value: 'annual', label: 'Annual Leave' },
                          { value: 'sick', label: 'Sick Leave' },
                          { value: 'unpaid', label: 'Unpaid Leave' },
                          { value: 'other', label: 'Other' }
                        ].map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-xs sm:text-sm">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px] xs:text-xs" />
                  </FormItem>
                )}
              />

              {/* Date Selection Grid - Responsive */}
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-6">
                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5 sm:space-y-2">
                      <FormLabel className="text-xs sm:text-sm font-medium text-gray-700">Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "h-8 xs:h-9 sm:h-10 w-full pl-3 text-left font-normal text-xs sm:text-sm",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : "Select date"}
                              <CalendarIcon className="ml-auto h-3 w-3 xs:h-4 xs:w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 max-w-[calc(100vw-2rem)]" align="start">
                          <div className="p-2 xs:p-3 border-b border-gray-100">
                            <h4 className="text-xs sm:text-sm font-medium text-gray-900">Select Start Date</h4>
                            <p className="text-[10px] xs:text-xs text-gray-500 mt-0.5 xs:mt-1">Must be at least 60 days from today</p>
                          </div>
                          <DayPicker
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              form.setValue('endDate', undefined);
                              form.setValue('returnToWorkDate', undefined);
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const minDate = addDays(today, 60);
                              const maxDate = addYears(today, 1);
                              return isBefore(date, minDate) || isBefore(maxDate, date);
                            }}
                            modifiers={{
                              future: (date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const minDate = addDays(today, 60);
                                return !isBefore(date, minDate);
                              }
                            }}
                            modifiersStyles={{
                              future: { color: '#4F46E5' }
                            }}
                            className="border-0"
                            classNames={{
                              months: "flex flex-col space-y-4",
                              month: "space-y-2 xs:space-y-4",
                              caption: "flex justify-center pt-1 relative items-center px-8 xs:px-10",
                              caption_label: "font-medium text-xs xs:text-sm text-gray-900",
                              nav: "space-x-1 flex items-center",
                              nav_button: "h-6 w-6 xs:h-7 xs:w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 rounded-full transition-colors",
                              nav_button_previous: "absolute left-1",
                              nav_button_next: "absolute right-1",
                              table: "w-full border-collapse space-y-1",
                              head_row: "flex",
                              head_cell: "text-gray-500 rounded-md w-7 xs:w-8 font-normal text-[10px] xs:text-xs",
                              row: "flex w-full mt-1 xs:mt-2",
                              cell: "text-center text-xs p-0 relative w-7 h-7 xs:w-8 xs:h-8 focus-within:relative focus-within:z-20",
                              day: "h-7 w-7 xs:h-8 xs:w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-full transition-colors text-[10px] xs:text-xs",
                              day_selected: "bg-purple-600 text-white hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white",
                              day_today: "bg-gray-50 text-gray-900",
                              day_outside: "text-gray-400 opacity-50",
                              day_disabled: "text-gray-400 opacity-50",
                              day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-900",
                              day_hidden: "invisible",
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription className="text-[10px] xs:text-xs text-gray-500">
                        Select a start date for your leave period
                      </FormDescription>
                      <FormMessage className="text-[10px] xs:text-xs" />
                    </FormItem>
                  )}
                />

                {/* End Date */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5 sm:space-y-2">
                      <FormLabel className="text-xs sm:text-sm font-medium text-gray-700">End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "h-8 xs:h-9 sm:h-10 w-full pl-3 text-left font-normal text-xs sm:text-sm",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : "Select date"}
                              <CalendarIcon className="ml-auto h-3 w-3 xs:h-4 xs:w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 max-w-[calc(100vw-2rem)]" align="start">
                          <div className="p-2 xs:p-3 border-b border-gray-100">
                            <h4 className="text-xs sm:text-sm font-medium text-gray-900">Select End Date</h4>
                            <p className="text-[10px] xs:text-xs text-gray-500 mt-0.5 xs:mt-1">Must be within 14 days of start date</p>
                          </div>
                          <DayPicker
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              form.setValue('returnToWorkDate', undefined);
                            }}
                            disabled={(date) => {
                              const startDate = form.getValues("startDate");
                              if (!startDate) return true;
                              const maxDate = addDays(startDate, 14);
                              return isBefore(date, startDate) || isBefore(maxDate, date);
                            }}
                            className="border-0"
                            classNames={{
                              months: "flex flex-col space-y-4",
                              month: "space-y-2 xs:space-y-4",
                              caption: "flex justify-center pt-1 relative items-center px-8 xs:px-10",
                              caption_label: "font-medium text-xs xs:text-sm text-gray-900",
                              nav: "space-x-1 flex items-center",
                              nav_button: "h-6 w-6 xs:h-7 xs:w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 rounded-full transition-colors",
                              nav_button_previous: "absolute left-1",
                              nav_button_next: "absolute right-1",
                              table: "w-full border-collapse space-y-1",
                              head_row: "flex",
                              head_cell: "text-gray-500 rounded-md w-7 xs:w-8 font-normal text-[10px] xs:text-xs",
                              row: "flex w-full mt-1 xs:mt-2",
                              cell: "text-center text-xs p-0 relative w-7 h-7 xs:w-8 xs:h-8 focus-within:relative focus-within:z-20",
                              day: "h-7 w-7 xs:h-8 xs:w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-full transition-colors text-[10px] xs:text-xs",
                              day_selected: "bg-purple-600 text-white hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white",
                              day_today: "bg-gray-50 text-gray-900",
                              day_outside: "text-gray-400 opacity-50",
                              day_disabled: "text-gray-400 opacity-50",
                              day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-900",
                              day_hidden: "invisible",
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription className="text-[10px] xs:text-xs text-gray-500">
                        Select the last day of your leave period
                      </FormDescription>
                      <FormMessage className="text-[10px] xs:text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Return to Work Date */}
              <FormField
                control={form.control}
                name="returnToWorkDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5 sm:space-y-2">
                    <FormLabel className="text-xs sm:text-sm font-medium text-gray-700">Return to Work Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "h-8 xs:h-9 sm:h-10 w-full pl-3 text-left font-normal text-xs sm:text-sm",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : "Select date"}
                            <CalendarIcon className="ml-auto h-3 w-3 xs:h-4 xs:w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 max-w-[calc(100vw-2rem)]" align="start">
                        <div className="p-2 xs:p-3 border-b border-gray-100">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900">Select Return Date</h4>
                          <p className="text-[10px] xs:text-xs text-gray-500 mt-0.5 xs:mt-1">Must be at least 1 day after end date</p>
                        </div>
                        <DayPicker
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const endDate = form.getValues("endDate");
                            if (!endDate) return true;
                            const minDate = addDays(endDate, 1);
                            const maxDate = addDays(endDate, 7); // Allow up to a week after end date
                            return isBefore(date, minDate) || isBefore(maxDate, date);
                          }}
                          className="border-0"
                          classNames={{
                            months: "flex flex-col space-y-4",
                            month: "space-y-2 xs:space-y-4",
                            caption: "flex justify-center pt-1 relative items-center px-8 xs:px-10",
                            caption_label: "font-medium text-xs xs:text-sm text-gray-900",
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-6 w-6 xs:h-7 xs:w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 rounded-full transition-colors",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-gray-500 rounded-md w-7 xs:w-8 font-normal text-[10px] xs:text-xs",
                            row: "flex w-full mt-1 xs:mt-2",
                            cell: "text-center text-xs p-0 relative w-7 h-7 xs:w-8 xs:h-8 focus-within:relative focus-within:z-20",
                            day: "h-7 w-7 xs:h-8 xs:w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-full transition-colors text-[10px] xs:text-xs",
                            day_selected: "bg-purple-600 text-white hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white",
                            day_today: "bg-gray-50 text-gray-900",
                            day_outside: "text-gray-400 opacity-50",
                            day_disabled: "text-gray-400 opacity-50",
                            day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-900",
                            day_hidden: "invisible",
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="text-[10px] xs:text-xs text-gray-500">
                      Select the date you plan to return to work
                    </FormDescription>
                    <FormMessage className="text-[10px] xs:text-xs" />
                  </FormItem>
                )}
              />

              {/* Authorising Manager */}
              <FormField
                control={form.control}
                name="authorisedBy"
                render={({ field }) => (
                  <FormItem className="space-y-1.5 sm:space-y-2">
                    <FormLabel className="text-xs sm:text-sm font-medium text-gray-700">Authorising Manager</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8 xs:h-9 sm:h-10 text-xs sm:text-sm">
                          <SelectValue placeholder="Select a manager" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockManagers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id} className="text-xs sm:text-sm">
                            {manager.name} - {manager.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-[10px] xs:text-xs text-gray-500">
                      Select the manager who will authorize your request
                    </FormDescription>
                    <FormMessage className="text-[10px] xs:text-xs" />
                  </FormItem>
                )}
              />

              {/* Comments */}
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem className="space-y-1.5 sm:space-y-2">
                    <FormLabel className="text-xs sm:text-sm font-medium text-gray-700">Comments</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes..."
                        className="min-h-[80px] xs:min-h-[100px] text-xs sm:text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] xs:text-xs" />
                  </FormItem>
                )}
              />

              {/* Summary Section */}
              {form.watch("startDate") && form.watch("endDate") && (
                <div className="bg-gray-50 p-3 xs:p-4 rounded-lg border border-gray-100 space-y-1.5 xs:space-y-2">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900">Leave Summary</h4>
                  <div className="grid grid-cols-2 gap-3 xs:gap-4">
                    <div>
                      <p className="text-[10px] xs:text-xs text-gray-500">Total Days</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {differenceInBusinessDays(form.getValues("endDate"), form.getValues("startDate")) + 1} working days
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] xs:text-xs text-gray-500">Return Date</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {form.watch("returnToWorkDate") ? format(form.watch("returnToWorkDate"), "PPP") : "Not set"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <DialogFooter className="gap-2 xs:gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    form.reset();
                  }}
                  className="h-8 xs:h-9 text-xs sm:text-sm"
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  className="h-8 xs:h-9 bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                  onClick={async () => {
                    // Manually trigger validation
                    const isValid = await form.trigger();
                    console.log("Form validation result:", isValid);
                    console.log("Form errors:", form.formState.errors);
                    
                    if (isValid) {
                      // If valid, manually submit the form with current values
                      const values = form.getValues();
                      onSubmit(values);
                    } else {
                      // Show validation errors
                      toast({
                        title: "Form validation failed",
                        description: "Please check the form for highlighted errors and try again.",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  {editingRequest ? "Update Request" : "Submit Request"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-[90%] xs:w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] md:max-w-[600px] mx-auto my-1 sm:my-2 max-h-[90vh] overflow-y-auto p-3 xs:p-4 sm:p-6">
          <DialogHeader className="space-y-1.5 xs:space-y-2">
            <DialogTitle className="text-base xs:text-lg sm:text-lg font-semibold text-gray-900">
              Holiday Request Details
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-500">
              View or manage the holiday request details below.
            </DialogDescription>
          </DialogHeader>
          {viewingRequest && (
            <div className="space-y-4 xs:space-y-5 sm:space-y-6">
              <div className="grid grid-cols-2 gap-3 xs:gap-4">
                <div>
                  <h4 className="text-[10px] xs:text-xs font-medium text-gray-500">Officer</h4>
                  <p className="text-xs sm:text-sm text-gray-900">{viewingRequest.officerName}</p>
                </div>
                <div>
                  <h4 className="text-[10px] xs:text-xs font-medium text-gray-500">Type of Leave</h4>
                  <p className="text-xs sm:text-sm text-gray-900">
                    {viewingRequest.type.charAt(0).toUpperCase() + viewingRequest.type.slice(1)}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] xs:text-xs font-medium text-gray-500">Status</h4>
                  <span className={cn(
                    "inline-flex px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full text-[10px] xs:text-xs font-medium mt-0.5",
                    getStatusBadgeClass(viewingRequest.status)
                  )}>
                    {viewingRequest.status.charAt(0).toUpperCase() + viewingRequest.status.slice(1)}
                  </span>
                </div>
                <div>
                  <h4 className="text-[10px] xs:text-xs font-medium text-gray-500">Total Days</h4>
                  <p className="text-xs sm:text-sm text-gray-900">{viewingRequest.totalDays} working days</p>
                </div>
                <div>
                  <h4 className="text-[10px] xs:text-xs font-medium text-gray-500">Start Date</h4>
                  <p className="text-xs sm:text-sm text-gray-900">
                    {format(new Date(viewingRequest.startDate), 'PPP')}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] xs:text-xs font-medium text-gray-500">End Date</h4>
                  <p className="text-xs sm:text-sm text-gray-900">
                    {format(new Date(viewingRequest.endDate), 'PPP')}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] xs:text-xs font-medium text-gray-500">Return Date</h4>
                  <p className="text-xs sm:text-sm text-gray-900">
                    {format(new Date(viewingRequest.returnToWorkDate), 'PPP')}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] xs:text-xs font-medium text-gray-500">Date Requested</h4>
                  <p className="text-xs sm:text-sm text-gray-900">
                    {format(new Date(viewingRequest.dateOfRequest), 'PPP')}
                  </p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-[10px] xs:text-xs font-medium text-gray-500">Authorised By</h4>
                  <p className="text-xs sm:text-sm text-gray-900">
                    {mockManagers.find(m => m.id === viewingRequest.authorisedBy)?.name || 'Not authorised yet'}
                  </p>
                </div>
                {viewingRequest.dateAuthorised && (
                  <div className="col-span-2">
                    <h4 className="text-[10px] xs:text-xs font-medium text-gray-500">Date Authorised</h4>
                    <p className="text-xs sm:text-sm text-gray-900">
                      {format(new Date(viewingRequest.dateAuthorised), 'PPP')}
                    </p>
                  </div>
                )}
                {viewingRequest.authorisationReason && (
                  <div className="col-span-2">
                    <h4 className="text-[10px] xs:text-xs font-medium text-gray-500">Authorisation Reason</h4>
                    <p className="text-xs sm:text-sm text-gray-900">{viewingRequest.authorisationReason}</p>
                  </div>
                )}
                {viewingRequest.comment && (
                  <div className="col-span-2">
                    <h4 className="text-[10px] xs:text-xs font-medium text-gray-500">Comments</h4>
                    <p className="text-xs sm:text-sm text-gray-900">{viewingRequest.comment}</p>
                  </div>
                )}
              </div>
              
              {/* Admin Approval/Denial Section */}
              {viewingRequest.status === 'pending' && (
                <div className="border-t border-gray-200 pt-3 xs:pt-4 mt-3 xs:mt-4">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 xs:mb-3">Approval Decision</h3>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);
                    const decision = formData.get('decision') as string;
                    const reason = formData.get('reason') as string;
                    
                    if (decision && reason) {
                      // Update the request status
                      const updatedRequest: HolidayRequest = {
                        ...viewingRequest,
                        status: decision as 'approved' | 'denied',
                        authorisationReason: reason,
                        dateAuthorised: new Date()
                      };
                      
                      setRequests(prev => prev.map(r => 
                        r.id === viewingRequest.id ? updatedRequest : r
                      ));
                      
                      setIsViewDialogOpen(false);
                      
                      toast({
                        title: `Holiday request ${decision}`,
                        description: `The holiday request has been ${decision}.`,
                      });
                    } else {
                      toast({
                        title: "Decision required",
                        description: "Please select a decision and provide a reason.",
                        variant: "destructive"
                      });
                    }
                  }}>
                    <div className="space-y-3 xs:space-y-4">
                      <div>
                        <label className="text-[10px] xs:text-xs font-medium text-gray-700 mb-1 block">Decision</label>
                        <div className="flex gap-2 xs:gap-3">
                          <label className="flex items-center space-x-1.5 xs:space-x-2">
                            <input 
                              type="radio" 
                              name="decision" 
                              value="approved" 
                              className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-xs sm:text-sm">Approve</span>
                          </label>
                          <label className="flex items-center space-x-1.5 xs:space-x-2">
                            <input 
                              type="radio" 
                              name="decision" 
                              value="denied" 
                              className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-xs sm:text-sm">Deny</span>
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-[10px] xs:text-xs font-medium text-gray-700 mb-1 block">Reason</label>
                        <Textarea 
                          name="reason"
                          placeholder="Provide reason for your decision"
                          className="min-h-[60px] xs:min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2 xs:gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsViewDialogOpen(false)}
                          className="h-7 xs:h-8 sm:h-9 text-[10px] xs:text-xs sm:text-sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="h-7 xs:h-8 sm:h-9 bg-purple-600 hover:bg-purple-700 text-[10px] xs:text-xs sm:text-sm"
                        >
                          Submit Decision
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
              
              {/* For already approved/denied requests, only show close button */}
              {viewingRequest.status !== 'pending' && (
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                    className="h-7 xs:h-8 sm:h-9 text-[10px] xs:text-xs sm:text-sm"
                  >
                    Close
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[90%] xs:w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] md:max-w-[400px] mx-auto my-1 sm:my-2 p-3 xs:p-4 sm:p-6">
          <DialogHeader className="space-y-1.5 xs:space-y-2">
            <DialogTitle className="text-base xs:text-lg font-semibold text-gray-900">
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Are you sure you want to delete this holiday request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-3 xs:mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="h-7 xs:h-8 sm:h-9 text-[10px] xs:text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="h-7 xs:h-8 sm:h-9 text-[10px] xs:text-xs sm:text-sm"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
