import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { DailyActivityTable } from "@/components/customer/DailyActivityTable"
import { DailyActivityDialog } from "@/components/customer/DailyActivityDialog"
import { DailyActivityForm } from "@/components/customer/DailyActivityForm"
import type { DailyActivityReport } from "@/types/dailyActivity"

export default function CustomerDailyActivityReport() {
  const navigate = useNavigate()
  const [selectedReport, setSelectedReport] = useState<DailyActivityReport | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingReport, setEditingReport] = useState<DailyActivityReport | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <DailyActivityTable
        onView={handleViewReport}
        onEdit={handleEditReport}
        onNew={handleNewReport}
        refreshTrigger={refreshTrigger}
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
      />
    </div>
  )
} 