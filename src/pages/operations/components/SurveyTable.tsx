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
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { CustomerSurvey, CustomerSurveyFilters } from '@/types/customerSatisfaction';
import { MOCK_CUSTOMERS, MOCK_REGIONS, MOCK_LOCATIONS } from '@/constants/customerSatisfaction';
import { format } from 'date-fns';

interface SurveyTableProps {
  surveys: CustomerSurvey[];
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
  };
  filters: CustomerSurveyFilters;
  onNewSurvey?: () => void;
  onEditSurvey?: (survey: CustomerSurvey) => void;
  onViewSurvey: (survey: CustomerSurvey) => void;
  onDeleteSurvey?: (id: string) => void;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: CustomerSurveyFilters) => void;
  isLoading: boolean;
  isCustomerView?: boolean;
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
  onFiltersChange,
  isLoading,
  isCustomerView = false
}) => {
  // Calculate average rating for a survey
  const getAverageRating = (survey: CustomerSurvey) => {
    const ratings = Object.values(survey.ratings);
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  };

  return (
    <div>
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 border-b">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search surveys..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-9"
              disabled={isLoading}
            />
          </div>
          <Select
            value={filters.customer || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, customer: value === 'all' ? '' : value })}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {MOCK_CUSTOMERS.map(customer => (
                <SelectItem key={customer} value={customer}>{customer}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.region || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, region: value === 'all' ? '' : value })}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {MOCK_REGIONS.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {!isCustomerView && (
          <Button onClick={onNewSurvey} disabled={isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Survey
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="relative">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Officer Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Average Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading surveys...
                </TableCell>
              </TableRow>
            ) : surveys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No surveys found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              surveys.map((survey) => (
                <TableRow key={survey.id}>
                  <TableCell>{survey.officerName}</TableCell>
                  <TableCell>{format(new Date(survey.date), 'PP')}</TableCell>
                  <TableCell>{survey.customer}</TableCell>
                  <TableCell>{survey.location}</TableCell>
                  <TableCell>{survey.region}</TableCell>
                  <TableCell>{getAverageRating(survey).toFixed(1)}/10</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onViewSurvey(survey)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!isCustomerView && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onEditSurvey?.(survey)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => onDeleteSurvey?.(survey.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-gray-500">
            Page {pagination.currentPage} of {Math.ceil(pagination.total / pagination.pageSize)}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={
                pagination.currentPage >= Math.ceil(pagination.total / pagination.pageSize) ||
                isLoading
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 