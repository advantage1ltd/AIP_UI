import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { CUSTOMER_PAGES } from "@/config/customerPages"
import type { CustomerPage, CustomerPageId, CustomerType, CustomerViewConfig as CustomerViewConfigType } from "@/types/customer"

interface CustomerViewConfigProps {
  customerId: number
  customerType?: CustomerType
  initialConfig?: CustomerViewConfigType
  onSave: (config: Partial<CustomerViewConfigType>) => void | Promise<void>
  isLoading?: boolean
}

export function CustomerViewConfig({ customerId, customerType = 'retail', initialConfig, onSave, isLoading = false }: CustomerViewConfigProps) {
  const { user } = useAuth()
  const [enabledPages, setEnabledPages] = useState<string[]>(initialConfig?.enabledPages || [])



  useEffect(() => {
    if (initialConfig?.enabledPages) {
      setEnabledPages(initialConfig.enabledPages)
    }
  }, [initialConfig])

  const handleTogglePage = (pageId: string, page: CustomerPage) => {
    // Only administrators can modify page configurations
    if (user?.role !== 'Administrator') {
      return
    }

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

  const handleSave = async () => {
    await onSave({
      customerId,
      customerType,
      enabledPages,
      updatedAt: new Date().toISOString()
    })
  }

  // Check if user is administrator
  const isAdmin = user?.role === 'Administrator'

  // Don't render until user is loaded
  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      {!isAdmin && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Only administrators can modify customer page configurations. Contact your administrator to make changes.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(CUSTOMER_PAGES).map(([id, page]) => {
          const isRequired = page.requiredForTypes.includes(customerType)
          const isSwitchDisabled = !isAdmin || isRequired
          
          return (
            <Card key={id} className={`p-4 ${!isAdmin ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">{page.title}</h4>
                  <p className="text-xs text-muted-foreground">{page.description}</p>
                  {page.readOnly && (
                    <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                      Read Only
                    </span>
                  )}
                  {isRequired && (
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded ml-2">
                      Required
                    </span>
                  )}
                </div>
                <Switch
                  checked={enabledPages.includes(id)}
                  onCheckedChange={() => handleTogglePage(id, page)}
                  disabled={isSwitchDisabled}
                  aria-label={`Toggle ${page.title}`}
                />
              </div>
            </Card>
          )
        })}
      </div>

      {isAdmin && (
        <div className="flex justify-end gap-4">
          <Button 
            variant="outline" 
            onClick={() => setEnabledPages(initialConfig?.enabledPages || [])}
            disabled={isLoading}
          >
            Reset
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      )}
    </div>
  )
} 