import { useState } from 'react';
import { STAKEHOLDER_EMAILS } from '../components/PatrolLogTypes';
import type { PatrolLog } from '../components/PatrolLogTypes';

export interface DialogState {
  showDeleteDialog: boolean;
  showArchivedDialog: boolean;
  showEditForm: boolean;
}

export const useDialogs = () => {
  const [dialogState, setDialogState] = useState<DialogState>({
    showDeleteDialog: false,
    showArchivedDialog: false,
    showEditForm: false
  });
  
  // Toggle any dialog by name
  const toggleDialog = (dialogName: keyof DialogState, state?: boolean) => {
    setDialogState(prev => ({
      ...prev,
      [dialogName]: state !== undefined ? state : !prev[dialogName]
    }));
  };

  // Helper methods for specific dialogs
  const openDeleteDialog = () => toggleDialog('showDeleteDialog', true);
  const closeDeleteDialog = () => toggleDialog('showDeleteDialog', false);
  
  const openArchivedDialog = () => toggleDialog('showArchivedDialog', true);
  const closeArchivedDialog = () => toggleDialog('showArchivedDialog', false);
  
  const toggleEditForm = () => toggleDialog('showEditForm');
  
  // Email functionality
  const handleEmailParty = (log: PatrolLog | null) => {
    if (!log) return;
    
    const stakeholder = Object.entries(STAKEHOLDER_EMAILS).find(([key]) => 
      log.actionTaken.includes(key)
    );

    if (!stakeholder) {
      alert('No email address found for the selected action taken');
      return;
    }

    const [name, email] = stakeholder;
    const subject = `Patrol Log - ${log.issueDescription} at ${log.location}`;
    const body = `
      Date: ${log.logDate}
      Building: ${log.building}
      Location: ${log.location}
      Issue: ${log.issueDescription}
      Additional Info: ${log.additionalInfo}
      Status: ${log.status}
      Trust Byes Team Assign: ${log.trustByesTeamAssign}
      Action Taken: ${log.actionTaken}
      
      Please review and take necessary action.
    `;

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handlePatrolSystem = () => {
    window.open('https://followmystaff.com/patrolWeb/login', '_blank');
  };

  return {
    dialogState,
    toggleDialog,
    openDeleteDialog,
    closeDeleteDialog,
    openArchivedDialog,
    closeArchivedDialog,
    toggleEditForm,
    handleEmailParty,
    handlePatrolSystem
  };
}; 