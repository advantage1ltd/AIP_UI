/**
 * Customer daily activity report entry and table.
 * Flow: scoped customer/site filters → daily activity list → DailyActivityForm create/edit.
 */
import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { DailyActivityTable } from "@/components/customer/DailyActivityTable"
import { DailyActivityDialog } from "@/components/customer/DailyActivityDialog"
import { DailyActivityForm } from "@/components/customer/DailyActivityForm"
import type { DailyActivityReport } from "@/types/dailyActivity"
import { useAuth } from "@/contexts/AuthContext"
import { useCustomerSelection } from "@/contexts/CustomerSelectionContext"
import { findCustomerById } from "@/hooks/useAvailableCustomers"
import { siteService } from '@/services/siteService'
import { extractCustomerId } from '@/utils/customerId'
import { logger } from '@/utils/logger'

export default function CustomerDailyActivityReport() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const { isAdmin } = useCustomerSelection()
  const [selectedReport, setSelectedReport] = useState<DailyActivityReport | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingReport, setEditingReport] = useState<DailyActivityReport | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<{ id: number; name: string } | null>(null)
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)
  const [selectedSiteName, setSelectedSiteName] = useState<string | null>(null)

  const fetchSiteName = async (customerId: number, siteId: string) => {
    try {
      const response = await siteService.getSitesByCustomer(customerId);
      if (response.success) {
        const site = response.data.find((s) => String(s.siteID) === siteId);
        if (site) {
          setSelectedSiteName(site.locationName);
        }
      }
    } catch (error) {
      logger.error('Failed to fetch site name:', error);
    }
  }

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        // Wait for auth to finish loading
        if (authLoading) {
          return;
        }

        // Get customer ID from URL parameter or user's customerId (for customer users)
        const urlCustomerId = searchParams.get('customerId')
        const urlSiteId = searchParams.get('siteId')
        const userCustomerId = extractCustomerId(user)
        const targetCustomerId = urlCustomerId ? parseInt(urlCustomerId) : (userCustomerId || undefined)

        // Set selected site if provided in URL
        if (urlSiteId && targetCustomerId) {
          setSelectedSiteId(urlSiteId)
          // Fetch site name for display
          fetchSiteName(targetCustomerId, urlSiteId)
        }

        if (!targetCustomerId) {
          if (isAdmin) {
            setError("Please select a customer from the sidebar to view this page. Open the Customer section and select a customer from the dropdown.")
          } else {
            setError("No customer ID found")
          }
          return
        }

        const customerData = await findCustomerById(targetCustomerId)
        
        if (!customerData) {
          setError("Customer not found")
          return
        }
        
        setCustomer(customerData)
      } catch (error) {
        logger.error('CustomerDailyActivityReport: Error loading customer:', error)
        setError('Failed to load customer data')
      } finally {
        setLoading(false)
      }
    }

    loadCustomer()
  }, [user, authLoading, searchParams])

  const handleViewReport = (report: DailyActivityReport) => {
    setSelectedReport(report)
    setShowDialog(true)
  }

  const handleEditReport = (report: DailyActivityReport) => {
    setEditingReport(report)
    setShowForm(true)
  }

  const handleNewReport = () => {
    setEditingReport(null)
    setShowForm(true)
  }

  const handleDialogClose = () => {
    setShowDialog(false)
    setSelectedReport(null)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingReport(null)
  }

  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    handleFormClose()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EFF4FF]">
        <div className="container mx-auto max-w-screen-2xl px-4 py-8 lg:px-8">
          <div className="flex min-h-[50vh] items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#EFF4FF]">
        <div className="container mx-auto max-w-screen-2xl p-4 lg:px-8 lg:py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className={`rounded-xl border p-4 shadow-sm ${
          isAdmin 
            ? 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800' 
            : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
        }`}>
            <p className={isAdmin ? 'text-amber-800 dark:text-amber-200' : 'text-red-600 dark:text-red-400'}>
              {error}
            </p>
            {isAdmin && (
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                As an administrator, you need to select a customer first before accessing customer-specific pages.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EFF4FF]">
      <div className="container mx-auto max-w-screen-2xl p-4 lg:px-8 lg:py-8 space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="h-9 px-3"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
                  Customer Page
                </Badge>
              </div>
              {customer && (
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {customer.name} - Daily Activity Reports
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Manage and review daily activity submissions and compliance records.
                  </p>
                </div>
              )}
            </div>
            {selectedSiteName && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">Site Filter</p>
                <p className="text-sm font-medium text-slate-700">{selectedSiteName}</p>
              </div>
            )}
          </div>
        </div>

        <DailyActivityTable
          onView={handleViewReport}
          onEdit={handleEditReport}
          onNew={handleNewReport}
          refreshTrigger={refreshTrigger}
          customerId={customer?.id.toString()}
          siteId={selectedSiteId}
        />

        <DailyActivityDialog
          open={showDialog}
          onOpenChange={handleDialogClose}
          report={selectedReport}
        />

        <DailyActivityForm
          open={showForm}
          onOpenChange={handleFormClose}
          report={editingReport}
          onSuccess={handleFormSuccess}
          customerId={customer?.id.toString()}
          siteId={selectedSiteId}
        />
      </div>
    </div>
  )
}