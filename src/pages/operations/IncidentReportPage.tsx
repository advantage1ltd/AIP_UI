import { useState, useCallback } from "react"
import { Incident } from "@/types/incidents"
import { IncidentForm } from "@/components/operations/IncidentForm"
import { IncidentsTable } from "@/components/operations/IncidentsTable"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { mockIncidents } from "@/data/mockIncidents"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, PoundSterling, Store, AlertCircle } from "lucide-react"

export default function IncidentReportPage() {
  const [open, setOpen] = useState(false)
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents)
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null)
  const [deletingIncident, setDeletingIncident] = useState<Incident | null>(null)

  // Calculate statistics
  const stats = {
    totalAmountSaved: incidents.reduce((total, incident) => 
      total + (incident.totalValueRecovered || 0), 0
    ),
    uniqueStores: new Set(incidents.map(incident => incident.siteName)).size,
    totalIncidents: incidents.length
  }

  const handleSubmit = useCallback((incident: Incident) => {
    if (editingIncident) {
      // Update existing incident
      setIncidents(prev =>
        prev.map(i => (i.id === editingIncident.id ? { ...incident, id: i.id } : i))
      )
      toast.success('Incident report updated successfully')
    } else {
      // Create new incident
      const newIncident = {
        ...incident,
        id: (incidents.length + 1).toString(),
        dateInputted: new Date().toISOString(),
        userThatInput: "admin" // This would come from auth context
      }
      setIncidents(prev => [newIncident, ...prev])
      toast.success('Incident report created successfully')
    }
    setOpen(false)
    setEditingIncident(null)
  }, [editingIncident, incidents])

  const handleEdit = useCallback((incident: Incident) => {
    setEditingIncident(incident)
    setOpen(true)
  }, [])

  const handleDelete = useCallback((incident: Incident) => {
    setDeletingIncident(incident)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (deletingIncident) {
      setIncidents(prev => prev.filter(i => i.id !== deletingIncident.id))
      toast.success('Incident deleted successfully')
      setDeletingIncident(null)
    }
  }, [deletingIncident])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto p-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-500">
                Incident Report 
              </h1>
              <p className="text-muted-foreground mt-2">
                Track and manage security incidents across all stores
              </p>
            </div>
            <Button
              onClick={() => setOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg"
            >
              Report New Incident
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 lg:gap-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount Saved</CardTitle>
                <PoundSterling className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">£{stats.totalAmountSaved.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Stores</CardTitle>
                <Store className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">{stats.uniqueStores}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
                <AlertCircle className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-500">{stats.totalIncidents}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table Section */}
        <div className="mt-8 rounded-xl bg-gradient-to-br from-zinc-800/10 to-zinc-900/10 p-6 backdrop-blur-sm border border-zinc-800/20">
          <IncidentsTable
            incidents={incidents}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Dialogs */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-[70vw] w-full max-h-[90vh] p-6 bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border-zinc-800/20">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-2xl">
                {editingIncident ? 'Edit Incident Report' : 'New Incident Report'}
              </DialogTitle>
              <DialogDescription>
                Fill in the details of the security incident below
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto pr-6 max-h-[calc(90vh-10rem)]">
              <IncidentForm
                initialData={editingIncident}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setOpen(false)
                  setEditingIncident(null)
                }}
              />
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deletingIncident} onOpenChange={(open) => !open && setDeletingIncident(null)}>
          <AlertDialogContent className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border-zinc-800/20">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Incident Report</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this incident report? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-zinc-800 hover:bg-zinc-700">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}