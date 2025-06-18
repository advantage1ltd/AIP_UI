export interface CustomerSurveyRatings {
  uniformAndAppearance: number;
  professionalism: number;
  customerServiceApproach: number;
  improvedFeelingOfSecurityWhenOfficerOnSite: number;
  relationsWithStoreColleagues: number;
  punctualityBreaks: number;
  proactivity: number;
}

export interface CustomerSurvey {
  id: string;
  officerName: string;
  date: string;
  customer: string;
  region: string;
  location: string;
  ratings: CustomerSurveyRatings;
  storeManagerName: string;
  areaManagerName: string;
  followUpActions: string[];
  datesToBeCompleted: string[];
}

export interface CustomerSurveyFilters {
  search: string;
  customer: string;
  region: string;
  location: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  customerId?: string;
}

export interface CustomerSurveyResponse {
  data: CustomerSurvey[];
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
  };
}

export interface CustomerSurveyRequest extends Omit<CustomerSurvey, 'id'> {}

export interface CustomerSurveyUpdateRequest extends Partial<CustomerSurveyRequest> {
  id: string;
} 