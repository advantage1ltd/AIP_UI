import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { RootState } from "@/store/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Timer, FileText, Clock, Calendar, CheckCircle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"

// Simple TakeTest component with access to Redux state
const TakeTest = () => {
  console.log("TakeTest component is rendering")
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('available')
  const [selectedResult, setSelectedResult] = useState<any>(null)
  const [resultDialogOpen, setResultDialogOpen] = useState(false)
  
  // Get quizzes and results from Redux store
  const { quizzes, results } = useSelector((state: RootState) => state.quiz)
  
  // Mock user data - in a real app, this would come from authentication
  const currentOfficer = {
    id: 'OFF001',
    name: 'John Smith',
    rank: 'Store Detective',
    department: 'Operations'
  }

  // Filter available tests based on search and only active tests
  const availableTests = quizzes.filter(quiz => 
    quiz.status === 'active' && 
    (quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase())))
  )
  
  // Get completed tests for the current officer
  const completedTests = results.filter(result => result.officerId === currentOfficer.id)

  // Function to start a test
  const startTest = (testId: string) => {
    navigate(`/recruitment/test-session/${testId}`)
  }
  
  // Function to format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  // Add this new function to handle viewing test details
  const viewTestDetails = (result: any) => {
    setSelectedResult(result)
    setResultDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#EFF4FF] w-full overflow-x-hidden">
      <div className="container mx-auto px-3 py-3 sm:p-4 md:p-5 lg:p-6 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 max-w-full md:max-w-[95%] lg:max-w-7xl">
        {/* Header */}
        <Card className="shadow-sm border border-border/40">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-primary">Assessment Tests</CardTitle>
                <CardDescription className="mt-1 text-xs sm:text-sm">
                  Take required assessments and view your test results
                </CardDescription>
              </div>
              <div className="text-sm text-right">
                <div className="font-medium">{currentOfficer.name}</div>
                <div className="text-xs text-muted-foreground">{currentOfficer.rank} • {currentOfficer.department}</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <Card className="text-white hover:shadow-lg transition-shadow rounded-lg bg-indigo-700">
            <CardContent className="pt-3 pb-2 px-3 md:pt-4 md:pb-3 md:px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-white/80">Available Tests</p>
                  <p className="text-lg md:text-xl lg:text-2xl font-bold mt-0 md:mt-1">{availableTests.length}</p>
                </div>
                <div className="p-2 rounded-full bg-indigo-600/40">
                  <FileText className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="text-white hover:shadow-lg transition-shadow rounded-lg bg-emerald-700">
            <CardContent className="pt-3 pb-2 px-3 md:pt-4 md:pb-3 md:px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-white/80">Completed</p>
                  <p className="text-lg md:text-xl lg:text-2xl font-bold mt-0 md:mt-1">{completedTests.length}</p>
                </div>
                <div className="p-2 rounded-full bg-emerald-600/40">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="text-white hover:shadow-lg transition-shadow rounded-lg bg-amber-600">
            <CardContent className="pt-3 pb-2 px-3 md:pt-4 md:pb-3 md:px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-white/80">Avg. Score</p>
                  <p className="text-lg md:text-xl lg:text-2xl font-bold mt-0 md:mt-1">
                    {completedTests.length > 0 
                      ? `${Math.round(completedTests.reduce((acc, test) => acc + test.percentageScore, 0) / completedTests.length)}%` 
                      : "N/A"}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-amber-500/40">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="text-white hover:shadow-lg transition-shadow rounded-lg bg-blue-700">
            <CardContent className="pt-3 pb-2 px-3 md:pt-4 md:pb-3 md:px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-white/80">Next Due</p>
                  <p className="text-lg md:text-xl lg:text-2xl font-bold mt-0 md:mt-1">
                    {availableTests.length > 0 ? formatDate(new Date()) : "None"}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-blue-600/40">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border border-border/40 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <Tabs defaultValue="available" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <TabsList>
                  <TabsTrigger value="available">Available Tests</TabsTrigger>
                  <TabsTrigger value="completed">Completed Tests</TabsTrigger>
                </TabsList>
                
                <div className="relative flex-grow sm:max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search tests..."
                    className="pl-9 h-9 sm:h-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="available" className="space-y-6 mt-2">
                {availableTests.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {availableTests.map((test) => (
                      <Card key={test.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="p-4 border-b">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-base">{test.title}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {test.description || 'No description available'}
                                </p>
                              </div>
                              <Badge className="bg-emerald-100 text-emerald-800">
                                Available
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-[#EFF4FF]">
                            <div className="flex items-center justify-between text-sm">
                              <div className="space-y-2">
                                <div className="flex items-center gap-1.5">
                                  <Timer className="h-4 w-4 text-slate-500" />
                                  <span>Duration: {test.duration} minutes</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <FileText className="h-4 w-4 text-slate-500" />
                                  <span>Questions: {test.questions.length}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4 text-slate-500" />
                                  <span>Points: {test.totalPoints}</span>
                                </div>
                              </div>
                              
                              <Button onClick={() => startTest(test.id)}>
                                Start Test
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium">No Tests Available</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchTerm ? 'Try adjusting your search term' : 'There are no tests available for you at this time'}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-2">
                {completedTests.length > 0 ? (
                  <div className="bg-white rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">Test Name</th>
                            <th className="px-4 py-3 text-left font-medium">Date Completed</th>
                            <th className="px-4 py-3 text-left font-medium">Score</th>
                            <th className="px-4 py-3 text-left font-medium">Status</th>
                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {completedTests.map(result => (
                            <tr key={result.id} className="hover:bg-[#EFF4FF]">
                              <td className="px-4 py-3">{result.quizTitle}</td>
                              <td className="px-4 py-3">{formatDate(result.endTime)}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span>{result.score}/{result.totalPoints}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({result.percentageScore.toFixed(1)}%)
                                  </span>
                                </div>
                                <Progress 
                                  value={result.percentageScore} 
                                  className="h-1.5 w-24" 
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Badge className={
                                  result.status === 'passed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }>
                                  {result.status === 'passed' ? 'Passed' : 'Failed'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => viewTestDetails(result)}
                                >
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <CheckCircle className="h-6 w-6 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium">No Completed Tests</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      You haven't completed any tests yet
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Test Result Details Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Test Result Details</span>
              <Badge className={cn(
                selectedResult?.status === 'passed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800',
                'text-base px-4 py-1'
              )}>
                {selectedResult?.status === 'passed' ? 'PASSED' : 'FAILED'}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedResult?.quizTitle}
            </DialogDescription>
          </DialogHeader>
          
          {selectedResult && (
            <div className="space-y-6 my-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Officer</div>
                  <div className="font-medium">{selectedResult.officerName}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Completion Time</div>
                  <div className="font-medium">{new Date(selectedResult.endTime).toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Score</div>
                  <div className="font-medium">{selectedResult.score} / {selectedResult.totalPoints} points</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Percentage</div>
                  <div className="font-medium">{selectedResult.percentageScore.toFixed(1)}%</div>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="text-base font-medium mb-4">Score Details</div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      selectedResult.percentageScore >= 80 ? "bg-green-500" :
                      selectedResult.percentageScore >= 60 ? "bg-amber-500" :
                      "bg-red-500"
                    )}
                    style={{ width: `${Math.min(100, selectedResult.percentageScore)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                  <span>0%</span>
                  <span>60% (Pass Threshold)</span>
                  <span>100%</span>
                </div>
              </div>
              
              {selectedResult.answers && selectedResult.answers.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <div className="text-base font-medium mb-4">Question Summary</div>
                  <div className="space-y-2">
                    {selectedResult.answers.map((answer: any, index: number) => (
                      <div 
                        key={answer.questionId} 
                        className={cn(
                          "p-3 border rounded-md flex items-center",
                          answer.correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                        )}
                      >
                        <div className="mr-4">
                          <div className={cn(
                            "rounded-full w-8 h-8 flex items-center justify-center text-white",
                            answer.correct ? "bg-green-500" : "bg-red-500"
                          )}>
                            {answer.correct ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium text-sm">Question {index + 1}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Points: {answer.points} {answer.points === 1 ? 'point' : 'points'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setResultDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TakeTest 