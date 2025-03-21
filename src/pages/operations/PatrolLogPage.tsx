import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PatrolLogHeader } from './components/PatrolLogHeader';
import { PatrolLogFilter } from './components/PatrolLogFilter';
import { PatrolLogTable } from './components/PatrolLogTable';
import { PatrolLogPagination } from './components/PatrolLogPagination';
import { PatrolLogEditForm } from './components/PatrolLogEditForm';
import { PatrolLogDownload } from './components/PatrolLogDownload';
import { usePatrolLogs } from './hooks/usePatrolLogs';
import { useDialogs } from './hooks/useDialogs';
import { ITEMS_PER_PAGE } from './components/PatrolLogTypes';

const PatrolLogPage: React.FC = () => {
  // Filter state
  const [selectedMonth, setSelectedMonth] = useState("February-2023");
  const [startDate, setStartDate] = useState("28/01/2025");
  const [endDate, setEndDate] = useState("");
  const [itemType, setItemType] = useState("Both");

  // Custom hooks for data and dialogs
  const {
    paginatedLogs,
    filteredLogs,
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
  } = usePatrolLogs(ITEMS_PER_PAGE);

  const {
    dialogState,
    openDeleteDialog,
    closeDeleteDialog,
    openArchivedDialog,
    closeArchivedDialog,
    toggleEditForm,
    handleEmailParty,
    handlePatrolSystem
  } = useDialogs();

  // Handler for delete from edit form
  const handleDeleteButtonClick = () => {
    if (selectedRow) {
      openDeleteDialog();
    }
  };

  // Handler for marking as closed
  const handleMarkAsClosedClick = () => {
    handleMarkAsClosed();
    openArchivedDialog();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 max-w-[1280px]">
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {/* Header Section */}
          <PatrolLogHeader
            showEditForm={dialogState.showEditForm}
            onToggleEditForm={toggleEditForm}
            onMarkAsClosed={handleMarkAsClosedClick}
            onEmailParty={() => selectedRow && handleEmailParty(selectedRow)}
            isRowSelected={!!selectedRow}
          />

          {/* Edit Form */}
          {dialogState.showEditForm && (
            <div className="bg-white p-2 sm:p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm">
              <PatrolLogEditForm
                formData={editFormData}
                onFormChange={handleEditFormChange}
                onClearScreen={handleClearForm}
                onModifyRecord={handleModifyRecord}
                onSaveRecord={handleSaveRecord}
                onDeleteRecord={handleDeleteButtonClick}
                selectedRowId={selectedRow?.id || null}
              />
            </div>
          )}

          {/* Main content grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {/* Download Section - spans 1 column on mobile, 2 on tablet, full width on desktop */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4">
              <PatrolLogDownload
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
                csvData={handleGetCSVData()}
              />
            </div>

            {/* Filter Section - spans 1 column on mobile, 2 on tablet, full width on desktop  */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4">
              <PatrolLogFilter
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                itemType={itemType}
                onItemTypeChange={setItemType}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                showCompletedRecords={showCompletedRecords}
                onToggleCompletedRecords={handleToggleCompletedRecords}
                onPatrolSystem={handlePatrolSystem}
              />
            </div>

            {/* Table Section - spans full width across all breakpoints */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 overflow-hidden">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                  <PatrolLogTable
                    logs={paginatedLogs}
                    selectedRow={selectedRow}
                    onRowClick={handleRowClick}
                  />
                </div>
                <div className="border-t border-gray-200">
                  <PatrolLogPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemCount={filteredLogs.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={dialogState.showDeleteDialog} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent className="max-w-md mx-2 sm:mx-auto p-3 sm:p-4 md:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This action cannot be undone. This will permanently delete the selected patrol log record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0 pt-2">
            <AlertDialogCancel className="w-full sm:w-auto h-9 text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                handleDeleteRecord();
                closeDeleteDialog();
              }}
              className="w-full sm:w-auto h-9 text-sm bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={dialogState.showArchivedDialog} onOpenChange={closeArchivedDialog}>
        <AlertDialogContent className="max-w-md mx-2 sm:mx-auto p-3 sm:p-4 md:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Record Archived Successfully</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              The selected record has been marked as closed and moved to the archived records.
              You can view it in the Completed Records Page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogAction 
              onClick={closeArchivedDialog}
              className="w-full sm:w-auto h-9 text-sm bg-blue-600 hover:bg-blue-700 text-white"
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
