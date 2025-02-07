import React, { useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { MysteryShopperForm } from "@/components/mystery-shopper/MysteryShopperForm";
import { useForm } from "react-hook-form";

// Mock data
const mockOfficers = [
  { id: "off1", name: "Mr Abhishek Abhishek" },
  // Add other officers as needed
];

const mockCustomers = [
  { id: "cust1", name: "Midcounties Co-Operative" },
  // Add other customers as needed
];

const mockLocations = [
  // Add your locations
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

export default function MysteryShopperPage() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<any | null>(null);
  const { toast } = useToast();

  const form = useForm({
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

  const handleNewEvaluation = () => {
    setSelectedEvaluation(null);
    setIsDialogOpen(true);
  };

  const handleEditEvaluation = (evaluation: any) => {
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

      // Prepare evaluation data
      const evaluationData = {
        id: selectedEvaluation?.id || uuidv4(),
        ...data,
        totalScore: total,
        maxPossibleScore: max,
        percentage: max > 0 ? ((total / max) * 100).toFixed(1) : '0',
        officerName: mockOfficers.find(o => o.id === data.officerId)?.name,
        customerName: mockCustomers.find(c => c.id === data.customerName)?.name,
        locationName: mockLocations.find(l => l.id === data.location)?.name,
      };

      // Update state in batches
      requestAnimationFrame(() => {
        setEvaluations(prev => {
          if (selectedEvaluation) {
            return prev.map(e => e.id === evaluationData.id ? evaluationData : e);
          }
          return [evaluationData, ...prev];
        });

        toast({
          title: "Success",
          description: selectedEvaluation
            ? "Evaluation has been updated"
            : "Evaluation has been created",
        });

        setIsDialogOpen(false);
        setSelectedEvaluation(null);
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save evaluation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedEvaluation, toast]);

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

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Mystery Shopper Records</h2>
        <Button onClick={handleNewEvaluation}>Add Record</Button>
      </div>

      {/* Records Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Officer</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Mystery Shopper</TableHead>
              <TableHead>Total Score</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              evaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell>{evaluation.officerName}</TableCell>
                  <TableCell>{evaluation.customerName}</TableCell>
                  <TableCell>{evaluation.locationName}</TableCell>
                  <TableCell>{format(new Date(evaluation.date), 'PP')}</TableCell>
                  <TableCell>{evaluation.time}</TableCell>
                  <TableCell>{evaluation.mysteryShopperName}</TableCell>
                  <TableCell>{evaluation.totalScore}</TableCell>
                  <TableCell>{evaluation.percentage}%</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setSelectedEvaluation(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEvaluation ? "Edit Mystery Shopper Evaluation" : "New Mystery Shopper Evaluation"}
            </DialogTitle>
            <DialogDescription>
              Fill in the evaluation details below
            </DialogDescription>
          </DialogHeader>
          <MysteryShopperForm
            onSubmit={handleSubmit}
            initialData={selectedEvaluation}
            isLoading={isLoading}
            defaultScores={defaultScores}
            evaluationCriteria={evaluationCriteria}
            mockOfficers={mockOfficers}
            mockCustomers={mockCustomers}
            mockLocations={mockLocations}
          />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 bg-slate-600 p-6 text-white">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FormLabel htmlFor="officerId" className="text-yellow-300 w-40">Officer Name:</FormLabel>
                    <FormField
                      name="officerId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              name="officerId"
                            >
                              <FormControl>
                                <SelectTrigger id="officerId" className="bg-blue-600 text-white border-none">
                                  <SelectValue id="officerValue" placeholder="Select an officer" />
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
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <FormLabel htmlFor="customerName" className="text-yellow-300 w-40">Customer Name:</FormLabel>
                    <FormField
                      name="customerName"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              name="customerName"
                            >
                              <FormControl>
                                <SelectTrigger id="customerName" className="bg-blue-600 text-white border-none">
                                  <SelectValue id="customerValue" placeholder="Select a customer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockCustomers.map((customer) => (
                                  <SelectItem key={customer.id} value={customer.id}>
                                    {customer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <FormLabel htmlFor="date" className="text-yellow-300 w-40">Date:</FormLabel>
                    <FormField
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              id="date"
                              name="date"
                              type="date"
                              {...field}
                              value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                              onChange={(e) => field.onChange(e.target.valueAsDate)}
                              className="bg-white text-black"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <FormLabel htmlFor="mysteryShopperName" className="text-yellow-300 w-40">Mystery Shopper Name:</FormLabel>
                    <FormField
                      name="mysteryShopperName"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              id="mysteryShopperName"
                              name="mysteryShopperName"
                              {...field}
                              className="bg-white text-black" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FormLabel htmlFor="location" className="text-yellow-300">Location:</FormLabel>
                    <FormField
                      name="location"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              name="location"
                            >
                              <FormControl>
                                <SelectTrigger id="location" className="bg-white text-black">
                                  <SelectValue id="locationValue" placeholder="Select a location" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockLocations.map((location) => (
                                  <SelectItem key={location.id} value={location.id}>
                                    {location.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <FormLabel htmlFor="time" className="text-yellow-300">Time:</FormLabel>
                    <FormField
                      name="time"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              id="time" 
                              name="time"
                              type="time" 
                              {...field}
                              className="bg-white text-black" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-yellow-300 mb-4">The items to be checked are categorised below, along with a maximum score level and a comments/observations box.</p>
                <div className="bg-slate-700 p-4 rounded">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-500">
                        <TableHead className="w-[400px] text-yellow-300">The Basics</TableHead>
                        <TableHead className="w-[80px] text-yellow-300">Max</TableHead>
                        <TableHead className="w-[80px] text-yellow-300">Score</TableHead>
                        <TableHead className="text-yellow-300">Comments and/or observations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {evaluationCriteria.map((criteria) => (
                        <TableRow key={criteria.id} className="border-b border-slate-500">
                          <TableCell className="align-top text-white">
                            {criteria.title}
                          </TableCell>
                          <TableCell className="text-center text-white">{criteria.maxScore}</TableCell>
                          <TableCell>
                            <FormField
                              name={`scores.${criteria.id}.score`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      id={`score-${criteria.id}`}
                                      name={`scores.${criteria.id}.score`}
                                      type="number"
                                      min="0"
                                      max={criteria.maxScore}
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                      className="w-16 bg-white text-black"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              name={`scores.${criteria.id}.comments`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      id={`comments-${criteria.id}`}
                                      name={`scores.${criteria.id}.comments`}
                                      placeholder="Add comments..."
                                      {...field}
                                      className="bg-white text-black"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2} className="text-right font-bold text-white">Total Score:</TableCell>
                        <TableCell className="font-bold text-white">
                          {Object.values(form.getValues().scores || {}).reduce((total: number, { score }: any) => total + (score || 0), 0)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? "Saving..." : "Submit Evaluation"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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