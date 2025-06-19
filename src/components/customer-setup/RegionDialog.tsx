import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { DUMMY_CUSTOMERS } from "@/data/customers"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { regionsService } from "@/services/regionsService"

// Validation schema
const regionFormSchema = z.object({
  name: z.string().min(1, "Region name is required").min(2, "Region name must be at least 2 characters"),
  customerId: z.string().min(1, "Customer is required"),
  manager: z.string().min(1, "Region manager is required").min(2, "Manager name must be at least 2 characters"),
  status: z.enum(["active", "inactive"], {
    required_error: "Status is required"
  })
})

type RegionFormData = z.infer<typeof regionFormSchema>

interface RegionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  region?: {
    id: string
    name: string
    customerId: string
    manager: string
    status: 'active' | 'inactive'
  }
  selectedCustomerId: string | null
  onSuccess?: () => void
}

export function RegionDialog({ open, onOpenChange, region, selectedCustomerId, onSuccess }: RegionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const form = useForm<RegionFormData>({
    resolver: zodResolver(regionFormSchema),
    defaultValues: {
      name: "",
      customerId: selectedCustomerId || "",
      manager: "",
      status: "active"
    }
  })

  // Reset form when dialog opens/closes or region changes
  useEffect(() => {
    if (open) {
      if (region) {
        form.reset({
          name: region.name,
          customerId: region.customerId,
          manager: region.manager,
          status: region.status
        })
      } else {
        form.reset({
          name: "",
          customerId: selectedCustomerId || "",
          manager: "",
          status: "active"
        })
      }
    }
  }, [open, region, selectedCustomerId, form])

  const handleSubmit = async (data: RegionFormData) => {
    setIsLoading(true)
    
    try {
      let result
      
      if (region) {
        // Update existing region
        result = await regionsService.updateRegion(region.id, data as any)
      } else {
        // Create new region
        result = await regionsService.createRegion(data as any)
      }

      if (result.success) {
        toast({
          title: "Success",
          description: region ? "Region updated successfully" : "Region created successfully",
        })
        
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save region",
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {region ? "Edit Region" : "New Region"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!!selectedCustomerId || isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DUMMY_CUSTOMERS
                        .filter(customer => !selectedCustomerId || customer.id === selectedCustomerId)
                        .map((customer) => (
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
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} placeholder="Enter region name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manager"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region Manager</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} placeholder="Enter manager name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : (region ? "Update Region" : "Create Region")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

