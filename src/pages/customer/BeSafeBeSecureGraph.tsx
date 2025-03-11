import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, PieChart, Pie, Cell, Label } from 'recharts';

const filterOptions = [
  'Breakdown Of Checks By Site',
  'Breakdown of Checks By Type',
  'Breakdown of Insecure Areas',
  'Breakdown of Systems Checks',
  'Breakdown Of Compliance Checks',
];

const COLORS = [
  '#00A0DC', // Tills over £150 (blue)
  '#E5004B', // Cash Office Opened (red)
  '#FDB913', // OverLimit on Cash Levels (yellow)
  '#93C83E', // Visible Keys on display (green)
  '#FF6B6B', // Fire Routes Blocked (coral)
  '#4A4A4A', // ATM Abused (dark gray)
  '#B4E1FA'  // Be Safe Be Secure Poster (light blue)
];

const BeSafeBeSecureGraph: React.FC = () => {
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [selectedSite, setSelectedSite] = React.useState<string>('');
  const [selectedFilter, setSelectedFilter] = React.useState<string>('Breakdown Of Checks By Site');
  const [displayData, setDisplayData] = React.useState<any[]>([]);

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
    'Breakdown of Checks By Type': [50, 60, 70, 80, 90],
    'Breakdown of Insecure Areas': [30, 40, 50, 60, 70],
    'Breakdown of Systems Checks': [20, 30, 40, 50, 60],
    'Breakdown Of Compliance Checks': [5, 15, 25, 35, 45],
  };

  const handleSearch = () => {
    if (selectedFilter === 'Breakdown Of Checks By Site') {
      if (selectedSite) {
        setDisplayData(mockData['Breakdown Of Checks By Site'].filter(item => item.site === selectedSite));
      } else {
        setDisplayData(mockData['Breakdown Of Checks By Site']);
      }
    } else if (selectedFilter === 'Breakdown of Checks By Type') {
      setDisplayData([
        { type: 'Compliance', value: 17 },
        { type: 'Insecure Areas', value: 22 },
        { type: 'Systems', value: 442 },
      ]);
    } else if (selectedFilter === 'Breakdown of Insecure Areas') {
      setDisplayData([
        { area: 'Kiosk', value: 4 },
        { area: 'High Value Room', value: 1 },
        { area: 'Managers Office', value: 1 },
        { area: 'Warehouse To Sales Floor', value: 13 },
        { area: 'Service Yard', value: 1 },
        { area: 'CarPark And Grounds', value: 1 },
        { area: 'Fire Doors(Back Of House)', value: 1 },
        { area: 'Fire Doors(Shop Floor)', value: 1 },
      ]);
    } else if (selectedFilter === 'Breakdown of Systems Checks') {
      setDisplayData([
        { area: 'Watch Me Now', value: 62 },
        { area: 'Intruder Alarm', value: 64 },
        { area: 'Keyholding', value: 64 },
        { area: 'CCTV', value: 64 },
        { area: 'Body Worn CCTV', value: 61 },
        { area: 'Crime Reporting', value: 64 },
        { area: 'Cigarette Tracker', value: 63 },
      ]);
    } else if (selectedFilter === 'Breakdown Of Compliance Checks') {
      const pieData = [
        { name: 'Tills over £150', value: 20 },
        { name: 'Cash Office Opened', value: 38 },
        { name: 'OverLimit on Cash Levels', value: 1 },
        { name: 'Visible Keys on display', value: 14 },
        { name: 'Fire Routes Blocked', value: 3 },
        { name: 'ATM Abused', value: 4 },
        { name: 'Be Safe Be Secure Poster', value: 26 },
      ];

      setDisplayData(pieData);
    } else {
      setDisplayData([]);
    }
  };

  const data = mockData['Breakdown Of Checks By Site'];

  const renderCustomBarShape = (props) => {
    const { x, y, width, height, fill } = props;
    const depth = 10;
    const shadowColor = 'rgba(0, 0, 0, 0.1)';

    // Ensure all values are numbers
    if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
      return null; // Skip rendering if any value is NaN
    }

    return (
      <g>
        {/* Top face */}
        <path d={`M${x},${y} L${x + width},${y} L${x + width - depth},${y - depth} L${x - depth},${y - depth} Z`} fill={fill} />
        {/* Left side face */}
        <path d={`M${x},${y} L${x},${y + height} L${x - depth},${y + height - depth} L${x - depth},${y - depth} Z`} fill={fill} />
        {/* Right side face */}
        <path d={`M${x + width},${y} L${x + width},${y + height} L${x + width - depth},${y + height - depth} L${x + width - depth},${y - depth} Z`} fill={fill} />
        {/* Front face */}
        <path d={`M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} Z`} fill={fill} />
        {/* Shadow */}
        <path d={`M${x},${y + height} L${x + width},${y + height} L${x + width + depth},${y + height + depth} L${x + depth},${y + height + depth} Z`} fill={shadowColor} />
      </g>
    );
  };

  // Update bar colors
  const barColors = ['#4A90E2', '#50E3C2', '#F5A623'];

  // Render the chart based on the selected filter
  const renderChart = () => {
    if (selectedFilter === 'Breakdown of Insecure Areas') {
      return (
        <BarChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="area" interval={0} angle={-45} textAnchor="end" height={60} tick={{ fontSize: 10 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#50E3C2" shape={renderCustomBarShape}>
            <LabelList dataKey="value" position="top" />
          </Bar>
        </BarChart>
      );
    }

    if (selectedFilter === 'Breakdown of Checks By Type') {
      return (
        <BarChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#50E3C2" shape={renderCustomBarShape}>
            <LabelList dataKey="value" position="top" />
          </Bar>
        </BarChart>
      );
    }

    if (selectedFilter === 'Breakdown of Systems Checks') {
      return (
        <BarChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="area" interval={0} angle={-45} textAnchor="end" height={60} tick={{ fontSize: 10 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#50E3C2" shape={renderCustomBarShape}>
            <LabelList dataKey="value" position="top" />
          </Bar>
        </BarChart>
      );
    }

    if (selectedFilter === 'Breakdown Of Compliance Checks') {
      return (
        <div className="relative">
          <PieChart width={800} height={500}>
            <Pie
              data={displayData}
              cx={350}
              cy={250}
              startAngle={90}
              endAngle={-270}
              innerRadius={100}
              outerRadius={180}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {displayData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend 
              layout="vertical" 
              align="right" 
              verticalAlign="middle"
              formatter={(value, entry: any) => `${entry.payload.name}: ${entry.payload.value}`}
            />
          </PieChart>
        </div>
      );
    }

    return (
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="site" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="insecureAreas" fill={barColors[0]} shape={renderCustomBarShape}>
          <LabelList dataKey="insecureAreas" position="top" />
        </Bar>
        <Bar dataKey="compliance" fill={barColors[1]} shape={renderCustomBarShape}>
          <LabelList dataKey="compliance" position="top" />
        </Bar>
        <Bar dataKey="systems" fill={barColors[2]} shape={renderCustomBarShape}>
          <LabelList dataKey="systems" position="top" />
        </Bar>
      </BarChart>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Be Safe Be Secure Graphs</h1>
        <div className="flex gap-4">
          <DatePicker date={startDate} setDate={setStartDate} placeholder="Start Date" />
          <DatePicker date={endDate} setDate={setEndDate} placeholder="End Date" />
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">All Sites</option>
            {mockData['Breakdown Of Checks By Site'].map((siteData) => (
              <option key={siteData.site} value={siteData.site}>{siteData.site}</option>
            ))}
          </select>
          <Button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2">Search</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filterOptions.map((filter) => (
          <Button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 ${selectedFilter === filter ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {filter}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[20px]">Compliance Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-[10px]">
            <ResponsiveContainer width="100%" height={400}>
              {renderChart()}
            </ResponsiveContainer>
          </div>
          <div className="text-sm text-gray-600 mt-4">
            <br />
            <br/>
            <br/>
            <p>Data Shown for period {startDate ? startDate.toLocaleDateString() : 'N/A'} - {endDate ? endDate.toLocaleDateString() : 'N/A'}.</p>
      
            <p>{customerRegion}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BeSafeBeSecureGraph; 