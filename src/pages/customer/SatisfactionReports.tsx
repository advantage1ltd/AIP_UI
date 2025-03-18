import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, MapPin, Calendar, Edit, Eye, Trash2, Plus, Search, CalendarIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SurveyData {
  id: string
  officerName: string
  date: string
  customer: string
  location: string
  region: string
}

interface PerformanceRating {
  uniformAndAppearance: number
  professionalism: number
  customerServiceApproach: number
  improvedFeelingSecurity: number
  relationsWithStoreColleagues: number
  punctualityAndBreaks: number
  proactivity: number
}

interface FollowUpAction {
  id: number
  action: string
  dateToBeCompleted: string
}

interface SurveyDetails extends SurveyData {
  performanceRating: PerformanceRating
  storeManagerName: string
  areaManagerName: string
  followUpActions: FollowUpAction[]
}

const SatisfactionReports = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyDetails | null>(null)
  
  // Sample survey data
  const [surveys, setSurveys] = useState<SurveyData[]>([
    { id: '1', officerName: 'John Doe 1', date: 'Mar 20, 2024', customer: 'Shoprite Holdings', location: 'Cape Town CBD', region: 'Western Cape' },
    { id: '2', officerName: 'John Doe 2', date: 'Mar 20, 2024', customer: 'Shoprite Holdings', location: 'Cape Town CBD', region: 'Western Cape' },
    { id: '3', officerName: 'John Doe 3', date: 'Mar 20, 2024', customer: 'Shoprite Holdings', location: 'Cape Town CBD', region: 'Western Cape' },
    { id: '4', officerName: 'John Doe 4', date: 'Mar 20, 2024', customer: 'Shoprite Holdings', location: 'Cape Town CBD', region: 'Western Cape' },
    { id: '5', officerName: 'John Doe 5', date: 'Mar 20, 2024', customer: 'Shoprite Holdings', location: 'Cape Town CBD', region: 'Western Cape' },
    { id: '6', officerName: 'John Doe 6', date: 'Mar 20, 2024', customer: 'Shoprite Holdings', location: 'Cape Town CBD', region: 'Western Cape' },
    { id: '7', officerName: 'John Doe 7', date: 'Mar 20, 2024', customer: 'Shoprite Holdings', location: 'Cape Town CBD', region: 'Western Cape' },
    { id: '8', officerName: 'John Doe 8', date: 'Mar 20, 2024', customer: 'Shoprite Holdings', location: 'Cape Town CBD', region: 'Western Cape' },
    { id: '9', officerName: 'John Doe 9', date: 'Mar 20, 2024', customer: 'Shoprite Holdings', location: 'Cape Town CBD', region: 'Western Cape' },
    { id: '13', officerName: 'John Doe 13', date: 'Mar 20, 2024', customer: 'Shoprite Holdings', location: 'Cape Town CBD', region: 'Western Cape' },
  ])

  // Sample detailed survey data (in a real app, this would come from an API)
  const getSurveyDetails = (id: string): SurveyDetails => {
    const survey = surveys.find(s => s.id === id) || surveys[0];
    
    return {
      ...survey,
      performanceRating: {
        uniformAndAppearance: 8,
        professionalism: 9,
        customerServiceApproach: 7,
        improvedFeelingSecurity: 9,
        relationsWithStoreColleagues: 8,
        punctualityAndBreaks: 7,
        proactivity: 8
      },
      storeManagerName: 'Jane Smith',
      areaManagerName: 'Mike Johnson',
      followUpActions: [
        { id: 1, action: 'Improve security measures', dateToBeCompleted: '01/04/2024' },
        { id: 2, action: 'Staff training', dateToBeCompleted: '15/04/2024' },
        { id: 3, action: 'Update protocols', dateToBeCompleted: '30/04/2024' }
      ]
    };
  };

  // Filter surveys based on search query
  const filteredSurveys = surveys.filter(survey => 
    survey.officerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    survey.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    survey.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    survey.region.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle delete survey
  const handleDeleteSurvey = (id: string) => {
    setSurveys(surveys.filter(survey => survey.id !== id))
  }

  // Handle view survey
  const handleViewSurvey = (id: string) => {
    const surveyDetails = getSurveyDetails(id);
    setSelectedSurvey(surveyDetails);
    setViewDialogOpen(true);
  }

  // Rating label component
  const RatingLabel = ({ rating }: { rating: number }) => {
    if (rating <= 3) return <span className="text-red-500 text-xs">Poor</span>;
    if (rating <= 6) return <span className="text-amber-500 text-xs">Satisfactory</span>;
    if (rating <= 8) return <span className="text-green-500 text-xs">Good</span>;
    return <span className="text-blue-500 text-xs">Excellent</span>;
  };

  // Rating scale component
  const RatingScale = ({ value, title }: { value: number, title: string }) => {
    return (
      <div className="mb-4 sm:mb-6">
        <h3 className="text-sm font-medium mb-2 sm:mb-3">{title}</h3>
        <div className="flex items-center justify-between mb-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
            <div key={rating} className="flex flex-col items-center">
              <div className={`h-5 w-5 sm:h-6 sm:w-10 rounded-full border ${value === rating ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}></div>
              <span className="text-[10px] sm:text-xs mt-1">{rating}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between px-1 text-[10px] sm:text-xs">
          <RatingLabel rating={1} />
          <RatingLabel rating={5} />
          <RatingLabel rating={7} />
          <RatingLabel rating={10} />
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Customer Satisfaction Surveys</h1>
        </div>
        <p className="text-sm text-gray-500 ml-10">View and manage customer satisfaction surveys across all locations.</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Total Surveys:</span>
              <span className="text-sm font-bold">{surveys.length}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search surveys..." 
                  className="pl-9 h-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium">Officer Name</TableHead>
                  <TableHead className="font-medium">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Date</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-medium">Customer</TableHead>
                  <TableHead className="font-medium">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>Location</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-medium">Region</TableHead>
                  <TableHead className="font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSurveys.map((survey) => (
                  <TableRow key={survey.id} className="border-b">
                    <TableCell className="font-medium">{survey.officerName}</TableCell>
                    <TableCell>{survey.date}</TableCell>
                    <TableCell>{survey.customer}</TableCell>
                    <TableCell>{survey.location}</TableCell>
                    <TableCell>{survey.region}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0 text-blue-600 hover:bg-transparent hover:text-blue-700 font-medium"
                        onClick={() => handleViewSurvey(survey.id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
            <div>Showing 1 to 10 of {surveys.length} results</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 font-medium bg-blue-600 text-white border-blue-600">
                1
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 font-medium">
                2
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 font-medium">
                3
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Survey Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl p-3 sm:p-6 max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="mb-2 sm:mb-4">
            <DialogTitle className="text-base sm:text-xl font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Customer Satisfaction Survey
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto pr-1 sm:pr-2 mt-2 sm:mt-4 flex-1">
            {selectedSurvey && (
              <>
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                  <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Regular Officer Name</Label>
                      <Input value={selectedSurvey.officerName} readOnly className="bg-white h-9 sm:h-10 text-xs sm:text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Date</Label>
                      <div className="relative">
                        <Input value={selectedSurvey.date} readOnly className="bg-white h-9 sm:h-10 text-xs sm:text-sm" />
                        <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Customer</Label>
                      <Select defaultValue={selectedSurvey.customer} disabled>
                        <SelectTrigger className="bg-white h-9 sm:h-10 text-xs sm:text-sm">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={selectedSurvey.customer}>{selectedSurvey.customer}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Region</Label>
                      <Select defaultValue={selectedSurvey.region} disabled>
                        <SelectTrigger className="bg-white h-9 sm:h-10 text-xs sm:text-sm">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={selectedSurvey.region}>{selectedSurvey.region}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Location</Label>
                      <Select defaultValue={selectedSurvey.location} disabled>
                        <SelectTrigger className="bg-white h-9 sm:h-10 text-xs sm:text-sm">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={selectedSurvey.location}>{selectedSurvey.location}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Performance Rating */}
                <div className="mb-6 sm:mb-8 p-4 sm:p-6 border border-gray-100 rounded-lg">
                  <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5">Performance Rating</h2>
                  
                  <div className="space-y-5 sm:space-y-7">
                    <RatingScale value={selectedSurvey.performanceRating.uniformAndAppearance} title="Uniform and Appearance" />
                    <RatingScale value={selectedSurvey.performanceRating.professionalism} title="Professionalism" />
                    <RatingScale value={selectedSurvey.performanceRating.customerServiceApproach} title="Customer Service Approach" />
                    <RatingScale value={selectedSurvey.performanceRating.improvedFeelingSecurity} title="Improved Feeling of Security when Officer on Site" />
                    <RatingScale value={selectedSurvey.performanceRating.relationsWithStoreColleagues} title="Relations With Store Colleagues" />
                    <RatingScale value={selectedSurvey.performanceRating.punctualityAndBreaks} title="Punctuality / Breaks" />
                    <RatingScale value={selectedSurvey.performanceRating.proactivity} title="Proactivity" />
                  </div>
                </div>

                {/* Management Information */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                  <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5">Management Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Store Manager Name</Label>
                      <Input value={selectedSurvey.storeManagerName} readOnly className="bg-white h-9 sm:h-10 text-xs sm:text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Area Manager Name</Label>
                      <Input value={selectedSurvey.areaManagerName} readOnly className="bg-white h-9 sm:h-10 text-xs sm:text-sm" />
                    </div>
                  </div>
                </div>

                {/* Follow Up Actions */}
                <div className="mb-6 sm:mb-8 p-4 sm:p-6 border border-gray-100 rounded-lg">
                  <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5">Follow Up Actions</h2>
                  
                  <div className="space-y-4 sm:space-y-6">
                    {selectedSurvey.followUpActions.map((action, index) => (
                      <div key={action.id} className="mb-3 sm:mb-5 pb-3 sm:pb-5 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Action {index + 1}</Label>
                            <Input value={action.action} readOnly className="bg-white h-9 sm:h-10 text-xs sm:text-sm" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Date to be Completed</Label>
                            <div className="relative">
                              <Input value={action.dateToBeCompleted} readOnly className="bg-white h-9 sm:h-10 text-xs sm:text-sm" />
                              <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <Button variant="outline" onClick={() => setViewDialogOpen(false)} className="h-9 sm:h-10 text-xs sm:text-sm px-4 sm:px-5">
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SatisfactionReports 