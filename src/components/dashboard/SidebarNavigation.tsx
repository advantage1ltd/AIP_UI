import { useNavigate, useLocation } from 'react-router-dom'
import { Settings as SettingsIcon, LayoutGrid } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { usePageAccess } from '@/contexts/PageAccessContext'
import { useCustomerSelection } from '@/contexts/CustomerSelectionContext'
import { CustomerSelector } from '@/components/customer/CustomerSelector'
import {
	SIDEBAR_SECTIONS,
	SIDEBAR_TOP_LINKS,
	type SidebarGuardContext,
	type SidebarNavLink,
	type SidebarSection,
} from '@/config/navigation/sidebar'

interface SidebarNavigationProps {
	onNavigate?: () => void
	isMobileOpen?: boolean
	onMobileClose?: () => void
}

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
  className?: string
	bypassAccessCheck?: boolean
}

const NavItem = ({ to, icon, label, onClick, className, bypassAccessCheck }: NavItemProps) => {
	const { hasAccess } = usePageAccess()
	const { selectedCustomerId, isAdmin } = useCustomerSelection()
	const navigate = useNavigate()
	const location = useLocation()

	// Normalize path - ensure it starts with / and doesn't have double slashes
	const normalizePath = (path: string) => {
		if (!path) return '/'
		// Remove any leading/trailing whitespace
		const trimmed = path.trim()
		// Split by ? to handle query parameters
		const [pathPart, queryPart] = trimmed.split('?')
		// Replace multiple consecutive slashes with a single slash
		// This preserves the path structure but removes double slashes
		const normalized = pathPart.replace(/\/+/g, '/')
		// Ensure it starts with exactly one / (not //)
		const finalPath = normalized.startsWith('//') ? normalized.substring(1) : normalized
		// Reattach query string if it exists
		return queryPart ? `${finalPath}?${queryPart}` : finalPath
	}

	const normalizedTo = normalizePath(to)
	const isCustomerPage = normalizedTo.startsWith('/customer/')
	const finalTo = isCustomerPage && isAdmin && selectedCustomerId ? `${normalizedTo}?customerId=${selectedCustomerId}` : normalizedTo
	const isActive = location.pathname === normalizedTo || (isCustomerPage && location.pathname === normalizedTo.split('?')[0])
  
	if (!bypassAccessCheck && !hasAccess(normalizedTo)) {
		return null
	}
  
  const handleClick = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
    
    if (isCustomerPage && isAdmin && !selectedCustomerId) {
			return
    }
    
		// Ensure path is normalized before navigation
		const normalizedFinalTo = normalizePath(finalTo)
		navigate(normalizedFinalTo)
		onClick?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			e.stopPropagation()
      
      if (isCustomerPage && isAdmin && !selectedCustomerId) {
				return
      }
      
			// Ensure path is normalized before navigation
			const normalizedFinalTo = normalizePath(finalTo)
			navigate(normalizedFinalTo)
			onClick?.()
    }
  }

  return (
    <a
      href="#"
      className={cn(
				'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
				'hover:bg-accent hover:text-accent-foreground',
				'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
				isActive && 'bg-accent text-accent-foreground',
				className,
      )}
      onClick={handleClick}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Navigate to ${label}`}
    >
      {icon}
      <span>{label}</span>
    </a>
  )
}

// Helper function to check if officer has customer reporting access
const getOfficerCustomerReportingAccess = (): boolean => {
	const officerReportingEnabled = localStorage.getItem('officer_customer_reporting_enabled')
	return officerReportingEnabled === 'true'
}

const canDisplayLink = (link: SidebarNavLink, context: SidebarGuardContext, availablePages: Array<{ path: string }>, currentRole?: string | null) => {
	// If link has a custom guard, use it (this allows explicit access control)
	if (link.guard) {
		return link.guard(context)
	}

	// If bypassAccessCheck is set, always show (for special cases like officer customer reporting)
	if (link.bypassAccessCheck) {
		return true
	}

	// For administrators, ALWAYS show all items from config (config is source of truth)
	// Check both context and direct role comparison for safety
	if (context.isAdministrator || currentRole === 'Administrator') {
		return true
	}

	// Normalize path for comparison (remove trailing slashes, handle case sensitivity)
	const normalizePath = (path: string) => path.replace(/\/$/, '').toLowerCase()
	const requestedPath = normalizePath(link.path)

	// Check if page exists in database
	const pageExistsInDb = availablePages.some(p => {
		const dbPath = normalizePath(p.path)
		return dbPath === requestedPath
	})

	// Config is the source of truth for navigation structure
	// If page doesn't exist in DB, show it anyway (route protection will handle access)
	if (!pageExistsInDb) {
		return true
	}

	// If page exists in DB, respect DB access control for non-admin users
	// This allows Settings page to control access for specific roles
	const hasAccess = context.hasAccess(link.path)
	
	// If access check fails, hide the link (user doesn't have permission)
	// This respects the Settings page configuration
	return hasAccess
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ onNavigate, onMobileClose }) => {
	const { hasAccess, currentRole, isLoading, availablePages } = usePageAccess()
	const { selectedCustomerId, isAdmin } = useCustomerSelection()
	const navigate = useNavigate()
	const location = useLocation()
  
  if (isLoading) {
    return (
      <div className="px-3 py-2">
        <div className="space-y-4">
          <div className="pl-5">
            <div className="w-[180px] h-9 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-[20px]" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
		)
  }

  if (!currentRole) {
    return (
      <div className="px-3 py-2">
				<div className="text-sm text-gray-500 dark:text-gray-400">Please log in to view navigation</div>
        </div>
		)
  }
  
	const isCustomerRole = currentRole === 'CustomerSiteManager' || currentRole === 'CustomerHOManager'
	const isAdministrator = currentRole === 'Administrator'
	const isOfficerRole = currentRole === 'AdvantageOneOfficer' || currentRole === 'AdvantageOneHOOfficer'

	const guardContext: SidebarGuardContext = {
		hasAccess,
		isCustomerRole,
		isAdministrator,
		isOfficerRole,
		hasOfficerCustomerReportingAccess: getOfficerCustomerReportingAccess,
	}

	const pages = availablePages || []
	const topLevelLinks = SIDEBAR_TOP_LINKS.filter((link) => canDisplayLink(link, guardContext, pages, currentRole))

	const visibleSections = SIDEBAR_SECTIONS.reduce<SidebarSection[]>((acc, section) => {
		const guardPassed = section.guard ? section.guard(guardContext) : true
		if (!guardPassed) {
			return acc
		}

		const links = section.links.filter((link) => canDisplayLink(link, guardContext, pages, currentRole))
		if (links.length === 0) {
			return acc
		}

		acc.push({ ...section, links })
		return acc
	}, [])

  const handleKeyDown = (to: string) => (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()

			const isCustomerPage = to.startsWith('/customer/')
			const finalTo = isCustomerPage && isAdmin && selectedCustomerId ? `${to}?customerId=${selectedCustomerId}` : to

      if (isCustomerPage && isAdmin && !selectedCustomerId) {
				return
      }
      
			navigate(finalTo)
			onNavigate?.()
			onMobileClose?.()
    }
	}

  const handleNavigation = (to: string) => (e: React.MouseEvent) => {
		e.preventDefault()

		const isCustomerPage = to.startsWith('/customer/')
		const finalTo = isCustomerPage && isAdmin && selectedCustomerId ? `${to}?customerId=${selectedCustomerId}` : to

    if (isCustomerPage && isAdmin && !selectedCustomerId) {
			return
    }
    
		navigate(finalTo)
		onNavigate?.()
		onMobileClose?.()
  }

  return (
    <div className="px-3 py-2">
      <div className="space-y-4">
        {hasAccess('/dashboard') && (
          <div className="pl-5">
            <Button
              asChild
              className={cn(
								'w-[180px] rounded-[20px] bg-white px-3 text-black hover:bg-white/90 flex h-9 items-center justify-start gap-2',
								location.pathname === '/' && 'bg-white/90',
              )}
            >
              <a 
                href="/" 
								onClick={handleNavigation('/')}
								onKeyDown={handleKeyDown('/')}
                className="flex items-center gap-2"
              >
								<div className="rounded-lg bg-red-500/10 p-1.5">
                  <LayoutGrid className="h-[18px] w-[18px] text-red-500" />
                </div>
                <span className="text-xs font-medium">Dashboard</span>
              </a>
            </Button>
          </div>
        )}

				{topLevelLinks.map((link) => {
					const Icon = link.icon
					return (
          <NavItem
							key={link.path}
							to={link.path}
							icon={<Icon className="h-4 w-4" />}
							label={link.label}
            onClick={onNavigate}
							bypassAccessCheck={link.bypassAccessCheck}
          />
					)
				})}

        <Accordion type="multiple" className="space-y-2">
					{visibleSections.map((section) => {
						const SectionIcon = section.icon
						return (
							<AccordionItem value={section.id} key={section.id}>
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
										<SectionIcon className="h-4 w-4" />
										<span>{section.label}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
									{section.showCustomerSelector && isAdmin && (
                  <div className="px-3 pb-2">
                    <CustomerSelector />
                    {!selectedCustomerId && (
												<p className="mt-2 text-xs text-amber-600 dark:text-amber-500">
                        Please select a customer to access customer pages
                      </p>
                    )}
                  </div>
                )}
                
									{section.links.map((link) => {
										const Icon = link.icon
										return (
                  <NavItem
												key={link.path}
												to={link.path}
												icon={<Icon className="h-4 w-4" />}
												label={link.label}
                    onClick={onNavigate}
												bypassAccessCheck={link.bypassAccessCheck}
                  />
										)
									})}
              </AccordionContent>
            </AccordionItem>
						)
					})}
        </Accordion>

        {isAdministrator && hasAccess('/settings') && (
          <NavItem
            to="/settings"
            icon={<SettingsIcon className="h-4 w-4" />}
            label="Settings"
            onClick={onNavigate}
            className="mt-4"
          />
        )}
      </div>
    </div>
	)
}