import React from 'react';
import { Plus, Search, Pencil, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

// Define the form schema
const formSchema = z.object({
  officerName: z.string().min(1, 'Officer name is required'),
  issuedBy: z.string().min(1, 'Issuer name is required'),
  equipmentType: z.string().min(1, 'Equipment type is required'),
  dateIssued: z.date({
    required_error: 'Date issued is required',
  }),
  quantity: z.string().min(1, 'Quantity is required'),
  condition: z.string().min(1, 'Condition is required'),
  notes: z.string().optional(),
});

// Mock data interface
interface EquipmentRecord {
  id: string;
  officerName: string;
  issuedBy: string;
  equipmentType: string;
  dateIssued: Date;
  quantity: string;
  condition: string;
  notes?: string;
}

const UniformEquipmentPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [editingRecord, setEditingRecord] = React.useState<EquipmentRecord | null>(null);
  const itemsPerPage = 10;

  // Mock data for officers and issuers
  const officers = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' },
    { id: '4', name: 'Sarah Williams' },
  ];

  const issuers = [
    { id: '1', name: 'Admin User' },
    { id: '2', name: 'Store Manager' },
    { id: '3', name: 'Equipment Officer' },
    { id: '4', name: 'Supervisor' },
  ];

  // Mock data
  const [equipmentRecords, setEquipmentRecords] = React.useState<EquipmentRecord[]>([
    {
      id: '1',
      officerName: 'John Doe',
      issuedBy: 'Admin User',
      equipmentType: 'Uniform',
      dateIssued: new Date(),
      quantity: '1',
      condition: 'New',
      notes: 'Standard issue uniform',
    },
    // Add more mock data as needed
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      officerName: '',
      issuedBy: '',
      equipmentType: '',
      quantity: '',
      condition: '',
      notes: '',
    },
  });

  // Filter records based on search query
  const filteredRecords = equipmentRecords.filter((record) =>
    record.officerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.issuedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.equipmentType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingRecord) {
      setEquipmentRecords(records =>
        records.map(record =>
          record.id === editingRecord.id
            ? { ...values, id: record.id } as EquipmentRecord
            : record
        )
      );
      toast({
        title: "Record Updated",
        description: "Equipment record has been successfully updated.",
      });
    } else {
      setEquipmentRecords(records => [
        { ...values, id: Date.now().toString() } as EquipmentRecord,
        ...records,
      ]);
      toast({
        title: "Record Added",
        description: "New equipment record has been successfully added.",
      });
    }
    setIsDialogOpen(false);
    setEditingRecord(null);
    form.reset();
  };

  const handleEdit = (record: EquipmentRecord) => {
    setEditingRecord(record);
    form.reset(record);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setEquipmentRecords(records => records.filter(record => record.id !== id));
    }
  };

  const getConditionBadge = (condition: string) => {
    const variants: Record<string, string> = {
      'New': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Good': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Fair': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Poor': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return variants[condition] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Uniform and Equipment Record</CardTitle>
              <CardDescription>Manage and track equipment issued to officers</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-900 text-white hover:bg-blue-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Equipment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingRecord ? 'Edit Equipment Record' : 'Add New Equipment Record'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingRecord 
                      ? 'Update the equipment record details below.' 
                      : 'Fill in the details to add a new equipment record.'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="officerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Officer Name</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Select officer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {officers.map((officer) => (
                                  <SelectItem key={officer.id} value={officer.name}>
                                    {officer.name}
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
                        name="issuedBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issued By</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Select issuer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {issuers.map((issuer) => (
                                  <SelectItem key={issuer.id} value={issuer.name}>
                                    {issuer.name}
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
                        name="equipmentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Equipment Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Select equipment type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Uniform">Uniform</SelectItem>
                                <SelectItem value="Boots">Boots</SelectItem>
                                <SelectItem value="Badge">Badge</SelectItem>
                                <SelectItem value="Radio">Radio</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dateIssued"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date Issued</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full bg-white pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" className="bg-white" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="condition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="New">New</SelectItem>
                                <SelectItem value="Good">Good</SelectItem>
                                <SelectItem value="Fair">Fair</SelectItem>
                                <SelectItem value="Poor">Poor</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Input placeholder="Add any additional notes" className="bg-white" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Separator />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-900 text-white hover:bg-blue-800">
                        {editingRecord ? 'Update' : 'Add'} Record
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                className="pl-8 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead>Officer Name</TableHead>
                  <TableHead>Issued By</TableHead>
                  <TableHead>Equipment Type</TableHead>
                  <TableHead>Date Issued</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{record.officerName}</TableCell>
                    <TableCell>{record.issuedBy}</TableCell>
                    <TableCell>{record.equipmentType}</TableCell>
                    <TableCell>{format(record.dateIssued, 'PPP')}</TableCell>
                    <TableCell>{record.quantity}</TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-md font-medium", getConditionBadge(record.condition))}>
                        {record.condition}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{record.notes}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(record)}
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(record.id)}
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
      </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UniformEquipmentPage;
