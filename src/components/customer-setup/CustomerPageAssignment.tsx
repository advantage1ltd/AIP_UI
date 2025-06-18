import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { 
  CUSTOMER_PAGES, 
  getPagesByCustomerType, 
  getPagesByCategory,
  CUSTOMER_PAGE_CATEGORIES 
} from '@/config/customerPages'
import type { CustomerType, CustomerPageAssignment, CustomerPage } from '@/types/customer'
import { 
  Calendar,
  BarChart3,
  AlertTriangle,
  MessageSquare,
  Shield,
  UserCheck,
  Footprints,
  Building,
  Key,
  Users,
  Info
} from 'lucide-react'

interface CustomerPageAssignmentProps {
  customerType: CustomerType
  currentAssignments: Record<string, CustomerPageAssignment>
  onAssignmentsChange: (assignments: Record<string, CustomerPageAssignment>) => void
}

const iconMap = {
  Calendar,
  BarChart3,
  AlertTriangle,
  MessageSquare,
  Shield,
  UserCheck,
  Footprints,
  Building,
  Key,
  Users
}

export function CustomerPageAssignment({
  customerType,
  currentAssignments,
  onAssignmentsChange
}: CustomerPageAssignmentProps) {
  const [assignments, setAssignments] = useState<Record<string, CustomerPageAssignment>>(currentAssignments || {})
  const [recommendedPages, setRecommendedPages] = useState<CustomerPage[]>([])
  const [allPages, setAllPages] = useState<CustomerPage[]>([])

  useEffect(() => {
    const recommended = getPagesByCustomerType(customerType)
    const all = Object.values(CUSTOMER_PAGES)
    
    setRecommendedPages(recommended)
    setAllPages(all)

    // Auto-assign recommended pages if no assignments exist
    if (Object.keys(assignments).length === 0) {
      const autoAssignments: Record<string, CustomerPageAssignment> = {}
      recommended.forEach(page => {
        autoAssignments[page.id] = {
          enabled: true,
          customized: false,
          lastModified: new Date().toISOString(),
          modifiedBy: 'system'
        }
      })
      setAssignments(autoAssignments)
      onAssignmentsChange(autoAssignments)
    }
  }, [customerType])

  const handlePageToggle = (pageId: string, enabled: boolean) => {
    const updatedAssignments = { ...assignments }
    if (enabled) {
      updatedAssignments[pageId] = {
        enabled: true,
        customized: true,
        lastModified: new Date().toISOString(),
        modifiedBy: 'admin'
      }
    } else {
      delete updatedAssignments[pageId]
    }
    
    setAssignments(updatedAssignments)
    onAssignmentsChange(updatedAssignments)
  }

  const isPageEnabled = (pageId: string) => {
    return assignments[pageId]?.enabled || false
  }

  const isPageRecommended = (pageId: string) => {
    return recommendedPages.some(p => p.id === pageId)
  }

  const applyRecommended = () => {
    const recommendedAssignments: Record<string, CustomerPageAssignment> = {}
    recommendedPages.forEach(page => {
      recommendedAssignments[page.id] = {
        enabled: true,
        customized: false,
        lastModified: new Date().toISOString(),
        modifiedBy: 'system'
      }
    })
    
    setAssignments(recommendedAssignments)
    onAssignmentsChange(recommendedAssignments)
  }

  const clearAll = () => {
    setAssignments({})
    onAssignmentsChange({})
  }

  const groupedPages = Object.entries(CUSTOMER_PAGE_CATEGORIES).map(([category, title]) => ({
    category: category as CustomerPage['category'],
    title,
    pages: getPagesByCategory(category as CustomerPage['category'])
  }))

  const getIcon = (iconName: string | undefined) => {
    if (!iconName || !iconMap[iconName as keyof typeof iconMap]) {
      return <Info className="h-4 w-4" />
    }
    const IconComponent = iconMap[iconName as keyof typeof iconMap]
    return <IconComponent className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Page Assignments</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={applyRecommended}>
              Apply Recommended
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Configure which pages are available for this customer based on their service type: {' '}
          <Badge variant="secondary">{customerType}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {groupedPages.map(({ category, title, pages }) => (
          <div key={category}>
            <h4 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">
              {title}
            </h4>
            <div className="grid gap-3">
              {pages.map(page => {
                const enabled = isPageEnabled(page.id)
                const recommended = isPageRecommended(page.id)
                
                return (
                  <div
                    key={page.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border ${
                      enabled ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Checkbox
                      id={page.id}
                      checked={enabled}
                      onCheckedChange={(checked) => 
                        handlePageToggle(page.id, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getIcon(page.icon)}
                        <label
                          htmlFor={page.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {page.title}
                        </label>
                        {recommended && (
                          <Badge variant="default" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                        {page.readOnly && (
                          <Badge variant="outline" className="text-xs">
                            Read Only
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {page.description}
                      </p>
                      {page.sourceOperationPath && (
                        <p className="text-xs text-blue-600 mt-1">
                          Data source: {page.sourceOperationPath}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            {category !== 'support' && <Separator className="mt-4" />}
          </div>
        ))}
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Assignment Summary
            </span>
          </div>
          <div className="text-xs text-yellow-700 space-y-1">
            <p>• Total pages enabled: {Object.keys(assignments).length}</p>
            <p>• Recommended for {customerType}: {recommendedPages.length} pages</p>
            <p>• Custom assignments: {Object.keys(assignments).filter(id => assignments[id].customized).length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 