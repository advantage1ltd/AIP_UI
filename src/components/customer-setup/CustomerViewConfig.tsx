import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { CUSTOMER_PAGES } from "@/config/customerPages"
import type { CustomerPage, CustomerPageId, CustomerType, CustomerViewConfig as CustomerViewConfigType } from "@/types/customer"

interface CustomerViewConfigProps {
  customerId: string
  customerType?: CustomerType
  initialConfig?: CustomerViewConfigType
  onSave: (config: Partial<CustomerViewConfigType>) => void
}

export function CustomerViewConfig({ customerId, customerType = 'retail', initialConfig, onSave }: CustomerViewConfigProps) {
  const [enabledPages, setEnabledPages] = useState<CustomerPageId[]>(initialConfig?.enabledPages || [])

  useEffect(() => {
    if (initialConfig?.enabledPages) {
      setEnabledPages(initialConfig.enabledPages)
    }
  }, [initialConfig])

  const handleTogglePage = (pageId: CustomerPageId, page: CustomerPage) => {
    if (page.requiredForTypes.includes(customerType)) {
      return // Cannot toggle required pages
    }

    setEnabledPages(prev => {
      const isCurrentlyEnabled = prev.includes(pageId)
      if (isCurrentlyEnabled) {
        return prev.filter(id => id !== pageId)
      } else {
        return [...prev, pageId]
      }
    })
  }

  const handleSave = () => {
    onSave({
      customerId,
      customerType,
      enabledPages,
      updatedAt: new Date().toISOString()
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(CUSTOMER_PAGES).map(([id, page]) => (
          <Card key={id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">{page.title}</h4>
                <p className="text-xs text-muted-foreground">{page.description}</p>
                {page.readOnly && (
                  <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                    Read Only
                  </span>
                )}
                {page.requiredForTypes.includes(customerType) && (
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded ml-2">
                    Required
                  </span>
                )}
              </div>
              <Switch
                checked={enabledPages.includes(id as CustomerPageId)}
                onCheckedChange={() => handleTogglePage(id as CustomerPageId, page)}
                disabled={page.requiredForTypes.includes(customerType)}
                aria-label={`Toggle ${page.title}`}
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => setEnabledPages(initialConfig?.enabledPages || [])}>
          Reset
        </Button>
        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
          Save Configuration
        </Button>
      </div>
    </div>
  )
} 