import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Cell } from 'recharts'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, format, subDays, isWithinInterval } from 'date-fns'
import { cn } from '@/lib/utils'

// Define types for the data
interface IncidentData {
  location: string;
  valueRecovered: number;
  quantityRecovered: number;
  uniformOfficer: number;
  storeDetective: number;
  uniformQuantity?: number;
  detectiveQuantity?: number;
  total: number;
  regionName?: string;
  officerRole?: string;
  date?: string;
  incidentType?: string;
  incidentCode?: string;
  severity?: string;
}

interface FilteredData {
  location: string;
  value: number;
  quantity: number;
}

// Add incident type interface and data after the mockIncidentData array
interface IncidentTypeData {
  code: string;
  type: string;
  count: number;
  description: string;
}

// Add type for graph type
type GraphType = 'value' | 'quantity' | 'type';

import { 
  getIncidentsByCustomer, 
  getIncidentStatsByCustomer, 
  getIncidentTrendData,
  mockIncidents,
  MOCK_INCIDENTS,
  type IncidentRecord,
  type MockIncident
} from '@/data/mockIncidents';

interface IncidentGraphProps {
  customerId?: string;
  customerName?: string;
}

// Update color palette for better 3D effect with more vibrant colors
const colorPalette = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f97316', // Orange
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#f43f5e', // Rose
  '#facc15', // Yellow
  '#14b8a6', // Teal
];

// Comprehensive incident code colors for all application incident types
const actionCodeColors: Record<string, string> = {
  // Primary incident types
  'TH01': '#ef4444', // Red for Theft
  'SB02': '#8b5cf6', // Purple for Suspicious Behaviour
  'ASB03': '#6366f1', // Indigo for Anti-Social Behaviour
  'DT04': '#10b981', // Green for Deter
  'AR05': '#dc2626', // Dark Red for Arrest
  'SST06': '#06b6d4', // Cyan for Self Scan Tills
  'UP07': '#f59e0b', // Amber for Underage Purchase
  'CD08': '#f97316', // Orange for Criminal Damage
  'CCF09': '#ec4899', // Pink for Credit Card Fraud
  'VB10': '#b91c1c', // Dark Red for Violent Behaviour
  'AB11': '#f43f5e', // Rose for Abusive Behaviour
  'SG12': '#14b8a6', // Teal for Scan and Go
  'TI13': '#7c3aed', // Violet for Threats and Intimidation
  'BFS14': '#4f46e5', // Indigo for Ban from Store
  'PI15': '#0d9488', // Teal for Police Involvement
  'SP16': '#db2777', // Pink for Spitting
  'PFA17': '#059669', // Emerald for Police Failed to Attend
  'OT18': '#64748b', // Slate for Others
};

// Customer-specific regions are now loaded dynamically from incident data

const IncidentGraph: React.FC<IncidentGraphProps> = ({ customerId, customerName }) => {
  console.log('Component rendering with customer:', customerId);

  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [graphType, setGraphType] = useState<GraphType>('value')
  const [officerType, setOfficerType] = useState('all')
  const [timeFilter, setTimeFilter] = useState('ytd')
  const [data, setData] = useState<IncidentData[]>([])
  const [totalSaved, setTotalSaved] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredTotal, setFilteredTotal] = useState(0)
  const [customerIncidents, setCustomerIncidents] = useState<IncidentRecord[]>([])
  const [customerStats, setCustomerStats] = useState<any>(null)
  const [incidentTypeData, setIncidentTypeData] = useState<IncidentTypeData[]>([])
  const [customerRegions, setCustomerRegions] = useState<Array<{id: string, name: string}>>([])

  // Smart pagination state
  const [adaptiveStoresPerPage, setAdaptiveStoresPerPage] = useState(20);

  // Helper function to get comprehensive incidents for customer
  const getComprehensiveIncidentsForCustomer = useCallback((customerId: string): IncidentRecord[] => {
    // Use MOCK_INCIDENTS which has proper region structure
    return MOCK_INCIDENTS.filter(incident => incident.customerId === customerId);
  }, []);

  // Helper function to get customer-specific regions from MOCK_INCIDENTS data  
  const getCustomerRegionsFromIncidents = useCallback((customerId: string): Array<{id: string, name: string}> => {
    const customerIncidents = getIncidentsByCustomer(customerId);
    
    // Extract unique regions for this customer
    const uniqueRegions = customerIncidents.reduce((acc, incident) => {
      const regionKey = incident.regionId;
      if (!acc.some(r => r.id === regionKey)) {
        acc.push({
          id: regionKey,
          name: incident.regionName
        });
      }
      return acc;
    }, [] as Array<{id: string, name: string}>);
    
    return uniqueRegions.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Helper function to convert IncidentRecord to IncidentData format
  const convertIncidentRecordToChartData = useCallback((incidents: IncidentRecord[]): IncidentData[] => {
    // Group incidents by site/location to aggregate data
    const groupedBySite = incidents.reduce((acc, incident) => {
      const key = incident.siteName;
      if (!acc[key]) {
        acc[key] = {
          location: incident.siteName,
          valueRecovered: 0,
          quantityRecovered: 0,
          uniformOfficer: 0,
          storeDetective: 0,
          uniformQuantity: 0,
          detectiveQuantity: 0,
          total: 0,
          regionName: incident.regionName,
          incidents: []
        };
      }
      
      acc[key].valueRecovered += incident.valueRecovered || 0;
      acc[key].quantityRecovered += incident.quantityRecovered || 0;
      
      // Categorize officer types based on actual officer role
      if (incident.officerRole === 'Security Officer' || incident.officerRole === 'Senior Security Officer') {
        acc[key].uniformOfficer += incident.valueRecovered || 0;
        acc[key].uniformQuantity += incident.quantityRecovered || 0;
      } else if (incident.officerRole === 'Store Detective' || incident.officerRole === 'Senior Store Detective') {
        acc[key].storeDetective += incident.valueRecovered || 0;
        acc[key].detectiveQuantity += incident.quantityRecovered || 0;
      } else {
        // For other roles, use consistent distribution based on incident ID + site
        const incidentNumber = parseInt(incident.id.replace(/\D/g, '')) || 0;
        const siteHash = incident.siteName.length;
        const combinedHash = (incidentNumber + siteHash) % 3;
        const isUniformOfficer = combinedHash === 0 || combinedHash === 1;
        
        if (isUniformOfficer) {
          acc[key].uniformOfficer += incident.valueRecovered || 0;
          acc[key].uniformQuantity += incident.quantityRecovered || 0;
        } else {
          acc[key].storeDetective += incident.valueRecovered || 0;
          acc[key].detectiveQuantity += incident.quantityRecovered || 0;
        }
      }
      
      acc[key].total = acc[key].valueRecovered;
      acc[key].incidents.push(incident);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedBySite);
  }, []);

  // Legacy function for IncidentRecord format (keeping for compatibility)
  const convertIncidentToChartData = useCallback((incidents: IncidentRecord[]): IncidentData[] => {
    // Group incidents by site/location to aggregate data
    const groupedBySite = incidents.reduce((acc, incident) => {
      const key = incident.siteName;
      if (!acc[key]) {
        acc[key] = {
          location: incident.siteName,
          valueRecovered: 0,
          quantityRecovered: 0,
          uniformOfficer: 0,
          storeDetective: 0,
          uniformQuantity: 0,
          detectiveQuantity: 0,
          total: 0,
          regionName: incident.regionName,
          incidents: []
        };
      }
      
      acc[key].valueRecovered += incident.valueRecovered || 0;
      acc[key].quantityRecovered += incident.quantityRecovered || 0;
      
      // Categorize officer types based on role
      if (incident.officerRole === 'Security Officer' || incident.officerRole === 'Senior Security Officer') {
        acc[key].uniformOfficer += incident.valueRecovered || 0;
        // Add quantity breakdown for uniform officers
        if (!acc[key].uniformQuantity) acc[key].uniformQuantity = 0;
        acc[key].uniformQuantity += incident.quantityRecovered || 0;
      } else if (incident.officerRole === 'Store Detective' || incident.officerRole === 'Senior Store Detective') {
        acc[key].storeDetective += incident.valueRecovered || 0;
        // Add quantity breakdown for store detectives
        if (!acc[key].detectiveQuantity) acc[key].detectiveQuantity = 0;
        acc[key].detectiveQuantity += incident.quantityRecovered || 0;
      }
      
      acc[key].total = acc[key].valueRecovered;
      acc[key].incidents.push(incident);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedBySite);
  }, []);

  // Helper function to generate incident type data from IncidentRecord
  const generateIncidentRecordTypeData = useCallback((incidents: IncidentRecord[]): IncidentTypeData[] => {
    const typeCount = incidents.reduce((acc, incident) => {
      const type = incident.incidentType;
      const code = incident.incidentCode;
      
      if (!acc[code]) {
        acc[code] = {
          code,
          type,
          count: 0,
          description: `${type} incidents`
        };
      }
      acc[code].count += 1;
      return acc;
    }, {} as Record<string, IncidentTypeData>);

    return Object.values(typeCount).sort((a, b) => b.count - a.count);
  }, []);

  // Legacy function for IncidentRecord format (keeping for compatibility)
  const generateIncidentTypeData = useCallback((incidents: IncidentRecord[]): IncidentTypeData[] => {
    const typeCount = incidents.reduce((acc, incident) => {
      const type = incident.incidentType;
      const code = incident.incidentCode;
      
      if (!acc[code]) {
        acc[code] = {
          code,
          type,
          count: 0,
          description: `${type} incidents`
        };
      }
      acc[code].count += 1;
      return acc;
    }, {} as Record<string, IncidentTypeData>);

    return Object.values(typeCount).sort((a, b) => b.count - a.count);
  }, []);

  // Load customer-specific incident data
  useEffect(() => {
    console.log('Component mounted, loading data for customer:', customerId);
    console.log('Customer ID type:', typeof customerId);
    
    if (customerId) {
      // Get comprehensive customer-specific incidents from mockIncidents dataset
      const comprehensiveIncidents = getComprehensiveIncidentsForCustomer(customerId);
      
      console.log('=== COMPREHENSIVE INCIDENT GRAPH DEBUG ===');
      console.log('Customer ID passed:', customerId);
      console.log('Comprehensive incidents loaded:', comprehensiveIncidents.length);
      console.log('Sample comprehensive incident:', comprehensiveIncidents[0]);
      console.log('All comprehensive incidents:', comprehensiveIncidents.map(i => ({ 
        id: i.id, 
        customerName: i.customerName,
        siteName: i.siteName,
        dateReported: i.dateReported,
        valueRecovered: i.valueRecovered,
        incidentType: i.incidentType
      })));
      
      // Calculate comprehensive stats
      const comprehensiveStats = {
        totalIncidents: comprehensiveIncidents.length,
        totalValueRecovered: comprehensiveIncidents.reduce((sum, inc) => sum + (inc.valueRecovered || 0), 0),
        totalQuantityRecovered: comprehensiveIncidents.reduce((sum, inc) => sum + (inc.quantityRecovered || 0), 0),
        uniqueStores: [...new Set(comprehensiveIncidents.map(inc => inc.siteName))].length
      };
      
      // Debug the chart data conversion
      const debugChartData = convertIncidentRecordToChartData(comprehensiveIncidents);
      console.log('Chart data after conversion:', debugChartData.length, 'items');
      console.log('Chart data sample:', debugChartData[0]);
      
      // Debug the incident type data
      const debugTypeData = generateIncidentRecordTypeData(comprehensiveIncidents);
      console.log('Incident type data:', debugTypeData);
      console.log('=== END COMPREHENSIVE DEBUG ===');
      
      // Store the comprehensive data (IncidentRecord format is already compatible)
      setCustomerIncidents(comprehensiveIncidents);
      setCustomerStats(comprehensiveStats);
      setTotalSaved(comprehensiveStats.totalValueRecovered);
      
      // Load customer-specific regions from MOCK_INCIDENTS data
      const regions = getCustomerRegionsFromIncidents(customerId);
      setCustomerRegions(regions);
      console.log('Customer regions loaded:', regions);
      
      // Convert incidents to chart data format
      const chartData = convertIncidentRecordToChartData(comprehensiveIncidents);
      setData(chartData);
      
      // Generate incident type data
      const typeData = generateIncidentRecordTypeData(comprehensiveIncidents);
      setIncidentTypeData(typeData);
      
      // Set default date range to show all data initially if not already set
      if (!startDate) {
        // Don't filter by date initially - show all data
        const oldestDate = new Date('2025-01-01');
        const newestDate = new Date('2025-12-31');
        setStartDate(oldestDate);
        setEndDate(newestDate);
        console.log('Set default date range:', oldestDate, 'to', newestDate);
      }
      
      console.log('Chart data generated:', chartData.length, 'sites');
      console.log('Incident types:', typeData.length);
    } else {
      // If no customer ID, show empty state or default message
      setData([]);
      setIncidentTypeData([]);
      setTotalSaved(0);
      console.log('No customer ID provided');
    }

  }, [customerId, getComprehensiveIncidentsForCustomer, convertIncidentRecordToChartData, generateIncidentRecordTypeData])

  const getTimeFilteredData = useCallback((inputData: IncidentData[]): IncidentData[] => {
    console.log('getTimeFilteredData called with:', { 
      startDate, 
      endDate, 
      inputDataLength: inputData.length,
      sampleInputData: inputData[0] 
    });
    
    if (!startDate || !endDate) {
      console.log('No date range set, returning all data');
      return inputData;
    }
    
    // Filter based on actual incident dates from customer data
    return inputData.filter(item => {
      // Find incidents for this location and check their dates
      const siteIncidents = customerIncidents.filter(inc => inc.siteName === item.location);
      
      return siteIncidents.some(incident => {
        const incidentDate = new Date(incident.dateReported);
        return isWithinInterval(incidentDate, { start: startDate, end: endDate });
      });
    }).map(item => {
      // Recalculate values for the filtered time period
      const siteIncidents = customerIncidents.filter(inc => {
        if (inc.siteName !== item.location) return false;
        const incidentDate = new Date(inc.dateReported);
        return isWithinInterval(incidentDate, { start: startDate, end: endDate });
      });
      
      const filteredValueRecovered = siteIncidents.reduce((sum, inc) => sum + (inc.valueRecovered || 0), 0);
      const filteredQuantityRecovered = siteIncidents.reduce((sum, inc) => sum + (inc.quantityRecovered || 0), 0);
      
      return {
        ...item,
        valueRecovered: filteredValueRecovered,
        quantityRecovered: filteredQuantityRecovered,
        total: filteredValueRecovered
      };
    }).filter(item => item.total > 0);
  }, [startDate, endDate, customerIncidents]);

  // Memoize the filtered data calculation
  const filteredData = useMemo(() => {
    console.log('Recalculating filtered data');
    let timeFilteredData = getTimeFilteredData(data);

    let regionFilteredData = timeFilteredData;
    if (selectedRegion !== 'all') {
      regionFilteredData = timeFilteredData.filter(item => {
        // Find incidents for this location and check their region IDs
        const siteIncidents = customerIncidents.filter(inc => inc.siteName === item.location);
        return siteIncidents.some(incident => incident.regionId === selectedRegion);
      });
    }

    let result: FilteredData[];
    if (graphType === 'value') {
      result = regionFilteredData.map(item => ({
        location: item.location,
        value: officerType === 'uniform' ? item.uniformOfficer :
               officerType === 'detective' ? item.storeDetective :
               (item.uniformOfficer + item.storeDetective), // Sum both for "all"
        quantity: item.quantityRecovered
      }));
    } else {
      result = regionFilteredData.map(item => ({
        location: item.location,
        value: item.valueRecovered,
        quantity: officerType === 'uniform' ? (item.uniformQuantity || 0) :
                 officerType === 'detective' ? (item.detectiveQuantity || 0) :
                 ((item.uniformQuantity || 0) + (item.detectiveQuantity || 0)) // Fix: sum both for "all"
      }));
    }

    return result.sort((a, b) => 
      graphType === 'value' 
        ? (b.value - a.value)
        : (b.quantity - a.quantity)
    );
  }, [data, selectedRegion, officerType, getTimeFilteredData, graphType]);

  // Enhanced pagination logic for cleaner charts
  const getOptimalItemsPerPage = useCallback((dataLength: number) => {
    const screenWidth = window.innerWidth;
    
    // For incident types, show all on larger screens, limit on mobile
    if (graphType === 'type') {
      if (screenWidth < 640) return Math.min(6, dataLength); // Mobile: max 6 types
      if (screenWidth < 1024) return Math.min(10, dataLength); // Tablet: max 10 types
      return dataLength; // Desktop: show all types
    }
    
    // For location-based charts, be much less aggressive on larger screens
    let optimalCount;
    
    if (screenWidth < 640) {
      // Mobile: Keep conservative for readability
      optimalCount = dataLength > 6 ? 3 : dataLength;
    } else if (screenWidth < 768) {
      // Small tablet
      optimalCount = dataLength > 10 ? 5 : dataLength;
    } else if (screenWidth < 1024) {
      // Tablet: Show more data
      optimalCount = dataLength > 16 ? 8 : dataLength;
    } else if (screenWidth < 1280) {
      // Small desktop: Show most data
      optimalCount = dataLength > 24 ? 12 : dataLength;
    } else if (screenWidth < 1920) {
      // Desktop: Show almost all data (up to 18 bars)
      optimalCount = dataLength > 36 ? 18 : dataLength;
    } else {
      // Large desktop: Show all data (up to 24+ bars)
      optimalCount = dataLength > 48 ? 24 : dataLength;
    }
    
    // For small datasets (like single customer = 16 sites), show all on desktop
    if (dataLength <= 16 && screenWidth >= 1024) {
      return dataLength;
    }
    
    // For medium datasets (like 48 sites total), show most on large screens
    if (dataLength <= 48 && screenWidth >= 1280) {
      return dataLength;
    }
    
    return Math.min(optimalCount, dataLength);
  }, [graphType]);

  // Update stores per page when screen size or data changes
  useEffect(() => {
    const updatePagination = () => {
      const optimal = getOptimalItemsPerPage(filteredData.length);
      setAdaptiveStoresPerPage(optimal);
      
      // Reset to first page if current page would be empty
      const maxPage = Math.ceil(filteredData.length / optimal);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(1);
      }
    };
    
    updatePagination();
    
    // Add resize listener for responsive updates
    const handleResize = () => {
      updatePagination();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [filteredData.length, graphType, currentPage, getOptimalItemsPerPage]);

  // Memoize the paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * adaptiveStoresPerPage;
    const endIndex = startIndex + adaptiveStoresPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, adaptiveStoresPerPage]);

  // Consolidate time filter and date range updates
  const handleTimeFilterChange = useCallback((filter: string) => {
    console.log('handleTimeFilterChange called with:', filter);
    
    if (filter === 'custom') {
      setTimeFilter(filter);
      return;
    }

    const now = new Date();
    let newStartDate: Date;
    let newEndDate: Date = now;

    switch (filter) {
      case 'ytd':
        newStartDate = startOfYear(now);
        break;
      case 'month':
        newStartDate = startOfMonth(now);
        newEndDate = endOfMonth(now);
        break;
      case 'week':
        // Adjust to use the current week properly
        newStartDate = startOfWeek(now, { weekStartsOn: 1 });
        newEndDate = new Date(now); // Use current date as end date for current week
        break;
      default:
        return;
    }

    setTimeFilter(filter);
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, []);

  // Calculate total whenever filtered data changes
  useEffect(() => {
    console.log('=== FILTERED TOTAL CALCULATION DEBUG ===');
    console.log('useEffect triggered with graphType:', graphType);
    console.log('filteredData length:', filteredData.length);
    console.log('filteredData sample:', filteredData.slice(0, 2));
    
    if (graphType === 'type') {
      // For incident types, filter and sum up incident counts based on current filters
      let filteredIncidentTypes = [...incidentTypeData];
      
      // Apply time filtering to incident types if dates are set
      if (startDate && endDate) {
        const timeFilteredIncidents = customerIncidents.filter(incident => {
          const incidentDate = new Date(incident.dateReported);
          return isWithinInterval(incidentDate, { start: startDate, end: endDate });
        });
        
        // Recalculate type counts for filtered incidents
        const typeCount = timeFilteredIncidents.reduce((acc, incident) => {
          const code = incident.incidentCode;
          acc[code] = (acc[code] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        filteredIncidentTypes = incidentTypeData.map(item => ({
          ...item,
          count: typeCount[item.code] || 0
        })).filter(item => item.count > 0);
      }
      
      const total = filteredIncidentTypes.reduce((acc, item) => acc + item.count, 0);
      console.log('Type total calculated:', total);
      setFilteredTotal(total);
    } else {
      // For value/quantity, use the appropriate calculation based on graph type
      console.log('Calculating filteredTotal for graphType:', graphType);
      console.log('FilteredData length:', filteredData.length);
      console.log('FilteredData sample:', filteredData.slice(0, 3));
      
      const total = graphType === 'quantity' 
        ? filteredData.reduce((acc, item) => {
            console.log('Adding quantity:', item.quantity, 'from location:', item.location);
            return acc + item.quantity;
          }, 0)
        : filteredData.reduce((acc, item) => {
            console.log('Adding value:', item.value, 'from location:', item.location);
            return acc + item.value;
          }, 0);
        
      console.log('Calculated total:', total);
      setFilteredTotal(total);
    }
    console.log('=== END FILTERED TOTAL CALCULATION ===');
  }, [filteredData, graphType, incidentTypeData, customerIncidents, startDate, endDate]);

  const totalPages = Math.ceil(filteredData.length / adaptiveStoresPerPage);

  const renderGraph = () => {
    let chartData;
    let barName;
    
    // Return empty state if no customer data is available
    if (!customerId || customerIncidents.length === 0) {
      return (
        <div className="flex items-center justify-center h-96 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <div className="text-center">
            <h3 className="text-lg font-medium text-slate-300 mb-2">No Data Available</h3>
            <p className="text-slate-400">
              {!customerId ? 'Please select a customer to view incident data.' : 'No incidents found for this customer.'}
            </p>
          </div>
        </div>
      );
    }
    
    if (graphType === 'type') {
      // Filter incident data based on actual filters applied to real data
      let filteredIncidents = customerIncidents;
      
      // Apply time filtering using actual incident dates
      if (startDate && endDate) {
        filteredIncidents = filteredIncidents.filter(incident => {
          const incidentDate = new Date(incident.dateReported);
          return isWithinInterval(incidentDate, { start: startDate, end: endDate });
        });
      }

      // Apply region filtering using actual region IDs
      if (selectedRegion !== 'all') {
        filteredIncidents = filteredIncidents.filter(incident => {
          return incident.regionId === selectedRegion;
        });
      }

      // Apply officer type filtering using actual officer role data
      if (officerType !== 'all') {
        filteredIncidents = filteredIncidents.filter(incident => {
          if (officerType === 'uniform') {
            return incident.officerRole === 'Security Officer' || incident.officerRole === 'Senior Security Officer';
          } else if (officerType === 'detective') {
            return incident.officerRole === 'Store Detective' || incident.officerRole === 'Senior Store Detective';
          }
          return true;
        });
      }

      // Generate type counts from filtered incidents
      const typeCount = filteredIncidents.reduce((acc, incident) => {
        const type = incident.incidentType;
        const code = incident.incidentCode;
        
        if (!acc[code]) {
          acc[code] = {
            code,
            type,
            count: 0,
            description: `${type} incidents`
          };
        }
        acc[code].count += 1;
        return acc;
      }, {} as Record<string, IncidentTypeData>);

      const filteredTypeData = Object.values(typeCount).sort((a, b) => b.count - a.count);

      chartData = filteredTypeData.map(item => ({
        name: item.type.length > 12 ? item.type.substring(0, 10) + '...' : item.type, // Truncate long names for better display
        code: item.code,
        count: item.count,
        originalCode: item.code,
        fullName: item.type // Keep the full name for tooltips
      }));
      barName = 'Incident Count';
    } else {
      // For location-based charts, truncate location names for better display on mobile
      chartData = paginatedData.map(item => ({
        location: window.innerWidth < 640 ? 
          (item.location.split(' - ')[0]) : // Just show store number on mobile
          (item.location.length > 20 ? item.location.substring(0, 18) + '...' : item.location),
        value: item.value,
        quantity: item.quantity,
        fullLocation: item.location // Keep the full location for tooltips
      }));
      // Set appropriate bar name based on graph type and officer filter
      if (graphType === 'value') {
        barName = officerType === 'uniform' ? 'Uniform Officer Value' :
                  officerType === 'detective' ? 'Store Detective Value' :
                  'Total Value Recovered';
      } else {
        barName = officerType === 'uniform' ? 'Items by Uniform Officers' :
                  officerType === 'detective' ? 'Items by Store Detectives' :
                  'Total Items Recovered';
      }
      

    }

    // Improve responsive calculations for container width
    const containerWidth = window.innerWidth < 640 ? window.innerWidth - 32 : // sm
                         window.innerWidth < 768 ? window.innerWidth - 48 : // md
                         window.innerWidth < 1024 ? window.innerWidth - 64 : // lg
                         window.innerWidth - 96; // xl and above

    // Adjust available width calculation for better mobile display
    const availableWidth = containerWidth - (window.innerWidth < 640 ? 60 : 
                                           window.innerWidth < 768 ? 80 : 120);

    // Adjust spacing for better mobile display
    const spacing = window.innerWidth < 640 ? 1.5 : 2; // Reduce spacing on mobile
    
    // Calculate maxBarsInView based on chart type and screen size
    const maxBarsInView = graphType === 'type' ? 
                         (window.innerWidth < 640 ? Math.min(8, chartData.length) : chartData.length) : 
                         paginatedData.length;
    
    // Adjust bar size calculations for mobile
    const minBarSize = Math.max(15, availableWidth / (window.innerWidth < 640 ? 80 : 100));
    const maxBarSize = Math.min(
      window.innerWidth < 640 ? 40 : 100, 
      availableWidth / (maxBarsInView * spacing)
    );
    
    // Adjust height calculations for better mobile display
    const baseHeight = window.innerWidth < 640 ? 250 : 
                     window.innerWidth < 768 ? 300 : 400;
    const maxHeight = window.innerWidth < 640 ? 400 : 
                     window.innerWidth < 768 ? 500 : 900;
    
    // Calculate dynamic height based on bar size and number of items
    const itemCount = chartData.length;
    const heightPerItem = maxBarSize * 2;
    const minHeight = Math.max(baseHeight, heightPerItem * itemCount / 2);
    const dynamicHeight = Math.min(maxHeight, minHeight);

    // Calculate optimal X-axis angle based on screen size and number of items
    const xAxisAngle = window.innerWidth < 640 ? 
                      (chartData.length > 5 ? -60 : -45) : 
                      (chartData.length > 10 ? -45 : -30);

    // Calculate optimal X-axis height based on screen size and label length
    const xAxisHeight = window.innerWidth < 640 ? 
                      (chartData.length > 5 ? 70 : 60) : 
                      window.innerWidth < 768 ? 
                        (chartData.length > 10 ? 90 : 80) : 
                        (chartData.length > 15 ? 110 : 100);

    const getBarFill = (entry: any, index: number) => {
      if (graphType === 'type' && entry.originalCode) {
        const color = actionCodeColors[entry.originalCode];
        return color || colorPalette[index % colorPalette.length]; // Fallback to palette if no color found
      }
      return colorPalette[index % colorPalette.length];
    };

    const formatValue = (value: number) => {
      if (graphType === 'value') {
        // Format currency values more compactly on mobile
        if (window.innerWidth < 640) {
          if (value >= 1000) {
            return `£${(value / 1000).toFixed(1)}k`;
          }
          return `£${Number(value).toFixed(0)}`;
        }
        return `£${Number(value).toFixed(0)}`;
      } else if (graphType === 'quantity') {
        // Format item quantities as plain numbers
        return `${Math.round(value)} items`;
      } else if (graphType === 'type') {
        // Format incident counts as plain numbers  
        return value.toString();
      }
      return value.toString();
    };

    // Create style tag for animations - simplified approach
    const animationClass = "animate-pulse-slow";

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-slate-900/90 dark:bg-slate-950/90 rounded-xl p-2 sm:p-4 md:p-6 lg:p-8 shadow-2xl border border-slate-800/50 relative overflow-hidden">
          {/* Add subtle background pattern for depth */}
          <div className="absolute inset-0 bg-grid-slate-800/20 [mask-image:linear-gradient(0deg,rgba(0,0,0,0.7),rgba(0,0,0,0.5))]"></div>
          
          {/* Add subtle glow effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-sm"></div>
          
          <div className="relative">
            {/* Add horizontal scrolling container for mobile */}
            <div className={cn(
              "w-full overflow-hidden",
              graphType !== 'type' && chartData.length > 5 && window.innerWidth < 640 ? 'overflow-x-auto pb-4' : ''
            )}>
              <div className={cn(
                "w-full",
                graphType !== 'type' && chartData.length > 5 && window.innerWidth < 640 ? 'min-w-[400px]' : ''
              )}>
                <ResponsiveContainer 
                  width="100%" 
                  height={window.innerWidth < 640 ? 300 : window.innerWidth < 1024 ? 400 : 500}
                  className="mt-4"
                >
                  <BarChart
                    data={chartData}
                    margin={{
                      top: window.innerWidth < 640 ? 15 : 20,
                      right: window.innerWidth < 640 ? 10 : window.innerWidth < 1024 ? 20 : 30,
                      left: window.innerWidth < 640 ? 35 : window.innerWidth < 1024 ? 50 : 60,
                      bottom: window.innerWidth < 640 ? 60 : window.innerWidth < 1024 ? 80 : 100
                    }}
                    barSize={window.innerWidth < 640 ? 25 : window.innerWidth < 1024 ? 35 : maxBarSize}
                    barGap={0}
                    barCategoryGap={window.innerWidth < 640 ? 15 : window.innerWidth < 1024 ? 25 : maxBarSize}
                  >
                    <defs>
                      {chartData.map((entry, index) => {
                        const baseColor = getBarFill(entry, index);
                        // Create unique gradient IDs for each bar
                        return (
                          <React.Fragment key={index}>
                            {/* Front face gradient - more vibrant with enhanced shading */}
                            <linearGradient id={`frontGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={baseColor} stopOpacity={1} />
                              <stop offset="45%" stopColor={baseColor} stopOpacity={0.95} />
                              <stop offset="100%" stopColor={baseColor} stopOpacity={0.85} />
                            </linearGradient>
                            
                            {/* Right side face gradient - darker with enhanced depth */}
                            <linearGradient id={`sideGradient${index}`} x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor={baseColor} stopOpacity={0.7} />
                              <stop offset="40%" stopColor={baseColor} stopOpacity={0.5} />
                              <stop offset="100%" stopColor={baseColor} stopOpacity={0.3} />
                            </linearGradient>
                            
                            {/* Top face gradient - lighter with enhanced highlight */}
                            <linearGradient id={`topGradient${index}`} x1="0" y1="1" x2="1" y2="0">
                              <stop offset="0%" stopColor={baseColor} stopOpacity={1} />
                              <stop offset="40%" stopColor={baseColor} stopOpacity={0.95} />
                              <stop offset="100%" stopColor={baseColor} stopOpacity={1} />
                            </linearGradient>
                            
                            {/* Reflection gradient that uses the bar's own color instead of white */}
                            <linearGradient id={`reflectionGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={baseColor} stopOpacity={0.2} />
                              <stop offset="20%" stopColor={baseColor} stopOpacity={0.1} />
                              <stop offset="100%" stopColor={baseColor} stopOpacity={0} />
                            </linearGradient>
                          </React.Fragment>
                        );
                      })}
                      
                      {/* Enhanced shadow filter */}
                      <filter id="shadow" filterUnits="userSpaceOnUse">
                        <feDropShadow dx="4" dy="6" stdDeviation="5" floodOpacity="0.3" floodColor="#000000" />
                      </filter>
                      
                      {/* Glow filter for hover effect - using blue instead of white */}
                      <filter id="glow" filterUnits="userSpaceOnUse">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feFlood floodColor="#3b82f6" floodOpacity="0.3" result="color" />
                        <feComposite in="color" in2="blur" operator="in" result="glow" />
                        <feMerge>
                          <feMergeNode in="glow" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Enhanced grid with subtle animation - removed animation class */}
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="rgba(255,255,255,0.1)"
                      vertical={false}
                    />
                    
                    <XAxis 
                      dataKey={graphType === 'type' ? 'name' : 'location'}
                      angle={window.innerWidth < 640 ? -45 : window.innerWidth < 1024 ? -30 : -20}
                      textAnchor="end"
                      height={window.innerWidth < 640 ? 50 : window.innerWidth < 1024 ? 60 : 80}
                      interval={0}
                      tick={{ 
                        fontSize: window.innerWidth < 640 ? 8 : 
                                 window.innerWidth < 1024 ? 10 : 12,
                        fill: '#E2E8F0',
                        fontWeight: 500,
                        dy: window.innerWidth < 640 ? 2 : 3
                      }}
                      axisLine={{ stroke: '#475569' }}
                      tickLine={{ stroke: '#475569' }}
                    />
                    
                    <YAxis 
                      label={{ 
                        value: graphType === 'type' ? 'Number of Incidents' : 
                               graphType === 'value' ? 'Amount Recovered (£)' : 
                               'Number of Items',
                        angle: -90,
                        position: 'insideLeft',
                        offset: window.innerWidth < 640 ? -25 : 
                                window.innerWidth < 1024 ? -35 : -45,
                        fill: '#94A3B8',
                        fontSize: window.innerWidth < 640 ? 8 : 
                                 window.innerWidth < 1024 ? 10 : 12,
                        fontWeight: 500
                      }}
                      tickFormatter={formatValue}
                      tick={{ 
                        fontSize: window.innerWidth < 640 ? 8 : 
                                 window.innerWidth < 1024 ? 10 : 12,
                        fill: '#94A3B8',
                        fontWeight: 500
                      }}
                      axisLine={{ stroke: '#475569' }}
                      tickLine={{ stroke: '#475569' }}
                    />
                    
                    {/* Enhanced tooltip with glass effect */}
                    <Tooltip 
                      formatter={(val: any, name: string, props: any) => {
                        if (graphType === 'type') {
                          // Show full name in tooltip
                          const fullName = props.payload.fullName || props.payload.name;
                          return [`${val} incidents`, fullName];
                        }
                        // Show full location in tooltip
                        const fullLocation = props.payload.fullLocation || props.payload.location;
                        return [formatValue(val), fullLocation];
                      }}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '8px',
                        padding: '12px',
                        color: '#E2E8F0',
                        boxShadow: '0 4px 20px -1px rgba(0, 0, 0, 0.4), 0 2px 10px -1px rgba(0, 0, 0, 0.3)'
                      }}
                      itemStyle={{
                        padding: '4px 0',
                        color: '#E2E8F0'
                      }}
                      labelStyle={{
                        fontWeight: 600,
                        marginBottom: '6px',
                        color: '#F8FAFC'
                      }}
                    />
                    
                    <Legend 
                      wrapperStyle={{
                        paddingTop: window.innerWidth < 640 ? '10px' : '20px',
                        fontSize: window.innerWidth < 640 ? '10px' : 'inherit'
                      }}
                      formatter={(value) => <span style={{ 
                        color: '#94A3B8', 
                        fontWeight: 500,
                        fontSize: window.innerWidth < 640 ? '10px' : 'inherit'
                      }}>{value}</span>}
                      iconSize={window.innerWidth < 640 ? 8 : 10}
                      iconType="circle"
                    />
                    
                    <Bar 
                      dataKey={graphType === 'type' ? 'count' : graphType === 'value' ? 'value' : 'quantity'}
                      name={barName}
                      radius={[0, 0, 0, 0]}
                      style={{
                        transform: 'perspective(1500px) rotateY(0deg) rotateX(0deg)',
                        transformOrigin: 'center',
                        filter: 'url(#shadow)',
                        transition: 'all 0.3s ease'
                      }}
                      minPointSize={0}
                      shape={(props) => {
                        const { x, y, width, height, index } = props;
                        // Adjust depth for mobile screens
                        const depth = width * (window.innerWidth < 640 ? 0.15 : 0.2);
                        const topHeight = depth * 0.5;
                        
                        return (
                          <g className="bar-group" style={{ transition: 'all 0.3s ease' }}>
                            {/* Right side face */}
                            <path 
                              d={`
                                M ${x + width} ${y}
                                l ${depth} ${-topHeight}
                                l 0 ${height}
                                l ${-depth} ${depth * 0.3}
                                Z
                              `}
                              fill={`url(#sideGradient${index})`}
                              className="side-face"
                              style={{ transition: 'all 0.3s ease' }}
                            />
                            
                            {/* Top face */}
                            <path 
                              d={`
                                M ${x} ${y}
                                l ${width} 0
                                l ${depth} ${-topHeight}
                                l ${-width} 0
                                Z
                              `}
                              fill={`url(#topGradient${index})`}
                              className="top-face"
                              style={{ transition: 'all 0.3s ease' }}
                            />
                            
                            {/* Front face */}
                            <path 
                              d={`
                                M ${x} ${y}
                                l ${width} 0
                                l 0 ${height}
                                l ${-width} 0
                                Z
                              `}
                              fill={`url(#frontGradient${index})`}
                              className="front-face"
                              style={{ transition: 'all 0.3s ease' }}
                            />
                            
                            {/* Reflection overlay */}
                            <path 
                              d={`
                                M ${x} ${y}
                                l ${width} 0
                                l 0 ${height * 0.3}
                                l ${-width} 0
                                Z
                              `}
                              fill={`url(#reflectionGradient${index})`}
                              className="reflection"
                              style={{ transition: 'all 0.3s ease' }}
                            />
                          </g>
                        );
                      }}
                      onMouseOver={(data, index) => {
                        // Add hover effect using CSS but without the white glow
                        document.querySelectorAll('.bar-group').forEach((el, i) => {
                          if (i === index) {
                            // Just scale the bar slightly without adding the glow filter
                            el.setAttribute('transform', 'scale(1.03)');
                            
                            // Add a subtle shadow effect instead of the white glow
                            const paths = el.querySelectorAll('path');
                            paths.forEach(path => {
                              path.style.filter = 'brightness(1.2)';
                            });
                          }
                        });
                      }}
                      onMouseOut={(data, index) => {
                        // Remove hover effect
                        document.querySelectorAll('.bar-group').forEach((el) => {
                          el.setAttribute('transform', 'scale(1)');
                          
                          // Reset the brightness
                          const paths = el.querySelectorAll('path');
                          paths.forEach(path => {
                            path.style.filter = 'none';
                          });
                        });
                      }}
                    >
                      <LabelList 
                        dataKey={graphType === 'type' ? 'count' : graphType === 'value' ? 'value' : 'quantity'}
                        position="top"
                        offset={window.innerWidth < 640 ? 5 : 
                                window.innerWidth < 1024 ? 8 : 12}
                        formatter={formatValue}
                        style={{ 
                          fontSize: window.innerWidth < 640 ? '8px' : 
                                   window.innerWidth < 1024 ? '10px' : '12px',
                          fill: '#FFFFFF',
                          fontWeight: 600,
                          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Action Codes Legend - Compact Version */}
        {graphType === 'type' && chartData.length > 0 && (
          <Card className="relative overflow-hidden bg-slate-800/80 border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
            <CardContent className="relative p-2 sm:p-4">
              <h3 className="text-sm sm:text-base font-medium text-slate-100 mb-2 text-center">
                Incident Type Reference
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 sm:gap-2 bg-slate-700/50 rounded-lg p-2 border border-slate-600/50">
                {/* Comprehensive incident types for the application */}
                {[
                  { code: 'TH01', type: 'Theft' },
                  { code: 'SB02', type: 'Suspicious Behaviour' },
                  { code: 'ASB03', type: 'Anti-Social Behaviour' },
                  { code: 'DT04', type: 'Deter' },
                  { code: 'AR05', type: 'Arrest' },
                  { code: 'SST06', type: 'Self Scan Tills' },
                  { code: 'UP07', type: 'Underage Purchase' },
                  { code: 'CD08', type: 'Criminal Damage' },
                  { code: 'CCF09', type: 'Credit Card Fraud' },
                  { code: 'VB10', type: 'Violent Behaviour' },
                  { code: 'AB11', type: 'Abusive Behaviour' },
                  { code: 'SG12', type: 'Scan and Go' },
                  { code: 'TI13', type: 'Threats and Intimidation' },
                  { code: 'BFS14', type: 'Ban from Store' },
                  { code: 'PI15', type: 'Police Involvement' },
                  { code: 'SP16', type: 'Spitting' },
                  { code: 'PFA17', type: 'Police Failed to Attend' },
                  { code: 'OT18', type: 'Others' }
                ].map((item) => (
                  <div 
                    key={item.code}
                    className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-md bg-slate-800/60 border border-slate-600/30 hover:bg-slate-700/60 transition-colors min-w-0"
                    title={item.type} // Show full name on hover
                  >
                    <div 
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm shadow-sm flex-shrink-0"
                      style={{ backgroundColor: actionCodeColors[item.code] }}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-100 block">
                        {item.code}
                      </span>
                      {/* Mobile/Small screens: Show truncated version */}
                      <span className="text-[8px] sm:text-[10px] text-slate-300 block truncate md:hidden">
                        {item.type.length > 10 ? item.type.substring(0, 8) + '...' : item.type}
                      </span>
                      {/* Medium screens: Show slightly longer version */}
                      <span className="text-[10px] text-slate-300 block truncate hidden md:block lg:hidden">
                        {item.type.length > 14 ? item.type.substring(0, 12) + '...' : item.type}
                      </span>
                      {/* Large screens and up: Show full names */}
                      <span className="text-[10px] text-slate-300 block hidden lg:block">
                        {item.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
                             <div className="mt-2 text-center">
                 <p className="text-[10px] sm:text-xs text-slate-400">
                   All available incident types • Hover for full names • Colors match chart
                 </p>
               </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Smart Pagination - Always show when there's data */}
        {filteredData.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center text-slate-300 gap-3 sm:gap-0">
                <div className="text-xs sm:text-sm text-center sm:text-left">
                  <div className="font-medium">
                    {graphType === 'type' ? (
                      `Showing ${incidentTypeData.length} incident types`
                    ) : (
                      `Showing stores ${((currentPage - 1) * adaptiveStoresPerPage) + 1} to ${Math.min(currentPage * adaptiveStoresPerPage, filteredData.length)} of ${filteredData.length}`
                    )}
                  </div>
                  <div className="text-slate-400 mt-1">
                    {graphType === 'type' ? (
                      'All incident types displayed'
                    ) : (
                      `${adaptiveStoresPerPage} stores per page (${totalPages} total pages) - optimized for screen size`
                    )}
                  </div>
                  {/* Screen size info for user reference */}
                  <div className="text-slate-500 text-xs mt-1">
                    Optimized for {typeof window !== 'undefined' && window.innerWidth >= 1920 ? 'large desktop' :
                      typeof window !== 'undefined' && window.innerWidth >= 1280 ? 'desktop' :
                      typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'laptop' :
                      typeof window !== 'undefined' && window.innerWidth >= 768 ? 'tablet' : 'mobile'} display
                  </div>
                </div>
                
                {/* Show pagination controls for location-based charts with multiple pages */}
                {graphType !== 'type' && totalPages > 1 && (
                  <div className="flex gap-1 sm:gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="text-xs sm:text-sm border-slate-700 hover:bg-slate-800 text-slate-300 h-8 px-2 sm:px-3"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1 sm:gap-2">
                      {Array.from({ length: Math.min(window.innerWidth < 640 ? 3 : 5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            onClick={() => setCurrentPage(pageNum)}
                            className={cn(
                              "w-6 h-6 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm",
                              currentPage === pageNum 
                                ? "bg-indigo-500 hover:bg-indigo-600 text-white" 
                                : "border-slate-700 hover:bg-slate-800 text-slate-300"
                            )}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      {totalPages > (window.innerWidth < 640 ? 3 : 5) && (
                        <>
                          <span className="text-slate-500">...</span>
                          <Button
                            variant={currentPage === totalPages ? "default" : "outline"}
                            onClick={() => setCurrentPage(totalPages)}
                            className={cn(
                              "w-6 h-6 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm",
                              currentPage === totalPages 
                                ? "bg-indigo-500 hover:bg-indigo-600 text-white" 
                                : "border-slate-700 hover:bg-slate-800 text-slate-300"
                            )}
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="text-xs sm:text-sm border-slate-700 hover:bg-slate-800 text-slate-300 h-8 px-2 sm:px-3"
                    >
                      Next
                    </Button>
                  </div>
                )}
                
                {/* Show simple navigation for single page or incident types */}
                {(graphType === 'type' || totalPages <= 1) && (
                  <div className="flex gap-1 sm:gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Force show more data by reducing adaptiveStoresPerPage
                        if (graphType !== 'type') {
                          setAdaptiveStoresPerPage(Math.max(2, Math.floor(adaptiveStoresPerPage / 2)));
                        }
                      }}
                      className="text-xs sm:text-sm border-slate-700 hover:bg-slate-800 text-slate-300 h-8 px-2 sm:px-3"
                      disabled={graphType === 'type' || adaptiveStoresPerPage <= 2}
                    >
                      Show Less Per Page
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Show all data on one page
                        if (graphType !== 'type') {
                          setAdaptiveStoresPerPage(filteredData.length);
                        }
                      }}
                      className="text-xs sm:text-sm border-slate-700 hover:bg-slate-800 text-slate-300 h-8 px-2 sm:px-3"
                    >
                      {graphType === 'type' ? 'All Types Shown' : 'Show All Stores'}
                    </Button>
                    {/* Manual pagination controls for single page scenarios */}
                    {graphType !== 'type' && filteredData.length > 3 && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setAdaptiveStoresPerPage(3)}
                          className="text-xs sm:text-sm border-slate-700 hover:bg-slate-800 text-slate-300 h-8 px-2 sm:px-3"
                        >
                          3 per page
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setAdaptiveStoresPerPage(5)}
                          className="text-xs sm:text-sm border-slate-700 hover:bg-slate-800 text-slate-300 h-8 px-2 sm:px-3"
                        >
                          5 per page
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const getTotalSavedTitle = () => {
    const officerTypeText = officerType === 'all' 
      ? 'All Officers'
      : officerType === 'uniform'
        ? 'Uniform Officers'
        : 'Store Detectives';

    const periodText = timeFilter === 'ytd'
      ? 'Year to Date'
      : timeFilter === 'month'
        ? 'Current Month'
        : timeFilter === 'week'
          ? 'Current Week'
          : 'Selected Period';

    const regionText = selectedRegion === 'all'
      ? 'All Regions'
      : customerRegions.find(r => r.id === selectedRegion)?.name || 'Selected Region';

    if (graphType === 'type') {
      return `Total Incidents by ${officerTypeText} (${regionText}) - ${periodText}`;
    } else if (graphType === 'quantity') {
      return `Total Items Recovered by ${officerTypeText} (${regionText}) - ${periodText}`;
    }
    return `Total Value Recovered by ${officerTypeText} (${regionText}) - ${periodText}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-3 sm:p-4 md:p-8 backdrop-blur-sm border border-white/10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Incident Analytics Dashboard
              </h1>
              <p className="text-slate-400 mt-1 sm:mt-2 text-sm sm:text-base md:text-lg">
                Track and analyze security incidents across locations
              </p>
            </div>
            <div className="bg-slate-800/80 p-3 sm:p-4 md:p-6 rounded-xl border border-white/10 w-full lg:w-auto">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-200">
                {getTotalSavedTitle()}
              </h2>
              <p className="text-xl sm:text-2xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent mt-1 sm:mt-2">
                {graphType === 'type' ? `${filteredTotal} Incidents` :
                 graphType === 'quantity' ? `${Math.round(filteredTotal)} Items` :
                 `£${filteredTotal.toFixed(2)}`}
              </p>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="relative overflow-hidden bg-slate-900/90 border-slate-800">
          <CardHeader className="py-2 px-3 sm:px-4">
            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-slate-200">
              Filters & Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-4 md:px-6">
            <div className="grid gap-3 sm:gap-4 md:gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-6">
                <div className="sm:col-span-1 lg:col-span-4 space-y-2 sm:space-y-3">
                  <div>
                    <Label className="text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2 block">Region</Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 h-8 sm:h-10 text-xs sm:text-sm">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-xs sm:text-sm">
                        <SelectItem value="all">All Regions</SelectItem>
                        {customerRegions.map(region => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2 block">Graph Type</Label>
                    <RadioGroup
                      defaultValue="value"
                      value={graphType}
                      onValueChange={(value: GraphType) => setGraphType(value)}
                      className="flex flex-wrap gap-2 sm:gap-3"
                    >
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <RadioGroupItem value="value" id="value" className="h-3 w-3 sm:h-4 sm:w-4 border-slate-700 text-indigo-500" />
                        <Label htmlFor="value" className="text-xs sm:text-sm text-slate-300">Value Recovered</Label>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <RadioGroupItem value="quantity" id="quantity" className="h-3 w-3 sm:h-4 sm:w-4 border-slate-700 text-indigo-500" />
                        <Label htmlFor="quantity" className="text-xs sm:text-sm text-slate-300">Items Recovered</Label>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <RadioGroupItem value="type" id="type" className="h-3 w-3 sm:h-4 sm:w-4 border-slate-700 text-indigo-500" />
                        <Label htmlFor="type" className="text-xs sm:text-sm text-slate-300">Action Types</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <div className="sm:col-span-1 lg:col-span-5 space-y-2 sm:space-y-3">
                  <div>
                    <Label className="text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2 block">Time Period</Label>
                    <RadioGroup
                      defaultValue="ytd"
                      value={timeFilter}
                      onValueChange={handleTimeFilterChange}
                      className="grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-1 sm:gap-y-2"
                    >
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <RadioGroupItem value="ytd" id="ytd" className="h-3 w-3 sm:h-4 sm:w-4 border-slate-700 text-indigo-500" />
                        <Label htmlFor="ytd" className="text-xs sm:text-sm text-slate-300">Year to Date</Label>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <RadioGroupItem value="month" id="month" className="h-3 w-3 sm:h-4 sm:w-4 border-slate-700 text-indigo-500" />
                        <Label htmlFor="month" className="text-xs sm:text-sm text-slate-300">Current Month</Label>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <RadioGroupItem value="week" id="week" className="h-3 w-3 sm:h-4 sm:w-4 border-slate-700 text-indigo-500" />
                        <Label htmlFor="week" className="text-xs sm:text-sm text-slate-300">Current Week</Label>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <RadioGroupItem value="custom" id="custom" className="h-3 w-3 sm:h-4 sm:w-4 border-slate-700 text-indigo-500" />
                        <Label htmlFor="custom" className="text-xs sm:text-sm text-slate-300">Custom Range</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {timeFilter === 'custom' && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <DatePicker
                        date={startDate}
                        setDate={setStartDate}
                        placeholder="Start date"
                      />
                      <DatePicker
                        date={endDate}
                        setDate={setEndDate}
                        placeholder="End date"
                      />
                    </div>
                  )}
                </div>
                <div className="sm:col-span-2 lg:col-span-3 space-y-2 sm:space-y-3">
                  <div>
                    <Label className="text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2 block">Officer Type</Label>
                    <RadioGroup
                      defaultValue="all"
                      value={officerType}
                      onValueChange={setOfficerType}
                      className="flex flex-col gap-1 sm:gap-2"
                    >
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <RadioGroupItem value="all" id="all" className="h-3 w-3 sm:h-4 sm:w-4 border-slate-700 text-indigo-500" />
                        <Label htmlFor="all" className="text-xs sm:text-sm text-slate-300">All Officers</Label>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <RadioGroupItem value="uniform" id="uniform" className="h-3 w-3 sm:h-4 sm:w-4 border-slate-700 text-indigo-500" />
                        <Label htmlFor="uniform" className="text-xs sm:text-sm text-slate-300">Uniform Officers</Label>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <RadioGroupItem value="detective" id="detective" className="h-3 w-3 sm:h-4 sm:w-4 border-slate-700 text-indigo-500" />
                        <Label htmlFor="detective" className="text-xs sm:text-sm text-slate-300">Store Detectives</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button 
                    onClick={() => {
                      console.log('Fetching data with filters:', {
                        startDate,
                        endDate,
                        selectedRegion,
                        graphType,
                        officerType,
                        timeFilter
                      })
                    }}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white transition-colors h-8 sm:h-10 text-xs sm:text-sm"
                  >
                    Update Graph
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Graph Card */}
        <Card className="relative overflow-hidden bg-slate-900/90 border-slate-800">
          <CardHeader className="py-2 px-3 sm:px-4">
            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-slate-200">
              {graphType === 'type' ? (
                `${selectedRegion === 'all' ? 'All Regions' : customerRegions.find(r => r.id === selectedRegion)?.name || 'Selected Region'} - Incident Types Distribution`
              ) : (
                `${selectedRegion === 'all' ? 'All Regions - ' : `${customerRegions.find(r => r.id === selectedRegion)?.name || 'Selected Region'} - `}
                ${officerType === 'all' ? 'Total Incidents by Location' :
                 officerType === 'uniform' ? 'Uniform Officer Incidents' :
                 'Store Detective Incidents'}`
              )}
            </CardTitle>
            {startDate && endDate && (
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Period: {format(startDate, 'PP')} - {format(endDate, 'PP')}
              </p>
            )}
          </CardHeader>
          <CardContent className="relative px-2 sm:px-4">
            <div className="bg-slate-800/50 rounded-lg p-2 sm:p-4 md:p-6 border border-slate-700/50">
              {renderGraph()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default IncidentGraph 