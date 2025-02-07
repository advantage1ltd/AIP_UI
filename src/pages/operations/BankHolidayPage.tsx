import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from 'uuid';
import { Pencil, Trash2, Eye } from "lucide-react";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock officers data
const mockOfficers = [
  { id: "off1", name: "John Smith" },
  { id: "off2", name: "Sarah Johnson" },
  { id: "off3", name: "Michael Brown" },
  { id: "off4", name: "Emily Davis" },
];

// Mock managers data (reusing from holiday request)
const mockManagers = [
  { id: "m1", name: "John Smith", role: "Senior Manager" },
  { id: "m2", name: "Sarah Johnson", role: "Department Head" },
  { id: "m3", name: "Michael Brown", role: "Team Lead" },
  { id: "m4", name: "Emily Davis", role: "Operations Manager" },
];

interface BankHoliday {
  id: string;
  officerId: string;
  holidayDate: Date;
  dateOfRequest: Date;
  authorisedBy: string;
  dateAuthorised: Date | null;
}

const formSchema = z.object({
  officerId: z.string().min(1, "Officer is required"),
  holidayDate: z.date({
    required_error: "Bank holiday date is required",
  }),
  authorisedBy: z.string().min(1, "Authorising manager is required"),
  dateAuthorised: z.date().optional(),
});

export default function BankHolidayPage() {
  const [holidays, setHolidays] = useState<BankHoliday[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<BankHoliday | null>(null);
  const [viewingHoliday, setViewingHoliday] = useState<BankHoliday | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      officerId: "",
      holidayDate: undefined,
      authorisedBy: "",
      dateAuthorised: undefined,
    },
  });

  useEffect(() => {
    if (editingHoliday) {
      form.reset({
        officerId: editingHoliday.officerId,
        holidayDate: editingHoliday.holidayDate,
        authorisedBy: editingHoliday.authorisedBy,
        dateAuthorised: editingHoliday.dateAuthorised || undefined,
      });
    }
  }, [editingHoliday, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formattedHoliday = {
      id: editingHoliday?.id || uuidv4(),
      officerId: values.officerId,
      holidayDate: values.holidayDate,
      dateOfRequest: editingHoliday?.dateOfRequest || new Date(),
      authorisedBy: values.authorisedBy,
      dateAuthorised: values.dateAuthorised || null,
    };

    if (editingHoliday) {
      setHolidays(holidays.map(holiday => 
        holiday.id === editingHoliday.id ? formattedHoliday : holiday
      ));
      toast({
        title: "Success",
        description: "Bank holiday updated successfully",
      });
    } else {
      setHolidays([...holidays, formattedHoliday]);
      toast({
        title: "Success",
        description: "Bank holiday created successfully",
      });
    }

    setIsDialogOpen(false);
    form.reset();
    setEditingHoliday(null);
  };

  const filteredHolidays = useMemo(() => {
    return holidays.filter((holiday) => {
      const officerName = mockOfficers.find(o => o.id === holiday.officerId)?.name || '';
      const searchLower = searchTerm.toLowerCase();
      return officerName.toLowerCase().includes(searchLower);
    });
  }, [holidays, searchTerm]);

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Bank Holidays</h2>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search by officer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingHoliday(null);
                form.reset();
              }}>
                Add Bank Holiday
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingHoliday ? "Edit Bank Holiday" : "Add Bank Holiday"}</DialogTitle>
                <DialogDescription>
                  {editingHoliday 
                    ? "Edit the details of the bank holiday."
                    : "Add a new bank holiday to the calendar."}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="space-y-4">
                    {/* Holiday Details Section */}
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      <h3 className="text-lg font-semibold">Holiday Details</h3>
                      
                      <FormField
                        control={form.control}
                        name="officerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Officer Name</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an officer" />
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

                      <FormField
                        control={form.control}
                        name="holidayDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Bank Holiday Date</FormLabel>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                              onChange={e => {
                                const date = new Date(e.target.value);
                                field.onChange(date);
                              }}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="authorisedBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Authorised By</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select authorising manager" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockManagers.map((manager) => (
                                  <SelectItem key={manager.id} value={manager.id}>
                                    {manager.name} - {manager.role}
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
                        name="dateAuthorised"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date Authorised</FormLabel>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                              onChange={e => {
                                const date = new Date(e.target.value);
                                field.onChange(date);
                              }}
                              disabled={!form.getValues("authorisedBy")}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingHoliday ? "Update Holiday" : "Create Holiday"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* View Details Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bank Holiday Details</DialogTitle>
                <DialogDescription>
                  View complete details of the bank holiday
                </DialogDescription>
              </DialogHeader>

              {viewingHoliday && (
                <div className="space-y-6">
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Officer Name</label>
                        <p className="mt-1">
                          {mockOfficers.find(o => o.id === viewingHoliday.officerId)?.name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Bank Holiday Date</label>
                        <p className="mt-1">{format(viewingHoliday.holidayDate, 'dd/MM/yyyy')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Date of Request</label>
                        <p className="mt-1">{format(viewingHoliday.dateOfRequest, 'dd/MM/yyyy')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Authorised By</label>
                        <p className="mt-1">
                          {mockManagers.find(m => m.id === viewingHoliday.authorisedBy)?.name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Date Authorised</label>
                        <p className="mt-1">
                          {viewingHoliday.dateAuthorised 
                            ? format(viewingHoliday.dateAuthorised, 'dd/MM/yyyy')
                            : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Officer Name</TableHead>
              <TableHead>Bank Holiday Date</TableHead>
              <TableHead>Date of Request</TableHead>
              <TableHead>Authorised By</TableHead>
              <TableHead>Date Authorised</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHolidays.map((holiday) => (
              <TableRow key={holiday.id}>
                <TableCell>
                  {mockOfficers.find(o => o.id === holiday.officerId)?.name}
                </TableCell>
                <TableCell>{format(holiday.holidayDate, 'dd/MM/yyyy')}</TableCell>
                <TableCell>{format(holiday.dateOfRequest, 'dd/MM/yyyy')}</TableCell>
                <TableCell>
                  {mockManagers.find(m => m.id === holiday.authorisedBy)?.name}
                </TableCell>
                <TableCell>
                  {holiday.dateAuthorised 
                    ? format(holiday.dateAuthorised, 'dd/MM/yyyy')
                    : 'Pending'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingHoliday(holiday);
                        setIsDialogOpen(true);
                      }}
                      className="h-8 w-8"
                      title="Edit Holiday"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setViewingHoliday(holiday);
                        setIsViewDialogOpen(true);
                      }}
                      className="h-8 w-8"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setHolidays(holidays.filter((h) => h.id !== holiday.id));
                      }}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Delete Holiday"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredHolidays.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No bank holidays found matching your search
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
