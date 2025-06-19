import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { UK_COUNTIES } from "@/lib/constants"
import { DUMMY_CUSTOMERS } from "@/data/customers"
import { DUMMY_REGIONS } from "@/data/mockRegions"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { sitesService } from "@/services/sitesService"
import { regionsService } from "@/services/regionsService"

// UK postcode validation regex
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i

// Validation schema
const siteFormSchema = z.object({
  locationName: z.string().min(1, "Location name is required").min(2, "Location name must be at least 2 characters"),
  customerId: z.string().min(1, "Customer is required"),
  regionId: z.string().min(1, "Region is required"),
  buildingName: z.string().min(1, "Building name is required"),
  street: z.string().min(1, "Street is required"),
  town: z.string().min(1, "Town is required"),
  county: z.string().min(1, "County is required"),
  postcode: z.string().min(1, "Postcode is required").regex(UK_POSTCODE_REGEX, "Please enter a valid UK postcode"),
  isCoreSite: z.boolean().default(false),
  sinNumber: z.string().min(1, "SIN number is required"),
  telephone: z.string().min(1, "Telephone is required").min(10, "Please enter a valid telephone number")
})

type SiteFormData = z.infer<typeof siteFormSchema>

interface SiteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  site?: any
  selectedCustomerId: string | null
  onSuccess?: () => void
}

export function SiteDialog({ open, onOpenChange, site, selectedCustomerId, onSuccess }: SiteDialogProps) {
  const [availableRegions, setAvailableRegions] = useState(DUMMY_REGIONS)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Load regions from service
  const loadRegions = async () => {
    try {
      const result = await regionsService.getRegions()
      if (result.success) {
        const filteredRegions = selectedCustomerId
          ? result.data.filter(region => region.customerId === selectedCustomerId)
          : result.data
        setAvailableRegions(filteredRegions)
      }
    } catch (error) {
      // Fallback to static data if service fails
      const filteredRegions = selectedCustomerId
        ? DUMMY_REGIONS.filter(region => region.customerId === selectedCustomerId)
        : DUMMY_REGIONS
      setAvailableRegions(filteredRegions)
    }
  }
  
  const form = useForm<SiteFormData>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      locationName: "",
      customerId: selectedCustomerId || "",
      regionId: "",
      buildingName: "",
      street: "",
      town: "",
      county: "",
      postcode: "",
      isCoreSite: false,
      sinNumber: "",
      telephone: ""
    }
  })

  // Load regions when dialog opens or customer changes
  useEffect(() => {
    if (open) {
      loadRegions()
    }
  }, [open, selectedCustomerId])

  // Reset form when dialog opens/closes or site changes
  useEffect(() => {
    if (open) {
      if (site) {
        form.reset({
          locationName: site.locationName || "",
          customerId: site.customerId || selectedCustomerId || "",
          regionId: site.regionId || "",
          buildingName: site.buildingName || "",
          street: site.street || "",
          town: site.town || "",
          county: site.county || "",
          postcode: site.postcode || "",
          isCoreSite: site.isCoreSite || false,
          sinNumber: site.sinNumber || "",
          telephone: site.telephone || ""
        })
      } else {
        form.reset({
          locationName: "",
          customerId: selectedCustomerId || "",
          regionId: "",
          buildingName: "",
          street: "",
          town: "",
          county: "",
          postcode: "",
          isCoreSite: false,
          sinNumber: "",
          telephone: ""
        })
      }
    }
  }, [open, site, selectedCustomerId, form])

  const handleSubmit = async (data: SiteFormData) => {
    setIsLoading(true)
    
    try {
      let result
      
      if (site) {
        // Update existing site
        result = await sitesService.updateSite(site.id, {
          ...data,
          status: 'active'
        } as any)
      } else {
        // Create new site
        result = await sitesService.createSite({
          ...data,
          status: 'active'
        } as any)
      }

      if (result.success) {
        toast({
          title: "Success",
          description: site ? "Site updated successfully" : "Site created successfully",
        })
        
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save site",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] xl:max-w-[800px] p-4 sm:p-6 xl:p-8 max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl xl:text-2xl 2xl:text-3xl">
            {site ? "Edit Site" : "New Site"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!selectedCustomerId && (
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DUMMY_CUSTOMERS.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.companyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="regionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRegions.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
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
                name="locationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} placeholder="Enter location name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buildingName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} placeholder="Enter building name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} placeholder="Enter street address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="town"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Town</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} placeholder="Enter town" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>County</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select county" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UK_COUNTIES.map((county) => (
                          <SelectItem key={county} value={county}>
                            {county}
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
                name="postcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} placeholder="Enter postcode" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sinNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SIN Number</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} placeholder="Enter SIN number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telephone</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} placeholder="Enter telephone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isCoreSite"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Core Site</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : (site ? "Update Site" : "Create Site")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
