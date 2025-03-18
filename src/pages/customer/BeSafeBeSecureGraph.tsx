import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LabelList, 
  PieChart, 
  Pie, 
  Cell, 
  Label
} from 'recharts';
import { Calendar, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ErrorBoundary from '@/components/ErrorBoundary';

const filterOptions = [
  'Breakdown Of Checks By Site',
  'Breakdown of Checks By Type',
  'Breakdown of Insecure Areas',
  'Breakdown of Systems Checks',
  'Breakdown Of Compliance Checks',
];

// Modern color palette
const COLORS = {
  primary: ['#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0'],
  secondary: ['#2b9348', '#55a630', '#80b918', '#aacc00', '#bfd200'],
  tertiary: ['#ff9e00', '#ff7b00', '#ff5400', '#e62100', '#bc3908'],
  neutral: ['#2b2d42', '#8d99ae', '#edf2f4', '#ef233c', '#d90429'],
  compliance: {
    tills: '#4361ee',
    cashOffice: '#f72585',
    cashLevels: '#ffd166',
    keys: '#06d6a0',
    fireRoutes: '#ef476f',
    atm: '#073b4c',
    poster: '#118ab2'
  }
};

// Add a simple error handling wrapper component
const SafeComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = () => {
      setHasError(true);
      console.error('Error caught in SafeComponent');
    };

    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Something went wrong</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-center max-w-md">
          We encountered an error while rendering this component. Please try refreshing the page.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

const BeSafeBeSecureGraph: React.FC = () => {
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [selectedSite, setSelectedSite] = React.useState<string>('all');
  const [selectedFilter, setSelectedFilter] = React.useState<string>('Breakdown Of Checks By Site');
  const [displayData, setDisplayData] = React.useState<any[]>([]);
  const [activeTab, setActiveTab] = React.useState('sites');
  const [isLoading, setIsLoading] = React.useState(false);

  // Mock customer region data
  const customerRegion = "Central England Sites";

  const mockData = {
    'Breakdown Of Checks By Site': [
      { site: 'Anson Road', insecureAreas: 70, compliance: 263, systems: 112 },
      { site: 'Cropston Drive', insecureAreas: 49, compliance: 235, systems: 67 },
      { site: 'Ilkstock', insecureAreas: 67, compliance: 155, systems: 86 },
      { site: 'Marston', insecureAreas: 112, compliance: 94, systems: 49 },
      { site: 'Peterborough', insecureAreas: 86, compliance: 56, systems: 70 },
    ],
    'Breakdown of Checks By Type': [
      { type: 'Compliance', value: 17 },
      { type: 'Insecure Areas', value: 22 },
      { type: 'Systems', value: 442 },
    ],
    'Breakdown of Insecure Areas': [
      { area: 'Kiosk', value: 4 },
      { area: 'High Value Room', value: 1 },
      { area: 'Managers Office', value: 1 },
      { area: 'Warehouse To Sales Floor', value: 13 },
      { area: 'Service Yard', value: 1 },
      { area: 'CarPark And Grounds', value: 1 },
      { area: 'Fire Doors(Back Of House)', value: 1 },
      { area: 'Fire Doors(Shop Floor)', value: 1 },
    ],
    'Breakdown of Systems Checks': [
      { area: 'Watch Me Now', value: 62 },
      { area: 'Intruder Alarm', value: 64 },
      { area: 'Keyholding', value: 64 },
      { area: 'CCTV', value: 64 },
      { area: 'Body Worn CCTV', value: 61 },
      { area: 'Crime Reporting', value: 64 },
      { area: 'Cigarette Tracker', value: 63 },
    ],
    'Breakdown Of Compliance Checks': [
      { name: 'Tills over £150', value: 20, color: COLORS.compliance.tills },
      { name: 'Cash Office Opened', value: 38, color: COLORS.compliance.cashOffice },
      { name: 'OverLimit on Cash Levels', value: 1, color: COLORS.compliance.cashLevels },
      { name: 'Visible Keys on display', value: 14, color: COLORS.compliance.keys },
      { name: 'Fire Routes Blocked', value: 3, color: COLORS.compliance.fireRoutes },
      { name: 'ATM Abused', value: 4, color: COLORS.compliance.atm },
      { name: 'Be Safe Be Secure Poster', value: 26, color: COLORS.compliance.poster },
    ],
  };

  // Add logging for component mount and updates
  React.useEffect(() => {
    console.log('[BeSafeBeSecureGraph] Component mounted');
    handleSearch(); // Initial data load
    return () => {
      console.log('[BeSafeBeSecureGraph] Component unmounted');
    };
  }, []);

  React.useEffect(() => {
    console.log('[BeSafeBeSecureGraph] Filter changed:', selectedFilter);
    console.log('[BeSafeBeSecureGraph] Current state:', {
      startDate,
      endDate,
      selectedSite,
      activeTab,
      displayDataLength: displayData.length
    });
    handleSearch();
  }, [selectedFilter, selectedSite, startDate, endDate]); // Add date dependencies

  // Helper function to filter data by date range
  const filterByDateRange = (data: any[]) => {
    if (!startDate && !endDate) {
      return data; // No date filtering
    }

    // Validate date range
    if (startDate && endDate && startDate > endDate) {
      console.warn('[BeSafeBeSecureGraph] Invalid date range: start date is after end date');
      return data; // Return unfiltered data for invalid range
    }

    // For demo purposes, we'll simulate date filtering by reducing the data set
    // In a real app, you would filter based on actual date properties in the data
    if (startDate && endDate) {
      // Both dates set - return a subset based on date range size
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      const filterRatio = Math.min(Math.max(daysDiff / 30, 0.1), 1); // Normalize to 10%-100%
      console.log(`[BeSafeBeSecureGraph] Date range: ${daysDiff} days, filter ratio: ${filterRatio}`);
      return data.map(item => {
        // Create a copy with reduced values to simulate date filtering
        const copy = { ...item };
        Object.keys(copy).forEach(key => {
          if (typeof copy[key] === 'number') {
            copy[key] = Math.round(copy[key] * filterRatio);
            // Ensure we don't have zero values for better visualization
            if (copy[key] === 0 && item[key] > 0) {
              copy[key] = 1;
            }
          }
        });
        return copy;
      });
    } else if (startDate) {
      // Only start date - return 75% of values
      return data.map(item => {
        const copy = { ...item };
        Object.keys(copy).forEach(key => {
          if (typeof copy[key] === 'number') {
            copy[key] = Math.round(copy[key] * 0.75);
            // Ensure we don't have zero values for better visualization
            if (copy[key] === 0 && item[key] > 0) {
              copy[key] = 1;
            }
          }
        });
        return copy;
      });
    } else {
      // Only end date - return 50% of values
      return data.map(item => {
        const copy = { ...item };
        Object.keys(copy).forEach(key => {
          if (typeof copy[key] === 'number') {
            copy[key] = Math.round(copy[key] * 0.5);
            // Ensure we don't have zero values for better visualization
            if (copy[key] === 0 && item[key] > 0) {
              copy[key] = 1;
            }
          }
        });
        return copy;
      });
    }
  };

  const handleSearch = () => {
    console.log('[BeSafeBeSecureGraph] handleSearch called with:', {
      selectedFilter,
      selectedSite,
      startDate,
      endDate
    });

    setIsLoading(true);

    try {
      let filteredData: any[] = [];

      // First, get the base data for the selected filter
      if (selectedFilter === 'Breakdown Of Checks By Site') {
        if (selectedSite && selectedSite !== 'all') {
          filteredData = mockData['Breakdown Of Checks By Site'].filter(item => item.site === selectedSite);
        } else {
          filteredData = [...mockData['Breakdown Of Checks By Site']];
        }
        setActiveTab('sites');
      } else if (selectedFilter === 'Breakdown of Checks By Type') {
        filteredData = [...mockData['Breakdown of Checks By Type']];
        setActiveTab('types');
      } else if (selectedFilter === 'Breakdown of Insecure Areas') {
        filteredData = [...mockData['Breakdown of Insecure Areas']];
        setActiveTab('insecure');
      } else if (selectedFilter === 'Breakdown of Systems Checks') {
        filteredData = [...mockData['Breakdown of Systems Checks']];
        setActiveTab('systems');
      } else if (selectedFilter === 'Breakdown Of Compliance Checks') {
        filteredData = [...mockData['Breakdown Of Compliance Checks']];
        setActiveTab('compliance');
      }

      // Then apply date filtering
      const dateFilteredData = filterByDateRange(filteredData);
      console.log('[BeSafeBeSecureGraph] Data after filtering:', dateFilteredData);
      
      setDisplayData(dateFilteredData);
    } catch (error) {
      console.error('[BeSafeBeSecureGraph] Error in handleSearch:', error);
      setDisplayData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom tooltip for bar charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg">
          <p className="font-medium text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }}></div>
              <p className="text-sm">
                <span className="text-slate-600 dark:text-slate-400">{entry.name}: </span>
                <span className="font-medium">{entry.value}</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie charts
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg">
          <p className="font-medium text-sm">{payload[0].name}</p>
          <p className="text-sm mt-1">
            <span className="text-slate-600 dark:text-slate-400">Value: </span>
            <span className="font-medium">{payload[0].value}</span>
          </p>
          <p className="text-sm mt-1">
            <span className="text-slate-600 dark:text-slate-400">Percentage: </span>
            <span className="font-medium">{`${(payload[0].percent * 100).toFixed(1)}%`}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Render the chart based on the selected filter
  const renderChart = () => {
    console.log('[BeSafeBeSecureGraph] Rendering chart for filter:', selectedFilter);
    console.log('[BeSafeBeSecureGraph] Chart data:', displayData);

    try {
      if (isLoading) {
        return (
          <div className="flex flex-col items-center justify-center h-[300px] md:h-[400px] p-4 md:p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading chart data...</p>
          </div>
        );
      }

      if (!displayData || displayData.length === 0) {
        console.warn('[BeSafeBeSecureGraph] No data available for chart');
        return (
          <div className="flex flex-col items-center justify-center h-[300px] md:h-[400px] p-4 md:p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No data available</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-md mb-6">
              There is no data to display for the selected filters.
            </p>
          </div>
        );
      }

      if (selectedFilter === 'Breakdown of Insecure Areas') {
        return (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData} margin={{ top: 20, right: 30, left: 5, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="area" 
                    interval={0} 
                    angle={-45} 
                    textAnchor="end" 
                    height={60} 
                    tick={{ fontSize: 10, fontWeight: 500 }}
                    tickLine={false}
                  />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill={COLORS.secondary[0]}
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  >
                    <LabelList 
                      dataKey="value" 
                      position="top" 
                      fill="#666" 
                      fontSize={10}
                      fontWeight={500} 
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }

      if (selectedFilter === 'Breakdown of Checks By Type') {
        return (
          <div className="h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayData} margin={{ top: 20, right: 30, left: 5, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="type" 
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 500 }}
                />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill={COLORS.primary[0]}
                  radius={[4, 4, 0, 0]}
                  barSize={60}
                >
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    fill="#666" 
                    fontSize={11}
                    fontWeight={500} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }

      if (selectedFilter === 'Breakdown of Systems Checks') {
        return (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData} margin={{ top: 20, right: 30, left: 5, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="area" 
                    interval={0} 
                    angle={-45} 
                    textAnchor="end" 
                    height={60} 
                    tick={{ fontSize: 10, fontWeight: 500 }}
                    tickLine={false}
                  />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill={COLORS.tertiary[0]}
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  >
                    <LabelList 
                      dataKey="value" 
                      position="top" 
                      fill="#666" 
                      fontSize={10}
                      fontWeight={500} 
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }

      if (selectedFilter === 'Breakdown Of Compliance Checks') {
        return (
          <div className="relative h-[350px] md:h-[400px] lg:h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayData}
                  cx="50%"
                  cy="50%"
                  startAngle={90}
                  endAngle={-270}
                  innerRadius={window.innerWidth < 768 ? 60 : 80}
                  outerRadius={window.innerWidth < 768 ? 110 : 140}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={window.innerWidth >= 640}
                  label={({ name, percent }) => 
                    window.innerWidth >= 640 
                      ? `${name}: ${(percent * 100).toFixed(1)}%` 
                      : `${(percent * 100).toFixed(0)}%`
                  }
                >
                  {displayData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  layout={window.innerWidth < 768 ? "horizontal" : "vertical"}
                  align={window.innerWidth < 768 ? "center" : "right"}
                  verticalAlign={window.innerWidth < 768 ? "bottom" : "middle"}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={window.innerWidth < 768 ? { fontSize: '10px', marginTop: '10px' } : { fontSize: '12px' }}
                  formatter={(value, entry: any, index) => (
                    <span className="text-xs sm:text-sm">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      }

      // Default chart for Breakdown Of Checks By Site
      return (
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px] h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayData} margin={{ top: 20, right: 30, left: 5, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="site" 
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 500 }}
                />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle" 
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(value) => <span className="text-xs sm:text-sm">{value}</span>}
                />
                <Bar 
                  dataKey="insecureAreas" 
                  name="Insecure Areas" 
                  fill={COLORS.primary[0]} 
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                >
                  <LabelList 
                    dataKey="insecureAreas" 
                    position="top" 
                    fill="#666" 
                    fontSize={10}
                    fontWeight={500} 
                  />
                </Bar>
                <Bar 
                  dataKey="compliance" 
                  name="Compliance" 
                  fill={COLORS.primary[2]} 
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                >
                  <LabelList 
                    dataKey="compliance" 
                    position="top" 
                    fill="#666" 
                    fontSize={10}
                    fontWeight={500} 
                  />
                </Bar>
                <Bar 
                  dataKey="systems" 
                  name="Systems" 
                  fill={COLORS.primary[4]} 
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                >
                  <LabelList 
                    dataKey="systems" 
                    position="top" 
                    fill="#666" 
                    fontSize={10}
                    fontWeight={500} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    } catch (error) {
      console.error('[BeSafeBeSecureGraph] Error rendering chart:', error);
      console.error('[BeSafeBeSecureGraph] Error details:', {
        filter: selectedFilter,
        dataLength: displayData?.length,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return (
        <div className="flex flex-col items-center justify-center h-[300px] md:h-[400px] p-4 md:p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-base md:text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Chart could not be displayed</h3>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 text-center max-w-md mb-4 md:mb-6">
            There was an error rendering this chart. Please check the console for more details.
          </p>
        </div>
      );
    }
  };

  // Add logging for Select component with improved error handling
  const handleSiteChange = (value: string) => {
    console.log('[BeSafeBeSecureGraph] Site selection changed:', value);
    try {
      if (typeof value !== 'string') {
        throw new Error('Invalid site value');
      }
      setSelectedSite(value);
    } catch (error) {
      console.error('[BeSafeBeSecureGraph] Error setting selected site:', error);
      // Reset to default value on error
      setSelectedSite('all');
    }
  };

  // Update tab change handler to properly set the filter
  const handleTabChange = (value: string) => {
    console.log('[BeSafeBeSecureGraph] Tab changed:', value);
    setActiveTab(value);
    
    // Map tab value to filter value
    if (value === 'sites') {
      setSelectedFilter('Breakdown Of Checks By Site');
    } else if (value === 'types') {
      setSelectedFilter('Breakdown of Checks By Type');
    } else if (value === 'insecure') {
      setSelectedFilter('Breakdown of Insecure Areas');
    } else if (value === 'systems') {
      setSelectedFilter('Breakdown of Systems Checks');
    } else if (value === 'compliance') {
      setSelectedFilter('Breakdown Of Compliance Checks');
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Be Safe Be Secure Graphs
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
          Visualize security compliance data across sites and categories
        </p>
      </div>

      <Card className="mb-4 md:mb-6 border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-700 pb-3 md:pb-4">
          <CardTitle className="text-base md:text-lg font-semibold">Filter Options</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3 md:h-4 md:w-4 text-slate-500" />
                Date Range
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <DatePicker 
                    date={startDate} 
                    setDate={(date) => {
                      console.log('[BeSafeBeSecureGraph] Start date changed:', date);
                      setStartDate(date);
                    }}
                    placeholder="Start Date"
                  />
                </div>
                <div className="flex-1">
          <DatePicker
                    date={endDate} 
                    setDate={(date) => {
                      console.log('[BeSafeBeSecureGraph] End date changed:', date);
                      setEndDate(date);
                    }}
                    placeholder="End Date"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium flex items-center gap-1">
                <Search className="h-3 w-3 md:h-4 md:w-4 text-slate-500" />
                Site
              </label>
              <Select 
                value={selectedSite} 
                onValueChange={handleSiteChange}
              >
                <SelectTrigger className="bg-white dark:bg-slate-900 h-9 md:h-10">
                  <SelectValue placeholder="All Sites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {mockData['Breakdown Of Checks By Site'].map((siteData) => (
                    <SelectItem 
                      key={siteData.site} 
                      value={siteData.site}
                    >
                      {siteData.site}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button 
                onClick={handleSearch} 
                className="w-full h-9 md:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm"
              >
                Apply Filters
              </Button>
            </div>
        </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto mb-4 md:mb-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="min-w-[600px]">
          <TabsList className="grid grid-cols-5 mb-3 md:mb-4">
            <TabsTrigger value="sites" className="text-xs md:text-sm py-1.5 md:py-2">
              Checks By Site
            </TabsTrigger>
            <TabsTrigger value="types" className="text-xs md:text-sm py-1.5 md:py-2">
              Checks By Type
            </TabsTrigger>
            <TabsTrigger value="insecure" className="text-xs md:text-sm py-1.5 md:py-2">
              Insecure Areas
            </TabsTrigger>
            <TabsTrigger value="systems" className="text-xs md:text-sm py-1.5 md:py-2">
              Systems Checks
            </TabsTrigger>
            <TabsTrigger value="compliance" className="text-xs md:text-sm py-1.5 md:py-2">
              Compliance Checks
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-700 py-3 md:py-4">
          <CardTitle className="text-lg md:text-xl font-semibold flex flex-wrap items-center gap-2">
            <span className="mr-1">{selectedFilter}</span>
            {(startDate || endDate) && (
              <span className="text-xs font-normal px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                Date Filtered
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="space-y-4">
            <SafeComponent>
              {renderChart()}
            </SafeComponent>
          </div>
          <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-4 md:mt-6 pt-3 md:pt-4 border-t border-slate-200 dark:border-slate-700">
            <p>
              Data shown for period: 
              {startDate ? startDate.toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              }) : 'All time'} - 
              {endDate ? endDate.toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              }) : 'Present'}
            </p>
            <p className="font-medium mt-1">{customerRegion}</p>
            {startDate && endDate && startDate > endDate && (
              <p className="text-red-500 mt-1">
                Warning: Start date is after end date. Date filtering has been disabled.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Create a fallback component for chart errors
const ChartFallback = () => (
  <div className="flex flex-col items-center justify-center h-[300px] md:h-[400px] p-4 md:p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
    <h3 className="text-base md:text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Chart could not be displayed</h3>
    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 text-center max-w-md mb-4 md:mb-6">
      There was an error rendering this chart. Please try refreshing the page or contact support if the issue persists.
    </p>
    <Button 
      onClick={() => window.location.reload()}
      className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-8 md:h-10"
    >
      Refresh Page
    </Button>
  </div>
);

// Wrap the export with ErrorBoundary
const BeSafeBeSecureGraphWithErrorBoundary = () => (
  <ErrorBoundary fallback={<ChartFallback />}>
    <BeSafeBeSecureGraph />
  </ErrorBoundary>
);

export default BeSafeBeSecureGraphWithErrorBoundary; 