import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  PoundSterling, 
  Calendar,
  Car,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  User
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Types
interface ExpenseEntry {
  day: string;
  date: string;
  sitePostcode: string;
  mileage: number;
  busRailFare: number;
  carShare: boolean;
}

interface ExpenseClaim {
  id: string;
  officerName: string;
  homePostcode: string;
  weekNumber: number;
  wcDate: string; // Week Commencing Date
  entries: ExpenseEntry[];
  totalMilesClaimed: number;
  totalExpensesClaim: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Constants
const DEFAULT_ENTRY: ExpenseEntry = {
  day: '',
  date: '',
  sitePostcode: '',
  mileage: 0,
  busRailFare: 0,
  carShare: false
};

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const MILEAGE_RATE = 0.25;
const FREE_MILEAGE_ALLOWANCE = 25;

// Mock data for initial page load
const MOCK_EXPENSE_CLAIMS: ExpenseClaim[] = [
  {
    id: "1",
    officerName: "John Smith",
    homePostcode: "M1 1AA",
    weekNumber: 23,
    wcDate: "2023-06-05",
    entries: [
      { day: "Monday", date: "2023-06-05", sitePostcode: "M15 6BH", mileage: 45, busRailFare: 0, carShare: false },
      { day: "Tuesday", date: "2023-06-06", sitePostcode: "M15 6BH", mileage: 42, busRailFare: 0, carShare: true },
      { day: "Wednesday", date: "2023-06-07", sitePostcode: "M3 3JL", mileage: 38, busRailFare: 0, carShare: false },
      { day: "Thursday", date: "2023-06-08", sitePostcode: "M3 3JL", mileage: 38, busRailFare: 0, carShare: false },
      { day: "Friday", date: "2023-06-09", sitePostcode: "M15 6BH", mileage: 43, busRailFare: 0, carShare: true },
      { day: "Saturday", date: "2023-06-10", sitePostcode: "", mileage: 0, busRailFare: 0, carShare: false },
      { day: "Sunday", date: "2023-06-11", sitePostcode: "", mileage: 0, busRailFare: 0, carShare: false },
    ],
    totalMilesClaimed: 206,
    totalExpensesClaim: 45.25,
    submittedAt: "2023-06-12T09:30:00Z",
    status: "approved"
  },
  {
    id: "2",
    officerName: "Sarah Johnson",
    homePostcode: "M4 2BB",
    weekNumber: 24,
    wcDate: "2023-06-12",
    entries: [
      { day: "Monday", date: "2023-06-12", sitePostcode: "M20 4BX", mileage: 28, busRailFare: 0, carShare: false },
      { day: "Tuesday", date: "2023-06-13", sitePostcode: "M20 4BX", mileage: 28, busRailFare: 0, carShare: false },
      { day: "Wednesday", date: "2023-06-14", sitePostcode: "SK1 3GF", mileage: 0, busRailFare: 5.60, carShare: false },
      { day: "Thursday", date: "2023-06-15", sitePostcode: "SK1 3GF", mileage: 0, busRailFare: 5.60, carShare: false },
      { day: "Friday", date: "2023-06-16", sitePostcode: "M20 4BX", mileage: 28, busRailFare: 0, carShare: false },
      { day: "Saturday", date: "2023-06-17", sitePostcode: "", mileage: 0, busRailFare: 0, carShare: false },
      { day: "Sunday", date: "2023-06-18", sitePostcode: "", mileage: 0, busRailFare: 0, carShare: false },
    ],
    totalMilesClaimed: 84,
    totalExpensesClaim: 22.20,
    submittedAt: "2023-06-19T14:15:00Z",
    status: "pending"
  },
  {
    id: "3",
    officerName: "David Wilson",
    homePostcode: "M16 8FH",
    weekNumber: 25,
    wcDate: "2023-06-19",
    entries: [
      { day: "Monday", date: "2023-06-19", sitePostcode: "M8 5SR", mileage: 15, busRailFare: 0, carShare: true },
      { day: "Tuesday", date: "2023-06-20", sitePostcode: "M8 5SR", mileage: 15, busRailFare: 0, carShare: true },
      { day: "Wednesday", date: "2023-06-21", sitePostcode: "M8 5SR", mileage: 15, busRailFare: 0, carShare: false },
      { day: "Thursday", date: "2023-06-22", sitePostcode: "M16 0DR", mileage: 8, busRailFare: 0, carShare: false },
      { day: "Friday", date: "2023-06-23", sitePostcode: "M16 0DR", mileage: 8, busRailFare: 0, carShare: false },
      { day: "Saturday", date: "2023-06-24", sitePostcode: "", mileage: 0, busRailFare: 0, carShare: false },
      { day: "Sunday", date: "2023-06-25", sitePostcode: "", mileage: 0, busRailFare: 0, carShare: false },
    ],
    totalMilesClaimed: 61,
    totalExpensesClaim: 0,
    submittedAt: "2023-06-26T10:20:00Z",
    status: "rejected"
  }
];

// Component for page header
const PageHeader = ({ onAddClick }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
    <div className="flex items-center gap-2 md:gap-4">
      <div className="bg-blue-100 p-2 rounded-lg">
        <PoundSterling className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
      </div>
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Officer Expenses</h1>
        <p className="text-sm text-gray-500">Manage and submit expense claims</p>
      </div>
    </div>
    <Button
      onClick={onAddClick}
      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 h-9 md:h-10"
    >
      <Plus className="w-4 h-4" />
      Add New Claim
    </Button>
  </div>
);

// Component for stats card
const StatsCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: {
      bg: "bg-gradient-to-br from-blue-800 to-blue-900",
      border: "border-blue-700",
      iconBg: "bg-blue-700/50"
    },
    green: {
      bg: "bg-gradient-to-br from-green-800 to-green-900",
      border: "border-green-700",
      iconBg: "bg-green-700/50"
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-800 to-purple-900",
      border: "border-purple-700",
      iconBg: "bg-purple-700/50"
    }
  };
  
  const colorStyle = colors[color];
  
  return (
    <Card className={`${colorStyle.bg} ${colorStyle.border} border h-full`}>
      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs md:text-sm font-medium text-white truncate pr-2">{title}</p>
          <div className={`${colorStyle.iconBg} p-1.5 rounded-full shrink-0`}>
            {React.cloneElement(icon, { className: "h-4 w-4 text-white" })}
          </div>
        </div>
        <div className="flex items-baseline gap-1 overflow-hidden">
          <p className="text-base sm:text-lg md:text-2xl font-bold text-white truncate">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
      </div>
    </Card>
  );
};

// Component for table actions
const TableActions = ({ onEdit, onDelete }) => (
  <div className="flex items-center justify-end gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={onEdit}
      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
    >
      <Edit2 className="w-4 h-4" />
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={onDelete}
      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  </div>
);

// Component for a form field with label
const FormField = ({ label, children }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {children}
  </div>
);

// Utility function to calculate totals
const calculateTotals = (entries) => {
  const totalMiles = entries.reduce((sum, entry) => sum + (entry.mileage || 0), 0);
  const totalExpenses = entries.reduce((sum, entry) => {
    const mileageExpense = Math.max(0, (entry.mileage - FREE_MILEAGE_ALLOWANCE)) * MILEAGE_RATE;
    const busRailExpense = entry.busRailFare || 0;
    return sum + mileageExpense + busRailExpense;
  }, 0);
  return { totalMiles, totalExpenses };
};

// Component for empty state
const EmptyState = ({ onAddClick }) => (
  <TableRow>
    <TableCell colSpan={6} className="text-center py-8">
      <p className="text-gray-500">No expense claims found</p>
      <Button
        variant="link"
        onClick={onAddClick}
        className="text-blue-600 hover:text-blue-700 mt-2"
      >
        Submit your first claim
      </Button>
    </TableCell>
  </TableRow>
);

const OfficerExpensesPage: React.FC = () => {
  // CSS for custom date input styling
  const dateInputStyles = `
    /* Ensure date inputs display correctly across browsers */
    .date-input::-webkit-calendar-picker-indicator {
      background: transparent;
      bottom: 0;
      color: transparent;
      cursor: pointer;
      height: auto;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
      width: auto;
    }
    
    .date-input::-webkit-datetime-edit-fields-wrapper {
      padding: 0;
    }
    
    /* Custom grid for expense form */
    .expense-grid {
      display: grid;
      grid-template-columns: minmax(24px, 0.5fr) minmax(80px, 2fr) minmax(55px, 1.5fr) minmax(60px, 1.75fr) minmax(60px, 1.75fr) minmax(20px, 0.5fr);
      gap: 0.25rem;
      padding-right: 0.5rem;
    }
    
    @media (max-width: 375px) {
      .expense-grid {
        grid-template-columns: minmax(20px, 0.3fr) minmax(70px, 1.7fr) minmax(50px, 1.3fr) minmax(55px, 1.5fr) minmax(55px, 1.5fr) minmax(20px, 0.3fr);
        gap: 0.2rem;
      }
    }
  `;
  
  // State
  const [claims, setClaims] = useState<ExpenseClaim[]>(MOCK_EXPENSE_CLAIMS);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null);
  const [editingClaim, setEditingClaim] = useState<ExpenseClaim | null>(null);
  const [formData, setFormData] = useState({
    officerName: '',
    homePostcode: '',
    weekNumber: 1,
    wcDate: '',
    entries: DAYS_OF_WEEK.map(day => ({ ...DEFAULT_ENTRY, day }))
  });

  // Event handlers
  const handleSubmit = useCallback(async () => {
    const { totalMiles, totalExpenses } = calculateTotals(formData.entries);
    
    if (editingClaim) {
      // Update existing claim
      const updatedClaim: ExpenseClaim = {
        ...editingClaim,
        officerName: formData.officerName,
        homePostcode: formData.homePostcode,
        weekNumber: formData.weekNumber,
        wcDate: formData.wcDate,
        entries: formData.entries,
        totalMilesClaimed: totalMiles,
        totalExpensesClaim: totalExpenses,
      };

      setClaims(prev => prev.map(claim => 
        claim.id === editingClaim.id ? updatedClaim : claim
      ));
    } else {
      // Create new claim
      const newClaim: ExpenseClaim = {
        id: (claims.length + 1).toString(),
        officerName: formData.officerName,
        homePostcode: formData.homePostcode,
        weekNumber: formData.weekNumber,
        wcDate: formData.wcDate,
        entries: formData.entries,
        totalMilesClaimed: totalMiles,
        totalExpensesClaim: totalExpenses,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };

      // Send email notification
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: 'control.room@advantage1.co.uk',
            subject: `Expenses for ${formData.officerName}`,
            html: `
              <h2>New Expense Claim Submitted</h2>
              <p><strong>Officer:</strong> ${formData.officerName}</p>
              <p><strong>Week Number:</strong> ${formData.weekNumber}</p>
              <p><strong>Week Commencing:</strong> ${formData.wcDate}</p>
              <p><strong>Total Miles:</strong> ${totalMiles}</p>
              <p><strong>Total Expenses:</strong> £${totalExpenses.toFixed(2)}</p>
            `
          }),
        });
      } catch (error) {
        console.error('Failed to send email notification:', error);
      }

      setClaims(prev => [newClaim, ...prev]);
    }

    resetForm();
  }, [formData, claims, editingClaim]);

  const handleDelete = useCallback(() => {
    if (!selectedClaim) return;
    
    setClaims(prev => prev.filter(claim => claim.id !== selectedClaim.id));
    setShowDeleteDialog(false);
    setSelectedClaim(null);
  }, [selectedClaim]);

  const handleEntryChange = useCallback((index: number, field: keyof ExpenseEntry, value: any) => {
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  }, []);

  const handleEdit = useCallback((claim: ExpenseClaim) => {
    setEditingClaim(claim);
    setFormData({
      officerName: claim.officerName,
      homePostcode: claim.homePostcode,
      weekNumber: claim.weekNumber,
      wcDate: claim.wcDate,
      entries: claim.entries
    });
    setShowAddDialog(true);
  }, []);
  
  const resetForm = useCallback(() => {
    setShowAddDialog(false);
    setEditingClaim(null);
    setFormData({
      officerName: '',
      homePostcode: '',
      weekNumber: 1,
      wcDate: '',
      entries: DAYS_OF_WEEK.map(day => ({ ...DEFAULT_ENTRY, day }))
    });
  }, []);

  // Stats calculations
  const totalClaims = claims.length;
  const totalMiles = claims.reduce((sum, claim) => sum + claim.totalMilesClaimed, 0);
  const totalExpenses = claims.reduce((sum, claim) => sum + claim.totalExpensesClaim, 0);

  // Formatted values for display
  const formattedExpenses = `£${totalExpenses.toFixed(2)}`;

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <style>{dateInputStyles}</style>
      <div className="container mx-auto p-2 md:p-4 lg:p-6 max-w-[1400px]">
        {/* Header Section */}
        <PageHeader onAddClick={() => setShowAddDialog(true)} />

        {/* Stats Cards Row - Full Width */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
          <StatsCard 
            title="Total Claims" 
            value={totalClaims} 
            icon={<FileSpreadsheet />}
            color="blue"
          />
          <StatsCard 
            title="Total Miles" 
            value={totalMiles} 
            icon={<Car />}
            color="green"
          />
          <StatsCard 
            title="Expenses" 
            value={formattedExpenses} 
            icon={<PoundSterling />}
            color="purple"
          />
        </div>

        {/* Claims Table with responsive handling */}
        <Card className="w-full overflow-hidden">
          <CardHeader className="p-2 md:p-4">
            <CardTitle className="text-base md:text-xl flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              Expense Claims
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              View and manage your expense claims
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto min-w-[320px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-900 p-2 md:p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        Officer
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 p-2 md:p-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        Week
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 p-2 md:p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-gray-500" />
                        Miles
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 p-2 md:p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <PoundSterling className="w-4 h-4 text-gray-500" />
                        Total
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 p-2 md:p-4 hidden md:table-cell">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900 text-right p-2 md:p-4 w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.length > 0 ? (
                    claims.map((claim) => (
                      <TableRow 
                        key={claim.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900 p-2 md:p-4 max-w-[120px] truncate">
                          {claim.officerName}
                        </TableCell>
                        <TableCell className="text-gray-600 p-2 md:p-4 hidden sm:table-cell">
                          {new Date(claim.wcDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </TableCell>
                        <TableCell className="p-2 md:p-4">{claim.totalMilesClaimed}</TableCell>
                        <TableCell className="p-2 md:p-4">£{claim.totalExpensesClaim.toFixed(2)}</TableCell>
                        <TableCell className="p-2 md:p-4 hidden md:table-cell">
                          <Badge 
                            className={
                              claim.status === 'approved' 
                                ? 'bg-green-100 text-green-700'
                                : claim.status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }
                          >
                            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right p-0 md:p-2 w-[80px]">
                          <div className="flex items-center justify-end gap-1 md:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(claim)}
                              className="h-7 w-7 md:h-8 md:w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 p-0 flex items-center justify-center"
                            >
                              <Edit2 className="h-3 w-3 md:h-4 md:w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedClaim(claim);
                                setShowDeleteDialog(true);
                              }}
                              className="h-7 w-7 md:h-8 md:w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 p-0 flex items-center justify-center"
                            >
                              <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <EmptyState onAddClick={() => setShowAddDialog(true)} />
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Claim Dialog - Responsive improvements */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="w-[95%] sm:w-[95%] md:max-w-[95vw] lg:max-w-[1200px] max-h-[95vh] overflow-hidden p-0">
          <div className="flex flex-col lg:flex-row h-full max-h-[95vh]">
            {/* Mobile/Tablet View improvements */}
            <div className="block lg:hidden w-full flex flex-col h-full max-h-[95vh] overflow-y-auto">
              {/* Header with buttons */}
              <div className="p-1 sm:p-2 border-b border-gray-200 bg-gray-50 sticky top-0 z-30 flex items-center justify-between">
                <DialogTitle className="text-sm md:text-base">
                  {editingClaim ? 'Edit Claim' : 'New Claim'}
                </DialogTitle>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAddDialog(false)}
                  className="text-[10px] md:text-sm h-7 md:h-8 px-1.5 sm:px-2"
                  size="sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  <span className="sr-only">Close</span>
                </Button>
              </div>

              {/* Claim details section - improved spacing for small screens */}
              <div className="p-2 md:p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-[11px] xs:text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">Claim Details</h3>
                
                <div className="space-y-2 md:space-y-4">
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 md:gap-3">
                    <FormField label="Officer Name">
                      <Input
                        value={formData.officerName}
                        onChange={(e) => setFormData(prev => ({ ...prev, officerName: e.target.value }))}
                        placeholder="Enter name"
                        className="border-gray-200 h-7 xs:h-8 md:h-9 text-[10px] xs:text-xs md:text-sm"
                      />
                    </FormField>
                    <FormField label="Home Postcode">
                      <Input
                        value={formData.homePostcode}
                        onChange={(e) => setFormData(prev => ({ ...prev, homePostcode: e.target.value }))}
                        placeholder="Enter postcode"
                        className="border-gray-200 h-7 xs:h-8 md:h-9 text-[10px] xs:text-xs md:text-sm"
                      />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 md:gap-3">
                    <FormField label="Week Number">
                      <Input
                        type="number"
                        min="1"
                        max="52"
                        value={formData.weekNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, weekNumber: parseInt(e.target.value) }))}
                        className="border-gray-200 h-7 xs:h-8 md:h-9 text-[10px] xs:text-xs md:text-sm"
                      />
                    </FormField>
                    <FormField label="From Date">
                      <Input
                        type="date"
                        value={formData.wcDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, wcDate: e.target.value }))}
                        className="border-gray-200 h-7 xs:h-8 md:h-9 text-[10px] xs:text-xs md:text-sm date-input"
                      />
                    </FormField>
                  </div>
                  <div className="bg-white rounded-md border border-gray-200 p-1.5 xs:p-2 md:p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-gray-500 text-[9px] xs:text-xs">Miles</Label>
                        <p className="text-xs xs:text-sm font-bold text-gray-900">
                          {calculateTotals(formData.entries).totalMiles.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500 text-[9px] xs:text-xs">Expenses</Label>
                        <p className="text-xs xs:text-sm font-bold text-green-600">
                          £{calculateTotals(formData.entries).totalExpenses.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Expenses section - optimized for very small screens */}
              <div className="p-2 pr-2 sm:p-3 sm:pr-5 bg-white border-b border-gray-200">
                <h3 className="text-[11px] xs:text-xs font-medium text-gray-700 mb-2 sm:mb-3 pl-1">Daily Expenses</h3>
                
                {/* Header row - reduced text size for very small screens */}
                <div className="expense-grid mb-1 sm:mb-3 px-1 sm:px-2">
                  <div className="font-medium text-[9px] xs:text-xs text-gray-500">Day</div>
                  <div className="font-medium text-[9px] xs:text-xs text-gray-500">Date</div>
                  <div className="font-medium text-[9px] xs:text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-2 h-2 xs:w-3 xs:h-3 text-gray-400" />
                    <span className="hidden xs:inline">Post</span>
                  </div>
                  <div className="font-medium text-[9px] xs:text-xs text-gray-500 flex items-center justify-center">
                    <Car className="w-2 h-2 xs:w-3 xs:h-3 text-gray-400" />
                    <span className="hidden xs:inline ml-1">Mi</span>
                  </div>
                  <div className="font-medium text-[9px] xs:text-xs text-gray-500 flex items-center justify-center">
                    <PoundSterling className="w-2 h-2 xs:w-3 xs:h-3 text-gray-400" />
                    <span className="hidden xs:inline ml-1">£</span>
                  </div>
                  <div className="font-medium text-[9px] xs:text-xs text-gray-500 flex items-center justify-center">
                    👥
                  </div>
                </div>
                
                {/* Daily expense rows - optimized for very small screens */}
                <div className="space-y-1.5 sm:space-y-4 px-1 sm:px-2 pb-16">
                  {formData.entries.map((entry, index) => (
                    <div key={entry.day} className="expense-grid p-1 xs:p-2 sm:p-3 bg-gray-50 rounded-md border border-gray-200 shadow-sm">
                      <div className="flex items-center">
                        <span className="text-[9px] xs:text-xs font-semibold text-gray-700">{entry.day.slice(0, 2)}</span>
                      </div>
                      <div>
                        <Input
                          type="date"
                          value={entry.date}
                          onChange={(e) => handleEntryChange(index, 'date', e.target.value)}
                          className="border-gray-200 h-6 xs:h-7 sm:h-9 text-[9px] xs:text-xs w-full date-input p-0.5 xs:p-1 sm:p-2"
                          placeholder="Date"
                        />
                      </div>
                      <div>
                        <Input
                          value={entry.sitePostcode}
                          onChange={(e) => handleEntryChange(index, 'sitePostcode', e.target.value)}
                          placeholder="Post"
                          className="border-gray-200 h-6 xs:h-7 sm:h-9 text-[9px] xs:text-xs w-full p-0.5 xs:p-1 sm:p-2"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          min="0"
                          value={entry.mileage}
                          onChange={(e) => handleEntryChange(index, 'mileage', parseInt(e.target.value))}
                          className="border-gray-200 h-6 xs:h-7 sm:h-9 text-[9px] xs:text-xs w-full text-center p-0.5 xs:p-1 sm:p-2"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={entry.busRailFare}
                          onChange={(e) => handleEntryChange(index, 'busRailFare', parseFloat(e.target.value))}
                          className="border-gray-200 h-6 xs:h-7 sm:h-9 text-[9px] xs:text-xs w-full text-center p-0.5 xs:p-1 sm:p-2"
                          placeholder="0"
                        />
                      </div>
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={entry.carShare}
                          onChange={(e) => handleEntryChange(index, 'carShare', e.target.checked)}
                          className="h-2.5 w-2.5 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 rounded border-gray-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Fixed Submit button for mobile - at the bottom of the form */}
              <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 p-2 md:p-3 z-20 shadow-md">
                <Button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full h-8 xs:h-9 md:h-10 text-[10px] xs:text-xs sm:text-sm font-medium"
                  disabled={!formData.officerName || !formData.homePostcode || !formData.wcDate}
                >
                  Submit Claim
                </Button>
              </div>
            </div>

            {/* Desktop Only: Left Panel - improved layout */}
            <div className="hidden lg:block lg:w-1/3 bg-gray-50 p-4 border-r border-gray-200 overflow-y-auto max-h-[95vh]">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-lg">
                  {editingClaim ? 'Edit Claim' : 'New Claim'}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Enter details for expense claim
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm">Details</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <FormField label="Officer Name">
                      <Input
                        value={formData.officerName}
                        onChange={(e) => setFormData(prev => ({ ...prev, officerName: e.target.value }))}
                        placeholder="Enter name"
                        className="border-gray-300 h-9 text-sm"
                      />
                    </FormField>
                    <FormField label="Home Postcode">
                      <Input
                        value={formData.homePostcode}
                        onChange={(e) => setFormData(prev => ({ ...prev, homePostcode: e.target.value }))}
                        placeholder="Enter postcode"
                        className="border-gray-300 h-9 text-sm"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm">Week</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <FormField label="Week Number">
                      <Input
                        type="number"
                        min="1"
                        max="52"
                        value={formData.weekNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, weekNumber: parseInt(e.target.value) }))}
                        className="border-gray-300 h-9 text-sm"
                      />
                    </FormField>
                    <FormField label="From Date">
                      <Input
                        type="date"
                        value={formData.wcDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, wcDate: e.target.value }))}
                        className="border-gray-300 h-9 text-sm"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-gray-500 text-xs">Miles</Label>
                        <p className="text-base font-bold text-gray-900">
                          {calculateTotals(formData.entries).totalMiles.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500 text-xs">Expenses</Label>
                        <p className="text-base font-bold text-green-600">
                          £{calculateTotals(formData.entries).totalExpenses.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                    disabled={!formData.officerName || !formData.homePostcode || !formData.wcDate}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>

            {/* Desktop Only: Right Panel - improved spacing */}
            <div className="hidden lg:flex lg:flex-col lg:flex-1 h-full overflow-hidden max-h-[95vh]">
              <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Daily Expenses</h2>
                    <p className="text-sm text-gray-500">Enter expenses for each day</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-gray-50 z-10">
                        <TableRow>
                          <TableHead className="font-semibold text-sm text-gray-900 p-3 w-[80px]">
                            Day
                          </TableHead>
                          <TableHead className="font-semibold text-sm text-gray-900 p-3 w-[150px]">
                            Date
                          </TableHead>
                          <TableHead className="font-semibold text-sm text-gray-900 p-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              Site Postcode
                            </div>
                          </TableHead>
                          <TableHead className="font-semibold text-sm text-gray-900 p-3 w-[100px]">
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-gray-500" />
                              Mileage
                            </div>
                          </TableHead>
                          <TableHead className="font-semibold text-sm text-gray-900 p-3 w-[100px]">
                            <div className="flex items-center gap-2">
                              <PoundSterling className="w-4 h-4 text-gray-500" />
                              Fare
                            </div>
                          </TableHead>
                          <TableHead className="font-semibold text-sm text-gray-900 text-center p-3 w-[80px]">
                            Car Share
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.entries.map((entry, index) => (
                          <TableRow key={entry.day} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-sm p-3">
                              {entry.day.slice(0, 3)}
                            </TableCell>
                            <TableCell className="p-3">
                              <Input
                                type="date"
                                value={entry.date}
                                onChange={(e) => handleEntryChange(index, 'date', e.target.value)}
                                className="border-gray-300 h-9 text-sm w-full"
                              />
                            </TableCell>
                            <TableCell className="p-3">
                              <Input
                                value={entry.sitePostcode}
                                onChange={(e) => handleEntryChange(index, 'sitePostcode', e.target.value)}
                                placeholder="Enter postcode"
                                className="border-gray-300 h-9 text-sm font-medium text-gray-900 placeholder:text-gray-400 w-full"
                              />
                            </TableCell>
                            <TableCell className="p-3">
                              <Input
                                type="number"
                                min="0"
                                value={entry.mileage}
                                onChange={(e) => handleEntryChange(index, 'mileage', parseInt(e.target.value))}
                                className="border-gray-300 h-9 text-sm font-medium text-gray-900 w-full"
                                placeholder="0"
                              />
                            </TableCell>
                            <TableCell className="p-3">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={entry.busRailFare}
                                onChange={(e) => handleEntryChange(index, 'busRailFare', parseFloat(e.target.value))}
                                className="border-gray-300 h-9 text-sm font-medium text-gray-900 w-full"
                                placeholder="0.00"
                              />
                            </TableCell>
                            <TableCell className="text-center p-3">
                              <input
                                type="checkbox"
                                checked={entry.carShare}
                                onChange={(e) => handleEntryChange(index, 'carShare', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="w-[calc(100%-32px)] max-w-[500px] p-2 md:p-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base md:text-lg">Delete Expense Claim</AlertDialogTitle>
            <AlertDialogDescription className="text-xs md:text-sm">
              Are you sure you want to delete this expense claim? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel 
              onClick={() => setShowDeleteDialog(false)}
              className="w-full sm:w-auto h-9 md:h-10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white h-9 md:h-10"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OfficerExpensesPage;
