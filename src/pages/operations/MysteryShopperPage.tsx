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
import { Toaster } from '@/components/ui/toaster'

// Import the service
import { mysteryShopperService, type MysteryShopperFilters } from '@/services/mysteryShopperService';

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

// Sample data for testing
const mockEvaluations = [
  {
    id: uuidv4(),
    officerId: "OFF001",
    officerName: "John Smith",
    customerName: "Walmart Supercenter",
    location: "New York City",
    date: "2023-12-10",
    time: "14:30",
    mysteryShopperName: "Sarah Wilson",
    scores: {
      location: { score: 4, comments: "Good positioning" },
      security: { score: 5, comments: "Very alert" },
      presentation: { score: 6, comments: "Professional appearance" },
      license: { score: 3, comments: "License visible" },
      customer: { score: 4, comments: "Helpful approach" },
      courtesy: { score: 5, comments: "Polite and courteous" },
      knowledge: { score: 4, comments: "Good store knowledge" },
      professionalism: { score: 5, comments: "Excellent service" }
    },
    totalScore: 36,
    maxPossibleScore: 40,
    percentage: "90.0%",
    createdAt: "2023-12-10T14:30:00.000Z",
    status: "submitted"
  }
];

interface MysteryShopperPageProps {
  customerId?: string;
  siteId?: string;
}

export default function MysteryShopperPage({ customerId, siteId }: MysteryShopperPageProps) {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvaluations, setTotalEvaluations] = useState(0);
  const itemsPerPage = 10;
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

  // Fetch evaluations from API
  const fetchEvaluations = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔍 [MysteryShopperPage] Fetching evaluations with filters:', { customerId, siteId, currentPage });
      
      const filters: MysteryShopperFilters = {};
      if (customerId) filters.customerId = customerId;
      if (siteId) filters.siteId = siteId;

      const response = await mysteryShopperService.getEvaluations(currentPage, itemsPerPage, filters);
      
      console.log('📤 [MysteryShopperPage] Evaluations response:', response);
      
      setEvaluations(response.data);
      setTotalEvaluations(response.pagination.total);
      setTotalPages(Math.ceil(response.pagination.total / itemsPerPage));
    } catch (error) {
      console.error('❌ [MysteryShopperPage] Error fetching evaluations:', error);
      toast({
        title: "Error",
        description: "Failed to load evaluations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, customerId, siteId, toast]);

  // Load evaluations on component mount and when filters change
  React.useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

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
      console.log('💾 [MysteryShopperPage] Saving evaluation:', { data, selectedEvaluation: !!selectedEvaluation });
      
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
        ...data,
        customerId: customerId ? parseInt(customerId) : undefined,
        siteId: siteId,
        officerName: selectedOfficer?.name || '',
        customerName: selectedCustomer?.name || '',
        locationName: selectedLocation?.name || '',
        totalScore: total,
        maxPossibleScore: max,
        percentage: ((total / max) * 100).toFixed(1),
        date: format(data.date, 'yyyy-MM-dd')
      };

      if (selectedEvaluation) {
        // Update existing evaluation
        await mysteryShopperService.updateEvaluation(selectedEvaluation.id, evaluationData);
        toast({
          title: "Success",
          description: "Evaluation updated successfully.",
        });
      } else {
        // Create new evaluation
        await mysteryShopperService.createEvaluation(evaluationData);
        toast({
          title: "Success",
          description: "Evaluation created successfully.",
        });
      }

      // Refresh the evaluations list
      await fetchEvaluations();

      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('❌ [MysteryShopperPage] Error saving evaluation:', error);
      toast({
        title: "Error",
        description: "Failed to save evaluation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedEvaluation, resetForm, toast, customerId, siteId, fetchEvaluations]);

  const handleDeleteConfirm = async () => {
    if (!evaluationToDelete) return;

    try {
      console.log('🗑️ [MysteryShopperPage] Deleting evaluation:', evaluationToDelete.id);
      
      await mysteryShopperService.deleteEvaluation(evaluationToDelete.id);
      
      toast({
        title: "Success",
        description: "Evaluation has been deleted",
      });

      // Refresh the evaluations list
      await fetchEvaluations();
    } catch (error) {
      console.error('❌ [MysteryShopperPage] Error deleting evaluation:', error);
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
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Calculate stats
  const avgScore = useMemo(() => {
    if (evaluations.length === 0) return 0;
    const total = evaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0);
    return (total / evaluations.length).toFixed(1);
  }, [evaluations]);

  const highPerformers = useMemo(() => {
    return evaluations.filter(evaluation => parseFloat(evaluation.percentage) >= 85).length;
  }, [evaluations]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">
      <Toaster />
      <div className="container mx-auto py-2 xs:py-3 sm:py-4 lg:py-6 xl:py-8 2xl:py-10 px-1 xs:px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-12 max-w-screen-2xl">
        {/* Header & Stats Section */}
        <div className="flex flex-col space-y-2 sm:space-y-3 lg:space-y-6 xl:space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 xl:gap-6">
            <div className="flex items-center gap-1.5 sm:gap-3 xl:gap-4">
              <div className="bg-purple-100 p-1.5 sm:p-2 xl:p-3 rounded-lg">
                <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-gray-900">Mystery Shopper Evaluations</h1>
                <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-500">Track officer performance through mystery shopper evaluations</p>
              </div>
            </div>
            <Button 
              onClick={handleNewEvaluation}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-1 sm:gap-2 mt-2 sm:mt-0 w-full sm:w-auto px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-9 lg:h-10 xl:h-12 text-xs sm:text-sm xl:text-base"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
              New Evaluation
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-3 md:gap-4 xl:gap-6">
            <Card className="bg-gradient-to-br from-purple-800 to-purple-900 border-purple-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pb-0.5 sm:pb-1 md:pb-2 xl:pb-3">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm xl:text-base font-medium text-white">Total Evaluations</CardTitle>
                <ClipboardCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 xl:h-5 xl:w-5 text-purple-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pt-0 md:pt-1 xl:pt-2">
                <div className="text-sm sm:text-base lg:text-lg xl:text-2xl 2xl:text-3xl font-bold text-white">{totalEvaluations}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-800 to-blue-900 border-blue-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pb-0.5 sm:pb-1 md:pb-2 xl:pb-3">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm xl:text-base font-medium text-white">Avg Score</CardTitle>
                <BarChart className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 xl:h-5 xl:w-5 text-blue-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pt-0 md:pt-1 xl:pt-2">
                <div className="text-sm sm:text-base lg:text-lg xl:text-2xl 2xl:text-3xl font-bold text-white">
                  {avgScore}%
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-2 md:col-span-1 bg-gradient-to-br from-green-800 to-green-900 border-green-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pb-0.5 sm:pb-1 md:pb-2 xl:pb-3">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm xl:text-base font-medium text-white">Unique Officers</CardTitle>
                <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 xl:h-5 xl:w-5 text-green-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pt-0 md:pt-1 xl:pt-2">
                <div className="text-sm sm:text-base lg:text-lg xl:text-2xl 2xl:text-3xl font-bold text-white">
                  {new Set(evaluations.map(ev => ev.officerId)).size}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table Section */}
        <div className="mt-3 sm:mt-4 lg:mt-6 xl:mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <div className="min-w-[300px] max-w-full px-1 sm:px-0">
              <Table className="w-full table-auto">
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4 whitespace-nowrap">Officer</TableHead>
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4 whitespace-nowrap hidden xs:table-cell">Customer</TableHead>
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4 whitespace-nowrap hidden md:table-cell">Location</TableHead>
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4 hidden lg:table-cell">Shopper</TableHead>
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4 whitespace-nowrap hidden sm:table-cell">Date</TableHead>
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4">Score</TableHead>
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4 w-[60px] sm:w-[70px] lg:w-[80px] xl:w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluations.length > 0 ? (
                    evaluations.map((evaluation) => (
                      <TableRow key={evaluation.id} className="hover:bg-gray-50 transition-colors text-[10px] sm:text-xs lg:text-sm xl:text-base">
                        <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4 font-medium">
                          {evaluation.officerName}
                          <div className="xs:hidden text-[9px] lg:text-xs xl:text-sm text-gray-500 mt-0.5">
                            {evaluation.customerName}
                          </div>
                          <div className="sm:hidden text-[9px] lg:text-xs xl:text-sm text-gray-500 mt-0.5">
                            {format(new Date(evaluation.date), 'MM/dd/yy')}
                          </div>
                        </TableCell>
                        <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4 hidden xs:table-cell">{evaluation.customerName}</TableCell>
                        <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4 hidden md:table-cell">{evaluation.locationName}</TableCell>
                        <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4 hidden lg:table-cell">{evaluation.mysteryShopperName}</TableCell>
                        <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4 whitespace-nowrap hidden sm:table-cell">
                          {format(new Date(evaluation.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4">
                          <div className="flex items-center">
                            <span 
                              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs lg:text-sm xl:text-base font-medium ${
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
                        <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4">
                          <div className="flex items-center justify-end gap-0.5 sm:gap-1 md:gap-2 xl:gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditEvaluation(evaluation)}
                              className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                            >
                              <Pencil className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 xl:h-5 xl:w-5" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEvaluation(evaluation)}
                              className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                              <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 xl:h-5 xl:w-5" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 sm:py-6 md:py-8 xl:py-12">
                        <p className="text-gray-500 text-[10px] sm:text-xs lg:text-sm xl:text-base">No evaluations found</p>
                        <Button
                          variant="link"
                          onClick={handleNewEvaluation}
                          className="text-purple-600 hover:text-purple-700 mt-1 sm:mt-2 text-[10px] sm:text-xs lg:text-sm xl:text-base"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center py-2 sm:py-3 md:py-4 xl:py-6 mt-2 sm:mt-3 md:mt-4 xl:mt-6 overflow-x-auto">
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
                    {currentPage} / {totalPages}
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
                    className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-auto xl:h-12 xl:w-auto flex items-center justify-center text-[10px] sm:text-xs xl:text-base`}
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