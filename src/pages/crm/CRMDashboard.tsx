import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { cn } from "@/lib/utils"

// Types
interface DashboardStats {
  totalLeads: number;
  activeContacts: number;
  openTasks: number;
  conversionRate: number;
  leadGrowth: number;
  contactGrowth: number;
  tasksDueToday: number;
  recentActivities: Activity[];
  leadSources: LeadSource[];
  upcomingTasks: Task[];
  performanceMetrics: PerformanceMetric[];
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

interface LeadSource {
  source: string;
  count: number;
  percentage: number;
}

interface PerformanceMetric {
  metric: string;
  value: number;
  target: number;
  change: number;
}

interface ScheduledEvent {
  id: string;
  title: string;
  type: 'meeting' | 'call' | 'task' | 'reminder';
  date: Date;
  time: string;
  duration: string;
  description: string;
  contactId?: string;
  notificationSent: boolean;
}

// Helper functions
const calculateStats = (leads: any[], contacts: any[], tasks: Task[]): DashboardStats => {
  const openTasksCount = tasks.filter(task => !task.completed).length;
  const tasksDueToday = tasks.filter(task => 
    !task.completed && 
    new Date(task.dueDate).toDateString() === new Date().toDateString()
  ).length;
  
  const sourceCount: Record<string, number> = {};
  leads.forEach(lead => {
    sourceCount[lead.source] = (sourceCount[lead.source] || 0) + 1;
  });
  
  const leadSources = Object.entries(sourceCount).map(([source, count]) => ({
    source,
    count,
    percentage: Math.round((count / leads.length) * 100)
  })).sort((a, b) => b.count - a.count);
  
  return {
    totalLeads: leads.length,
    activeContacts: contacts.length,
    openTasks: openTasksCount,
    conversionRate: 32,
    leadGrowth: leads.length > 0 ? 8.2 : 0,
    contactGrowth: contacts.length > 0 ? 12.4 : 0,
    tasksDueToday,
    recentActivities: generateRecentActivities(leads),
    leadSources,
    upcomingTasks: tasks.filter(task => !task.completed).slice(0, 5),
    performanceMetrics: generatePerformanceMetrics()
  };
};

const generateRecentActivities = (leads: any[]): Activity[] => [
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
  // ... other activities
];

const generatePerformanceMetrics = (): PerformanceMetric[] => [
  {
    metric: 'Deals Closed',
    value: 12,
    target: 15,
    change: 8.5
  },
  // ... other metrics
];

// Components
const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  bgColor: string;
  iconBgColor: string;
}> = React.memo(({ title, value, change, icon, bgColor, iconBgColor }) => (
  <Card className={`border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${bgColor}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2 sm:pb-2 sm:px-4 sm:pt-4">
      <CardTitle className="text-[11px] sm:text-sm font-medium text-white">{title}</CardTitle>
      <div className={`rounded-full ${iconBgColor} p-1`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent className="px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="text-base sm:text-xl lg:text-2xl font-bold text-white">{value}</div>
      {change !== undefined && (
        <div className="flex items-center mt-0.5">
          <span className="text-[9px] sm:text-xs text-white font-medium bg-opacity-30 px-1 py-0.5 rounded">
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span className="text-[9px] sm:text-xs text-white/70 ml-1">from last week</span>
        </div>
      )}
    </CardContent>
  </Card>
));

const ActivityItem: React.FC<{ activity: Activity; isLast: boolean }> = React.memo(({ activity, isLast }) => (
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
    {!isLast && <Separator className="my-4" />}
  </div>
));

const LeadSourceChart: React.FC<{ sources: LeadSource[] }> = React.memo(({ sources }) => (
  sources.length > 0 ? (
    <div className="space-y-4">
      {sources.map((source) => (
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
  )
));

// Calendar Day Component
const CalendarDay: React.FC<{
  day: Date | null;
  currentDate: Date;
  selectedDate: Date | null;
  events: ScheduledEvent[];
  onSelect: (date: Date) => void;
}> = React.memo(({ day, currentDate, selectedDate, events, onSelect }) => {
  if (!day) return <div className="h-16 md:h-24" />;
  
  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
  const dayEvents = events.filter(event => isSameDay(new Date(event.date), day));
  const isCurrentMonth = isSameMonth(day, currentDate);
  
  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      className={cn(
        "h-16 md:h-24 w-full p-0.5 md:p-1 flex flex-col items-stretch rounded-md relative",
        isSelected ? "bg-primary/20" : "hover:bg-muted/50",
        !isCurrentMonth ? "opacity-50" : "",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
      )}
    >
      <span className={cn(
        "text-[10px] md:text-sm font-medium w-full text-center mb-0.5 md:mb-1",
        isToday(day) ? "bg-primary text-primary-foreground" : "",
        isSelected ? "text-primary-foreground" : ""
      )}>
        {format(day, 'd')}
      </span>
      
      <div className="flex-1 overflow-hidden">
        {dayEvents.slice(0, 2).map((event, index) => (
          <div
            key={event.id}
            className={cn(
              "text-[8px] md:text-[10px] px-1 py-0.5 mb-0.5 rounded truncate",
              event.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
              event.type === 'call' ? 'bg-green-100 text-green-800' :
              event.type === 'task' ? 'bg-amber-100 text-amber-800' :
              'bg-indigo-100 text-indigo-800'
            )}
          >
            {event.title}
          </div>
        ))}
        {dayEvents.length > 2 && (
          <div className="text-[8px] md:text-[10px] px-1 text-muted-foreground">
            +{dayEvents.length - 2} more
          </div>
        )}
      </div>
    </button>
  );
});

// Event Form Component
const EventForm: React.FC<{
  formData: typeof initialEventFormState;
  onChange: (field: keyof typeof initialEventFormState, value: string) => void;
  contacts: any[];
}> = React.memo(({ formData, onChange, contacts }) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="event-title" className="text-sm font-medium block mb-1.5">
        Event Title
      </Label>
      <Input 
        id="event-title" 
        value={formData.title} 
        onChange={(e) => onChange('title', e.target.value)} 
        placeholder="Enter event title"
        className="h-10"
      />
    </div>
    
    <div>
      <Label htmlFor="event-type" className="text-sm font-medium block mb-1.5">
        Event Type
      </Label>
      <Select 
        value={formData.type} 
        onValueChange={(value) => onChange('type', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select event type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="meeting">Meeting</SelectItem>
          <SelectItem value="call">Call</SelectItem>
          <SelectItem value="task">Task</SelectItem>
          <SelectItem value="reminder">Reminder</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="event-time" className="text-sm font-medium block mb-1.5">
          Time
        </Label>
        <Select 
          value={formData.time} 
          onValueChange={(value) => onChange('time', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            {[
              "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
              "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
              "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
            ].map((time) => (
              <SelectItem key={time} value={time}>{time}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="event-duration" className="text-sm font-medium block mb-1.5">
          Duration
        </Label>
        <Select 
          value={formData.duration} 
          onValueChange={(value) => onChange('duration', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="45">45 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="90">1.5 hours</SelectItem>
            <SelectItem value="120">2 hours</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    
    <div>
      <Label htmlFor="event-contact" className="text-sm font-medium block mb-1.5">
        Related Contact
      </Label>
      <Select 
        value={formData.contactId} 
        onValueChange={(value) => onChange('contactId', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select contact" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {contacts.map(contact => (
            <SelectItem key={contact.id} value={contact.id}>
              {contact.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    
    <div>
      <Label htmlFor="event-description" className="text-sm font-medium block mb-1.5">
        Description
      </Label>
      <Textarea 
        id="event-description" 
        value={formData.description} 
        onChange={(e) => onChange('description', e.target.value)} 
        placeholder="Add details about this event"
        rows={3}
        className="resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
      />
    </div>
  </div>
));

// Initial state
const initialEventFormState = {
  title: "",
  type: "meeting" as const,
  time: "09:00",
  duration: "30",
  description: "",
  contactId: "none"
};

// Initial sample events
const sampleEvents: ScheduledEvent[] = [
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
];

// Main Component
export default function CRMDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  
  // State
  const [leads, setLeads] = useState<any[]>([
    { id: '1', name: 'John Doe', company: 'Acme Inc', status: 'New Lead', source: 'Website' },
    { id: '2', name: 'Jane Smith', company: 'XYZ Corp', status: 'Qualified', source: 'Referral' },
    { id: '3', name: 'Bob Johnson', company: 'ABC Ltd', status: 'Negotiation', source: 'LinkedIn' }
  ]);
  
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
  
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>(sampleEvents);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventFormData, setEventFormData] = useState(initialEventFormState);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  // Memoized calculations
  const stats = useMemo(() => calculateStats(leads, contacts, tasks), [leads, contacts, tasks]);
  
  const upcomingEvents = useMemo(() => {
    return scheduledEvents.filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      return eventDate >= today && eventDate <= addDays(today, 1);
    });
  }, [scheduledEvents]);

  // Effects
  useEffect(() => {
    if (upcomingEvents.length > 0) {
      toast({
        title: `You have ${upcomingEvents.length} upcoming event${upcomingEvents.length > 1 ? 's' : ''}`,
        description: "Check your calendar for details",
        action: <ToastAction altText="View" onClick={handleSchedule}>View</ToastAction>,
      });
    }
  }, [upcomingEvents]);

  useEffect(() => {
    loadScheduledEvents();
  }, []);

  // Event Handlers
  const handleSchedule = useCallback(() => {
    setIsScheduleDialogOpen(true);
  }, []);

  const handleEventFormChange = useCallback((field: keyof typeof initialEventFormState, value: string) => {
    setEventFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleScheduleEvent = useCallback(() => {
    if (!selectedDate || !eventFormData.title) {
      toast({
        title: "Missing information",
        description: "Please provide an event title and select a date.",
        variant: "destructive"
      });
      return;
    }

    const newEvent: ScheduledEvent = {
      id: Date.now().toString(),
      ...eventFormData,
      date: selectedDate,
      notificationSent: false
    };

    setScheduledEvents(prev => [...prev, newEvent]);
    
    toast({
      title: "Event scheduled successfully",
      description: `${eventFormData.title} on ${format(selectedDate, 'PPP')} at ${eventFormData.time}`,
      action: <ToastAction altText="View" onClick={() => viewEventDetails(newEvent)}>View</ToastAction>,
    });

    setIsScheduleDialogOpen(false);
    setEventFormData(initialEventFormState);
    setSelectedDate(null);
    
    // Simulate notification
    setTimeout(() => {
      toast({
        title: "Notification sent",
        description: `Email notification sent for "${newEvent.title}"`,
      });
    }, 2000);
  }, [selectedDate, eventFormData]);

  // Helper functions
  const loadScheduledEvents = useCallback(() => {
    setScheduledEvents(sampleEvents);
  }, []);

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

  return (
    <div className="min-h-screen bg-[#EFF4FF]">
      <div className="container mx-auto px-1 sm:px-2 md:px-4 lg:px-6 py-2 md:py-4 lg:py-6">
        {/* Header */}
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between bg-white p-2 md:p-4 rounded-lg shadow-sm border border-border/40">
          <div className="space-y-0.5">
            <h1 className="text-sm md:text-xl lg:text-2xl font-bold tracking-tight text-primary">CRM Dashboard</h1>
            <p className="text-[10px] md:text-sm text-muted-foreground">
              Overview of your customer relationships and sales performance
            </p>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" className="h-6 md:h-9 w-full md:w-auto text-[10px] md:text-sm" onClick={handleSchedule}>
              <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              Schedule
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-4 mt-1 md:mt-4">
          <StatCard
            title="New Leads"
            value={stats.totalLeads}
            change={stats.leadGrowth}
            icon={<UserPlus className="h-2.5 w-2.5 md:h-4 md:w-4 text-white" />}
            bgColor="bg-blue-600"
            iconBgColor="bg-blue-500/30"
          />
          <StatCard
            title="Active Contacts"
            value={stats.activeContacts}
            change={stats.contactGrowth}
            icon={<Users className="h-2.5 w-2.5 md:h-4 md:w-4 text-white" />}
            bgColor="bg-indigo-600"
            iconBgColor="bg-indigo-500/30"
          />
          <StatCard
            title="Open Tasks"
            value={stats.openTasks}
            icon={<CheckSquare className="h-2.5 w-2.5 md:h-4 md:w-4 text-white" />}
            bgColor="bg-amber-600"
            iconBgColor="bg-amber-500/30"
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            change={2.5}
            icon={<TrendingUp className="h-2.5 w-2.5 md:h-4 md:w-4 text-white" />}
            bgColor="bg-emerald-600"
            iconBgColor="bg-emerald-500/30"
          />
        </div>

        {/* Main Content */}
        <div className="mt-1 md:mt-4">
          <Tabs defaultValue="overview" className="space-y-1 md:space-y-4">
            {/* Tab List */}
            <div className="overflow-x-auto -mx-1 md:mx-0">
              <div className="min-w-[300px] px-1 md:px-0">
                <TabsList className="h-6 md:h-9 w-full justify-start">
                  <TabsTrigger value="overview" className="text-[10px] md:text-sm px-1 md:px-3">Overview</TabsTrigger>
                  <TabsTrigger value="leads" className="text-[10px] md:text-sm px-1 md:px-3">Leads</TabsTrigger>
                  <TabsTrigger value="tasks" className="text-[10px] md:text-sm px-1 md:px-3">Tasks</TabsTrigger>
                  <TabsTrigger value="performance" className="text-[10px] md:text-sm px-1 md:px-3">Performance</TabsTrigger>
                  <TabsTrigger value="calendar" className="text-[10px] md:text-sm px-1 md:px-3">Calendar</TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid gap-1 md:gap-4">
                {/* Activities and Lead Sources */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-4">
                  <Card className="border border-border/40 shadow-sm">
                    <CardHeader className="p-2 md:p-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs md:text-base font-medium">Recent Activities</CardTitle>
                        <Button variant="ghost" size="sm" className="h-6 md:h-8 text-[10px] md:text-xs">View All</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-2 md:p-4">
                      <div className="space-y-2 md:space-y-4">
                        {stats.recentActivities.map((activity, index) => (
                          <ActivityItem key={activity.id} activity={activity} isLast={index === stats.recentActivities.length - 1} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-border/40 shadow-sm">
                    <CardHeader className="p-2 md:p-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs md:text-base font-medium">Lead Sources</CardTitle>
                        <Button variant="ghost" size="sm" className="h-6 md:h-8 text-[10px] md:text-xs">Export</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-2 md:p-4">
                      <LeadSourceChart sources={stats.leadSources} />
                    </CardContent>
                  </Card>
                </div>

                {/* Scheduled Events Table */}
                <Card className="border border-border/40 shadow-sm">
                  <CardHeader className="p-2 md:p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                      <CardTitle className="text-xs md:text-base font-medium">Scheduled Events</CardTitle>
                      <Button size="sm" className="h-6 md:h-8 w-full md:w-auto text-[10px] md:text-sm" onClick={handleSchedule}>
                        <CalendarDays className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        Schedule New Event
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Mobile View */}
                    <div className="block md:hidden">
                      {scheduledEvents.map((event) => (
                        <div key={event.id} className="border-b p-2 hover:bg-muted/30">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-[11px]">{event.title}</div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Badge className={cn(
                                  "text-[9px]",
                                  event.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                                  event.type === 'call' ? 'bg-green-100 text-green-800' :
                                  event.type === 'task' ? 'bg-amber-100 text-amber-800' :
                                  'bg-indigo-100 text-indigo-800'
                                )}>
                                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                </Badge>
                                <span className="text-[9px] text-muted-foreground">
                                  {format(new Date(event.date), 'MMM d')} • {event.time}
                                </span>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6"
                              onClick={() => viewEventDetails(event)}
                            >
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 font-medium text-sm">Event</th>
                            <th className="text-left p-3 font-medium text-sm">Type</th>
                            <th className="text-left p-3 font-medium text-sm">Date & Time</th>
                            <th className="text-left p-3 font-medium text-sm">Duration</th>
                            <th className="text-left p-3 font-medium text-sm">Contact</th>
                            <th className="text-right p-3 font-medium text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scheduledEvents.map((event) => (
                            <tr key={event.id} className="border-b hover:bg-muted/30">
                              <td className="p-3">
                                <div className="font-medium text-sm">{event.title}</div>
                                {event.description && (
                                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {event.description}
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <Badge className={cn(
                                  "text-xs",
                                  event.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                                  event.type === 'call' ? 'bg-green-100 text-green-800' :
                                  event.type === 'task' ? 'bg-amber-100 text-amber-800' :
                                  'bg-indigo-100 text-indigo-800'
                                )}>
                                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="text-sm">
                                  {format(new Date(event.date), 'MMM d, yyyy')}
                                </div>
                                <div className="text-sm">
                                  {event.time}
                                </div>
                              </td>
                              <td className="p-3 text-sm">
                                {event.duration} min
                              </td>
                              <td className="p-3 text-sm">
                                {contacts.find(c => c.id === event.contactId)?.name || '-'}
                              </td>
                              <td className="p-3 text-right">
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
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Leads Tab */}
            <TabsContent value="leads">
              <Card className="border border-border/40 shadow-sm">
                <CardHeader className="p-2 md:p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                    <div>
                      <CardTitle className="text-xs md:text-base font-medium">All Leads</CardTitle>
                      <p className="text-[10px] md:text-sm text-muted-foreground">Manage and track your leads</p>
                    </div>
                    <Button size="sm" className="h-6 md:h-8 w-full md:w-auto text-[10px] md:text-sm" onClick={handleNewLead}>
                      <UserPlus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Add New Lead
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Mobile View */}
                  <div className="block md:hidden">
                    {leads.map((lead) => (
                      <div key={lead.id} className="border-b p-2 hover:bg-muted/30">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[11px]">{lead.name}</div>
                            <div className="text-[9px] text-muted-foreground">{lead.company}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Badge className="text-[9px] bg-blue-100 text-blue-800">
                                {lead.status}
                              </Badge>
                              <span className="text-[9px] text-muted-foreground">
                                via {lead.source}
                              </span>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium text-sm">Name</th>
                          <th className="text-left p-3 font-medium text-sm">Company</th>
                          <th className="text-left p-3 font-medium text-sm">Status</th>
                          <th className="text-left p-3 font-medium text-sm">Source</th>
                          <th className="text-right p-3 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead) => (
                          <tr key={lead.id} className="border-b hover:bg-muted/30">
                            <td className="p-3 text-sm font-medium">{lead.name}</td>
                            <td className="p-3 text-sm">{lead.company}</td>
                            <td className="p-3">
                              <Badge className="text-xs bg-blue-100 text-blue-800">
                                {lead.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-sm">{lead.source}</td>
                            <td className="p-3 text-right">
                              <Button variant="ghost" size="sm" className="h-8">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks">
              <Card className="border border-border/40 shadow-sm">
                <CardHeader className="p-2 md:p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                    <div>
                      <CardTitle className="text-xs md:text-base font-medium">Tasks</CardTitle>
                      <p className="text-[10px] md:text-sm text-muted-foreground">Manage your tasks and follow-ups</p>
                    </div>
                    <Button size="sm" className="h-6 md:h-8 w-full md:w-auto text-[10px] md:text-sm">
                      <CheckSquare className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Add Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Mobile View */}
                  <div className="block md:hidden">
                    {tasks.map((task) => (
                      <div key={task.id} className="border-b p-2 hover:bg-muted/30">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[11px]">{task.title}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Badge className={cn(
                                "text-[9px]",
                                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                task.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                                'bg-green-100 text-green-800'
                              )}>
                                {task.priority}
                              </Badge>
                              <span className="text-[9px] text-muted-foreground">
                                Due {format(new Date(task.dueDate), 'MMM d')}
                              </span>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium text-sm">Task</th>
                          <th className="text-left p-3 font-medium text-sm">Due Date</th>
                          <th className="text-left p-3 font-medium text-sm">Priority</th>
                          <th className="text-left p-3 font-medium text-sm">Status</th>
                          <th className="text-right p-3 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task) => (
                          <tr key={task.id} className="border-b hover:bg-muted/30">
                            <td className="p-3">
                              <div className="font-medium text-sm">{task.title}</div>
                              {task.contactId && (
                                <div className="text-xs text-muted-foreground">
                                  {contacts.find(c => c.id === task.contactId)?.name}
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-sm">
                              {format(new Date(task.dueDate), 'MMM d, yyyy')}
                            </td>
                            <td className="p-3">
                              <Badge className={cn(
                                "text-xs",
                                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                task.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                                'bg-green-100 text-green-800'
                              )}>
                                {task.priority}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant={task.completed ? "default" : "secondary"} className="text-xs">
                                {task.completed ? 'Completed' : 'Pending'}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              <Button variant="ghost" size="sm" className="h-8">
                                <Check className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance">
              <div className="grid gap-1 md:gap-4">
                <Card className="border border-border/40 shadow-sm">
                  <CardHeader className="p-2 md:p-4">
                    <CardTitle className="text-xs md:text-base font-medium">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 md:p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                      {stats.performanceMetrics.map((metric) => (
                        <Card key={metric.metric} className="border border-border/40 shadow-sm">
                          <CardHeader className="p-2 md:p-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-[11px] md:text-sm font-medium">{metric.metric}</CardTitle>
                              <Badge className={cn(
                                "text-[9px] md:text-xs",
                                metric.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              )}>
                                {metric.change > 0 ? '+' : ''}{metric.change}%
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-2 md:p-4">
                            <div className="space-y-2">
                              <div className="text-base md:text-xl font-bold">
                                {metric.value}
                              </div>
                              <div className="text-[10px] md:text-xs text-muted-foreground">
                                Target: {metric.target}
                              </div>
                              <Progress 
                                value={(metric.value / metric.target) * 100} 
                                className="h-1.5 md:h-2"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar">
              <div className="grid gap-1 md:gap-4">
                <Card className="border border-border/40 shadow-sm">
                  <CardHeader className="p-2 md:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-xs md:text-base font-medium">Calendar</CardTitle>
                        <p className="text-[10px] md:text-sm text-muted-foreground mt-0.5">
                          Manage your schedule and events
                        </p>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                          className="h-6 md:h-8 px-2 text-[10px] md:text-xs">
                          <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="ml-1 hidden sm:inline">Prev</span>
                        </Button>
                        <div className="text-[11px] md:text-sm font-medium min-w-[100px] text-center">
                          {format(currentDate, 'MMMM yyyy')}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                          className="h-6 md:h-8 px-2 text-[10px] md:text-xs">
                          <span className="mr-1 hidden sm:inline">Next</span>
                          <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="border-t">
                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="p-2 text-center text-[10px] md:text-sm font-medium border-b border-r last:border-r-0 bg-muted">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 border-b border-l">
                        {getDaysInMonth().map((day, index) => (
                          <div key={day ? format(day, 'yyyy-MM-dd') : `empty-${index}`} className="border-r last:border-r-0">
                            <CalendarDay
                              day={day}
                              currentDate={currentDate}
                              selectedDate={selectedDate}
                              events={scheduledEvents}
                              onSelect={setSelectedDate}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card className="border border-border/40 shadow-sm">
                  <CardHeader className="p-2 md:p-4">
                    <CardTitle className="text-xs md:text-base font-medium">Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 md:p-4">
                    {scheduledEvents.length > 0 ? (
                      <div className="space-y-2">
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
                                className="flex items-start p-2 rounded-md border hover:bg-muted/20 cursor-pointer"
                                onClick={() => viewEventDetails(event)}
                              >
                                <div className={cn(
                                  "rounded-full p-1.5 mr-2",
                                  event.type === 'meeting' ? 'bg-blue-50' : 
                                  event.type === 'call' ? 'bg-green-50' : 
                                  event.type === 'task' ? 'bg-amber-50' : 
                                  'bg-indigo-50'
                                )}>
                                  <CalendarDays className={cn(
                                    "h-3 w-3",
                                    event.type === 'meeting' ? 'text-blue-600' : 
                                    event.type === 'call' ? 'text-green-600' : 
                                    event.type === 'task' ? 'text-amber-600' : 
                                    'text-indigo-600'
                                  )} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <h4 className="text-[11px] md:text-sm font-medium truncate">{event.title}</h4>
                                    <Badge className={cn(
                                      "text-[9px] md:text-xs ml-2",
                                      event.type === 'meeting' ? 'bg-blue-100 text-blue-800' : 
                                      event.type === 'call' ? 'bg-green-100 text-green-800' : 
                                      event.type === 'task' ? 'bg-amber-100 text-amber-800' : 
                                      'bg-indigo-100 text-indigo-800'
                                    )}>
                                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                    </Badge>
                                  </div>
                                  <p className="text-[9px] md:text-xs text-muted-foreground mt-0.5">
                                    {format(eventDate, 'MMM d')} at {event.time} ({event.duration} min)
                                  </p>
                                  {relatedContact && (
                                    <p className="text-[9px] md:text-xs text-muted-foreground mt-0.5">
                                      With: {relatedContact.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6">
                        <CalendarDays className="h-8 w-8 text-muted-foreground/50 mb-2" />
                        <p className="text-[10px] md:text-sm text-muted-foreground">No upcoming events</p>
                        <Button className="mt-2 h-6 md:h-8 text-[10px] md:text-xs" onClick={handleSchedule}>
                          Schedule an Event
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Schedule Dialog */}
            <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
              <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden mx-1 md:mx-4">
                <DialogHeader className="p-2 md:p-4">
                  <DialogTitle className="text-sm md:text-lg font-semibold">Schedule Event</DialogTitle>
                  <DialogDescription className="text-[10px] md:text-sm">
                    Create a new event in your calendar
                  </DialogDescription>
                </DialogHeader>
                
                {/* Make this div scrollable with a max height */}
                <div className="p-2 md:p-4 space-y-2 md:space-y-4 overflow-y-auto max-h-[calc(80vh-10rem)]">
                  {/* Calendar */}
                  <div className="space-y-2">
                    <h3 className="text-xs md:text-sm font-medium">Select Date</h3>
                    <div className="flex items-center justify-between mb-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                        className="h-7 md:h-8 px-2 text-[10px] md:text-xs"
                      >
                        <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="ml-1">Prev</span>
                      </Button>
                      <span className="text-xs md:text-sm font-medium">
                        {format(currentDate, 'MMMM yyyy')}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                        className="h-7 md:h-8 px-2 text-[10px] md:text-xs"
                      >
                        <span className="mr-1">Next</span>
                        <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-0.5 md:gap-1">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <div key={day} className="text-[9px] md:text-xs font-medium text-center text-muted-foreground py-1 bg-muted">
                          {day}
                        </div>
                      ))}
                      
                      {getDaysInMonth().map((day, index) => (
                        <CalendarDay
                          key={day ? format(day, 'yyyy-MM-dd') : `empty-${index}`}
                          day={day}
                          currentDate={currentDate}
                          selectedDate={selectedDate}
                          events={scheduledEvents}
                          onSelect={setSelectedDate}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Event Form */}
                  <EventForm
                    formData={eventFormData}
                    onChange={handleEventFormChange}
                    contacts={contacts}
                  />
                </div>
                
                <DialogFooter className="p-2 md:p-4 bg-muted/20 flex items-center justify-end gap-1 border-t">
                  <Button variant="outline" className="text-[10px] md:text-sm h-6 md:h-9" onClick={() => setIsScheduleDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="text-[10px] md:text-sm h-6 md:h-9"
                    onClick={handleScheduleEvent}
                    disabled={!selectedDate || !eventFormData.title}
                  >
                    <CalendarDays className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    Schedule Event
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
