import React, { useState, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Upload, 
  Plus, 
  MoreVertical, 
  Eye, 
  PenSquare, 
  Trash2,
  Calendar,
  FileSignature,
  Users,
  AlertCircle,
  CheckCircle,
  Download,
  Edit2
} from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Update {
  id: string;
  name: string;
  description: string;
  effectiveDate: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  totalDeclarations: number;
  status: 'active' | 'archived';
}

interface Declaration {
  id: string;
  updateId: string;
  officerName: string;
  signatureDate: string;
  acknowledged: boolean;
}

interface SignatureData {
  officerName: string;
  signature: string;
}

const mockUpdates: Update[] = [
  {
    id: '1',
    name: 'New Security Protocol 2024',
    description: 'Updated security protocols for handling emergency situations',
    effectiveDate: '2024-03-01',
    fileName: 'security_protocol_2024.pdf',
    fileUrl: '/documents/security_protocol_2024.pdf',
    createdAt: '2024-02-15',
    totalDeclarations: 15,
    status: 'active'
  },
  {
    id: '2',
    name: 'Health & Safety Guidelines',
    description: 'Revised health and safety guidelines including COVID-19 protocols',
    effectiveDate: '2024-02-20',
    fileName: 'health_safety_2024.pdf',
    fileUrl: '/documents/health_safety_2024.pdf',
    createdAt: '2024-02-10',
    totalDeclarations: 12,
    status: 'active'
  }
];

const mockDeclarations: Declaration[] = [
  {
    id: '1',
    updateId: '1',
    officerName: 'John Smith',
    signatureDate: '2024-02-16',
    acknowledged: true
  },
  {
    id: '2',
    updateId: '1',
    officerName: 'Emma Brown',
    signatureDate: '2024-02-16',
    acknowledged: true
  }
];

const OfficerSupportPage: React.FC = () => {
  const [updates, setUpdates] = useState<Update[]>(mockUpdates);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeclarationsDialog, setShowDeclarationsDialog] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [declarations, setDeclarations] = useState<Declaration[]>(mockDeclarations);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [signatureData, setSignatureData] = useState<SignatureData>({
    officerName: '',
    signature: ''
  });
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    effectiveDate: '',
    file: null as File | null
  });

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    effectiveDate: '',
    file: null as File | null
  });

  const handleAddUpdate = () => {
    // In a real application, you would:
    // 1. Upload the file to a server/storage
    // 2. Create the update record in the database
    // 3. Handle errors and show loading states
    
    const newUpdate: Update = {
      id: (updates.length + 1).toString(),
      name: formData.name,
      description: formData.description,
      effectiveDate: formData.effectiveDate,
      fileName: formData.file?.name || '',
      fileUrl: URL.createObjectURL(formData.file as Blob),
      createdAt: new Date().toISOString().split('T')[0],
      totalDeclarations: declarations.filter(d => d.updateId === (updates.length + 1).toString()).length,
      status: 'active'
    };

    setUpdates([newUpdate, ...updates]);
    setShowAddDialog(false);
    setFormData({
      name: '',
      description: '',
      effectiveDate: '',
      file: null
    });
  };

  const handleViewDeclarations = (update: Update) => {
    setSelectedUpdate(update);
    setShowDeclarationsDialog(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        file: e.target.files![0]
      }));
    }
  };

  const handleViewDocument = (update: Update) => {
    setSelectedUpdate(update);
    setShowDocumentPreview(true);
  };

  const handleSignDeclaration = () => {
    if (!selectedUpdate || !signatureData.officerName || !signatureData.signature) return;

    const newDeclaration: Declaration = {
      id: (declarations.length + 1).toString(),
      updateId: selectedUpdate.id,
      officerName: signatureData.officerName,
      signatureDate: new Date().toISOString().split('T')[0],
      acknowledged: true
    };

    setDeclarations([...declarations, newDeclaration]);
    setUpdates(updates.map(update => 
      update.id === selectedUpdate.id 
        ? { ...update, totalDeclarations: update.totalDeclarations + 1 }
        : update
    ));

    setSignatureData({ officerName: '', signature: '' });
    setShowSignDialog(false);
    setShowDocumentPreview(false);
  };

  const handleViewDetails = (update: Update) => {
    setSelectedUpdate(update);
    setShowViewDialog(true);
  };

  const handleEditUpdate = (update: Update) => {
    setSelectedUpdate(update);
    setEditFormData({
      name: update.name,
      description: update.description,
      effectiveDate: update.effectiveDate,
      file: null
    });
    setShowEditDialog(true);
  };

  const handleDeleteUpdate = (update: Update) => {
    setSelectedUpdate(update);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = useCallback(() => {
    if (!selectedUpdate) return;

    // Remove the update
    setUpdates(prevUpdates => 
      prevUpdates.filter(u => u.id !== selectedUpdate.id)
    );
    
    // Remove all declarations associated with this update
    setDeclarations(prevDeclarations => 
      prevDeclarations.filter(d => d.updateId !== selectedUpdate.id)
    );

    // Reset all related state
    setShowDeleteDialog(false);
    setSelectedUpdate(null);
    setShowDeclarationsDialog(false);
    setShowDocumentPreview(false);
  }, [selectedUpdate]);

  const handleSaveEdit = useCallback(() => {
    if (!selectedUpdate) return;

    setUpdates(prevUpdates => 
      prevUpdates.map(update => {
        if (update.id === selectedUpdate.id) {
          return {
            ...update,
            name: editFormData.name,
            description: editFormData.description,
            effectiveDate: editFormData.effectiveDate,
            fileName: editFormData.file?.name || update.fileName,
            fileUrl: editFormData.file 
              ? URL.createObjectURL(editFormData.file) 
              : update.fileUrl,
            totalDeclarations: declarations.filter(
              d => d.updateId === update.id
            ).length
          };
        }
        return update;
      })
    );

    // Clean up state
    setShowEditDialog(false);
    setSelectedUpdate(null);
    setShowDeclarationsDialog(false);
    
    // Reset edit form data
    setEditFormData({
      name: '',
      description: '',
      effectiveDate: '',
      file: null
    });
  }, [selectedUpdate, editFormData, declarations]);

  // Add cleanup for file URLs
  useEffect(() => {
    return () => {
      // Cleanup any created object URLs when component unmounts
      updates.forEach(update => {
        if (update.fileUrl.startsWith('blob:')) {
          URL.revokeObjectURL(update.fileUrl);
        }
      });
    };
  }, [updates]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Officer Support</h1>
              <p className="text-gray-500">Manage and track security officer documentation and declarations</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Update
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Total Updates</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{updates.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Active Updates</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {updates.filter(u => u.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Total Declarations</CardTitle>
              <FileSignature className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">
                {declarations.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Updates Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Security Updates & Declarations
            </CardTitle>
            <CardDescription>
              Track and manage security updates and officer declarations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        Update Name
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">Description</TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        Effective Date
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        Declarations
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {updates.map((update) => (
                    <TableRow 
                      key={update.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-900">{update.name}</TableCell>
                      <TableCell className="text-gray-600 max-w-md truncate">
                        {update.description}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(update.effectiveDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                          >
                            {declarations.filter(d => d.updateId === update.id).length} Officers
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(update)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUpdate(update)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUpdate(update)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {updates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-gray-500">No updates found</p>
                        <Button
                          variant="link"
                          onClick={() => setShowAddDialog(true)}
                          className="text-blue-600 hover:text-blue-700 mt-2"
                        >
                          Create your first update
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add Update Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Update</DialogTitle>
              <DialogDescription>
                Create a new security update and document for officer declarations
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Update Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter update name"
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter update description"
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Upload Document</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx"
                  />
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4" />
                    Choose File
                  </Label>
                  {formData.file && (
                    <span className="text-sm text-gray-600">{formData.file.name}</span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddUpdate}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!formData.name || !formData.description || !formData.effectiveDate || !formData.file}
              >
                Add Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Declarations Dialog */}
        <Dialog open={showDeclarationsDialog} onOpenChange={setShowDeclarationsDialog}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Officer Declarations</DialogTitle>
              <DialogDescription>
                View all officer declarations for {selectedUpdate?.name}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Officer Name</TableHead>
                    <TableHead>Signature Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {declarations
                    .filter(declaration => declaration.updateId === selectedUpdate?.id)
                    .map((declaration) => (
                    <TableRow key={declaration.id}>
                      <TableCell className="font-medium">{declaration.officerName}</TableCell>
                      <TableCell>{declaration.signatureDate}</TableCell>
                      <TableCell>
                        <Badge 
                          className={declaration.acknowledged 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'}
                        >
                          {declaration.acknowledged ? 'Signed' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Document Preview Dialog */}
        <Dialog open={showDocumentPreview} onOpenChange={setShowDocumentPreview}>
          <DialogContent className="max-w-7xl h-[90vh] p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <h2 className="text-lg font-semibold">{selectedUpdate?.name}</h2>
                    <p className="text-sm text-gray-500">Effective from: {selectedUpdate?.effectiveDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSignDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <FileSignature className="h-4 w-4" />
                    Sign Declaration
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowDocumentPreview(false)}
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="document" className="flex-1 flex flex-col">
                <div className="px-6 border-b">
                  <TabsList>
                    <TabsTrigger value="document">Document</TabsTrigger>
                    <TabsTrigger value="declarations">Declarations ({declarations.filter(d => d.updateId === selectedUpdate?.id).length})</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="document" className="flex-1 p-6">
                  <div className="h-full border rounded-md bg-white overflow-hidden">
                    <iframe
                      src={selectedUpdate?.fileUrl}
                      className="w-full h-full"
                      title={selectedUpdate?.name}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="declarations" className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Officer Declarations</h3>
                        <p className="text-sm text-gray-500">
                          Officers who have signed this document
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowSignDialog(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Sign Declaration
                      </Button>
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Officer Name</TableHead>
                            <TableHead>Signature Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {declarations
                            .filter(d => d.updateId === selectedUpdate?.id)
                            .map((declaration) => (
                              <TableRow key={declaration.id}>
                                <TableCell className="font-medium">
                                  {declaration.officerName}
                                </TableCell>
                                <TableCell>{declaration.signatureDate}</TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-700">
                                    Signed
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          {declarations.filter(d => d.updateId === selectedUpdate?.id).length === 0 && (
                            <TableRow>
                              <TableCell colSpan={3} className="h-24 text-center">
                                <div className="flex flex-col items-center gap-2">
                                  <FileSignature className="h-8 w-8 text-gray-400" />
                                  <p className="text-gray-500 text-sm">No declarations yet</p>
                                  <Button
                                    variant="link"
                                    onClick={() => setShowSignDialog(true)}
                                    className="text-blue-600"
                                  >
                                    Be the first to sign
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>

        {/* Sign Declaration Dialog */}
        <AlertDialog open={showSignDialog} onOpenChange={setShowSignDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign Declaration</AlertDialogTitle>
              <AlertDialogDescription>
                By signing this declaration, you confirm that you have read and understood the document: {selectedUpdate?.name}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Officer Name</Label>
                <Input
                  value={signatureData.officerName}
                  onChange={(e) => setSignatureData(prev => ({ ...prev, officerName: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="grid gap-2">
                <Label>Digital Signature</Label>
                <Input
                  value={signatureData.signature}
                  onChange={(e) => setSignatureData(prev => ({ ...prev, signature: e.target.value }))}
                  placeholder="Type your full name as signature"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
                <p>I hereby declare that:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>I have read and fully understood the contents of this document</li>
                  <li>I agree to comply with all procedures and guidelines outlined</li>
                  <li>I understand that this declaration will be recorded and stored</li>
                </ul>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowSignDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSignDeclaration}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!signatureData.officerName || !signatureData.signature}
              >
                Sign Declaration
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View Details Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Update Details</DialogTitle>
            </DialogHeader>
            {selectedUpdate && (
              <div className="space-y-6">
                <div className="grid gap-2">
                  <Label className="text-gray-500">Update Name</Label>
                  <p className="text-gray-900 font-medium">{selectedUpdate.name}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-500">Description</Label>
                  <p className="text-gray-900">{selectedUpdate.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Effective Date</Label>
                    <p className="text-gray-900">{selectedUpdate.effectiveDate}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <Badge 
                      className={
                        selectedUpdate.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {selectedUpdate.status === 'active' ? 'Active' : 'Archived'}
                    </Badge>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-500">Document</Label>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{selectedUpdate.fileName}</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-500">Total Declarations</Label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">
                      {declarations.filter(d => d.updateId === selectedUpdate.id).length} Officers
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Update</DialogTitle>
              <DialogDescription>
                Make changes to the security update
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Update Name</Label>
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter update name"
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter update description"
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={editFormData.effectiveDate}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Update Document (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditFormData(prev => ({ ...prev, file: e.target.files![0] }));
                      }
                    }}
                    className="hidden"
                    id="edit-file-upload"
                    accept=".pdf,.doc,.docx"
                  />
                  <Label
                    htmlFor="edit-file-upload"
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4" />
                    Choose New File
                  </Label>
                  {editFormData.file ? (
                    <span className="text-sm text-gray-600">{editFormData.file.name}</span>
                  ) : (
                    <span className="text-sm text-gray-600">Current: {selectedUpdate?.fileName}</span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!editFormData.name || !editFormData.description || !editFormData.effectiveDate}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Update</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this update? This action cannot be undone.
                All associated declarations will also be removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
};

export default OfficerSupportPage;
