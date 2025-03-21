import React, { useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
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
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Constants
const ITEMS_PER_PAGE = 10;
const EQUIPMENT_TYPES = ["Uniform", "Boots", "Badge", "Radio"];
const CONDITION_TYPES = ["New", "Good", "Fair", "Poor"];
const CONDITION_STYLES = {
  'New': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Good': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Fair': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Poor': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

// Form Schema
const formSchema = z.object({
  officerName: z.string().min(1, 'Officer name is required'),
  issuedBy: z.string().min(1, 'Issuer name is required'),
  equipmentType: z.string().min(1, 'Equipment type is required'),
  dateIssued: z.date({ required_error: 'Date issued is required' }),
  quantity: z.string().min(1, 'Quantity is required'),
  condition: z.string().min(1, 'Condition is required'),
  notes: z.string().optional(),
});

// Types
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

interface Person {
  id: string;
  name: string;
}

// Mock Data
const MOCK_OFFICERS: Person[] = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Mike Johnson' },
  { id: '4', name: 'Sarah Williams' },
];

const MOCK_ISSUERS: Person[] = [
  { id: '1', name: 'Admin User' },
  { id: '2', name: 'Store Manager' },
  { id: '3', name: 'Equipment Officer' },
  { id: '4', name: 'Supervisor' },
];

const INITIAL_EQUIPMENT: EquipmentRecord[] = [
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
  {
    id: '2',
    officerName: 'Jane Smith',
    issuedBy: 'Store Manager',
    equipmentType: 'Boots',
    dateIssued: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    quantity: '1',
    condition: 'Good',
    notes: 'Security-grade boots with steel toe caps',
  },
  {
    id: '3',
    officerName: 'Mike Johnson',
    issuedBy: 'Equipment Officer',
    equipmentType: 'Badge',
    dateIssued: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    quantity: '1',
    condition: 'New',
    notes: 'Official ID badge with photo and access credentials',
  },
  {
    id: '4',
    officerName: 'Sarah Williams',
    issuedBy: 'Supervisor',
    equipmentType: 'Radio',
    dateIssued: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    quantity: '1',
    condition: 'Fair',
    notes: 'Two-way radio with spare battery pack',
  },
];

// Reusable Components
const PageHeader = ({ onAddClick }) => (
  <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 md:gap-4">
    <div className="flex-1">
      <CardTitle className="text-lg xs:text-xl sm:text-2xl font-bold">Uniform and Equipment Record</CardTitle>
      <CardDescription className="text-xs sm:text-sm">Manage and track equipment issued to officers</CardDescription>
    </div>
    <div className="w-full xs:w-auto flex justify-end">
      <DialogTrigger asChild>
        <Button className="bg-blue-900 text-white hover:bg-blue-800 mt-2 xs:mt-0 h-8 xs:h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Add New Equipment
        </Button>
      </DialogTrigger>
    </div>
  </div>
);

const PeopleSelect = ({ name, label, control, placeholder, options }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-xs sm:text-sm">{label}</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger className="bg-white h-8 xs:h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {options.map((person) => (
              <SelectItem key={person.id} value={person.name} className="text-xs sm:text-sm">
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage className="text-xs" />
      </FormItem>
    )}
  />
);

const DatePickerField = ({ control }) => (
  <FormField
    control={control}
    name="dateIssued"
    render={({ field }) => (
      <FormItem className="flex flex-col">
        <FormLabel className="text-xs sm:text-sm">Date Issued</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                className={cn(
                  "w-full bg-white pl-2 sm:pl-3 text-left font-normal h-8 xs:h-9 sm:h-10 text-xs sm:text-sm",
                  !field.value && "text-muted-foreground"
                )}
              >
                {field.value ? (
                  format(field.value, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
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
        <FormMessage className="text-xs" />
      </FormItem>
    )}
  />
);

const EquipmentTypeSelect = ({ control }) => (
  <FormField
    control={control}
    name="equipmentType"
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-xs sm:text-sm">Equipment Type</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger className="bg-white h-8 xs:h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="Select equipment type" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {EQUIPMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type} className="text-xs sm:text-sm">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage className="text-xs" />
      </FormItem>
    )}
  />
);

const ConditionSelect = ({ control }) => (
  <FormField
    control={control}
    name="condition"
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-xs sm:text-sm">Condition</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger className="bg-white h-8 xs:h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {CONDITION_TYPES.map((condition) => (
              <SelectItem key={condition} value={condition} className="text-xs sm:text-sm">
                {condition}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage className="text-xs" />
      </FormItem>
    )}
  />
);

// Main Component
const UniformEquipmentPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRecord, setEditingRecord] = useState<EquipmentRecord | null>(null);
  const [equipmentRecords, setEquipmentRecords] = useState<EquipmentRecord[]>(INITIAL_EQUIPMENT);

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
  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSubmit = useCallback((values: z.infer<typeof formSchema>) => {
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
  }, [editingRecord, form]);

  const handleEdit = useCallback((record: EquipmentRecord) => {
    setEditingRecord(record);
    form.reset(record);
    setIsDialogOpen(true);
  }, [form]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setEquipmentRecords(records => records.filter(record => record.id !== id));
      toast({
        title: "Record Deleted",
        description: "Equipment record has been successfully deleted.",
      });
    }
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingRecord(null);
    form.reset();
  }, [form]);

  return (
    <div className="w-full min-h-screen">
      <div className="max-w-[1400px] mx-auto p-2 xs:p-3 sm:p-4 md:p-1 space-y-3 md:space-y-6">
        <Card className="border shadow-sm pr-0 xs:pr-2 sm:pr-8 md:pr-10">
          <CardHeader className="p-2 xs:p-3 sm:p-4 lg:p-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <PageHeader onAddClick={() => setIsDialogOpen(true)} />
              <DialogContent className="w-[95%] max-w-[600px] p-2 xs:p-3 sm:p-4 lg:p-6 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-2 sm:pb-4">
                  <DialogTitle className="text-sm xs:text-base sm:text-lg font-semibold">
                    {editingRecord ? 'Edit Equipment Record' : 'Add New Equipment Record'}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm">
                    {editingRecord 
                      ? 'Update the equipment record details below.' 
                      : 'Fill in the details to add a new equipment record.'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2 xs:space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
                      <PeopleSelect 
                        name="officerName"
                        label="Officer Name"
                        control={form.control}
                        placeholder="Select officer"
                        options={MOCK_OFFICERS}
                      />
                      <PeopleSelect 
                        name="issuedBy"
                        label="Issued By"
                        control={form.control}
                        placeholder="Select issuer"
                        options={MOCK_ISSUERS}
                      />
                      <EquipmentTypeSelect control={form.control} />
                      <DatePickerField control={form.control} />
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs sm:text-sm">Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" className="bg-white h-8 xs:h-9 sm:h-10 text-xs sm:text-sm" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <ConditionSelect control={form.control} />
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem className="col-span-1 sm:col-span-2">
                            <FormLabel className="text-xs sm:text-sm">Notes</FormLabel>
                            <FormControl>
                              <Input placeholder="Add any additional notes" className="bg-white h-8 xs:h-9 sm:h-10 text-xs sm:text-sm" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Separator className="my-2 xs:my-3" />
                    <DialogFooter className="flex flex-col-reverse xs:flex-row gap-2 xs:gap-0">
                      <Button type="button" variant="outline" onClick={closeDialog} className="w-full xs:w-auto h-8 xs:h-9 sm:h-10 text-xs sm:text-sm">
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-900 text-white hover:bg-blue-800 w-full xs:w-auto h-8 xs:h-9 sm:h-10 text-xs sm:text-sm">
                        {editingRecord ? 'Update' : 'Add'} Record
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-2 xs:p-3 sm:p-4 lg:p-6 pr-2 xs:pr-4 sm:pr-10 md:pr-6 ">
            {/* Stats Cards Grid - optimized for mobile view */}
            <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 mb-3 md:mb-6">
              {/* Total Equipment */}
              <Card className="bg-blue-900 border-0 shadow-sm">
                <CardContent className="p-2 xs:p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] xs:text-xs md:text-sm text-blue-200 font-medium">Total Equipment</p>
                    <h3 className="text-sm xs:text-base md:text-xl font-bold text-white">{equipmentRecords.length}</h3>
                  </div>
                  <div className="bg-blue-800 rounded-full p-1.5">
                    <Plus className="h-3 w-3 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              {/* Boots */}
              <Card className="bg-green-900 border-0 shadow-sm">
                <CardContent className="p-2 xs:p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] xs:text-xs md:text-sm text-green-200 font-medium">Boots</p>
                    <h3 className="text-sm xs:text-base md:text-xl font-bold text-white">
                      {equipmentRecords.filter(r => r.equipmentType === 'Boots').length}
                    </h3>
                  </div>
                  <div className="bg-green-800 rounded-full p-1.5">
                    <CalendarIcon className="h-3 w-3 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              {/* Uniforms Issued */}
              <Card className="bg-yellow-900 border-0 shadow-sm">
                <CardContent className="p-2 xs:p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] xs:text-xs md:text-sm text-yellow-200 font-medium">Uniforms</p>
                    <h3 className="text-sm xs:text-base md:text-xl font-bold text-white">
                      {equipmentRecords.filter(r => r.equipmentType === 'Uniform').length}
                    </h3>
                  </div>
                  <div className="bg-yellow-800 rounded-full p-1.5">
                    <Search className="h-3 w-3 text-yellow-200" />
                  </div>
                </CardContent>
              </Card>
              {/* Badge */}
              <Card className="bg-purple-900 border-0 shadow-sm">
                <CardContent className="p-2 xs:p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] xs:text-xs md:text-sm text-purple-200 font-medium">Badge</p>
                    <h3 className="text-sm xs:text-base md:text-xl font-bold text-white">
                      {equipmentRecords.filter(r => r.equipmentType === 'Badge').length}
                    </h3>
                  </div>
                  <div className="bg-purple-800 rounded-full p-1.5">
                    <CalendarIcon className="h-3 w-3 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Search Bar */}
            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 sm:gap-4 mb-3 md:mb-6">
              <div className="relative w-full xs:max-w-[200px] sm:max-w-sm">
                <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  className="pl-7 xs:pl-8 bg-white h-8 xs:h-9 sm:h-10 w-full text-xs sm:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {/* Could add filter controls here in the future */}
            </div>

            {/* Equipment Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="min-w-[300px]">
                  <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                      <TableHead className="p-1 xs:p-2 sm:p-3 md:p-4 font-medium whitespace-nowrap text-xs sm:text-sm">Officer</TableHead>
                      <TableHead className="p-1 xs:p-2 sm:p-3 md:p-4 font-medium whitespace-nowrap hidden xs:table-cell text-xs sm:text-sm">Issued By</TableHead>
                      <TableHead className="p-1 xs:p-2 sm:p-3 md:p-4 font-medium whitespace-nowrap text-xs sm:text-sm">Type</TableHead>
                      <TableHead className="p-1 xs:p-2 sm:p-3 md:p-4 font-medium whitespace-nowrap hidden sm:table-cell text-xs sm:text-sm">Date</TableHead>
                      <TableHead className="p-1 xs:p-2 sm:p-3 md:p-4 font-medium whitespace-nowrap hidden sm:table-cell text-xs sm:text-sm">Qty</TableHead>
                      <TableHead className="p-1 xs:p-2 sm:p-3 md:p-4 font-medium whitespace-nowrap text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="p-1 xs:p-2 sm:p-3 md:p-4 font-medium whitespace-nowrap hidden md:table-cell text-xs sm:text-sm">Notes</TableHead>
                      <TableHead className="p-1 xs:p-2 sm:p-3 md:p-4 font-medium text-right text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.length > 0 ? (
                      paginatedRecords.map((record) => (
                        <TableRow key={record.id} className="hover:bg-muted/50">
                          <TableCell className="p-1 xs:p-2 sm:p-3 md:p-4 font-medium truncate max-w-[80px] xs:max-w-[120px] sm:max-w-[150px] text-xs sm:text-sm">
                            {record.officerName}
                          </TableCell>
                          <TableCell className="p-1 xs:p-2 sm:p-3 md:p-4 truncate max-w-[80px] xs:max-w-[120px] sm:max-w-[150px] hidden xs:table-cell text-xs sm:text-sm">
                            {record.issuedBy}
                          </TableCell>
                          <TableCell className="p-1 xs:p-2 sm:p-3 md:p-4 text-xs sm:text-sm">
                            {record.equipmentType}
                          </TableCell>
                          <TableCell className="p-1 xs:p-2 sm:p-3 md:p-4 hidden sm:table-cell whitespace-nowrap text-xs sm:text-sm">
                            {format(record.dateIssued, 'PP')}
                          </TableCell>
                          <TableCell className="p-1 xs:p-2 sm:p-3 md:p-4 hidden sm:table-cell text-xs sm:text-sm">
                            {record.quantity}
                          </TableCell>
                          <TableCell className="p-1 xs:p-2 sm:p-3 md:p-4">
                            <Badge className={cn("rounded-md text-[10px] xs:text-xs font-medium py-0.5 px-1.5", CONDITION_STYLES[record.condition] || 'bg-gray-100 text-gray-800')}>
                              {record.condition}
                            </Badge>
                          </TableCell>
                          <TableCell className="p-1 xs:p-2 sm:p-3 md:p-4 max-w-[120px] md:max-w-[150px] lg:max-w-[200px] truncate hidden md:table-cell text-xs sm:text-sm">
                            {record.notes}
                          </TableCell>
                          <TableCell className="p-1 xs:p-2 sm:p-3 md:p-4 text-right">
                            <div className="flex justify-end gap-1 sm:gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(record)}
                                className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                                aria-label="Edit record"
                              >
                                <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(record.id)}
                                className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                aria-label="Delete record"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 sm:py-6">
                          <div className="flex flex-col items-center justify-center gap-2 xs:gap-3">
                            <p className="text-xs sm:text-sm text-gray-500">No equipment records found.</p>
                            <Button 
                              onClick={() => setIsDialogOpen(true)}
                              className="bg-blue-900 text-white hover:bg-blue-800 text-xs h-7 sm:h-8"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add New Equipment
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Enhanced Pagination */}
            {filteredRecords.length > 0 && (
              <div className="flex flex-col xs:flex-row justify-between items-center mt-3 xs:mt-4 gap-2 xs:gap-3 sm:gap-0">
                <div className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground order-2 xs:order-1">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length)} of {filteredRecords.length} records
                </div>
                {filteredRecords.length > ITEMS_PER_PAGE && (
                  <div className="flex items-center gap-2 order-1 xs:order-2 w-full xs:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="flex-1 xs:flex-none h-7 xs:h-8 sm:h-9 text-xs"
                    >
                      Previous
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="hidden xs:flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        // Show first 2 pages, current page, and last 2 pages
                        let pageNum = i + 1;
                        if (totalPages > 5) {
                          if (currentPage <= 3) {
                            // Near start, show first 5 pages
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            // Near end, show last 5 pages
                            pageNum = totalPages - 4 + i;
                          } else {
                            // Middle, show current page and 2 on each side
                            pageNum = currentPage - 2 + i;
                          }
                        }

                        return (
                          <Button
                            key={i}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={cn(
                              "h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 p-0 text-xs",
                              currentPage === pageNum ? "bg-blue-900 text-white" : ""
                            )}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className="flex-1 xs:flex-none h-7 xs:h-8 sm:h-9 text-xs"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UniformEquipmentPage;
