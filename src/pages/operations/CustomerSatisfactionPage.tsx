import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SurveyTable } from '@/pages/operations/components/SurveyTable';
import { SurveyForm } from '@/pages/operations/components/SurveyForm';
import { SurveyDetails } from '@/pages/operations/components/SurveyDetails';
import { CustomerSurvey, SurveyFilters, PaginationState } from '@/pages/operations/components/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, FileSpreadsheet, BarChart3, Users, Building, MapPin, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Generate mock data with more variety
const generateMockSurveys = (count = 25): CustomerSurvey[] => {
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
    'Enhance customer service', 'Implement new technology', 'Review procedures',
    'Increase visibility', 'Coordinate with store management'
  ];
  
  // Generate different dates within the last 3 months
  const getRandomDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    return date.toISOString().split('T')[0];
  };

  return Array.from({ length: count }, (_, index) => ({
  id: String(index + 1),
    officerName: `Officer ${index + 1}`,
    date: getRandomDate(),
    customer: customers[Math.floor(Math.random() * customers.length)],
    region: regions[Math.floor(Math.random() * regions.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
  ratings: {
      uniformAndAppearance: Math.floor(Math.random() * 5) + 5, // 5-10 rating
      professionalism: Math.floor(Math.random() * 5) + 5,
      customerServiceApproach: Math.floor(Math.random() * 5) + 5,
      improvedFeelingSecurity: Math.floor(Math.random() * 5) + 5,
      relationsWithStoreColleagues: Math.floor(Math.random() * 5) + 5,
      punctualityBreaks: Math.floor(Math.random() * 5) + 5,
      proactivity: Math.floor(Math.random() * 5) + 5
    },
    storeManagerName: managerNames[Math.floor(Math.random() * managerNames.length)],
    areaManagerName: managerNames[Math.floor(Math.random() * managerNames.length)],
    followUpActions: Array.from(
      { length: Math.floor(Math.random() * 3) + 1 }, 
      () => actions[Math.floor(Math.random() * actions.length)]
    ),
    datesToBeCompleted: Array.from(
      { length: Math.floor(Math.random() * 3) + 1 }, 
      () => {
        const date = new Date();
        date.setDate(date.getDate() + Math.floor(Math.random() * 30) + 1);
        return date.toISOString().split('T')[0];
      }
    )
  }));
};

// Component for page header
const PageHeader = ({ showForm, editingSurvey }: { showForm: boolean; editingSurvey: CustomerSurvey | null }) => (
  <div className="mb-4 md:mb-6 lg:mb-8">
    <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
      {showForm ? (
        <ClipboardList className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
      ) : (
        <FileSpreadsheet className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
      )}
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
        {showForm 
          ? (editingSurvey ? 'Edit Survey' : 'New Survey') 
          : 'Customer Satisfaction Surveys'}
      </h1>
    </div>
    <p className="text-sm md:text-base lg:text-lg text-gray-600">
      {showForm 
        ? `${editingSurvey ? 'Edit the' : 'Complete the'} form below to ${editingSurvey ? 'update' : 'submit'} a customer satisfaction survey.`
        : 'View and manage customer satisfaction surveys across all locations.'
      }
    </p>
  </div>
);

// Dashboard metrics component with responsive grid
const DashboardMetrics = ({ surveys }: { surveys: CustomerSurvey[] }) => {
  // Calculate metrics
  const totalSurveys = surveys.length;
  const averageRating = useMemo(() => {
    if (totalSurveys === 0) return 0;
    const sum = surveys.reduce((acc, survey) => {
      const ratings = Object.values(survey.ratings);
      const avgSurveyRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      return acc + avgSurveyRating;
    }, 0);
    return Math.round((sum / totalSurveys) * 10) / 10; // Round to 1 decimal
  }, [surveys, totalSurveys]);

  const uniqueCustomers = useMemo(() => {
    return new Set(surveys.map(s => s.customer)).size;
  }, [surveys]);

  const uniqueLocations = useMemo(() => {
    return new Set(surveys.map(s => s.location)).size;
  }, [surveys]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
      <Card className="bg-primary text-primary-foreground shadow-sm">
        <CardHeader className="p-2 md:p-4 pb-0">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
            <CardTitle className="text-sm md:text-base">Total Surveys</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-4 pt-1 md:pt-2">
          <p className="text-2xl md:text-3xl font-bold">{totalSurveys}</p>
          <p className="text-xs md:text-sm text-primary-foreground/70">Overall submission count</p>
        </CardContent>
      </Card>

      <Card className="bg-indigo-600 text-white shadow-sm">
        <CardHeader className="p-2 md:p-4 pb-0">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 md:h-5 md:w-5 text-white" />
            <CardTitle className="text-sm md:text-base">Avg. Rating</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-4 pt-1 md:pt-2">
          <p className="text-2xl md:text-3xl font-bold">{averageRating}/10</p>
          <p className="text-xs md:text-sm text-white/70">Customer satisfaction score</p>
        </CardContent>
      </Card>

      <Card className="bg-emerald-600 text-white shadow-sm">
        <CardHeader className="p-2 md:p-4 pb-0">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 md:h-5 md:w-5 text-white" />
            <CardTitle className="text-sm md:text-base">Customers</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-4 pt-1 md:pt-2">
          <p className="text-2xl md:text-3xl font-bold">{uniqueCustomers}</p>
          <p className="text-xs md:text-sm text-white/70">Unique clients surveyed</p>
        </CardContent>
      </Card>

      <Card className="bg-rose-600 text-white shadow-sm">
        <CardHeader className="p-2 md:p-4 pb-0">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 md:h-5 md:w-5 text-white" />
            <CardTitle className="text-sm md:text-base">Locations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-4 pt-1 md:pt-2">
          <p className="text-2xl md:text-3xl font-bold">{uniqueLocations}</p>
          <p className="text-xs md:text-sm text-white/70">Unique sites covered</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Mobile survey card component for better mobile display
const MobileSurveyCard = ({ 
  survey, 
  onEdit, 
  onView, 
  onDelete 
}: { 
  survey: CustomerSurvey; 
  onEdit: (survey: CustomerSurvey) => void;
  onView: (survey: CustomerSurvey) => void;
  onDelete: (id: string) => void;
}) => {
  // Calculate average rating
  const avgRating = useMemo(() => {
    const ratings = Object.values(survey.ratings);
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }, [survey.ratings]);

  return (
    <Card className="mb-3 shadow-sm">
      <CardHeader className="p-3 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base font-medium">{survey.officerName}</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {new Date(survey.date).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium">
            {avgRating}/10
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-2 gap-2 text-xs mt-2 text-gray-700">
          <div>
            <p className="font-medium text-gray-500">Customer</p>
            <p className="truncate">{survey.customer}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Location</p>
            <p className="truncate">{survey.location}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Region</p>
            <p>{survey.region}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Manager</p>
            <p className="truncate">{survey.storeManagerName}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-3 border-t pt-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onView(survey)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onEdit(survey)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700" 
            onClick={() => onDelete(survey.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CustomerSatisfactionPage: React.FC = () => {
  // State management
  const [showForm, setShowForm] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<CustomerSurvey | null>(null);
  const [viewingSurvey, setViewingSurvey] = useState<CustomerSurvey | null>(null);
  const [surveys, setSurveys] = useState<CustomerSurvey[]>(() => generateMockSurveys(25));
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    total: 25
  });
  const [filters, setFilters] = useState<SurveyFilters>({
    search: '',
    customer: '',
    region: '',
    location: '',
    dateRange: undefined
  });

  // Event handlers with useCallback to prevent unnecessary rerenders
  const handleNewSurvey = useCallback(() => {
    setEditingSurvey(null);
    setShowForm(true);
  }, []);

  const handleEditSurvey = useCallback((survey: CustomerSurvey) => {
    setEditingSurvey(survey);
    setShowForm(true);
  }, []);

  const handleViewSurvey = useCallback((survey: CustomerSurvey) => {
    setViewingSurvey(survey);
  }, []);

  const handleDeleteSurvey = useCallback((id: string) => {
    setSurveys(prev => {
      const updatedSurveys = prev.filter(survey => survey.id !== id);
      return updatedSurveys;
    });
    // Update will happen in useEffect
  }, []);

  const handleSurveySubmit = useCallback((survey: CustomerSurvey) => {
    setSurveys(prev => {
    if (editingSurvey) {
      // Update existing survey
        return prev.map(s => s.id === editingSurvey.id 
          ? { ...survey, id: editingSurvey.id } 
          : s
        );
    } else {
        // Add new survey with next available ID
        return [...prev, { ...survey, id: String(prev.length + 1) }];
      }
    });
    
    setShowForm(false);
    setEditingSurvey(null);
  }, [editingSurvey]);

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

  const handleFiltersChange = useCallback((newFilters: SurveyFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({
      ...prev,
      currentPage: 1 // Reset to first page on filter change
    }));
  }, []);

  const handleCloseDetails = useCallback(() => {
    setViewingSurvey(null);
  }, []);

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
                          {filteredSurveys.length} Survey{filteredSurveys.length !== 1 ? 's' : ''}
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
                        />
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                      </div>

                      {/* Mobile card list with pagination */}
                      {paginatedSurveys.length > 0 ? (
                        <>
                          {paginatedSurveys.map(survey => (
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
                            <span>Page {pagination.currentPage} of {Math.ceil(filteredSurveys.length / pagination.pageSize)}</span>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0" 
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0" 
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage >= Math.ceil(filteredSurveys.length / pagination.pageSize)}
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

                    {/* Desktop view - table layout (hidden on mobile) */}
                    <div className="hidden sm:block min-w-[320px] overflow-auto">
                <SurveyTable 
                  surveys={paginatedSurveys}
                  pagination={pagination}
                  filters={filters}
                  onNewSurvey={handleNewSurvey}
                  onEditSurvey={handleEditSurvey}
                  onViewSurvey={handleViewSurvey}
                  onDeleteSurvey={handleDeleteSurvey}
                  onPageChange={handlePageChange}
                  onFiltersChange={handleFiltersChange}
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