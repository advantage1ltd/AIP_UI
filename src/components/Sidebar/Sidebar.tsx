// import { useState, useEffect } from 'react'
// import { 
//   Calendar, 
//   Users, 
//   Settings as SettingsIcon, 
//   Phone, 
//   Monitor, 
//   User, 
//   Briefcase,
//   Shield,
//   Bell,
//   FileText,
//   ChevronDown,
//   ChevronRight,
//   Building2,
//   Globe,
//   Package,
//   Menu,
//   X,
//   Clipboard,
//   LayoutDashboard,
//   CirclePlus
// } from 'lucide-react'
// import { Link, useLocation } from 'react-router-dom'

// interface MenuItem {
//   label: string
//   icon?: React.ReactNode
//   path?: string
//   children?: MenuItem[]
// }

// interface SidebarProps {
//   isOpen?: boolean;
//   onClose?: () => void;
// }

// const menuItems: MenuItem[] = [
//   {
//     label: 'Dashboard',
//     icon: <LayoutDashboard className="w-5 h-5 text-white" />,
//     path: '/dashboard'
//   },
//   {
//     label: 'Action Calendar',
//     icon: <Calendar className="w-5 h-5 text-white" />,
//     path: '/calendar'
//   },
//   {
//     label: 'Administration',
//     icon: <SettingsIcon className="w-5 h-5 text-white" />,
//     children: [
//       { label: 'User Setup', path: '/admin/users', icon: <Users className="w-4 h-4 text-white" /> },
//       { label: 'Employee Registration', path: '/admin/employees', icon: <User className="w-4 h-4 text-white" /> },
//       { label: 'Customer Setup', path: '/admin/customers', icon: <Briefcase className="w-4 h-4 text-white" /> },
//       { label: 'Site', path: '/admin/site', icon: <Building2 className="w-4 h-4 text-white" /> },
//       { label: 'Region', path: '/admin/region', icon: <Globe className="w-4 h-4 text-white" /> },
//       { label: 'Stock Control', path: '/admin/stock', icon: <Package className="w-4 h-4 text-white" /> }
//     ]
//   },
//   {
//     label: 'Operations',
//     icon: <SettingsIcon className="w-5 h-5 text-white" />,
//     children: [
//       { label: 'Incident Report', path: '/operations/incident-report', icon: <Clipboard className="w-4 h-4 text-white" /> },
//       { label: 'Mystery Shopper', path: '/operations/mystery-shopper', icon: <Clipboard className="w-4 h-4 text-white" /> },
//       { label: 'Site Visit', path: '/operations/site-visit', icon: <User className="w-4 h-4 text-white" /> },
//       { label: 'Holiday Requests', path: '/operations/holiday-requests', icon: <Calendar className="w-4 h-4 text-white" /> }
//     ]
//   },
//   {
//     label: 'Employee',
//     icon: <User className="w-5 h-5 text-white" />,
//     children: [
//       { label: 'Directory', path: '/employee/directory', icon: <Users className="w-4 h-4 text-white" /> },
//       { label: 'Onboarding', path: '/employee/onboarding', icon: <User className="w-4 h-4 text-white" /> }
//     ]
//   },
//   {
//     label: 'Management',
//     icon: <Briefcase className="w-5 h-5 text-white" />,
//     children: [
//       { label: 'Reports', path: '/management/reports', icon: <FileText className="w-4 h-4 text-white" /> },
//       { label: 'Analytics', path: '/management/analytics', icon: <LayoutDashboard className="w-4 h-4 text-white" /> }
//     ]
//   },
//   {
//     label: 'Customer',
//     icon: <Users className="w-5 h-5 text-white" />,
//     children: [
//       { label: 'Directory', path: '/customer/directory', icon: <Users className="w-4 h-4 text-white" /> },
//       { label: 'Contracts', path: '/customer/contracts', icon: <FileText className="w-4 h-4 text-white" /> }
//     ]
//   },
//   {
//     label: 'CRM',
//     icon: <Users className="w-5 h-5 text-white" />,
//     children: [
//       { label: 'Contacts', path: '/crm/contacts', icon: <Users className="w-4 h-4 text-white" /> },
//       { label: 'Deals', path: '/crm/deals', icon: <Briefcase className="w-4 h-4 text-white" /> },
//       { label: 'Pipeline', path: '/crm/pipeline', icon: <Building2 className="w-4 h-4 text-white" /> }
//     ]
//   },
//   {
//     label: 'Recruitment',
//     icon: <User className="w-5 h-5 text-white" />,
//     children: [
//       { label: 'Job Postings', path: '/recruitment/jobs', icon: <FileText className="w-4 h-4 text-white" /> },
//       { label: 'Candidates', path: '/recruitment/candidates', icon: <Users className="w-4 h-4 text-white" /> }
//     ]
//   },
//   {
//     label: 'Compliance',
//     icon: <Shield className="w-5 h-5 text-white" />,
//     children: [
//       { label: 'Policies', path: '/compliance/policies', icon: <FileText className="w-4 h-4 text-white" /> },
//       { label: 'Audits', path: '/compliance/audits', icon: <Clipboard className="w-4 h-4 text-white" /> }
//     ]
//   },
//   {
//     label: 'Settings',
//     icon: <SettingsIcon className="w-5 h-5 text-white" />,
//     path: '/settings'
//   }
// ]

// export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
//   const [expandedSections, setExpandedSections] = useState<string[]>([])
//   const location = useLocation()
//   const isMobileOpen = isOpen !== undefined ? isOpen : false
//   const handleClose = onClose || (() => {})

//   // Close sidebar when clicking outside on mobile
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const sidebar = document.getElementById('sidebar')
//       if (
//         sidebar && 
//         !sidebar.contains(event.target as Node) && 
//         isMobileOpen
//       ) {
//         handleClose()
//       }
//     }

//     document.addEventListener('mousedown', handleClickOutside)
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside)
//     }
//   }, [isMobileOpen, handleClose])

//   // Close mobile sidebar when route changes
//   useEffect(() => {
//     if (isMobileOpen) {
//       handleClose()
//     }
//   }, [location.pathname, isMobileOpen, handleClose])

//   // Handle escape key press to close sidebar
//   useEffect(() => {
//     const handleEscapeKey = (event: KeyboardEvent) => {
//       if (event.key === 'Escape' && isMobileOpen) {
//         handleClose()
//       }
//     }

//     document.addEventListener('keydown', handleEscapeKey)
//     return () => {
//       document.removeEventListener('keydown', handleEscapeKey)
//     }
//   }, [isMobileOpen, handleClose])

//   const toggleSection = (section: string) => {
//     if (expandedSections.includes(section)) {
//       setExpandedSections(expandedSections.filter((s) => s !== section))
//     } else {
//       setExpandedSections([...expandedSections, section])
//     }
//   }

//   // Auto-expand section based on current path
//   useEffect(() => {
//     const currentPath = location.pathname
//     menuItems.forEach(item => {
//       if (item.children) {
//         const shouldExpand = item.children.some(child => 
//           currentPath === child.path || currentPath.startsWith(`${child.path}/`)
//         )
        
//         if (shouldExpand && !expandedSections.includes(item.label)) {
//           setExpandedSections(prev => [...prev, item.label])
//         }
//       }
//     })
//   }, [location.pathname, expandedSections])

//   return (
//     <>
//       {/* Mobile Overlay */}
//       {isMobileOpen && (
//         <div 
//           className="fixed inset-0 bg-black/50 xl:hidden z-40"
//           onClick={handleClose}
//           aria-hidden="true"
//           role="dialog"
//           aria-modal="true"
//           aria-label="Navigation menu"
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         id="sidebar"
//         className={`
//           fixed top-0 left-0 h-full w-64 z-50
//           bg-black
//           transform transition-all duration-300 ease-in-out
//           xl:translate-x-0
//           ${isMobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}
//           overflow-hidden flex flex-col
//           xl:pt-10
//           xl:shadow-none
//         `}
//         aria-hidden={!isMobileOpen && window.innerWidth < 1280}
//         role="navigation"
//       >
//         {/* Logo/Brand - Only visible on desktop */}
//         <div className="h-16 xl:flex items-center justify-between px-4 border-b border-gray-800 hidden">
//           <div className="flex items-center">
//             <span className="text-red-500 font-bold mr-2">one</span>
//             <h1 className="text-xl font-bold text-white">Advantage One</h1>
//           </div>
//         </div>

//         {/* Create new report button */}
//         <div className="px-4 py-3 mt-14 xl:mt-0">
//           <button 
//             className="flex items-center gap-2 bg-white text-black rounded-full px-4 py-2 w-full hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
//             aria-label="Create new report"
//           >
//             <CirclePlus className="w-5 h-5 text-red-500" />
//             <span>Create new report</span>
//           </button>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 overflow-y-auto py-2 space-y-1">
//           {menuItems.map((item) => {
//             const isActive = item.path === location.pathname || 
//               (item.children && item.children.some(child => 
//                 child.path === location.pathname || location.pathname.startsWith(`${child.path}/`)
//               ))
            
//             return (
//               <div key={item.label}>
//                 {item.children ? (
//                   // Expandable section
//                   <div>
//                     <button 
//                       onClick={() => toggleSection(item.label)}
//                       className={`
//                         flex items-center justify-between w-full px-4 py-2 
//                         text-white
//                         hover:bg-gray-800
//                         ${isActive ? 'bg-gray-800 font-medium' : ''}
//                         transition-colors duration-150 ease-in-out
//                         focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-inset
//                       `}
//                       aria-expanded={expandedSections.includes(item.label)}
//                       aria-controls={`section-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
//                     >
//                       <div className="flex items-center">
//                         {item.icon}
//                         <span className="ml-2">{item.label}</span>
//                       </div>
//                       <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${
//                         expandedSections.includes(item.label) ? 'rotate-180' : ''
//                       }`} />
//                     </button>
//                     <div 
//                       id={`section-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
//                       className={`
//                         overflow-hidden transition-all duration-300 ease-in-out
//                         ${expandedSections.includes(item.label) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
//                       `}
//                     >
//                       <div className="pl-4 border-l border-gray-700 ml-4 my-1">
//                         {item.children.map((child) => {
//                           const isChildActive = child.path === location.pathname || 
//                             location.pathname.startsWith(`${child.path}/`)
                          
//                           return (
//                             <Link
//                               key={child.path}
//                               to={child.path || '#'}
//                               className={`
//                                 flex items-center px-4 py-2 text-sm
//                                 text-gray-300
//                                 hover:bg-gray-800 hover:text-white
//                                 ${isChildActive ? 'bg-gray-800 text-white font-medium' : ''}
//                                 rounded-md my-0.5
//                                 transition-colors duration-150 ease-in-out
//                                 focus:outline-none focus:ring-1 focus:ring-gray-500
//                               `}
//                               aria-current={isChildActive ? 'page' : undefined}
//                               tabIndex={0}
//                               role="menuitem"
//                             >
//                               {child.icon}
//                               <span className="ml-2">{child.label}</span>
//                             </Link>
//                           )
//                         })}
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   // Single item
//                   <Link
//                     to={item.path || '#'}
//                     className={`
//                       flex items-center px-4 py-2
//                       text-white
//                       hover:bg-gray-800
//                       ${item.path === location.pathname ? 'bg-gray-800 font-medium' : ''}
//                       transition-colors duration-150 ease-in-out
//                       focus:outline-none focus:ring-1 focus:ring-gray-500
//                     `}
//                     aria-current={item.path === location.pathname ? 'page' : undefined}
//                     tabIndex={0}
//                     role="menuitem"
//                   >
//                     {item.icon}
//                     <span className="ml-2">{item.label}</span>
//                   </Link>
//                 )}
//               </div>
//             )
//           })}
//         </nav>

//         {/* Close button - Only visible on mobile/tablet */}
//         <button
//           onClick={handleClose}
//           className="xl:hidden absolute top-3 right-3 p-1.5 rounded-md hover:bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
//           aria-label="Close menu"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </aside>
//     </>
//   )
// } 