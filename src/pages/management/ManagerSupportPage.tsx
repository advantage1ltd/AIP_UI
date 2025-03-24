import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Upload, Download, FileText, Eye, Pencil, Trash2, FileIcon, CheckCircle, InfoIcon, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define the type for updates
interface Update {
  id: string;
  name: string;
  description: string;
  effectiveDate: Date;
  documentName: string;
  createdAt: Date;
  declarations?: number;
}

interface UpdateFormProps {
  updateName: string;
  setUpdateName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  effectiveDate: Date | undefined;
  setEffectiveDate: (date: Date | undefined) => void;
  selectedFile: File | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentFileName?: string;
  formId: string;
}

// Reusable form component for update creation and editing
const UpdateForm: React.FC<UpdateFormProps> = ({
  updateName,
  setUpdateName,
  description,
  setDescription,
  effectiveDate,
  setEffectiveDate,
  selectedFile,
  handleFileChange,
  currentFileName,
  formId
}) => {
  return (
    <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
      <div className="space-y-1 sm:space-y-2">
        <label htmlFor={`updateName-${formId}`} className="text-xs sm:text-sm font-medium">
          Update Name
        </label>
        <Input
          id={`updateName-${formId}`}
          placeholder="Enter update name"
          value={updateName}
          onChange={(e) => setUpdateName(e.target.value)}
          className="w-full border-gray-300 text-sm"
        />
      </div>
      
      <div className="space-y-1 sm:space-y-2">
        <label htmlFor={`description-${formId}`} className="text-xs sm:text-sm font-medium">
          Description
        </label>
        <Textarea
          id={`description-${formId}`}
          placeholder="Enter update description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[80px] sm:min-h-[100px] resize-none border-gray-300 text-sm"
        />
      </div>
      
      <div className="space-y-1 sm:space-y-2">
        <label className="text-xs sm:text-sm font-medium">
          Effective Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal text-xs sm:text-sm",
                !effectiveDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {effectiveDate ? format(effectiveDate, "MM/dd/yyyy") : "mm/dd/yyyy"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={effectiveDate}
              onSelect={setEffectiveDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-1 sm:space-y-2">
        <label className="text-xs sm:text-sm font-medium">
          Upload Document
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <label
            htmlFor={`file-upload-${formId}`}
            className="cursor-pointer rounded-md bg-white px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <span className="flex items-center">
              <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Choose File
            </span>
            <input
              id={`file-upload-${formId}`}
              name="file-upload"
              type="file"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
          <span className="text-xs sm:text-sm text-gray-500 truncate max-w-[200px]">
            {selectedFile ? selectedFile.name : currentFileName || "No file selected"}
          </span>
        </div>
      </div>
    </div>
  );
};

// Summary Card component
const SummaryCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  iconColor: string;
}> = ({ title, value, icon, bgColor, textColor, iconColor }) => (
  <Card className={`${bgColor} h-full`}>
    <CardContent className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <p className={`${textColor} font-medium text-base`}>{title}</p>
          <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
        </div>
        {React.cloneElement(icon as React.ReactElement, { className: `h-6 w-6 ${iconColor}` })}
      </div>
    </CardContent>
  </Card>
);

const ManagerSupportPage: React.FC = () => {
  // Sample data for updates
  const [updates, setUpdates] = useState<Update[]>([
    {
      id: "1",
      name: "New Security Protocol 2024",
      description: "Updated security protocols for handling emergency situations",
      effectiveDate: new Date(2024, 2, 1), // March 1, 2024
      documentName: "security_protocol_v2.pdf",
      createdAt: new Date(2024, 1, 15), // February 15, 2024
      declarations: 2
    },
    {
      id: "2",
      name: "Health & Safety Guidelines",
      description: "Revised health and safety guidelines including COVID-19 protocols",
      effectiveDate: new Date(2024, 1, 20), // February 20, 2024
      documentName: "health_safety_guidelines.pdf",
      createdAt: new Date(2024, 1, 10), // February 10, 2024
      declarations: 0
    }
  ]);

  // State for dialogs
  const [dialogState, setDialogState] = useState({
    create: false,
    view: false,
    edit: false,
    delete: false
  });
  
  // State for form fields
  const [formState, setFormState] = useState({
    updateName: "",
    description: "",
    effectiveDate: undefined as Date | undefined,
    selectedFile: null as File | null,
  });
  
  // State for selected update
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormState(prev => ({ ...prev, selectedFile: e.target.files![0] }));
    }
  };

  // Dialog open/close handlers
  const openDialog = (type: keyof typeof dialogState, update?: Update) => {
    if (type === 'create') {
      // Reset form fields for create
      setFormState({
        updateName: "",
        description: "",
        effectiveDate: undefined,
        selectedFile: null
      });
    } else if (update && (type === 'edit' || type === 'view' || type === 'delete')) {
      // Set selected update
      setSelectedUpdate(update);
      
      // For edit, also populate form fields
      if (type === 'edit') {
        setFormState({
          updateName: update.name,
          description: update.description,
          effectiveDate: update.effectiveDate,
          selectedFile: null
        });
      }
    }
    
    // Open the requested dialog
    setDialogState(prev => ({ ...prev, [type]: true }));
  };

  const closeDialog = (type: keyof typeof dialogState) => {
    setDialogState(prev => ({ ...prev, [type]: false }));
    if (type !== 'view') {
      // Reset form state when closing dialogs except view
      setFormState({
        updateName: "",
        description: "",
        effectiveDate: undefined,
        selectedFile: null
      });
    }
    // Reset selected update if not keeping it for another operation
    if (type !== 'view' || !dialogState.edit) {
      setSelectedUpdate(null);
    }
  };

  // CRUD operations
  const handleCreate = () => {
    const { updateName, description, effectiveDate, selectedFile } = formState;
    
    if (!updateName || !description || !effectiveDate) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Create new update
    const newUpdate: Update = {
      id: Math.random().toString(36).substr(2, 9),
      name: updateName,
      description: description,
      effectiveDate: effectiveDate,
      documentName: selectedFile ? selectedFile.name : "document.pdf",
      createdAt: new Date(),
      declarations: 0
    };

    // Add to updates
    setUpdates([newUpdate, ...updates]);
    
    // Close dialog
    closeDialog('create');
    
    toast({
      title: "Update Created",
      description: "The security update has been successfully created",
    });
  };

  const handleUpdate = () => {
    const { updateName, description, effectiveDate, selectedFile } = formState;
    
    if (!selectedUpdate || !updateName || !description || !effectiveDate) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Update the selected update
    const updatedUpdates = updates.map(update => {
      if (update.id === selectedUpdate.id) {
        return {
          ...update,
          name: updateName,
          description: description,
          effectiveDate: effectiveDate,
          documentName: selectedFile ? selectedFile.name : update.documentName,
        };
      }
      return update;
    });

    // Update state
    setUpdates(updatedUpdates);
    
    // Close dialog
    closeDialog('edit');
    
    toast({
      title: "Update Modified",
      description: "The security update has been successfully modified",
    });
  };

  const handleDelete = () => {
    if (!selectedUpdate) return;

    // Filter out the selected update
    const updatedUpdates = updates.filter(update => update.id !== selectedUpdate.id);
    
    // Update state
    setUpdates(updatedUpdates);
    
    // Close dialog
    closeDialog('delete');
    
    toast({
      title: "Update Deleted",
      description: "The security update has been successfully deleted",
    });
  };

  // Handle document download
  const handleDownload = (update: Update) => {
    // In a real application, this would trigger a download
    toast({
      title: "Download Started",
      description: `Downloading ${update.documentName}`,
    });
  };

  // Calculate summary statistics
  const totalUpdates = updates.length;
  const activeUpdates = updates.length; // For this example, all updates are active
  const totalDeclarations = updates.reduce((sum, update) => sum + (update.declarations || 0), 0);

  return (
    <TooltipProvider>
      <div className="container mx-auto px-1 sm:px-2 md:px-6 py-2 md:py-6">
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 mb-3 md:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Manager Support</h1>
          <Button 
            onClick={() => openDialog('create')}
            className="bg-blue-500 hover:bg-blue-600 w-auto ml-auto text-xs sm:text-sm py-1 h-7 sm:h-8"
          >
            <span className="whitespace-nowrap">Add New</span>
          </Button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-6">
          <SummaryCard 
            title="Total Updates" 
            value={totalUpdates} 
            icon={<FileIcon />} 
            bgColor="bg-blue-700" 
            textColor="text-white" 
            iconColor="text-white" 
          />
          <SummaryCard 
            title="Active Updates" 
            value={activeUpdates} 
            icon={<CheckCircle />} 
            bgColor="bg-green-700" 
            textColor="text-white" 
            iconColor="text-white" 
          />
          <div className="col-span-2 sm:col-span-1">
            <SummaryCard 
              title="Total Declarations" 
              value={totalDeclarations} 
              icon={<FileText />} 
              bgColor="bg-purple-700" 
              textColor="text-white" 
              iconColor="text-white" 
            />
          </div>
        </div>
        
        {/* Main Content */}
        <Card className="overflow-hidden">
          <CardContent className="p-2 sm:p-4 md:p-6">
            <div className="flex items-center gap-1 sm:gap-2 mb-2 md:mb-4">
              <InfoIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              <h2 className="text-lg sm:text-xl font-semibold">Security Updates & Declarations</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 md:mb-6">Track and manage security updates and officer declarations</p>
            
            {updates.length === 0 ? (
              <div className="border rounded-md p-2 sm:p-4 bg-gray-50">
                <p className="text-xs sm:text-sm text-gray-500">No updates available yet. Click "Add New Update" to create one.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[30%] py-2 px-1 sm:px-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <FileIcon className="h-3 w-3 text-blue-500" />
                            <span className="font-semibold text-[10px] sm:text-xs">Update Name</span>
                          </div>
                        </TableHead>
                        <TableHead className="hidden md:table-cell md:w-[45%] py-2">
                          <span className="font-semibold text-[10px] sm:text-xs">Description</span>
                        </TableHead>
                        <TableHead className="w-[25%] py-2 px-1 sm:px-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <CalendarIcon className="h-3 w-3 text-blue-500" />
                            <span className="font-semibold text-[10px] sm:text-xs">Date</span>
                          </div>
                        </TableHead>
                        <TableHead className="w-[30%] md:w-[15%] text-right py-2 px-1 sm:px-4">
                          <span className="font-semibold text-[10px] sm:text-xs">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {updates.map((update) => (
                        <TableRow key={update.id} className="hover:bg-gray-50">
                          <TableCell className="py-1.5 sm:py-2 md:py-4 px-1 sm:px-4">
                            <div className="font-medium text-blue-600 text-[10px] xs:text-xs sm:text-sm md:text-base truncate max-w-[100px] xs:max-w-none">{update.name}</div>
                            <div className="md:hidden text-[9px] xs:text-[10px] text-gray-500 line-clamp-1 mt-0.5">{update.description}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell py-1.5 sm:py-2 md:py-4">
                            <div className="line-clamp-2 text-gray-600 text-xs sm:text-sm md:text-base">{update.description}</div>
                          </TableCell>
                          <TableCell className="py-1.5 sm:py-2 md:py-4 px-1 sm:px-4">
                            <div className="text-gray-600 text-[10px] xs:text-xs sm:text-sm md:text-base whitespace-nowrap">{format(update.effectiveDate, "MM/d/yy")}</div>
                          </TableCell>
                          <TableCell className="py-1.5 sm:py-2 md:py-4 px-0.5 sm:px-4">
                            <div className="flex justify-end items-center gap-0.5 sm:gap-1">
                              {[
                                { icon: <Eye />, color: "text-blue-600", hoverColor: "hover:bg-blue-50", action: () => openDialog('view', update) },
                                { icon: <Download />, color: "text-green-600", hoverColor: "hover:bg-green-50", action: () => handleDownload(update) },
                                { icon: <Pencil />, color: "text-amber-600", hoverColor: "hover:bg-amber-50", action: () => openDialog('edit', update) },
                                { icon: <Trash2 />, color: "text-red-600", hoverColor: "hover:bg-red-50", action: () => openDialog('delete', update) }
                              ].map((btn, idx) => (
                                <Tooltip key={idx} delayDuration={300}>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost"
                                      size="sm"
                                      className={`h-5 w-5 xs:h-6 xs:w-6 sm:h-8 sm:w-8 p-0 ${btn.hoverColor}`}
                                      onClick={btn.action}
                                    >
                                      {React.cloneElement(btn.icon as React.ReactElement, { className: `h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4 ${btn.color}` })}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-[9px] xs:text-xs" side="top">
                                    {idx === 0 ? "View" : idx === 1 ? "Download" : idx === 2 ? "Edit" : "Delete"}
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={dialogState.create} onOpenChange={(open) => !open && closeDialog('create')}>
          <DialogContent className="sm:max-w-[500px] max-h-[95vh] overflow-y-auto p-3 sm:p-6 w-[calc(100%-16px)]">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Add New Update</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-gray-500">
                Create a new security update for manager support
              </DialogDescription>
            </DialogHeader>
            
            <UpdateForm
              updateName={formState.updateName}
              setUpdateName={(name) => setFormState(prev => ({ ...prev, updateName: name }))}
              description={formState.description}
              setDescription={(desc) => setFormState(prev => ({ ...prev, description: desc }))}
              effectiveDate={formState.effectiveDate}
              setEffectiveDate={(date) => setFormState(prev => ({ ...prev, effectiveDate: date }))}
              selectedFile={formState.selectedFile}
              handleFileChange={handleFileChange}
              formId="create"
            />
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
              <Button variant="outline" onClick={() => closeDialog('create')} className="w-full sm:w-auto order-2 sm:order-1">
                Cancel
              </Button>
              <Button 
                onClick={handleCreate}
                className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto order-1 sm:order-2"
              >
                Add Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={dialogState.view} onOpenChange={(open) => !open && closeDialog('view')}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">View Update</DialogTitle>
            </DialogHeader>
            
            {selectedUpdate && (
              <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
                {[
                  { label: "Update Name", value: selectedUpdate.name },
                  { label: "Description", value: selectedUpdate.description },
                  { label: "Effective Date", value: format(selectedUpdate.effectiveDate, "MMMM d, yyyy") },
                  { label: "Created", value: format(selectedUpdate.createdAt, "MMMM d, yyyy") }
                ].map((field, idx) => (
                  <div key={idx} className="space-y-1 sm:space-y-2">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">{field.label}</h3>
                    <p className="text-sm sm:text-base">{field.value}</p>
                  </div>
                ))}
                
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">Document</h3>
                  <div className="flex items-center flex-wrap gap-2">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-blue-500" />
                    <span className="text-sm sm:text-base">{selectedUpdate.documentName}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto h-7 sm:h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1"
                      onClick={() => handleDownload(selectedUpdate)}
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="text-xs sm:text-sm">Download</span>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">Declarations</h3>
                  <Badge variant={selectedUpdate.declarations ? "default" : "outline"} className={selectedUpdate.declarations ? "bg-blue-100 text-blue-800" : ""}>
                    {selectedUpdate.declarations} Officers
                  </Badge>
                </div>
              </div>
            )}
            
            <DialogFooter className="mt-4">
              <Button 
                onClick={() => closeDialog('view')}
                className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={dialogState.edit} onOpenChange={(open) => !open && closeDialog('edit')}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Edit Update</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-gray-500">
                Modify the security update details
              </DialogDescription>
            </DialogHeader>
            
            <UpdateForm
              updateName={formState.updateName}
              setUpdateName={(name) => setFormState(prev => ({ ...prev, updateName: name }))}
              description={formState.description}
              setDescription={(desc) => setFormState(prev => ({ ...prev, description: desc }))}
              effectiveDate={formState.effectiveDate}
              setEffectiveDate={(date) => setFormState(prev => ({ ...prev, effectiveDate: date }))}
              selectedFile={formState.selectedFile}
              handleFileChange={handleFileChange}
              currentFileName={selectedUpdate?.documentName}
              formId="edit"
            />
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
              <Button variant="outline" onClick={() => closeDialog('edit')} className="w-full sm:w-auto order-2 sm:order-1">
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate}
                className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto order-1 sm:order-2"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={dialogState.delete} onOpenChange={(open) => !open && closeDialog('delete')}>
          <DialogContent className="sm:max-w-[500px] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Delete Update</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-gray-500">
                Are you sure you want to delete this update?
              </DialogDescription>
            </DialogHeader>
            
            {selectedUpdate && (
              <div className="py-2 sm:py-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <AlertTitle className="text-sm sm:text-base">Warning</AlertTitle>
                  <AlertDescription className="text-xs sm:text-sm">
                    This action cannot be undone. This will permanently delete the update
                    "{selectedUpdate.name}" and remove all associated data.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
              <Button variant="outline" onClick={() => closeDialog('delete')} className="w-full sm:w-auto order-2 sm:order-1">
                Cancel
              </Button>
              <Button 
                onClick={handleDelete}
                variant="destructive"
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default ManagerSupportPage;
