import React from 'react'
import { format } from 'date-fns'
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from '@/components/ui/use-toast'

// Define the form schema
const formSchema = z.object({
  site: z.string().min(1, 'Site is required'),
  officerName: z.string().min(1, 'Officer name is required'),
  reportDate: z.date({
    required_error: 'Report date is required',
  }),
  // Compliance section
  tillCashOver150: z.enum(['Yes', 'No']),
  tillCashOver150Description: z.string().optional(),
  cashOfficeDoorOpen: z.enum(['Yes', 'No']),
  cashOfficeDoorOpenDescription: z.string().optional(),
  visibleCashOnDisplay: z.enum(['Yes', 'No']),
  visibleCashOnDisplayDescription: z.string().optional(),
  visibleKeysOnDisplay: z.enum(['Yes', 'No']),
  visibleKeysOnDisplayDescription: z.string().optional(),
  fireRoutesBlocked: z.enum(['Yes', 'No']),
  fireRoutesBlockedDescription: z.string().optional(),
  beSafePoster: z.enum(['Yes', 'No']),
  beSafePosterDescription: z.string().optional(),
  atmAbuse: z.enum(['Yes', 'No']),
  atmAbuseDescription: z.string().optional(),
  // Insecure Areas
  kioskSecure: z.enum(['Yes', 'No']),
  kioskSecureDescription: z.string().optional(),
  highValueRoom: z.enum(['Yes', 'No']),
  highValueRoomDescription: z.string().optional(),
  managersOffice: z.enum(['Yes', 'No']),
  managersOfficeDescription: z.string().optional(),
  warehouseToSalesFloor: z.enum(['Yes', 'No']),
  warehouseToSalesFloorDescription: z.string().optional(),
  serviceYard: z.enum(['Yes', 'No']),
  serviceYardDescription: z.string().optional(),
  carParkGrounds: z.enum(['Yes', 'No']),
  carParkGroundsDescription: z.string().optional(),
  fireDoorsBack: z.enum(['Yes', 'No']),
  fireDoorsBackDescription: z.string().optional(),
  fireDoorsShop: z.enum(['Yes', 'No']),
  fireDoorsShopDescription: z.string().optional(),
  // Systems Not Working
  watchMeNow: z.enum(['Yes', 'No']),
  watchMeNowDescription: z.string().optional(),
  cctv: z.enum(['Yes', 'No']),
  cctvDescription: z.string().optional(),
  intruderAlarm: z.enum(['Yes', 'No']),
  intruderAlarmDescription: z.string().optional(),
  keyholding: z.enum(['Yes', 'No']),
  keyholdingDescription: z.string().optional(),
  bodyWornCctv: z.enum(['Yes', 'No']),
  bodyWornCctvDescription: z.string().optional(),
  cigaretteTracker: z.enum(['Yes', 'No']),
  cigaretteTrackerDescription: z.string().optional(),
  crimeReporting: z.enum(['Yes', 'No']),
  crimeReportingDescription: z.string().optional(),
  // Notes and searches
  shiftCompletionNotes: z.string(),
  managerName: z.string().min(1, 'Manager name is required'),
  colleagueName: z.string().min(1, 'Colleague name is required'),
  numberOfSearches: z.string().min(1, 'Number of searches is required'),
  issueFound: z.enum(['Yes', 'No']),
  issueFoundDescription: z.string().optional(),
});

// Mock data interface
interface DARRecord {
  id: string;
  site: string;
  officerName: string;
  reportDate: Date;
  createdAt: Date;
}

const CustomerDAR = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [editingRecord, setEditingRecord] = React.useState<DARRecord | null>(null)
  const itemsPerPage = 10

  // Mock data
  const [darRecords, setDarRecords] = React.useState<DARRecord[]>([
    {
      id: '1',
      site: 'Store 1',
      officerName: 'John Doe',
      reportDate: new Date(),
      createdAt: new Date(),
    },
  ])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      site: '',
      officerName: '',
      tillCashOver150: 'No',
      cashOfficeDoorOpen: 'No',
      visibleCashOnDisplay: 'No',
      visibleKeysOnDisplay: 'No',
      fireRoutesBlocked: 'No',
      beSafePoster: 'No',
      atmAbuse: 'No',
      kioskSecure: 'No',
      highValueRoom: 'No',
      managersOffice: 'No',
      warehouseToSalesFloor: 'No',
      serviceYard: 'No',
      carParkGrounds: 'No',
      fireDoorsBack: 'No',
      fireDoorsShop: 'No',
      watchMeNow: 'No',
      cctv: 'No',
      intruderAlarm: 'No',
      keyholding: 'No',
      bodyWornCctv: 'No',
      cigaretteTracker: 'No',
      crimeReporting: 'No',
      shiftCompletionNotes: '',
      managerName: '',
      colleagueName: '',
      numberOfSearches: '',
      issueFound: 'No',
    },
  })

  // Filter records based on search query
  const filteredRecords = darRecords.filter((record) =>
    record.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.officerName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingRecord) {
      setDarRecords(records =>
        records.map(record =>
          record.id === editingRecord.id
            ? { ...values, id: record.id, createdAt: record.createdAt } as DARRecord
            : record
        )
      )
      toast({
        title: "Record Updated",
        description: "DAR record has been successfully updated.",
      })
    } else {
      setDarRecords(records => [
        { ...values, id: Date.now().toString(), createdAt: new Date() } as DARRecord,
        ...records,
      ])
      toast({
        title: "Record Added",
        description: "New DAR record has been successfully added.",
      })
    }
    setIsDialogOpen(false)
    setEditingRecord(null)
    form.reset()
  }

  const handleEdit = (record: DARRecord) => {
    setEditingRecord(record)
    form.reset(record)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setDarRecords(records => records.filter(record => record.id !== id))
      toast({
        title: "Record Deleted",
        description: "DAR record has been permanently deleted.",
        variant: "destructive",
      })
    }
  }

  const renderYesNoRadio = (name: string, label: string) => (
    <FormField
      control={form.control}
      name={name as any}
      render={({ field }) => (
        <FormItem className="bg-white/50 dark:bg-slate-800/50 p-3 md:p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <FormLabel className="text-sm font-medium flex items-center gap-2">
            {label}
          </FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(value) => {
                field.onChange(value);
                // Reset description when switching to 'No'
                if (value === 'No') {
                  form.setValue(`${name}Description` as any, '');
                }
              }}
              defaultValue={field.value}
              className="flex flex-col md:flex-row gap-2 md:gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Yes" id={`${name}-yes`} />
                <Label htmlFor={`${name}-yes`}>Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="No" id={`${name}-no`} />
                <Label htmlFor={`${name}-no`}>No</Label>
              </div>
            </RadioGroup>
          </FormControl>
          {field.value === 'Yes' && (
            <FormField
              control={form.control}
              name={`${name}Description` as any}
              render={({ field: descriptionField }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...descriptionField}
                      placeholder="Please describe briefly..."
                      className="mt-2 bg-white dark:bg-slate-900"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-2 md:p-4 space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Daily Activity Report
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Track and manage daily security activities and compliance checks
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
             setIsDialogOpen(open);
             if (!open) {
               form.reset(); // Ensure form resets on close
               setEditingRecord(null);
             }
           }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shrink-0 w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
              <DialogHeader>
                <DialogTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {editingRecord ? 'Edit Daily Activity Report' : 'New Daily Activity Report'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Basic Information */}
                    <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg border-b border-slate-200 dark:border-slate-700">
                        <CardTitle className="text-lg font-semibold text-blue-700 dark:text-blue-300">Basic Information</CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Please fill in the basic details about the report
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4 p-4 md:p-6 pt-6">
                        <FormField
                          control={form.control}
                          name="site"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Site</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-white dark:bg-slate-900">
                                    <SelectValue placeholder="Select site" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="store1">Store 1</SelectItem>
                                  <SelectItem value="store2">Store 2</SelectItem>
                                  <SelectItem value="store3">Store 3</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="officerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Officer Name</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-white dark:bg-slate-900" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="reportDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Report Date</FormLabel>
                              <FormControl>
                                <DatePicker
                                  date={field.value}
                                  setDate={(date) => field.onChange(date)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Compliance Section */}
                    <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-t-lg border-b border-slate-200 dark:border-slate-700">
                        <CardTitle className="text-lg font-semibold text-red-700 dark:text-red-300">Compliance</CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Select Yes/No for each compliance check. If Yes is selected, please provide a brief description.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4 p-4 md:p-6 pt-6">
                        {renderYesNoRadio('tillCashOver150', 'Till contained over £150 of cash')}
                        {renderYesNoRadio('cashOfficeDoorOpen', 'Cash Office Door Open')}
                        {renderYesNoRadio('visibleCashOnDisplay', 'Visible Cash On Display')}
                        {renderYesNoRadio('visibleKeysOnDisplay', 'Visible Keys On Display')}
                        {renderYesNoRadio('fireRoutesBlocked', 'Fire Routes Blocked')}
                        {renderYesNoRadio('beSafePoster', 'Be Safe Be Secure Poster')}
                        {renderYesNoRadio('atmAbuse', 'ATM Abuse')}
                      </CardContent>
                    </Card>

                    {/* Insecure Areas */}
                    <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-t-lg border-b border-slate-200 dark:border-slate-700">
                        <CardTitle className="text-lg font-semibold text-amber-700 dark:text-amber-300">Insecure Areas</CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Check each area for security concerns. Select Yes if area is secure, No if issues found and provide details.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4 p-4 md:p-6 pt-6">
                        {renderYesNoRadio('kioskSecure', 'Kiosk Secure')}
                        {renderYesNoRadio('highValueRoom', 'High Value Room')}
                        {renderYesNoRadio('managersOffice', 'Managers Office')}
                        {renderYesNoRadio('warehouseToSalesFloor', 'Warehouse To Sales Floor')}
                        {renderYesNoRadio('serviceYard', 'Service Yard')}
                        {renderYesNoRadio('carParkGrounds', 'Car Park / Grounds')}
                        {renderYesNoRadio('fireDoorsBack', 'Fire Doors (Back of House)')}
                        {renderYesNoRadio('fireDoorsShop', 'Fire Doors (Shop Floor)')}
                      </CardContent>
                    </Card>

                    {/* Systems Not Working */}
                    <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-t-lg border-b border-slate-200 dark:border-slate-700">
                        <CardTitle className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">Systems Not Working</CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Report any non-functioning systems. Select Yes if system is not working and provide additional information.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4 p-4 md:p-6 pt-6">
                        {renderYesNoRadio('watchMeNow', 'Watch Me Now')}
                        {renderYesNoRadio('cctv', 'CCTV')}
                        {renderYesNoRadio('intruderAlarm', 'Intruder Alarm')}
                        {renderYesNoRadio('keyholding', 'Keyholding')}
                        {renderYesNoRadio('bodyWornCctv', 'Body Worn CCTV')}
                        {renderYesNoRadio('cigaretteTracker', 'Cigarette Tracker')}
                        {renderYesNoRadio('crimeReporting', 'Crime Reporting')}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Notes and Searches */}
                  <Card className="border-slate-200 dark:border-slate-700 shadow-lg md:col-span-2">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-t-lg border-b border-slate-200 dark:border-slate-700">
                      <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-300">Notes and Searches</CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Document any additional notes, record searches conducted, and provide relevant staff details.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 md:p-6 pt-6">
                      <FormField
                        control={form.control}
                        name="shiftCompletionNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shift Completion Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Enter shift completion notes"
                                className="min-h-[100px] bg-white dark:bg-slate-900"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="managerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Manager's Name</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-white dark:bg-slate-900" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="colleagueName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Colleague's Name</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-white dark:bg-slate-900" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="numberOfSearches"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of Searches</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" min="0" className="bg-white dark:bg-slate-900" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {renderYesNoRadio('issueFound', 'Issue Found with Search')}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-slate-200 dark:border-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      {editingRecord ? 'Update' : 'Submit'} Report
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Table */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-700 p-2 md:p-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:max-w-sm bg-white dark:bg-slate-900"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 md:p-4">
            {/* Desktop Table View (md and up) */}
            <div className="hidden md:block border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800">
                  <TableRow>
                    <TableHead className="whitespace-nowrap px-4 py-3">Site</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-3">Officer Name</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-3">Report Date</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-3">Created At</TableHead>
                    <TableHead className="text-right whitespace-nowrap px-4 py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.length === 0 ? (
                     <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                       <TableCell colSpan={5} className="h-24 text-center text-slate-500 dark:text-slate-400">
                         No records found.
                       </TableCell>
                     </TableRow>
                  ) : (
                    paginatedRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b last:border-b-0 border-slate-200 dark:border-slate-700">
                        <TableCell className="px-4 py-3">{record.site}</TableCell>
                        <TableCell className="px-4 py-3">{record.officerName}</TableCell>
                        <TableCell className="px-4 py-3 whitespace-nowrap">{format(record.reportDate, 'PPP')}</TableCell>
                        <TableCell className="px-4 py-3 whitespace-nowrap">{format(record.createdAt, 'PPP')}</TableCell>
                        <TableCell className="text-right px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => handleEdit(record)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded-md cursor-pointer"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete(record.id)}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded-md cursor-pointer"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View (below md) */}
            <div className="md:hidden space-y-3 p-2">
              {paginatedRecords.length === 0 ? (
                <div className="text-center text-slate-500 dark:text-slate-400 py-10">
                  No records found.
                </div>
              ) : (
                paginatedRecords.map((record) => (
                  <div key={record.id} className="border rounded-lg p-3 shadow-sm bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">Site: </span>
                          <span className="text-slate-800 dark:text-slate-200">{record.site}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">Officer: </span>
                          <span className="text-slate-800 dark:text-slate-200">{record.officerName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Report Date: </span>
                      <span className="text-slate-800 dark:text-slate-200">{format(record.reportDate, 'PPP')}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Created At: </span>
                      <span className="text-slate-800 dark:text-slate-200">{format(record.createdAt, 'PPP')}</span>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                       <Button
                         onClick={() => handleEdit(record)}
                         className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded-md cursor-pointer"
                       >
                         Edit
                       </Button>
                       <Button
                         onClick={() => handleDelete(record.id)}
                         className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded-md cursor-pointer"
                       >
                         Delete
                       </Button>
                     </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 py-4 px-2 md:px-0">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Showing {paginatedRecords.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="border-slate-200 dark:border-slate-700"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="border-slate-200 dark:border-slate-700"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CustomerDAR 