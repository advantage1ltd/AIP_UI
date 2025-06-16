import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface DashboardGreetingProps {
  className?: string;
  showLastLogin?: boolean;
}

export const DashboardGreeting = ({ 
  className = '',
  showLastLogin = true,
}: DashboardGreetingProps) => {
  const { user, isLoading } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update immediately on mount
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };

    updateGreeting();

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      updateGreeting();
    }, 60000);

    return () => clearInterval(timer);
  }, []); // Remove currentTime dependency

  if (isLoading) {
    return (
      <div className={`p-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 shadow-sm animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div 
      className={`p-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 shadow-sm ${className}`}
      role="region"
      aria-label="Dashboard greeting"
    >
      <div>
        <h1 
          className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-2"
          tabIndex={0}
        >
          {greeting}, {user?.displayName || 'there'}!
        </h1>
        <p 
          className="text-gray-600 dark:text-gray-300 text-base md:text-lg mb-4"
          tabIndex={0}
        >
          Welcome back to your dashboard. Here's what's happening today.
        </p>
        {showLastLogin && user?.lastLogin && (
          <p 
            className="text-sm text-gray-500 dark:text-gray-400"
            tabIndex={0}
          >
            Last login: {format(user.lastLogin, 'MMM d, yyyy h:mm a')}
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardGreeting; 