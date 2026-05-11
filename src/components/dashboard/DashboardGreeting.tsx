/**
 * Dashboard greeting banner for the signed-in user.
 * Flow: auth profile → time-of-day greeting → optional last-login display.
 */
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardGreetingProps {
  className?: string;
  showLastLogin?: boolean;
}

export const DashboardGreeting = ({ 
  className = '',
  showLastLogin = true,
}: DashboardGreetingProps) => {
  const { user, isLoading, error } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };

    updateGreeting();

    // Update greeting every hour
    const timer = setInterval(updateGreeting, 3600000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className={`rounded-2xl border border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-indigo-50/50 p-4 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.25)] dark:border-slate-800/70 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 sm:p-6 ${className}`}>
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-800 dark:bg-red-900/10 sm:p-6 ${className}`}
        role="alert"
      >
        <div className="text-red-800 dark:text-red-400">
          <h1 className="text-lg font-semibold">Authentication Error</h1>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // If no user data, show a generic greeting
  if (!user) {
    return (
      <div 
        className={`rounded-2xl border border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-indigo-50/50 p-4 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.25)] dark:border-slate-800/70 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 sm:p-6 ${className}`}
        role="region"
        aria-label="Dashboard greeting"
      >
        <div>
          <h1 
            className="mb-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl md:text-3xl"
            tabIndex={0}
          >
            {greeting}, Welcome!
          </h1>
          <p 
            className="mb-4 text-sm text-slate-600 dark:text-slate-300 sm:text-base md:text-lg"
            tabIndex={0}
          >
            Please log in to view your personalized dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`rounded-2xl border border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-indigo-50/50 p-4 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.25)] dark:border-slate-800/70 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 sm:p-6 ${className}`}
      role="region"
      aria-label="Dashboard greeting"
    >
      <div>
        <h1 
          className="mb-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl md:text-3xl"
          tabIndex={0}
        >
          {greeting}, {user.firstName} {user.lastName}!
        </h1>
        <p 
          className="mb-4 text-sm text-slate-600 dark:text-slate-300 sm:text-base md:text-lg"
          tabIndex={0}
        >
          Welcome back to your dashboard. Here's what's happening today.
        </p>
        {showLastLogin && user.lastLogin && (
          <p 
            className="text-sm text-slate-500 dark:text-slate-400"
            tabIndex={0}
          >
            Last login: {format(new Date(user.lastLogin), 'MMM d, yyyy h:mm a')}
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardGreeting; 