import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { UK_COUNTIES } from "@/lib/constants"
import { DUMMY_CUSTOMERS } from "@/data/customers"
import { DUMMY_REGIONS } from "@/data/mockRegions"
import { useState, useEffect } from "react"

interface SiteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  site?: any
  selectedCustomerId: string | null
}

export function SiteDialog({ open, onOpenChange, site, selectedCustomerId }: SiteDialogProps) {
  const [availableRegions, setAvailableRegions] = useState(DUMMY_REGIONS)
  
  useEffect(() => {
    if (selectedCustomerId) {
      setAvailableRegions(DUMMY_REGIONS.filter(region => region.customerId === selectedCustomerId))
    } else {
      setAvailableRegions(DUMMY_REGIONS)
    }
  }, [selectedCustomerId])

  const form = useForm({
    defaultValues: site || {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] xl:max-w-[800px] p-4 sm:p-6 xl:p-8 max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl xl:text-2xl 2xl:text-3xl">
            {site ? "Edit Site" : "New Site"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => {
            console.log(data)
            onOpenChange(false)
          })} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!selectedCustomerId && (
                <FormField
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    </FormItem>
                  )}
                />
              )}

              <FormField
                name="regionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  </FormItem>
                )}
              />

              <FormField
                name="locationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="buildingName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="town"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Town</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>County</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  </FormItem>
                )}
              />

              <FormField
                name="postcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="sinNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SIN Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telephone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="isCoreSite"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Core Site</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {site ? "Update Site" : "Create Site"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
