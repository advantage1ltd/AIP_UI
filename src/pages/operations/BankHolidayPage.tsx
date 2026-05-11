/**
 * Bank holiday authorization workflow.
 * Flow: role-scoped officer list → request form → manager approval → archive and pagination.
 */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Trash2, Eye, ChevronLeft, ChevronRight, Search, Plus, Calendar, Filter, Archive, Loader2 } from "lucide-react";

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

import { bankHolidayService } from "@/services/bankHolidayService";
import type { BankHoliday, BankHolidayStatus } from "@/types/bankHoliday";
import { employeeService } from '@/services/employeeService'
import { userService } from '@/services/userService'
import { useAuth } from '@/contexts/AuthContext'
import { usePageAccess } from '@/contexts/PageAccessContext'
import { getUser } from '@/services/auth'
import { harmonizeRole, normalizeRoleId } from '@/utils/roles'
import type { Employee } from '@/types/employee'

const bankHolidayMatchesViewer = (
	holiday: BankHoliday,
	viewer: ReturnType<typeof getUser>
): boolean => {
	if (!viewer) return false
	if (viewer.employeeId != null && Number(viewer.employeeId) === Number(holiday.officerId)) return true
	const label = `${viewer.firstName ?? ''} ${viewer.lastName ?? ''}`.trim().toLowerCase()
	if (!label) return false
	const on = holiday.officerName.trim().toLowerCase()
	return on === label || on.includes(label)
}

interface EmployeeOption {
	id: number;
	fullName: string;
	position?: string;
}

interface ApproverOption {
	userId: string;
	employeeId?: number;
	label: string;
	role: string;
}

const formSchema = z.object({
	officerId: z.number({
		required_error: 'Officer is required'
	}).int().positive(),
	holidayDate: z.date({
		required_error: 'Bank holiday date is required'
	})
})

const toEmployeeOption = (employee: Employee): EmployeeOption => ({
	id: employee.id,
	fullName: employee.fullName ?? `${employee.firstName} ${employee.surname}`,
	position: employee.position
})

const toDate = (value: string): Date => new Date(value)
const formatDateForInput = (value?: Date) => (value ? format(value, 'yyyy-MM-dd') : '')
const parseDateInput = (value: string): Date | undefined => {
	if (!value) return undefined
	const parsed = new Date(`${value}T00:00:00`)
	if (Number.isNaN(parsed.getTime())) return undefined
	parsed.setHours(0, 0, 0, 0)
	return parsed
}
const formatDisplayDate = (value: string) => format(toDate(value), 'dd MMM yyyy')

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
				value={formatDateForInput(field.value)}
				onChange={e => {
					const date = parseDateInput(e.target.value);
					field.onChange(date);
				}}
				disabled={disabled}
				className="h-9 border-slate-300 pl-8 text-sm"
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
	getValue,
	getLabel,
	disabled = false
}: { 
	field: any; 
	label: string; 
	placeholder: string; 
	options: EmployeeOption[];
	getValue: (employee: EmployeeOption) => string;
	getLabel: (employee: EmployeeOption) => string;
	disabled?: boolean;
}) => (
	<FormItem>
		<FormLabel className="text-sm">{label}</FormLabel>
		<Select
			onValueChange={(value) => field.onChange(Number(value))}
			value={field.value ? String(field.value) : undefined}
			disabled={disabled}
		>
			<FormControl>
				<SelectTrigger className="w-full h-9 text-sm" disabled={disabled}>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
			</FormControl>
			<SelectContent>
				{options.map((option) => (
					<SelectItem 
						key={getValue(option)} 
						value={getValue(option)} 
						className="text-sm"
					>
						{getLabel(option)}
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
  canEdit,
  canDelete,
  canArchive,
  onEdit,
  onView,
  onDelete,
  onArchive,
  onUnarchive
}: { 
  holiday: BankHoliday;
  canEdit: boolean;
  canDelete: boolean;
  canArchive: boolean;
  onEdit: (holiday: BankHoliday) => void;
  onView: (holiday: BankHoliday) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
}) => (
  <div className="flex items-center justify-center gap-2">
    {canEdit ? (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(holiday)}
        className="h-8 w-8 rounded-full bg-blue-50 border-blue-200 hover:bg-blue-100 p-0"
        title="Edit Holiday"
      >
        <Pencil className="h-3.5 w-3.5 text-blue-600" />
      </Button>
    ) : null}
    <Button
      variant="outline"
      size="sm"
      onClick={() => onView(holiday)}
      className="h-8 w-8 rounded-full bg-gray-50 border-gray-200 hover:bg-gray-100 p-0"
      title="View Details"
    >
      <Eye className="h-3.5 w-3.5 text-gray-600" />
    </Button>
    {canArchive && holiday.status === 'authorized' ? (
      <Button
        variant="outline"
        size="sm"
        onClick={() => holiday.archived ? onUnarchive(holiday.id) : onArchive(holiday.id)}
        className="h-8 w-8 rounded-full bg-purple-50 border-purple-200 hover:bg-purple-100 p-0"
        title={holiday.archived ? "Unarchive Holiday" : "Archive Holiday"}
      >
        {holiday.archived ? (
          <Archive className="h-3.5 w-3.5 text-purple-600" />
        ) : (
          <Archive className="h-3.5 w-3.5 text-purple-600" />
        )}
      </Button>
    ) : null}
    {canDelete ? (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(holiday.id)}
        className="h-8 w-8 rounded-full bg-red-50 border-red-200 hover:bg-red-100 p-0"
        title="Delete Holiday"
      >
        <Trash2 className="h-3.5 w-3.5 text-red-600" />
      </Button>
    ) : null}
  </div>
);

const BankHolidayPaginationBar = ({
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
const StatusBadge = ({ status }: { status: BankHolidayStatus }) => {
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
  canEdit,
  canDelete,
  canArchive,
  onEdit,
  onView,
  onDelete,
  onArchive,
  onUnarchive
}: {
  holiday: BankHoliday;
  canEdit: boolean;
  canDelete: boolean;
  canArchive: boolean;
  onEdit: (holiday: BankHoliday) => void;
  onView: (holiday: BankHoliday) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
}) => (
  <Card className="mb-2 border-slate-200 shadow-sm sm:hidden">
    <CardContent className="p-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{holiday.officerName}</h3>
          <p className="text-xs text-muted-foreground">{formatDisplayDate(holiday.holidayDate)}</p>
        </div>
        <MemoizedStatusBadge status={holiday.status} />
      </div>
      <div className="flex items-center justify-between text-xs pt-2 border-t border-muted">
        <span className="text-muted-foreground">
          Manager: {holiday.authorisedByName ?? 'Pending assignment'}
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
          {canEdit ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(holiday)}
              className="h-6 w-6 p-0"
              title="Edit Holiday"
            >
              <Pencil className="h-3 w-3" />
            </Button>
          ) : null}
          {canDelete ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(holiday.id)}
              className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
              title="Delete Holiday"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          ) : null}
          {canArchive && holiday.status === 'authorized' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => holiday.archived ? onUnarchive(holiday.id) : onArchive(holiday.id)}
              className="h-6 w-6 p-0 text-purple-600 hover:bg-purple-50"
              title={holiday.archived ? "Unarchive Holiday" : "Archive Holiday"}
            >
              <Archive className="h-3 w-3" />
            </Button>
          ) : null}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Memoized components to prevent unnecessary re-renders
const MemoizedActionButtons = React.memo(ActionButtons);
const MemoizedStatusBadge = React.memo(StatusBadge);
const MemoizedHolidayMobileCard = React.memo(HolidayMobileCard);

// Add this component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

// Add this component
const LoadingRow = () => (
  <TableRow>
    <TableCell colSpan={5}>
      <LoadingSpinner />
    </TableCell>
  </TableRow>
);

// Add this component
const LoadingCard = () => (
  <Card className="mb-2 shadow-sm sm:hidden">
    <CardContent className="p-3">
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    </CardContent>
  </Card>
);

// === Component ===
export default function BankHolidayPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [holidays, setHolidays] = useState<BankHoliday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<BankHoliday | null>(null);
  const [viewingHoliday, setViewingHoliday] = useState<BankHoliday | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showArchived, setShowArchived] = useState(false);
  const [officerOptions, setOfficerOptions] = useState<EmployeeOption[]>([]);
  const [approverOptions, setApproverOptions] = useState<ApproverOption[]>([]);
  const [isApproverLoading, setIsApproverLoading] = useState(false);
  const [serverListMeta, setServerListMeta] = useState({ total: 0, totalPages: 1 });
  const itemsPerPage = 10;

  const { currentRole, isTestMode, testRole } = usePageAccess();
  const viewer = getUser();
  const effectiveNavigationRole = isTestMode && testRole ? testRole : currentRole;
  const harmonizedHolidayRole =
    normalizeRoleId(effectiveNavigationRole ?? '') ??
    normalizeRoleId(viewer?.pageAccessRole ?? viewer?.role ?? '') ??
    harmonizeRole(viewer?.pageAccessRole ?? viewer?.role ?? '');

  // Officer JWT scope limits selectable officers to the signed-in employee.
  const hasBankHolidayManagementAccess =
    harmonizedHolidayRole === 'administrator' || harmonizedHolidayRole === 'manager';
  const isOfficerBankHolidayScope = harmonizedHolidayRole === 'securityofficer';

  const officerEmployeeIdForApi =
    isOfficerBankHolidayScope &&
    viewer?.employeeId != null &&
    Number.isFinite(Number(viewer.employeeId))
      ? Number(viewer.employeeId)
      : undefined;

  const scopedOfficerFetch = officerEmployeeIdForApi != null;

  const canMutateBankHoliday = (holiday: BankHoliday) =>
    hasBankHolidayManagementAccess || bankHolidayMatchesViewer(holiday, viewer);

  const selectableOfficerOptions = useMemo(() => {
    if (!isOfficerBankHolidayScope || viewer?.employeeId == null) return officerOptions;
    return officerOptions.filter((o) => o.id === viewer.employeeId);
  }, [officerOptions, isOfficerBankHolidayScope, viewer?.employeeId]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      officerId: user?.employeeId ?? undefined,
      holidayDate: undefined,
    } as Partial<z.infer<typeof formSchema>>,
  });

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsEmployeeLoading(true);
        const employees = await employeeService.getActiveEmployees();
        const normalized = employees.map(toEmployeeOption);
        setOfficerOptions(normalized);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: 'Error',
          description: 'Unable to load officers. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsEmployeeLoading(false);
      }
    };

    loadEmployees();
  }, [toast]);

  useEffect(() => {
    if (!hasBankHolidayManagementAccess || isOfficerBankHolidayScope) {
      setApproverOptions([]);
      setIsApproverLoading(false);
      return;
    }

    const loadApprovers = async () => {
      try {
        setIsApproverLoading(true);
        const response = await userService.getUsers({
          page: 1,
          pageSize: 250
        });

        const allowed = (response?.data ?? [])
          .filter((user) => {
            const role = user.role?.toLowerCase();
            return role === 'manager' || role === 'administrator';
          })
          .map((user) => {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            return {
              userId: user.id,
              employeeId: typeof user.employeeId === 'number' ? user.employeeId : undefined,
              label: fullName || user.username || user.email,
              role: user.role
            };
          });

        setApproverOptions(allowed);
      } catch (error) {
        console.error('Error loading approvers:', error);
        setApproverOptions([]);
        toast({
          title: 'Error',
          description: 'Unable to load authorising users.',
          variant: 'destructive'
        });
      } finally {
        setIsApproverLoading(false);
      }
    };

    void loadApprovers();
  }, [toast, hasBankHolidayManagementAccess, isOfficerBankHolidayScope]);

  // Fetch holidays
  const fetchHolidays = useCallback(async () => {
    try {
      setIsLoading(true);
      const scopedOfficer = officerEmployeeIdForApi != null;
      const response = await bankHolidayService.getBankHolidays({
        search: scopedOfficer ? undefined : searchTerm,
        page: scopedOfficer ? 1 : currentPage,
        limit: scopedOfficer ? 500 : itemsPerPage,
        archived: showArchived,
        employeeId: officerEmployeeIdForApi,
      });

      if (!scopedOfficer) {
        setServerListMeta({
          total: response.total ?? response.data.length,
          totalPages: Math.max(1, response.totalPages ?? 1),
        });
      }

      const sessionUser = getUser();
      let rows = response.data;
      if (scopedOfficer && sessionUser) {
        rows = rows.filter((h) => bankHolidayMatchesViewer(h, sessionUser));
      }

      setHolidays(rows);
    } catch (error) {
      console.error('Error fetching bank holidays:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bank holidays. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, currentPage, itemsPerPage, showArchived, toast, officerEmployeeIdForApi]);

  useEffect(() => {
    if (!scopedOfficerFetch) return;
    setServerListMeta({ total: 0, totalPages: 1 });
  }, [scopedOfficerFetch]);

  // Initial fetch
  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  // Reset to first page when search or archive filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showArchived]);

  useEffect(() => {
    if (editingHoliday) {
      form.reset({
        officerId: editingHoliday.officerId,
        holidayDate: toDate(editingHoliday.holidayDate),
      });
    }
  }, [editingHoliday, form]);

  useEffect(() => {
    if (!editingHoliday && user?.employeeId) {
      form.setValue('officerId', user.employeeId);
    }
  }, [editingHoliday, user?.employeeId, form]);

  const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
    try {
      const sessionUser = getUser();
      if (
        isOfficerBankHolidayScope &&
        sessionUser?.employeeId != null &&
        Number(values.officerId) !== Number(sessionUser.employeeId)
      ) {
        toast({
          title: 'Access denied',
          description: 'You can only create or edit bank holidays for yourself.',
          variant: 'destructive',
        });
        return;
      }

      const payloadDate = values.holidayDate.toISOString();

      if (editingHoliday) {
        await bankHolidayService.updateBankHoliday(editingHoliday.id, {
          officerId: values.officerId,
          holidayDate: payloadDate
        });
        
        await fetchHolidays();
        
        toast({
          title: "Success",
          description: "Bank holiday updated successfully",
        });
      } else {
        await bankHolidayService.createBankHoliday({
          officerId: values.officerId,
          holidayDate: payloadDate
        });
        
        setCurrentPage(1);
        await fetchHolidays();
        
        toast({
          title: "Success",
          description: "Bank holiday created successfully",
        });
      }

      setIsDialogOpen(false);
      form.reset({
        officerId: user?.employeeId ?? undefined,
        holidayDate: undefined,
      });
      setEditingHoliday(null);
    } catch (error) {
      console.error('Error submitting bank holiday:', error);
      toast({
        title: "Error",
        description: "Failed to submit bank holiday. Please try again.",
        variant: "destructive"
      });
    }
  }, [
    editingHoliday,
    fetchHolidays,
    form,
    toast,
    user?.employeeId,
    isOfficerBankHolidayScope,
  ]);

  const handleDelete = useCallback(async (id: string) => {
    const target = holidays.find((h) => h.id === id);
    const sessionUser = getUser();
    if (target && !hasBankHolidayManagementAccess && !bankHolidayMatchesViewer(target, sessionUser)) {
      toast({
        title: 'Access denied',
        description: 'You can only delete your own bank holiday requests.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await bankHolidayService.deleteBankHoliday(id);
      await fetchHolidays();
      toast({
        title: "Success",
        description: "Bank holiday deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting bank holiday:', error);
      toast({
        title: "Error",
        description: "Failed to delete bank holiday. Please try again.",
        variant: "destructive"
      });
    }
  }, [holidays, hasBankHolidayManagementAccess, fetchHolidays, toast]);

  const handleViewHoliday = useCallback((holiday: BankHoliday) => {
    setViewingHoliday(holiday);
    setIsViewDialogOpen(true);
  }, []);

  const handleEditHoliday = useCallback((holiday: BankHoliday) => {
    const sessionUser = getUser();
    if (!hasBankHolidayManagementAccess && !bankHolidayMatchesViewer(holiday, sessionUser)) {
      toast({
        title: 'Access denied',
        description: 'You can only edit your own bank holiday requests.',
        variant: 'destructive',
      });
      return;
    }
    setEditingHoliday(holiday);
    setIsDialogOpen(true);
  }, [hasBankHolidayManagementAccess, toast]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const scopeFilteredHolidays = useMemo(() => {
    if (!isOfficerBankHolidayScope || !viewer) return holidays;
    return holidays.filter((h) => bankHolidayMatchesViewer(h, viewer));
  }, [holidays, isOfficerBankHolidayScope, viewer]);

  const filteredHolidays = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return scopeFilteredHolidays;
    return scopeFilteredHolidays.filter(
      (h) =>
        h.officerName.toLowerCase().includes(q) ||
        (h.officerNumber && h.officerNumber.toLowerCase().includes(q))
    );
  }, [scopeFilteredHolidays, searchTerm]);

  const displayTotalPages = scopedOfficerFetch
    ? Math.max(1, Math.ceil(filteredHolidays.length / itemsPerPage))
    : Math.max(1, serverListMeta.totalPages);

  useEffect(() => {
    if (currentPage > displayTotalPages) {
      setCurrentPage(displayTotalPages);
    }
  }, [currentPage, displayTotalPages]);

  const paginatedHolidays = useMemo(() => {
    if (!scopedOfficerFetch) {
      return filteredHolidays;
    }
    return filteredHolidays.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredHolidays, currentPage, itemsPerPage, scopedOfficerFetch]);

  const pendingCount = useMemo(
    () => scopeFilteredHolidays.filter((h) => h.status === 'pending').length,
    [scopeFilteredHolidays]
  );

  const authorizedCount = useMemo(
    () => scopeFilteredHolidays.filter((h) => h.status === 'authorized').length,
    [scopeFilteredHolidays]
  );

  const declinedCount = useMemo(
    () => scopeFilteredHolidays.filter((h) => h.status === 'declined').length,
    [scopeFilteredHolidays]
  );

  const totalCount = scopeFilteredHolidays.length;

  const handleArchive = useCallback(
    async (id: string) => {
      if (!hasBankHolidayManagementAccess) {
        toast({
          title: 'Access denied',
          description: 'Only managers and administrators can archive bank holidays.',
          variant: 'destructive',
        });
        return;
      }
      try {
        const updatedHoliday = await bankHolidayService.archiveBankHoliday(id);
        setHolidays((prev) => prev.map((h) => (h.id === id ? updatedHoliday : h)));
        toast({
          title: 'Success',
          description: 'Bank holiday archived successfully.',
        });
      } catch (error) {
        console.error('Error archiving bank holiday:', error);
        toast({
          title: 'Error',
          description: 'Failed to archive bank holiday. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [hasBankHolidayManagementAccess, toast]
  );

  const handleUnarchive = useCallback(
    async (id: string) => {
      if (!hasBankHolidayManagementAccess) {
        toast({
          title: 'Access denied',
          description: 'Only managers and administrators can unarchive bank holidays.',
          variant: 'destructive',
        });
        return;
      }
      try {
        const updatedHoliday = await bankHolidayService.unarchiveBankHoliday(id);
        setHolidays((prev) => prev.map((h) => (h.id === id ? updatedHoliday : h)));
        toast({
          title: 'Success',
          description: 'Bank holiday unarchived successfully.',
        });
      } catch (error) {
        console.error('Error unarchiving bank holiday:', error);
        toast({
          title: 'Error',
          description: 'Failed to unarchive bank holiday. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [hasBankHolidayManagementAccess, toast]
  );

  return (
    <div className="min-h-screen bg-[#EFF4FF]">
      <div className="container mx-auto max-w-screen-2xl px-2 sm:px-4 lg:px-8 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4 md:space-y-6">
      {/* Page header with summary cards */}
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-6">
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between md:gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2.5">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">Bank Holidays</h1>
              <p className="text-xs text-slate-500 sm:text-sm">Manage holiday records, approvals, and archive lifecycle.</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              setEditingHoliday(null)
              form.reset({
                officerId: user?.employeeId ?? undefined,
                holidayDate: undefined
              })
            }
          }}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingHoliday(null);
                  form.reset();
                }}
                className="w-full sm:w-auto px-2 sm:px-3 md:px-4 py-1.5 flex items-center justify-center gap-1 text-sm"
                size="sm"
                disabled={
                  isEmployeeLoading ||
                  selectableOfficerOptions.length === 0
                }
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
                        <div className="space-y-1">
                          <SelectField 
                            field={field}
                            label="Officer Name"
                            placeholder={isEmployeeLoading ? "Loading officers..." : "Select an officer"}
                            options={selectableOfficerOptions}
                            getValue={(option) => option.id.toString()}
                            getLabel={(option) => option.fullName}
                            disabled={
                              isEmployeeLoading ||
                              selectableOfficerOptions.length === 0 ||
                              isOfficerBankHolidayScope
                            }
                          />
                          {!isEmployeeLoading && selectableOfficerOptions.length === 0 && (
                            <p className="text-[11px] text-muted-foreground">No active officers available.</p>
                          )}
                        </div>
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
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-4">
          <Card className="shadow-sm border-purple-700 bg-gradient-to-br from-purple-800 to-purple-900 text-white">
            <CardHeader className="p-2 sm:p-3 md:p-4 pb-0">
              <CardTitle className="text-xs sm:text-sm md:text-base">Total Bank Holidays</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs text-white/70">All recorded holidays</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 md:p-4 pt-1">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">{totalCount}</div>
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

      {/* Main content */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6">
        <div>
          {/* Filter and search section */}
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50/40 p-2 pb-1.5 sm:p-3 md:p-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-4">
                <CardTitle className="text-sm font-semibold text-slate-800 sm:text-base md:text-lg">Bank Holiday Records</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Select
                    value={showArchived ? "archived" : "active"}
                    onValueChange={(value) => setShowArchived(value === "archived")}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-8 w-full border-slate-300 text-xs sm:h-9 sm:w-[140px] sm:text-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative w-full sm:w-64 md:w-72">
                    <Input
                      type="text"
                      placeholder="Search by officer name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-8 w-full border-slate-300 pl-8 text-xs sm:h-9 sm:text-sm"
                      disabled={isLoading}
                    />
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Mobile view - card layout */}
              <div className="p-2 sm:hidden">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <LoadingCard key={i} />
                  ))
                ) : (
                  <>
                    {paginatedHolidays.map((holiday) => (
                      <MemoizedHolidayMobileCard
                        key={holiday.id}
                        holiday={holiday}
                        canEdit={canMutateBankHoliday(holiday)}
                        canDelete={canMutateBankHoliday(holiday)}
                        canArchive={hasBankHolidayManagementAccess}
                        onEdit={handleEditHoliday}
                        onView={handleViewHoliday}
                        onDelete={handleDelete}
                        onArchive={handleArchive}
                        onUnarchive={handleUnarchive}
                      />
                    ))}
                    {paginatedHolidays.length === 0 && (
                      <div className="text-center py-4 text-xs text-muted-foreground">
                        No holidays found
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Desktop view - table layout */}
              <div className="hidden min-w-[320px] overflow-x-auto sm:block">
                <div className="flex items-center justify-between bg-slate-50/30 px-3 py-2">
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {scopedOfficerFetch
                      ? `${filteredHolidays.length} ${filteredHolidays.length === 1 ? 'record' : 'records'} found`
                      : `${paginatedHolidays.length} on this page · ${serverListMeta.total} total`}
                  </div>
                  <div className="flex gap-2">
                    {searchTerm && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs flex items-center gap-1"
                        onClick={() => setSearchTerm("")}
                        disabled={isLoading}
                      >
                        <Filter className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Clear Filter</span>
                        <span className="md:hidden">Clear</span>
                      </Button>
                    )}
                  </div>
                </div>
                <Table className="w-full">
                  <TableHeader className="bg-slate-50/70">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-1/4 p-2 text-xs font-semibold uppercase tracking-wide text-slate-600 sm:p-3 sm:text-sm">Officer</TableHead>
                      <TableHead className="w-1/4 whitespace-nowrap p-2 text-xs font-semibold uppercase tracking-wide text-slate-600 sm:p-3 sm:text-sm">Holiday Date</TableHead>
                      <TableHead className="hidden p-2 text-xs font-semibold uppercase tracking-wide text-slate-600 sm:table-cell sm:p-3 sm:text-sm">Authorising Manager</TableHead>
                      <TableHead className="w-1/4 p-2 text-xs font-semibold uppercase tracking-wide text-slate-600 sm:p-3 sm:text-sm">Status</TableHead>
                      <TableHead className="w-[100px] p-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 sm:p-3 sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <LoadingRow />
                    ) : (
                      <>
                        {paginatedHolidays.map((holiday) => (
                          <TableRow key={holiday.id} className="odd:bg-white even:bg-slate-50/30 hover:bg-purple-50/40">
                            <TableCell className="max-w-[80px] truncate p-2 text-xs font-semibold text-slate-800 sm:max-w-[120px] sm:p-3 sm:text-sm">
                              {holiday.officerName}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm p-2 sm:p-3 whitespace-nowrap">
                              {formatDisplayDate(holiday.holidayDate)}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm p-2 sm:p-3 hidden sm:table-cell truncate max-w-[120px]">
                              {holiday.authorisedByName ?? '—'}
                            </TableCell>
                            <TableCell className="p-2 sm:p-3">
                              <MemoizedStatusBadge status={holiday.status} />
                            </TableCell>
                            <TableCell className="p-1 sm:p-2">
                              <MemoizedActionButtons
                                holiday={holiday}
                                canEdit={canMutateBankHoliday(holiday)}
                                canDelete={canMutateBankHoliday(holiday)}
                                canArchive={hasBankHolidayManagementAccess}
                                onEdit={handleEditHoliday}
                                onView={handleViewHoliday}
                                onDelete={handleDelete}
                                onArchive={handleArchive}
                                onUnarchive={handleUnarchive}
                              />
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
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredHolidays.length > 0 && (
                <BankHolidayPaginationBar
                  currentPage={currentPage}
                  totalPages={displayTotalPages}
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
            <DialogTitle className="text-lg">Bank Holiday Details</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              View or manage the bank holiday request details below.
            </DialogDescription>
          </DialogHeader>

          {viewingHoliday && (
            <div className="space-y-3 sm:space-y-4">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground">Officer</div>
                      <div className="text-sm sm:text-base font-semibold">{viewingHoliday.officerName}</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground">Bank Holiday Date</div>
                      <div className="text-sm sm:text-base font-semibold">{format(toDate(viewingHoliday.holidayDate), 'dd MMM yyyy')}</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground">Date of Request</div>
                      <div className="text-sm sm:text-base font-semibold">{format(toDate(viewingHoliday.dateOfRequest), 'dd MMM yyyy')}</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground">Authorised By</div>
                      <div className="text-sm sm:text-base font-semibold">{viewingHoliday.authorisedByName ?? 'Pending assignment'}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground">Authorization Status</div>
                      <div className="flex items-center gap-2">
                        <MemoizedStatusBadge status={viewingHoliday.status} />
                        {viewingHoliday.dateAuthorised && (
                          <span className="text-xs sm:text-sm">{format(toDate(viewingHoliday.dateAuthorised), 'dd MMM yyyy')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Approval/Denial Section */}
              {hasBankHolidayManagementAccess && viewingHoliday.status === 'pending' && (
                <div className="border-t border-gray-200 pt-3 xs:pt-4 mt-3 xs:mt-4">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 xs:mb-3">Approval Decision</h3>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);
                    const decision = formData.get('decision') as 'authorized' | 'declined';
                    const reason = formData.get('reason') as string;
                    const authorisedByEmployeeIdValue = formData.get('authorisedByEmployeeId') as string;
                    const authorisedByEmployeeId = authorisedByEmployeeIdValue ? Number(authorisedByEmployeeIdValue) : undefined;
                    const dateAuthorised = formData.get('dateAuthorised') as string;
                    
                    if (decision && reason && authorisedByEmployeeId && dateAuthorised && viewingHoliday) {
                      try {
                        await bankHolidayService.updateBankHoliday(viewingHoliday.id, {
                          status: decision,
                          authorisedByEmployeeId,
                          dateAuthorised: new Date(dateAuthorised).toISOString(),
                          reason
                        });
                        
                        await fetchHolidays();
                        
                        toast({
                          title: "Success",
                          description: `Bank holiday request ${decision === 'authorized' ? 'approved' : 'declined'} successfully.`,
                        });
                        
                        setIsViewDialogOpen(false);
                        setViewingHoliday(null);
                      } catch (error) {
                        console.error('Error updating bank holiday request:', error);
                        toast({
                          title: "Error",
                          description: "Failed to update bank holiday request. Please try again.",
                          variant: "destructive"
                        });
                      }
                    } else {
                      toast({
                        title: "Error",
                        description: "Please fill in all required fields, including the authorising manager.",
                        variant: "destructive"
                      });
                    }
                  }} className="space-y-4">
                    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/40 p-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <label className="text-xs sm:text-sm font-medium text-slate-700">Decision</label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="decision"
                              value="authorized"
                              id="approve"
                              className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                              required
                            />
                            <span className="ml-2 text-xs sm:text-sm text-gray-700">Approve</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="decision"
                              value="declined"
                              id="deny"
                              className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                              required
                            />
                            <span className="ml-2 text-xs sm:text-sm text-gray-700">Deny</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="reason" className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">
                          Reason
                        </label>
                        <textarea
                          id="reason"
                          name="reason"
                          rows={3}
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                          placeholder="Provide a reason for your decision..."
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-lg border border-slate-200 p-3">
                      <h4 className="text-xs sm:text-sm font-medium text-slate-800">Authorisation Details</h4>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label htmlFor="authorisedByEmployeeId" className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">
                            Authorised By
                          </label>
                          <select
                            id="authorisedByEmployeeId"
                            name="authorisedByEmployeeId"
                            className="h-9 w-full rounded-md border border-slate-300 bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            required
                            defaultValue=""
                            disabled={isApproverLoading || approverOptions.length === 0}
                          >
                            <option value="" disabled>Select manager or administrator</option>
                            {approverOptions.map((approver) => (
                              <option
                                key={approver.userId}
                                value={approver.employeeId ? String(approver.employeeId) : `unlinked-${approver.userId}`}
                                disabled={!approver.employeeId}
                              >
                                {approver.label}{!approver.employeeId ? ' (no employee profile linked)' : ''}
                              </option>
                            ))}
                          </select>
                          {approverOptions.length === 0 && !isApproverLoading && (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              No manager/administrator users were found.
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="dateAuthorised" className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">
                            Date Authorised
                          </label>
                          <div className="relative">
                            <Input
                              type="date"
                              id="dateAuthorised"
                              name="dateAuthorised"
                              className="h-9 border-slate-300 pl-8 text-sm"
                              defaultValue={format(new Date(), "yyyy-MM-dd")}
                              required
                            />
                            <Calendar className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        type="button"
                        onClick={() => setIsViewDialogOpen(false)} 
                        className="text-xs sm:text-sm h-8 sm:h-9"
                        size="sm"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="text-xs sm:text-sm h-8 sm:h-9"
                        size="sm"
                      >
                        Submit Decision
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {(!hasBankHolidayManagementAccess && viewingHoliday.status === 'pending') && (
                <div className="border-t border-gray-200 pt-3 text-xs text-muted-foreground">
                  This request is pending approval. A manager or administrator will review it.
                </div>
              )}

              {viewingHoliday.status !== 'pending' && (
                <>
                  {viewingHoliday.reason && (
                    <div className="border-t border-gray-200 pt-3 xs:pt-4 mt-3 xs:mt-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Manager's Comment</h3>
                      <p className="text-xs sm:text-sm text-gray-600 bg-muted/20 p-2 sm:p-3 rounded-md">
                        {viewingHoliday.reason}
                      </p>
                    </div>
                  )}
                  <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3 sm:justify-end pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsViewDialogOpen(false)} 
                      className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                      size="sm"
                    >
                      Close
                    </Button>
                    {canMutateBankHoliday(viewingHoliday) ? (
                      <Button 
                        onClick={() => {
                          const toEdit = viewingHoliday;
                          setIsViewDialogOpen(false);
                          setViewingHoliday(null);
                          setEditingHoliday(toEdit);
                          setIsDialogOpen(true);
                        }}
                        className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                        size="sm"
                      >
                        Edit
                      </Button>
                    ) : null}
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
