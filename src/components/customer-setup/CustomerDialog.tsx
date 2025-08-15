import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Customer, CustomerType, CustomerPageAssignment } from "@/types/customer"
import { AddressSection } from "./dialog-sections/AddressSection"
import { ContactSection } from "./dialog-sections/ContactSection"
import { CompanyDetailsSection } from "./dialog-sections/CompanyDetailsSection"
import { CustomerPageAssignment as PageAssignmentComponent } from "./CustomerPageAssignment"
import { customerOperations } from "@/mocks/customerStore"

const customerTypes: { value: CustomerType; label: string }[] = [
  { value: "retail", label: "Retail" },
  { value: "static", label: "Static" },
  { value: "gatehouse", label: "Gatehouse" },
  { value: "mobile-patrol", label: "Mobile Patrol" },
  { value: "keyholding-alarm-response", label: "Keyholding & Alarm Response" },
  { value: "event", label: "Event" }
]

// Form validation schema
const customerSchema = z.object({
  companyName: z.string().min(1, "Company name is required").min(2, "Company name must be at least 2 characters"),
  companyNumber: z.string().min(1, "Company number is required"),
  vatNumber: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  customerType: z.enum(["retail", "static", "gatehouse", "mobile-patrol", "keyholding-alarm-response", "event"]),
  address: z.object({
    building: z.string().optional(),
    street: z.string().min(1, "Street is required"),
    village: z.string().optional(),
    town: z.string().min(1, "Town/City is required"),
    county: z.string().min(1, "County is required"),
    postcode: z.string().min(1, "Postcode is required").regex(/^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i, "Invalid UK postcode format")
  }),
  contact: z.object({
    title: z.string().min(1, "Title is required"),
    forename: z.string().min(1, "Forename is required"),
    surname: z.string().min(1, "Surname is required"),
    position: z.string().min(1, "Position is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required").min(10, "Phone number must be at least 10 digits")
  })
})

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer
  onSave: (customer: Customer) => void
}

export function CustomerDialog({ open, onOpenChange, customer, onSave }: CustomerDialogProps) {
  const { toast } = useToast()
  const [pageAssignments, setPageAssignments] = useState<Record<string, CustomerPageAssignment>>(
    customer?.pageAssignments || {}
  )

  // Update pageAssignments when customer prop changes
  useEffect(() => {
    const loadPageAssignments = async () => {
      if (customer?.id) {
        try {
          console.log('🔧 [CustomerDialog] Loading page assignments from customer store for customer:', customer.id)
          
          // Load customer data from customer store (which uses cached data)
          const customerData = await customerOperations.getById(customer.id)
          
          if (customerData?.pageAssignments) {
            setPageAssignments(customerData.pageAssignments)
            console.log('🔧 [CustomerDialog] Loaded page assignments from store:', customerData.pageAssignments)
          } else {
            setPageAssignments({})
            console.log('🔧 [CustomerDialog] No page assignments found in store')
          }
        } catch (error) {
          console.error('❌ [CustomerDialog] Error loading page assignments from store:', error)
          setPageAssignments({})
        }
      } else {
        setPageAssignments({})
      }
    }

    loadPageAssignments()
  }, [customer])
  
  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      companyName: "",
      companyNumber: "",
      vatNumber: "",
      status: "active",
      customerType: "retail",
      address: {
        building: "",
        street: "",
        village: "",
        town: "",
        county: "",
        postcode: ""
      },
      contact: {
        title: "",
        forename: "",
        surname: "",
        position: "",
        email: "",
        phone: ""
      }
    }
  })

  // Reset form when customer data changes
  useEffect(() => {
    if (customer) {
      console.log('Loading customer data into form:', customer)
      form.reset({
        companyName: customer.companyName || "",
        companyNumber: customer.companyNumber || "",
        vatNumber: customer.vatNumber || "",
        status: customer.status || "active",
        customerType: customer.customerType || "retail",
        address: {
          building: customer.address?.building || "",
          street: customer.address?.street || "",
          village: customer.address?.village || "",
          town: customer.address?.town || "",
          county: customer.address?.county || "",
          postcode: customer.address?.postcode || ""
        },
        contact: {
          title: customer.contact?.title || "",
          forename: customer.contact?.forename || "",
          surname: customer.contact?.surname || "",
          position: customer.contact?.position || "",
          email: customer.contact?.email || "",
          phone: customer.contact?.phone || ""
        }
      })
    } else {
      // Reset to empty form for new customer
      form.reset({
        companyName: "",
        companyNumber: "",
        vatNumber: "",
        status: "active",
        customerType: "retail",
        address: {
          building: "",
          street: "",
          village: "",
          town: "",
          county: "",
          postcode: ""
        },
        contact: {
          title: "",
          forename: "",
          surname: "",
          position: "",
          email: "",
          phone: ""
        }
      })
    }
  }, [customer, form])

  const watchedCustomerType = form.watch("customerType") as CustomerType

  const onSubmit = async (data: z.infer<typeof customerSchema>) => {
    try {
      console.log('🔧 [CustomerDialog] onSubmit - pageAssignments before processing:', pageAssignments)
      
      const enabledPages = Object.keys(pageAssignments).filter(pageId => pageAssignments[pageId].enabled)
      console.log('🔧 [CustomerDialog] onSubmit - enabledPages calculated:', enabledPages)
      
      // Ensure we don't generate new IDs for existing customers
      const isExistingCustomer = customer && customer.id && !String(customer.id).startsWith('CUST')
      const customerId = isExistingCustomer ? customer.id : (customer?.id || `CUST${Date.now()}`)
      
      console.log('🔧 [CustomerDialog] onSubmit - customer ID logic:', {
        isExistingCustomer,
        originalId: customer?.id,
        finalId: customerId
      })
      
      const customerData = {
        ...data,
        pageAssignments,
        id: customerId,
        createdAt: customer?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewConfig: {
          id: customer?.viewConfig?.id || `VC${Date.now()}`,
          customerId: customerId,
          customerType: data.customerType,
          enabledPages,
          createdAt: customer?.viewConfig?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
      
      console.log('🔧 [CustomerDialog] onSubmit - final customerData:', {
        id: customerData.id,
        companyName: customerData.companyName,
        pageAssignmentsCount: Object.keys(customerData.pageAssignments).length,
        enabledPagesCount: customerData.viewConfig.enabledPages.length,
        pageAssignments: customerData.pageAssignments,
        enabledPages: customerData.viewConfig.enabledPages
      })
      
      // Save customer data first
      onSave(customerData as Customer)
      
      // Dispatch event to notify PageAccessContext about page assignment changes
      if (customer?.id && Object.keys(pageAssignments).length > 0) {
        window.dispatchEvent(new CustomEvent('customer-page-assignments-updated', {
          detail: { 
            customerId: customer.id,
            customerName: customerData.companyName,
            pageAssignments: customerData.pageAssignments,
            enabledPages: customerData.viewConfig.enabledPages
          }
        }));
        console.log('✅ [CustomerDialog] Dispatched customer-page-assignments-updated event')
      }
      
      // Note: Success/error notifications are handled in the parent component
      // Only close dialog on successful validation
      
    } catch (error) {
      console.error('❌ [CustomerDialog] onSubmit - error:', error)
      toast({
        title: "Validation Error",
        description: "Please check all required fields and try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[800px] xl:max-w-[1000px] p-4 sm:p-6 xl:p-8 max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl xl:text-2xl">
            {customer ? "Edit Customer" : "New Customer"}
          </DialogTitle>
          <DialogDescription>
            {customer ? "Update customer information and page assignments" : "Create a new customer with page assignments"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Customer Details</TabsTrigger>
                <TabsTrigger value="pages">Page Assignments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6 mt-6">
                <CompanyDetailsSection form={form} />
                <AddressSection form={form} />
                <ContactSection form={form} />
              </TabsContent>
              
              <TabsContent value="pages" className="mt-6">
                <PageAssignmentComponent
                  customerType={watchedCustomerType}
                  currentAssignments={pageAssignments}
                  onAssignmentsChange={setPageAssignments}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {customer ? "Update Customer" : "Create Customer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}