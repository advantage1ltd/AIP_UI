import { useState, useMemo } from 'react';
import { PatrolLog, EditFormData, INITIAL_EDIT_FORM_DATA } from '../components/PatrolLogTypes';

// Initial sample data
const INITIAL_LOGS: PatrolLog[] = [
  {
    id: "1",
    patrolType: "Internal",
    logDate: "07/02/2023 14:37:00",
    building: "Chox",
    location: "01-43-03",
    issueDescription: "Empty Cage",
    additionalInfo: "7",
    maximoPorterTracNo: "",
    status: "Open",
    trustByesTeamAssign: "helpdesk",
    actionTaken: "Byes Helpdesk"
  },
  {
    id: "2",
    patrolType: "Internal",
    logDate: "07/02/2023 12:51:00",
    building: "Chox",
    location: "02-53-04",
    issueDescription: "Empty Cage",
    additionalInfo: "2",
    maximoPorterTracNo: "",
    status: "Open",
    trustByesTeamAssign: "helpdesk",
    actionTaken: "Byes Helpdesk"
  },
  {
    id: "3",
    patrolType: "Internal",
    logDate: "07/02/2023 12:51:00",
    building: "Chox",
    location: "02-53-04",
    issueDescription: "Porters Chair",
    additionalInfo: "2",
    maximoPorterTracNo: "",
    status: "Open",
    trustByesTeamAssign: "HelpDesk",
    actionTaken: "Byes Helpdesk"
  },
  {
    id: "4",
    patrolType: "Internal",
    logDate: "07/02/2023 10:56:00",
    building: "Chox",
    location: "01-C2-02",
    issueDescription: "Bed/Cot",
    additionalInfo: "1",
    maximoPorterTracNo: "",
    status: "Open",
    trustByesTeamAssign: "helpdesk",
    actionTaken: "Byes Helpdesk"
  },
  {
    id: "5",
    patrolType: "Internal",
    logDate: "07/02/2023 08:51:00",
    building: "Chox",
    location: "LG1-C2-01",
    issueDescription: "Linen Cage Dirty",
    additionalInfo: "1",
    maximoPorterTracNo: "",
    status: "Open",
    trustByesTeamAssign: "HelpDesk",
    actionTaken: "Byes Helpdesk"
  },
  {
    id: "6",
    patrolType: "Internal",
    logDate: "07/02/2023 08:51:00",
    building: "Chox",
    location: "LG1-01-01B",
    issueDescription: "Linen Cage Dirty",
    additionalInfo: "",
    maximoPorterTracNo: "",
    status: "Open",
    trustByesTeamAssign: "HelpDesk",
    actionTaken: "Byes Helpdesk"
  },
  {
    id: "7",
    patrolType: "Internal",
    logDate: "07/02/2023 08:51:00",
    building: "Chox",
    location: "LG1-18-01A",
    issueDescription: "Linen Cage Dirty",
    additionalInfo: "6",
    maximoPorterTracNo: "",
    status: "Open",
    trustByesTeamAssign: "HelpDesk",
    actionTaken: "Byes Helpdesk"
  },
  {
    id: "8",
    patrolType: "External",
    logDate: "07/02/2023 07:17:00",
    building: "Chox",
    location: "01-41-46D",
    issueDescription: "Green Tote Box",
    additionalInfo: "1",
    maximoPorterTracNo: "",
    status: "Open",
    trustByesTeamAssign: "Trust",
    actionTaken: "Emailed Reub"
  },
  {
    id: "9",
    patrolType: "Internal",
    logDate: "07/02/2023 07:17:00",
    building: "Chox",
    location: "01-41-46D",
    issueDescription: "Empty Cage",
    additionalInfo: "1",
    maximoPorterTracNo: "",
    status: "Open",
    trustByesTeamAssign: "helpdesk",
    actionTaken: "Byes Helpdesk"
  },
  {
    id: "10",
    patrolType: "Internal",
    logDate: "07/02/2023 07:17:00",
    building: "Chox",
    location: "00-26-129",
    issueDescription: "Pallet Empty",
    additionalInfo: "1",
    maximoPorterTracNo: "",
    status: "Open",
    trustByesTeamAssign: "HelpDesk",
    actionTaken: "Byes Helpdesk"
  }
];

export const usePatrolLogs = (itemsPerPage: number = 5) => {
  // State for logs and filter criteria
  const [logs, setLogs] = useState<PatrolLog[]>(INITIAL_LOGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompletedRecords, setShowCompletedRecords] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<PatrolLog | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>(INITIAL_EDIT_FORM_DATA);
  
  // Filter logs based on search term and completion status
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesCompletedStatus = showCompletedRecords ? log.status === 'Closed' : log.status === 'Open';
      
      const matchesSearch = !searchTerm ? true : (
        log.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.issueDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.trustByesTeamAssign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actionTaken.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.patrolType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.status.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return matchesCompletedStatus && matchesSearch;
    });
  }, [logs, searchTerm, showCompletedRecords]);

  // Paginate logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Total pages calculation
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  // Handler for form field changes
  const handleEditFormChange = (field: keyof EditFormData, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset form to initial state
  const handleClearForm = () => {
    setEditFormData(INITIAL_EDIT_FORM_DATA);
    setSelectedRow(null);
  };

  // Handler for row selection
  const handleRowClick = (log: PatrolLog) => {
    setSelectedRow(log);
    setEditFormData({
      patrolId: log.id,
      patrolType: log.patrolType,
      logDate: log.logDate,
      building: log.building,
      location: log.location,
      issue: log.issueDescription,
      additionalInfo: log.additionalInfo,
      maximoPorterTracNo: log.maximoPorterTracNo,
      actionTaken: log.actionTaken,
      status: log.status,
      trustByesTeamAssign: log.trustByesTeamAssign
    });
  };

  // Handler for saving a new record
  const handleSaveRecord = () => {
    const newLog: PatrolLog = {
      id: String(logs.length + 1),
      patrolType: editFormData.patrolType,
      logDate: editFormData.logDate,
      building: editFormData.building,
      location: editFormData.location,
      issueDescription: editFormData.issue,
      additionalInfo: editFormData.additionalInfo,
      maximoPorterTracNo: editFormData.maximoPorterTracNo,
      status: editFormData.status,
      trustByesTeamAssign: editFormData.trustByesTeamAssign,
      actionTaken: editFormData.actionTaken
    };

    setLogs([...logs, newLog]);
    handleClearForm();
  };

  // Handler for modifying an existing record
  const handleModifyRecord = () => {
    if (!selectedRow) return;
    
    const updatedLogs = logs.map(log => 
      log.id === selectedRow.id 
        ? {
            ...log,
            patrolType: editFormData.patrolType,
            logDate: editFormData.logDate,
            building: editFormData.building,
            location: editFormData.location,
            issueDescription: editFormData.issue,
            additionalInfo: editFormData.additionalInfo,
            maximoPorterTracNo: editFormData.maximoPorterTracNo,
            status: editFormData.status,
            trustByesTeamAssign: editFormData.trustByesTeamAssign,
            actionTaken: editFormData.actionTaken
          }
        : log
    );
    
    setLogs(updatedLogs);
    handleClearForm();
  };

  // Handler for deleting a record
  const handleDeleteRecord = () => {
    if (!selectedRow) return;
    
    const updatedLogs = logs.filter(log => log.id !== selectedRow.id);
    setLogs(updatedLogs);
    handleClearForm();
  };

  // Handler for marking a record as closed
  const handleMarkAsClosed = () => {
    if (!selectedRow) return;
    
    const updatedLogs = logs.map(log => 
      log.id === selectedRow.id 
        ? { ...log, status: 'Closed' as const }
        : log
    );
    
    setLogs(updatedLogs);
    handleClearForm();
  };

  // Handler for search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handler for toggling completed records view
  const handleToggleCompletedRecords = () => {
    setShowCompletedRecords(!showCompletedRecords);
    setCurrentPage(1); // Reset to first page on toggle
  };

  // CSV data preparation for download
  const handleGetCSVData = () => {
    return logs.map(log => ({
      Type: log.patrolType,
      LogDate: log.logDate,
      Building: log.building,
      Location: log.location,
      IssueDescription: log.issueDescription,
      AdditionalInfo: log.additionalInfo,
      MaximoPorterTracNo: log.maximoPorterTracNo,
      Status: log.status,
      TrustByesTeamAssign: log.trustByesTeamAssign,
      ActionTaken: log.actionTaken
    }));
  };

  return {
    logs,
    filteredLogs,
    paginatedLogs,
    totalPages,
    currentPage,
    searchTerm,
    showCompletedRecords,
    selectedRow,
    editFormData,
    setCurrentPage,
    handleSearchChange,
    handleToggleCompletedRecords,
    handleEditFormChange,
    handleRowClick,
    handleClearForm,
    handleSaveRecord,
    handleModifyRecord,
    handleDeleteRecord,
    handleMarkAsClosed,
    handleGetCSVData
  };
}; 