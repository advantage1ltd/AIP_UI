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
import { Pencil, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [requests, setRequests] = useState<HolidayRequest[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<HolidayRequest | null>(null);
  const [viewingRequest, setViewingRequest] = useState<HolidayRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const officerName = mockOfficers.find(o => o.id === request.officerId)?.name || '';
      const searchLower = searchTerm.toLowerCase();
      return officerName.toLowerCase().includes(searchLower);
    });
  }, [requests, searchTerm]);

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
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Holiday Requests</h2>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search by officer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Create Holiday Request</Button>
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
                            viewingRequest.status === "approved" && "bg-green-100 text-green-800",
                            viewingRequest.status === "denied" && "bg-red-100 text-red-800",
                            viewingRequest.status === "pending" && "bg-yellow-100 text-yellow-800"
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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Officer Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Return Date</TableHead>
              <TableHead>Date of Request</TableHead>
              <TableHead>Authorised By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.officerName}</TableCell>
                <TableCell>{format(request.startDate, 'dd/MM/yyyy')}</TableCell>
                <TableCell>{format(request.endDate, 'dd/MM/yyyy')}</TableCell>
                <TableCell>{format(request.returnToWorkDate, 'dd/MM/yyyy')}</TableCell>
                <TableCell>{format(request.dateOfRequest, 'dd/MM/yyyy')}</TableCell>
                <TableCell>{request.authorisedBy}</TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    request.status === "approved" && "bg-green-100 text-green-800",
                    request.status === "denied" && "bg-red-100 text-red-800",
                    request.status === "pending" && "bg-yellow-100 text-yellow-800"
                  )}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>{request.comment}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingRequest(request);
                        setIsDialogOpen(true);
                      }}
                      className="h-8 w-8"
                      title="Edit Request"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setViewingRequest(request);
                        setIsViewDialogOpen(true);
                      }}
                      className="h-8 w-8"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setRequests(requests.filter((r) => r.id !== request.id));
                      }}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Delete Request"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No holiday requests found matching your search
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
