import React from 'react';
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
  PlusCircle, 
  Eye, 
  Calendar, 
  MapPin, 
  Search,
  Edit,
  Trash2,
  Filter
} from "lucide-react";
import { CustomerSurvey, SurveyFilters, PaginationState, MOCK_CUSTOMERS, MOCK_REGIONS, MOCK_LOCATIONS } from './types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SurveyTableProps {
  surveys: CustomerSurvey[];
  pagination: PaginationState;
  filters: SurveyFilters;
  onNewSurvey: () => void;
  onEditSurvey: (survey: CustomerSurvey) => void;
  onViewSurvey: (survey: CustomerSurvey) => void;
  onDeleteSurvey: (id: string) => void;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: SurveyFilters) => void;
}

export const SurveyTable: React.FC<SurveyTableProps> = ({ 
  surveys, 
  pagination, 
  filters,
  onNewSurvey, 
  onEditSurvey,
  onViewSurvey,
  onDeleteSurvey,
  onPageChange,
  onFiltersChange
}) => {
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);

  const handleSearch = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleFilterChange = (key: keyof SurveyFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleDelete = () => {
    if (deleteId) {
      onDeleteSurvey(deleteId);
      setDeleteId(null);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Total Surveys:</span>
            <span className="text-sm font-bold text-gray-900">{pagination.total}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Search surveys..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 w-[300px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className={showFilters ? 'bg-blue-50 text-blue-600' : ''}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Customer</label>
                    <Select
                      value={filters.customer}
                      onValueChange={(value) => handleFilterChange('customer', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All customers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All customers</SelectItem>
                        {MOCK_CUSTOMERS.map((customer) => (
                          <SelectItem key={customer} value={customer}>
                            {customer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Region</label>
                    <Select
                      value={filters.region}
                      onValueChange={(value) => handleFilterChange('region', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All regions</SelectItem>
                        {MOCK_REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <Select
                      value={filters.location}
                      onValueChange={(value) => handleFilterChange('location', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All locations</SelectItem>
                        {MOCK_LOCATIONS.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={filters.dateRange?.from || ''}
                        onChange={(e) => handleFilterChange('dateRange', JSON.stringify({ 
                          ...filters.dateRange, 
                          from: e.target.value 
                        }))}
                        className="border-gray-300"
                      />
                      <Input
                        type="date"
                        value={filters.dateRange?.to || ''}
                        onChange={(e) => handleFilterChange('dateRange', JSON.stringify({ 
                          ...filters.dateRange, 
                          to: e.target.value 
                        }))}
                        className="border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2" 
          onClick={onNewSurvey}
        >
          <PlusCircle className="w-4 h-4" />
          New Survey
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Officer Name</TableHead>
              <TableHead className="font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  Date
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-900">Customer</TableHead>
              <TableHead className="font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  Location
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-900">Region</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {surveys.map((survey) => (
              <TableRow 
                key={survey.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <TableCell className="font-medium text-gray-900">{survey.officerName}</TableCell>
                <TableCell className="text-gray-600">
                  {new Date(survey.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </TableCell>
                <TableCell className="text-gray-900">{survey.customer}</TableCell>
                <TableCell className="text-gray-600">{survey.location}</TableCell>
                <TableCell className="text-gray-600">{survey.region}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      onClick={() => onEditSurvey(survey)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      onClick={() => onViewSurvey(survey)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => setDeleteId(survey.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {surveys.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-gray-500 text-sm">No surveys found</p>
                  <Button 
                    variant="link" 
                    onClick={onNewSurvey}
                    className="text-blue-600 hover:text-blue-700 mt-2"
                  >
                    Create your first survey
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} of {pagination.total} results
        </div>
        <div className="flex gap-2">
          {pages.map((page) => (
            <Button
              key={page}
              variant={page === pagination.currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className={page === pagination.currentPage ? 'bg-blue-600 text-white' : ''}
            >
              {page}
            </Button>
          ))}
        </div>
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Survey</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this survey? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 