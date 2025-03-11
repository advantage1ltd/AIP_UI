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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // State for form fields
  const [updateName, setUpdateName] = useState("");
  const [description, setDescription] = useState("");
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // State for selected update
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Open create dialog
  const openCreateDialog = () => {
    // Reset form fields
    setUpdateName("");
    setDescription("");
    setEffectiveDate(undefined);
    setSelectedFile(null);
    setIsCreateDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = (update: Update) => {
    setSelectedUpdate(update);
    setIsViewDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (update: Update) => {
    setSelectedUpdate(update);
    setUpdateName(update.name);
    setDescription(update.description);
    setEffectiveDate(update.effectiveDate);
    setSelectedFile(null); // Can't restore the file, but we'll keep the filename
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (update: Update) => {
    setSelectedUpdate(update);
    setIsDeleteDialogOpen(true);
  };

  // Create a new update
  const handleCreate = () => {
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
    
    // Reset form and close dialog
    setUpdateName("");
    setDescription("");
    setEffectiveDate(undefined);
    setSelectedFile(null);
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Update Created",
      description: "The security update has been successfully created",
    });
  };

  // Update an existing update
  const handleUpdate = () => {
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
    
    // Reset form and close dialog
    setUpdateName("");
    setDescription("");
    setEffectiveDate(undefined);
    setSelectedFile(null);
    setSelectedUpdate(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Update Modified",
      description: "The security update has been successfully modified",
    });
  };

  // Delete an update
  const handleDelete = () => {
    if (!selectedUpdate) return;

    // Filter out the selected update
    const updatedUpdates = updates.filter(update => update.id !== selectedUpdate.id);
    
    // Update state
    setUpdates(updatedUpdates);
    
    // Reset and close dialog
    setSelectedUpdate(null);
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "Update Deleted",
      description: "The security update has been successfully deleted",
    });
  };

  // Handle document download
  const handleDownload = (update: Update) => {
    // In a real application, this would trigger a download
    // For this example, we'll just show a toast
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
    <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manager Support</h1>
          <Button 
            onClick={openCreateDialog}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Add New Update
          </Button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-700 font-medium">Total Updates</p>
                  <p className="text-3xl font-bold text-blue-700">{totalUpdates}</p>
                </div>
                <FileIcon className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-green-700 font-medium">Active Updates</p>
                  <p className="text-3xl font-bold text-green-700">{activeUpdates}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-purple-700 font-medium">Total Declarations</p>
                  <p className="text-3xl font-bold text-purple-700">{totalDeclarations}</p>
                </div>
                <FileText className="h-6 w-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <InfoIcon className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold">Security Updates & Declarations</h2>
            </div>
            <p className="text-gray-600 mb-6">Track and manage security updates and officer declarations</p>
            
            {updates.length === 0 ? (
              <div className="border rounded-md p-4 bg-gray-50">
                <p className="text-gray-500">No updates available yet. Click "Add New Update" to create one.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[25%]">
                      <div className="flex items-center gap-2">
                        <FileIcon className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">Update Name</span>
                      </div>
                    </TableHead>
                    <TableHead className="w-[45%]">
                      <span className="font-semibold">Description</span>
                    </TableHead>
                    <TableHead className="w-[15%]">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">Effective Date</span>
                      </div>
                    </TableHead>
                    <TableHead className="w-[15%] text-right">
                      <span className="font-semibold">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {updates.map((update) => (
                    <TableRow key={update.id} className="hover:bg-gray-50">
                      <TableCell className="py-4">
                        <div className="font-medium text-blue-600">{update.name}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="line-clamp-2 text-gray-600">{update.description}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-gray-600">{format(update.effectiveDate, "MMM d, yyyy")}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex justify-end items-center gap-1">
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                            onClick={() => openViewDialog(update)}
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-green-50"
                            onClick={() => handleDownload(update)}
                          >
                            <Download className="h-4 w-4 text-green-600" />
                          </Button>
                          
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-amber-50"
                            onClick={() => openEditDialog(update)}
                          >
                            <Pencil className="h-4 w-4 text-amber-600" />
                          </Button>
                          
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50"
                            onClick={() => openDeleteDialog(update)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Update</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Create a new security update for manager support
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="updateName" className="text-sm font-medium">
                  Update Name
                </label>
                <Input
                  id="updateName"
                  placeholder="Enter update name"
                  value={updateName}
                  onChange={(e) => setUpdateName(e.target.value)}
                  className="w-full border-gray-300"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Enter update description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] resize-none border-gray-300"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Effective Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !effectiveDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Upload Document
                </label>
                <div className="mt-1 flex items-center">
                  <label
                    htmlFor="file-upload-create"
                    className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <span className="flex items-center">
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </span>
                    <input
                      id="file-upload-create"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <span className="ml-3 text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : "No file selected"}
                  </span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreate}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Add Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">View Update</DialogTitle>
            </DialogHeader>
            
            {selectedUpdate && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Update Name</h3>
                  <p className="text-base">{selectedUpdate.name}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="text-base">{selectedUpdate.description}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Effective Date</h3>
                  <p className="text-base">{format(selectedUpdate.effectiveDate, "MMMM d, yyyy")}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Document</h3>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-500" />
                    <span className="text-base">{selectedUpdate.documentName}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1"
                      onClick={() => handleDownload(selectedUpdate)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Declarations</h3>
                  <Badge variant={selectedUpdate.declarations ? "default" : "outline"} className={selectedUpdate.declarations ? "bg-blue-100 text-blue-800" : ""}>
                    {selectedUpdate.declarations} Officers
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="text-base">{format(selectedUpdate.createdAt, "MMMM d, yyyy")}</p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                onClick={() => setIsViewDialogOpen(false)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Edit Update</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Modify the security update details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="updateNameEdit" className="text-sm font-medium">
                  Update Name
                </label>
                <Input
                  id="updateNameEdit"
                  placeholder="Enter update name"
                  value={updateName}
                  onChange={(e) => setUpdateName(e.target.value)}
                  className="w-full border-gray-300"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="descriptionEdit" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="descriptionEdit"
                  placeholder="Enter update description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] resize-none border-gray-300"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Effective Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !effectiveDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Upload Document
                </label>
                <div className="mt-1 flex items-center">
                  <label
                    htmlFor="file-upload-edit"
                    className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <span className="flex items-center">
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </span>
                    <input
                      id="file-upload-edit"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <span className="ml-3 text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : selectedUpdate ? selectedUpdate.documentName : "No file selected"}
                  </span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Delete Update</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Are you sure you want to delete this update?
              </DialogDescription>
            </DialogHeader>
            
            {selectedUpdate && (
              <div className="py-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    This action cannot be undone. This will permanently delete the update
                    "{selectedUpdate.name}" and remove all associated data.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleDelete}
                variant="destructive"
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
