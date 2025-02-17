import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Download,
  Filter,
  Search,
  Mail,
  CheckSquare,
  Edit2,
  Building2,
  MapPin,
  Info,
  Clock
} from 'lucide-react';
import { CSVLink } from 'react-csv';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Constants for dropdown options
const ISSUE_TYPES = [
  'Empty Cage',
  'Porters Chair',
  'Bed/Cot',
  'Linen Cage Dirty',
  'Linen Cage Clean',
  'Green Tote Box',
  'Pallet Empty',
  'Full Linen Cages'
];

const ACTION_TAKEN_OPTIONS = [
  'Byes Helpdesk',
  'Emailed Reub',
  'Escalated to Management',
  'Maintenance Notified',
  'Security Team Alerted'
];

const STAKEHOLDER_EMAILS = {
  'Byes Helpdesk': 'helpdesk@byes.com',
  'Reub': 'reub@company.com',
  'Management': 'management@company.com',
  'Maintenance': 'maintenance@company.com',
  'Security': 'security@company.com'
};

interface PatrolLog {
  id: string;
  patrolType: 'Internal' | 'External';
  logDate: string;
  building: string;
  location: string;
  issueDescription: string;
  additionalInfo: string;
  maximoPorterTracNo: string;
  status: 'Open' | 'Closed';
  trustByesTeamAssign: string;
  actionTaken: string;
  archived?: boolean;
}

interface EditFormData {
  patrolId: string;
  patrolType: 'Internal' | 'External';
  logDate: string;
  building: string;
  location: string;
  issue: string;
  additionalInfo: string;
  maximoPorterTracNo: string;
  actionTaken: string;
  status: 'Open' | 'Closed';
  trustByesTeamAssign: string;
}

const ITEMS_PER_PAGE = 5;

const PatrolLogPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState("February-2023");
  const [startDate, setStartDate] = useState("28/01/2025");
  const [endDate, setEndDate] = useState("");
  const [itemType, setItemType] = useState("Both");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompletedRecords, setShowCompletedRecords] = useState(false);
  const [logs, setLogs] = useState<PatrolLog[]>([
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
  ]);
  const [filteredLogs, setFilteredLogs] = useState<PatrolLog[]>([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    patrolId: '00033375',
    patrolType: 'Internal',
    logDate: '',
    building: 'West Wing',
    location: '',
    issue: '',
    additionalInfo: '',
    maximoPorterTracNo: '',
    actionTaken: 'Byes Helpdesk',
    status: 'Open',
    trustByesTeamAssign: 'HelpDesk'
  });
  const [selectedRow, setSelectedRow] = useState<PatrolLog | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [archivedLogs, setArchivedLogs] = useState<PatrolLog[]>([]);
  const [showArchivedDialog, setShowArchivedDialog] = useState(false);

  // Function to handle search with debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on new search
    
    const filtered = logs.filter(log => {
      // First filter by completed status
      const matchesCompletedStatus = showCompletedRecords ? log.status === 'Closed' : log.status === 'Open';
      
      // Then apply search filters
      const matchesSearch = 
        log.building.toLowerCase().includes(value.toLowerCase()) ||
        log.location.toLowerCase().includes(value.toLowerCase()) ||
        log.issueDescription.toLowerCase().includes(value.toLowerCase()) ||
        log.trustByesTeamAssign.toLowerCase().includes(value.toLowerCase()) ||
        log.actionTaken.toLowerCase().includes(value.toLowerCase()) ||
        log.patrolType.toLowerCase().includes(value.toLowerCase()) ||
        log.status.toLowerCase().includes(value.toLowerCase());

      return matchesCompletedStatus && matchesSearch;
    });
    setFilteredLogs(filtered);
  };

  // Function to toggle completed records view
  const handleToggleCompletedRecords = () => {
    setShowCompletedRecords(!showCompletedRecords);
    setCurrentPage(1); // Reset to first page
    
    const filtered = logs.filter(log => {
      const matchesCompletedStatus = !showCompletedRecords ? log.status === 'Closed' : log.status === 'Open';
      
      const matchesSearch = searchTerm ? (
        log.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.issueDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.trustByesTeamAssign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actionTaken.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.patrolType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.status.toLowerCase().includes(searchTerm.toLowerCase())
      ) : true;

      return matchesCompletedStatus && matchesSearch;
    });
    setFilteredLogs(filtered);
  };

  // Calculate pagination
  const currentLogs = React.useMemo(() => {
    const displayLogs = filteredLogs.length > 0 ? filteredLogs : logs;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [logs, filteredLogs, currentPage]);

  const totalPages = Math.ceil((filteredLogs.length || logs.length) / ITEMS_PER_PAGE);

  // Function to handle CSV download
  const handleDownloadCSV = () => {
    const csvData = logs.map(log => ({
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

    return csvData;
  };

  // Function to handle email
  const handleEmailParty = (log: PatrolLog) => {
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

  // Function to open patrol system
  const handlePatrolSystem = () => {
    window.open('https://followmystaff.com/patrolWeb/login', '_blank');
  };

  const handleEditFormChange = (field: keyof EditFormData, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
    setFilteredLogs([...logs, newLog]);
    handleClearScreen();
    setShowEditForm(false);
  };

  const handleClearScreen = () => {
    setEditFormData({
      patrolId: '00033375',
      patrolType: 'Internal',
      logDate: '',
      building: 'West Wing',
      location: '',
      issue: '',
      additionalInfo: '',
      maximoPorterTracNo: '',
      actionTaken: 'Byes Helpdesk',
      status: 'Open',
      trustByesTeamAssign: 'HelpDesk'
    });
    setFilteredLogs(logs);
    setSelectedRow(null);
  };

  // Function to handle row selection
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

  // Function to handle modify record
  const handleModifyRecord = () => {
    if (!selectedRow) return;
    
    const updatedLogs = filteredLogs.map(log => 
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
    
    // Update logs and reset selection
    setFilteredLogs(updatedLogs);
    setSelectedRow(null);
    setShowEditForm(false);
  };

  // Function to handle delete record
  const handleDeleteRecord = () => {
    if (!selectedRow) return;
    
    const updatedLogs = filteredLogs.filter(log => log.id !== selectedRow.id);
    setFilteredLogs(updatedLogs);
    setSelectedRow(null);
    setShowDeleteDialog(false);
    setShowEditForm(false);
  };

  // Function to handle marking record as closed
  const handleMarkAsClosed = () => {
    if (!selectedRow) return;
    
    const updatedLog = {
      ...selectedRow,
      status: 'Closed' as const
    };

    // Update the log in the main logs array
    const updatedLogs = logs.map(log => 
      log.id === selectedRow.id ? updatedLog : log
    );
    setLogs(updatedLogs);
    
    // Update filtered logs
    setFilteredLogs(prevFiltered => {
      if (showCompletedRecords) {
        return [...prevFiltered, updatedLog];
      } else {
        return prevFiltered.filter(log => log.id !== selectedRow.id);
      }
    });
    
    // Reset selection
    setSelectedRow(null);
    setShowArchivedDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header Section with improved styling */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Patrol Log</h1>
                    <p className="text-sm text-gray-500">Manage and track patrol activities</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant={showEditForm ? "default" : "outline"} 
                    className={`${showEditForm ? "bg-blue-600 text-white" : "text-gray-600"} transition-all duration-200`}
                    onClick={() => setShowEditForm(!showEditForm)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {showEditForm ? 'Hide Edit Form' : 'Display Edit Form'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all duration-200"
                    onClick={handleMarkAsClosed}
                    disabled={!selectedRow}
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Mark Record As Closed
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200"
                    onClick={() => selectedRow ? handleEmailParty(selectedRow) : null}
                    disabled={!selectedRow}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Relevant Party
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {showEditForm && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Patrol ID:</label>
                  <Input 
                    value={editFormData.patrolId}
                    onChange={(e) => handleEditFormChange('patrolId', e.target.value)}
                    className="border-gray-300"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Patrol Type:</label>
                  <Select 
                    value={editFormData.patrolType} 
                    onValueChange={(value) => handleEditFormChange('patrolType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Internal">Internal</SelectItem>
                      <SelectItem value="External">External</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Log Date:</label>
                  <Input 
                    type="datetime-local"
                    value={editFormData.logDate}
                    onChange={(e) => handleEditFormChange('logDate', e.target.value)}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Building:</label>
                  <Select 
                    value={editFormData.building}
                    onValueChange={(value) => handleEditFormChange('building', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select building" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="West Wing">West Wing</SelectItem>
                      <SelectItem value="Chox">Chox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Location:</label>
                  <Input 
                    value={editFormData.location}
                    onChange={(e) => handleEditFormChange('location', e.target.value)}
                    className="border-gray-300"
                    placeholder="e.g., 01-41-46D"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Issue:</label>
                  <Select 
                    value={editFormData.issue}
                    onValueChange={(value) => handleEditFormChange('issue', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue" />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_TYPES.map((issue) => (
                        <SelectItem key={issue} value={issue}>
                          {issue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Additional Info:</label>
                  <Input 
                    value={editFormData.additionalInfo}
                    onChange={(e) => handleEditFormChange('additionalInfo', e.target.value)}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Maximo/Porter Trac No:</label>
                  <Input 
                    value={editFormData.maximoPorterTracNo}
                    onChange={(e) => handleEditFormChange('maximoPorterTracNo', e.target.value)}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status:</label>
                  <Select 
                    value={editFormData.status}
                    onValueChange={(value: 'Open' | 'Closed') => handleEditFormChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Trust Byes Team Assign:</label>
                  <Select 
                    value={editFormData.trustByesTeamAssign}
                    onValueChange={(value) => handleEditFormChange('trustByesTeamAssign', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HelpDesk">HelpDesk</SelectItem>
                      <SelectItem value="Trust">Trust</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Action Taken:</label>
                  <Select 
                    value={editFormData.actionTaken}
                    onValueChange={(value) => handleEditFormChange('actionTaken', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action taken" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_TAKEN_OPTIONS.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  className="text-gray-600"
                  onClick={handleClearScreen}
                >
                  Clear Screen
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="text-gray-600"
                    onClick={handleModifyRecord}
                    disabled={!selectedRow}
                  >
                    Modify Selected Record
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleSaveRecord}
                  >
                    Save As New Record
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => selectedRow && setShowDeleteDialog(true)}
                    disabled={!selectedRow}
                  >
                    Delete Selected Record
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Download Section with improved styling */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-200 p-2 rounded-lg">
                <Download className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-blue-900">Download Data</h2>
                <p className="text-sm text-blue-700">Export patrol logs within a specific date range</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-900">Start Date:</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-900">End Date:</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white"
                />
              </div>
              <CSVLink 
                data={handleDownloadCSV()} 
                filename={`patrol_log_${startDate}_${endDate || 'current'}.csv`}
                className="inline-flex items-center justify-center"
              >
                <Button className="bg-blue-600 hover:bg-blue-700 w-full shadow-sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </CSVLink>
              <div className="flex items-center">
                <p className="text-sm text-blue-700 italic">
                  Leave dates empty for current month's data
                </p>
              </div>
            </div>
          </div>

          {/* Updated Filter Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Filter className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Filter Options</h2>
                <p className="text-sm text-gray-500">Refine the patrol logs display</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[180px] border-gray-300">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="February-2023">February 2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Item Type</label>
                <Select value={itemType} onValueChange={setItemType}>
                  <SelectTrigger className="w-[150px] border-gray-300">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Both">Both</SelectItem>
                    <SelectItem value="Internal">Internal</SelectItem>
                    <SelectItem value="External">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 ml-auto">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-9 w-[250px] border-gray-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className={`border-gray-300 ${
                    showCompletedRecords 
                      ? 'bg-blue-50 text-blue-600 border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={handleToggleCompletedRecords}
                >
                  {showCompletedRecords ? 'View Active Records' : 'View Completed Records'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handlePatrolSystem}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Patrols
                </Button>
              </div>
            </div>
          </div>

          {/* Updated Table Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Type</TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        Log Date
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        Building
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        Location
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-gray-500" />
                        Issue Description
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">Additional Info</TableHead>
                    <TableHead className="font-semibold text-gray-900">Maximo/Porter Trac No</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Trust Byes Team Assign</TableHead>
                    <TableHead className="font-semibold text-gray-900">Action Taken</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentLogs.map((log) => (
                    <TableRow 
                      key={log.id} 
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedRow?.id === log.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleRowClick(log)}
                    >
                      <TableCell>{log.patrolType}</TableCell>
                      <TableCell>{log.logDate}</TableCell>
                      <TableCell>{log.building}</TableCell>
                      <TableCell>{log.location}</TableCell>
                      <TableCell>{log.issueDescription}</TableCell>
                      <TableCell>{log.additionalInfo}</TableCell>
                      <TableCell>{log.maximoPorterTracNo}</TableCell>
                      <TableCell>{log.status}</TableCell>
                      <TableCell>{log.trustByesTeamAssign}</TableCell>
                      <TableCell>{log.actionTaken}</TableCell>
                    </TableRow>
                  ))}
                  {currentLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <p className="text-gray-500">No records found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="border-t border-gray-200 px-4 py-3 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, (filteredLogs.length || logs.length))}</span>
                      {' '}-{' '}
                      <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, (filteredLogs.length || logs.length))}</span>
                      {' '}of{' '}
                      <span className="font-medium">{filteredLogs.length || logs.length}</span>
                      {' '}results
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3"
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(page => page - 1)}
                      disabled={currentPage === 1}
                      className="px-3"
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === totalPages || 
                        Math.abs(currentPage - page) <= 1
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 py-1">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 ${currentPage === page ? 'bg-blue-600 text-white' : ''}`}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(page => page + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3"
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3"
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected patrol log record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRecord}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Archive Confirmation Dialog */}
      <AlertDialog open={showArchivedDialog} onOpenChange={setShowArchivedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Record Archived Successfully</AlertDialogTitle>
            <AlertDialogDescription>
              The selected record has been marked as closed and moved to the archived records.
              You can view it in the Completed Records Page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowArchivedDialog(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PatrolLogPage;
