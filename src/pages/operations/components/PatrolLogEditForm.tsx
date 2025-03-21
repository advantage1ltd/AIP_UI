import React from 'react';
import { Button } from "@/components/ui/button";
import { PatrolLogFormField } from './PatrolLogFormField';
import { EditFormData, ISSUE_TYPES, ACTION_TAKEN_OPTIONS } from './PatrolLogTypes';

interface PatrolLogEditFormProps {
  formData: EditFormData;
  onFormChange: (field: keyof EditFormData, value: string) => void;
  onClearScreen: () => void;
  onModifyRecord: () => void;
  onSaveRecord: () => void;
  onDeleteRecord: () => void;
  selectedRowId: string | null;
}

export const PatrolLogEditForm: React.FC<PatrolLogEditFormProps> = ({
  formData,
  onFormChange,
  onClearScreen,
  onModifyRecord,
  onSaveRecord,
  onDeleteRecord,
  selectedRowId
}) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PatrolLogFormField
          label="Patrol ID"
          type="text"
          value={formData.patrolId}
          onChange={(value) => onFormChange('patrolId', value)}
          disabled={true}
        />
        <PatrolLogFormField
          label="Patrol Type"
          type="select"
          value={formData.patrolType}
          onChange={(value) => onFormChange('patrolType', value)}
          options={['Internal', 'External']}
        />
        <PatrolLogFormField
          label="Log Date"
          type="datetime-local"
          value={formData.logDate}
          onChange={(value) => onFormChange('logDate', value)}
        />
        <PatrolLogFormField
          label="Building"
          type="select"
          value={formData.building}
          onChange={(value) => onFormChange('building', value)}
          options={['West Wing', 'Chox']}
        />
        <PatrolLogFormField
          label="Location"
          type="text"
          value={formData.location}
          onChange={(value) => onFormChange('location', value)}
          placeholder="e.g., 01-41-46D"
        />
        <PatrolLogFormField
          label="Issue"
          type="select"
          value={formData.issue}
          onChange={(value) => onFormChange('issue', value)}
          options={ISSUE_TYPES}
        />
        <PatrolLogFormField
          label="Additional Info"
          type="text"
          value={formData.additionalInfo}
          onChange={(value) => onFormChange('additionalInfo', value)}
        />
        <PatrolLogFormField
          label="Maximo/Porter Trac No"
          type="text"
          value={formData.maximoPorterTracNo}
          onChange={(value) => onFormChange('maximoPorterTracNo', value)}
        />
        <PatrolLogFormField
          label="Status"
          type="select"
          value={formData.status}
          onChange={(value) => onFormChange('status', value as 'Open' | 'Closed')}
          options={['Open', 'Closed']}
        />
        <PatrolLogFormField
          label="Trust Byes Team Assign"
          type="select"
          value={formData.trustByesTeamAssign}
          onChange={(value) => onFormChange('trustByesTeamAssign', value)}
          options={['HelpDesk', 'Trust']}
        />
        <PatrolLogFormField
          label="Action Taken"
          type="select"
          value={formData.actionTaken}
          onChange={(value) => onFormChange('actionTaken', value)}
          options={ACTION_TAKEN_OPTIONS}
        />
      </div>
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          className="text-gray-600"
          onClick={onClearScreen}
        >
          Clear Screen
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="text-gray-600"
            onClick={onModifyRecord}
            disabled={!selectedRowId}
          >
            Modify Selected Record
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onSaveRecord}
          >
            Save As New Record
          </Button>
          <Button 
            variant="outline" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onDeleteRecord}
            disabled={!selectedRowId}
          >
            Delete Selected Record
          </Button>
        </div>
      </div>
    </div>
  );
}; 