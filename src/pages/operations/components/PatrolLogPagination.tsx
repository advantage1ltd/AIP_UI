import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PatrolLogPaginationProps {
  currentPage: number;
  totalPages: number;
  itemCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const PatrolLogPagination: React.FC<PatrolLogPaginationProps> = ({
  currentPage,
  totalPages,
  itemCount,
  itemsPerPage,
  onPageChange
}) => {
  if (totalPages <= 0) return null;

  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, itemCount);
  const endItem = Math.min(currentPage * itemsPerPage, itemCount);

  // Function to render page buttons with ellipsis for larger ranges
  const renderPageButtons = () => {
    const pages = [];
    const pageNumbersToShow = [];
    
    // Always show first page, last page, and pages around current page
    pageNumbersToShow.push(1);
    if (currentPage > 3) pageNumbersToShow.push("ellipsis1");
    
    // Show 1 page before current page if it exists
    if (currentPage - 1 > 1) pageNumbersToShow.push(currentPage - 1);
    
    // Show current page if it's not 1 or last
    if (currentPage !== 1 && currentPage !== totalPages) pageNumbersToShow.push(currentPage);
    
    // Show 1 page after current page if it exists
    if (currentPage + 1 < totalPages) pageNumbersToShow.push(currentPage + 1);
    
    if (currentPage < totalPages - 2) pageNumbersToShow.push("ellipsis2");
    if (totalPages > 1) pageNumbersToShow.push(totalPages);
    
    // Remove duplicates
    const uniquePageNumbers = [...new Set(pageNumbersToShow)];
    
    uniquePageNumbers.forEach((page, index) => {
      if (page === "ellipsis1" || page === "ellipsis2") {
        pages.push(
          <span key={`ellipsis-${index}`} className="px-2 text-xs text-gray-500">
            ...
          </span>
        );
      } else {
        pages.push(
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page as number)}
            className={`h-7 w-7 md:h-8 md:w-8 p-0 text-xs ${
              currentPage === page ? 'bg-blue-600 text-white' : ''
            }`}
          >
            {page}
          </Button>
        );
      }
    });
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/10">
      <div className="text-xs text-muted-foreground">
        {itemCount > 0 ? (
          <>
            <span className="hidden sm:inline">Showing </span>
            <span className="font-medium">{startItem}</span>
            {' '}-{' '}
            <span className="font-medium">{endItem}</span>
            {' '}of{' '}
            <span className="font-medium">{itemCount}</span>
            <span className="hidden sm:inline"> results</span>
          </>
        ) : (
          <span>No results</span>
        )}
      </div>
      
      <div className="flex gap-1 sm:gap-2 items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-7 w-7 md:h-8 md:w-8 p-0 hidden sm:flex items-center justify-center"
          title="First Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <ChevronLeft className="h-3.5 w-3.5 -ml-1.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-7 w-7 md:h-8 md:w-8 p-0 flex items-center justify-center"
          title="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        
        <div className="hidden sm:flex gap-1">
          {renderPageButtons()}
        </div>
        
        <span className="text-xs sm:hidden">
          {currentPage}/{totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-7 w-7 md:h-8 md:w-8 p-0 flex items-center justify-center"
          title="Next Page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-7 w-7 md:h-8 md:w-8 p-0 hidden sm:flex items-center justify-center"
          title="Last Page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
          <ChevronRight className="h-3.5 w-3.5 -ml-1.5" />
        </Button>
      </div>
    </div>
  );
}; 