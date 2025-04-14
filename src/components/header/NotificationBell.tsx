import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { NOTIFICATION_COUNT } from "@/constants/header";

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell = ({ className = "" }: NotificationBellProps) => (
  <Link 
    to="/action-calendar" 
    className={`relative p-1 transition-colors ${className}`}
    aria-label={`Notifications - ${NOTIFICATION_COUNT} unread`}
  >
    <Bell className="h-5 w-5" />
    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-[11px] font-medium text-white">
      {NOTIFICATION_COUNT}
    </span>
  </Link>
); 