import * as React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Plus, Pencil, Trash2, Search, X } from "lucide-react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SiteVisit } from "@/types/siteVisit";
import { toast } from 'react-toastify';
import { siteVisitService } from '@/services/siteVisitService'

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
  { id: "HOE", name: "Heart of England" },
  { id: "MCS", name: "Midcounties COOP" },
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
    customerName: "Heart of England",
    region: "SD",
    regionName: "Store Detective",
    location: "SAR",
    locationName: "SD Alfia Road", 
    visitType: "retail" as const,
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
    assignmentInstructionsUnderstood: "Yes" as const,
    healthAndSafetyUnderstood: "Yes" as const,
    healthAndSafetyInPlace: "Yes" as const,
    dateHSRiskAssessment: "2023-11-20",
    trainingInstructionsGivenDate: "2023-11-15",
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
    followUpAction: "",
    followUpActionDate: "",
    date: "2023-12-10",
    assignmentInstructionsInPlace: "Yes" as const,
    assignmentInstructionsDate: "2023-05-15",
    createdAt: "2023-12-10T12:30:00.000Z",
    status: "Completed" as const,
    recommendations: "",
    updatedAt: "2023-12-10T12:30:00.000Z"
  },
  {
    id: "sv002",
    actionId: "ACT67890",
    siteVisitId: "SV12345",
    customer: "MCS",
    customerName: "Midcounties COOP",
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
    healthAndSafetyInPlace: "Yes",
    dateHSRiskAssessment: "2023-10-05",
    trainingInstructionsGivenDate: "2023-10-05",
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
    followUpActionDate: "2024-02-15",
    date: "2024-01-22",
    assignmentInstructionsInPlace: "Yes",
    assignmentInstructionsDate: "2023-06-10",
    createdAt: "2024-01-22T09:15:00.000Z",
    status: "Follow-up Required",
    recommendations: "Additional training needed",
    updatedAt: "2024-01-22T09:15:00.000Z"
  },
  {
    id: "sv003",
    actionId: "ACT24680",
    siteVisitId: "SV97531",
    customer: "HOE",
    customerName: "Heart of England",
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
    healthAndSafetyInPlace: "Yes",
    dateHSRiskAssessment: "2023-09-15",
    trainingInstructionsGivenDate: "2023-09-15",
    jumper: "Good",
    shirt: "Good",
    tie: "Good",
    hiVisJacket: "Good",
    jacket: "Good",
    trousers: "Good",
    epaulettes: "Good",
    shoes: "Good",
    trainingInstructions: "Standard training completed",
    securityOfficerSign: "J. Smith",
    managerName: "GB2",
    followUpAction: "",
    followUpActionDate: "",
    date: "2024-02-08",
    assignmentInstructionsInPlace: "Yes",
    assignmentInstructionsDate: "2023-07-05",
    createdAt: "2024-02-08T14:45:00.000Z",
    status: "Completed",
    recommendations: "",
    updatedAt: "2024-02-08T14:45:00.000Z"
  }
];

// After the mockVisits array, add more mock data to demonstrate pagination
// Add more mockVisits items to demonstrate pagination (add after existing mockVisits)
const additionalMockVisits = Array.from({ length: 15 }, (_, i) => ({
  id: `sv${(i + 4).toString().padStart(3, '0')}`,
  actionId: `ACT${Math.floor(10000 + Math.random() * 90000)}`,
  siteVisitId: `SV${Math.floor(10000 + Math.random() * 90000)}`,
  customer: i % 2 === 0 ? "HOE" : "MCS",
  customerName: i % 2 === 0 ? "Heart of England" : "Midcounties COOP",
  region: i % 3 === 0 ? "SD" : "LP",
  regionName: i % 3 === 0 ? "Store Detective" : "Loss Prevention",
  location: i % 2 === 0 ? "SAR" : "SHR",
  locationName: i % 2 === 0 ? "SD Alfia Road" : "SD High Road",
  visitType: (i % 2 === 0 ? "retail" : "warehouse") as 'retail' | 'warehouse' | 'office',
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
  assignmentInstructionsUnderstood: i % 5 === 0 ? "No" : "Yes" as 'Yes' | 'No',
  healthAndSafetyUnderstood: i % 5 === 0 ? "No" : "Yes" as 'Yes' | 'No',
  healthAndSafetyInPlace: i % 5 === 0 ? "No" : "Yes" as 'Yes' | 'No',
  dateHSRiskAssessment: `2023-${Math.floor(1 + Math.random() * 12).toString().padStart(2, '0')}-${Math.floor(1 + Math.random() * 28).toString().padStart(2, '0')}`,
  trainingInstructionsGivenDate: `2023-${Math.floor(1 + Math.random() * 12).toString().padStart(2, '0')}-${Math.floor(1 + Math.random() * 28).toString().padStart(2, '0')}`,
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
  followUpActionDate: i % 3 === 0 ? "" : `2024-${Math.floor(1 + Math.random() * 12).toString().padStart(2, '0')}-${Math.floor(1 + Math.random() * 28).toString().padStart(2, '0')}`,
  date: `${2023 + Math.floor(i / 8)}-${Math.floor(1 + Math.random() * 12).toString().padStart(2, '0')}-${Math.floor(1 + Math.random() * 28).toString().padStart(2, '0')}`,
  assignmentInstructionsInPlace: i % 5 === 0 ? "No" : "Yes" as 'Yes' | 'No',
  assignmentInstructionsDate: `2023-${Math.floor(1 + Math.random() * 12).toString().padStart(2, '0')}-${Math.floor(1 + Math.random() * 28).toString().padStart(2, '0')}`,
  createdAt: new Date(2023, Math.floor(i / 4), 15 + i).toISOString(),
  status: i % 4 === 0 ? "Follow-up Required" : "Completed" as 'Completed' | 'Follow-up Required',
  recommendations: i % 3 === 0 ? "" : "Additional training recommended",
  updatedAt: new Date(2023, Math.floor(i / 4), 15 + i).toISOString()
}));

// Update the mock data constant
export const allMockVisits: SiteVisit[] = [...mockVisits, ...additionalMockVisits].map(visit => ({
  ...visit,
  visitType: visit.visitType as 'retail' | 'warehouse' | 'office',
  healthAndSafetyInPlace: (visit.healthAndSafetyInPlace || 'Yes') as 'Yes' | 'No',
  healthAndSafetyUnderstood: (visit.healthAndSafetyUnderstood || 'Yes') as 'Yes' | 'No',
  assignmentInstructionsUnderstood: (visit.assignmentInstructionsUnderstood || 'Yes') as 'Yes' | 'No',
  assignmentInstructionsInPlace: (visit.assignmentInstructionsInPlace || 'Yes') as 'Yes' | 'No',
  status: (visit.status || 'Completed') as 'Completed' | 'Follow-up Required',
  trainingInstructionsGivenDate: visit.trainingInstructionsGivenDate || visit.date || visit.createdAt.split('T')[0],
  dateHSRiskAssessment: visit.dateHSRiskAssessment || visit.date || visit.createdAt.split('T')[0],
  assignmentInstructionsDate: visit.assignmentInstructionsDate || visit.date || visit.createdAt.split('T')[0],
  date: visit.date || visit.createdAt.split('T')[0],
  jumper: visit.jumper || 'Good',
  shirt: visit.shirt || 'Good',
  tie: visit.tie || 'Good',
  hiVisJacket: visit.hiVisJacket || 'Good',
  jacket: visit.jacket || 'Good',
  trousers: visit.trousers || 'Good',
  epaulettes: visit.epaulettes || 'Good',
  shoes: visit.shoes || 'Good',
  trainingInstructions: visit.trainingInstructions || '',
  securityOfficerSign: visit.securityOfficerSign || '',
  managerName: visit.managerName || '',
  followUpAction: visit.followUpAction || '',
  followUpActionDate: visit.followUpActionDate || '',
  recommendations: visit.recommendations || '',
  updatedAt: visit.updatedAt || visit.createdAt
}));

// Add formatDate helper at the top of the file after imports
const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Form validation schema
const formSchema = z.object({
  actionId: z.string().optional(),
  siteVisitId: z.string().optional(),
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
  }).min(1, "SIA licence number is required"),
  siaLicenceExpiry: z.string().optional(),
  recordOfIncidentsCompletion: z.string().optional(),
  dailyOccurrenceBookCompletion: z.string().optional(),
  pocketBookCompletion: z.string().optional(),
  ecrCompletion: z.string().optional(),
  top20Lines: z.string().optional(),
  assignmentInstructions: z.string().optional(),
  assignmentInstructionsUnderstood: z.string().optional(),
  healthAndSafetyUnderstood: z.string().optional(),
  dateHSRiskAssessment: z.string().optional(),
  jumper: z.string().optional(),
  shirt: z.string().optional(),
  tie: z.string().optional(),
  hiVisJacket: z.string().optional(),
  jacket: z.string().optional(),
  trousers: z.string().optional(),
  epaulettes: z.string().optional(),
  shoes: z.string().optional(),
  trainingInstructions: z.string().optional(),
  securityOfficerSign: z.string().optional(),
  managerName: z.string({
    required_error: "Please select a manager",
  }).refine((value) => mockManagers.some(m => m.id === value), {
    message: "Please select a valid manager"
  }),
  followUpAction: z.string().optional(),
  date: z.string({
    required_error: "Please select a date",
  }),
  assignmentInstructionsInPlace: z.string().optional(),
  assignmentInstructionsDate: z.string().optional(),
  healthAndSafetyInPlace: z.string().optional(),
  trainingInstructionsGivenDate: z.string().optional(),
  followUpActionDate: z.string().optional(),
  recommendations: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SiteVisitPageProps {
  customerId?: string;
  siteId?: string;
}

export default function SiteVisitPage({ customerId, siteId }: SiteVisitPageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [editingVisit, setEditingVisit] = useState<SiteVisit | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Load initial data
  useEffect(() => {
    const loadVisits = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 [SiteVisitPage] Loading visits with filters:', { customerId, siteId, currentPage, searchQuery });
        
        const params: any = {
          page: currentPage,
          pageSize: itemsPerPage,
          search: searchQuery
        };
        
        // Add customer and site filters if provided
        if (customerId) params.customerId = customerId;
        if (siteId) params.siteId = siteId;
        
        const response = await siteVisitService.getSiteVisits(params);
        console.log('📤 [SiteVisitPage] Site visits response:', response);
        setVisits(response.data);
        setTotalPages(response.totalPages);
        setTotalCount(response.total);
      } catch (error) {
        console.error('❌ [SiteVisitPage] Failed to load visits:', error);
        toast.error('Failed to load site visits', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadVisits();
  }, [currentPage, itemsPerPage, searchQuery, customerId, siteId]);

  // Server-side pagination is used. "visits" already contains only current page items.

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
      actionId: mockData.actionId || `ACT-${Date.now()}`,
      siteVisitId: mockData.siteVisitId || `SV-${Date.now()}`,
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
      healthAndSafetyInPlace: "",
      trainingInstructionsGivenDate: "",
      followUpActionDate: "",
      recommendations: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log('=== FORM SUBMISSION STARTED ===')
    console.log('onSubmit called with data:', data)
    console.log('editingVisit:', editingVisit)
    
    setIsLoading(true)
    try {
      // Common data transformation
      const commonData = {
        actionId: data.actionId || `ACT-${Date.now()}`,
        siteVisitId: data.siteVisitId || `SV-${Date.now()}`,
        customer: data.customer,
        region: data.region,
        location: data.location,
        visitType: data.visitType as 'retail' | 'warehouse' | 'office',
        date: data.date,
        idBadgeExpiry: data.idBadgeExpiry || '',
        siaLicenceNumber: data.siaLicenceNumber || '',
        siaLicenceExpiry: data.siaLicenceExpiry || '',
        recordOfIncidentsCompletion: data.recordOfIncidentsCompletion || 'Yes',
        dailyOccurrenceBookCompletion: data.dailyOccurrenceBookCompletion || 'Yes',
        pocketBookCompletion: data.pocketBookCompletion || 'Yes',
        ecrCompletion: data.ecrCompletion || 'Yes',
        top20Lines: data.top20Lines || 'Completed',
        assignmentInstructions: data.assignmentInstructions || 'In place',
        assignmentInstructionsUnderstood: (data.assignmentInstructionsUnderstood || 'Yes') as 'Yes' | 'No',
        healthAndSafetyUnderstood: (data.healthAndSafetyUnderstood || 'Yes') as 'Yes' | 'No',
        dateHSRiskAssessment: data.dateHSRiskAssessment || data.date,
        jumper: data.jumper || 'Good',
        shirt: data.shirt || 'Good',
        tie: data.tie || 'Good',
        hiVisJacket: data.hiVisJacket || 'Good',
        jacket: data.jacket || 'Good',
        trousers: data.trousers || 'Good',
        epaulettes: data.epaulettes || 'Good',
        shoes: data.shoes || 'Good',
        trainingInstructions: data.trainingInstructions || '',
        securityOfficerSign: data.securityOfficerSign || 'Digital Signature',
        followUpAction: data.followUpAction || '',
        followUpActionDate: data.followUpActionDate || '',
        assignmentInstructionsInPlace: (data.assignmentInstructionsInPlace || 'Yes') as 'Yes' | 'No',
        assignmentInstructionsDate: data.assignmentInstructionsDate || data.date,
        healthAndSafetyInPlace: (data.healthAndSafetyInPlace || 'Yes') as 'Yes' | 'No',
        trainingInstructionsGivenDate: data.trainingInstructionsGivenDate || data.date,
        recommendations: data.recommendations || '',
        status: 'Completed' as 'Completed' | 'Follow-up Required',
        // Add display names
        customerName: mockCustomers.find(c => c.id === data.customer)?.name || data.customer,
        officerName: mockOfficers.find(o => o.id === data.officerName)?.name || data.officerName,
        managerName: mockManagers.find(m => m.id === data.managerName)?.name || data.managerName || 'Manager',
        locationName: mockLocations.find(l => l.id === data.location)?.name || data.location,
        regionName: mockRegions.find(r => r.id === data.region)?.name || data.region,
      }

      console.log('Transformed data:', commonData)

      if (editingVisit) {
        console.log('=== UPDATING EXISTING VISIT ===')
        console.log('Calling updateSiteVisit with ID:', editingVisit.id)
        
        const updated = await siteVisitService.updateSiteVisit(editingVisit.id, commonData)
        console.log('Update successful:', updated)
        
        setVisits(currentVisits => currentVisits.map(visit => visit.id === editingVisit.id ? updated : visit))
        toast.success('Site visit has been updated successfully! 🎉', {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        console.log('=== CREATING NEW VISIT ===')
        console.log('Calling createSiteVisit')
        
        const created = await siteVisitService.createSiteVisit(commonData)
        console.log('Create successful:', created)
        
        setVisits(currentVisits => [created, ...currentVisits])
        setTotalCount(count => count + 1)
        toast.success('New site visit has been created successfully! ✨', {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      
      console.log('=== CLOSING DIALOG ===')
      setIsDialogOpen(false)
      setEditingVisit(null)
      form.reset()
      
      console.log('=== FORM SUBMISSION COMPLETED SUCCESSFULLY ===')
    } catch (error) {
      console.error('=== FORM SUBMISSION ERROR ===')
      console.error('Save/Update error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      toast.error(`Failed to save site visit: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false)
      console.log('=== FORM SUBMISSION ENDED ===')
    }
  }

  // Handle create site visit
  const handleCreateVisit = () => {
    setEditingVisit(null);
    form.reset({
      actionId: `ACT-${Date.now()}`,
      siteVisitId: `SV-${Date.now()}`,
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
      healthAndSafetyInPlace: '',
      trainingInstructionsGivenDate: '',
      followUpActionDate: '',
      trainingInstructions: '',
      followUpAction: '',
      recommendations: '',
      securityOfficerSign: '',
      managerName: ''
    });
    setIsDialogOpen(true);
  };

  // Handle edit site visit
  const handleEditVisit = (visit: any) => {
    setEditingVisit(visit);
    form.reset({
      actionId: visit.actionId || `ACT-${Date.now()}`,
      siteVisitId: visit.siteVisitId || `SV-${Date.now()}`,
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
      healthAndSafetyInPlace: visit.healthAndSafetyInPlace || '',
      trainingInstructionsGivenDate: visit.trainingInstructionsGivenDate || '',
      followUpActionDate: visit.followUpActionDate || '',
      trainingInstructions: visit.trainingInstructions || '',
      followUpAction: visit.followUpAction || '',
      recommendations: visit.recommendations || '',
      securityOfficerSign: visit.securityOfficerSign || '',
      managerName: mockManagers.find(m => m.name === visit.managerName)?.id || '',
    });
    setIsDialogOpen(true);
  };
  
  // Handle delete site visit
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle confirm delete
  const handleDeleteConfirm = async () => {
    if (deleteId) {
      try {
        await siteVisitService.deleteSiteVisit(deleteId);
        setVisits(currentVisits => currentVisits.filter(visit => visit.id !== deleteId));
        setTotalCount(count => Math.max(0, count - 1));
        setIsDeleteDialogOpen(false);
        setDeleteId(null);
        
        toast.success('Site visit has been deleted successfully! 🗑️', {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete site visit', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
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
                <div className="text-sm sm:text-base lg:text-lg xl:text-2xl 2xl:text-3xl font-bold text-white">{totalCount}</div>
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
              Found {totalCount} {totalCount === 1 ? 'result' : 'results'}
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
                  {visits.length === 0 ? (
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
                    visits.map((visit) => (
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
                <h3 className="font-medium text-base mb-4">Assignment Instructions in place</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="assignmentInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignment Instructions in place</FormLabel>
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
                    name="assignmentInstructionsUnderstood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignment Instructions Understood</FormLabel>
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
                        <FormLabel>Assignment Instructions Date</FormLabel>
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
                        <FormLabel>H&S Instructions In Place</FormLabel>
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
                    name="trainingInstructionsGivenDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Training Instructions Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="followUpActionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Follow-up Action Date</FormLabel>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="recommendations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recommendations</FormLabel>
                      <FormControl>
                        <textarea 
                          {...field}
                          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter any recommendations..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="px-4 pb-4 sm:px-6 sm:pb-6 pt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto order-2 sm:order-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto order-1 sm:order-2"
                  onClick={() => {
                    console.log('=== SUBMIT BUTTON CLICKED ===')
                    console.log('Form isValid:', form.formState.isValid)
                    console.log('Form errors:', form.formState.errors)
                    console.log('Form values:', form.getValues())
                    console.log('Is submitting:', form.formState.isSubmitting)
                    console.log('isDirty:', form.formState.isDirty)
                    console.log('isSubmitSuccessful:', form.formState.isSubmitSuccessful)
                    console.log('submitCount:', form.formState.submitCount)
                    
                    // Try manual validation
                    const values = form.getValues()
                    const validationResult = formSchema.safeParse(values)
                    console.log('Manual validation result:', validationResult)
                    
                    if (!validationResult.success) {
                      console.log('Validation errors:', validationResult.error.errors)
                    }
                  }}
                >
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