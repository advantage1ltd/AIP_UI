import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store/store"
import { submitQuizResult, Answer, QuizResult } from "@/store/features/quizSlice"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Timer, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Mock types - these should match the ones in CBT.tsx
interface Question {
  id: string
  type: 'multiple-choice' | 'true-false' | 'text' | 'essay' | 'multiple-answer'
  text: string
  options?: string[]
  correctAnswer?: string | string[]
  points: number
}

interface Quiz {
  id: string
  title: string
  description?: string
  duration: number
  totalPoints: number
  questions: Question[]
  dateCreated: Date
  createdBy: string
  status: 'draft' | 'active' | 'scheduled' | 'completed'
  scheduledDate?: Date
}

// Sample test data - In a real app, this would be fetched from an API
const sampleTest: Quiz = {
  id: '1',
  title: 'Security Protocols Assessment',
  description: 'Test on basic security protocols and procedures',
  duration: 45, // minutes
  totalPoints: 100,
  questions: Array(15).fill(null).map((_, i) => {
    // Mix of question types
    if (i % 5 === 0) {
      return {
        id: `q${i}`,
        type: 'true-false',
        text: `True or False: Security protocol ${i+1} requires immediate reporting of all incidents.`,
        correctAnswer: Math.random() > 0.5 ? 'true' : 'false',
        points: 5
      };
    } else if (i % 5 === 4) {
      return {
        id: `q${i}`,
        type: 'essay',
        text: `Explain in detail how you would handle a security breach in scenario ${i+1}.`,
        points: 10
      };
    } else {
      return {
        id: `q${i}`,
        type: 'multiple-choice',
        text: `Which of the following is the correct procedure for security protocol ${i+1}?`,
        options: [
          `Option 1 for question ${i+1}`,
          `Option 2 for question ${i+1}`,
          `Option 3 for question ${i+1}`,
          `Option 4 for question ${i+1}`
        ],
        correctAnswer: Math.floor(Math.random() * 4).toString(),
        points: 5
      };
    }
  }),
  dateCreated: new Date(),
  createdBy: 'Admin User',
  status: 'active'
};

// Component for the actual test-taking session
const TestSession = () => {
  console.log("TestSession component is rendering with testId:", useParams().testId); // Debug statement
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { testId } = useParams();
  
  // Get quiz from Redux store
  const quiz = useSelector((state: RootState) => 
    state.quiz.quizzes.find(q => q.id === testId)
  );
  
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: string]: string | string[]}>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<QuizResult | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock current user
  const currentUser = {
    id: 'OFF001',
    name: 'John Smith',
    rank: 'Store Detective',
    department: 'Operations'
  };

  // Load test data
  useEffect(() => {
    if (quiz) {
      setTimeRemaining(quiz.duration * 60); // convert minutes to seconds
      setLoading(false);
    } else if (testId) {
      // If we don't have the quiz in Redux, navigate back
      navigate('/recruitment/take-test');
    }
  }, [quiz, testId, navigate]);

  // Timer functionality
  useEffect(() => {
    if (testStarted && timeRemaining > 0 && !testSubmitted) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-submit when time runs out
            clearInterval(timerIntervalRef.current!);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [testStarted, testSubmitted]);

  // Format time remaining as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate percentage of time elapsed
  const timeElapsedPercentage = quiz 
    ? 100 - (timeRemaining / (quiz.duration * 60) * 100)
    : 0;

  // Handle start test
  const handleStartTest = () => {
    setTestStarted(true);
  };

  // Handle answer changes
  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Navigation functions
  const goToNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (quiz && index >= 0 && index < quiz.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Submit test
  const handleSubmitTest = () => {
    if (!quiz) return;
    
    // Stop the timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    setTestSubmitted(true);
    
    // Calculate score
    let totalScore = 0;
    const answeredQuestions: Answer[] = quiz.questions.map(question => {
      const userAnswer = answers[question.id] || '';
      let correct = false;
      let pointsEarned = 0;
      
      // For auto-graded questions (multiple choice and true/false)
      if (question.type === 'multiple-choice') {
        // For multiple choice, we need to compare the actual option content
        // since our RadioGroup uses option text as values
        const userAnswerIndex = question.options?.findIndex(opt => opt === userAnswer);
        correct = userAnswerIndex !== undefined && userAnswerIndex !== -1 && 
                 question.correctAnswer === userAnswerIndex.toString();
        pointsEarned = correct ? question.points : 0;
        totalScore += pointsEarned;
      } else if (question.type === 'multiple-answer' && Array.isArray(question.correctAnswer) && Array.isArray(userAnswer)) {
        // For multiple-answer questions, compare arrays of selected options
        // Only award points if ALL correct answers are selected and NO incorrect answers are selected
        const correctAnswers = new Set(question.correctAnswer);
        const userAnswers = new Set(userAnswer);
        
        // Check if user selected all correct answers
        const allCorrectSelected = [...correctAnswers].every(ans => userAnswers.has(ans));
        // Check if user selected only correct answers
        const onlyCorrectSelected = [...userAnswers].every(ans => correctAnswers.has(ans));
        
        // Full points if perfect match, partial points if some answers match
        if (allCorrectSelected && onlyCorrectSelected) {
          // Perfect match - all correct answers and only correct answers
          correct = true;
          pointsEarned = question.points;
        } else if (userAnswers.size > 0) {
          // Partial credit for partially correct answers (at least one correct option selected)
          correct = false;
          
          // Calculate how many correct selections the user made
          const correctSelections = [...userAnswers].filter(ans => correctAnswers.has(ans)).length;
          const incorrectSelections = userAnswers.size - correctSelections;
          
          // Award points based on ratio of correct selections, penalize for incorrect ones
          const maxPossibleCorrect = correctAnswers.size;
          const correctRatio = correctSelections / maxPossibleCorrect;
          const incorrectPenalty = incorrectSelections / userAnswers.size;
          
          // Calculate points: (correct ratio - incorrect penalty) * max points, minimum 0
          pointsEarned = Math.max(0, Math.round((correctRatio - incorrectPenalty * 0.5) * question.points));
        } else {
          correct = false;
          pointsEarned = 0;
        }
        
        totalScore += pointsEarned;
      } else if (question.type === 'true-false') {
        correct = userAnswer === question.correctAnswer;
        pointsEarned = correct ? question.points : 0;
        totalScore += pointsEarned;
      }
      // Essay and text questions would normally be graded by a human
      // For demo purposes, we'll give partial points
      else {
        // Count text length and give points based on length (just for demo)
        const textLength = typeof userAnswer === 'string' ? userAnswer.length : 0;
        correct = textLength > 20; // arbitrary minimum length
        pointsEarned = Math.min(
          question.points,
          Math.floor(textLength / 50 * question.points)
        );
        totalScore += pointsEarned;
      }
      
      return {
        questionId: question.id,
        answer: userAnswer,
        correct,
        points: pointsEarned
      };
    });
    
    // Create test result
    const percentageScore = (totalScore / quiz.totalPoints) * 100;
    const result: QuizResult = {
      id: Date.now().toString(),
      quizId: quiz.id,
      quizTitle: quiz.title,
      officerId: currentUser.id,
      officerName: currentUser.name,
      score: totalScore,
      totalPoints: quiz.totalPoints,
      percentageScore,
      startTime: new Date(Date.now() - (quiz.duration * 60 * 1000 - timeRemaining * 1000)),
      endTime: new Date(),
      status: percentageScore >= 60 ? 'passed' as const : 'failed' as const,
      answers: answeredQuestions
    };
    
    // Dispatch the result to Redux
    dispatch(submitQuizResult(result));
    
    setTestResult(result);
    setShowResults(true);
  };

  // Handle going back to tests list
  const handleBackToTests = () => {
    navigate('/recruitment/take-test');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 pb-4 px-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-xl mb-2">Test Not Found</CardTitle>
              <p className="text-muted-foreground mb-6">The test you're looking for doesn't exist or has been removed.</p>
              <Button onClick={handleBackToTests}>Back to Tests</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If the test is finished, show results
  if (showResults && testResult) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl sm:text-2xl">Test Results</CardTitle>
                <CardDescription>{quiz.title}</CardDescription>
              </div>
              <Badge className={cn(
                testResult.status === 'passed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800',
                'text-base px-4 py-1'
              )}>
                {testResult.status === 'passed' ? 'PASSED' : 'FAILED'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Officer</div>
                <div className="font-medium">{testResult.officerName}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Completion Time</div>
                <div className="font-medium">{new Date(testResult.endTime).toLocaleString()}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Score</div>
                <div className="font-medium">{testResult.score} / {testResult.totalPoints} points</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Percentage</div>
                <div className="font-medium">{testResult.percentageScore.toFixed(1)}%</div>
              </div>
            </div>
            
            <div className="pt-4">
              <div className="text-base font-medium mb-4">Score Details</div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full",
                    testResult.percentageScore >= 80 ? "bg-green-500" :
                    testResult.percentageScore >= 60 ? "bg-amber-500" :
                    "bg-red-500"
                  )}
                  style={{ width: `${Math.min(100, testResult.percentageScore)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                <span>0%</span>
                <span>60% (Pass Threshold)</span>
                <span>100%</span>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="text-base font-medium mb-4">Question Summary</div>
              <div className="space-y-2">
                {quiz.questions.map((question, index) => {
                  const answer = testResult.answers.find(a => a.questionId === question.id);
                  return (
                    <div 
                      key={question.id} 
                      className={cn(
                        "p-3 border rounded-md flex items-center",
                        answer?.correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                      )}
                    >
                      <div className="mr-4">
                        <div className={cn(
                          "rounded-full w-8 h-8 flex items-center justify-center text-white",
                          answer?.correct ? "bg-green-500" : "bg-red-500"
                        )}>
                          {answer?.correct ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium text-sm">{`Question ${index + 1}: ${question.type}`}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Test intro screen (before starting)
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-3xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">{quiz.title}</CardTitle>
            <CardDescription>{quiz.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
              <h3 className="font-medium text-blue-900 mb-2">Test Instructions</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  <span>This test has {quiz.questions.length} questions worth a total of {quiz.totalPoints} points.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  <span>You have {quiz.duration} minutes to complete the test.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  <span>You can navigate between questions using the previous and next buttons.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  <span>Your answers are saved as you go.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  <span>You must score at least 60% to pass this assessment.</span>
                </li>
              </ul>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b py-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Duration</div>
                <div className="text-lg font-medium">{quiz.duration} minutes</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Questions</div>
                <div className="text-lg font-medium">{quiz.questions.length} questions</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Points</div>
                <div className="text-lg font-medium">{quiz.totalPoints} points</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Pass Threshold</div>
                <div className="text-lg font-medium">60%</div>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-md border border-amber-100 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Important:</p>
                  <p>Once you start the test, the timer will begin. You cannot pause the test. Make sure you have enough time to complete it before starting.</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" onClick={handleBackToTests}>
              Back to Tests
            </Button>
            <Button onClick={handleStartTest}>
              Start Test
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Active test view
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Timer bar */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-slate-700" />
            <span className={cn(
              "font-medium",
              timeRemaining < 300 ? "text-red-600" : 
              timeRemaining < 600 ? "text-amber-600" : 
              "text-slate-700"
            )}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          
          <div className="flex-grow mx-4 max-w-md">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-1000",
                  timeElapsedPercentage > 75 ? "bg-red-500" :
                  timeElapsedPercentage > 50 ? "bg-amber-500" :
                  "bg-emerald-500"
                )}
                style={{ width: `${timeElapsedPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => setConfirmSubmit(true)}
          >
            Submit Test
          </Button>
        </div>
      </div>
      
      <div className="container mx-auto pt-16 p-3 sm:p-6">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Question {currentQuestionIndex + 1} of {quiz.questions.length}</CardTitle>
                <CardDescription>{quiz.questions[currentQuestionIndex].text}</CardDescription>
              </div>
              <Badge variant="outline">
                {quiz.questions[currentQuestionIndex].points} {quiz.questions[currentQuestionIndex].points === 1 ? 'point' : 'points'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Multiple Choice Question */}
            {quiz.questions[currentQuestionIndex].type === 'multiple-choice' && quiz.questions[currentQuestionIndex].options && (
              <RadioGroup 
                value={answers[quiz.questions[currentQuestionIndex].id] as string || ''} 
                onValueChange={(value) => handleAnswerChange(quiz.questions[currentQuestionIndex].id, value)}
                className="space-y-3"
              >
                {quiz.questions[currentQuestionIndex].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-slate-50">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {/* True/False Question */}
            {quiz.questions[currentQuestionIndex].type === 'true-false' && (
              <RadioGroup 
                value={answers[quiz.questions[currentQuestionIndex].id] as string || ''} 
                onValueChange={(value) => handleAnswerChange(quiz.questions[currentQuestionIndex].id, value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-slate-50">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true" className="flex-grow cursor-pointer">True</Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-slate-50">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false" className="flex-grow cursor-pointer">False</Label>
                </div>
              </RadioGroup>
            )}
            
            {/* Text Question */}
            {quiz.questions[currentQuestionIndex].type === 'text' && (
              <Input 
                value={(answers[quiz.questions[currentQuestionIndex].id] as string) || ''} 
                onChange={(e) => handleAnswerChange(quiz.questions[currentQuestionIndex].id, e.target.value)}
                placeholder="Enter your answer"
                className="w-full"
              />
            )}
            
            {/* Essay Question */}
            {quiz.questions[currentQuestionIndex].type === 'essay' && (
              <Textarea 
                value={(answers[quiz.questions[currentQuestionIndex].id] as string) || ''} 
                onChange={(e) => handleAnswerChange(quiz.questions[currentQuestionIndex].id, e.target.value)}
                placeholder="Write your answer here..."
                className="w-full min-h-[200px]"
              />
            )}
            
            {/* Multiple-Answer Question */}
            {quiz.questions[currentQuestionIndex].type === 'multiple-answer' && quiz.questions[currentQuestionIndex].options && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Multiple Answers Allowed</Badge>
                  <span className="text-sm text-muted-foreground">Select all that apply</span>
                </div>
                {quiz.questions[currentQuestionIndex].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-slate-50">
                    <Checkbox 
                      id={`option-${index}`} 
                      checked={
                        Array.isArray(answers[quiz.questions[currentQuestionIndex].id]) && 
                        (answers[quiz.questions[currentQuestionIndex].id] as string[]).includes(index.toString())
                      }
                      onCheckedChange={(checked) => {
                        const questionId = quiz.questions[currentQuestionIndex].id;
                        const currentAnswers = answers[questionId] || [];
                        let newAnswers: string[];
                        
                        if (!Array.isArray(currentAnswers)) {
                          // Convert to array if it wasn't already
                          newAnswers = checked ? [index.toString()] : [];
                        } else {
                          if (checked) {
                            // Add this option to selected answers
                            newAnswers = [...currentAnswers, index.toString()];
                          } else {
                            // Remove this option from selected answers
                            newAnswers = currentAnswers.filter(ans => ans !== index.toString());
                          }
                        }
                        
                        handleAnswerChange(questionId, newAnswers);
                      }}
                    />
                    <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">{option}</Label>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
              <div className="text-sm text-muted-foreground">
                {Object.keys(answers).length} of {quiz.questions.length} questions answered
              </div>
              <Progress value={(Object.keys(answers).length / quiz.questions.length) * 100} className="h-2 sm:w-[200px]" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button 
              variant="outline" 
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button 
                variant="default"
                onClick={() => setConfirmSubmit(true)}
              >
                Finish Test
              </Button>
            ) : (
              <Button 
                variant="default"
                onClick={goToNextQuestion}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {/* Confirm submit dialog */}
      <AlertDialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              {Object.keys(answers).length === quiz.questions.length ? (
                "You have answered all questions. Once submitted, you cannot change your answers."
              ) : (
                `You have answered ${Object.keys(answers).length} out of ${quiz.questions.length} questions. Unanswered questions will be marked as incorrect.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Test</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitTest}>Submit Test</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TestSession