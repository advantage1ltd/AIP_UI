import * as React from "react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Plus, Pencil, Trash2, Search, X } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Users,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

// Add initial mockVisits data after mockData
const mockVisits = [
  {
    id: "sv001",
    actionId: "ACT12345",
    siteVisitId: "SV78901",
    customer: "HOE",
    customerName: "Heart of England Cooperative",
    region: "SD",
    regionName: "Store Detective",
    location: "SAR",
    locationName: "SD Alfia Road", 
    visitType: "retail",
    officerName: "Gurjit Singh Gutha",
    idBadgeExpiry: "2024-12-15",
    siaLicenceNumber: "1234567890123456",
    siaLicenceExpiry: "2025-06-30",
    recordOfIncidentsCompletion: "Good",
    dailyOccurrenceBookCompletion: "Good",
    pocketBookCompletion: "Good",
    ecrCompletion: "Good",
    top20Lines: "Good",
    assignmentInstructions: "Good",
    assignmentInstructionsUnderstood: "Yes",
    healthAndSafetyUnderstood: "Yes",
    dateHSRiskAssessment: "2023-11-20",
    jumper: "Good",
    shirt: "Good",
    tie: "Good",
    hiVisJacket: "Good",
    jacket: "Good",
    trousers: "Good",
    epaulettes: "Good",
    shoes: "Good",
    trainingInstructions: "Regular site patrols completed",
    securityOfficerSign: "G. Singh",
    managerName: "GB2",
    followUpAction: "None required",
    date: "2023-12-10",
    assignmentInstructionsInPlace: "Yes",
    assignmentInstructionsDate: "2023-05-15",
    createdAt: "2023-12-10T12:30:00.000Z",
    status: "Completed"
  },
  {
    id: "sv002",
    actionId: "ACT67890",
    siteVisitId: "SV12345",
    customer: "MCS",
    customerName: "Midcounties Co-operative",
    region: "LP",
    regionName: "Loss Prevention",
    location: "SHR",
    locationName: "SD High Road",
    visitType: "warehouse",
    officerName: "John Smith",
    idBadgeExpiry: "2024-08-20",
    siaLicenceNumber: "9876543210987654",
    siaLicenceExpiry: "2025-02-15",
    recordOfIncidentsCompletion: "Good",
    dailyOccurrenceBookCompletion: "Acceptable",
    pocketBookCompletion: "Acceptable",
    ecrCompletion: "Good",
    top20Lines: "Fair",
    assignmentInstructions: "Good",
    assignmentInstructionsUnderstood: "Yes",
    healthAndSafetyUnderstood: "Yes",
    dateHSRiskAssessment: "2023-10-05",
    jumper: "Good",
    shirt: "Fair",
    tie: "Good",
    hiVisJacket: "Good",
    jacket: "Fair",
    trousers: "Good",
    epaulettes: "Good",
    shoes: "Fair",
    trainingInstructions: "Additional training on incident reporting",
    securityOfficerSign: "J. Smith",
    managerName: "GB3",
    followUpAction: "Follow-up training scheduled",
    date: "2024-01-22",
    assignmentInstructionsInPlace: "Yes",
    assignmentInstructionsDate: "2023-06-10",
    createdAt: "2024-01-22T09:15:00.000Z",
    status: "Follow-up Required"
  },
  {
    id: "sv003",
    actionId: "ACT24680",
    siteVisitId: "SV97531",
    customer: "HOE",
    customerName: "Heart of England Cooperative",
    region: "SD",
    regionName: "Store Detective",
    location: "SAR",
    locationName: "SD Alfia Road",
    visitType: "retail",
    officerName: "John Smith",
    idBadgeExpiry: "2024-10-01",
    siaLicenceNumber: "5678901234567890",
    siaLicenceExpiry: "2025-04-20",
    recordOfIncidentsCompletion: "Acceptable",
    dailyOccurrenceBookCompletion: "Good",
    pocketBookCompletion: "Good",
    ecrCompletion: "Good",
    top20Lines: "Good",
    assignmentInstructions: "Good",
    assignmentInstructionsUnderstood: "Yes",
    healthAndSafetyUnderstood: "Yes",
    dateHSRiskAssessment: "2023-09-15",
    jumper: "Good",
    shirt: "Good",
    tie: "Good",
    hiVisJacket: "Good",
    jacket: "Good",
    trousers: "Good",
    epaulettes: "Good",
    shoes: "Good",
    trainingInstructions: "",
    securityOfficerSign: "J. Smith",
    managerName: "GB2",
    followUpAction: "",
    date: "2024-02-08",
    assignmentInstructionsInPlace: "Yes",
    assignmentInstructionsDate: "2023-07-05",
    createdAt: "2024-02-08T14:45:00.000Z",
    status: "Completed"
  }
];

// After the mockVisits array, add more mock data to demonstrate pagination
// Add more mockVisits items to demonstrate pagination (add after existing mockVisits)
const additionalMockVisits = Array.from({ length: 15 }, (_, i) => ({
  id: `sv${(i + 4).toString().padStart(3, '0')}`,
  actionId: `ACT${Math.floor(10000 + Math.random() * 90000)}`,
  siteVisitId: `SV${Math.floor(10000 + Math.random() * 90000)}`,
  customer: i % 2 === 0 ? "HOE" : "MCS",
  customerName: i % 2 === 0 ? "Heart of England Cooperative" : "Midcounties Co-operative",
  region: i % 3 === 0 ? "SD" : "LP",
  regionName: i % 3 === 0 ? "Store Detective" : "Loss Prevention",
  location: i % 2 === 0 ? "SAR" : "SHR",
  locationName: i % 2 === 0 ? "SD Alfia Road" : "SD High Road",
  visitType: i % 2 === 0 ? "retail" : "warehouse",
  officerName: i % 2 === 0 ? "Gurjit Singh Gutha" : "John Smith",
  idBadgeExpiry: `2024-${Math.floor(1 + Math.random() * 12).toString().padStart(2, '0')}-${Math.floor(1 + Math.random() * 28).toString().padStart(2, '0')}`,
  siaLicenceNumber: `${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`,
  siaLicenceExpiry: `2025-${Math.floor(1 + Math.random() * 12).toString().padStart(2, '0')}-${Math.floor(1 + Math.random() * 28).toString().padStart(2, '0')}`,
  recordOfIncidentsCompletion: i % 3 === 0 ? "Good" : i % 3 === 1 ? "Acceptable" : "Training/Improvement Required",
  dailyOccurrenceBookCompletion: i % 3 === 0 ? "Good" : i % 3 === 1 ? "Acceptable" : "Training/Improvement Required",
  pocketBookCompletion: i % 3 === 0 ? "Good" : i % 3 === 1 ? "Acceptable" : "Training/Improvement Required",
  ecrCompletion: i % 3 === 0 ? "Good" : i % 3 === 1 ? "Acceptable" : "Training/Improvement Required",
  top20Lines: i % 3 === 0 ? "Good" : i % 3 === 1 ? "Fair" : "Poor",
  assignmentInstructions: i % 3 === 0 ? "Good" : i % 3 === 1 ? "Fair" : "Poor",
  assignmentInstructionsUnderstood: i % 5 === 0 ? "No" : "Yes",
  healthAndSafetyUnderstood: i % 5 === 0 ? "No" : "Yes",
  dateHSRiskAssessment: `2023-${Math.floor(1 + Math.random() * 12).toString().padStart(2, '0')}-${Math.floor(1 + Math.random() * 28).toString().padStart(2, '0')}`,
  jumper: i % 3 === 0 ? "Good" : i % 3 === 1 ? "Fair" : "Poor",
  shirt: i % 3 === 0 ? "Good" : i % 3 === 1 ? "Fair" : "Poor",
  tie: i % 3 === 0 ? "Good" : i % 3 === 1 ? "Fair" : "Poor",
  hiVisJacket: i % 3 === 0 ? "Good" : i % 3 === 1 ? "Fair" : "Poor",
  jacket: i % 3 === 0 ? "Good" : i % 3 === 1 ? "Fair" : "Poor",
  trousers: i % 3 === 0 ? "Good" : i % 3 === 1 ? "Fair" : "Poor",
  epaulettes: i % 3 === 0 ? "Good" : i % 3 === 1 ? "Fair" : "Poor",
  shoes: i % 3 === 0 ? "Good" : i % 3 === 1 ? "Fair" : "Poor",
  trainingInstructions: i % 2 === 0 ? "Regular site patrols completed" : "Additional training on incident reporting",
  securityOfficerSign: i % 2 === 0 ? "G. Singh" : "J. Smith",
  managerName: i % 2 === 0 ? "GB2" : "GB3",
  followUpAction: i % 3 === 0 ? "" : i % 3 === 1 ? "Follow-up training scheduled" : "Escalated to senior management",
  date: `${2023 + Math.floor(i / 8)}-${Math.floor(1 + Math.random() * 12).toString().padStart(2, '0')}-${Math.floor(1 + Math.random() * 28).toString().padStart(2, '0')}`,
  assignmentInstructionsInPlace: i % 5 === 0 ? "No" : "Yes",
  assignmentInstructionsDate: `2023-${Math.floor(1 + Math.random() * 12).toString().padStart(2, '0')}-${Math.floor(1 + Math.random() * 28).toString().padStart(2, '0')}`,
  createdAt: new Date(2023, Math.floor(i / 4), 15 + i).toISOString(),
  status: i % 4 === 0 ? "Follow-up Required" : "Completed"
}));

// Update the mock data constant
const allMockVisits = [...mockVisits, ...additionalMockVisits];

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
  const [visits, setVisits] = useState<any[]>(allMockVisits);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [editingVisit, setEditingVisit] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  // Filter visits based on search query
  const filteredVisits = useMemo(() => {
    if (!searchQuery.trim()) return visits;
    
    const query = searchQuery.toLowerCase().trim();
    return visits.filter(visit => 
      visit.customerName.toLowerCase().includes(query) ||
      visit.officerName.toLowerCase().includes(query) ||
      visit.locationName.toLowerCase().includes(query) ||
      visit.status.toLowerCase().includes(query) ||
      format(new Date(visit.date), 'dd/MM/yyyy').toLowerCase().includes(query)
    );
  }, [visits, searchQuery]);

  // Calculate total pages from filtered visits
  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);
  
  // Get current page items from filtered visits
  const paginatedVisits = filteredVisits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Add search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

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

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (editingVisit) {
      // Update existing visit
      const updatedVisit = {
        ...editingVisit,
        ...data,
        customerName: mockCustomers.find(c => c.id === data.customer)?.name || '',
        officerName: mockOfficers.find(o => o.id === data.officerName)?.name || '',
        managerName: mockManagers.find(m => m.id === data.managerName)?.name || '',
        locationName: mockLocations.find(l => l.id === data.location)?.name || '',
        regionName: mockRegions.find(r => r.id === data.region)?.name || '',
        updatedAt: new Date().toISOString()
      };
      
      // Update the visits array with the edited visit
      setVisits(currentVisits => 
        currentVisits.map(visit => 
          visit.id === editingVisit.id ? updatedVisit : visit
        )
      );
      
      toast({
        title: "Success",
        description: "Site visit has been updated successfully",
      });
    } else {
      // Create new visit
      const newVisit = {
        id: `sv${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
        ...data,
        customerName: mockCustomers.find(c => c.id === data.customer)?.name || '',
        officerName: mockOfficers.find(o => o.id === data.officerName)?.name || '',
        managerName: mockManagers.find(m => m.id === data.managerName)?.name || '',
        locationName: mockLocations.find(l => l.id === data.location)?.name || '',
        regionName: mockRegions.find(r => r.id === data.region)?.name || '',
        status: 'Completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add the new visit to the beginning of the array
      setVisits(currentVisits => [newVisit, ...currentVisits]);
      
      toast({
        title: "Success",
        description: "New site visit has been created successfully",
      });
    }
    
    // Close dialog and reset form
    setIsDialogOpen(false);
    setEditingVisit(null);
    form.reset();
  };

  // Handle create site visit
  const handleCreateVisit = () => {
    setEditingVisit(null);
    form.reset({
      customer: '',
      region: '',
      location: '',
      visitType: '',
      date: '',
      officerName: '',
      idBadgeExpiry: '',
      siaLicenceNumber: '',
      siaLicenceExpiry: '',
      recordOfIncidentsCompletion: '',
      dailyOccurrenceBookCompletion: '',
      pocketBookCompletion: '',
      ecrCompletion: '',
      top20Lines: '',
      jumper: '',
      shirt: '',
      tie: '',
      hiVisJacket: '',
      jacket: '',
      trousers: '',
      epaulettes: '',
      shoes: '',
      assignmentInstructions: '',
      assignmentInstructionsUnderstood: '',
      healthAndSafetyUnderstood: '',
      dateHSRiskAssessment: '',
      assignmentInstructionsInPlace: '',
      assignmentInstructionsDate: '',
      trainingInstructions: '',
      followUpAction: '',
      securityOfficerSign: '',
      managerName: ''
    });
    setIsDialogOpen(true);
  };

  // Handle edit site visit
  const handleEditVisit = (visit: any) => {
    // Set the current visit being edited
    setEditingVisit(visit);
    
    // Map the data back to the form
    form.reset({
      customer: mockCustomers.find(c => c.name === visit.customerName)?.id || '',
      region: mockRegions.find(r => r.name === visit.regionName)?.id || '',
      location: mockLocations.find(l => l.name === visit.locationName)?.id || '',
      visitType: visit.visitType || '',
      date: visit.date || '',
      officerName: mockOfficers.find(o => o.name === visit.officerName)?.id || '',
      idBadgeExpiry: visit.idBadgeExpiry || '',
      siaLicenceNumber: visit.siaLicenceNumber || '',
      siaLicenceExpiry: visit.siaLicenceExpiry || '',
      recordOfIncidentsCompletion: visit.recordOfIncidentsCompletion || '',
      dailyOccurrenceBookCompletion: visit.dailyOccurrenceBookCompletion || '',
      pocketBookCompletion: visit.pocketBookCompletion || '',
      ecrCompletion: visit.ecrCompletion || '',
      top20Lines: visit.top20Lines || '',
      jumper: visit.jumper || '',
      shirt: visit.shirt || '',
      tie: visit.tie || '',
      hiVisJacket: visit.hiVisJacket || '',
      jacket: visit.jacket || '',
      trousers: visit.trousers || '',
      epaulettes: visit.epaulettes || '',
      shoes: visit.shoes || '',
      assignmentInstructions: visit.assignmentInstructions || '',
      assignmentInstructionsUnderstood: visit.assignmentInstructionsUnderstood || '',
      healthAndSafetyUnderstood: visit.healthAndSafetyUnderstood || '',
      dateHSRiskAssessment: visit.dateHSRiskAssessment || '',
      assignmentInstructionsInPlace: visit.assignmentInstructionsInPlace || '',
      assignmentInstructionsDate: visit.assignmentInstructionsDate || '',
      trainingInstructions: visit.trainingInstructions || '',
      followUpAction: visit.followUpAction || '',
      securityOfficerSign: visit.securityOfficerSign || '',
      managerName: mockManagers.find(m => m.name === visit.managerName)?.id || ''
    });
    
    // Open the dialog
    setIsDialogOpen(true);
  };
  
  // Handle delete site visit
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle confirm delete
  const handleDeleteConfirm = () => {
    if (deleteId) {
      setVisits(currentVisits => currentVisits.filter(visit => visit.id !== deleteId));
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
      
      toast({
        title: "Success",
        description: "Site visit has been deleted successfully",
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">
      <div className="container mx-auto py-2 xs:py-3 sm:py-4 lg:py-6 xl:py-8 2xl:py-10 px-1 xs:px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-12 max-w-screen-2xl">
        <div className="flex flex-col space-y-2 sm:space-y-4 lg:space-y-6 xl:space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 xl:gap-6">
            <div className="flex items-center gap-1.5 sm:gap-3 xl:gap-4">
              <div className="bg-blue-100 p-1.5 sm:p-2 xl:p-3 rounded-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-gray-900">Site Visit Reports</h1>
                <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-500">Track site visits and officer evaluations</p>
              </div>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1 sm:gap-2 mt-2 sm:mt-0 w-full sm:w-auto px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-9 lg:h-10 xl:h-12 text-xs sm:text-sm xl:text-base"
              onClick={handleCreateVisit}
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
              New Site Visit
            </Button>
          </div>

          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-3 md:gap-4 xl:gap-6">
            <Card className="bg-gradient-to-br from-blue-800 to-blue-900 border-blue-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pb-0.5 sm:pb-1 md:pb-2 xl:pb-3">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm xl:text-base font-medium text-white">Total Visits</CardTitle>
                <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 xl:h-5 xl:w-5 text-blue-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pt-0 md:pt-1 xl:pt-2">
                <div className="text-sm sm:text-base lg:text-lg xl:text-2xl 2xl:text-3xl font-bold text-white">{visits.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-800 to-green-900 border-green-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pb-0.5 sm:pb-1 md:pb-2 xl:pb-3">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm xl:text-base font-medium text-white">Completed</CardTitle>
                <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 xl:h-5 xl:w-5 text-green-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pt-0 md:pt-1 xl:pt-2">
                <div className="text-sm sm:text-base lg:text-lg xl:text-2xl 2xl:text-3xl font-bold text-white">
                  {visits.filter(v => v.status === "Completed").length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-700 to-amber-800 border-amber-600 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pb-0.5 sm:pb-1 md:pb-2 xl:pb-3">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm xl:text-base font-medium text-white">Follow-up</CardTitle>
                <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 xl:h-5 xl:w-5 text-amber-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pt-0 md:pt-1 xl:pt-2">
                <div className="text-sm sm:text-base lg:text-lg xl:text-2xl 2xl:text-3xl font-bold text-white">
                  {visits.filter(v => v.status === "Follow-up Required").length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-800 to-purple-900 border-purple-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pb-0.5 sm:pb-1 md:pb-2 xl:pb-3">
                <CardTitle className="text-[10px] sm:text-xs lg:text-sm xl:text-base font-medium text-white">Unique Officers</CardTitle>
                <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 xl:h-5 xl:w-5 text-purple-300" />
              </CardHeader>
              <CardContent className="p-1.5 sm:p-2 md:p-3 xl:p-5 2xl:p-6 pt-0 md:pt-1 xl:pt-2">
                <div className="text-sm sm:text-base lg:text-lg xl:text-2xl 2xl:text-3xl font-bold text-white">
                  {new Set(visits.map(v => v.officerName)).size}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add search input before the table */}
        <div className="mt-3 sm:mt-4 lg:mt-6 xl:mt-8 mb-2 sm:mb-3 xl:mb-4">
          <div className="relative w-full sm:max-w-xs xl:max-w-sm">
            <Input
              type="text"
              placeholder="Search visits..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-8 h-8 sm:h-9 xl:h-12 text-xs sm:text-sm xl:text-base"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 xl:h-5 xl:w-5 text-gray-400" />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 xl:h-8 xl:w-8 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 xl:h-4 xl:w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
          {searchQuery && (
            <p className="text-[10px] sm:text-xs xl:text-sm text-gray-500 mt-1">
              Found {filteredVisits.length} {filteredVisits.length === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <div className="min-w-[300px] max-w-full px-1 sm:px-0">
              <Table className="w-full table-auto">
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4">Customer</TableHead>
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4 whitespace-nowrap w-[120px] xs:w-[140px] sm:w-[160px] xl:w-[180px]">Date</TableHead>
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4 whitespace-nowrap hidden md:table-cell">Location</TableHead>
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4 hidden sm:table-cell">Officer</TableHead>
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4">Status</TableHead>
                    <TableHead className="font-medium text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-900 py-1.5 sm:py-2 md:py-3 xl:py-4 w-[60px] sm:w-[70px] lg:w-[80px] xl:w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 sm:py-6 md:py-8 xl:py-12">
                        {searchQuery ? (
                          <p className="text-gray-500 text-[10px] sm:text-xs lg:text-sm xl:text-base">No matching visits found</p>
                        ) : (
                          <>
                            <p className="text-gray-500 text-[10px] sm:text-xs lg:text-sm xl:text-base">No site visits recorded</p>
                            <Button
                              variant="link"
                              onClick={handleCreateVisit}
                              className="text-blue-600 hover:text-blue-700 mt-1 sm:mt-2 text-[10px] sm:text-xs lg:text-sm xl:text-base"
                            >
                              Create your first site visit
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedVisits.map((visit) => (
                      <TableRow key={visit.id} className="hover:bg-gray-50 transition-colors text-[10px] sm:text-xs lg:text-sm xl:text-base">
                        <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4">
                          <div className="font-medium text-[11px] sm:text-sm xl:text-base text-blue-700">
                            {visit.customerName}
                          </div>
                          <div className="sm:hidden text-[9px] lg:text-xs xl:text-sm text-gray-500 mt-0.5">
                            {visit.officerName}
                          </div>
                        </TableCell>
                        <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4 font-medium whitespace-nowrap">
                          {format(new Date(visit.date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4 hidden md:table-cell">{visit.locationName}</TableCell>
                        <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4 hidden sm:table-cell">{visit.officerName}</TableCell>
                        <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4">
                          <span 
                            className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs lg:text-sm xl:text-base font-medium ${
                              visit.status === "Completed" 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {visit.status}
                          </span>
                        </TableCell>
                        <TableCell className="py-1.5 sm:py-2 md:py-3 xl:py-4">
                          <div className="flex items-center justify-end gap-0.5 sm:gap-1 md:gap-2 xl:gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                              onClick={() => handleEditVisit(visit)}
                            >
                              <Pencil className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 xl:h-5 xl:w-5" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              onClick={() => handleDeleteClick(visit.id)}
                            >
                              <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 xl:h-5 xl:w-5" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {filteredVisits.length > itemsPerPage && (
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
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setEditingVisit(null);
          form.reset();
        }
        setIsDialogOpen(open);
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 sm:p-2 md:p-4 lg:p-6">
          <DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
            <DialogTitle className="text-xl font-bold">
              {editingVisit ? "Edit Site Visit" : "Create New Site Visit"}
            </DialogTitle>
            <DialogDescription>
              {editingVisit 
                ? "Update the details for this site visit report" 
                : "Complete the form below to create a new site visit report"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Basic Information */}
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
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
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockRegions.map((region) => (
                            <SelectItem key={region.id} value={region.id}>
                              {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
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
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="visitType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visit Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select visit type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="warehouse">Warehouse</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Visit</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="officerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Officer</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select officer" />
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
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-base mb-4">Officer ID Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="idBadgeExpiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Badge Expiry</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                          <Input {...field} maxLength={16} />
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
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-base mb-4">Documentation Checks</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="recordOfIncidentsCompletion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Record of Incidents</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {documentationOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dailyOccurrenceBookCompletion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Occurrence Book</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {documentationOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="pocketBookCompletion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pocket Book</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {documentationOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {documentationOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="top20Lines"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Top 20 Lines</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ratingOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-base mb-4">Appearance Checks</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="jumper"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumper</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ratingOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ratingOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ratingOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ratingOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ratingOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ratingOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="epaulettes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Epaulettes</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ratingOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ratingOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-base mb-4">Assignment Instructions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="assignmentInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignment Instructions</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ratingOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="assignmentInstructionsUnderstood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions Understood</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="healthAndSafetyUnderstood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>H&S Understood</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dateHSRiskAssessment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>H&S Risk Assessment Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="assignmentInstructionsInPlace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions In Place</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="assignmentInstructionsDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="trainingInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training Instructions/Observations</FormLabel>
                      <FormControl>
                        <textarea 
                          {...field}
                          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter any training instructions or observations..."
                        />
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
                        <textarea 
                          {...field}
                          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter any follow-up actions required..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="securityOfficerSign"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Officer Signature</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter security officer signature" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="managerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manager Name</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockManagers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="px-4 pb-4 sm:px-6 sm:pb-6 pt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto order-2 sm:order-1">
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto order-1 sm:order-2">
                  {editingVisit ? "Update Site Visit" : "Create Site Visit"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md p-0 sm:p-2 md:p-4">
          <DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
            <DialogTitle className="text-lg font-semibold">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this site visit? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-4 py-4 sm:px-6 sm:py-6 flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto order-1 sm:order-2"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}