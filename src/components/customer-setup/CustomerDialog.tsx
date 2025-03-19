import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { CompanyDetailsSection } from "./dialog-sections/CompanyDetailsSection"
import { AddressSection } from "./dialog-sections/AddressSection"
import { ContactSection } from "./dialog-sections/ContactSection"
import { X } from "lucide-react"

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: any
}

export function CustomerDialog({ open, onOpenChange, customer }: CustomerDialogProps) {
  const form = useForm({
    defaultValues: customer || {
      companyName: "",
      companyNumber: "",
      vatNumber: "",
      status: "active",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] lg:max-w-2xl p-3 sm:p-5 md:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-2 md:mb-4 flex items-center justify-between">
          <DialogTitle className="text-base md:text-xl font-semibold">
            {customer ? "Edit Customer" : "New Customer"}
          </DialogTitle>
          <Button
            variant="ghost"
            className="h-7 w-7 p-0 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-3 md:space-y-5">
            <CompanyDetailsSection form={form} />
            <AddressSection form={form} />
            <ContactSection form={form} />

            <div className="flex justify-end gap-2 md:gap-4 pt-2 md:pt-4">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                className="h-8 md:h-10 text-xs md:text-sm px-3 md:px-4"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700 h-8 md:h-10 text-xs md:text-sm px-3 md:px-4"
              >
                {customer ? "Update Customer" : "Create Customer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}