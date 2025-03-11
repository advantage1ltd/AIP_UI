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
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-lg">
            <AlertCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Incident Reports</h1>
            <p className="text-gray-500 text-sm">Track and manage security incidents across all stores</p>
          </div>
        </div>
        <Button 
          onClick={openNewIncidentDialog}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New Incident
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-700 font-medium text-sm">Total Amount Saved</p>
                <div className="flex items-center">
                  <p className="text-3xl font-bold text-blue-700">£{totalAmountSaved.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <PoundSterling className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-700 font-medium text-sm">Unique Stores</p>
                <p className="text-3xl font-bold text-green-700">{uniqueStores}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <Store className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-100">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-purple-700 font-medium text-sm">Total Incidents</p>
                <p className="text-3xl font-bold text-purple-700">{totalIncidents}</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Search and Table */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search incidents..."
                className="pl-10 bg-gray-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[120px] font-medium text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead className="font-medium text-gray-600">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-gray-400" />
                      Site Name
                    </div>
                  </TableHead>
                  <TableHead className="font-medium text-gray-600">Incident Type</TableHead>
                  <TableHead className="font-medium text-gray-600">Description</TableHead>
                  <TableHead className="font-medium text-gray-600">Value Recovered</TableHead>
                  <TableHead className="text-right font-medium text-gray-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident) => (
                  <TableRow key={incident.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {format(incident.date, "M/d/yyyy")}
                    </TableCell>
                    <TableCell>{incident.siteName}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        incident.incidentType === "Theft" && "bg-red-100 text-red-800",
                        incident.incidentType === "Vandalism" && "bg-orange-100 text-orange-800",
                        incident.incidentType === "Customer Accident" && "bg-yellow-100 text-yellow-800",
                        incident.incidentType === "Suspicious Activity" && "bg-blue-100 text-blue-800",
                        incident.incidentType === "Other" && "bg-gray-100 text-gray-800"
                      )}>
                        {incident.incidentType}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">{incident.description}</TableCell>
                    <TableCell className={cn(
                      incident.valueRecovered > 0 ? "text-green-600 font-medium" : "text-gray-500"
                    )}>
                      {incident.valueRecovered > 0 ? `£${incident.valueRecovered.toFixed(2)}` : "£0.00"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-50"
                          onClick={() => openViewIncidentDialog(incident)}
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-amber-50"
                          onClick={() => openEditIncidentDialog(incident)}
                        >
                          <Pencil className="h-4 w-4 text-amber-600" />
                        </Button>
                        
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50"
                          onClick={() => openDeleteIncidentDialog(incident)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* New Incident Dialog */}
      <Dialog open={isNewIncidentDialogOpen} onOpenChange={setIsNewIncidentDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">New Incident Report</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Fill in the details of the security incident below. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <UserCircle className="h-5 w-5" />
                <h3 className="text-md font-semibold">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Select value={customerName} onValueChange={setCustomerName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tesco">Tesco</SelectItem>
                      <SelectItem value="sainsburys">Sainsbury's</SelectItem>
                      <SelectItem value="asda">Asda</SelectItem>
                      <SelectItem value="morrisons">Morrisons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storeLocation">Store Location *</Label>
                  <Select value={siteName} onValueChange={setSiteName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="london">London Store</SelectItem>
                      <SelectItem value="manchester">Manchester Store</SelectItem>
                      <SelectItem value="birmingham">Birmingham Store</SelectItem>
                      <SelectItem value="leeds">Leeds Store</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="officerName">Officer Name *</Label>
                  <Select value={officerName} onValueChange={setOfficerName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select officer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john">John Smith</SelectItem>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="michael">Michael Brown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="officerRole">Officer Role *</Label>
                  <Select value={officerRole} onValueChange={setOfficerRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="security">Security Officer</SelectItem>
                      <SelectItem value="manager">Security Manager</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dutyManagerName">Duty Manager Name *</Label>
                  <Input id="dutyManagerName" placeholder="Enter duty manager name" value={dutyManagerName} onChange={(e) => setDutyManagerName(e.target.value)} />
                </div>
              </div>
            </div>
            
            {/* Incident Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <FileText className="h-5 w-5" />
                <h3 className="text-md font-semibold">Incident Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfIncident">Date of Incident *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !incidentDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {incidentDate ? format(incidentDate, "MM/dd/yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={incidentDate}
                        onSelect={setIncidentDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeOfIncident">Time of Incident *</Label>
                  <div className="flex items-center gap-2">
                    <Select value={incidentTime.hour} onValueChange={(value) => setIncidentTime(prev => ({ ...prev, hour: value }))}>
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="--" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>:</span>
                    <Select value={incidentTime.minute} onValueChange={(value) => setIncidentTime(prev => ({ ...prev, minute: value }))}>
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="--" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 60 }, (_, i) => (
                          <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="typeOfIncident">Type of Incident *</Label>
                  <Select 
                    value={incidentType} 
                    onValueChange={(value: Incident['incidentType'] | "") => setIncidentType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Theft">Theft</SelectItem>
                      <SelectItem value="Vandalism">Vandalism</SelectItem>
                      <SelectItem value="Customer Accident">Customer Accident</SelectItem>
                      <SelectItem value="Suspicious Activity">Suspicious Activity</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Description Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <AlertCircle className="h-5 w-5" />
                <h3 className="text-md font-semibold">Description</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="incidentDetails">Incident Details *</Label>
                <Textarea
                  id="incidentDetails"
                  placeholder="Describe the incident in detail"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otherComments">Other Comments</Label>
                <Textarea
                  id="otherComments"
                  placeholder="Add any other specific comments"
                  value={otherComments}
                  onChange={(e) => setOtherComments(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
            
            {/* Police Involvement Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <User className="h-5 w-5" />
                <h3 className="text-md font-semibold">Police Involvement</h3>
              </div>
              
              <div className="space-y-2">
                <Label>Was Police Involved?</Label>
                <RadioGroup value={policeInvolved ? "yes" : "no"} onValueChange={(value) => setPoliceInvolved(value === "yes")} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="police-yes" />
                    <Label htmlFor="police-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="police-no" />
                    <Label htmlFor="police-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            {/* Offender Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <User className="h-5 w-5" />
                <h3 className="text-md font-semibold">Offender Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="offenderName">Offender Name</Label>
                  <Input id="offenderName" placeholder="Enter offender name" value={offenderDetails?.name} onChange={(e) => setOffenderDetails(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="offenderSex">Offender Sex</Label>
                  <Select value={offenderDetails?.sex} onValueChange={(value) => setOffenderDetails(prev => ({ ...prev, sex: value as 'male' | 'female' | 'other' | 'unknown' }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="offenderDOB">Offender DOB</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal text-muted-foreground"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {offenderDetails?.dateOfBirth ? format(offenderDetails.dateOfBirth, "MM/dd/yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={offenderDetails?.dateOfBirth}
                        onSelect={(date) => setOffenderDetails(prev => ({ ...prev, dateOfBirth: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Enter home address" value={offenderDetails?.address} onChange={(e) => setOffenderDetails(prev => ({ ...prev, address: e.target.value }))} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="town">Town</Label>
                  <Input id="town" placeholder="Enter town" value={offenderDetails?.town} onChange={(e) => setOffenderDetails(prev => ({ ...prev, town: e.target.value }))} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="postCode">Post Code</Label>
                  <Input id="postCode" placeholder="Enter post code" value={offenderDetails?.postCode} onChange={(e) => setOffenderDetails(prev => ({ ...prev, postCode: e.target.value }))} />
                </div>
              </div>
            </div>
            
            {/* Incident Categories Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <FileText className="h-5 w-5" />
                <h3 className="text-md font-semibold">Incident Categories</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cat1" 
                    checked={categories.giftCardTheft}
                    onCheckedChange={(checked) => 
                      setCategories(prev => ({ ...prev, giftCardTheft: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cat1">Gift Card Theft</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cat2" 
                    checked={categories.threatsAndIntimidation}
                    onCheckedChange={(checked) => 
                      setCategories(prev => ({ ...prev, threatsAndIntimidation: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cat2">Threats And Intimidation</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cat3" 
                    checked={categories.nonStoreTheft}
                    onCheckedChange={(checked) => 
                      setCategories(prev => ({ ...prev, nonStoreTheft: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cat3">Non Store Theft</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cat4" 
                    checked={categories.cashAndTill}
                    onCheckedChange={(checked) => 
                      setCategories(prev => ({ ...prev, cashAndTill: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cat4">Cash And Till</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cat5" 
                    checked={categories.alcoholInfluence}
                    onCheckedChange={(checked) => 
                      setCategories(prev => ({ ...prev, alcoholInfluence: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cat5">Alcohol Influence</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cat6" 
                    checked={categories.spitting}
                    onCheckedChange={(checked) => 
                      setCategories(prev => ({ ...prev, spitting: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cat6">Spitting</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cat7" 
                    checked={categories.customerBehaviorPhysical}
                    onCheckedChange={(checked) => 
                      setCategories(prev => ({ ...prev, customerBehaviorPhysical: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cat7">Customer Behavior Physical</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cat8" 
                    checked={categories.racialAbuseOrAttack}
                    onCheckedChange={(checked) => 
                      setCategories(prev => ({ ...prev, racialAbuseOrAttack: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cat8">Racial Abuse or Attack</Label>
                </div>
              </div>
            </div>
            
            {/* Stolen Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold flex items-center">
                  <ShoppingBagIcon className="h-5 w-5 mr-2 text-amber-500" />
                  Stolen Items
                </h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddStolenItem}
                  className="flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-3">
                  <Label htmlFor="itemCategory">Category</Label>
                  <Select value={itemCategory} onValueChange={setItemCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="food">Food & Beverages</SelectItem>
                      <SelectItem value="cosmetics">Cosmetics</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-4">
                  <Label htmlFor="itemDescription">Description</Label>
                  <Input 
                    id="itemDescription" 
                    placeholder="Item description" 
                    value={itemDescription} 
                    onChange={(e) => setItemDescription(e.target.value)} 
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="itemCost">Cost</Label>
                  <Input 
                    id="itemCost" 
                    placeholder="0" 
                    value={itemCost} 
                    onChange={(e) => setItemCost(e.target.value)} 
                    type="number" 
                    step="0.01" 
                    min="0" 
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="itemQuantity">Qty</Label>
                  <Input 
                    id="itemQuantity" 
                    placeholder="1" 
                    value={itemQuantity} 
                    onChange={(e) => setItemQuantity(e.target.value)} 
                    type="number" 
                    min="1" 
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="itemTotal">Total</Label>
                  <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm text-right">
                    {isNaN(parseFloat(itemCost)) || isNaN(parseInt(itemQuantity)) 
                      ? "0" 
                      : (parseFloat(itemCost) * parseInt(itemQuantity)).toFixed(2)
                    }
                  </div>
                </div>
              </div>
              
              {stolenItems.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                        <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stolenItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900 capitalize">{item.category}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-right text-gray-900">£{item.value.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-right text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-right text-gray-900">£{item.total.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-right">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveStolenItem(index)}
                            >
                              <TrashIcon className="h-4 w-4 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-between p-4 bg-gray-50">
                    <div className="text-sm font-medium">Total Items: {stolenItems.length}</div>
                    <div className="text-sm font-medium">Total Value Recovered: £{stolenItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-md p-8 text-center">
                  <ShoppingBagIcon className="h-10 w-10 mx-auto text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">No items added yet</p>
                  <p className="text-xs text-gray-400">Fill in the fields above and click "Add Item"</p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsNewIncidentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateIncident}
              className="bg-green-600 hover:bg-green-700"
            >
              Save Incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Incident Dialog */}
      <Dialog open={isViewIncidentDialogOpen} onOpenChange={setIsViewIncidentDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Incident</DialogTitle>
            <DialogDescription>
              Incident details for {selectedIncident?.siteName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedIncident && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Basic Information</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-sm font-medium">Customer Name:</span>
                      <p className="text-sm">{selectedIncident.customerName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Store Location:</span>
                      <p className="text-sm">{selectedIncident.siteName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Officer Name:</span>
                      <p className="text-sm">{selectedIncident.officerName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Officer Role:</span>
                      <p className="text-sm">{selectedIncident.officerRole}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Duty Manager Name:</span>
                      <p className="text-sm">{selectedIncident.dutyManagerName}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Incident Details</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-sm font-medium">Date:</span>
                      <p className="text-sm">{format(selectedIncident.date, "MMMM d, yyyy")}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Time:</span>
                      <p className="text-sm">{selectedIncident.time.hour}:{selectedIncident.time.minute}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Incident Type:</span>
                      <p className="text-sm">
                        <Badge 
                          className={cn(
                            "mt-1",
                            selectedIncident.incidentType === "Theft" ? "bg-red-500" :
                            selectedIncident.incidentType === "Vandalism" ? "bg-orange-500" :
                            selectedIncident.incidentType === "Customer Accident" ? "bg-yellow-500" :
                            selectedIncident.incidentType === "Suspicious Activity" ? "bg-blue-500" :
                            "bg-gray-500"
                          )}
                        >
                          {selectedIncident.incidentType}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Value Recovered:</span>
                      <p className="text-sm font-semibold text-green-600">
                        £{selectedIncident.valueRecovered.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-2 text-sm whitespace-pre-wrap">{selectedIncident.description}</p>
              </div>
              
              {selectedIncident.otherComments && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Other Comments</h3>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{selectedIncident.otherComments}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Police Involved</h3>
                <p className="mt-2 text-sm">{selectedIncident.policeInvolved ? "Yes" : "No"}</p>
              </div>
              
              {selectedIncident.offenderDetails && Object.values(selectedIncident.offenderDetails).some(v => v) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Offender Details</h3>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedIncident.offenderDetails.name && (
                      <div>
                        <span className="text-sm font-medium">Name:</span>
                        <p className="text-sm">{selectedIncident.offenderDetails.name}</p>
                      </div>
                    )}
                    {selectedIncident.offenderDetails.sex && (
                      <div>
                        <span className="text-sm font-medium">Sex:</span>
                        <p className="text-sm capitalize">{selectedIncident.offenderDetails.sex}</p>
                      </div>
                    )}
                    {selectedIncident.offenderDetails.dateOfBirth && (
                      <div>
                        <span className="text-sm font-medium">Date of Birth:</span>
                        <p className="text-sm">{format(selectedIncident.offenderDetails.dateOfBirth, "MMMM d, yyyy")}</p>
                      </div>
                    )}
                    {selectedIncident.offenderDetails.address && (
                      <div>
                        <span className="text-sm font-medium">Address:</span>
                        <p className="text-sm">{selectedIncident.offenderDetails.address}</p>
                      </div>
                    )}
                    {selectedIncident.offenderDetails.town && (
                      <div>
                        <span className="text-sm font-medium">Town:</span>
                        <p className="text-sm">{selectedIncident.offenderDetails.town}</p>
                      </div>
                    )}
                    {selectedIncident.offenderDetails.postCode && (
                      <div>
                        <span className="text-sm font-medium">Post Code:</span>
                        <p className="text-sm">{selectedIncident.offenderDetails.postCode}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Incident Categories</h3>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(selectedIncident.categories).map(([key, value], index) => {
                    if (!value) return null;
                    
                    const categoryLabels: Record<string, string> = {
                      giftCardTheft: "Gift Card Theft",
                      threatsAndIntimidation: "Threats And Intimidation",
                      nonStoreTheft: "Non Store Theft",
                      cashAndTill: "Cash And Till",
                      alcoholInfluence: "Alcohol Influence",
                      spitting: "Spitting",
                      customerBehaviorPhysical: "Customer Behavior Physical",
                      racialAbuseOrAttack: "Racial Abuse or Attack"
                    };
                    
                    return (
                      <div key={index} className="flex items-center">
                        <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{categoryLabels[key]}</span>
                      </div>
                    );
                  })}
                  {!Object.values(selectedIncident.categories).some(v => v) && (
                    <p className="text-sm text-gray-500">No categories selected</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Stolen Items</h3>
                {selectedIncident.stolenItems.length > 0 ? (
                  <div className="mt-2">
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                            <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                            <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedIncident.stolenItems.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm text-gray-900 capitalize">{item.category}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                              <td className="px-4 py-2 text-sm text-right text-gray-900">£{item.value.toFixed(2)}</td>
                              <td className="px-4 py-2 text-sm text-right text-gray-900">{item.quantity}</td>
                              <td className="px-4 py-2 text-sm text-right text-gray-900">£{item.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={4} className="px-4 py-2 text-sm font-medium text-gray-900">Total</td>
                            <td className="px-4 py-2 text-sm font-medium text-right text-green-600">
                              £{selectedIncident.stolenItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">No stolen items recorded</p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewIncidentDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Incident Dialog */}
      <Dialog open={isEditIncidentDialogOpen} onOpenChange={setIsEditIncidentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Incident</DialogTitle>
            <DialogDescription>
              Update the incident details. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <UserCircle className="h-5 w-5" />
                <h3 className="text-md font-semibold">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Select value={customerName} onValueChange={setCustomerName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tesco">Tesco</SelectItem>
                      <SelectItem value="sainsburys">Sainsbury's</SelectItem>
                      <SelectItem value="asda">Asda</SelectItem>
                      <SelectItem value="morrisons">Morrisons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storeLocation">Store Location *</Label>
                  <Select value={siteName} onValueChange={setSiteName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="London Store">London Store</SelectItem>
                      <SelectItem value="Manchester Store">Manchester Store</SelectItem>
                      <SelectItem value="Birmingham Store">Birmingham Store</SelectItem>
                      <SelectItem value="Leeds Store">Leeds Store</SelectItem>
                      <SelectItem value="Glasgow Store">Glasgow Store</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="officerName">Officer Name *</Label>
                  <Select value={officerName} onValueChange={setOfficerName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select officer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="John Smith">John Smith</SelectItem>
                      <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                      <SelectItem value="Michael Brown">Michael Brown</SelectItem>
                      <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="officerRole">Officer Role *</Label>
                  <Select value={officerRole} onValueChange={setOfficerRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Security Officer">Security Officer</SelectItem>
                      <SelectItem value="Security Manager">Security Manager</SelectItem>
                      <SelectItem value="Supervisor">Supervisor</SelectItem>
                      <SelectItem value="Team Leader">Team Leader</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dutyManagerName">Duty Manager Name *</Label>
                  <Input id="dutyManagerName" placeholder="Enter duty manager name" value={dutyManagerName} onChange={(e) => setDutyManagerName(e.target.value)} />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Clock className="h-5 w-5" />
                <h3 className="text-md font-semibold">Incident Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfIncident">Date of Incident *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !incidentDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {incidentDate ? format(incidentDate, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={incidentDate}
                        onSelect={setIncidentDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeOfIncident">Time of Incident *</Label>
                  <div className="flex items-center gap-2">
                    <Select value={incidentTime.hour} onValueChange={(value) => setIncidentTime(prev => ({ ...prev, hour: value }))}>
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="--" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>:</span>
                    <Select value={incidentTime.minute} onValueChange={(value) => setIncidentTime(prev => ({ ...prev, minute: value }))}>
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="--" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 60 }, (_, i) => (
                          <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="incidentType">Type of Incident *</Label>
                  <Select value={incidentType} onValueChange={(value: Incident['incidentType'] | "") => setIncidentType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Theft">Theft</SelectItem>
                      <SelectItem value="Vandalism">Vandalism</SelectItem>
                      <SelectItem value="Customer Accident">Customer Accident</SelectItem>
                      <SelectItem value="Suspicious Activity">Suspicious Activity</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valueRecovered">Value Recovered (£)</Label>
                  <Input
                    id="valueRecovered"
                    placeholder="Enter value recovered"
                    value={valueRecovered}
                    onChange={(e) => setValueRecovered(e.target.value)}
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="incidentDetails">Incident Details *</Label>
                <Textarea
                  id="incidentDetails"
                  placeholder="Describe the incident in detail"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otherComments">Other Comments</Label>
                <Textarea
                  id="otherComments"
                  placeholder="Add any other specific comments"
                  value={otherComments}
                  onChange={(e) => setOtherComments(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <AlertCircle className="h-5 w-5" />
                <h3 className="text-md font-semibold">Police Involvement</h3>
              </div>
              
              <div className="space-y-2">
                <Label>Was Police Involved?</Label>
                <RadioGroup value={policeInvolved ? "yes" : "no"} onValueChange={(value) => setPoliceInvolved(value === "yes")} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="police-yes" />
                    <Label htmlFor="police-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="police-no" />
                    <Label htmlFor="police-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <User className="h-5 w-5" />
                <h3 className="text-md font-semibold">Offender Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="offenderName">Offender Name</Label>
                  <Input id="offenderName" placeholder="Enter offender name" value={offenderDetails?.name || ""} onChange={(e) => setOffenderDetails(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="offenderSex">Offender Sex</Label>
                  <Select value={offenderDetails?.sex || ""} onValueChange={(value) => setOffenderDetails(prev => ({ ...prev, sex: value as 'male' | 'female' | 'other' | 'unknown' }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="offenderDOB">Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !offenderDetails?.dateOfBirth && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {offenderDetails?.dateOfBirth ? format(offenderDetails.dateOfBirth, "MM/dd/yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={offenderDetails?.dateOfBirth}
                        onSelect={(date) => setOffenderDetails(prev => ({ ...prev, dateOfBirth: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Enter home address" value={offenderDetails?.address || ""} onChange={(e) => setOffenderDetails(prev => ({ ...prev, address: e.target.value }))} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="town">Town</Label>
                  <Input id="town" placeholder="Enter town" value={offenderDetails?.town || ""} onChange={(e) => setOffenderDetails(prev => ({ ...prev, town: e.target.value }))} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="postCode">Post Code</Label>
                  <Input id="postCode" placeholder="Enter post code" value={offenderDetails?.postCode || ""} onChange={(e) => setOffenderDetails(prev => ({ ...prev, postCode: e.target.value }))} />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <FileText className="h-5 w-5" />
                <h3 className="text-md font-semibold">Incident Categories</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cat1" 
                    checked={categories.giftCardTheft}
                    onCheckedChange={(checked) => 
                      setCategories(prev => ({ ...prev, giftCardTheft: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cat1">Gift Card Theft</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cat2" 
                    checked={categories.threatsAndIntimidation}
                    onCheckedChange={(checked) => 
                      setCategories(prev => ({ ...prev, threatsAndIntimidation: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cat2">Threats And Intimidation</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cat3" 
                    checked={categories.nonStoreTheft}
                    onCheckedChange={(checked) => 
                      setCategories(prev => ({ ...prev, nonStoreTheft: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cat3">Non Store Theft</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cat4" 
                    checked={categories.cashAndTill}
                    onCheckedChange={(checked) => 
                      setCategories(prev => ({ ...prev, cashAndTill: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cat4">Cash And Till</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cat5" 
                    checked={categories.alcoholInfluence}
                    onCheckedChange={(checked) => 
                      setCategories(prev => ({ ...prev, alcoholInfluence: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cat5">Alcohol Influence</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cat6" 
                    checked={categories.spitting}
                    onCheckedChange={(checked) => 
                      setCategories(prev => ({ ...prev, spitting: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cat6">Spitting</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cat7" 
                    checked={categories.customerBehaviorPhysical}
                    onCheckedChange={(checked) => 
                      setCategories(prev => ({ ...prev, customerBehaviorPhysical: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cat7">Customer Behavior Physical</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cat8" 
                    checked={categories.racialAbuseOrAttack}
                    onCheckedChange={(checked) => 
                      setCategories(prev => ({ ...prev, racialAbuseOrAttack: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cat8">Racial Abuse or Attack</Label>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Stolen Items section - keep existing implementation */}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditIncidentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditIncident} className="bg-green-600 hover:bg-green-700">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Incident Dialog */}
      <Dialog open={isDeleteIncidentDialogOpen} onOpenChange={setIsDeleteIncidentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Delete Incident</DialogTitle>
          </DialogHeader>
          
          {selectedIncident && (
            <div className="py-4">
              <p className="text-gray-700">
                Are you sure you want to delete this incident from {selectedIncident.siteName}?
                This action cannot be undone.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteIncidentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteIncident}
              variant="destructive"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncidentsReportPage;
