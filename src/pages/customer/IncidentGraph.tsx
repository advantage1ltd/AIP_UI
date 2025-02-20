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

// Update color palette for better 3D effect
const colorPalette = [
  '#2563eb', // Primary Blue
  '#4f46e5', // Indigo
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
];

// Update action code colors for better distinction
const actionCodeColors: Record<string, string> = {
  'A': '#FF4444', // Bright Red for Arrests
  'B': '#33B5E5', // Bright Blue for Deterrent
  'C': '#AA66CC', // Purple for Theft
  'D': '#FFBB33', // Orange for Criminal Damage
  'E': '#00C851', // Green for Fraud
  'F': '#FF8800', // Dark Orange for Suspicious
  'G': '#2BBBAD', // Teal for Underage
  'H': '#4285F4', // Royal Blue for Anti-Social
  'I': '#ff6b6b', // Coral for Other
  'J': '#5E35B1', // Deep Purple for Self Scan
  'K': '#FB3640', // Red-Orange for Abusive
  'L': '#FF4081', // Pink for Threats
  'M': '#00BCD4', // Cyan for Spitting
  'N': '#673AB7', // Deep Purple for Bans
  'O': '#E53935', // Deep Red for Violent
  'P': '#26A69A', // Teal for Scan and Go
  'Q': '#3949AB', // Indigo for Police
  'R': '#EC407A'  // Pink for Failed Police
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
  const storesPerPage = 20
  const [filteredTotal, setFilteredTotal] = useState(0)

  // Add logging for initial mount
  useEffect(() => {
    console.log('Component mounted');
    // Calculate total saved
    const total = mockIncidentData.reduce((acc, curr) => acc + curr.valueRecovered, 0)
    setTotalSaved(total)
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
        const filterFactor = timeFilter === 'week' ? 0.8 : // Increased from 0.2 to 0.8 to show more data for current week
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
        name: item.type,
        code: item.code,
        count: item.count,
        originalCode: item.code
      }));
      barName = 'Incident Count';
    } else {
      chartData = paginatedData;
      barName = officerType === 'uniform' ? 'Uniform Officer' :
                officerType === 'detective' ? 'Store Detective' :
                'Total Value';
    }

    // Calculate container width based on screen size
    const containerWidth = window.innerWidth < 640 ? window.innerWidth - 48 : // sm
                         window.innerWidth < 768 ? window.innerWidth - 64 : // md
                         window.innerWidth < 1024 ? window.innerWidth - 96 : // lg
                         window.innerWidth - 128; // xl and above

    // Calculate available width for bars (accounting for margins and axes)
    const availableWidth = containerWidth - (window.innerWidth < 768 ? 100 : 140);

    // Calculate optimal bar size based on number of items and available width
    const itemCount = chartData.length;
    const maxBarsInView = graphType === 'type' ? incidentTypeData.length : paginatedData.length;
    
    // Calculate bar size with spacing consideration
    const spacing = 2; // Space between bars as a multiplier
    const calculatedBarSize = (availableWidth / maxBarsInView) / spacing;
    
    // Set minimum and maximum bar sizes based on number of items
    const minBarSize = Math.max(20, availableWidth / 100);
    const maxBarSize = Math.min(100, availableWidth / (maxBarsInView * spacing));
    
    // Final bar size calculation with bounds
    const dynamicBarSize = Math.max(
      minBarSize,
      Math.min(
        maxBarSize,
        calculatedBarSize
      )
    );

    // Calculate dynamic height based on bar size and number of items
    const baseHeight = window.innerWidth < 768 ? 300 : 400;
    const heightPerItem = dynamicBarSize * 2;
    const minHeight = Math.max(baseHeight, heightPerItem * maxBarsInView / 2);
    const maxHeight = window.innerWidth < 768 ? 500 : 900;
    
    const dynamicHeight = Math.min(maxHeight, minHeight);

    const getBarFill = (entry: any, index: number) => {
      if (graphType === 'type' && entry.originalCode) {
        return actionCodeColors[entry.originalCode];
      }
      return colorPalette[index % colorPalette.length];
    };

    const formatValue = (value: number) => {
      if (graphType === 'value') {
        return `£${Number(value).toFixed(0)}`;
      }
      return value.toString();
    };

    return (
      <div className="space-y-6">
        <div className="bg-slate-900/90 dark:bg-slate-950/90 rounded-xl p-2 sm:p-4 md:p-6 shadow-2xl border border-slate-800/50">
          <ResponsiveContainer width="100%" height={dynamicHeight}>
            <BarChart
              data={chartData}
              margin={{
                top: 30,
                right: window.innerWidth < 768 ? 20 : 40,
                left: window.innerWidth < 768 ? 60 : 80,
                bottom: window.innerWidth < 768 ? 80 : 100
              }}
              barSize={dynamicBarSize}
              barGap={0}
              barCategoryGap={dynamicBarSize / 2}
            >
              <defs>
                {chartData.map((entry, index) => {
                  const baseColor = getBarFill(entry, index);
                  // Create unique gradient IDs for each bar
                  return (
                    <React.Fragment key={index}>
                      {/* Front face gradient - more vibrant with subtle shading */}
                      <linearGradient id={`frontGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={baseColor} stopOpacity={1} />
                        <stop offset="45%" stopColor={baseColor} stopOpacity={0.95} />
                        <stop offset="100%" stopColor={baseColor} stopOpacity={0.85} />
                      </linearGradient>
                      {/* Right side face gradient - darker with depth */}
                      <linearGradient id={`sideGradient${index}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={baseColor} stopOpacity={0.7} />
                        <stop offset="40%" stopColor={baseColor} stopOpacity={0.6} />
                        <stop offset="100%" stopColor={baseColor} stopOpacity={0.4} />
                      </linearGradient>
                      {/* Top face gradient - lighter with highlight */}
                      <linearGradient id={`topGradient${index}`} x1="0" y1="1" x2="1" y2="0">
                        <stop offset="0%" stopColor={baseColor} stopOpacity={0.9} />
                        <stop offset="40%" stopColor={baseColor} stopOpacity={0.85} />
                        <stop offset="100%" stopColor={baseColor} stopOpacity={0.95} />
                      </linearGradient>
                    </React.Fragment>
                  );
                })}
                <filter id="shadow">
                  <feDropShadow dx="3" dy="6" stdDeviation="4" floodOpacity="0.25" />
                </filter>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.1)"
                vertical={false}
              />
              <XAxis 
                dataKey={graphType === 'type' ? 'name' : 'location'}
                angle={-45}
                textAnchor="end"
                height={window.innerWidth < 768 ? 80 : 100}
                interval={0}
                tick={{ 
                  fontSize: window.innerWidth < 768 ? 
                    (chartData.length > 10 ? 8 : 10) : 
                    (chartData.length > 10 ? 11 : 12),
                  fill: '#E2E8F0' 
                }}
                axisLine={{ stroke: '#475569' }}
              />
              <YAxis 
                label={{ 
                  value: graphType === 'type' ? 'Number of Incidents' : 
                         graphType === 'value' ? 'Amount Recovered (£)' : 
                         'Number of Items',
                  angle: -90,
                  position: 'insideLeft',
                  offset: window.innerWidth < 768 ? -45 : -60,
                  fill: '#94A3B8',
                  fontSize: window.innerWidth < 768 ? 12 : 14
                }}
                tickFormatter={formatValue}
                tick={{ 
                  fontSize: window.innerWidth < 768 ? 10 : 12,
                  fill: '#94A3B8' 
                }}
                axisLine={{ stroke: '#475569' }}
              />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  if (graphType === 'type') {
                    return [`${value} incidents`, name];
                  }
                  return [formatValue(value), name];
                }}
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#E2E8F0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
                }}
              />
              <Legend 
                wrapperStyle={{
                  paddingTop: '20px'
                }}
                formatter={(value) => <span style={{ color: '#94A3B8' }}>{value}</span>}
              />
              <Bar 
                dataKey={graphType === 'type' ? 'count' : graphType === 'value' ? 'value' : 'quantity'}
                name={barName}
                radius={[0, 0, 0, 0]}
                style={{
                  transform: 'perspective(1500px) rotateY(-22deg) rotateX(8deg)',
                  transformOrigin: 'center',
                  filter: 'url(#shadow)'
                }}
                minPointSize={0}
                shape={(props) => {
                  const { x, y, width, height, index } = props;
                  const depth = width * 0.35; // Optimized depth for better proportion
                  const topHeight = depth * 0.5; // Height of the top face slope
                  
                  return (
                    <g>
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
                      />
                    </g>
                  );
                }}
              >
                <LabelList 
                  dataKey={graphType === 'type' ? 'count' : graphType === 'value' ? 'value' : 'quantity'}
                  position="top"
                  offset={10}
                  formatter={formatValue}
                  style={{ 
                    fontSize: chartData.length > 10 ? '10px' : '12px',
                    fill: '#FFFFFF',
                    fontWeight: 600,
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Action Codes Legend */}
        {graphType === 'type' && (
          <Card className="relative overflow-hidden bg-slate-800/80 border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
            <CardContent className="relative p-6">
              <h3 className="text-lg font-medium text-slate-100 mb-4 text-center">
                Action Codes Reference
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-3 bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                {incidentTypeData.map((item) => (
                  <div 
                    key={item.code}
                    className="flex items-center gap-2 p-2 rounded-md bg-slate-800/60 border border-slate-600/30 hover:bg-slate-700/60 transition-colors"
                  >
                    <div 
                      className="w-3 h-3 rounded-sm shadow-sm flex-shrink-0"
                      style={{ backgroundColor: actionCodeColors[item.code] }}
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-slate-100">
                        {item.code}
                      </span>
                      <span className="text-[10px] text-slate-300 block truncate max-w-[100px]">
                        {item.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination - Keep only this instance */}
        {graphType !== 'type' && (
          <div className="flex justify-between items-center px-4 text-slate-300">
            <div className="text-sm">
              Showing stores {((currentPage - 1) * storesPerPage) + 1} to {Math.min(currentPage * storesPerPage, data.length)} of {data.length}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-sm border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-8 h-8 p-0 text-sm",
                        currentPage === pageNum 
                          ? "bg-indigo-500 hover:bg-indigo-600 text-white" 
                          : "border-slate-700 hover:bg-slate-800 text-slate-300"
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-slate-500">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      onClick={() => setCurrentPage(totalPages)}
                      className={cn(
                        "w-8 h-8 p-0 text-sm",
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
                className="text-sm border-slate-700 hover:bg-slate-800 text-slate-300"
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
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-8 backdrop-blur-sm border border-white/10">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm -z-10" />
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Incident Analytics Dashboard
              </h1>
              <p className="text-slate-400 mt-2 text-lg">
                Track and analyze security incidents across locations
              </p>
            </div>
            <div className="bg-slate-800/80 p-6 rounded-xl border border-white/10">
              <h2 className="text-xl font-semibold text-slate-200">
                {getTotalSavedTitle()}
              </h2>
              <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent mt-2">
                {graphType === 'type' ? (
                  `${filteredTotal} Incidents`
                ) : (
                  `£${filteredTotal.toFixed(2)}`
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="relative overflow-hidden bg-slate-900/90 border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
          <CardHeader className="relative pb-2">
            <CardTitle className="text-xl font-semibold text-slate-200">
              Filters & Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="relative pt-0">
            <div className="grid gap-4">
              {/* Main Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Section - Region and Graph Type */}
                <div className="md:col-span-4 space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-300 mb-2 block">Region</Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
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
                    <Label className="text-sm font-medium text-slate-300 mb-2 block">Graph Type</Label>
                    <RadioGroup
                      defaultValue="value"
                      value={graphType}
                      onValueChange={(value: GraphType) => setGraphType(value)}
                      className="flex flex-wrap gap-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="value" id="value" className="border-slate-700 text-indigo-500" />
                        <Label htmlFor="value" className="text-sm text-slate-300">Value Recovered</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="quantity" id="quantity" className="border-slate-700 text-indigo-500" />
                        <Label htmlFor="quantity" className="text-sm text-slate-300">Items Recovered</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="type" id="type" className="border-slate-700 text-indigo-500" />
                        <Label htmlFor="type" className="text-sm text-slate-300">Action Types</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Center Section - Time Period Controls */}
                <div className="md:col-span-5 space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-300 mb-2 block">Time Period</Label>
                    <RadioGroup
                      defaultValue="ytd"
                      value={timeFilter}
                      onValueChange={handleTimeFilterChange}
                      className="grid grid-cols-2 gap-x-4 gap-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ytd" id="ytd" className="border-slate-700 text-indigo-500" />
                        <Label htmlFor="ytd" className="text-sm text-slate-300">Year to Date</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="month" id="month" className="border-slate-700 text-indigo-500" />
                        <Label htmlFor="month" className="text-sm text-slate-300">Current Month</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="week" id="week" className="border-slate-700 text-indigo-500" />
                        <Label htmlFor="week" className="text-sm text-slate-300">Current Week</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom" className="border-slate-700 text-indigo-500" />
                        <Label htmlFor="custom" className="text-sm text-slate-300">Custom Range</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {timeFilter === 'custom' && (
                    <div className="flex gap-3">
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

                {/* Right Section - Officer Type and Action Button */}
                <div className="md:col-span-3 space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-300 mb-2 block">Officer Type</Label>
                    <RadioGroup
                      defaultValue="all"
                      value={officerType}
                      onValueChange={setOfficerType}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" className="border-slate-700 text-indigo-500" />
                        <Label htmlFor="all" className="text-sm text-slate-300">All Officers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="uniform" id="uniform" className="border-slate-700 text-indigo-500" />
                        <Label htmlFor="uniform" className="text-sm text-slate-300">Uniform Officers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="detective" id="detective" className="border-slate-700 text-indigo-500" />
                        <Label htmlFor="detective" className="text-sm text-slate-300">Store Detectives</Label>
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
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
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
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
          <CardHeader className="relative">
            <CardTitle className="text-2xl font-semibold text-slate-200">
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
              <p className="text-slate-400 mt-1">
                Period: {format(startDate, 'PPP')} - {format(endDate, 'PPP')}
              </p>
            )}
        </CardHeader>
          <CardContent className="relative">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
              {renderGraph()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default IncidentGraph 