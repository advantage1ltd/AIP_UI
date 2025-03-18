import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Cell } from 'recharts'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, format, subDays } from 'date-fns'
import { cn } from '@/lib/utils'

// Define types for the data
interface IncidentData {
  location: string;
  valueRecovered: number;
  quantityRecovered: number;
  uniformOfficer: number;
  storeDetective: number;
  total: number;
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

// Extended mock data with 50 stores and mixed values
const mockIncidentData: IncidentData[] = [
  { location: "Store 1 - London Central", valueRecovered: 5840.06, quantityRecovered: 42, uniformOfficer: 3562.04, storeDetective: 2278.02, total: 5840.06 },
  { location: "Store 2 - Manchester", valueRecovered: 4923.82, quantityRecovered: 38, uniformOfficer: 2868.94, storeDetective: 2054.88, total: 4923.82 },
  { location: "Store 3 - Birmingham", valueRecovered: 4516.45, quantityRecovered: 35, uniformOfficer: 2502.89, storeDetective: 2013.56, total: 4516.45 },
  { location: "Store 4 - Liverpool", valueRecovered: 4207.00, quantityRecovered: 33, uniformOfficer: 2458.08, storeDetective: 1748.92, total: 4207.00 },
  { location: "Store 5 - Leeds", valueRecovered: 3958.85, quantityRecovered: 31, uniformOfficer: 2120.45, storeDetective: 1838.40, total: 3958.85 },
  { location: "Store 6 - Glasgow", valueRecovered: 3876.32, quantityRecovered: 29, uniformOfficer: 2176.32, storeDetective: 1700.00, total: 3876.32 },
  { location: "Store 7 - Edinburgh", valueRecovered: 3745.15, quantityRecovered: 28, uniformOfficer: 2145.15, storeDetective: 1600.00, total: 3745.15 },
  { location: "Store 8 - Bristol", valueRecovered: 3589.99, quantityRecovered: 27, uniformOfficer: 1989.99, storeDetective: 1600.00, total: 3589.99 },
  { location: "Store 9 - Cardiff", valueRecovered: 3456.45, quantityRecovered: 26, uniformOfficer: 1856.45, storeDetective: 1600.00, total: 3456.45 },
  { location: "Store 10 - Newcastle", valueRecovered: 3323.78, quantityRecovered: 25, uniformOfficer: 1723.78, storeDetective: 1600.00, total: 3323.78 },
  { location: "Store 11 - Sheffield", valueRecovered: 3189.92, quantityRecovered: 24, uniformOfficer: 1889.92, storeDetective: 1300.00, total: 3189.92 },
  { location: "Store 12 - Nottingham", valueRecovered: 3045.63, quantityRecovered: 23, uniformOfficer: 1745.63, storeDetective: 1300.00, total: 3045.63 },
  { location: "Store 13 - Leicester", valueRecovered: 2912.28, quantityRecovered: 22, uniformOfficer: 1612.28, storeDetective: 1300.00, total: 2912.28 },
  { location: "Store 14 - Coventry", valueRecovered: 2789.15, quantityRecovered: 21, uniformOfficer: 1489.15, storeDetective: 1300.00, total: 2789.15 },
  { location: "Store 15 - Brighton", valueRecovered: 2667.82, quantityRecovered: 20, uniformOfficer: 1367.82, storeDetective: 1300.00, total: 2667.82 },
  { location: "Store 16 - Portsmouth", valueRecovered: 2534.46, quantityRecovered: 19, uniformOfficer: 1234.46, storeDetective: 1300.00, total: 2534.46 },
  { location: "Store 17 - Plymouth", valueRecovered: 2412.93, quantityRecovered: 18, uniformOfficer: 1112.93, storeDetective: 1300.00, total: 2412.93 },
  { location: "Store 18 - Southampton", valueRecovered: 2289.75, quantityRecovered: 17, uniformOfficer: 989.75, storeDetective: 1300.00, total: 2289.75 },
  { location: "Store 19 - Oxford", valueRecovered: 2167.21, quantityRecovered: 16, uniformOfficer: 867.21, storeDetective: 1300.00, total: 2167.21 },
  { location: "Store 20 - Cambridge", valueRecovered: 2045.88, quantityRecovered: 15, uniformOfficer: 745.88, storeDetective: 1300.00, total: 2045.88 },
  { location: "Store 21 - Reading", valueRecovered: 1925.88, quantityRecovered: 14, uniformOfficer: 925.88, storeDetective: 1000.00, total: 1925.88 },
  { location: "Store 22 - Swindon", valueRecovered: 1812.55, quantityRecovered: 13, uniformOfficer: 812.55, storeDetective: 1000.00, total: 1812.55 },
  { location: "Store 23 - Bath", valueRecovered: 1699.22, quantityRecovered: 12, uniformOfficer: 699.22, storeDetective: 1000.00, total: 1699.22 },
  { location: "Store 24 - Gloucester", valueRecovered: 1585.89, quantityRecovered: 11, uniformOfficer: 585.89, storeDetective: 1000.00, total: 1585.89 },
  { location: "Store 25 - Cheltenham", valueRecovered: 1472.56, quantityRecovered: 10, uniformOfficer: 472.56, storeDetective: 1000.00, total: 1472.56 },
  { location: "Store 26 - York", valueRecovered: 1359.23, quantityRecovered: 9, uniformOfficer: 659.23, storeDetective: 700.00, total: 1359.23 },
  { location: "Store 27 - Durham", valueRecovered: 1245.90, quantityRecovered: 8, uniformOfficer: 545.90, storeDetective: 700.00, total: 1245.90 },
  { location: "Store 28 - Chester", valueRecovered: 1132.57, quantityRecovered: 7, uniformOfficer: 432.57, storeDetective: 700.00, total: 1132.57 },
  { location: "Store 29 - Exeter", valueRecovered: 1019.24, quantityRecovered: 6, uniformOfficer: 319.24, storeDetective: 700.00, total: 1019.24 },
  { location: "Store 30 - Norwich", valueRecovered: 905.91, quantityRecovered: 5, uniformOfficer: 205.91, storeDetective: 700.00, total: 905.91 },
  { location: "Store 31 - Ipswich", valueRecovered: 892.58, quantityRecovered: 7, uniformOfficer: 392.58, storeDetective: 500.00, total: 892.58 },
  { location: "Store 32 - Lincoln", valueRecovered: 879.25, quantityRecovered: 6, uniformOfficer: 379.25, storeDetective: 500.00, total: 879.25 },
  { location: "Store 33 - Hull", valueRecovered: 865.92, quantityRecovered: 5, uniformOfficer: 365.92, storeDetective: 500.00, total: 865.92 },
  { location: "Store 34 - Preston", valueRecovered: 852.59, quantityRecovered: 4, uniformOfficer: 352.59, storeDetective: 500.00, total: 852.59 },
  { location: "Store 35 - Blackpool", valueRecovered: 839.26, quantityRecovered: 5, uniformOfficer: 339.26, storeDetective: 500.00, total: 839.26 },
  { location: "Store 36 - Lancaster", valueRecovered: 825.93, quantityRecovered: 4, uniformOfficer: 325.93, storeDetective: 500.00, total: 825.93 },
  { location: "Store 37 - Carlisle", valueRecovered: 812.60, quantityRecovered: 5, uniformOfficer: 312.60, storeDetective: 500.00, total: 812.60 },
  { location: "Store 38 - Worcester", valueRecovered: 799.27, quantityRecovered: 4, uniformOfficer: 299.27, storeDetective: 500.00, total: 799.27 },
  { location: "Store 39 - Hereford", valueRecovered: 785.94, quantityRecovered: 3, uniformOfficer: 285.94, storeDetective: 500.00, total: 785.94 },
  { location: "Store 40 - Shrewsbury", valueRecovered: 772.61, quantityRecovered: 4, uniformOfficer: 272.61, storeDetective: 500.00, total: 772.61 },
  { location: "Store 41 - Telford", valueRecovered: 759.28, quantityRecovered: 3, uniformOfficer: 459.28, storeDetective: 300.00, total: 759.28 },
  { location: "Store 42 - Stoke", valueRecovered: 745.95, quantityRecovered: 4, uniformOfficer: 445.95, storeDetective: 300.00, total: 745.95 },
  { location: "Store 43 - Derby", valueRecovered: 732.62, quantityRecovered: 3, uniformOfficer: 432.62, storeDetective: 300.00, total: 732.62 },
  { location: "Store 44 - Mansfield", valueRecovered: 719.29, quantityRecovered: 4, uniformOfficer: 419.29, storeDetective: 300.00, total: 719.29 },
  { location: "Store 45 - Grimsby", valueRecovered: 705.96, quantityRecovered: 3, uniformOfficer: 405.96, storeDetective: 300.00, total: 705.96 },
  { location: "Store 46 - Scunthorpe", valueRecovered: 692.63, quantityRecovered: 4, uniformOfficer: 392.63, storeDetective: 300.00, total: 692.63 },
  { location: "Store 47 - Doncaster", valueRecovered: 679.30, quantityRecovered: 3, uniformOfficer: 379.30, storeDetective: 300.00, total: 679.30 },
  { location: "Store 48 - Rotherham", valueRecovered: 665.97, quantityRecovered: 4, uniformOfficer: 365.97, storeDetective: 300.00, total: 665.97 },
  { location: "Store 49 - Barnsley", valueRecovered: 652.64, quantityRecovered: 3, uniformOfficer: 352.64, storeDetective: 300.00, total: 652.64 },
  { location: "Store 50 - Wakefield", valueRecovered: 639.31, quantityRecovered: 4, uniformOfficer: 339.31, storeDetective: 300.00, total: 639.31 }
];

const incidentTypeData: IncidentTypeData[] = [
  { code: 'A', type: 'Arrest', count: 15, description: 'Arrests made' },
  { code: 'B', type: 'Deter', count: 87, description: 'Deterrent actions' },
  { code: 'C', type: 'Theft', count: 28, description: 'Theft incidents' },
  { code: 'D', type: 'Criminal Damage', count: 12, description: 'Property damage incidents' },
  { code: 'E', type: 'Credit Card Fraud', count: 8, description: 'Credit card fraud cases' },
  { code: 'F', type: 'Suspicious Behaviour', count: 7, description: 'Suspicious behavior reports' },
  { code: 'G', type: 'Underage Purchase', count: 2, description: 'Underage purchase attempts' },
  { code: 'H', type: 'Anti-Social Behaviour', count: 3, description: 'Anti-social behavior incidents' },
  { code: 'I', type: 'Other', count: 2, description: 'Other incidents' },
  { code: 'J', type: 'Self Scan Till', count: 35, description: 'Self-scan till incidents' },
  { code: 'K', type: 'Abusive Behaviour', count: 23, description: 'Abusive behavior incidents' },
  { code: 'L', type: 'Threats And Intimidation', count: 20, description: 'Threats and intimidation cases' },
  { code: 'M', type: 'Spitting', count: 5, description: 'Spitting incidents' },
  { code: 'N', type: 'Ban From Store', count: 109, description: 'Store bans issued' },
  { code: 'O', type: 'Violent Behaviour', count: 22, description: 'Violent behavior incidents' },
  { code: 'P', type: 'Scan And Go', count: 8, description: 'Scan and go incidents' },
  { code: 'Q', type: 'Police Involvement', count: 39, description: 'Cases requiring police involvement' },
  { code: 'R', type: 'Police Failed to Attend', count: 3, description: 'Police non-attendance cases' }
];

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

// Update action code colors for better distinction and vibrancy
const actionCodeColors: Record<string, string> = {
  'A': '#ef4444', // Red for Arrests
  'B': '#3b82f6', // Blue for Deterrent
  'C': '#8b5cf6', // Purple for Theft
  'D': '#f97316', // Orange for Criminal Damage
  'E': '#10b981', // Green for Fraud
  'F': '#f59e0b', // Amber for Suspicious
  'G': '#14b8a6', // Teal for Underage
  'H': '#6366f1', // Indigo for Anti-Social
  'I': '#f43f5e', // Rose for Other
  'J': '#7c3aed', // Violet for Self Scan
  'K': '#dc2626', // Red for Abusive
  'L': '#ec4899', // Pink for Threats
  'M': '#06b6d4', // Cyan for Spitting
  'N': '#7c3aed', // Violet for Bans
  'O': '#b91c1c', // Dark Red for Violent
  'P': '#0d9488', // Teal for Scan and Go
  'Q': '#4f46e5', // Indigo for Police
  'R': '#db2777'  // Pink for Failed Police
};

// Define regions and their stores
const regionDefinitions = {
  north: ['Manchester', 'Leeds', 'Newcastle', 'Sheffield', 'York', 'Durham', 'Hull', 'Preston', 'Blackpool', 'Lancaster', 'Carlisle', 'Grimsby', 'Scunthorpe', 'Doncaster', 'Rotherham', 'Barnsley', 'Wakefield'],
  south: ['London', 'Brighton', 'Portsmouth', 'Plymouth', 'Southampton', 'Oxford', 'Reading', 'Swindon', 'Bath'],
  east: ['Norwich', 'Ipswich', 'Cambridge', 'Lincoln', 'Leicester', 'Coventry', 'Derby', 'Mansfield'],
  west: ['Liverpool', 'Bristol', 'Cardiff', 'Gloucester', 'Cheltenham', 'Chester', 'Worcester', 'Hereford', 'Shrewsbury', 'Telford', 'Stoke'],
  midlands: ['Birmingham', 'Nottingham', 'Leicester', 'Coventry', 'Derby', 'Stoke', 'Wolverhampton']
};

// Add type for graph type
type GraphType = 'value' | 'quantity' | 'type';

const IncidentGraph = () => {
  console.log('Component rendering');

  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [graphType, setGraphType] = useState<GraphType>('value')
  const [officerType, setOfficerType] = useState('all')
  const [timeFilter, setTimeFilter] = useState('ytd')
  const [data, setData] = useState<IncidentData[]>(mockIncidentData)
  const [totalSaved, setTotalSaved] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [storesPerPage, setStoresPerPage] = useState(20)
  const [filteredTotal, setFilteredTotal] = useState(0)

  // Add logging for initial mount
  useEffect(() => {
    console.log('Component mounted');
    // Calculate total saved
    const total = mockIncidentData.reduce((acc, curr) => acc + curr.valueRecovered, 0)
    setTotalSaved(total)
    
    // Set responsive storesPerPage based on screen size
    const handleResize = () => {
      if (window.innerWidth < 640) { // Mobile
        setStoresPerPage(5);
      } else if (window.innerWidth < 1024) { // Tablet/iPad
        setStoresPerPage(10);
      } else { // Desktop
        setStoresPerPage(20);
      }
    };
    
    // Initial call
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [])

  const getTimeFilteredData = useCallback((inputData: IncidentData[]): IncidentData[] => {
    console.log('getTimeFilteredData called with dates:', { startDate, endDate });
    if (!startDate || !endDate) return inputData;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return inputData.map(item => {
      const mockDate = new Date();
      const dayOffset = Math.floor(Math.random() * 365);
      mockDate.setDate(mockDate.getDate() - dayOffset);
      
      if (mockDate >= start && mockDate <= end) {
        return item;
      }
      
      return {
        ...item,
        valueRecovered: 0,
        quantityRecovered: 0,
        uniformOfficer: 0,
        storeDetective: 0,
        total: 0
      };
    }).filter(item => item.total > 0);
  }, [startDate, endDate]);

  // Memoize the filtered data calculation
  const filteredData = useMemo(() => {
    console.log('Recalculating filtered data');
    let timeFilteredData = getTimeFilteredData(data);

    let regionFilteredData = timeFilteredData;
    if (selectedRegion !== 'all') {
      regionFilteredData = timeFilteredData.filter(item => {
        const locationName = item.location.toLowerCase();
        return regionDefinitions[selectedRegion as keyof typeof regionDefinitions].some(
          city => locationName.includes(city.toLowerCase())
        );
      });
    }

    let result: FilteredData[];
    if (graphType === 'value') {
      result = regionFilteredData.map(item => ({
        location: item.location,
        value: officerType === 'uniform' ? item.uniformOfficer :
               officerType === 'detective' ? item.storeDetective :
               item.valueRecovered,
        quantity: item.quantityRecovered
      }));
    } else {
      result = regionFilteredData.map(item => ({
        location: item.location,
        value: item.valueRecovered,
        quantity: officerType === 'uniform' ? Math.floor(item.quantityRecovered * 0.6) :
                 officerType === 'detective' ? Math.floor(item.quantityRecovered * 0.4) :
                 item.quantityRecovered
      }));
    }

    return result.sort((a, b) => 
      graphType === 'value' 
        ? (b.value - a.value)
        : (b.quantity - a.quantity)
    );
  }, [data, selectedRegion, officerType, getTimeFilteredData, graphType]);

  // Memoize the paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * storesPerPage;
    const endIndex = startIndex + storesPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, storesPerPage]);

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
    if (graphType === 'type') {
      // For incident types, sum up all incident counts
      const total = incidentTypeData.reduce((acc, item) => acc + item.count, 0);
      setFilteredTotal(total);
    } else {
      // For value/quantity, use the existing calculation
      const total = filteredData.reduce((acc, item) => acc + item.value, 0);
      setFilteredTotal(total);
    }
  }, [filteredData, graphType, incidentTypeData]);

  const totalPages = Math.ceil(data.length / storesPerPage);

  const renderGraph = () => {
    let chartData;
    let barName;
    
    if (graphType === 'type') {
      // Filter incident data based on time period
      let filteredIncidents = [...incidentTypeData];
      
      // Apply mock time filtering (in real app, this would use actual dates)
      if (timeFilter !== 'all') {
        const filterFactor = timeFilter === 'week' ? 0.8 : 
                           timeFilter === 'month' ? 0.5 : 0.8;
        
        filteredIncidents = incidentTypeData.map(item => ({
          ...item,
          count: Math.max(1, Math.floor(item.count * filterFactor)) // Ensure at least 1 incident is shown
        }));
      }

      // Apply region filtering (mock implementation)
      if (selectedRegion !== 'all') {
        const regionFactor = 0.5; // Increased from 0.3 to 0.5 to show more data
        filteredIncidents = filteredIncidents.map(item => ({
          ...item,
          count: Math.max(1, Math.floor(item.count * regionFactor)) // Ensure at least 1 incident is shown
        }));
      }

      // Apply officer type filtering (mock implementation)
      if (officerType !== 'all') {
        const officerFactor = officerType === 'uniform' ? 0.7 : 0.5; // Adjusted factors
        filteredIncidents = filteredIncidents.map(item => ({
          ...item,
          count: Math.max(1, Math.floor(item.count * officerFactor)) // Ensure at least 1 incident is shown
        }));
      }

      chartData = filteredIncidents.map(item => ({
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
      barName = officerType === 'uniform' ? 'Uniform Officer' :
                officerType === 'detective' ? 'Store Detective' :
                'Total Value';
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
                         (window.innerWidth < 640 ? Math.min(8, incidentTypeData.length) : incidentTypeData.length) : 
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
        return actionCodeColors[entry.originalCode];
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

        {/* Action Codes Legend - Enhanced with better styling */}
        {graphType === 'type' && (
          <Card className="relative overflow-hidden bg-slate-800/80 border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
            <CardContent className="relative p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-slate-100 mb-2 sm:mb-4 text-center">
                Action Codes Reference
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2 sm:gap-3 bg-slate-700/50 rounded-lg p-2 sm:p-4 border border-slate-600/50 overflow-x-auto">
                {incidentTypeData.map((item) => (
                  <div 
                    key={item.code}
                    className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-md bg-slate-800/60 border border-slate-600/30 hover:bg-slate-700/60 transition-colors"
                  >
                    <div 
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm shadow-sm flex-shrink-0"
                      style={{ backgroundColor: actionCodeColors[item.code] }}
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-xs font-medium text-slate-100">
                        {item.code}
                      </span>
                      <span className="text-[8px] sm:text-[10px] text-slate-300 block truncate max-w-[80px] sm:max-w-[100px]">
                        {item.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination - Make more responsive */}
        {graphType !== 'type' && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-2 sm:px-4 text-slate-300 gap-2 sm:gap-0">
            <div className="text-xs sm:text-sm text-center sm:text-left">
              Showing stores {((currentPage - 1) * storesPerPage) + 1} to {Math.min(currentPage * storesPerPage, data.length)} of {data.length}
              {window.innerWidth < 768 && <span className="ml-1">(10 per page on mobile)</span>}
            </div>
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
          </div>
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
      : `${selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)} Region`;

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
                {graphType === 'type' ? `${filteredTotal} Incidents` : `£${filteredTotal.toFixed(2)}`}
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
                        <SelectItem value="north">North Region</SelectItem>
                        <SelectItem value="south">South Region</SelectItem>
                        <SelectItem value="east">East Region</SelectItem>
                        <SelectItem value="west">West Region</SelectItem>
                        <SelectItem value="midlands">Midlands Region</SelectItem>
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
                `${selectedRegion === 'all' ? 'All Regions' : `${selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)} Region`} - Incident Types Distribution`
              ) : (
                `${selectedRegion === 'all' ? 'All Regions - ' : `${selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)} Region - `}
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