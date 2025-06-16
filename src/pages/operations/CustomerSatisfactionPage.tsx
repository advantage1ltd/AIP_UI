import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SurveyTable } from '@/pages/operations/components/SurveyTable';
import { SurveyForm } from '@/pages/operations/components/SurveyForm';
import { SurveyDetails } from '@/pages/operations/components/SurveyDetails';
import { CustomerSurvey, CustomerSurveyFilters } from '@/types/customerSatisfaction';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, FileSpreadsheet, BarChart3, Users, Building, MapPin, 
  Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Search, Download, Calendar as CalendarIcon 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { customerSatisfactionService } from '@/services/customerSatisfactionService';
import { toast } from 'react-toastify';
import { DashboardMetrics } from '@/pages/operations/components/DashboardMetrics';
import { MobileSurveyCard } from '@/pages/operations/components/MobileSurveyCard';
import { PageHeader } from '@/pages/operations/components/PageHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Generate mock data with more variety
export const generateMockSurveys = (count = 25): CustomerSurvey[] => {
  const customers = ['Shoprite Holdings', 'Pick n Pay', 'Woolworths', 'Spar Group', 'Game Stores'];
  const regions = ['Western Cape', 'Eastern Cape', 'Gauteng', 'KwaZulu-Natal', 'Free State'];
  const locations = [
    'Cape Town CBD', 'Sandton City', 'Durban North', 'Bloemfontein Mall', 
    'Port Elizabeth Central', 'Stellenbosch', 'Pretoria East', 'Umhlanga Rocks'
  ];
  const managerNames = [
    'Jane Smith', 'Robert Johnson', 'Emily Williams', 'Michael Brown',
    'Sarah Davis', 'James Wilson', 'Lisa Taylor', 'David Martinez'
  ];
  const actions = [
    'Improve security measures', 'Staff training', 'Update protocols',
    'Enhance customer service approach', 'Implement new technology', 'Review procedures',
    'Conduct follow-up assessment', 'Update documentation'
  ];
  const officerNames = [
    'John Doe', 'Mary Johnson', 'Peter Smith', 'Susan Brown',
    'David Wilson', 'Linda Davis', 'Michael Taylor', 'Sarah Martinez'
  ];

  return Array.from({ length: count }, (_, i) => {
    const numActions = Math.floor(Math.random() * 3) + 1;
    const followUpActions = Array.from({ length: numActions }, () => 
      actions[Math.floor(Math.random() * actions.length)]
    );
    const datesToBeCompleted = Array.from({ length: numActions }, () => {
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 30));
      return date.toISOString().split('T')[0];
    });

    return {
      id: (i + 1).toString(),
      officerName: officerNames[Math.floor(Math.random() * officerNames.length)],
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customer: customers[Math.floor(Math.random() * customers.length)],
      region: regions[Math.floor(Math.random() * regions.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      ratings: {
        uniformAndAppearance: Math.floor(Math.random() * 5) + 5,
        professionalism: Math.floor(Math.random() * 5) + 5,
        customerServiceApproach: Math.floor(Math.random() * 5) + 5,
        improvedFeelingOfSecurityWhenOfficerOnSite: Math.floor(Math.random() * 5) + 5,
        relationsWithStoreColleagues: Math.floor(Math.random() * 5) + 5,
        punctualityBreaks: Math.floor(Math.random() * 5) + 5,
        proactivity: Math.floor(Math.random() * 5) + 5
      },
      storeManagerName: managerNames[Math.floor(Math.random() * managerNames.length)],
      areaManagerName: managerNames[Math.floor(Math.random() * managerNames.length)],
      followUpActions,
      datesToBeCompleted
    };
  });
};

// Helper function to generate CSV data
const generateCsvData = (data: CustomerSurvey[]): string => {
  if (!data || data.length === 0) {
    return '';
  }

  // Define headers, flattening the ratings
  const headers = [
    'ID', 'Officer Name', 'Date', 'Customer', 'Region', 'Location',
    'Rating: Uniform & Appearance', 'Rating: Professionalism', 'Rating: Customer Service Approach',
    'Rating: Improved Feeling of Security When Officer on Site', 'Rating: Relations with Store Colleagues', 'Rating: Punctuality & Breaks',
    'Rating: Proactivity', 'Store Manager Name', 'Area Manager Name',
    'Follow Up Actions', 'Dates To Be Completed'
  ];

  // Convert survey data to CSV rows
  const rows = data.map(survey => {
    const ratings: Partial<CustomerSurvey['ratings']> = survey.ratings || {};
    const row = [
      survey.id,
      survey.officerName,
      survey.date,
      survey.customer,
      survey.region,
      survey.location,
      ratings.uniformAndAppearance ?? '',
      ratings.professionalism ?? '',
      ratings.customerServiceApproach ?? '',
      ratings.improvedFeelingOfSecurityWhenOfficerOnSite ?? '',
      ratings.relationsWithStoreColleagues ?? '',
      ratings.punctualityBreaks ?? '',
      ratings.proactivity ?? '',
      survey.storeManagerName,
      survey.areaManagerName,
      (survey.followUpActions || []).join('; '), // Join arrays with semicolon
      (survey.datesToBeCompleted || []).join('; ')
    ];
    // Escape commas and wrap in quotes if necessary
    return row.map(value => {
      const strValue = String(value ?? '');
      if (strValue.includes(',')) {
        return `"${strValue.replace(/"/g, '""')}"`; // Escape double quotes
      }
      return strValue;
    }).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

const CustomerSatisfactionPage: React.FC = () => {
  // State management
  const [showForm, setShowForm] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<CustomerSurvey | null>(null);
  const [viewingSurvey, setViewingSurvey] = useState<CustomerSurvey | null>(null);
  const [surveys, setSurveys] = useState<CustomerSurvey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState<CustomerSurveyFilters>({
    search: '',
    customer: '',
    region: '',
    location: '',
    dateRange: undefined
  });
  const [downloadStartDate, setDownloadStartDate] = useState<Date | undefined>();
  const [downloadEndDate, setDownloadEndDate] = useState<Date | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);

  // Fetch surveys
  const fetchSurveys = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await customerSatisfactionService.getSurveys(
        pagination.currentPage,
        pagination.pageSize,
        filters
      );
      setSurveys(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total
      }));
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
      toast.error('Failed to load surveys. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, filters]);

  // Initial load
  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  // Event handlers
  const handleNewSurvey = useCallback(() => {
    setEditingSurvey(null);
    setShowForm(true);
  }, []);

  const handleEditSurvey = useCallback((survey: CustomerSurvey) => {
    setEditingSurvey(survey);
    setShowForm(true);
  }, []);

  const handleViewSurvey = useCallback(async (survey: CustomerSurvey) => {
    try {
      const fullSurvey = await customerSatisfactionService.getSurvey(survey.id);
      setViewingSurvey(fullSurvey);
    } catch (error) {
      console.error('Failed to fetch survey details:', error);
      toast.error('Failed to load survey details. Please try again.');
    }
  }, []);

  const handleDeleteSurvey = useCallback(async (id: string) => {
    setSurveyToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!surveyToDelete) return;
    
    try {
      await customerSatisfactionService.deleteSurvey(surveyToDelete);
      toast.success('Survey deleted successfully');
      fetchSurveys(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete survey:', error);
      toast.error('Failed to delete survey. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setSurveyToDelete(null);
    }
  }, [surveyToDelete, fetchSurveys]);

  const handleSurveySubmit = useCallback(async (survey: CustomerSurvey) => {
    try {
      if (editingSurvey) {
        await customerSatisfactionService.updateSurvey(editingSurvey.id, survey);
        toast.success('Survey updated successfully');
      } else {
        await customerSatisfactionService.createSurvey(survey);
        toast.success('Survey created successfully');
      }
      setShowForm(false);
      setEditingSurvey(null);
      fetchSurveys(); // Refresh the list
    } catch (error) {
      console.error('Failed to save survey:', error);
      toast.error(editingSurvey 
        ? 'Failed to update survey. Please try again.'
        : 'Failed to create survey. Please try again.'
      );
    }
  }, [editingSurvey, fetchSurveys]);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingSurvey(null);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  }, []);

  const handleFiltersChange = useCallback((newFilters: CustomerSurveyFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({
      ...prev,
      currentPage: 1 // Reset to first page on filter change
    }));
  }, []);

  const handleCloseDetails = useCallback(() => {
    setViewingSurvey(null);
  }, []);

  const handleDownloadCsv = useCallback(() => {
    if (!downloadStartDate || !downloadEndDate) {
      alert('Please select both a start and end date for the download.');
      return;
    }

    if (downloadStartDate > downloadEndDate) {
        alert('Start date cannot be after end date.');
        return;
    }

    // Filter surveys based on the download date range
    const filteredForDownload = surveys.filter(survey => {
      const surveyDate = new Date(survey.date);
      // Set hours to 0 to compare dates only
      surveyDate.setHours(0, 0, 0, 0);
      const startDate = new Date(downloadStartDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(downloadEndDate);
      endDate.setHours(0, 0, 0, 0);

      return surveyDate >= startDate && surveyDate <= endDate;
    });

    if (filteredForDownload.length === 0) {
      alert('No survey data found for the selected date range.');
      return;
    }

    // Generate CSV content
    const csvData = generateCsvData(filteredForDownload);
    if (!csvData) {
      alert('Failed to generate CSV data.');
      return;
    }

    // Create a Blob and trigger download
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // Check for download attribute support
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const formattedStartDate = format(downloadStartDate, 'yyyy-MM-dd');
      const formattedEndDate = format(downloadEndDate, 'yyyy-MM-dd');
      link.setAttribute('download', `customer_satisfaction_${formattedStartDate}_to_${formattedEndDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up the object URL
    } else {
      alert('CSV download is not supported in your browser.');
    }
  }, [surveys, downloadStartDate, downloadEndDate]);

  // Memoized filter logic
  const filteredSurveys = useMemo(() => {
    return surveys.filter(survey => {
      // Text search across multiple fields
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = !searchTerm || 
        survey.officerName.toLowerCase().includes(searchTerm) ||
        survey.customer.toLowerCase().includes(searchTerm) ||
        survey.location.toLowerCase().includes(searchTerm);

      // Exact matches for dropdowns
      const matchesCustomer = !filters.customer || survey.customer === filters.customer;
      const matchesRegion = !filters.region || survey.region === filters.region;
      const matchesLocation = !filters.location || survey.location === filters.location;

      // Date range filtering
      const surveyDate = new Date(survey.date);
      const matchesDateRange = !filters.dateRange ||
        (!filters.dateRange.from || surveyDate >= new Date(filters.dateRange.from)) &&
        (!filters.dateRange.to || surveyDate <= new Date(filters.dateRange.to));

      return matchesSearch && matchesCustomer && matchesRegion && matchesLocation && matchesDateRange;
    });
  }, [surveys, filters]);

  // Memoized pagination
  const paginatedSurveys = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredSurveys.slice(start, end);
  }, [filteredSurveys, pagination.currentPage, pagination.pageSize]);

  // Update pagination when filtered results change
  useEffect(() => {
    const totalPages = Math.ceil(filteredSurveys.length / pagination.pageSize);
    const newCurrentPage = Math.min(pagination.currentPage, Math.max(1, totalPages));
    
    setPagination(prev => ({
      ...prev,
      total: filteredSurveys.length,
      currentPage: newCurrentPage
    }));
  }, [filteredSurveys, pagination.pageSize, pagination.currentPage]);

  // Animation properties
  const motionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.2 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto max-w-[1280px] py-4 md:py-6 lg:py-8 px-2 md:px-4 lg:px-6">
        <PageHeader showForm={showForm} editingSurvey={editingSurvey} />

        <AnimatePresence mode="wait">
          <motion.div
            key={showForm ? 'form' : 'table'}
            {...motionProps}
            className="w-full"
          >
            {!showForm ? (
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 md:gap-6">
                <div className="lg:col-span-7">
                  {/* Dashboard metrics for quick overview */}
                  <DashboardMetrics surveys={surveys} />
                  
                  {/* Main content area */}
                  <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Mobile view - card-based layout (only visible on mobile) */}
                    <div className="sm:hidden p-3">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-gray-700">
                          {isLoading ? 'Loading...' : `${surveys.length} Survey${surveys.length !== 1 ? 's' : ''}`}
                        </h3>
                        <Button size="sm" className="h-8 text-xs" onClick={handleNewSurvey}>
                          Add New
                        </Button>
                      </div>
                      
                      {/* Search field for mobile */}
                      <div className="relative mb-4">
                        <Input
                          type="text"
                          placeholder="Search surveys..."
                          value={filters.search}
                          onChange={(e) => handleFiltersChange({...filters, search: e.target.value})}
                          className="w-full pl-8 text-xs h-8"
                          disabled={isLoading}
                        />
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                      </div>

                      {/* Download controls for Mobile */}
                      <div className="mt-4 p-3 border rounded-md bg-gray-50">
                        <p className="text-xs font-medium text-gray-600 mb-2">Download Report (CSV)</p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                           <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  size="sm"
                                  className={cn(
                                    "w-full justify-start text-left font-normal h-8 text-xs",
                                    !downloadStartDate && "text-muted-foreground"
                                  )}
                                  disabled={isLoading}
                                >
                                  <CalendarIcon className="mr-1 h-3.5 w-3.5" />
                                  {downloadStartDate ? format(downloadStartDate, "PPP") : <span>Start date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={downloadStartDate}
                                  onSelect={setDownloadStartDate}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  size="sm"
                                  className={cn(
                                    "w-full justify-start text-left font-normal h-8 text-xs",
                                    !downloadEndDate && "text-muted-foreground"
                                  )}
                                  disabled={isLoading}
                                >
                                  <CalendarIcon className="mr-1 h-3.5 w-3.5" />
                                  {downloadEndDate ? format(downloadEndDate, "PPP") : <span>End date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={downloadEndDate}
                                  onSelect={setDownloadEndDate}
                                   disabled={(date) =>
                                      downloadStartDate ? date < downloadStartDate : false
                                    }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full h-8 text-xs" 
                          onClick={handleDownloadCsv}
                          disabled={!downloadStartDate || !downloadEndDate || isLoading}
                        >
                           <Download className="mr-1 h-3.5 w-3.5" /> Download CSV
                        </Button>
                      </div>
                      
                      {/* Mobile card list with pagination */}
                      <div className="mt-4"> 
                        {isLoading ? (
                          <div className="text-center py-8 text-sm text-gray-500">
                            Loading surveys...
                          </div>
                        ) : surveys.length > 0 ? (
                          <>
                            {surveys.map(survey => (
                              <MobileSurveyCard 
                                key={survey.id}
                                survey={survey}
                                onEdit={handleEditSurvey}
                                onView={handleViewSurvey}
                                onDelete={handleDeleteSurvey}
                              />
                            ))}
                            
                            {/* Mobile pagination */}
                            <div className="flex justify-between items-center mt-4 pt-2 border-t text-xs text-gray-500">
                              <span>Page {pagination.currentPage} of {Math.ceil(pagination.total / pagination.pageSize)}</span>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0" 
                                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                                  disabled={pagination.currentPage === 1 || isLoading}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0" 
                                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                                  disabled={pagination.currentPage >= Math.ceil(pagination.total / pagination.pageSize) || isLoading}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8 text-sm text-gray-500">
                            No surveys found matching your search.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Desktop view - table layout (hidden on mobile) */}
                    <div className="hidden sm:block min-w-[320px] overflow-auto">
                      {/* Download Controls for Desktop */}
                       <div className="flex items-center gap-2 p-4 border-b">
                         <span className="text-sm font-medium text-gray-700 mr-2">Download Report:</span>
                         <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                size="sm"
                                className={cn(
                                  "w-[180px] justify-start text-left font-normal h-9",
                                  !downloadStartDate && "text-muted-foreground"
                                )}
                                disabled={isLoading}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {downloadStartDate ? format(downloadStartDate, "PPP") : <span>Start date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={downloadStartDate}
                                onSelect={setDownloadStartDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                           <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  size="sm"
                                  className={cn(
                                    "w-[180px] justify-start text-left font-normal h-9",
                                    !downloadEndDate && "text-muted-foreground"
                                  )}
                                  disabled={isLoading}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {downloadEndDate ? format(downloadEndDate, "PPP") : <span>End date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={downloadEndDate}
                                  onSelect={setDownloadEndDate}
                                  disabled={(date) =>
                                      downloadStartDate ? date < downloadStartDate : false
                                    }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          <Button 
                            size="sm" 
                            className="h-9" 
                            onClick={handleDownloadCsv}
                            disabled={!downloadStartDate || !downloadEndDate || isLoading}
                          >
                            <Download className="mr-2 h-4 w-4" /> Download CSV
                          </Button>
                      </div>
                      
                      <SurveyTable 
                        surveys={surveys}
                        pagination={pagination}
                        filters={filters}
                        onNewSurvey={handleNewSurvey}
                        onEditSurvey={handleEditSurvey}
                        onViewSurvey={handleViewSurvey}
                        onDeleteSurvey={handleDeleteSurvey}
                        onPageChange={handlePageChange}
                        onFiltersChange={handleFiltersChange}
                        isLoading={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-5xl mx-auto">
                <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                    <SurveyForm 
                      onSubmit={handleSurveySubmit} 
                      onCancel={handleCancelForm}
                      initialData={editingSurvey}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the survey and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSurveyToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {viewingSurvey && (
          <SurveyDetails
            survey={viewingSurvey}
            open={!!viewingSurvey}
            onClose={handleCloseDetails}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerSatisfactionPage;