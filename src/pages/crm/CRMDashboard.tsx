import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  UserPlus, 
  CheckSquare, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Activity,
  ArrowRight,
  Clock,
  DollarSign,
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlertCircle,
  Check,
  PoundSterling
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store/store'
import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom'
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { format, subDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, addMonths, subMonths } from 'date-fns'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ToastAction } from "@/components/ui/toast"

// Define types for our dashboard data
interface DashboardStats {
  totalLeads: number;
  activeContacts: number;
  openTasks: number;
  conversionRate: number;
  leadGrowth: number;
  contactGrowth: number;
  tasksDueToday: number;
  recentActivities: Activity[];
  leadSources: {
    source: string;
    count: number;
    percentage: number;
  }[];
  upcomingTasks: Task[];
  performanceMetrics: {
    metric: string;
    value: number;
    target: number;
    change: number;
  }[];
}

interface Activity {
  id: string;
  type: 'lead' | 'task' | 'deal';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ReactNode;
}

interface Task {
  id: string;
  title: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  contactId?: string;
}

export default function CRMDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  
  // Replace Redux selector with local state for leads
  const [leads, setLeads] = useState<any[]>([
    { id: '1', name: 'John Doe', company: 'Acme Inc', status: 'New Lead', source: 'Website' },
    { id: '2', name: 'Jane Smith', company: 'XYZ Corp', status: 'Qualified', source: 'Referral' },
    { id: '3', name: 'Bob Johnson', company: 'ABC Ltd', status: 'Negotiation', source: 'LinkedIn' }
  ]);
  
  // We would normally get these from Redux store as well
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Follow up with John Smith',
      dueDate: new Date(),
      priority: 'high',
      completed: false,
      contactId: '1'
    },
    {
      id: '2',
      title: 'Send proposal to Acme Inc',
      dueDate: new Date(),
      priority: 'medium',
      completed: false
    },
    {
      id: '3',
      title: 'Schedule demo with Tech Solutions',
      dueDate: subDays(new Date(), 1),
      priority: 'medium',
      completed: true
    },
    {
      id: '4',
      title: 'Prepare quarterly report',
      dueDate: subDays(new Date(), 2),
      priority: 'low',
      completed: false
    },
    {
      id: '5',
      title: 'Review marketing strategy',
      dueDate: subDays(new Date(), 3),
      priority: 'high',
      completed: false
    }
  ]);
  
  // Keep using the existing leads state but make it sync with Redux in the future
  const [leadsState, setLeadsState] = useState([
    { id: '1', name: 'John Smith', company: 'Acme Inc', status: 'New', source: 'Website' },
    { id: '2', name: 'Sarah Johnson', company: 'Tech Solutions', status: 'Qualified', source: 'Referral' }
  ]);
  
  // Calculate dashboard statistics
  const calculateStats = (): DashboardStats => {
    // Count open tasks
    const openTasksCount = tasks.filter(task => !task.completed).length;
    const tasksDueToday = tasks.filter(task => 
      !task.completed && 
      new Date(task.dueDate).toDateString() === new Date().toDateString()
    ).length;
    
    // Calculate lead sources using leads from Redux
    const sourceCount: Record<string, number> = {};
    leads.forEach(lead => {
      sourceCount[lead.source] = (sourceCount[lead.source] || 0) + 1;
    });
    
    const leadSources = Object.entries(sourceCount).map(([source, count]) => ({
      source,
      count,
      percentage: Math.round((count / leads.length) * 100)
    })).sort((a, b) => b.count - a.count);
    
    // Generate recent activities
    const recentActivities: Activity[] = [
      {
        id: '1',
        type: 'lead',
        title: 'New lead created',
        description: `${leads[0]?.name || 'Unknown'} from ${leads[0]?.company || 'Unknown'}`,
        timestamp: new Date(),
        icon: <div className="rounded-full bg-blue-50 p-1.5 mt-0.5">
                <UserPlus className="h-3.5 w-3.5 text-blue-600" />
              </div>
      },
      {
        id: '2',
        type: 'task',
        title: 'Task completed',
        description: 'Follow-up call with Sarah Johnson',
        timestamp: subDays(new Date(), 1),
        icon: <div className="rounded-full bg-green-50 p-1.5 mt-0.5">
                <CheckSquare className="h-3.5 w-3.5 text-green-600" />
              </div>
      },
      {
        id: '3',
        type: 'deal',
        title: 'Deal status updated',
        description: 'Tech Solutions proposal moved to negotiation',
        timestamp: subDays(new Date(), 2),
        icon: <div className="rounded-full bg-amber-50 p-1.5 mt-0.5">
                <Activity className="h-3.5 w-3.5 text-amber-600" />
              </div>
      }
    ];
    
    // Performance metrics
    const performanceMetrics = [
      {
        metric: 'Deals Closed',
        value: 12,
        target: 15,
        change: 8.5
      },
      {
        metric: 'Revenue',
        value: 45600,
        target: 50000,
        change: 12.3
      },
      {
        metric: 'Customer Satisfaction',
        value: 4.7,
        target: 4.8,
        change: 2.1
      },
      {
        metric: 'Response Time',
        value: 3.2,
        target: 3.0,
        change: -5.2
      }
    ];
    
    return {
      totalLeads: leads.length,
      activeContacts: contacts.length,
      openTasks: openTasksCount,
      conversionRate: 32,
      leadGrowth: leads.length > 0 ? 8.2 : 0,
      contactGrowth: contacts.length > 0 ? 12.4 : 0,
      tasksDueToday,
      recentActivities,
      leadSources,
      upcomingTasks: tasks.filter(task => !task.completed).slice(0, 5),
      performanceMetrics
    };
  };
  
  const stats = calculateStats();
  
  // Navigation functions
  const navigateToContacts = () => {
    navigate('/crm/contacts');
  };

  const navigateToLeads = () => {
    // Switch to the leads tab in the current page
    navigate('/crm/leads');
  };

  const navigateToTasks = () => {
    navigate('/crm/tasks');
  };

  // Calendar state
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("meeting");
  const [eventTime, setEventTime] = useState("09:00");
  const [eventDuration, setEventDuration] = useState("30");
  const [eventDescription, setEventDescription] = useState("");
  const [selectedContact, setSelectedContact] = useState("");
  const [scheduledEvents, setScheduledEvents] = useState<Array<{
    id: string;
    title: string;
    type: string;
    date: Date;
    time: string;
    duration: string;
    description: string;
    contactId?: string;
    notificationSent: boolean;
  }>>([
    {
      id: '1',
      title: 'Follow-up call',
      type: 'call',
      date: new Date(),
      time: '10:00',
      duration: '15',
      description: 'Discuss proposal details',
      contactId: '1',
      notificationSent: true
    },
    {
      id: '2',
      title: 'Product demo',
      type: 'meeting',
      date: addDays(new Date(), 1),
      time: '14:00',
      duration: '60',
      description: 'Show new features',
      contactId: '2',
      notificationSent: true
    }
  ]);
  
  // Show upcoming events notification on component mount
  useEffect(() => {
    const upcomingEvents = scheduledEvents.filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      return eventDate >= today && eventDate <= addDays(today, 1);
    });
    
    if (upcomingEvents.length > 0) {
      toast({
        title: `You have ${upcomingEvents.length} upcoming event${upcomingEvents.length > 1 ? 's' : ''}`,
        description: "Check your calendar for details",
        action: (
          <ToastAction altText="View" onClick={handleSchedule}>
            View
          </ToastAction>
        ),
      });
    }
  }, []);
  
  const handleSchedule = () => {
    setIsScheduleDialogOpen(true);
  };
  
  const handleCloseScheduleDialog = () => {
    setIsScheduleDialogOpen(false);
    resetScheduleForm();
  };
  
  const resetScheduleForm = () => {
    setSelectedDate(null);
    setEventTitle("");
    setEventType("meeting");
    setEventTime("09:00");
    setEventDuration("30");
    setEventDescription("");
    setSelectedContact("");
  };
  
  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleScheduleEvent = () => {
    if (!selectedDate || !eventTitle) {
      toast({
        title: "Missing information",
        description: "Please provide an event title and select a date.",
        variant: "destructive"
      });
      return;
    }
    
    // Ensure the date is a proper Date object
    const eventDate = new Date(selectedDate);
    
    const newEvent = {
      id: Date.now().toString(),
      title: eventTitle,
      type: eventType,
      date: eventDate,
      time: eventTime,
      duration: eventDuration,
      description: eventDescription,
      contactId: selectedContact || undefined,
      notificationSent: false
    };
    
    // Add to local state
    setScheduledEvents([...scheduledEvents, newEvent]);
    
    // In a real app, this would be an API call to save the event
    // For demo purposes, we'll simulate a successful save
    setTimeout(() => {
      // Show success toast
      toast({
        title: "Event scheduled successfully",
        description: `${eventTitle} on ${format(selectedDate, 'PPP')} at ${eventTime}`,
        action: (
          <ToastAction altText="View" onClick={() => viewEventDetails(newEvent)}>
            View
          </ToastAction>
        ),
      });
      
      // Simulate sending email notification
      simulateSendNotification(newEvent);
      
      // Close dialog
      handleCloseScheduleDialog();
      
      // Update local storage (in a real app, this would be a database)
      const updatedEvents = [...scheduledEvents, newEvent];
      localStorage.setItem('crm_scheduled_events', JSON.stringify(updatedEvents));
      
    }, 500);
  };
  
  // Simulate sending notification
  const simulateSendNotification = (event: any) => {
    console.log(`Email notification would be sent for: ${event.title}`);
    
    // In a real app, this would call an API endpoint to send an email
    // For demo purposes, we'll just show a toast after a delay
    setTimeout(() => {
      toast({
        title: "Notification sent",
        description: `Email notification sent for "${event.title}"`,
        variant: "default",
      });
      
      // Mark notification as sent
      const updatedEvents = scheduledEvents.map(e => 
        e.id === event.id ? { ...e, notificationSent: true } : e
      );
      setScheduledEvents(updatedEvents);
    }, 2000);
  };
  
  // View event details
  const viewEventDetails = (event: any) => {
    // In a real app, this would open a detailed view of the event
    // For demo purposes, we'll just show a toast with event details
    toast({
      title: event.title,
      description: (
        <div className="mt-2 text-xs space-y-1">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1.5" />
            <span>{format(new Date(event.date), 'PPP')}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1.5" />
            <span>{event.time} ({event.duration} min)</span>
          </div>
          {event.description && (
            <div className="pt-1">
              <p className="text-muted-foreground">{event.description}</p>
            </div>
          )}
        </div>
      ),
      action: (
        <ToastAction altText="Dismiss" onClick={() => {}}>
          OK
        </ToastAction>
      ),
    });
  };
  
  // Load events from storage on component mount
  useEffect(() => {
    const storedEvents = localStorage.getItem('crm_scheduled_events');
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents);
        // Convert string dates back to Date objects
        const eventsWithDates = parsedEvents.map((event: any) => ({
          ...event,
          date: new Date(event.date)
        }));
        setScheduledEvents(eventsWithDates);
      } catch (error) {
        console.error('Error parsing stored events:', error);
      }
    }
  }, []);
  
  const getEventsForDate = (date: Date) => {
    return scheduledEvents.filter(event => {
      // Convert event.date to a Date object if it's not already
      const eventDate = event.date instanceof Date 
        ? event.date 
        : new Date(event.date);
      
      // Compare year, month, and day to check if dates are the same
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };
  
  const handleNewLead = () => {
    toast({
      title: "New Lead",
      description: "Lead creation form coming soon.",
    });
  };

  // Get days in month for calendar
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0-6 (Sunday-Saturday)
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Last day of month
    
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-8">
        {/* Header with action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-border/40">
          <div className="space-y-1 w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">CRM Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Overview of your customer relationships and sales performance
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto justify-end">
            <Button variant="outline" className="h-9" onClick={handleSchedule}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-blue-600" onClick={navigateToLeads}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-white">New Leads</CardTitle>
              <div className="rounded-full bg-blue-500/30 p-1.5 sm:p-2">
                <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.totalLeads}</div>
              <div className="flex items-center mt-1">
                <span className="text-xs text-white font-medium bg-blue-500/30 px-1.5 py-0.5 rounded">+{stats.leadGrowth}%</span>
                <span className="text-xs text-blue-100 ml-1.5">from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-indigo-600" onClick={navigateToContacts}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-white">Active Contacts</CardTitle>
              <div className="rounded-full bg-indigo-500/30 p-1.5 sm:p-2">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.activeContacts}</div>
              <div className="flex items-center mt-1">
                {stats.contactGrowth > 0 ? (
                  <>
                    <span className="text-xs text-white font-medium bg-indigo-500/30 px-1.5 py-0.5 rounded">+{stats.contactGrowth}%</span>
                    <span className="text-xs text-indigo-100 ml-1.5">from last month</span>
                  </>
                ) : (
                  <span className="text-xs text-indigo-100">No change from last month</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-amber-600" onClick={navigateToTasks}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-white">Open Tasks</CardTitle>
              <div className="rounded-full bg-amber-500/30 p-1.5 sm:p-2">
                <CheckSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.openTasks}</div>
              <div className="flex items-center mt-1">
                <span className="text-xs text-white font-medium bg-amber-500/30 px-1.5 py-0.5 rounded">{stats.tasksDueToday}</span>
                <span className="text-xs text-amber-100 ml-1.5">due today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-emerald-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-white">Conversion Rate</CardTitle>
              <div className="rounded-full bg-emerald-500/30 p-1.5 sm:p-2">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.conversionRate}%</div>
              <div className="flex items-center mt-1">
                <span className="text-xs text-white font-medium bg-emerald-500/30 px-1.5 py-0.5 rounded">+2.5%</span>
                <span className="text-xs text-emerald-100 ml-1.5">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="flex overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="h-9 w-full justify-start">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3">Overview</TabsTrigger>
              <TabsTrigger value="leads" className="text-xs sm:text-sm px-2 sm:px-3">Leads</TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs sm:text-sm px-2 sm:px-3">Tasks</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs sm:text-sm px-2 sm:px-3">Performance</TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs sm:text-sm px-2 sm:px-3">Calendar</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="mt-4 sm:mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border border-border/40 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">Recent Activities</CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentActivities.map((activity, index) => (
                      <div key={activity.id}>
                        <div className="flex items-start gap-3">
                          {activity.icon}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(activity.timestamp, 'PPp')}
                            </p>
                          </div>
                        </div>
                        {index < stats.recentActivities.length - 1 && <Separator className="my-4" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/40 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">Lead Sources</CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">Export</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {stats.leadSources.length > 0 ? (
                    <div className="space-y-4">
                      {stats.leadSources.map((source) => (
                        <div key={source.source} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{source.source}</span>
                            <span className="font-medium">{source.count} leads ({source.percentage}%)</span>
                          </div>
                          <Progress value={source.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[250px]">
                      <PieChart className="h-16 w-16 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground mt-4">No lead source data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Scheduled Events Card */}
              <Card className="border border-border/40 shadow-sm md:col-span-2 mt-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">Scheduled Events</CardTitle>
                    <Button size="sm" className="h-8" onClick={handleSchedule}>
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Schedule New Event
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {scheduledEvents.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-sm">Event</th>
                            <th className="text-left py-3 px-4 font-medium text-sm">Type</th>
                            <th className="text-left py-3 px-4 font-medium text-sm">Date & Time</th>
                            <th className="text-left py-3 px-4 font-medium text-sm">Duration</th>
                            <th className="text-left py-3 px-4 font-medium text-sm">Contact</th>
                            <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scheduledEvents
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((event) => {
                              const eventDate = new Date(event.date);
                              const isUpcoming = eventDate >= new Date();
                              const relatedContact = contacts.find(c => c.id === event.contactId);
                              
                              return (
                                <tr key={event.id} className="border-b hover:bg-muted/30">
                                  <td className="py-3 px-4">
                                    <div className="font-medium">{event.title}</div>
                                    {event.description && (
                                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {event.description}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <Badge className={
                                      event.type === 'meeting' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                      event.type === 'call' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                      event.type === 'task' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' :
                                      'bg-indigo-100 text-indigo-800 hover:bg-indigo-100'
                                    }>
                                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex flex-col">
                                      <span className={isUpcoming ? 'font-medium' : 'text-muted-foreground'}>
                                        {format(eventDate, 'MMM d, yyyy')}
                                      </span>
                                      <span className="text-xs">
                                        {event.time}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    {event.duration} min
                                  </td>
                                  <td className="py-3 px-4">
                                    {relatedContact ? relatedContact.name : '-'}
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8"
                                      onClick={() => viewEventDetails(event)}
                                    >
                                      <ArrowRight className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No events scheduled</p>
                      <Button className="mt-4" onClick={handleSchedule}>Schedule Your First Event</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="leads" className="mt-4 sm:mt-6">
            <Card className="border border-border/40 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Lead Management</CardTitle>
                  <Button size="sm" className="h-8">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Lead
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {leads.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-sm">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Company</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Source</th>
                          <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead) => (
                          <tr key={lead.id} className="border-b hover:bg-muted/30">
                            <td className="py-3 px-4">{lead.name}</td>
                            <td className="py-3 px-4">{lead.company}</td>
                            <td className="py-3 px-4">
                              <Badge className={
                                lead.status === 'New' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                lead.status === 'Qualified' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                lead.status === 'Negotiation' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' :
                                'bg-indigo-100 text-indigo-800 hover:bg-indigo-100'
                              }>
                                {lead.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">{lead.source}</td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" size="sm" className="h-8">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <UserPlus className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No leads available</p>
                    <Button className="mt-4">Add Your First Lead</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-4 sm:mt-6">
            <Card className="border border-border/40 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Task Calendar</CardTitle>
                  <Button size="sm" className="h-8">
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {tasks.filter(task => !task.completed).length > 0 ? (
                  <div className="space-y-4">
                    {tasks.filter(task => !task.completed).map((task) => (
                      <div key={task.id} className="flex items-start p-3 rounded-md border hover:bg-muted/20">
                        <div className={`rounded-full p-2 mr-3 ${
                          task.priority === 'high' ? 'bg-red-50' :
                          task.priority === 'medium' ? 'bg-amber-50' :
                          'bg-blue-50'
                        }`}>
                          <Clock className={`h-4 w-4 ${
                            task.priority === 'high' ? 'text-red-600' :
                            task.priority === 'medium' ? 'text-amber-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium">{task.title}</h4>
                            <Badge variant="outline" className={
                              task.priority === 'high' ? 'border-red-200 text-red-700' :
                              task.priority === 'medium' ? 'border-amber-200 text-amber-700' :
                              'border-blue-200 text-blue-700'
                            }>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {format(new Date(task.dueDate), 'PPP')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No tasks available</p>
                    <Button className="mt-4">Add Your First Task</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="mt-4 sm:mt-6">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <Card className="border border-border/40 shadow-sm">
                <CardHeader className="px-4 sm:px-6 py-4">
                  <CardTitle className="text-base sm:text-lg font-medium">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4">
                  <div className="space-y-4 sm:space-y-6">
                    {stats.performanceMetrics.map((metric) => (
                      <div key={metric.metric} className="space-y-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            {metric.metric === 'Deals Closed' && <CheckSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 text-blue-600" />}
                            {metric.metric === 'Revenue' && <PoundSterling className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 text-green-600" />}
                            {metric.metric === 'Customer Satisfaction' && <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 text-amber-600" />}
                            {metric.metric === 'Response Time' && <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 text-indigo-600" />}
                            <span className="text-xs sm:text-sm font-medium">{metric.metric}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs sm:text-sm font-bold">
                              {metric.metric === 'Revenue' ? `£${metric.value.toLocaleString()}` : 
                               metric.metric === 'Customer Satisfaction' ? metric.value.toFixed(1) :
                               metric.metric === 'Response Time' ? `${metric.value} hrs` :
                               metric.value}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              / {metric.metric === 'Revenue' ? `£${metric.target.toLocaleString()}` : 
                                 metric.metric === 'Customer Satisfaction' ? metric.target.toFixed(1) :
                                 metric.metric === 'Response Time' ? `${metric.target} hrs` :
                                 metric.target}
                            </span>
                          </div>
                        </div>
                        <Progress value={(metric.value / metric.target) * 100} className="h-1.5 sm:h-2" />
                        <div className="flex justify-end">
                          <span className={`text-xs ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {metric.change > 0 ? '+' : ''}{metric.change}% from last month
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-border/40 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Sales Forecast</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-[300px]">
                  <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mt-4">Sales forecast chart coming soon</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-4 sm:mt-6">
            {/* Calendar component */}
            <Card className="border border-border/40 shadow-sm">
              <CardHeader className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-medium">Calendar</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your schedule and events
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="text-sm font-medium px-2">
                    {format(currentDate, 'MMMM yyyy')}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleNextMonth}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button size="sm" onClick={handleSchedule}>
                    <CalendarDays className="h-4 w-4 mr-2" />
                    New Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Calendar Grid */}
                <div className="border-t">
                  {/* Days of week header */}
                  <div className="grid grid-cols-7 border-b">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                      <div key={day} className="py-2 text-center text-sm font-medium border-r last:border-r-0">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.substring(0, 3)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 auto-rows-fr">
                    {getDaysInMonth().map((day, index) => {
                      if (day === null) {
                        return (
                          <div key={`empty-${index}`} className="min-h-[120px] border-b border-r p-1 bg-muted/20" />
                        );
                      }
                      
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      const isCurrentDay = isToday(day);
                      const dayEvents = getEventsForDate(day);
                      
                      // Debug log to verify events are being found
                      if (dayEvents.length > 0) {
                        console.log(`Events for ${format(day, 'yyyy-MM-dd')}:`, dayEvents);
                      }
                      
                      return (
                        <div 
                          key={`day-${index}`} 
                          className={`
                            min-h-[120px] border-b border-r p-1 relative
                            ${!isCurrentMonth ? 'bg-muted/20' : ''}
                            ${isCurrentDay ? 'bg-blue-50' : ''}
                            hover:bg-muted/10
                          `}
                          onClick={() => {
                            handleDateSelect(day);
                            handleSchedule();
                          }}
                        >
                          <div className="flex justify-between items-start p-1">
                            <span 
                              className={`
                                text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full
                                ${isCurrentDay ? 'bg-primary text-primary-foreground' : ''}
                              `}
                            >
                              {format(day, 'd')}
                            </span>
                            {dayEvents.length > 0 && (
                              <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20">
                                {dayEvents.length}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Events for this day */}
                          <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                            {dayEvents.map((event) => (
                              <div 
                                key={event.id}
                                className={`
                                  text-xs p-1 rounded truncate cursor-pointer
                                  ${event.type === 'meeting' ? 'bg-blue-100 text-blue-800' : 
                                    event.type === 'call' ? 'bg-green-100 text-green-800' : 
                                    event.type === 'task' ? 'bg-amber-100 text-amber-800' : 
                                    'bg-indigo-100 text-indigo-800'}
                                `}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewEventDetails(event);
                                }}
                              >
                                <div className="flex items-center">
                                  <span className="font-medium">{event.time}</span>
                                  <span className="mx-1">•</span>
                                  <span className="truncate">{event.title}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Upcoming Events */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Card className="border border-border/40 shadow-sm md:col-span-2">
                <CardHeader className="px-6 py-4">
                  <CardTitle className="text-base font-medium">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-4">
                  {scheduledEvents.length > 0 ? (
                    <div className="space-y-3">
                      {scheduledEvents
                        .filter(event => new Date(event.date) >= new Date())
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .slice(0, 5)
                        .map((event) => {
                          const eventDate = new Date(event.date);
                          const relatedContact = contacts.find(c => c.id === event.contactId);
                          
                          return (
                            <div 
                              key={event.id} 
                              className="flex items-start p-3 rounded-md border hover:bg-muted/20 cursor-pointer"
                              onClick={() => viewEventDetails(event)}
                            >
                              <div className={`
                                rounded-full p-2 mr-3
                                ${event.type === 'meeting' ? 'bg-blue-50' : 
                                  event.type === 'call' ? 'bg-green-50' : 
                                  event.type === 'task' ? 'bg-amber-50' : 
                                  'bg-indigo-50'}
                              `}>
                                <CalendarDays className={`
                                  h-4 w-4
                                  ${event.type === 'meeting' ? 'text-blue-600' : 
                                    event.type === 'call' ? 'text-green-600' : 
                                    event.type === 'task' ? 'text-amber-600' : 
                                    'text-indigo-600'}
                                `} />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <h4 className="text-sm font-medium">{event.title}</h4>
                                  <Badge className={`
                                    text-xs
                                    ${event.type === 'meeting' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
                                      event.type === 'call' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                                      event.type === 'task' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 
                                      'bg-indigo-100 text-indigo-800 hover:bg-indigo-100'}
                                  `}>
                                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(eventDate, 'PPP')} at {event.time} ({event.duration} min)
                                </p>
                                {relatedContact && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    With: {relatedContact.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No upcoming events</p>
                      <Button className="mt-4" onClick={handleSchedule}>Schedule an Event</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="border border-border/40 shadow-sm">
                <CardHeader className="px-6 py-4">
                  <CardTitle className="text-base font-medium">Event Statistics</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="rounded-full bg-blue-50 p-1.5 mr-2">
                          <CalendarDays className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm">Total Events</span>
                      </div>
                      <span className="text-lg font-bold">{scheduledEvents.length}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Event Types</h4>
                      <div className="space-y-1">
                        {['meeting', 'call', 'task', 'reminder'].map(type => {
                          const count = scheduledEvents.filter(e => e.type === type).length;
                          const percentage = scheduledEvents.length > 0 
                            ? Math.round((count / scheduledEvents.length) * 100) 
                            : 0;
                          
                          return (
                            <div key={type} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="capitalize">{type}s</span>
                                <span>{count} ({percentage}%)</span>
                              </div>
                              <Progress value={percentage} className="h-1.5" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Upcoming</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Today</span>
                          <span className="font-medium">
                            {scheduledEvents.filter(e => isToday(new Date(e.date))).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>This Week</span>
                          <span className="font-medium">
                            {scheduledEvents.filter(e => {
                              const eventDate = new Date(e.date);
                              const today = new Date();
                              return eventDate >= today && eventDate <= addDays(today, 7);
                            }).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>This Month</span>
                          <span className="font-medium">
                            {scheduledEvents.filter(e => {
                              const eventDate = new Date(e.date);
                              return isSameMonth(eventDate, new Date());
                            }).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Schedule Dialog */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle className="text-xl font-semibold">Schedule Event</DialogTitle>
              <DialogDescription>
                Create a new event in your calendar. Fill out the details below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="px-6 space-y-6">
              {/* Calendar */}
              <div>
                <h3 className="text-sm font-medium mb-3">Select Date</h3>
                <div className="flex items-center justify-between mb-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handlePreviousMonth}
                    className="flex items-center justify-center h-8 px-2 border border-input rounded-md hover:bg-muted"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="ml-1">Prev</span>
                  </Button>
                  <span className="text-base font-medium">
                    {format(currentDate, 'MMMM yyyy')}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNextMonth}
                    className="flex items-center justify-center h-8 px-2 border border-input rounded-md hover:bg-muted"
                  >
                    <span className="mr-1">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className="text-xs font-medium text-center text-muted-foreground py-1">
                      {day}
                    </div>
                  ))}
                  
                  {getDaysInMonth().map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} className="h-10" />;
                    }
                    
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                    const dayEvents = getEventsForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    
                    return (
                      <button
                        key={`day-${index}`}
                        type="button"
                        onClick={() => handleDateSelect(day)}
                        className={`
                          h-10 w-full flex items-center justify-center rounded-md text-sm relative
                          ${isToday(day) ? 'text-blue-600 font-medium' : ''}
                          ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}
                          ${!isCurrentMonth ? 'text-muted-foreground/50' : ''}
                          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
                        `}
                      >
                        <span>{format(day, 'd')}</span>
                        {dayEvents.length > 0 && (
                          <span className={`absolute bottom-1 h-1 w-1 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Event Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="event-title" className="text-sm font-medium block mb-1.5">Event Title</Label>
                  <Input 
                    id="event-title" 
                    value={eventTitle} 
                    onChange={(e) => setEventTitle(e.target.value)} 
                    placeholder="Enter event title"
                    className="h-10"
                  />
                </div>
                
                <div>
                  <Label htmlFor="event-type" className="text-sm font-medium block mb-1.5">Event Type</Label>
                  <div className="relative">
                    <select 
                      id="event-type"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 pr-10"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="call">Call</option>
                      <option value="task">Task</option>
                      <option value="reminder">Reminder</option>
                    </select>
                    <ChevronRight className="h-4 w-4 absolute right-3 top-3 rotate-90 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event-time" className="text-sm font-medium block mb-1.5">Time</Label>
                    <div className="relative">
                      <select
                        id="event-time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 pr-10"
                      >
                        {[
                          "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                          "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
                          "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
                        ].map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <ChevronRight className="h-4 w-4 absolute right-3 top-3 rotate-90 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="event-duration" className="text-sm font-medium block mb-1.5">Duration</Label>
                    <div className="relative">
                      <select
                        id="event-duration"
                        value={eventDuration}
                        onChange={(e) => setEventDuration(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 pr-10"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                      </select>
                      <ChevronRight className="h-4 w-4 absolute right-3 top-3 rotate-90 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="event-contact" className="text-sm font-medium block mb-1.5">Related Contact</Label>
                  <div className="relative">
                    <select
                      id="event-contact"
                      value={selectedContact}
                      onChange={(e) => setSelectedContact(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 pr-10"
                    >
                      <option value="">None</option>
                      {contacts.map(contact => (
                        <option key={contact.id} value={contact.id}>{contact.name}</option>
                      ))}
                    </select>
                    <ChevronRight className="h-4 w-4 absolute right-3 top-3 rotate-90 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="event-description" className="text-sm font-medium block mb-1.5">Description</Label>
                  <Textarea 
                    id="event-description" 
                    value={eventDescription} 
                    onChange={(e) => setEventDescription(e.target.value)} 
                    placeholder="Add details about this event"
                    rows={3}
                    className="resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                  />
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                    <span>Email notifications will be sent to all participants when this event is scheduled.</span>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="px-6 py-4 bg-muted/20 mt-6 flex items-center justify-end space-x-2">
              <Button variant="outline" onClick={handleCloseScheduleDialog}>
                Cancel
              </Button>
              <Button 
                onClick={handleScheduleEvent} 
                disabled={!selectedDate || !eventTitle}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Schedule Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
