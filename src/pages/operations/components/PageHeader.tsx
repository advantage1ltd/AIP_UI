import React from 'react';
import { CustomerSurvey } from '@/types/customerSatisfaction';

interface PageHeaderProps {
  showForm: boolean;
  editingSurvey: CustomerSurvey | null;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  showForm,
  editingSurvey
}) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {showForm 
          ? editingSurvey 
            ? 'Edit Customer Satisfaction Survey'
            : 'New Customer Satisfaction Survey'
          : 'Customer Satisfaction Surveys'
        }
      </h1>
      <p className="text-muted-foreground">
        {showForm
          ? 'Fill in the survey details below. Required fields are marked with an asterisk (*)'
          : 'View and manage customer satisfaction surveys'
        }
      </p>
    </div>
  );
}; 