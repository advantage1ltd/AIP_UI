import { useState } from 'react'
import { 
  Calendar, 
  Users, 
  Settings as SettingsIcon, 
  Phone, 
  Monitor, 
  User, 
  Briefcase,
  Shield,
  Bell,
  FileText,
  ChevronDown,
  ChevronRight,
  Building2,
  Globe,
  Package,
  Menu,
  Clipboard
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface MenuItem {
  label: string
  icon?: React.ReactNode
  path?: string
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: <Monitor className="w-5 h-5" />,
    path: '/dashboard'
  },
  {
    label: 'CRM',
    icon: <Users className="w-5 h-5" />,
    children: [
      { label: 'Contacts', path: '/crm/contacts', icon: <Users className="w-4 h-4" /> },
      { label: 'Deals', path: '/crm/deals', icon: <Briefcase className="w-4 h-4" /> },
      { label: 'Pipeline', path: '/crm/pipeline', icon: <Building2 className="w-4 h-4" /> }
    ]
  },
  {
    label: 'Action Calendar',
    icon: <Calendar className="w-5 h-5" />,
    path: '/calendar'
  },
  {
    label: 'Operations',
    icon: <SettingsIcon className="w-5 h-5" />,
    children: [
      { label: 'Incident Report', path: '/operations/incident-report', icon: <Clipboard className="w-4 h-4" /> },
      { label: 'Mystery Shopper', path: '/operations/mystery-shopper', icon: <Clipboard className="w-4 h-4" /> },
      { label: 'Site Visit', path: '/operations/site-visit', icon: <User className="w-4 h-4" /> },
      { label: 'Holiday Requests', path: '/operations/holiday-requests', icon: <Calendar className="w-4 h-4" /> }
    ]
  },
  {
    label: 'Administration',
    icon: <SettingsIcon className="w-5 h-5" />,
    children: [
      { label: 'User Setup', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
      { label: 'Employee Registration', path: '/admin/employees', icon: <User className="w-4 h-4" /> },
      { label: 'Customer Setup', path: '/admin/customers', icon: <Briefcase className="w-4 h-4" /> },
      { label: 'Site', path: '/admin/site', icon: <Building2 className="w-4 h-4" /> },
      { label: 'Region', path: '/admin/region', icon: <Globe className="w-4 h-4" /> },
      { label: 'Stock Control', path: '/admin/stock', icon: <Package className="w-4 h-4" /> },
      { label: 'Customer Contract Overview', path: '/admin/contracts', icon: <FileText className="w-4 h-4" /> },
      { label: 'Inventory Management', path: '/admin/inventory', icon: <Building2 className="w-4 h-4" /> }
    ]
  }
]

export const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter((s) => s !== section))
    } else {
      setExpandedSections([...expandedSections, section])
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>

        {/* Navigation */}
        <nav className="h-[calc(100vh-4rem)] overflow-y-auto py-4 space-y-1">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.children ? (
                // Expandable section
                <div>
                  <button 
                    onClick={() => toggleSection(item.label)}
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                    <ChevronDown className="ml-auto" />
                  </button>
                  {expandedSections.includes(item.label) && (
                    <div className="ml-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path || '#'}
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          {child.icon}
                          <span className="ml-2">{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Single item
                <Link
                  to={item.path || '#'}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-4 right-4 lg:hidden z-50 
          bg-primary-500 text-white p-3 rounded-full shadow-lg
          hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Toggle Menu"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  )
} 