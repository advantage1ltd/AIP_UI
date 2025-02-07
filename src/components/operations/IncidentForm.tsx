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
import { CalendarIcon, PlusCircle, Trash2, AlertCircle, Package, PoundSterling, Hash, Receipt, Edit } from "lucide-react"
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

  const handleStolenItemChange = useCallback(<T extends keyof StolenItem>(itemId: string, field: T, value: StolenItem[T]) => {
    setFormData(prev => {
      const updatedItems = prev.stolenItems?.map(item => {
        if (item.id === itemId) {
          let updatedItem = { ...item }

          if (field === 'cost') {
            // Ensure cost is a valid number and not negative
            const parsedCost = parseFloat(value as string)
            if (!isNaN(parsedCost) && parsedCost >= 0) {
              updatedItem.cost = Math.round(parsedCost * 100) / 100 // Round to 2 decimal places
            } else {
              updatedItem.cost = 0
            }
            updatedItem.totalAmount = updatedItem.cost * updatedItem.quantity
          } else if (field === 'quantity') {
            // Ensure quantity is a valid positive integer
            const parsedQuantity = parseInt(value as string)
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-6">
        {/* Column 1: Basic Information and Incident Details */}
        <div className="space-y-8">
          <div className="space-y-4 p-6 rounded-lg border border-black bg-background/50">
            <h3 className="font-semibold -mx-6 -mt-6 mb-4 p-4 border-b border-b-black bg-zinc-800/50 rounded-t-lg">Basic Information</h3>
            <div>
              <Label>Customer Name</Label>
              <Input
                value={formData.customerName || ''}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>
            <div>
              <Label>Store Name</Label>
              <Input
                value={formData.siteName || ''}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                placeholder="Enter store name"
                required
              />
            </div>
            <div>
              <Label>Officer Name</Label>
              <Input
                value={formData.officerName || ''}
                onChange={(e) => handleInputChange('officerName', e.target.value)}
                placeholder="Enter officer name"
                required
              />
            </div>
            <div>
              <Label>Officer Role</Label>
              <Input
                value={formData.officerRole || ''}
                onChange={(e) => handleInputChange('officerRole', e.target.value)}
                placeholder="Enter officer role"
              />
            </div>
          </div>

          <div className="space-y-4 p-6 rounded-lg border border-black bg-background/50">
            <h3 className="font-semibold -mx-6 -mt-6 mb-4 p-4 border-b border-b-black bg-zinc-800/50 rounded-t-lg">Incident Details</h3>
            <div>
              <Label>Date of Incident</Label>
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
              <Label>Time of Incident</Label>
              <Input
                type="time"
                value={formData.timeOfIncident || ''}
                onChange={(e) => handleInputChange('timeOfIncident', e.target.value)}
              />
            </div>
            <div>
              <Label>Type of Incident</Label>
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
          </div>
        </div>

        {/* Column 2: Description, Police Involvement, and Additional Details */}
        <div className="space-y-8">
          <div className="space-y-4 p-6 rounded-lg border border-black bg-background/50">
            <h3 className="font-semibold -mx-6 -mt-6 mb-4 p-4 border-b border-b-black bg-zinc-800/50 rounded-t-lg">Description</h3>
            <div>
              <Label>Incident Details</Label>
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
          </div>

          <div className="space-y-4 p-6 rounded-lg border border-black bg-background/50">
            <h3 className="font-semibold -mx-6 -mt-6 mb-4 p-4 border-b border-b-black bg-zinc-800/50 rounded-t-lg">Police Involvement</h3>
            <div>
              <RadioGroup
                value={formData.policeInvolvement ? "yes" : "no"}
                onValueChange={(value) =>
                  handleInputChange('policeInvolvement', value === "yes")
                }
                className="flex items-center space-x-4"
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
              <div className="space-y-4">
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
              </div>
            )}
          </div>

          <div className="space-y-4 p-6 rounded-lg border border-black bg-background/50">
            <h3 className="font-semibold -mx-6 -mt-6 mb-4 p-4 border-b border-b-black bg-zinc-800/50 rounded-t-lg">Additional Details</h3>
            <div>
              <Label>Duty Manager Name</Label>
              <Input
                value={formData.dutyManagerName || ''}
                onChange={(e) => handleInputChange('dutyManagerName', e.target.value)}
                placeholder="Enter duty manager name"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.personalDetailsVerified}
                onCheckedChange={(checked) =>
                  handleInputChange('personalDetailsVerified', checked as boolean)
                }
              />
              <Label>Personal Details Verified?</Label>
            </div>
          </div>
        </div>

        {/* Column 3: Offender Details, Incident Involved, and Stolen Items */}
        <div className="space-y-8">
          <div className="space-y-4 p-6 rounded-lg border border-black bg-background/50">
            <h3 className="font-semibold -mx-6 -mt-6 mb-4 p-4 border-b border-b-black bg-zinc-800/50 rounded-t-lg">Offender Details</h3>
            <div className="space-y-4">
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
              <div>
                <Label>Address</Label>
                <div className="space-y-2">
                  <Input
                    value={formData.offenderAddress?.numberAndStreet || ''}
                    onChange={(e) => handleAddressChange('numberAndStreet', e.target.value)}
                    placeholder="Number and Street"
                  />
                  <Input
                    value={formData.offenderAddress?.town || ''}
                    onChange={(e) => handleAddressChange('town', e.target.value)}
                    placeholder="Town"
                  />
                  <Input
                    value={formData.offenderAddress?.county || ''}
                    onChange={(e) => handleAddressChange('county', e.target.value)}
                    placeholder="County"
                  />
                  <Input
                    value={formData.offenderAddress?.postCode || ''}
                    onChange={(e) => handleAddressChange('postCode', e.target.value)}
                    placeholder="Post Code"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-6 rounded-lg border border-black bg-background/50">
            <h3 className="font-semibold -mx-6 -mt-6 mb-4 p-4 border-b border-b-black bg-zinc-800/50 rounded-t-lg">Incident Involved</h3>
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
          </div>
        </div>
      </div>

      {/* Stolen Items (Full Width) */}
      <div className="space-y-4 p-6 rounded-lg border border-black bg-background/50 mb-6">
        <div className="flex items-center justify-between -mx-6 -mt-6 mb-4 p-4 border-b border-b-black bg-zinc-800/50 rounded-t-lg">
          <h3 className="font-semibold">Stolen Items</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddStolenItem}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="rounded-md border border-black">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Cost</TableHead>
                <TableHead className="w-[100px]">Quantity</TableHead>
                <TableHead className="w-[100px]">Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
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
                      onChange={(e) => handleStolenItemChange(item.id, 'quantity', Number(e.target.value))}
                      min="1"
                    />
                  </TableCell>
                  <TableCell className="text-right">
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
                    No items added. Click "Add Item" to start.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Total Value and Actions (Full Width) */}
      <div className="flex items-center justify-between space-x-6 sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 rounded-lg border border-black shadow-lg">
        <div className="flex-1 bg-zinc-800/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <Label className="text-lg">Total Value Recovered</Label>
            <div className="text-2xl font-bold text-green-500">
              £{formData.totalValueRecovered?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            Save Incident
          </Button>
        </div>
      </div>
    </form>
  )
})

IncidentForm.displayName = 'IncidentForm'

export { IncidentForm }
