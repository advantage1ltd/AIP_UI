import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomerViewConfig } from "@/components/customer-setup/CustomerViewConfig"
import type { Customer } from "@/types/customer"
import { DUMMY_CUSTOMERS } from "@/data/customers"

export default function CustomerViewsConfig() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(DUMMY_CUSTOMERS[0]?.id || '')
  const selectedCustomer = DUMMY_CUSTOMERS.find(c => c.id === selectedCustomerId)

  const handleSaveConfig = (config: any) => {
    // In a real app, this would be an API call
    console.log('Saving configuration:', config)
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Configure Customer Views</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Customer</label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {DUMMY_CUSTOMERS.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCustomer && (
            <CustomerViewConfig
              customerId={selectedCustomer.id}
              initialConfig={selectedCustomer.viewConfig}
              onSave={handleSaveConfig}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
} 