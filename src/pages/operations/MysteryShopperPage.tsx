import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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

export default function MysteryShopperPage() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<any | null>(null);
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
      const total: number = Object.values(data.scores).reduce(
        (total: number, { score }: any) => total + (Number(score) || 0),
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

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mystery Shopper Evaluations</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Evaluation</Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl">New Mystery Shopper Evaluation</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Fill in the details for the new mystery shopper evaluation.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold pb-2 border-b mb-4">Basic Information</div>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <FormField
                        name="officerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Officer Name</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select an officer" />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {mockOfficers.map((officer) => (
                                  <SelectItem key={officer.id} value={officer.id}>
                                    {officer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Customer Name</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select a customer" />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {mockCustomers.map((customer) => (
                                  <SelectItem key={customer.id} value={customer.id}>
                                    {customer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Location</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select a location" />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {mockLocations.map((location) => (
                                  <SelectItem key={location.id} value={location.id}>
                                    {location.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <FormField
                        name="mysteryShopperName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Mystery Shopper Name</FormLabel>
                            <Input {...field} />
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Date</FormLabel>
                              <Input
                                type="date"
                                {...field}
                                value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                onChange={(e) => field.onChange(e.target.valueAsDate)}
                              />
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          name="time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Time</FormLabel>
                              <Input 
                                type="time" 
                                {...field}
                              />
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evaluation Criteria Section */}
                <div className="space-y-6">
                  <div className="text-base font-semibold pb-2 border-b mb-4">Evaluation Criteria</div>
                  <div className="grid grid-cols-2 gap-4">
                    {evaluationCriteria.map((criteria, index) => (
                      <div key={criteria.id} className="bg-gray-50 p-2 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-3">
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-medium leading-tight">{criteria.title}</h4>
                              <p className="text-[11px] text-gray-500">Max Score: {criteria.maxScore}</p>
                            </div>
                            <FormField
                              name={`scores.${criteria.id}.score`}
                              render={({ field }) => (
                                <FormItem className="w-16">
                                  <FormLabel className="sr-only">Score</FormLabel>
                                  <Input
                                    type="number"
                                    min="0"
                                    max={criteria.maxScore}
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="text-center h-7 px-1 text-sm"
                                  />
                                  <FormMessage className="text-[10px]" />
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
                                  className="h-7 text-xs"
                                />
                                <FormMessage className="text-[10px]" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span className="text-sm">Saving...</span>
                      </div>
                    ) : (
                      <span className="text-sm">Save Evaluation</span>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Officer Name</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Mystery Shopper</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map((evaluation) => (
              <TableRow key={evaluation.id}>
                <TableCell>{evaluation.officerName}</TableCell>
                <TableCell>{evaluation.customerName}</TableCell>
                <TableCell>{evaluation.locationName}</TableCell>
                <TableCell>{evaluation.mysteryShopperName}</TableCell>
                <TableCell>
                  {format(new Date(evaluation.date), 'MMM d, yyyy')} at {evaluation.time}
                </TableCell>
                <TableCell>
                  {evaluation.percentage}% ({evaluation.totalScore}/{evaluation.maxPossibleScore})
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditEvaluation(evaluation)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteEvaluation(evaluation)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Dialog */}
      <AlertDialog 
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogOpen(false);
            setEvaluationToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the mystery shopper evaluation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}