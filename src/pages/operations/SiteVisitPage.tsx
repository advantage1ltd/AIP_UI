import * as React from "react";
import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import axios from 'axios';

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

// Mock data
const mockCustomers = [
  { id: "HOE", name: "Heart of England Cooperative" },
  { id: "MCS", name: "Midcounties Co-operative" },
];

const mockRegions = [
  { id: "SD", name: "Store Detective" },
  { id: "LP", name: "Loss Prevention" },
];

const mockLocations = [
  { id: "SAR", name: "SD Alfia Road" },
  { id: "SHR", name: "SD High Road" },
];

const mockOfficers = [
  { id: "GSG", name: "Gurjit Singh Gutha" },
  { id: "JSM", name: "John Smith" },
];

const mockManagers = [
  { id: "GB2", name: "GB2" },
  { id: "GB3", name: "GB3" },
];

const ratingOptions = [
  { value: "Good", label: "Good" },
  { value: "Fair", label: "Fair" },
  { value: "Poor", label: "Poor" },
];

const documentationOptions = [
  { value: "Good", label: "Good" },
  { value: "Acceptable", label: "Acceptable" },
  { value: "Training/Improvement Required", label: "Training/Improvement Required" },
];

const mockData = {
  actionId: "00000000",
  siteVisitId: "00002009"
};

// Add formatDate helper at the top of the file after imports
const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Form validation schema
const formSchema = z.object({
  actionId: z.string(),
  siteVisitId: z.string(),
  customer: z.string({
    required_error: "Please select a customer",
  }).refine((value) => mockCustomers.some(c => c.id === value), {
    message: "Please select a valid customer"
  }),
  region: z.string({
    required_error: "Please select a region",
  }).refine((value) => mockRegions.some(r => r.id === value), {
    message: "Please select a valid region"
  }),
  location: z.string({
    required_error: "Please select a location",
  }).refine((value) => mockLocations.some(l => l.id === value), {
    message: "Please select a valid location"
  }),
  visitType: z.string({
    required_error: "Please select visit type",
  }),
  officerName: z.string({
    required_error: "Please select an officer",
  }).refine((value) => mockOfficers.some(o => o.id === value), {
    message: "Please select a valid officer"
  }),
  idBadgeExpiry: z.string({
    required_error: "Please enter ID badge expiry",
  }),
  siaLicenceNumber: z.string({
    required_error: "Please enter SIA licence number",
  }).regex(/^[0-9]{16}$/, "SIA licence number must be 16 digits"),
  siaLicenceExpiry: z.string({
    required_error: "Please enter SIA licence expiry",
  }),
  recordOfIncidentsCompletion: z.string({
    required_error: "Please select record of incidents completion status",
  }),
  dailyOccurrenceBookCompletion: z.string({
    required_error: "Please select daily occurrence book completion status",
  }),
  pocketBookCompletion: z.string({
    required_error: "Please select pocket book completion status",
  }),
  ecrCompletion: z.string({
    required_error: "Please select ECR/Crime reporting status",
  }),
  top20Lines: z.string({
    required_error: "Please select top 20 lines status",
  }),
  assignmentInstructions: z.string({
    required_error: "Please select assignment instructions status",
  }),
  assignmentInstructionsUnderstood: z.string({
    required_error: "Please select if assignment instructions are understood",
  }),
  healthAndSafetyUnderstood: z.string({
    required_error: "Please select if health and safety is understood",
  }),
  dateHSRiskAssessment: z.string({
    required_error: "Please enter H&S risk assessment date",
  }),
  jumper: z.string({
    required_error: "Please select jumper status",
  }),
  shirt: z.string({
    required_error: "Please select shirt status",
  }),
  tie: z.string({
    required_error: "Please select tie status",
  }),
  hiVisJacket: z.string({
    required_error: "Please select hi-vis jacket status",
  }),
  jacket: z.string({
    required_error: "Please select jacket status",
  }),
  trousers: z.string({
    required_error: "Please select trousers status",
  }),
  epaulettes: z.string({
    required_error: "Please select epaulettes status",
  }),
  shoes: z.string({
    required_error: "Please select shoes status",
  }),
  trainingInstructions: z.string().optional(),
  securityOfficerSign: z.string({
    required_error: "Security officer signature is required",
  }),
  managerName: z.string({
    required_error: "Please select a manager",
  }).refine((value) => mockManagers.some(m => m.id === value), {
    message: "Please select a valid manager"
  }),
  followUpAction: z.string().optional(),
  date: z.string({
    required_error: "Please select a date",
  }),
  assignmentInstructionsInPlace: z.string({
    required_error: "Please select if assignment instructions are in place",
  }),
  assignmentInstructionsDate: z.string({
    required_error: "Please enter assignment instructions date",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SiteVisitPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visits, setVisits] = useState<any[]>([]);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      actionId: mockData.actionId,
      siteVisitId: mockData.siteVisitId,
      customer: "",
      region: "",
      location: "",
      visitType: "",
      officerName: "",
      idBadgeExpiry: "",
      siaLicenceNumber: "",
      siaLicenceExpiry: "",
      recordOfIncidentsCompletion: "",
      dailyOccurrenceBookCompletion: "",
      pocketBookCompletion: "",
      ecrCompletion: "",
      top20Lines: "",
      assignmentInstructions: "",
      assignmentInstructionsUnderstood: "",
      healthAndSafetyUnderstood: "",
      dateHSRiskAssessment: "",
      jumper: "",
      shirt: "",
      tie: "",
      hiVisJacket: "",
      jacket: "",
      trousers: "",
      epaulettes: "",
      shoes: "",
      trainingInstructions: "",
      securityOfficerSign: "",
      managerName: "",
      followUpAction: "",
      date: formatDate(new Date()),
      assignmentInstructionsInPlace: "",
      assignmentInstructionsDate: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Get display names
      const customer = mockCustomers.find(c => c.id === data.customer)?.name;
      const region = mockRegions.find(r => r.id === data.region)?.name;
      const location = mockLocations.find(l => l.id === data.location)?.name;
      const officer = mockOfficers.find(o => o.id === data.officerName)?.name;
      const manager = mockManagers.find(m => m.id === data.managerName)?.name;

      const visitData = {
        id: Math.random().toString(36).slice(2),
        ...data,
        customerName: customer,
        regionName: region,
        locationName: location,
        officerName: officer,
        managerName: manager,
        createdAt: new Date().toISOString(),
      };

      setVisits(prev => [...prev, visitData]);
      toast({
        title: "Success",
        description: "Site visit report has been created",
      });
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create site visit report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Site Visit Reports</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Site Visit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Site Visit Report</DialogTitle>
              <DialogDescription>
                Fill in the details for the new site visit report.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Basic Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="customer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select customer" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockCustomers.map((customer) => (
                                  <SelectItem key={customer.id} value={customer.id}>
                                    {customer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select region" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockRegions.map((region) => (
                                  <SelectItem key={region.id} value={region.id}>
                                    {region.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockLocations.map((location) => (
                                  <SelectItem key={location.id} value={location.id}>
                                    {location.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="visitType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type of Visit</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select visit type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="retail">Retail</SelectItem>
                                <SelectItem value="warehouse">Warehouse</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Officer Details</h3>
                    
                    <FormField
                      control={form.control}
                      name="officerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Officer Name</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select officer" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockOfficers.map((officer) => (
                                  <SelectItem key={officer.id} value={officer.id}>
                                    {officer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="idBadgeExpiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Badge Expiry</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="siaLicenceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SIA Licence Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter 16-digit licence number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="siaLicenceExpiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SIA Licence Expiry</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Header Information */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
               
                  </div>
                </div>

                {/* Documentation Section */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-medium">Documentation Check</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pocketBookCompletion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pocket Book Completion</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {documentationOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ecrCompletion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ECR/Crime Reporting</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {documentationOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recordOfIncidentsCompletion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Record of Incidents Sheet Completion</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {documentationOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dailyOccurrenceBookCompletion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Occurrence Book Completion</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {documentationOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Assignment Instructions Section */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-medium">Assignment Instructions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="assignmentInstructionsInPlace"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assignment Instructions in Place</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assignmentInstructionsDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assignment Instructions Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assignmentInstructionsUnderstood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assignment Instructions Understood and Signed</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Health and Safety Section */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-medium">Health and Safety</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="healthAndSafetyUnderstood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>H And S Risk Assessment Understood and Signed</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateHSRiskAssessment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>H & S Risk Assessment In Place</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Uniform Section */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-medium">Uniform Check</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="jumper"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumper</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {ratingOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shirt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shirt</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {ratingOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tie"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tie</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {ratingOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hiVisJacket"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hi-Vis Jacket</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {ratingOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="jacket"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jacket</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {ratingOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="trousers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trousers</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {ratingOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                   <div className="space-y-4 border-t pt-4">

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="epaulettes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Epaulettes</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {ratingOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shoes</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {ratingOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>


                {/* Additional Fields */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-medium">Additional Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="top20Lines"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Top 20 Lines Identified and Checked:</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {ratingOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assignmentInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assignment Instructions</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {ratingOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

             
                {/* Additional Fields */}
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="trainingInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Training /Instructions Given</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="securityOfficerSign"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Officer Signature</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="managerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Manager Name</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select manager" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockManagers.map((manager) => (
                                  <SelectItem key={manager.id} value={manager.id}>
                                    {manager.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="followUpAction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Follow-up Action</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit">Create Report</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Officer</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No site visits recorded
                </TableCell>
              </TableRow>
            ) : (
              visits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell>{format(new Date(visit.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{visit.customerName}</TableCell>
                  <TableCell>{visit.locationName}</TableCell>
                  <TableCell>{visit.officerName}</TableCell>
                  <TableCell>{visit.managerName}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                      Completed
                    </span>
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
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
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
    </div>
  );
}