import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, PlusCircle, Search, Eye, Pencil, Trash2, Store, AlertCircle, PoundSterling, Clock, User, UserCircle, MapPin, Plus, FileText, ShoppingBagIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "lucide-react";

// Define the type for incidents
interface Incident {
  id: string;
  date: Date;
  time: { hour: string; minute: string };
  customerName: string;
  siteName: string;
  officerName: string;
  officerRole: string;
  dutyManagerName: string;
  incidentType: 'Theft' | 'Vandalism' | 'Customer Accident' | 'Suspicious Activity' | 'Other';
  description: string;
  otherComments?: string;
  policeInvolved: boolean;
  valueRecovered: number;
  offenderDetails?: {
    name?: string;
    sex?: 'male' | 'female' | 'other' | 'unknown';
    dateOfBirth?: Date;
    address?: string;
    town?: string;
    postCode?: string;
  };
  categories: {
    giftCardTheft: boolean;
    threatsAndIntimidation: boolean;
    nonStoreTheft: boolean;
    cashAndTill: boolean;
    alcoholInfluence: boolean;
    spitting: boolean;
    customerBehaviorPhysical: boolean;
    racialAbuseOrAttack: boolean;
  };
  stolenItems: StolenItem[];
}

// Update the state for stolen items to include category and quantity
interface StolenItem {
  category: string;
  name: string;
  value: number;
  quantity: number;
  total: number;
}

const IncidentsReportPage: React.FC = () => {
  // Sample data for incidents
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: "1",
      date: new Date(2024, 1, 15), // 2/15/2024
      time: { hour: "10", minute: "30" },
      customerName: "John Doe",
      siteName: "London Store",
      officerName: "John Smith",
      officerRole: "Security Officer",
      dutyManagerName: "Sarah Johnson",
      incidentType: "Theft",
      description: "Shoplifting incident involving high-value electronics",
      otherComments: "Individual took multiple items",
      policeInvolved: true,
      valueRecovered: 599.99,
      offenderDetails: {
        name: "Jane Doe",
        sex: "female",
        dateOfBirth: new Date(1990, 5, 15),
        address: "123 Main St, London",
        town: "London",
        postCode: "SW1A 1AA"
      },
      categories: {
        giftCardTheft: true,
        threatsAndIntimidation: false,
        nonStoreTheft: false,
        cashAndTill: false,
        alcoholInfluence: false,
        spitting: false,
        customerBehaviorPhysical: false,
        racialAbuseOrAttack: false
      },
      stolenItems: [{ category: "electronics", name: "Laptop", value: 599.99, quantity: 1, total: 599.99 }]
    },
    {
      id: "2",
      date: new Date(2024, 1, 14), // 2/14/2024
      time: { hour: "14", minute: "00" },
      customerName: "Jane Smith",
      siteName: "Manchester Store",
      officerName: "Michael Brown",
      officerRole: "Security Manager",
      dutyManagerName: "Sarah Johnson",
      incidentType: "Vandalism",
      description: "Graffiti found on the back wall of the store",
      otherComments: "Graffiti was removed immediately",
      policeInvolved: false,
      valueRecovered: 0,
      offenderDetails: undefined,
      categories: {
        giftCardTheft: false,
        threatsAndIntimidation: false,
        nonStoreTheft: false,
        cashAndTill: false,
        alcoholInfluence: false,
        spitting: false,
        customerBehaviorPhysical: false,
        racialAbuseOrAttack: false
      },
      stolenItems: []
    },
    {
      id: "3",
      date: new Date(2024, 1, 13), // 2/13/2024
      time: { hour: "10", minute: "00" },
      customerName: "Bob Johnson",
      siteName: "Birmingham Store",
      officerName: "Sarah Johnson",
      officerRole: "Supervisor",
      dutyManagerName: "Sarah Johnson",
      incidentType: "Customer Accident",
      description: "Slip and fall incident in the produce section",
      otherComments: "Customer was assisted by store staff",
      policeInvolved: false,
      valueRecovered: 0,
      offenderDetails: undefined,
      categories: {
        giftCardTheft: false,
        threatsAndIntimidation: false,
        nonStoreTheft: false,
        cashAndTill: false,
        alcoholInfluence: false,
        spitting: false,
        customerBehaviorPhysical: true,
        racialAbuseOrAttack: false
      },
      stolenItems: []
    },
    {
      id: "4",
      date: new Date(2024, 1, 12), // 2/12/2024
      time: { hour: "15", minute: "30" },
      customerName: "Alice Johnson",
      siteName: "Leeds Store",
      officerName: "Michael Brown",
      officerRole: "Security Officer",
      dutyManagerName: "Sarah Johnson",
      incidentType: "Theft",
      description: "Multiple items concealed in bag",
      otherComments: "Customer was caught on CCTV",
      policeInvolved: true,
      valueRecovered: 245.50,
      offenderDetails: {
        name: "Bob Johnson",
        sex: "male",
        dateOfBirth: new Date(1985, 10, 20),
        address: "456 Elm St, Leeds",
        town: "Leeds",
        postCode: "LS1 1AB"
      },
      categories: {
        giftCardTheft: true,
        threatsAndIntimidation: false,
        nonStoreTheft: false,
        cashAndTill: false,
        alcoholInfluence: false,
        spitting: false,
        customerBehaviorPhysical: false,
        racialAbuseOrAttack: false
      },
      stolenItems: [{ category: "electronics", name: "Mobile Phone", value: 245.50, quantity: 1, total: 245.50 }]
    },
    {
      id: "5",
      date: new Date(2024, 1, 11), // 2/11/2024
      time: { hour: "11", minute: "00" },
      customerName: "Eve Smith",
      siteName: "Glasgow Store",
      officerName: "Sarah Johnson",
      officerRole: "Security Officer",
      dutyManagerName: "Sarah Johnson",
      incidentType: "Suspicious Activity",
      description: "Individual taking photos of security camera locations",
      otherComments: "Caught on CCTV",
      policeInvolved: true,
      valueRecovered: 0,
      offenderDetails: undefined,
      categories: {
        giftCardTheft: false,
        threatsAndIntimidation: false,
        nonStoreTheft: false,
        cashAndTill: false,
        alcoholInfluence: false,
        spitting: false,
        customerBehaviorPhysical: false,
        racialAbuseOrAttack: false
      },
      stolenItems: []
    }
  ]);

  // State for search
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for new incident dialog
  const [isNewIncidentDialogOpen, setIsNewIncidentDialogOpen] = useState(false);
  const [isViewIncidentDialogOpen, setIsViewIncidentDialogOpen] = useState(false);
  const [isEditIncidentDialogOpen, setIsEditIncidentDialogOpen] = useState(false);
  const [isDeleteIncidentDialogOpen, setIsDeleteIncidentDialogOpen] = useState(false);
  
  // State for form fields
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [incidentDate, setIncidentDate] = useState<Date | undefined>(undefined);
  const [incidentTime, setIncidentTime] = useState({ hour: "", minute: "" });
  const [customerName, setCustomerName] = useState("");
  const [siteName, setSiteName] = useState("");
  const [officerName, setOfficerName] = useState("");
  const [officerRole, setOfficerRole] = useState("");
  const [dutyManagerName, setDutyManagerName] = useState("");
  const [incidentType, setIncidentType] = useState<Incident['incidentType'] | "">("");
  const [description, setDescription] = useState("");
  const [otherComments, setOtherComments] = useState("");
  const [policeInvolved, setPoliceInvolved] = useState(false);
  const [valueRecovered, setValueRecovered] = useState("");
  const [offenderDetails, setOffenderDetails] = useState<Incident['offenderDetails']>({});
  const [categories, setCategories] = useState({
    giftCardTheft: false,
    threatsAndIntimidation: false,
    nonStoreTheft: false,
    cashAndTill: false,
    alcoholInfluence: false,
    spitting: false,
    customerBehaviorPhysical: false,
    racialAbuseOrAttack: false
  });
  const [stolenItems, setStolenItems] = useState<StolenItem[]>([]);

  // Add new state variables for the stolen item form
  const [itemCategory, setItemCategory] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemCost, setItemCost] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");

  // Filter incidents based on search query
  const filteredIncidents = incidents.filter(incident => 
    incident.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    incident.incidentType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate summary statistics
  const totalAmountSaved = incidents.reduce((sum, incident) => sum + incident.valueRecovered, 0);
  const uniqueStores = new Set(incidents.map(incident => incident.siteName)).size;
  const totalIncidents = incidents.length;

  // Reset form function
  const resetForm = () => {
    setIncidentDate(undefined);
    setIncidentTime({ hour: "", minute: "" });
    setCustomerName("");
    setSiteName("");
    setOfficerName("");
    setOfficerRole("");
    setDutyManagerName("");
    setIncidentType("");
    setDescription("");
    setOtherComments("");
    setPoliceInvolved(false);
    setValueRecovered("");
    setOffenderDetails({});
    setCategories({
      giftCardTheft: false,
      threatsAndIntimidation: false,
      nonStoreTheft: false,
      cashAndTill: false,
      alcoholInfluence: false,
      spitting: false,
      customerBehaviorPhysical: false,
      racialAbuseOrAttack: false
    });
    setStolenItems([]);
    setItemCategory("");
    setItemDescription("");
    setItemCost("");
    setItemQuantity("1");
  };

  // Open new incident dialog
  const openNewIncidentDialog = () => {
    resetForm();
    setIsNewIncidentDialogOpen(true);
  };

  // Open view incident dialog
  const openViewIncidentDialog = (incident: Incident) => {
    // Ensure stolenItems has the correct structure before viewing
    const updatedIncident = {
      ...incident,
      stolenItems: incident.stolenItems.map(item => {
        if ('category' in item && 'quantity' in item && 'total' in item) {
          return item;
        } else {
          // Convert old format to new format using type assertion
          const oldItem = item as unknown as { name: string; value: number };
          return {
            category: 'other',
            name: oldItem.name,
            value: oldItem.value,
            quantity: 1,
            total: oldItem.value
          };
        }
      })
    };
    
    setSelectedIncident(updatedIncident);
    setIsViewIncidentDialogOpen(true);
  };

  // Open edit incident dialog
  const openEditIncidentDialog = (incident: Incident) => {
    setSelectedIncident(incident);
    setIncidentDate(incident.date);
    setIncidentTime(incident.time || { hour: "00", minute: "00" });
    setCustomerName(incident.customerName || "");
    setSiteName(incident.siteName || "");
    setOfficerName(incident.officerName || "");
    setOfficerRole(incident.officerRole || "");
    setDutyManagerName(incident.dutyManagerName || "");
    setIncidentType(incident.incidentType);
    setDescription(incident.description || "");
    setOtherComments(incident.otherComments || "");
    setPoliceInvolved(incident.policeInvolved || false);
    setValueRecovered(incident.valueRecovered?.toString() || "0");
    setOffenderDetails(incident.offenderDetails || {});
    setCategories(incident.categories || {
      giftCardTheft: false,
      threatsAndIntimidation: false,
      nonStoreTheft: false,
      cashAndTill: false,
      alcoholInfluence: false,
      spitting: false,
      customerBehaviorPhysical: false,
      racialAbuseOrAttack: false
    });
    
    // Ensure stolenItems has the correct structure
    const updatedStolenItems = incident.stolenItems.map(item => {
      if ('category' in item && 'quantity' in item && 'total' in item) {
        return item;
      } else {
        // Convert old format to new format using type assertion
        const oldItem = item as unknown as { name: string; value: number };
        return {
          category: 'other',
          name: oldItem.name,
          value: oldItem.value,
          quantity: 1,
          total: oldItem.value
        };
      }
    });
    
    setStolenItems(updatedStolenItems);
    setIsEditIncidentDialogOpen(true);
  };

  // Open delete incident dialog
  const openDeleteIncidentDialog = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDeleteIncidentDialogOpen(true);
  };

  // Handle create incident
  const handleCreateIncident = () => {
    if (!incidentDate || !customerName || !siteName || !officerName || 
        !officerRole || !dutyManagerName || !incidentType || !description ||
        !incidentTime.hour || !incidentTime.minute) {
      // Show error toast for required fields
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newIncident: Incident = {
      id: Math.random().toString(36).substr(2, 9),
      date: incidentDate,
      time: incidentTime,
      customerName,
      siteName,
      officerName,
      officerRole,
      dutyManagerName,
      incidentType: incidentType as Incident['incidentType'],
      description,
      otherComments,
      policeInvolved,
      valueRecovered: stolenItems.reduce((sum, item) => sum + item.total, 0),
      offenderDetails,
      categories,
      stolenItems
    };

    setIncidents([newIncident, ...incidents]);
    setIsNewIncidentDialogOpen(false);
    toast({
      title: "Success",
      description: "Incident created successfully",
      variant: "default"
    });
  };

  // Handle edit incident
  const handleEditIncident = () => {
    if (!selectedIncident || !incidentDate || !customerName || !siteName || 
        !officerName || !officerRole || !dutyManagerName || !incidentType || 
        !description || !incidentTime.hour || !incidentTime.minute) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const updatedIncidents = incidents.map(incident => {
      if (incident.id === selectedIncident.id) {
        return {
          ...incident,
          date: incidentDate,
          time: incidentTime,
          customerName,
          siteName,
          officerName,
          officerRole,
          dutyManagerName,
          incidentType: incidentType as Incident['incidentType'],
          description,
          otherComments,
          policeInvolved,
          valueRecovered: stolenItems.reduce((sum, item) => sum + item.total, 0),
          offenderDetails,
          categories,
          stolenItems
        };
      }
      return incident;
    });

    setIncidents(updatedIncidents);
    setIsEditIncidentDialogOpen(false);
    toast({
      title: "Success",
      description: "Incident updated successfully",
      variant: "default"
    });
  };

  // Handle delete incident
  const handleDeleteIncident = () => {
    if (!selectedIncident) return;

    const updatedIncidents = incidents.filter(incident => incident.id !== selectedIncident.id);
    setIncidents(updatedIncidents);
    setIsDeleteIncidentDialogOpen(false);
  };

  // Add functionality to add stolen items
  const handleAddStolenItem = () => {
    if (!itemCategory || !itemDescription || !itemCost) {
      toast({
        title: "Error",
        description: "Please fill in all required fields for the stolen item",
        variant: "destructive"
      });
      return;
    }
    
    const cost = parseFloat(itemCost);
    const quantity = parseInt(itemQuantity) || 1;
    
    if (isNaN(cost)) {
      toast({
        title: "Error",
        description: "Please enter a valid number for cost",
        variant: "destructive"
      });
      return;
    }
    
    const total = cost * quantity;
    
    setStolenItems([...stolenItems, { 
      category: itemCategory, 
      name: itemDescription, 
      value: cost,
      quantity: quantity,
      total: total
    }]);
    
    // Reset form fields
    setItemCategory("");
    setItemDescription("");
    setItemCost("");
    setItemQuantity("1");
  };

  const handleRemoveStolenItem = (index: number) => {
    setStolenItems(stolenItems.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto px-1 sm:px-3 lg:px-4 py-2 sm:py-3 md:py-4 bg-gray-50 min-h-screen max-w-full overflow-x-hidden">
      {/* Header Section - Adjust for smaller screens */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
        <div className="flex items-start sm:items-center gap-2 w-full sm:w-auto">
          <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg shrink-0">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold">Incident Reports</h1>
            <p className="text-[11px] sm:text-xs md:text-sm text-gray-500">Track and manage security incidents across all stores</p>
          </div>
        </div>
        <Button 
          onClick={openNewIncidentDialog}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-8 sm:h-9"
        >
          <PlusCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
          New Incident
        </Button>
      </div>

      {/* Summary Cards - Adjust sizes for smaller screens */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
        <Card className="border border-blue-800 bg-[#1e3a8a] shadow-lg">
          <CardContent className="p-2 sm:p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] sm:text-xs md:text-sm text-blue-100 font-medium">Total Amount Saved</p>
                <p className="text-sm sm:text-base md:text-xl font-bold text-white overflow-hidden text-ellipsis">
                  £{totalAmountSaved.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-800 bg-opacity-50 p-1 sm:p-1.5 rounded-full">
                <PoundSterling className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-green-800 bg-[#064e3b] shadow-lg">
          <CardContent className="p-2 sm:p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] sm:text-xs md:text-sm text-green-100 font-medium">Unique Stores</p>
                <p className="text-sm sm:text-base md:text-xl font-bold text-white">{uniqueStores}</p>
              </div>
              <div className="bg-green-800 bg-opacity-50 p-1 sm:p-1.5 rounded-full">
                <Store className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-2 lg:col-span-1 border border-purple-800 bg-[#581c87] shadow-lg">
          <CardContent className="p-2 sm:p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] sm:text-xs md:text-sm text-purple-100 font-medium">Total Incidents</p>
                <p className="text-sm sm:text-base md:text-xl font-bold text-white">{totalIncidents}</p>
              </div>
              <div className="bg-purple-800 bg-opacity-50 p-1 sm:p-1.5 rounded-full">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table Card */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          {/* Search Section */}
          <div className="p-3 sm:p-4 border-b">
            <div className="relative w-full max-w-[400px] mx-auto sm:mx-0">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400" />
              <Input
                placeholder="Search incidents..."
                className="pl-8 sm:pl-9 pr-3 sm:pr-4 py-1 sm:py-1.5 w-full text-xs sm:text-sm bg-gray-50 h-8 sm:h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Responsive Table */}
          <div className="w-full overflow-x-auto px-3 sm:px-4">
            <div className="min-w-[320px] sm:min-w-[768px]">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="w-[100px] md:w-[120px] text-[11px] sm:text-xs font-medium text-gray-600 whitespace-nowrap py-3 px-4">
                      Date/Time
                    </TableHead>
                    <TableHead className="text-[11px] sm:text-xs font-medium text-gray-600 whitespace-nowrap py-3 px-4">
                      Site/Incident Type
                    </TableHead>
                    <TableHead className="text-[11px] sm:text-xs font-medium text-gray-600 whitespace-nowrap py-3 px-4">
                      Officer Details
                    </TableHead>
                    <TableHead className="text-[11px] sm:text-xs font-medium text-gray-600 whitespace-nowrap py-3 px-4 text-right">
                      Value Recovered
                    </TableHead>
                    <TableHead className="w-[100px] text-[11px] sm:text-xs font-medium text-gray-600 whitespace-nowrap py-3 px-4 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((incident) => (
                    <TableRow 
                      key={incident.id} 
                      className="group border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="py-3 px-4">
                        <div className="space-y-1">
                          <p className="text-[11px] sm:text-sm font-medium text-gray-900">
                            {format(incident.date, "dd/MM/yy")}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            {incident.time.hour.padStart(2, '0')}:{incident.time.minute.padStart(2, '0')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="space-y-1.5">
                          <p className="text-[11px] sm:text-sm font-medium text-gray-900">
                            {incident.siteName}
                          </p>
                          <span className={cn(
                            "inline-block px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium",
                            incident.incidentType === "Theft" && "bg-red-100 text-red-800",
                            incident.incidentType === "Vandalism" && "bg-orange-100 text-orange-800",
                            incident.incidentType === "Customer Accident" && "bg-yellow-100 text-yellow-800",
                            incident.incidentType === "Suspicious Activity" && "bg-blue-100 text-blue-800",
                            incident.incidentType === "Other" && "bg-gray-100 text-gray-800"
                          )}>
                            {incident.incidentType}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="space-y-1">
                          <p className="text-[11px] sm:text-sm font-medium text-gray-900">
                            {incident.officerName}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            {incident.officerRole}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="text-right space-y-1.5">
                          <span className={cn(
                            "text-[11px] sm:text-sm font-medium",
                            incident.valueRecovered > 0 ? "text-green-600" : "text-gray-500"
                          )}>
                            £{incident.valueRecovered.toFixed(2)}
                          </span>
                          {incident.policeInvolved && (
                            <div className="flex justify-end">
                              <span className="text-[10px] sm:text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                Police Involved
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex justify-end items-center gap-2">
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-90 hover:opacity-100 hover:bg-blue-50"
                            onClick={() => openViewIncidentDialog(incident)}
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-600" />
                          </Button>
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-90 hover:opacity-100 hover:bg-amber-50"
                            onClick={() => openEditIncidentDialog(incident)}
                          >
                            <Pencil className="h-3.5 w-3.5 text-amber-600" />
                          </Button>
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-90 hover:opacity-100 hover:bg-red-50"
                            onClick={() => openDeleteIncidentDialog(incident)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs - Update for better mobile display */}
      <Dialog open={isNewIncidentDialogOpen} onOpenChange={setIsNewIncidentDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[900px] h-[90vh] overflow-y-auto p-2 sm:p-3 md:p-4">
          {/* ... rest of the dialog content ... */}
        </DialogContent>
      </Dialog>

      {/* ... rest of the dialogs ... */}
    </div>
  );
};

export default IncidentsReportPage;


