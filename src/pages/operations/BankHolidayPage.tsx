import React, { useState, useEffect, useMemo, useCallback } from "react";
import { format, subDays, addDays } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from 'uuid';
import { Pencil, Trash2, Eye, ChevronLeft, ChevronRight, Search, Plus, Calendar, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock officers data
const mockOfficers = [
  { id: "off1", name: "John Smith" },
  { id: "off2", name: "Sarah Johnson" },
  { id: "off3", name: "Michael Brown" },
  { id: "off4", name: "Emily Davis" },
  { id: "off5", name: "David Wilson" },
  { id: "off6", name: "Lisa Thompson" },
  { id: "off7", name: "Robert Garcia" },
  { id: "off8", name: "Jennifer Lee" },
];

// Mock managers data (reusing from holiday request)
const mockManagers = [
  { id: "m1", name: "John Smith", role: "Senior Manager" },
  { id: "m2", name: "Sarah Johnson", role: "Department Head" },
  { id: "m3", name: "Michael Brown", role: "Team Lead" },
  { id: "m4", name: "Emily Davis", role: "Operations Manager" },
];

interface BankHoliday {
  id: string;
  officerId: string;
  holidayDate: Date;
  dateOfRequest: Date;
  authorisedBy: string;
  dateAuthorised: Date | null;
  status: "authorized" | "declined" | "pending";
}

const formSchema = z.object({
  officerId: z.string().min(1, "Officer is required"),
  holidayDate: z.date({
    required_error: "Bank holiday date is required",
  }),
  authorisedBy: z.string().min(1, "Authorising manager is required"),
  dateAuthorised: z.date().optional(),
});

// Generate mock holiday data
const generateMockHolidays = (): BankHoliday[] => {
  const holidays: BankHoliday[] = [];
  const today = new Date();

  // Create 30 random holidays for the demo
  for (let i = 0; i < 30; i++) {
    const officerId = mockOfficers[Math.floor(Math.random() * mockOfficers.length)].id;
    const managerId = mockManagers[Math.floor(Math.random() * mockManagers.length)].id;
    const holidayDate = addDays(today, Math.floor(Math.random() * 90) - 45);
    const requestDate = subDays(holidayDate, Math.floor(Math.random() * 30) + 1);
    
    // 70% of holidays are authorized, 10% declined, 20% pending
    const random = Math.random();
    let authDate = null;
    let status = "pending";
    
    if (random > 0.3) {
      // Authorized
      authDate = addDays(requestDate, Math.floor(Math.random() * 5) + 1);
      status = "authorized";
    } else if (random > 0.2) {
      // Declined - still has an auth date but marked as declined
      authDate = addDays(requestDate, Math.floor(Math.random() * 5) + 1);
      status = "declined";
    }
    
    holidays.push({
      id: uuidv4(),
      officerId,
      holidayDate,
      dateOfRequest: requestDate,
      authorisedBy: managerId,
      dateAuthorised: authDate,
      status: status as "authorized" | "declined" | "pending",
    });
  }

  return holidays;
};

// Reusable DateField component
const DateField = ({ 
  field, 
  label, 
  disabled = false 
}: { 
  field: any; 
  label: string; 
  disabled?: boolean; 
}) => (
  <FormItem className="flex flex-col">
    <FormLabel className="text-sm">{label}</FormLabel>
    <div className="relative">
      <Input
        type="date"
        {...field}
        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
        onChange={e => {
          const date = new Date(e.target.value);
          field.onChange(date);
        }}
        disabled={disabled}
        className="pl-8 text-sm h-9"
      />
      <Calendar className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
    </div>
    <FormMessage className="text-xs" />
  </FormItem>
);

// Reusable SelectField component
const SelectField = ({ 
  field, 
  label, 
  placeholder, 
  options,
  valueKey = "id",
  labelKey = "name",
  additionalInfo,
}: { 
  field: any; 
  label: string; 
  placeholder: string; 
  options: any[];
  valueKey?: string;
  labelKey?: string;
  additionalInfo?: string;
}) => (
  <FormItem>
    <FormLabel className="text-sm">{label}</FormLabel>
    <Select
      onValueChange={field.onChange}
      defaultValue={field.value}
    >
      <FormControl>
        <SelectTrigger className="w-full h-9 text-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {options.map((option) => (
          <SelectItem 
            key={option[valueKey]} 
            value={option[valueKey]} 
            className="text-sm"
          >
            {option[labelKey]}{additionalInfo ? ` - ${option[additionalInfo]}` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <FormMessage className="text-xs" />
  </FormItem>
);

// Reusable action buttons component
const ActionButtons = ({ 
  holiday,
  onEdit,
  onView,
  onDelete
}: { 
  holiday: BankHoliday;
  onEdit: (holiday: BankHoliday) => void;
  onView: (holiday: BankHoliday) => void;
  onDelete: (id: string) => void;
}) => (
  <div className="flex gap-1 justify-end">
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onEdit(holiday)}
      className="h-7 w-7"
      title="Edit Holiday"
    >
      <Pencil className="h-3.5 w-3.5" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onView(holiday)}
      className="h-7 w-7"
      title="View Details"
    >
      <Eye className="h-3.5 w-3.5" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onDelete(holiday.id)}
      className="h-7 w-7 text-destructive hover:bg-destructive/10"
      title="Delete Holiday"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  </div>
);

// Pagination component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="flex items-center justify-between p-2 bg-muted/20 border-t">
    <div className="text-xs text-muted-foreground">
      Page {currentPage}/{totalPages}
    </div>
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-7 w-7 p-0 flex items-center justify-center"
        title="Previous Page"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-7 w-7 p-0 flex items-center justify-center"
        title="Next Page"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  </div>
);

// Status badge component
const StatusBadge = ({ status }: { status: "authorized" | "declined" | "pending" }) => {
  if (status === "authorized") {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 whitespace-nowrap text-xs py-0.5">
        Authorized
      </Badge>
    );
  } else if (status === "declined") {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 whitespace-nowrap text-xs py-0.5">
        Declined
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 whitespace-nowrap text-xs py-0.5">
      Pending
    </Badge>
  );
};

// Reusable mobile card view for holidays
const HolidayMobileCard = ({
  holiday,
  getOfficerName,
  getManagerName,
  onEdit,
  onView,
  onDelete
}: {
  holiday: BankHoliday;
  getOfficerName: (id: string) => string;
  getManagerName: (id: string) => string;
  onEdit: (holiday: BankHoliday) => void;
  onView: (holiday: BankHoliday) => void;
  onDelete: (id: string) => void;
}) => (
  <Card className="mb-2 shadow-sm sm:hidden">
    <CardContent className="p-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-sm">{getOfficerName(holiday.officerId)}</h3>
          <p className="text-xs text-muted-foreground">{format(holiday.holidayDate, 'dd MMM yyyy')}</p>
        </div>
        <MemoizedStatusBadge status={holiday.status} />
      </div>
      <div className="flex items-center justify-between text-xs pt-2 border-t border-muted">
        <span className="text-muted-foreground">
          Manager: {getManagerName(holiday.authorisedBy)}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(holiday)}
            className="h-6 w-6 p-0"
            title="View Details"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(holiday)}
            className="h-6 w-6 p-0"
            title="Edit Holiday"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(holiday.id)}
            className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
            title="Delete Holiday"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Memoized components to prevent unnecessary re-renders
const MemoizedActionButtons = React.memo(ActionButtons);
const MemoizedStatusBadge = React.memo(StatusBadge);
const MemoizedHolidayMobileCard = React.memo(HolidayMobileCard);

export default function BankHolidayPage() {
  const [holidays, setHolidays] = useState<BankHoliday[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<BankHoliday | null>(null);
  const [viewingHoliday, setViewingHoliday] = useState<BankHoliday | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      officerId: "",
      holidayDate: undefined,
      authorisedBy: "",
      dateAuthorised: undefined,
    },
  });

  // Initialize with mock data
  useEffect(() => {
    setHolidays(generateMockHolidays());
  }, []);

  useEffect(() => {
    if (editingHoliday) {
      form.reset({
        officerId: editingHoliday.officerId,
        holidayDate: editingHoliday.holidayDate,
        authorisedBy: editingHoliday.authorisedBy,
        dateAuthorised: editingHoliday.dateAuthorised || undefined,
      });
    }
  }, [editingHoliday, form]);

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    const formattedHoliday: BankHoliday = {
      id: editingHoliday?.id || uuidv4(),
      officerId: values.officerId,
      holidayDate: values.holidayDate,
      dateOfRequest: editingHoliday?.dateOfRequest || new Date(),
      authorisedBy: values.authorisedBy,
      dateAuthorised: values.dateAuthorised || null,
      status: "pending" as "pending" | "authorized" | "declined"
    };

    if (editingHoliday) {
      setHolidays(prev => prev.map(holiday => 
        holiday.id === editingHoliday.id ? formattedHoliday : holiday
      ));
      toast({
        title: "Success",
        description: "Bank holiday updated successfully",
      });
    } else {
      setHolidays(prev => [...prev, formattedHoliday]);
      toast({
        title: "Success",
        description: "Bank holiday created successfully",
      });
    }

    setIsDialogOpen(false);
    form.reset();
    setEditingHoliday(null);
  }, [editingHoliday, form, toast]);

  const handleDelete = useCallback((id: string) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
    toast({
      title: "Success",
      description: "Bank holiday deleted successfully",
    });
  }, [toast]);

  const handleViewHoliday = useCallback((holiday: BankHoliday) => {
    setViewingHoliday(holiday);
    setIsViewDialogOpen(true);
  }, []);

  const handleEditHoliday = useCallback((holiday: BankHoliday) => {
    setEditingHoliday(holiday);
    setIsDialogOpen(true);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const filteredHolidays = useMemo(() => {
    if (!searchTerm.trim()) return holidays;
    
    return holidays.filter((holiday) => {
      const officerName = mockOfficers.find(o => o.id === holiday.officerId)?.name || '';
      const searchLower = searchTerm.toLowerCase();
      return officerName.toLowerCase().includes(searchLower);
    });
  }, [holidays, searchTerm]);

  const paginatedHolidays = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredHolidays.slice(startIndex, endIndex);
  }, [filteredHolidays, currentPage]);

  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(filteredHolidays.length / itemsPerPage)), 
    [filteredHolidays.length]
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getOfficerName = useCallback((officerId: string) => 
    mockOfficers.find(o => o.id === officerId)?.name || 'Unknown',
    []
  );

  const getManagerName = useCallback((managerId: string) => 
    mockManagers.find(m => m.id === managerId)?.name || 'Unknown',
    []
  );

  // Stats counts
  const pendingCount = useMemo(() => 
    holidays.filter(h => h.status === "pending").length, 
    [holidays]
  );

  const authorizedCount = useMemo(() => 
    holidays.filter(h => h.status === "authorized").length, 
    [holidays]
  );
  
  const declinedCount = useMemo(() => 
    holidays.filter(h => h.status === "declined").length, 
    [holidays]
  );

  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4 md:space-y-6 max-w-[1280px]">
      {/* Page header with summary cards */}
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 md:gap-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Bank Holidays</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingHoliday(null);
                  form.reset();
                }}
                className="w-full sm:w-auto px-2 sm:px-3 md:px-4 py-1.5 flex items-center justify-center gap-1 text-sm"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Bank Holiday
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-16px)] sm:w-auto max-w-md p-3 sm:p-4 md:p-6">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-lg">
                  {editingHoliday ? "Edit Bank Holiday" : "Add Bank Holiday"}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  {editingHoliday 
                    ? "Edit the details of the bank holiday."
                    : "Add a new bank holiday to the calendar."}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-3 p-2 sm:p-3 md:p-4 border rounded-lg bg-muted/20">
                    <h3 className="text-sm font-semibold">Holiday Details</h3>
                    
                    <FormField
                      control={form.control}
                      name="officerId"
                      render={({ field }) => (
                        <SelectField 
                          field={field}
                          label="Officer Name"
                          placeholder="Select an officer"
                          options={mockOfficers}
                        />
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="holidayDate"
                      render={({ field }) => (
                        <DateField 
                          field={field}
                          label="Bank Holiday Date"
                        />
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="authorisedBy"
                      render={({ field }) => (
                        <SelectField 
                          field={field}
                          label="Authorised By"
                          placeholder="Select manager"
                          options={mockManagers}
                          additionalInfo="role"
                        />
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateAuthorised"
                      render={({ field }) => (
                        <DateField 
                          field={field}
                          label="Date Authorised"
                          disabled={!form.getValues("authorisedBy")}
                        />
                      )}
                    />
                  </div>

                  <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0 sm:justify-end pt-2">
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => setIsDialogOpen(false)} 
                      className="w-full sm:w-auto text-xs h-8"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="w-full sm:w-auto text-xs h-8"
                      size="sm"
                    >
                      {editingHoliday ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary cards - Grid layout based on breakpoints */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <Card className="bg-primary text-primary-foreground shadow-sm">
            <CardHeader className="p-2 sm:p-3 md:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm md:text-base">Total Bank Holidays</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs text-primary-foreground/70">All recorded holidays</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 md:p-4 pt-1">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">{holidays.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-600 text-white shadow-sm">
            <CardHeader className="p-2 sm:p-3 md:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm md:text-base">Pending</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs text-white/70">Awaiting approval</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 md:p-4 pt-1">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-green-600 text-white shadow-sm col-span-2 lg:col-span-1">
            <CardHeader className="p-2 sm:p-3 md:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm md:text-base">Authorized</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs text-white/70">Approved holidays</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 md:p-4 pt-1">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">{authorizedCount}</div>
            </CardContent>
          </Card>
          <Card className="hidden lg:block lg:col-span-1 shadow-sm bg-red-600 text-white">
            <CardHeader className="p-2 sm:p-3 md:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm md:text-base">Declined</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs text-white/70">Rejected holidays</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 md:p-4 pt-1">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">{declinedCount}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main content - 1 column on mobile, 7 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 sm:gap-4 md:gap-6">
        {/* Main content area - full width on mobile, 7 cols on desktop */}
        <div className="lg:col-span-7">
          {/* Filter and search section */}
          <Card className="shadow-sm">
            <CardHeader className="p-2 sm:p-3 md:p-4 pb-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <CardTitle className="text-sm sm:text-base md:text-lg">Bank Holiday Records</CardTitle>
                <div className="relative w-full sm:w-64 md:w-72">
                  <Input
                    type="text"
                    placeholder="Search by officer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 h-8 sm:h-9 text-xs sm:text-sm"
                  />
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Mobile view - card layout */}
              <div className="p-2 sm:hidden">
                {paginatedHolidays.map((holiday) => (
                  <MemoizedHolidayMobileCard
                    key={holiday.id}
                    holiday={holiday}
                    getOfficerName={getOfficerName}
                    getManagerName={getManagerName}
                    onEdit={handleEditHoliday}
                    onView={handleViewHoliday}
                    onDelete={handleDelete}
                  />
                ))}
                {paginatedHolidays.length === 0 && (
                  <div className="text-center py-4 text-xs text-muted-foreground">
                    No holidays found
                  </div>
                )}
              </div>

              {/* Desktop view - table layout */}
              <div className="hidden sm:block overflow-x-auto min-w-[320px]">
                <div className="flex justify-between items-center px-3 py-2 bg-muted/10">
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {filteredHolidays.length} {filteredHolidays.length === 1 ? 'record' : 'records'} found
                  </div>
                  <div className="flex gap-2">
                    {searchTerm && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs flex items-center gap-1"
                        onClick={() => setSearchTerm("")}
                      >
                        <Filter className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Clear Filter</span>
                        <span className="md:hidden">Clear</span>
                      </Button>
                    )}
                  </div>
                </div>
                <Table className="w-full">
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-medium text-xs sm:text-sm p-2 sm:p-3 w-1/4">Officer</TableHead>
                      <TableHead className="font-medium text-xs sm:text-sm p-2 sm:p-3 whitespace-nowrap w-1/4">Date</TableHead>
                      <TableHead className="font-medium text-xs sm:text-sm p-2 sm:p-3 hidden sm:table-cell">Manager</TableHead>
                      <TableHead className="font-medium text-xs sm:text-sm p-2 sm:p-3 w-1/4">Status</TableHead>
                      <TableHead className="font-medium text-xs sm:text-sm p-2 sm:p-3 text-center w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedHolidays.map((holiday) => (
                      <TableRow key={holiday.id} className="hover:bg-muted/10">
                        <TableCell className="font-medium text-xs sm:text-sm p-2 sm:p-3 truncate max-w-[80px] sm:max-w-[120px]">
                          {getOfficerName(holiday.officerId)}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm p-2 sm:p-3 whitespace-nowrap">
                          {format(holiday.holidayDate, 'dd/MM/yy')}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm p-2 sm:p-3 hidden sm:table-cell truncate max-w-[120px]">
                          {getManagerName(holiday.authorisedBy)}
                        </TableCell>
                        <TableCell className="p-2 sm:p-3">
                          <MemoizedStatusBadge status={holiday.status} />
                        </TableCell>
                        <TableCell className="p-1 sm:p-2">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditHoliday(holiday)}
                              className="h-8 w-8 rounded-full bg-blue-50 border-blue-200 hover:bg-blue-100 p-0"
                              title="Edit Holiday"
                            >
                              <Pencil className="h-3.5 w-3.5 text-blue-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewHoliday(holiday)}
                              className="h-8 w-8 rounded-full bg-gray-50 border-gray-200 hover:bg-gray-100 p-0"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5 text-gray-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(holiday.id)}
                              className="h-8 w-8 rounded-full bg-red-50 border-red-200 hover:bg-red-100 p-0"
                              title="Delete Holiday"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedHolidays.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 sm:py-6 text-xs sm:text-sm text-muted-foreground">
                          No holidays found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredHolidays.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-[calc(100%-16px)] sm:w-auto max-w-md p-3 sm:p-4 md:p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg">Holiday Details</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Complete details of the selected bank holiday
            </DialogDescription>
          </DialogHeader>

          {viewingHoliday && (
            <div className="space-y-3 sm:space-y-4">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground">Officer</div>
                      <div className="text-sm sm:text-base font-semibold">{getOfficerName(viewingHoliday.officerId)}</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground">Bank Holiday Date</div>
                      <div className="text-sm sm:text-base font-semibold">{format(viewingHoliday.holidayDate, 'dd MMM yyyy')}</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground">Date of Request</div>
                      <div className="text-sm sm:text-base font-semibold">{format(viewingHoliday.dateOfRequest, 'dd MMM yyyy')}</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground">Authorised By</div>
                      <div className="text-sm sm:text-base font-semibold">{getManagerName(viewingHoliday.authorisedBy)}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground">Authorization Status</div>
                      <div className="flex items-center gap-2">
                        <MemoizedStatusBadge status={viewingHoliday.status} />
                        {viewingHoliday.dateAuthorised && (
                          <span className="text-xs sm:text-sm">{format(viewingHoliday.dateAuthorised, 'dd MMM yyyy')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3 sm:justify-end pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)} 
                  className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                  size="sm"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setViewingHoliday(null);
                    setIsViewDialogOpen(false);
                    setEditingHoliday(viewingHoliday);
                    setIsDialogOpen(true);
                  }}
                  className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                  size="sm"
                >
                  Edit
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
