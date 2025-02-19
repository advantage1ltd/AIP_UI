import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Cell } from 'recharts'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, format, subDays } from 'date-fns'

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
  { code: 'A', type: 'Arrest', count: 0, description: 'Arrests made' },
  { code: 'B', type: 'Deter', count: 87, description: 'Deterrent actions' },
  { code: 'C', type: 'Theft', count: 28, description: 'Theft incidents' },
  { code: 'D', type: 'Criminal Damage', count: 0, description: 'Property damage incidents' },
  { code: 'E', type: 'Credit Card Fraud', count: 1, description: 'Credit card fraud cases' },
  { code: 'F', type: 'Suspicious Behaviour', count: 7, description: 'Suspicious behavior reports' },
  { code: 'G', type: 'Underage Purchase', count: 2, description: 'Underage purchase attempts' },
  { code: 'H', type: 'Anti-Social Behaviour', count: 3, description: 'Anti-social behavior incidents' },
  { code: 'I', type: 'Other', count: 2, description: 'Other incidents' },
  { code: 'J', type: 'Self Scan Till', count: 35, description: 'Self-scan till incidents' },
  { code: 'K', type: 'Abusive Behaviour', count: 23, description: 'Abusive behavior incidents' },
  { code: 'L', type: 'Threats And Intimidation', count: 20, description: 'Threats and intimidation cases' },
  { code: 'M', type: 'Spitting', count: 0, description: 'Spitting incidents' },
  { code: 'N', type: 'Ban From Store', count: 109, description: 'Store bans issued' },
  { code: 'O', type: 'Violent Behaviour', count: 22, description: 'Violent behavior incidents' },
  { code: 'P', type: 'Scan And Go', count: 8, description: 'Scan and go incidents' },
  { code: 'Q', type: 'Police Involvement', count: 39, description: 'Cases requiring police involvement' },
  { code: 'R', type: 'Police Failed to Attend', count: 3, description: 'Police non-attendance cases' }
];

// Add color palette for bars
const colorPalette = [
  '#4F46E5', // Indigo
  '#7C3AED', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#D946EF', // Fuchsia
  '#F43F5E', // Rose
];

// Add action codes color mapping after the colorPalette
const actionCodeColors: Record<string, string> = {
  'A': '#00ff00', // Green
  'B': '#ffa500', // Orange
  'C': '#ff0000', // Red
  'D': '#000000', // Black
  'E': '#808080', // Gray
  'F': '#00ffff', // Cyan
  'G': '#ffff00', // Yellow
  'H': '#0000ff', // Blue
  'I': '#4b0082', // Indigo
  'J': '#800080', // Purple
  'K': '#8b4513', // Brown
  'L': '#ff69b4', // Pink
  'M': '#4169e1', // Royal Blue
  'N': '#32cd32', // Lime Green
  'O': '#ff4500', // Orange Red
  'P': '#9400d3', // Dark Violet
  'Q': '#ffd700', // Gold
  'R': '#dc143c', // Crimson
};

// Define regions and their stores
const regionDefinitions = {
  north: ['Manchester', 'Leeds', 'Newcastle', 'Sheffield', 'York', 'Durham', 'Hull', 'Preston', 'Blackpool', 'Lancaster', 'Carlisle', 'Grimsby', 'Scunthorpe', 'Doncaster', 'Rotherham', 'Barnsley', 'Wakefield'],
  south: ['London', 'Brighton', 'Portsmouth', 'Plymouth', 'Southampton', 'Oxford', 'Reading', 'Swindon', 'Bath'],
  east: ['Norwich', 'Ipswich', 'Cambridge', 'Lincoln', 'Leicester', 'Coventry', 'Derby', 'Mansfield'],
  west: ['Liverpool', 'Bristol', 'Cardiff', 'Gloucester', 'Cheltenham', 'Chester', 'Worcester', 'Hereford', 'Shrewsbury', 'Telford', 'Stoke'],
  midlands: ['Birmingham', 'Nottingham', 'Leicester', 'Coventry', 'Derby', 'Stoke', 'Wolverhampton']
};

// Add custom legend component after the actionCodeColors
const ActionCodesLegend = () => {
  return (
    <Card className="relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900 border border-white/40 dark:border-white/10 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-transparent to-indigo-100/10 dark:from-blue-900/10 dark:to-indigo-900/10" />
      <CardContent className="relative p-4">
        <h3 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-3 text-center">
          Action Codes Reference
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2 bg-white/80 dark:bg-gray-800/80 rounded-lg p-3">
          {incidentTypeData.map((item) => (
            <div 
              key={item.code}
              className="flex items-center gap-2 p-1.5 rounded-md bg-slate-50/80 dark:bg-slate-800/80 border border-white/20 dark:border-white/5 hover:bg-white/90 dark:hover:bg-gray-700/90 transition-colors"
            >
              <div 
                className="w-3 h-3 rounded-sm shadow-sm flex-shrink-0"
                style={{ backgroundColor: actionCodeColors[item.code] }}
              />
              <div className="min-w-0">
                <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                  {item.code}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[100px]">
                  {item.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
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
    if (officerType !== 'all') {
      result = regionFilteredData.map(item => ({
        location: item.location,
        value: officerType === 'uniform' ? item.uniformOfficer : item.storeDetective,
        quantity: item.quantityRecovered
      }));
    } else {
      result = regionFilteredData.map(item => ({
        location: item.location,
        value: item.total,
        quantity: item.quantityRecovered
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
        newStartDate = startOfWeek(now, { weekStartsOn: 1 });
        newEndDate = endOfWeek(now, { weekStartsOn: 1 });
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
    const total = filteredData.reduce((acc, item) => acc + item.value, 0);
    setFilteredTotal(total);
  }, [filteredData]);

  const totalPages = Math.ceil(data.length / storesPerPage);

  const renderGraph = () => {
    let chartData;
    let barName;
    
    if (graphType === 'type') {
      chartData = incidentTypeData.map(item => ({
        code: `${item.code} - ${item.type}`,
        count: item.count,
        originalCode: item.code // Add this for color mapping
      }));
      barName = 'Number of Incidents';
    } else {
      chartData = paginatedData;
      barName = officerType === 'uniform' ? 'Uniform Officer' :
                officerType === 'detective' ? 'Store Detective' :
                'Total Value';
    }

    // Calculate dynamic bar size based on number of locations
    const dynamicBarSize = Math.max(20, Math.min(60, 800 / (graphType === 'type' ? incidentTypeData.length : paginatedData.length)));
    
    // Calculate dynamic height based on number of locations
    const minHeight = 400;
    const maxHeight = 900;
    const dynamicHeight = Math.max(minHeight, Math.min(maxHeight, (graphType === 'type' ? incidentTypeData.length : paginatedData.length) * 100));

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
        <ResponsiveContainer width="100%" height={dynamicHeight}>
          <BarChart
            data={chartData}
            margin={{
              top: 30,
              right: 40,
              left: 80,
              bottom: 100
            }}
            barSize={dynamicBarSize}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey={graphType === 'type' ? 'code' : 'location'}
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: chartData.length > 10 ? 11 : 12, fill: '#6B7280' }}
              label={{ 
                value: graphType === 'type' ? "Action Type" : "Key Locations",
                position: "bottom",
                offset: 80,
                fill: '#374151',
                fontSize: 14
              }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              label={{ 
                value: graphType === 'type' ? 'Number of Incidents' : 
                       graphType === 'value' ? 'Amount Recovered (£)' : 
                       'Number of Incidents',
                angle: -90,
                position: 'insideLeft',
                offset: -60,
                fill: '#374151',
                fontSize: 14
              }}
              tickFormatter={formatValue}
              tick={{ fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <Tooltip 
              formatter={formatValue}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px'
              }}
            />
            <Bar 
              dataKey={graphType === 'type' ? 'count' : graphType === 'value' ? 'value' : 'quantity'}
              name={barName}
              radius={[Math.min(8, dynamicBarSize/4), Math.min(8, dynamicBarSize/4), 0, 0]}
            >
              {chartData.map((entry: any, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarFill(entry, index)}
                  fillOpacity={0.9}
                />
              ))}
              <LabelList 
                dataKey={graphType === 'type' ? 'count' : graphType === 'value' ? 'value' : 'quantity'}
                position="top"
                formatter={formatValue}
                style={{ 
                  fontSize: chartData.length > 10 ? '10px' : '12px',
                  fill: '#4B5563',
                  fontWeight: 500
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Action Codes Legend */}
        {graphType === 'type' && <ActionCodesLegend />}

        {/* Pagination section - only show for non-type graphs */}
        {graphType !== 'type' && (
          <div className="flex justify-between items-center px-4">
            <div className="text-sm text-gray-600">
              Showing stores {((currentPage - 1) * storesPerPage) + 1} to {Math.min(currentPage * storesPerPage, data.length)} of {data.length}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-sm"
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
                      className="w-8 h-8 p-0 text-sm"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-gray-500">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-8 h-8 p-0 text-sm"
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
                className="text-sm"
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

    return `Total Saved by ${officerTypeText} (${regionText}) - ${periodText}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 dark:from-slate-950 dark:via-blue-950/50 dark:to-indigo-950/50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section with Enhanced Gradient */}
        <div className="relative bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 p-8 rounded-2xl backdrop-blur-sm border border-white/40 dark:border-white/10 shadow-xl">
          <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 rounded-2xl backdrop-blur-sm -z-10" />
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
                Incident Analytics Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
                Track and analyze security incidents across locations
              </p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-white/40 dark:border-white/10">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                {getTotalSavedTitle()}
              </h2>
              <p className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent mt-2">
                £{filteredTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Filters Card with Enhanced Glass Effect */}
        <Card className="relative overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-white/40 dark:border-white/10 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20 dark:from-blue-900/20 dark:to-indigo-900/20" />
          <CardHeader className="relative pb-2">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Filters & Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="relative pt-0">
            <div className="grid gap-4">
              {/* Main Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Left Section - Region and Graph Type */}
                <div className="md:col-span-4 space-y-3">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Region</Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
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
                    <Label className="text-sm font-medium mb-1.5 block">Graph Type</Label>
                    <RadioGroup
                      defaultValue="value"
                      value={graphType}
                      onValueChange={(value: GraphType) => setGraphType(value)}
                      className="flex flex-wrap gap-2"
                    >
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="value" id="value" />
                        <Label htmlFor="value" className="text-sm">Value</Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="quantity" id="quantity" />
                        <Label htmlFor="quantity" className="text-sm">Quantity</Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="type" id="type" />
                        <Label htmlFor="type" className="text-sm">Type</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Center Section - Time Period Controls */}
                <div className="md:col-span-5 space-y-3">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Time Period</Label>
                    <RadioGroup
                      defaultValue="ytd"
                      value={timeFilter}
                      onValueChange={handleTimeFilterChange}
                      className="grid grid-cols-2 gap-x-4 gap-y-1"
                    >
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="ytd" id="ytd" />
                        <Label htmlFor="ytd" className="text-sm">Year to Date</Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="month" id="month" />
                        <Label htmlFor="month" className="text-sm">Current Month</Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="week" id="week" />
                        <Label htmlFor="week" className="text-sm">Current Week</Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="custom" id="custom" />
                        <Label htmlFor="custom" className="text-sm">Custom Range</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {timeFilter === 'custom' && (
                    <div className="flex gap-2">
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
                <div className="md:col-span-3 space-y-3">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Officer Type</Label>
                    <RadioGroup
                      defaultValue="all"
                      value={officerType}
                      onValueChange={setOfficerType}
                      className="flex flex-col gap-1"
                    >
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all" className="text-sm">All Officers</Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="uniform" id="uniform" />
                        <Label htmlFor="uniform" className="text-sm">Uniform Officers</Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="detective" id="detective" />
                        <Label htmlFor="detective" className="text-sm">Store Detectives</Label>
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
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Update Graph
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Graph Card with Enhanced Glass Effect */}
        <Card className="relative overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-white/40 dark:border-white/10 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/20 via-transparent to-blue-100/20 dark:from-indigo-900/20 dark:to-blue-900/20" />
          <CardHeader className="relative">
            <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {selectedRegion === 'all' 
                ? 'All Regions - ' 
                : `${selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)} Region - `
              }
              {officerType === 'all' ? 'Total Incidents by Location' :
               officerType === 'uniform' ? 'Uniform Officer Incidents' :
               'Store Detective Incidents'}
            </CardTitle>
            {startDate && endDate && (
              <p className="text-slate-600 dark:text-slate-300">
                Period: {format(startDate, 'PPP')} - {format(endDate, 'PPP')}
              </p>
            )}
          </CardHeader>
          <CardContent className="relative">
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-lg p-6 shadow-lg border border-white/40 dark:border-white/10">
              {renderGraph()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default IncidentGraph 