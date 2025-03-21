import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, PlusCircle } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ClipboardCheck, Users, BarChart } from "lucide-react";

// Mock data
const mockOfficers = [
  { id: "OFF001", name: "John Smith" },
  { id: "OFF002", name: "Sarah Johnson" },
  { id: "OFF003", name: "Michael Brown" },
  { id: "OFF004", name: "Emily Davis" },
  { id: "OFF005", name: "James Wilson" }
];

const mockCustomers = [
  { id: "CUS001", name: "Walmart Supercenter" },
  { id: "CUS002", name: "Target Corporation" },
  { id: "CUS003", name: "Costco Wholesale" },
  { id: "CUS004", name: "Home Depot" },
  { id: "CUS005", name: "Best Buy" }
];

const mockLocations = [
  { id: "LOC001", name: "New York City" },
  { id: "LOC002", name: "Los Angeles" },
  { id: "LOC003", name: "Chicago" },
  { id: "LOC004", name: "Houston" },
  { id: "LOC005", name: "Phoenix" }
];

interface EvaluationCriteria {
  id: string;
  title: string;
  maxScore: number;
}

const evaluationCriteria: EvaluationCriteria[] = [
  { 
    id: "location", 
    title: "Location of Officer: Officer should be in a highly prominent position. Reading newspapers or leaning over a section will reduce scores.", 
    maxScore: 5 
  },
  { 
    id: "security", 
    title: "Security Awareness: Officer should be alert and aware of those around. Talking unnecessarily to other members of staff will reduce scores.", 
    maxScore: 5 
  },
  { 
    id: "presentation", 
    title: "Presentation: Uniform worn must be relevant to the Site and circumstances; duties being carried out and weather conditions.", 
    maxScore: 7 
  },
  { 
    id: "license", 
    title: "ID and SIA License: SIA license should be displayed on all uniformed Officers", 
    maxScore: 3 
  },
  { 
    id: "customer", 
    title: "Acknowledging the Customer: The Officer should acknowledge you straight away and offer to help.", 
    maxScore: 5 
  },
  { 
    id: "courtesy", 
    title: "Courteous and polite: You should be dealt with in a professional manner.", 
    maxScore: 5 
  },
  { 
    id: "knowledge", 
    title: "Store/product knowledge: The Officer should have good knowledge of the store.", 
    maxScore: 5 
  },
  { 
    id: "professionalism", 
    title: "Query solution and overall professionalism: The Officer should ensure that someone solves your issue; involving other staff members if necessary.", 
    maxScore: 5 
  }
];

const defaultScores = evaluationCriteria.reduce((acc, criteria) => ({
  ...acc,
  [criteria.id]: { score: 0, comments: "" }
}), {});

// Form validation schema
const formSchema = z.object({
  officerId: z.string({
    required_error: "Please select an officer",
  }).refine((value) => {
    return mockOfficers.some(officer => officer.id === value);
  }, {
    message: "Please select a valid officer"
  }),
  customerName: z.string({
    required_error: "Please select a customer",
  }).refine((value) => {
    return mockCustomers.some(customer => customer.id === value);
  }, {
    message: "Please select a valid customer"
  }),
  location: z.string({
    required_error: "Please select a location",
  }).refine((value) => {
    return mockLocations.some(location => location.id === value);
  }, {
    message: "Please select a valid location"
  }),
  mysteryShopperName: z.string({
    required_error: "Mystery shopper name is required",
  }).min(2, "Name must be at least 2 characters")
   .max(50, "Name cannot exceed 50 characters")
   .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens and apostrophes"),
  date: z.date({
    required_error: "Please select a date",
  }).refine((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, {
    message: "Date cannot be in the past"
  }),
  time: z.string({
    required_error: "Please select a time",
  }).regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time"),
  scores: z.record(z.object({
    score: z.number({
      required_error: "Score is required",
    }).min(0, "Score must be positive").max(10, "Score cannot exceed maximum"),
    comments: z.string().optional(),
  })),
});

type FormValues = z.infer<typeof formSchema>;

// Mock data for initial evaluations
const mockEvaluations = [
  {
    id: "ev001",
    officerId: "OFF001",
    officerName: "John Smith",
    customerName: "Walmart Supercenter",
    locationName: "New York City",
    location: "LOC001",
    mysteryShopperName: "Emily Wilson",
    date: new Date(2023, 11, 15),
    time: "14:30",
    totalScore: 32,
    maxPossibleScore: 40,
    percentage: "80.0",
    createdAt: new Date(2023, 11, 15).toISOString(),
    updatedAt: new Date(2023, 11, 15).toISOString(),
    scores: {
      location: { score: 4, comments: "Officer was positioned well but occasionally distracted" },
      security: { score: 5, comments: "Excellent awareness of surroundings" },
      presentation: { score: 6, comments: "Uniform was clean and appropriate" },
      license: { score: 3, comments: "SIA license properly displayed" },
      customer: { score: 4, comments: "Greeted promptly but was finishing another task" },
      courtesy: { score: 4, comments: "Very polite and professional" },
      knowledge: { score: 3, comments: "Good knowledge but hesitated on a few specifics" },
      professionalism: { score: 3, comments: "Handled situation well overall" }
    }
  },
  {
    id: "ev002",
    officerId: "OFF003",
    officerName: "Michael Brown",
    customerName: "Target Corporation",
    locationName: "Los Angeles",
    location: "LOC002",
    mysteryShopperName: "Robert Johnson",
    date: new Date(2023, 11, 20),
    time: "10:15",
    totalScore: 35,
    maxPossibleScore: 40,
    percentage: "87.5",
    createdAt: new Date(2023, 11, 20).toISOString(),
    updatedAt: new Date(2023, 11, 20).toISOString(),
    scores: {
      location: { score: 5, comments: "Excellent positioning near entrance" },
      security: { score: 5, comments: "Very attentive to all customers" },
      presentation: { score: 6, comments: "Impeccable uniform" },
      license: { score: 3, comments: "SIA license visible and properly displayed" },
      customer: { score: 5, comments: "Immediate acknowledgment upon entry" },
      courtesy: { score: 4, comments: "Very professional demeanor" },
      knowledge: { score: 4, comments: "Knew all store policies and locations" },
      professionalism: { score: 3, comments: "Handled query efficiently" }
    }
  },
  {
    id: "ev003",
    officerId: "OFF002",
    officerName: "Sarah Johnson",
    customerName: "Costco Wholesale",
    locationName: "Chicago",
    location: "LOC003",
    mysteryShopperName: "Jessica Taylor",
    date: new Date(2023, 12, 5),
    time: "15:45",
    totalScore: 28,
    maxPossibleScore: 40,
    percentage: "70.0",
    createdAt: new Date(2023, 12, 5).toISOString(),
    updatedAt: new Date(2023, 12, 5).toISOString(),
    scores: {
      location: { score: 3, comments: "Positioned adequately but too near staff area" },
      security: { score: 3, comments: "Occasionally distracted by conversation with staff" },
      presentation: { score: 5, comments: "Uniform good but badge slightly obscured" },
      license: { score: 2, comments: "SIA license visible but not prominently displayed" },
      customer: { score: 3, comments: "Acknowledged after brief delay" },
      courtesy: { score: 4, comments: "Polite and helpful once engaged" },
      knowledge: { score: 4, comments: "Good knowledge of store layout and policies" },
      professionalism: { score: 4, comments: "Professional resolution of query" }
    }
  },
  {
    id: "ev004",
    officerId: "OFF005",
    officerName: "James Wilson",
    customerName: "Home Depot",
    locationName: "Houston",
    location: "LOC004",
    mysteryShopperName: "David Anderson",
    date: new Date(2024, 0, 10),
    time: "09:30",
    totalScore: 38,
    maxPossibleScore: 40,
    percentage: "95.0",
    createdAt: new Date(2024, 0, 10).toISOString(),
    updatedAt: new Date(2024, 0, 10).toISOString(),
    scores: {
      location: { score: 5, comments: "Perfect positioning with excellent visibility" },
      security: { score: 5, comments: "Highly alert and aware" },
      presentation: { score: 7, comments: "Exemplary uniform presentation" },
      license: { score: 3, comments: "SIA license clearly displayed" },
      customer: { score: 5, comments: "Immediate and friendly acknowledgment" },
      courtesy: { score: 5, comments: "Exceptionally courteous and professional" },
      knowledge: { score: 4, comments: "Excellent store knowledge" },
      professionalism: { score: 4, comments: "Outstanding problem-solving approach" }
    }
  },
  {
    id: "ev005",
    officerId: "OFF004",
    officerName: "Emily Davis",
    customerName: "Best Buy",
    locationName: "Phoenix",
    location: "LOC005",
    mysteryShopperName: "Michael Thompson",
    date: new Date(2024, 0, 15),
    time: "13:20",
    totalScore: 31,
    maxPossibleScore: 40,
    percentage: "77.5",
    createdAt: new Date(2024, 0, 15).toISOString(),
    updatedAt: new Date(2024, 0, 15).toISOString(),
    scores: {
      location: { score: 4, comments: "Well positioned but occasionally moved away from post" },
      security: { score: 4, comments: "Good awareness with minor lapses" },
      presentation: { score: 5, comments: "Uniform generally neat with minor issues" },
      license: { score: 3, comments: "SIA license properly displayed" },
      customer: { score: 3, comments: "Acknowledged after short delay" },
      courtesy: { score: 4, comments: "Polite and professional" },
      knowledge: { score: 4, comments: "Good knowledge of store layout and policies" },
      professionalism: { score: 4, comments: "Handled query effectively" }
    }
  }
];

export default function MysteryShopperPage() {
  const [evaluations, setEvaluations] = useState<any[]>(mockEvaluations);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      officerId: '',
      customerName: '',
      date: new Date(),
      time: '',
      mysteryShopperName: '',
      location: '',
      scores: defaultScores
    }
  });

  const resetForm = useCallback(() => {
    form.reset({
      officerId: '',
      customerName: '',
      date: new Date(),
      time: '',
      mysteryShopperName: '',
      location: '',
      scores: defaultScores
    });
  }, [form]);

  const handleNewEvaluation = () => {
    resetForm();
    setSelectedEvaluation(null);
    setIsDialogOpen(true);
  };

  const handleEditEvaluation = (evaluation: any) => {
    form.reset({
      officerId: evaluation.officerId,
      customerName: evaluation.customerName,
      date: new Date(evaluation.date),
      time: evaluation.time,
      mysteryShopperName: evaluation.mysteryShopperName,
      location: evaluation.location,
      scores: evaluation.scores
    });
    setSelectedEvaluation(evaluation);
    setIsDialogOpen(true);
  };

  const handleDeleteEvaluation = (evaluation: any) => {
    setEvaluationToDelete(evaluation);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      // Calculate total score and max possible score
      const total: number = Object.values(data.scores as Record<string, {score: number, comments?: string}>).reduce(
        (total: number, { score }) => total + (Number(score) || 0),
        0
      );
      const max: number = evaluationCriteria.reduce(
        (sum, criteria) => sum + criteria.maxScore,
        0
      );

      // Get names from IDs
      const selectedOfficer = mockOfficers.find(o => o.id === data.officerId);
      const selectedCustomer = mockCustomers.find(c => c.id === data.customerName);
      const selectedLocation = mockLocations.find(l => l.id === data.location);

      // Prepare evaluation data
      const evaluationData = {
        id: selectedEvaluation?.id || uuidv4(),
        ...data,
        officerName: selectedOfficer?.name || '',
        customerName: selectedCustomer?.name || '',
        locationName: selectedLocation?.name || '',
        totalScore: total,
        maxPossibleScore: max,
        percentage: ((total / max) * 100).toFixed(1),
        createdAt: selectedEvaluation?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update evaluations
      setEvaluations((prev) => {
        const existing = prev.findIndex((e) => e.id === evaluationData.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = evaluationData;
          return updated;
        }
        return [...prev, evaluationData];
      });

      // Show success message
      toast({
        title: "Success",
        description: `Evaluation ${selectedEvaluation ? 'updated' : 'created'} successfully.`,
      });

      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving evaluation:', error);
      toast({
        title: "Error",
        description: "Failed to save evaluation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedEvaluation, resetForm, toast]);

  const handleDeleteConfirm = async () => {
    if (!evaluationToDelete) return;

    try {
      setEvaluations(prev => prev.filter(e => e.id !== evaluationToDelete.id));
      toast({
        title: "Success",
        description: "Evaluation has been deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete evaluation",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setEvaluationToDelete(null);
    }
  };

  const onSubmit = form.handleSubmit(handleSubmit);

  // Pagination logic
  const totalPages = Math.ceil(evaluations.length / itemsPerPage);
  
  const paginatedEvaluations = evaluations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">
      <div className="container mx-auto py-2 xs:py-3 sm:py-4 lg:py-6 px-1 xs:px-2 sm:px-4 lg:px-6 max-w-full lg:max-w-7xl overflow-hidden">
        {/* Header & Stats Section */}
        <div className="flex flex-col space-y-2 sm:space-y-3 lg:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div className="bg-purple-100 p-1.5 sm:p-2 rounded-lg">
                <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Mystery Shopper Evaluations</h1>
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500">Track officer performance through mystery shopper evaluations</p>
              </div>
            </div>
            <Button 
              onClick={handleNewEvaluation}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-1 sm:gap-2 mt-2 sm:mt-0 w-full sm:w-auto px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-9 text-xs sm:text-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              New Evaluation
            </Button>
          </div>

          {/* Stats Cards - Optimized for small screens */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-3 md:gap-4">
            <Card className="bg-gradient-to-br from-purple-800 to-purple-900 border-purple-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 pb-0.5 sm:pb-1 md:pb-2">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-white">Total Evaluations</CardTitle>
                <ClipboardCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-purple-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 pt-0 md:pt-1">
                <div className="text-sm sm:text-base lg:text-lg font-bold text-white">{evaluations.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-800 to-blue-900 border-blue-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 pb-0.5 sm:pb-1 md:pb-2">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-white">Avg Score</CardTitle>
                <BarChart className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-blue-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 pt-0 md:pt-1">
                <div className="text-sm sm:text-base lg:text-lg font-bold text-white">
                  {evaluations.length > 0 
                    ? `${(evaluations.reduce((sum, ev) => sum + parseFloat(ev.percentage), 0) / evaluations.length).toFixed(1)}%` 
                    : '0%'
                  }
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-2 lg:col-span-1 bg-gradient-to-br from-green-800 to-green-900 border-green-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 pb-0.5 sm:pb-1 md:pb-2">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-white">Unique Officers</CardTitle>
                <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-green-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 pt-0 md:pt-1">
                <div className="text-sm sm:text-base lg:text-lg font-bold text-white">
                  {new Set(evaluations.map(ev => ev.officerId)).size}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table Section */}
        <div className="mt-3 sm:mt-4 lg:mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <div className="min-w-[300px] max-w-full px-1 sm:px-0">
              <Table className="w-full table-auto">
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm text-gray-900 py-1.5 sm:py-2 md:py-3 whitespace-nowrap">Officer</TableHead>
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm text-gray-900 py-1.5 sm:py-2 md:py-3 whitespace-nowrap hidden xs:table-cell">Customer</TableHead>
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm text-gray-900 py-1.5 sm:py-2 md:py-3 whitespace-nowrap hidden md:table-cell">Location</TableHead>
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm text-gray-900 py-1.5 sm:py-2 md:py-3 hidden lg:table-cell">Shopper</TableHead>
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm text-gray-900 py-1.5 sm:py-2 md:py-3 whitespace-nowrap hidden sm:table-cell">Date</TableHead>
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm text-gray-900 py-1.5 sm:py-2 md:py-3">Score</TableHead>
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm text-gray-900 py-1.5 sm:py-2 md:py-3 w-[60px] sm:w-[70px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEvaluations.length > 0 ? (
                    paginatedEvaluations.map((evaluation) => (
                      <TableRow key={evaluation.id} className="hover:bg-gray-50 transition-colors text-[10px] sm:text-xs lg:text-sm">
                        <TableCell className="py-1.5 sm:py-2 md:py-3 font-medium">
                          {evaluation.officerName}
                          {/* Show mobile-only content with smaller text and improved spacing */}
                          <div className="xs:hidden text-[9px] text-gray-500 mt-0.5">
                            {evaluation.customerName}
                          </div>
                          <div className="sm:hidden text-[9px] text-gray-500 mt-0.5">
                            {format(new Date(evaluation.date), 'MM/dd/yy')}
                          </div>
                        </TableCell>
                        <TableCell className="py-1.5 sm:py-2 md:py-3 hidden xs:table-cell">{evaluation.customerName}</TableCell>
                        <TableCell className="py-1.5 sm:py-2 md:py-3 hidden md:table-cell">{evaluation.locationName}</TableCell>
                        <TableCell className="py-1.5 sm:py-2 md:py-3 hidden lg:table-cell">{evaluation.mysteryShopperName}</TableCell>
                        <TableCell className="py-1.5 sm:py-2 md:py-3 whitespace-nowrap hidden sm:table-cell">
                          {format(new Date(evaluation.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="py-1.5 sm:py-2 md:py-3">
                          <div className="flex items-center">
                            <span 
                              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium ${
                                parseFloat(evaluation.percentage) >= 85 
                                  ? 'bg-green-100 text-green-700' 
                                  : parseFloat(evaluation.percentage) >= 70 
                                    ? 'bg-yellow-100 text-yellow-700' 
                                    : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {evaluation.percentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-1.5 sm:py-2 md:py-3">
                          <div className="flex items-center justify-end gap-0.5 sm:gap-1 md:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditEvaluation(evaluation)}
                              className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                            >
                              <Pencil className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEvaluation(evaluation)}
                              className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                              <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 sm:py-6 md:py-8">
                        <p className="text-gray-500 text-[10px] sm:text-xs lg:text-sm">No evaluations found</p>
                        <Button
                          variant="link"
                          onClick={handleNewEvaluation}
                          className="text-purple-600 hover:text-purple-700 mt-1 sm:mt-2 text-[10px] sm:text-xs lg:text-sm"
                        >
                          Create your first evaluation
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Pagination - Optimized for small screens */}
        {evaluations.length > itemsPerPage && (
          <div className="flex justify-center py-2 sm:py-3 md:py-4 mt-2 sm:mt-3 md:mt-4 overflow-x-auto">
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
                    {currentPage} / {totalPages}
                  </span>
                </PaginationItem>
                
                {/* Desktop Pagination Numbers - Optimized */}
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
                    className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-auto flex items-center justify-center text-[10px] sm:text-xs`}
                    aria-disabled={currentPage === totalPages}
                  >
                    <span className="sr-only">Go to next page</span>
                  </PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Dialog - using mobile optimized layout */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[calc(100%-16px)] sm:w-[calc(100%-32px)] md:max-w-[90vw] lg:max-w-[80vw] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-2 sm:pb-3 md:pb-4 border-b flex-shrink-0">
              <DialogTitle className="text-base sm:text-lg md:text-xl font-bold">
                {selectedEvaluation ? 'Edit Mystery Shopper Evaluation' : 'New Mystery Shopper Evaluation'}
              </DialogTitle>
              <DialogDescription className="text-[10px] sm:text-xs md:text-sm text-gray-500">
                Fill in the details for the mystery shopper evaluation.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto py-2 sm:py-3 md:py-4 px-1 sm:px-2 min-h-0 max-h-[calc(90vh-120px)]">
            <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4 md:space-y-6 flex flex-col">
                {/* Basic Information Section */}
                  <div className="space-y-3 sm:space-y-4 p-1.5 sm:p-2 md:p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm sm:text-base md:text-lg font-semibold pb-1.5 sm:pb-2 border-b mb-1.5 sm:mb-2 md:mb-4">Basic Information</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                    {/* Left Column */}
                      <div className="space-y-2 sm:space-y-3 md:space-y-4">
                      <FormField
                        name="officerId"
                        render={({ field }) => (
                          <FormItem>
                              <FormLabel className="text-xs sm:text-sm font-medium">Officer Name</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                                <SelectTrigger className="h-8 sm:h-9 text-[10px] sm:text-xs">
                                <SelectValue placeholder="Select an officer" />
                              </SelectTrigger>
                                <SelectContent className="z-50 text-[10px] sm:text-xs">
                                {mockOfficers.map((officer) => (
                                  <SelectItem key={officer.id} value={officer.id}>
                                    {officer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                              <FormMessage className="text-[9px] sm:text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                              <FormLabel className="text-xs sm:text-sm font-medium">Customer Name</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                                <SelectTrigger className="h-8 sm:h-9 text-[10px] sm:text-xs">
                                <SelectValue placeholder="Select a customer" />
                              </SelectTrigger>
                                <SelectContent className="z-50 text-[10px] sm:text-xs">
                                {mockCustomers.map((customer) => (
                                  <SelectItem key={customer.id} value={customer.id}>
                                    {customer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                              <FormMessage className="text-[9px] sm:text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                              <FormLabel className="text-xs sm:text-sm font-medium">Location</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                                <SelectTrigger className="h-8 sm:h-9 text-[10px] sm:text-xs">
                                <SelectValue placeholder="Select a location" />
                              </SelectTrigger>
                                <SelectContent className="z-50 text-[10px] sm:text-xs">
                                {mockLocations.map((location) => (
                                  <SelectItem key={location.id} value={location.id}>
                                    {location.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                              <FormMessage className="text-[9px] sm:text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Right Column */}
                      <div className="space-y-2 sm:space-y-3 md:space-y-4">
                      <FormField
                        name="mysteryShopperName"
                        render={({ field }) => (
                          <FormItem>
                              <FormLabel className="text-xs sm:text-sm font-medium">Mystery Shopper Name</FormLabel>
                              <Input className="h-8 sm:h-9 text-[10px] sm:text-xs" {...field} />
                              <FormMessage className="text-[9px] sm:text-xs" />
                          </FormItem>
                        )}
                      />

                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <FormField
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs sm:text-sm font-medium">Date</FormLabel>
                              <Input
                                  className="h-8 sm:h-9 text-[10px] sm:text-xs"
                                type="date"
                                {...field}
                                value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                onChange={(e) => field.onChange(e.target.valueAsDate)}
                              />
                                <FormMessage className="text-[9px] sm:text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          name="time"
                          render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs sm:text-sm font-medium">Time</FormLabel>
                              <Input 
                                  className="h-8 sm:h-9 text-[10px] sm:text-xs"
                                type="time" 
                                {...field}
                              />
                                <FormMessage className="text-[9px] sm:text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evaluation Criteria Section */}
                  <div className="space-y-2 sm:space-y-3 md:space-y-4 overflow-y-auto max-h-[50vh] md:max-h-[60vh] pb-1">
                    <div className="text-sm sm:text-base md:text-lg font-semibold pb-1.5 sm:pb-2 border-b mb-1.5 sm:mb-2 md:mb-4 sticky top-0 bg-white z-10">Evaluation Criteria</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 min-h-0 overflow-y-auto">
                      {evaluationCriteria.map((criteria) => (
                        <div key={criteria.id} className="bg-gray-50 p-1.5 sm:p-2 rounded-lg">
                          <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex justify-between items-start gap-1.5 sm:gap-2">
                              <div className="space-y-0.5 flex-1">
                                <h4 className="text-[10px] sm:text-xs font-medium leading-tight">{criteria.title}</h4>
                                <p className="text-[9px] sm:text-[10px] text-gray-500">Max Score: {criteria.maxScore}</p>
                            </div>
                            <FormField
                              name={`scores.${criteria.id}.score`}
                              render={({ field }) => (
                                  <FormItem className="w-11 sm:w-14 flex-shrink-0">
                                  <FormLabel className="sr-only">Score</FormLabel>
                                  <Input
                                    type="number"
                                    min="0"
                                    max={criteria.maxScore}
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                      className="text-center h-6 sm:h-7 px-1 text-[10px] sm:text-xs"
                                  />
                                    <FormMessage className="text-[8px] sm:text-[10px]" />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            name={`scores.${criteria.id}.comments`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="sr-only">Comments</FormLabel>
                                <Input
                                  placeholder="Add comments..."
                                  {...field}
                                    className="h-6 sm:h-7 text-[10px] sm:text-xs"
                                />
                                  <FormMessage className="text-[8px] sm:text-[10px]" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                  <DialogFooter className="pt-2 sm:pt-3 md:pt-4 mt-2 border-t flex-shrink-0">
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-8 sm:h-9 text-[10px] sm:text-xs">
                    {isLoading ? (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span className="text-[10px] sm:text-xs">Saving...</span>
                      </div>
                    ) : (
                        <span className="text-[10px] sm:text-xs">Save Evaluation</span>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog - Make more responsive */}
      <AlertDialog 
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogOpen(false);
            setEvaluationToDelete(null);
          }
        }}
      >
          <AlertDialogContent className="w-[calc(100%-24px)] max-w-[300px] xs:max-w-[320px] sm:max-w-md max-h-[90vh] overflow-auto">
          <AlertDialogHeader>
              <AlertDialogTitle className="text-base sm:text-lg">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-[10px] sm:text-xs md:text-sm">
              This action cannot be undone. This will permanently delete the mystery shopper evaluation.
            </AlertDialogDescription>
          </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <AlertDialogCancel className="mt-0 text-xs sm:text-sm h-8 sm:h-9">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 text-xs sm:text-sm h-8 sm:h-9">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}