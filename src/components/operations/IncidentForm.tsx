import { useState, useCallback, memo } from "react"
import { Incident, IncidentType, IncidentInvolved, StolenItem, OffenderSex } from "@/types/incidents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { CalendarIcon, PlusCircle, Trash2, AlertCircle, Package, PoundSterling, Hash, Receipt, Edit, Building2, FileText, Shield, ListChecks, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  MOCK_CUSTOMERS, 
  MOCK_STORES, 
  MOCK_OFFICERS, 
  MOCK_OFFICER_ROLES,
  Customer,
  Store,
  Officer,
  OfficerRole
} from "@/data/mockDropdownData"

const incidentTypes: IncidentType[] = [
  IncidentType.ARREST,
  IncidentType.DETER,
  IncidentType.THEFT,
  IncidentType.CRIMINAL_DAMAGE,
  IncidentType.CREDIT_CARD_FRAUD,
  IncidentType.SUSPICIOUS_BEHAVIOUR,
  IncidentType.UNDERAGE_PURCHASE,
  IncidentType.ANTI_SOCIAL,
  IncidentType.OTHER
]

const incidentInvolved: IncidentInvolved[] = [
  'J - Self Scan Tills?',
  'L - Threats And Intimidation?',
  'N - Ban From Store?',
  'M - Scan And Go?',
  'K - Abusive behaviour?',
  'M - Spitting?',
  'O - Violent Behavior (Physical)?',
  'Q - Police Failed to Attend?'
]

interface IncidentFormProps {
  onSubmit: (incident: Incident) => void
  onCancel: () => void
  initialData?: Partial<Incident>
}

const IncidentForm = memo(({ onSubmit, onCancel, initialData }: IncidentFormProps) => {
  const [formData, setFormData] = useState<Partial<Incident>>(initialData || {
    typeOfIncident: IncidentType.ARREST,
    incidentInvolved: [],
    policeInvolvement: false,
    offenderSex: 'N/A or N/K',
    personalDetailsVerified: false,
    totalValueRecovered: 0,
    stolenItems: [],
    offenderAddress: {
      houseNumber: '',
      numberAndStreet: '',
      villageOrSuburb: '',
      town: '',
      county: '',
      postCode: ''
    }
  })

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const submissionData = {
      ...formData,
      offenderAddress: {
        ...formData.offenderAddress,
      },
      offenderAge: 0,
      offenderPlaceOfBirth: '',
      policeID: '',
      crimeReferenceNumber: '',
    }
    onSubmit(submissionData as Incident)
  }, [formData, onSubmit])

  const handleInputChange = useCallback(<K extends keyof Incident>(field: K, value: Incident[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleAddressChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      offenderAddress: {
        ...prev.offenderAddress,
        [field]: value,
      },
    }))
  }, [])

  const handleAddStolenItem = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      stolenItems: [
        ...(prev.stolenItems || []),
        {
          id: crypto.randomUUID(),
          description: '',
          cost: 0,
          quantity: 1,
          totalAmount: 0
        }
      ]
    }))
  }, [])

  const handleRemoveStolenItem = useCallback((itemId: string) => {
    setFormData(prev => {
      const updatedItems = prev.stolenItems?.filter(item => item.id !== itemId) || []
      const totalValue = updatedItems.reduce((sum, item) => sum + item.totalAmount, 0)

      return {
        ...prev,
        stolenItems: updatedItems,
        totalValueRecovered: totalValue
      }
    })
  }, [])

  const handleStolenItemChange = useCallback((itemId: string, field: keyof StolenItem, value: string | number) => {
    setFormData(prev => {
      const updatedItems = prev.stolenItems?.map(item => {
        if (item.id === itemId) {
          let updatedItem = { ...item }

          if (field === 'cost') {
            // Ensure cost is a valid number and not negative
            const parsedCost = typeof value === 'string' ? parseFloat(value) : value
            if (!isNaN(parsedCost) && parsedCost >= 0) {
              updatedItem.cost = Math.round(parsedCost * 100) / 100 // Round to 2 decimal places
            } else {
              updatedItem.cost = 0
            }
            updatedItem.totalAmount = updatedItem.cost * updatedItem.quantity
          } else if (field === 'quantity') {
            // Ensure quantity is a valid positive integer
            const parsedQuantity = typeof value === 'string' ? parseInt(value) : value
            if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
              updatedItem.quantity = parsedQuantity
            } else {
              updatedItem.quantity = 1
            }
            updatedItem.totalAmount = updatedItem.cost * updatedItem.quantity
          } else {
            (updatedItem[field] as any) = value
          }

          return updatedItem
        }
        return item
      }) || []

      // Calculate total value recovered
      const totalValue = updatedItems.reduce((sum, item) => sum + item.totalAmount, 0)

      return {
        ...prev,
        stolenItems: updatedItems,
        totalValueRecovered: totalValue
      }
    })
  }, [])

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Basic Information
            </CardTitle>
            <CardDescription>Enter the core details about the incident</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Customer Name *</Label>
              <Select
                value={formData.customerName || ''}
                onValueChange={(value) => handleInputChange('customerName', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_CUSTOMERS.map((customer) => (
                    <SelectItem key={customer} value={customer}>
                      {customer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Store Name *</Label>
              <Select
                value={formData.siteName || ''}
                onValueChange={(value) => handleInputChange('siteName', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_STORES.map((store) => (
                    <SelectItem key={store} value={store}>
                      {store}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Officer Name *</Label>
              <Select
                value={formData.officerName || ''}
                onValueChange={(value) => handleInputChange('officerName', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select officer" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_OFFICERS.map((officer) => (
                    <SelectItem key={officer} value={officer}>
                      {officer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Officer Role *</Label>
              <Select
                value={formData.officerRole || ''}
                onValueChange={(value) => handleInputChange('officerRole', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_OFFICER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Incident Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              Incident Details
            </CardTitle>
            <CardDescription>Specify when and what type of incident occurred</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Date of Incident *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateOfIncident ? (
                      format(new Date(formData.dateOfIncident), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dateOfIncident ? new Date(formData.dateOfIncident) : undefined}
                    onSelect={(date) => handleInputChange('dateOfIncident', date?.toISOString() || '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Time of Incident *</Label>
              <Input
                type="time"
                value={formData.timeOfIncident || ''}
                onChange={(e) => handleInputChange('timeOfIncident', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Type of Incident *</Label>
              <Select
                value={formData.typeOfIncident}
                onValueChange={(value) => handleInputChange('typeOfIncident', value as IncidentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select incident type" />
                </SelectTrigger>
                <SelectContent>
                  {incidentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Description
            </CardTitle>
            <CardDescription>Provide detailed information about the incident</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Incident Details *</Label>
              <Textarea
                value={formData.incidentDetails || ''}
                onChange={(e) => handleInputChange('incidentDetails', e.target.value)}
                placeholder="Describe the incident in detail"
                className="min-h-[100px]"
                required
              />
            </div>
            <div>
              <Label>Store Comments</Label>
              <Textarea
                value={formData.storeComments || ''}
                onChange={(e) => handleInputChange('storeComments', e.target.value)}
                placeholder="Add any store-specific comments"
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Police Involvement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Police Involvement
            </CardTitle>
            <CardDescription>Record any police-related information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Was Police Involved?</Label>
              <RadioGroup
                value={formData.policeInvolvement ? "yes" : "no"}
                onValueChange={(value) =>
                  handleInputChange('policeInvolvement', value === "yes")
                }
                className="flex items-center space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">No</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.policeInvolvement && (
              <>
                <div>
                  <Label>URN Number</Label>
                  <Input
                    value={formData.urnNumber || ''}
                    onChange={(e) => handleInputChange('urnNumber', e.target.value)}
                    placeholder="Enter URN Number"
                  />
                </div>
                <div>
                  <Label>Crime Reference Number</Label>
                  <Input
                    value={formData.crimeReferenceNumber || ''}
                    onChange={(e) => handleInputChange('crimeReferenceNumber', e.target.value)}
                    placeholder="Enter reference number"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Offender Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Offender Details
            </CardTitle>
            <CardDescription>Record information about the offender</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Offender Name</Label>
              <Input
                value={formData.offenderName || ''}
                onChange={(e) => handleInputChange('offenderName', e.target.value)}
                placeholder="Enter offender name"
              />
            </div>
            <div>
              <Label>Offender Sex</Label>
              <Select 
                value={formData.offenderSex || 'N/A or N/K'}
                onValueChange={(value: OffenderSex) => handleInputChange('offenderSex', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select offender sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="N/A or N/K">N/A or N/K</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Offender DOB</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.offenderDOB ? (
                      format(new Date(formData.offenderDOB), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.offenderDOB ? new Date(formData.offenderDOB) : undefined}
                    onSelect={(date) => handleInputChange('offenderDOB', date?.toISOString() || '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Incident Involved */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-blue-500" />
              Incident Categories
            </CardTitle>
            <CardDescription>Select all applicable categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {incidentInvolved.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.incidentInvolved?.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleInputChange('incidentInvolved', [
                          ...(formData.incidentInvolved || []),
                          type,
                        ])
                      } else {
                        handleInputChange(
                          'incidentInvolved',
                          formData.incidentInvolved?.filter((t) => t !== type) || []
                        )
                      }
                    }}
                  />
                  <Label className="text-sm">{type}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stolen Items Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                Stolen Items
              </CardTitle>
              <CardDescription>Record details of any stolen items</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddStolenItem}
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px]">Cost</TableHead>
                  <TableHead className="w-[120px]">Quantity</TableHead>
                  <TableHead className="w-[120px]">Total</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.stolenItems?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={(e) => handleStolenItemChange(item.id, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.cost}
                        onChange={(e) => handleStolenItemChange(item.id, 'cost', e.target.value)}
                        step="0.01"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleStolenItemChange(item.id, 'quantity', e.target.value)}
                        min="1"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      £{item.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStolenItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!formData.stolenItems || formData.stolenItems.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                        <Package className="w-8 h-8 text-gray-400" />
                        <p>No items added</p>
                        <p>Click "Add Item" to start recording stolen items</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <PoundSterling className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Value Recovered</p>
              <p className="text-2xl font-bold text-green-600">
                £{formData.totalValueRecovered?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-12" />
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-blue-600">
                {formData.stolenItems?.length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="min-w-[100px] bg-green-600 hover:bg-green-700"
          >
            Save Incident
          </Button>
        </div>
      </div>
    </form>
  )
})

IncidentForm.displayName = 'IncidentForm'

export { IncidentForm }
