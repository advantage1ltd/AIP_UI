import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"
import type { Customer, CustomerType, CustomerPageAssignment } from "@/types/customer"
import { AddressSection } from "./dialog-sections/AddressSection"
import { ContactSection } from "./dialog-sections/ContactSection"
import { CompanyDetailsSection } from "./dialog-sections/CompanyDetailsSection"
import { CustomerPageAssignment as PageAssignmentComponent } from "./CustomerPageAssignment"

const customerTypes: { value: CustomerType; label: string }[] = [
  { value: "retail", label: "Retail" },
  { value: "static", label: "Static" },
  { value: "gatehouse", label: "Gatehouse" },
  { value: "mobile-patrol", label: "Mobile Patrol" },
  { value: "keyholding-alarm-response", label: "Keyholding & Alarm Response" },
  { value: "event", label: "Event" }
]

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer
  onSave: (customer: Customer) => void
}

export function CustomerDialog({ open, onOpenChange, customer, onSave }: CustomerDialogProps) {
  const [pageAssignments, setPageAssignments] = useState<Record<string, CustomerPageAssignment>>(
    customer?.pageAssignments || {}
  )
  
  const form = useForm({
    defaultValues: customer || {
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

  const watchedCustomerType = form.watch("customerType") as CustomerType

  const onSubmit = (data: any) => {
    const customerData = {
      ...data,
      pageAssignments,
      id: customer?.id || `CUST${Date.now()}`,
      createdAt: customer?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewConfig: customer?.viewConfig || {
        id: `VC${Date.now()}`,
        customerId: customer?.id || `CUST${Date.now()}`,
        customerType: data.customerType,
        enabledPages: Object.keys(pageAssignments).filter(pageId => pageAssignments[pageId].enabled),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
    
    onSave(customerData)
    onOpenChange(false)
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