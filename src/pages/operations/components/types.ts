export interface SurveyRating {
  score: number;
  label: 'Poor' | 'Satisfactory' | 'Good' | 'Excellent';
}

export interface CustomerSurvey {
  id: string;
  officerName: string;
  date: string;
  customer: string;
  region: string;
  location: string;
  ratings: {
    uniformAndAppearance: number;
    professionalism: number;
    customerServiceApproach: number;
    improvedFeelingOfSecurityWhenOfficerOnSite: number;
    relationsWithStoreColleagues: number;
    punctualityBreaks: number;
    proactivity: number;
  };
  storeManagerName: string;
  areaManagerName: string;
  followUpActions: string[];
  datesToBeCompleted: string[];
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
}

export interface SurveyFilters {
  search: string;
  customer?: string;
  region?: string;
  location?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export const MOCK_CUSTOMERS = [
  'Shoprite Holdings',
  'Pick n Pay Group',
  'Walmart Africa'
];

export const MOCK_REGIONS = [
  'Western Cape',
  'Gauteng',
  'KwaZulu-Natal'
];

export const MOCK_LOCATIONS = [
  'Cape Town CBD',
  'Sandton City',
  'Gateway Mall'
];

export const RATING_SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const getRatingLabel = (score: number): 'Poor' | 'Satisfactory' | 'Good' | 'Excellent' => {
  if (score <= 3) return 'Poor';
  if (score <= 6) return 'Satisfactory';
  if (score <= 8) return 'Good';
  return 'Excellent';
}; 