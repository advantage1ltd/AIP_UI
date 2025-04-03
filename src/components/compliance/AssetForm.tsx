import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Asset types
type AssetType = 'Laptop' | 'Phone' | 'Tablet' | 'Desktop' | 'Monitor' | 'Printer' | 'Other'
type AssetStatus = 'In Use' | 'In Stock' | 'In Repair' | 'Disposed'

interface AssetFormValues {
  assetTag: string
  assetType: AssetType
  make: string
  model: string
  serialNumber: string
  purchaseDate: Date
  assignedTo?: string
  location: string
  status: AssetStatus
  notes?: string
}

interface AssetFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AssetFormValues) => void
  initialData?: AssetFormValues
}

export const AssetForm: React.FC<AssetFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData
}) => {
  const [formData, setFormData] = useState<AssetFormValues>({
    assetTag: '',
    assetType: 'Laptop',
    make: '',
    model: '',
    serialNumber: '',
    purchaseDate: new Date(),
    assignedTo: '',
    location: '',
    status: 'In Stock',
    notes: '',
  })

  const [date, setDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
      })
      setDate(initialData.purchaseDate)
    } else {
      // Reset form for new asset
      setFormData({
        assetTag: '',
        assetType: 'Laptop',
        make: '',
        model: '',
        serialNumber: '',
        purchaseDate: new Date(),
        assignedTo: '',
        location: '',
        status: 'In Stock',
        notes: '',
      })
      setDate(new Date())
    }
  }, [initialData, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setDate(date)
      setFormData(prev => ({
        ...prev,
        purchaseDate: date
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
          <DialogTitle>{initialData ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update asset details in the system' : 'Enter asset details to add to the register'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="assetTag">Asset Tag *</Label>
              <Input
                id="assetTag"
                name="assetTag"
                value={formData.assetTag}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="assetType">Asset Type *</Label>
              <Select
                value={formData.assetType}
                onValueChange={(value) => handleSelectChange('assetType', value as AssetType)}
              >
                <SelectTrigger id="assetType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laptop">Laptop</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                  <SelectItem value="Desktop">Desktop</SelectItem>
                  <SelectItem value="Monitor">Monitor</SelectItem>
                  <SelectItem value="Printer">Printer</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                name="make"
                value={formData.make}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="serialNumber">Serial Number *</Label>
            <Input
              id="serialNumber"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Purchase Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value as AssetStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Use">In Use</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="In Repair">In Repair</SelectItem>
                  <SelectItem value="Disposed">Disposed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="h-20 min-h-[80px]"
            />
          </div>
        </form>

        <DialogFooter className="sticky bottom-0 bg-white pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {initialData ? 'Update Asset' : 'Add Asset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 