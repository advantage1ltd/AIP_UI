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
  Mail,
  FileSpreadsheet,
  User
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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

const defaultEntry: ExpenseEntry = {
  day: '',
  date: '',
  sitePostcode: '',
  mileage: 0,
  busRailFare: 0,
  carShare: false
};

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const OfficerExpensesPage: React.FC = () => {
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null);
  const [editingClaim, setEditingClaim] = useState<ExpenseClaim | null>(null);
  const [formData, setFormData] = useState({
    officerName: '',
    homePostcode: '',
    weekNumber: 1,
    wcDate: '',
    entries: daysOfWeek.map(day => ({ ...defaultEntry, day }))
  });

  const calculateTotals = (entries: ExpenseEntry[]) => {
    const totalMiles = entries.reduce((sum, entry) => sum + (entry.mileage || 0), 0);
    const totalExpenses = entries.reduce((sum, entry) => {
      const mileageExpense = Math.max(0, (entry.mileage - 25)) * 0.25; // £0.25 per mile after 25 miles
      const busRailExpense = entry.busRailFare || 0;
      return sum + mileageExpense + busRailExpense;
    }, 0);
    return { totalMiles, totalExpenses };
  };

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

    setShowAddDialog(false);
    setEditingClaim(null);
    setFormData({
      officerName: '',
      homePostcode: '',
      weekNumber: 1,
      wcDate: '',
      entries: daysOfWeek.map(day => ({ ...defaultEntry, day }))
    });
  }, [formData, claims, editingClaim]);

  const handleDelete = useCallback(() => {
    if (!selectedClaim) return;
    
    setClaims(prev => prev.filter(claim => claim.id !== selectedClaim.id));
    setShowDeleteDialog(false);
    setSelectedClaim(null);
  }, [selectedClaim]);

  const handleEntryChange = (index: number, field: keyof ExpenseEntry, value: any) => {
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const handleEdit = (claim: ExpenseClaim) => {
    setEditingClaim(claim);
    setFormData({
      officerName: claim.officerName,
      homePostcode: claim.homePostcode,
      weekNumber: claim.weekNumber,
      wcDate: claim.wcDate,
      entries: claim.entries
    });
    setShowAddDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <PoundSterling className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Officer Expenses</h1>
              <p className="text-gray-500">Manage and submit expense claims</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Claim
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Total Claims</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{claims.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Total Miles</CardTitle>
              <Car className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {claims.reduce((sum, claim) => sum + claim.totalMilesClaimed, 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Total Expenses</CardTitle>
              <PoundSterling className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">
                £{claims.reduce((sum, claim) => sum + claim.totalExpensesClaim, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              Expense Claims
            </CardTitle>
            <CardDescription>
              View and manage your expense claims
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        Officer Name
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        Week Commencing
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-gray-500" />
                        Total Miles
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <PoundSterling className="w-4 h-4 text-gray-500" />
                        Total Expenses
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow 
                      key={claim.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-900">
                        {claim.officerName}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(claim.wcDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{claim.totalMilesClaimed}</TableCell>
                      <TableCell>£{claim.totalExpensesClaim.toFixed(2)}</TableCell>
                      <TableCell>
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(claim)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedClaim(claim);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {claims.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-gray-500">No expense claims found</p>
                        <Button
                          variant="link"
                          onClick={() => setShowAddDialog(true)}
                          className="text-blue-600 hover:text-blue-700 mt-2"
                        >
                          Submit your first claim
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add Claim Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
            <div className="flex h-full">
              {/* Left Panel - Basic Info */}
              <div className="w-1/3 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
                <DialogHeader className="pb-6">
                  <DialogTitle className="text-xl">
                    {editingClaim ? 'Edit Expense Claim' : 'New Expense Claim'}
                  </DialogTitle>
                  <DialogDescription>
                    Enter your basic information and weekly expenses
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Personal Details</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Officer Name</Label>
                        <Input
                          value={formData.officerName}
                          onChange={(e) => setFormData(prev => ({ ...prev, officerName: e.target.value }))}
                          placeholder="Enter your name"
                          className="border-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Home Postcode</Label>
                        <Input
                          value={formData.homePostcode}
                          onChange={(e) => setFormData(prev => ({ ...prev, homePostcode: e.target.value }))}
                          placeholder="Enter your postcode"
                          className="border-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Week Information</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Week Number</Label>
                        <Input
                          type="number"
                          min="1"
                          max="52"
                          value={formData.weekNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, weekNumber: parseInt(e.target.value) }))}
                          className="border-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Week Commencing Date</Label>
                        <Input
                          type="date"
                          value={formData.wcDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, wcDate: e.target.value }))}
                          className="border-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Summary</h3>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                      <div>
                        <Label className="text-gray-500">Total Miles</Label>
                        <p className="text-xl font-bold text-gray-900">
                          {calculateTotals(formData.entries).totalMiles}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Total Expenses</Label>
                        <p className="text-xl font-bold text-green-600">
                          £{calculateTotals(formData.entries).totalExpenses.toFixed(2)}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                          Mileage rate: £0.25 per mile (after first 25 miles)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Daily Entries */}
              <div className="flex-1 flex flex-col h-full">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Daily Expenses</h2>
                  <p className="text-sm text-gray-500">Enter your expenses for each day of the week</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold text-gray-900 w-[100px]">Day</TableHead>
                          <TableHead className="font-semibold text-gray-900 w-[180px]">Date</TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              Site Postcode
                            </div>
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-gray-500" />
                              Mileage
                            </div>
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            <div className="flex items-center gap-2">
                              <PoundSterling className="w-4 h-4 text-gray-500" />
                              Bus/Rail Fare
                            </div>
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900 text-center w-[120px]">Car Share</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.entries.map((entry, index) => (
                          <TableRow key={entry.day} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{entry.day}</TableCell>
                            <TableCell>
                              <Input
                                type="date"
                                value={entry.date}
                                onChange={(e) => handleEntryChange(index, 'date', e.target.value)}
                                className="border-gray-300"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="relative">
                                <Input
                                  value={entry.sitePostcode}
                                  onChange={(e) => handleEntryChange(index, 'sitePostcode', e.target.value)}
                                  placeholder="Enter postcode"
                                  className="border-gray-300 font-medium text-gray-900 placeholder:text-gray-400 w-full"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="relative">
                                <Input
                                  type="number"
                                  min="0"
                                  value={entry.mileage}
                                  onChange={(e) => handleEntryChange(index, 'mileage', parseInt(e.target.value))}
                                  className="border-gray-300 font-medium text-gray-900 w-full"
                                  placeholder="0"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="relative">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={entry.busRailFare}
                                  onChange={(e) => handleEntryChange(index, 'busRailFare', parseFloat(e.target.value))}
                                  className="border-gray-300 font-medium text-gray-900 w-full"
                                  placeholder="0.00"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
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

                <div className="p-4 border-t border-gray-200 bg-gray-50 ">
                  <div className="flex justify-end gap-4 px-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddDialog(false)}
                      className="px-8 font-medium"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-medium mb-10 "
                      disabled={!formData.officerName || !formData.homePostcode || !formData.wcDate}
                    >
                      Submit Claim
                    </Button>
                    
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Expense Claim</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this expense claim? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default OfficerExpensesPage;
