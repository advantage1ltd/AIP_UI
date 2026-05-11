/** Chart palettes for ReportsDashboard tabs. */
import { IncidentType, IncidentInvolved } from '@/types/incidents'

type ReportsDateRange = {
  from?: Date
  to?: Date
}

// Define colors for charts
const COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#f43f5e', // rose-500
  '#f97316', // orange-500
  '#10b981', // emerald-500
  '#6366f1', // indigo-500
  '#ec4899', // pink-500
  '#94a3b8'  // slate-400
];

// Color scheme for incident types
const incidentTypeColors: Record<string, string> = {
  [IncidentType.ARREST]: '#3b82f6', // Blue
  [IncidentType.DETER]: '#8b5cf6', // Purple
  [IncidentType.THEFT]: '#f43f5e', // Rose
  [IncidentType.CRIMINAL_DAMAGE]: '#f97316', // Orange
  [IncidentType.CREDIT_CARD_FRAUD]: '#ec4899', // Pink
  [IncidentType.SUSPICIOUS_BEHAVIOUR]: '#10b981', // Emerald 
  [IncidentType.UNDERAGE_PURCHASE]: '#06b6d4', // Cyan
  [IncidentType.ANTI_SOCIAL]: '#6366f1', // Indigo
  [IncidentType.OTHERS]: '#94a3b8', // Slate
  [IncidentInvolved.SELF_SCAN_TILLS]: '#3b82f6', // Blue
  [IncidentInvolved.ABUSIVE_BEHAVIOUR]: '#f43f5e', // Rose
  [IncidentInvolved.THREATS_AND_INTIMIDATION]: '#f97316', // Orange
  [IncidentInvolved.SPITTING]: '#ec4899', // Pink
  [IncidentInvolved.BAN_FROM_STORE]: '#10b981', // Emerald
  [IncidentInvolved.VIOLENT_BEHAVIOR]: '#6366f1', // Indigo
  [IncidentInvolved.SCAN_AND_GO]: '#8b5cf6', // Purple
  [IncidentInvolved.POLICE_FAILED_TO_ATTEND]: '#facc15' // Yellow
}
