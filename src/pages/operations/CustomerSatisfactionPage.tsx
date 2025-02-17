import React, { useState, useEffect } from 'react';
import { SurveyTable } from '@/pages/operations/components/SurveyTable';
import { SurveyForm } from '@/pages/operations/components/SurveyForm';
import { SurveyDetails } from '@/pages/operations/components/SurveyDetails';
import { CustomerSurvey, SurveyFilters, PaginationState } from '@/pages/operations/components/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, FileSpreadsheet } from 'lucide-react';

// Mock data for demonstration
const mockSurveys = Array.from({ length: 25 }, (_, index) => ({
  id: String(index + 1),
  officerName: `John Doe ${index + 1}`,
  date: '2024-03-20',
  customer: 'Shoprite Holdings',
  region: 'Western Cape',
  location: 'Cape Town CBD',
  ratings: {
    uniformAndAppearance: 8,
    professionalism: 9,
    customerServiceApproach: 7,
    improvedFeelingSecurity: 9,
    relationsWithStoreColleagues: 8,
    punctualityBreaks: 7,
    proactivity: 8
  },
  storeManagerName: 'Jane Smith',
  areaManagerName: 'Mike Johnson',
  followUpActions: ['Improve security measures', 'Staff training', 'Update protocols'],
  datesToBeCompleted: ['2024-04-01', '2024-04-15', '2024-04-30']
}));

const CustomerSatisfactionPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<CustomerSurvey | null>(null);
  const [viewingSurvey, setViewingSurvey] = useState<CustomerSurvey | null>(null);
  const [surveys, setSurveys] = useState<CustomerSurvey[]>(mockSurveys);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    total: mockSurveys.length
  });
  const [filters, setFilters] = useState<SurveyFilters>({
    search: '',
    customer: '',
    region: '',
    location: '',
    dateRange: undefined
  });

  const handleNewSurvey = () => {
    setEditingSurvey(null);
    setShowForm(true);
  };

  const handleEditSurvey = (survey: CustomerSurvey) => {
    setEditingSurvey(survey);
    setShowForm(true);
  };

  const handleViewSurvey = (survey: CustomerSurvey) => {
    setViewingSurvey(survey);
  };

  const handleDeleteSurvey = (id: string) => {
    setSurveys(surveys.filter(survey => survey.id !== id));
    setPagination(prev => ({
      ...prev,
      total: prev.total - 1
    }));
  };

  const handleSurveySubmit = (survey: CustomerSurvey) => {
    if (editingSurvey) {
      // Update existing survey
      setSurveys(surveys.map(s => s.id === editingSurvey.id ? { ...survey, id: editingSurvey.id } : s));
    } else {
      // Add new survey
      setSurveys([...surveys, { ...survey, id: String(surveys.length + 1) }]);
      setPagination(prev => ({
        ...prev,
        total: prev.total + 1
      }));
    }
    setShowForm(false);
    setEditingSurvey(null);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const handleFiltersChange = (newFilters: SurveyFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  // Filter and paginate surveys
  const filteredSurveys = React.useMemo(() => {
    return surveys.filter(survey => {
      const matchesSearch = !filters.search || 
        survey.officerName.toLowerCase().includes(filters.search.toLowerCase()) ||
        survey.customer.toLowerCase().includes(filters.search.toLowerCase()) ||
        survey.location.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCustomer = !filters.customer || survey.customer === filters.customer;
      const matchesRegion = !filters.region || survey.region === filters.region;
      const matchesLocation = !filters.location || survey.location === filters.location;

      const surveyDate = new Date(survey.date);
      const matchesDateRange = !filters.dateRange ||
        (!filters.dateRange.from || surveyDate >= new Date(filters.dateRange.from)) &&
        (!filters.dateRange.to || surveyDate <= new Date(filters.dateRange.to));

      return matchesSearch && matchesCustomer && matchesRegion && matchesLocation && matchesDateRange;
    });
  }, [surveys, filters]);

  const paginatedSurveys = React.useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredSurveys.slice(start, end);
  }, [filteredSurveys, pagination.currentPage, pagination.pageSize]);

  // Update total when filters change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredSurveys.length,
      currentPage: Math.min(prev.currentPage, Math.ceil(filteredSurveys.length / prev.pageSize))
    }));
  }, [filteredSurveys]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {showForm ? (
              <ClipboardList className="h-8 w-8 text-blue-600" />
            ) : (
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            )}
            <h1 className="text-3xl font-bold text-gray-900">
              {showForm ? (editingSurvey ? 'Edit Survey' : 'New Survey') : 'Customer Satisfaction Surveys'}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {showForm 
              ? `${editingSurvey ? 'Edit the' : 'Complete the'} form below to ${editingSurvey ? 'update' : 'submit'} a customer satisfaction survey.`
              : 'View and manage customer satisfaction surveys across all locations.'
            }
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={showForm ? 'form' : 'table'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {!showForm ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
            ) : (
              <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <SurveyForm 
                      onSubmit={handleSurveySubmit} 
                      onCancel={() => {
                        setShowForm(false);
                        setEditingSurvey(null);
                      }}
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
            onClose={() => setViewingSurvey(null)}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerSatisfactionPage;