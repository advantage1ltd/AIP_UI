import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Plus } from 'lucide-react';
import { PatrolLogDownload } from './components/PatrolLogDownload';
import { PatrolLogEditForm } from './components/PatrolLogEditForm';
import { EditFormData } from './components/PatrolLogTypes';

const initialFormData: EditFormData = {
  patrolId: '',
  patrolType: 'Internal',
  logDate: new Date().toISOString().slice(0, 16),
  building: '',
  location: '',
  issue: '',
  additionalInfo: '',
  maximoPorterTracNo: '',
  status: 'Open',
  trustByesTeamAssign: '',
  actionTaken: ''
};

export default function PatrolLogPage() {
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState<EditFormData>(initialFormData);
  const [selectedRowId, setSelectedRowId] = React.useState<string | null>(null);

  const handleFormChange = (field: keyof EditFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearScreen = () => {
    setFormData(initialFormData);
    setSelectedRowId(null);
  };

  const handleModifyRecord = () => {
    // TODO: Implement modify record logic
    console.log('Modifying record:', selectedRowId);
  };

  const handleSaveRecord = () => {
    // TODO: Implement save record logic
    console.log('Saving record:', formData);
    setIsEditing(false);
  };

  const handleDeleteRecord = () => {
    // TODO: Implement delete record logic
    console.log('Deleting record:', selectedRowId);
    setSelectedRowId(null);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patrol Log</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Patrol Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              No patrol logs found. Create a new entry to get started.
            </div>
          </CardContent>
        </Card>
      </div>

      {isEditing && (
        <PatrolLogEditForm
          formData={formData}
          onFormChange={handleFormChange}
          onClearScreen={handleClearScreen}
          onModifyRecord={handleModifyRecord}
          onSaveRecord={handleSaveRecord}
          onDeleteRecord={handleDeleteRecord}
          selectedRowId={selectedRowId}
        />
      )}
    </div>
  );
} 