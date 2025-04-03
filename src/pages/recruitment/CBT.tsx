import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store/store"
import { 
  addQuiz, 
  updateQuiz, 
  deleteQuiz, 
  addQuestion,
  updateQuestion,
  deleteQuestion,
  Quiz,
  Question,
  QuestionType,
  QuizResult
} from "@/store/features/quizSlice"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Plus,
  FileText,
  Edit2,
  Eye,
  Trash2,
  CheckSquare,
  Type,
  AlignLeft,
  List,
  Calendar,
  Timer
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"

const CBT = () => {
  // Redux
  const dispatch = useDispatch()
  const { quizzes, results } = useSelector((state: RootState) => state.quiz)
  
  // State
  const [activeTab, setActiveTab] = useState<string>("tests")
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  
  // Filtered quizzes based on search and filter
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || quiz.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Handler for creating a new test
  const handleCreateTest = (data: Partial<Quiz>) => {
    if (editMode && currentQuiz) {
      // Update existing quiz
      const updatedQuiz = { ...currentQuiz, ...data };
      dispatch(updateQuiz(updatedQuiz));
    } else {
      // Create new quiz
      const newQuiz: Quiz = {
        id: Date.now().toString(),
        title: data.title || 'Untitled Test',
        description: data.description,
        duration: data.duration || 30,
        totalPoints: data.totalPoints || 100,
        questions: [],
        dateCreated: new Date(),
        createdBy: 'Admin User',
        status: 'draft'
      };
      dispatch(addQuiz(newQuiz));
    }
    setCreateDialogOpen(false);
    setCurrentQuiz(null);
    setEditMode(false);
  };

  // Handler for editing a test
  const handleEditTest = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setEditMode(true);
    setCreateDialogOpen(true);
  };

  // Handler for deleting a test
  const handleDeleteTest = (quizId: string) => {
    dispatch(deleteQuiz(quizId));
  };

  // Handler for creating a question
  const handleCreateQuestion = (data: Partial<Question>) => {
    if (!currentQuiz) return;

    const question: Question = {
      id: editMode && currentQuestion ? currentQuestion.id : Date.now().toString(),
      type: data.type || 'multiple-choice',
      text: data.text || '',
      options: data.options || [],
      correctAnswer: data.correctAnswer,
      points: data.points || 1
    };

    if (editMode && currentQuestion) {
      // Update existing question
      dispatch(updateQuestion({ quizId: currentQuiz.id, question }));
      
      // Update current quiz in local state to reflect changes
      const updatedQuestions = currentQuiz.questions.map(q => 
        q.id === question.id ? question : q
      );
      setCurrentQuiz({ ...currentQuiz, questions: updatedQuestions });
    } else {
      // Add new question
      dispatch(addQuestion({ quizId: currentQuiz.id, question }));
      
      // Update current quiz in local state to reflect changes
      setCurrentQuiz({ 
        ...currentQuiz, 
        questions: [...currentQuiz.questions, question]
      });
    }
    
    setQuestionDialogOpen(false);
    setCurrentQuestion(null);
    setEditMode(false);
  };

  // Stats data with colors
  const stats = [
    {
      title: 'Total Tests',
      value: quizzes.length,
      icon: BookOpen,
      color: 'bg-indigo-700',
      iconBg: 'bg-indigo-600/40'
    },
    {
      title: 'Completed',
      value: quizzes.filter(q => q.status === 'completed').length,
      icon: CheckCircle,
      color: 'bg-emerald-700',
      iconBg: 'bg-emerald-600/40'
    },
    {
      title: 'Active',
      value: quizzes.filter(q => q.status === 'active').length,
      icon: Clock,
      color: 'bg-amber-600',
      iconBg: 'bg-amber-500/40'
    },
    {
      title: 'Pass Rate',
      value: `${Math.round((results.filter(r => r.status === 'passed').length / Math.max(results.length, 1)) * 100)}%`,
      icon: AlertTriangle,
      color: 'bg-rose-700',
      iconBg: 'bg-rose-600/40'
    }
  ]

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

  // Component for creating/editing a question
  const QuestionForm = () => {
    const [questionType, setQuestionType] = useState<QuestionType>(currentQuestion?.type || 'multiple-choice');
    const [questionText, setQuestionText] = useState(currentQuestion?.text || '');
    const [questionPoints, setQuestionPoints] = useState(currentQuestion?.points || 1);
    const [options, setOptions] = useState<string[]>(currentQuestion?.options || ['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState<string | string[]>(currentQuestion?.correctAnswer || '');

    const addOption = () => {
      setOptions([...options, '']);
    };

    const updateOption = (index: number, value: string) => {
      const newOptions = [...options];
      newOptions[index] = value;
      setOptions(newOptions);
    };

    const removeOption = (index: number) => {
      if (options.length <= 2) return;
      setOptions(options.filter((_, i) => i !== index));
      
      // Reset correct answer if it was the removed option
      if (Array.isArray(correctAnswer)) {
        setCorrectAnswer(correctAnswer.filter(ans => ans !== index.toString()));
      } else if (correctAnswer === index.toString()) {
        setCorrectAnswer('');
      }
    };

    // Handle multiple answer selection (for multiple-answer type questions)
    const handleMultipleAnswerChange = (index: string, checked: boolean) => {
      if (!Array.isArray(correctAnswer)) {
        // Convert to array if it's not already
        setCorrectAnswer(checked ? [index] : []);
      } else {
        if (checked) {
          // Add to selected answers
          setCorrectAnswer([...correctAnswer, index]);
        } else {
          // Remove from selected answers
          setCorrectAnswer(correctAnswer.filter(i => i !== index));
        }
      }
    };

    const handleSubmit = () => {
      handleCreateQuestion({
        type: questionType,
        text: questionText,
        options: options.filter(o => o.trim() !== ''),
        correctAnswer,
        points: questionPoints
      });
    };

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="questionType">Question Type</Label>
          <Select value={questionType} onValueChange={(value) => {
            setQuestionType(value as QuestionType);
            // Reset correctAnswer when changing type
            if (value === 'multiple-answer') {
              setCorrectAnswer([]);
            } else if (value === 'true-false') {
              setCorrectAnswer('');
            } else if (value === 'multiple-choice') {
              setCorrectAnswer('');
            }
          }}>
            <SelectTrigger id="questionType" className="w-full">
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple-choice">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  <span>Multiple Choice (Single Answer)</span>
                </div>
              </SelectItem>
              <SelectItem value="multiple-answer">
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span>Multiple Choice (Multiple Answers)</span>
                </div>
              </SelectItem>
              <SelectItem value="true-false">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  <span>True/False</span>
                </div>
              </SelectItem>
              <SelectItem value="text">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  <span>Short Answer</span>
                </div>
              </SelectItem>
              <SelectItem value="essay">
                <div className="flex items-center gap-2">
                  <AlignLeft className="h-4 w-4" />
                  <span>Essay/Long Answer</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="questionText">Question Text</Label>
          <Textarea 
            id="questionText" 
            placeholder="Enter your question here" 
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <div>
          <Label htmlFor="points">Points</Label>
          <Input 
            id="points" 
            type="number" 
            min="1" 
            value={questionPoints}
            onChange={(e) => setQuestionPoints(parseInt(e.target.value))}
          />
        </div>
        
        {questionType === 'multiple-choice' && (
          <div className="space-y-3">
            <Label>Answer Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Checkbox 
                  id={`option-${index}`} 
                  checked={correctAnswer === index.toString()} 
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setCorrectAnswer(index.toString());
                    } else {
                      setCorrectAnswer('');
                    }
                  }}
                />
                <Input 
                  value={option} 
                  onChange={(e) => updateOption(index, e.target.value)} 
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addOption}>
              Add Option
            </Button>
          </div>
        )}
        
        {questionType === 'multiple-answer' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Answer Options (Select All Correct Answers)</Label>
              <Badge variant="outline" className="text-xs">
                Multiple Answers Allowed
              </Badge>
            </div>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Checkbox 
                  id={`option-${index}`}
                  checked={Array.isArray(correctAnswer) && correctAnswer.includes(index.toString())}
                  onCheckedChange={(checked) => handleMultipleAnswerChange(index.toString(), !!checked)}
                />
                <Input 
                  value={option} 
                  onChange={(e) => updateOption(index, e.target.value)} 
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addOption}>
              Add Option
            </Button>
          </div>
        )}
        
        {questionType === 'true-false' && (
          <div className="space-y-3">
            <Label>Correct Answer</Label>
            <RadioGroup 
              value={correctAnswer as string} 
              onValueChange={setCorrectAnswer}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false">False</Label>
              </div>
            </RadioGroup>
          </div>
        )}
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setQuestionDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editMode ? 'Update Question' : 'Add Question'}
          </Button>
        </div>
      </div>
    );
  };

  // Test Builder component
  const TestBuilder = () => {
    if (!currentQuiz) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{currentQuiz.title}</h2>
            <p className="text-sm text-muted-foreground">{currentQuiz.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setQuestionDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Question
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="space-x-4">
            <Badge variant="outline" className="flex gap-1 items-center">
              <Clock className="h-4 w-4" />
              Duration: {currentQuiz.duration} minutes
            </Badge>
            <Badge variant="outline" className="flex gap-1 items-center">
              <FileText className="h-4 w-4" />
              Total Points: {currentQuiz.totalPoints}
            </Badge>
          </div>
          <Badge className={getStatusColor(currentQuiz.status)}>
            {currentQuiz.status.charAt(0).toUpperCase() + currentQuiz.status.slice(1)}
          </Badge>
        </div>
        
        <div className="border rounded-md">
          {currentQuiz.questions.length > 0 ? (
            <div className="divide-y">
              {currentQuiz.questions.map((question, index) => (
                <div key={question.id} className="p-4 hover:bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-200 text-slate-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <h3 className="font-medium">{question.text}</h3>
                      </div>
                      <div className="mt-2 pl-8">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {question.type === 'multiple-choice' ? 'Multiple Choice' : 
                             question.type === 'true-false' ? 'True/False' :
                             question.type === 'text' ? 'Short Answer' : 'Essay'}
                          </Badge>
                          <span>{question.points} {question.points === 1 ? 'point' : 'points'}</span>
                        </div>
                        
                        {question.type === 'multiple-choice' && question.options && (
                          <ul className="mt-2 space-y-1 text-sm">
                            {question.options.map((option, optIndex) => (
                              <li key={optIndex} className={cn(
                                "pl-2",
                                question.correctAnswer === optIndex.toString() && "font-medium text-emerald-600"
                              )}>
                                {option} {question.correctAnswer === optIndex.toString() && "(Correct)"}
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {question.type === 'multiple-answer' && question.options && (
                          <ul className="mt-2 space-y-1 text-sm">
                            {question.options.map((option, optIndex) => (
                              <li key={optIndex} className={cn(
                                "pl-2",
                                Array.isArray(question.correctAnswer) && 
                                question.correctAnswer.includes(optIndex.toString()) && 
                                "font-medium text-emerald-600"
                              )}>
                                {option} {Array.isArray(question.correctAnswer) && 
                                         question.correctAnswer.includes(optIndex.toString()) && 
                                         "(Correct)"}
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {question.type === 'true-false' && (
                          <div className="mt-2 text-sm">
                            Correct Answer: <span className="font-medium">
                              {question.correctAnswer === 'true' ? 'True' : 'False'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setCurrentQuestion(question);
                        setEditMode(true);
                        setQuestionDialogOpen(true);
                      }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        dispatch(deleteQuestion({ quizId: currentQuiz.id, questionId: question.id }));
                        
                        // Update current quiz in local state to reflect changes
                        const updatedQuestions = currentQuiz.questions.filter(q => q.id !== question.id);
                        setCurrentQuiz({ ...currentQuiz, questions: updatedQuestions });
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium">No Questions Yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start by adding your first question to this test.
              </p>
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={() => setQuestionDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Question
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setCurrentQuiz(null)}>
            Back to Tests
          </Button>
          <Button onClick={() => {
            const updatedQuiz = { ...currentQuiz, status: 'active' as const };
            dispatch(updateQuiz(updatedQuiz));
            setCurrentQuiz(null);
          }} disabled={currentQuiz.questions.length === 0}>
            Publish Test
          </Button>
        </div>
      </div>
    );
  };

  // Results Tab content
  const ResultsTab = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Test Results</h2>
          <div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by test" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                {quizzes.map(quiz => (
                  <SelectItem key={quiz.id} value={quiz.id}>{quiz.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Officer</th>
                  <th className="px-4 py-3 text-left font-medium">Test</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Score</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.map(result => (
                  <tr key={result.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{result.officerName}</td>
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
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-slate-50 w-full overflow-x-hidden">
      <div className="container mx-auto px-3 py-3 sm:p-4 md:p-5 lg:p-6 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 max-w-full md:max-w-[95%] lg:max-w-7xl">
        {/* Header Card */}
        <Card className="shadow-sm border border-border/40">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-primary">CBT Assessment</CardTitle>
                <CardDescription className="mt-1 text-xs sm:text-sm">Manage and monitor candidate assessment tests</CardDescription>
              </div>
              <Button 
                className="w-full sm:w-auto h-9 text-xs sm:text-sm"
                onClick={() => {
                  setCurrentQuiz(null);
                  setEditMode(false);
                  setCreateDialogOpen(true);
                }}
              >
                <Plus className="h-5 w-5 mr-1 sm:mr-2" />
                <span className="sm:hidden">Add Test</span>
                <span className="hidden sm:inline">Create New Test</span>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {stats.map((stat) => (
            <Card 
              key={stat.title} 
              className={cn(
                "text-white hover:shadow-lg transition-shadow rounded-lg",
                stat.color 
              )}
            >
              <CardContent className="pt-3 pb-2 px-3 md:pt-4 md:pb-3 md:px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-white/80">{stat.title}</p>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold mt-0 md:mt-1">{stat.value}</p>
                  </div>
                  <div className={cn("p-2 rounded-full", stat.iconBg)}>
                    <stat.icon className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Card className="border border-border/40 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            {currentQuiz ? (
              <TestBuilder />
            ) : (
              <>
                <Tabs defaultValue="tests" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="tests">Tests</TabsTrigger>
                    <TabsTrigger value="results">Results</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="tests" className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
                      <div className="relative flex-grow">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search tests..."
                          className="pl-9 h-9 sm:h-10 w-full"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="h-9 sm:h-10 w-full sm:w-[180px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-4">
                      {filteredQuizzes.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredQuizzes.map((quiz) => (
                            <Card key={quiz.id} className="hover:shadow-md transition-all">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-base">{quiz.title}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {quiz.description || 'No description'}
                                    </p>
                                  </div>
                                  <Badge className={getStatusColor(quiz.status)}>
                                    {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Timer className="h-3.5 w-3.5" />
                                    <span>{quiz.duration} min</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <FileText className="h-3.5 w-3.5" />
                                    <span>{quiz.questions.length} questions</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    <span>{quiz.totalPoints} points</span>
                                  </div>
                                </div>
                                
                                {quiz.scheduledDate && (
                                  <div className="mt-2 flex items-center gap-1 text-xs">
                                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                    <span>Scheduled: {formatDate(quiz.scheduledDate)}</span>
                                  </div>
                                )}
                                
                                <div className="mt-3 pt-3 border-t border-border/20 flex justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    Created: {formatDate(quiz.dateCreated)}
                                  </span>
                                  <div className="flex gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0" 
                                      onClick={() => setCurrentQuiz(quiz)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleEditTest(quiz)}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleDeleteTest(quiz.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
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
                          <h3 className="text-lg font-medium">No Tests Found</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {searchTerm || filterStatus !== 'all' 
                              ? 'Try adjusting your search or filters' 
                              : 'Create your first test to get started'}
                          </p>
                          {!searchTerm && filterStatus === 'all' && (
                            <Button 
                              className="mt-4" 
                              onClick={() => {
                                setCurrentQuiz(null);
                                setEditMode(false);
                                setCreateDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Create Test
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="results">
                    <ResultsTab />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Test Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Test' : 'Create New Test'}</DialogTitle>
            <DialogDescription>
              {editMode 
                ? 'Update the details for this test' 
                : 'Define the basic details for your new assessment test'}
            </DialogDescription>
          </DialogHeader>
          
          <form id="create-test-form" className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Test Title</Label>
              <Input 
                id="title" 
                name="title"
                placeholder="Enter test title" 
                defaultValue={currentQuiz?.title || ''} 
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                name="description"
                placeholder="Briefly describe the purpose of this test" 
                defaultValue={currentQuiz?.description || ''} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input 
                  id="duration" 
                  name="duration"
                  type="number" 
                  min="1" 
                  defaultValue={currentQuiz?.duration || 30}
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="points">Total Points</Label>
                <Input 
                  id="points" 
                  name="points"
                  type="number" 
                  min="1" 
                  defaultValue={currentQuiz?.totalPoints || 100} 
                  required
                />
              </div>
            </div>
          </form>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const form = document.getElementById('create-test-form') as HTMLFormElement;
              if (form) {
                const formData = new FormData(form);
                
                handleCreateTest({
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  duration: parseInt(formData.get('duration') as string) || 30,
                  totalPoints: parseInt(formData.get('points') as string) || 100
                });
              }
            }}>
              {editMode ? 'Update Test' : 'Create Test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Question' : 'Add Question'}</DialogTitle>
            <DialogDescription>
              {editMode 
                ? 'Update the details for this question' 
                : 'Create a new question for your test'}
            </DialogDescription>
          </DialogHeader>
          
          <QuestionForm />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CBT