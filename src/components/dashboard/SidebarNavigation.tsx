/**
 * Sidebar navigation tree from navigation config.
 * Flow: PageAccessContext filters sections → customer selector when applicable → route navigation.
 */
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Settings as SettingsIcon, LayoutGrid } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '../ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { usePageAccess } from '@/contexts/PageAccessContext'
import { PageAccessContext } from '@/contexts/PageAccessContext'
import { useAuth } from '@/contexts/AuthContext'
import { useCustomerSelection } from '@/contexts/CustomerSelectionContext'
import { CustomerSelector } from '@/components/customer/CustomerSelector'
import {
	SIDEBAR_SECTIONS,
	SIDEBAR_TOP_LINKS,
	type SidebarGuardContext,
	type SidebarNavLink,
	type SidebarSection,
} from '@/config/navigation/sidebar'
import { harmonizeRole } from '@/utils/roles'
import { logger } from '@/utils/logger'

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
	disabled?: boolean
}

const NavItem = ({ to, icon, label, onClick, className, bypassAccessCheck, disabled = false }: NavItemProps) => {
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
  
	// Access check is already handled by canDisplayLink in the parent component
	// The parent filters links before passing them to NavItem, so we don't need to check again here
	// bypassAccessCheck is only used for special cases where NavItem might be used outside the normal flow
  
  const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (disabled) {
			return
		}
    
    logger.debug('[SidebarNavigation] Link Click', {
      label,
      originalTo: to,
      normalizedTo,
      finalTo,
      isCustomerPage,
      isAdmin,
      selectedCustomerId
    });
    
    if (isCustomerPage && isAdmin && !selectedCustomerId) {
      logger.debug('[SidebarNavigation] Navigation blocked: customer page requires customer selection');
      logger.debug('[SidebarNavigation] Block details', {
        reason: 'Customer page accessed by admin without selectedCustomerId',
        action: 'No navigation performed'
      });
			return
    }
    
		// Ensure path is normalized before navigation
		const normalizedFinalTo = normalizePath(finalTo)
    
    logger.debug('[SidebarNavigation] Executing navigation:', {
      from: location.pathname + location.search,
      to: normalizedFinalTo,
      timestamp: new Date().toISOString()
    });
    
		navigate(normalizedFinalTo)
		onClick?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			e.stopPropagation()
			if (disabled) {
				return
			}
      
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
    <button
      type="button"
      className={cn(
				'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
				'hover:bg-accent hover:text-accent-foreground',
				'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
				isActive && 'bg-accent text-accent-foreground',
				disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-inherit',
				className,
      )}
      onClick={handleClick}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Navigate to ${label}`}
			aria-disabled={disabled}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

const canDisplayLink = (link: SidebarNavLink, context: SidebarGuardContext, availablePages: Array<{ path: string }>, currentRole?: string | null) => {
	// If bypassAccessCheck is set, always show (for special cases like officer customer reporting)
	// Check this FIRST before any other logic
	if (link.bypassAccessCheck) {
		// Still respect the guard if it exists, but bypass the Settings check
		if (link.guard) {
			return link.guard(context)
		}
		return true
	}

	// For administrators, ALWAYS show all items from config
	if (context.isAdministrator || currentRole === 'administrator') {
		return true
	}

	// If link has a custom guard, use it
	if (link.guard) {
		const guardResult = link.guard(context)
		// Guard should check hasAccess internally, so just return its result
		return guardResult
	}

	// For all other roles, ONLY use Settings-based access control
	const hasAccess = context.hasAccess(link.path)
	return hasAccess
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ onNavigate, onMobileClose }) => {
	const pageAccessContext = React.useContext(PageAccessContext)
	const hasAccess = React.useCallback((path: string) => {
		return pageAccessContext ? pageAccessContext.hasAccess(path) : false
	}, [pageAccessContext])
	const currentRole = pageAccessContext?.currentRole ?? null
	const isLoading = pageAccessContext?.isLoading ?? true
	const availablePages = React.useMemo(() => pageAccessContext?.availablePages ?? [], [pageAccessContext?.availablePages])
	const pageAccessByRole = React.useMemo(() => pageAccessContext?.pageAccessByRole ?? {}, [pageAccessContext?.pageAccessByRole])
	const { user } = useAuth(); // Check user from AuthContext
	const { selectedCustomerId, isAdmin } = useCustomerSelection()
	const navigate = useNavigate()
	const location = useLocation()
	
	// Compute guard context and sections (must be before early returns)
	const harmonizedRole = harmonizeRole(currentRole)
	const isCustomerRole = harmonizedRole === 'customer'
	const isAdministrator = harmonizedRole === 'administrator'
	const isOfficerRole = harmonizedRole === 'securityofficer' || harmonizedRole === 'manager'

	const guardContext: SidebarGuardContext = React.useMemo(() => ({
		hasAccess,
		isCustomerRole,
		isAdministrator,
		isOfficerRole
	}), [hasAccess, isCustomerRole, isAdministrator, isOfficerRole]);

	// Debug: Log current page access for officer role
	React.useEffect(() => {
		if (harmonizedRole === 'securityofficer') {
			const officerPages = pageAccessByRole[currentRole || ''] || pageAccessByRole['securityofficer'] || [];
			const customerReportingPages = officerPages.filter(id => 
				id === 'management-customer-reporting' || id.includes('customer-reporting')
			);
			const customerReportingPage = availablePages.find(p => 
				p.path === '/management/customer-reporting' || 
				p.id === 'management-customer-reporting'
			);
			
			logger.debug(`🔍 [Sidebar] Officer role page access:`, {
				totalPages: officerPages.length,
				customerReporting: {
					enabled: customerReportingPages.length > 0,
					pageIds: customerReportingPages,
					pageInAvailablePages: !!customerReportingPage,
					pageId: customerReportingPage?.id,
					hasAccess: customerReportingPage ? hasAccess('/management/customer-reporting') : false
				}
			});
		}
	}, [currentRole, pageAccessByRole, availablePages, hasAccess]);

	// Create a key based on pageAccessByRole to force re-render when settings change
	const settingsKey = React.useMemo(() => {
		if (currentRole && pageAccessByRole[currentRole]) {
			return JSON.stringify([...pageAccessByRole[currentRole]].sort())
		}
		return ''
	}, [currentRole, pageAccessByRole])

	const pages = React.useMemo(() => availablePages, [availablePages])
	const [customerPageSearch, setCustomerPageSearch] = React.useState('')
	
	// Debug: Log available pages and page access for Customer Reporting
	React.useEffect(() => {
		if (harmonizedRole === 'securityofficer') {
			const customerReportingPage = pages.find(p => 
				p.path === '/management/customer-reporting' || 
				p.id === 'management-customer-reporting'
			);
			const officerPages = pageAccessByRole[currentRole] || [];
			const hasCustomerReporting = officerPages.includes('management-customer-reporting') || 
				officerPages.some(id => id.includes('customer-reporting'));
			
			logger.debug(`🔍 [Sidebar] Available pages and access check:`, {
				totalAvailablePages: pages.length,
				customerReportingPage: customerReportingPage ? {
					id: customerReportingPage.id,
					path: customerReportingPage.path,
					title: customerReportingPage.title
				} : 'NOT FOUND',
				officerHasAccess: hasCustomerReporting,
				officerAllowedPages: officerPages.slice(0, 5), // First 5 for brevity
				willShowInSidebar: customerReportingPage ? guardContext.hasAccess('/management/customer-reporting') : false
			});
		}
	}, [pages, currentRole, pageAccessByRole, guardContext]);
	
	const topLevelLinks = React.useMemo(() => {
		const filtered = SIDEBAR_TOP_LINKS.filter((link) => canDisplayLink(link, guardContext, pages, currentRole));
		
		// Debug Customer Reporting specifically
		if (harmonizedRole === 'securityofficer') {
			const customerReportingLink = SIDEBAR_TOP_LINKS.find(l => l.path === '/management/customer-reporting');
			if (customerReportingLink) {
				const willShow = canDisplayLink(customerReportingLink, guardContext, pages, currentRole);
				logger.debug(`🔍 [Sidebar] Top-level Customer Reporting link:`, {
					willShow,
					hasAccess: guardContext.hasAccess('/management/customer-reporting'),
					pageInAvailablePages: !!pages.find(p => p.path === '/management/customer-reporting')
				});
			}
		}
		
		return filtered;
	}, [guardContext, pages, currentRole]);

	const visibleSections = React.useMemo(() => {
		return SIDEBAR_SECTIONS.reduce<SidebarSection[]>((acc, section) => {
			const guardPassed = section.guard ? section.guard(guardContext) : true
			if (!guardPassed) {
				return acc
			}

			const links = section.links.filter((link) => {
				const canDisplay = canDisplayLink(link, guardContext, pages, currentRole)
				
				// Enhanced debug logging for Customer Reporting specifically
				if (link.path === '/management/customer-reporting') {
					const page = pages.find(p => p.path === link.path);
					const officerPages = pageAccessByRole['securityofficer'] || [];
					const hasCustomerReporting = officerPages.includes('management-customer-reporting') || 
						officerPages.some(id => id.includes('customer-reporting'));
					logger.debug(`🔍 [Sidebar] Customer Reporting link check:`, {
						label: link.label,
						path: link.path,
						canDisplay,
						currentRole,
						hasAccess: guardContext.hasAccess(link.path),
						pageInAvailablePages: !!page,
						pageId: page?.id,
						officerHasCustomerReporting: hasCustomerReporting,
						officerPagesCount: officerPages.length,
						settingsKey
					});
				}
				
				// Debug logging for CRM section
				if (section.id === 'crm') {
					logger.debug(`🔍 [Sidebar] CRM link "${link.label}" (${link.path}):`, {
						canDisplay,
						currentRole,
						hasAccess: guardContext.hasAccess(link.path),
						settingsKey
					})
				}
				return canDisplay
			})
			
			// Debug logging for CRM section
			if (section.id === 'crm') {
				logger.debug(`🔍 [Sidebar] CRM section filtered:`, {
					sectionId: section.id,
					totalLinks: section.links.length,
					filteredLinks: links.length,
					willShow: links.length > 0,
					settingsKey
				})
			}
			
			if (links.length === 0) {
				return acc
			}

			acc.push({ ...section, links })
			return acc
		}, [])
	}, [guardContext, pages, currentRole, settingsKey, pageAccessByRole])

	const customerSection = React.useMemo(
		() => visibleSections.find(section => section.id === 'customer') ?? null,
		[visibleSections]
	)

	const filteredCustomerLinkPaths = React.useMemo(() => {
		const section = customerSection
		if (!section) return new Set<string>()
		const term = customerPageSearch.trim().toLowerCase()
		const links = term
			? section.links.filter(link => link.label.toLowerCase().includes(term))
			: section.links
		return new Set(links.map(link => link.path))
	}, [customerPageSearch, customerSection])

	if (!pageAccessContext) {
		return (
			<div className="px-3 py-2">
				<div className="text-sm text-gray-500 dark:text-gray-400">Loading navigation...</div>
			</div>
		)
	}
  
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

  // If no user at all, show login message
  if (!user) {
    return (
      <div className="px-3 py-2">
				<div className="text-sm text-gray-500 dark:text-gray-400">Please log in to view navigation</div>
        </div>
		)
  }

  // User exists but role not initialized yet - show loading
  if (!currentRole) {
    return (
      <div className="px-3 py-2">
				<div className="text-sm text-gray-500 dark:text-gray-400">Loading navigation...</div>
        </div>
		)
  }

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
								'flex h-9 w-[180px] items-center justify-start gap-2 rounded-[20px] border border-slate-200/80 bg-gradient-to-r from-white to-slate-100 px-3 text-slate-900 shadow-[0_8px_20px_-14px_rgba(148,163,184,0.8)] hover:from-white hover:to-slate-200',
								location.pathname === '/' && 'from-white to-slate-200',
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

        <Accordion type="multiple" className="space-y-2" key={settingsKey}>
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
                
									{section.id === 'customer' && (
										<div className="space-y-2 px-3 pb-2">
											<div className="rounded-md border border-slate-200/70 bg-slate-50/80 p-2">
												<p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
													Customer context
												</p>
												<p className="mt-1 text-xs text-slate-600">
													{isAdmin
														? selectedCustomerId
															? `Selected customer ID: ${selectedCustomerId}`
															: 'Select a customer below to open customer pages'
														: 'Customer pages reflect your assigned customer context'}
												</p>
											</div>
											<Input
												value={customerPageSearch}
												onChange={(event) => setCustomerPageSearch(event.target.value)}
												placeholder="Search customer pages..."
												className="h-8 border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-500"
												aria-label="Search customer pages"
											/>
										</div>
									)}

									{section.links
										.filter(link => section.id !== 'customer' || filteredCustomerLinkPaths.has(link.path))
										.map((link) => {
										const Icon = link.icon
										const customerSelectionRequired = section.id === 'customer' && isAdmin && !selectedCustomerId
										return (
                  <NavItem
												key={link.path}
												to={link.path}
												icon={<Icon className="h-4 w-4" />}
												label={link.label}
                    onClick={onNavigate}
												bypassAccessCheck={link.bypassAccessCheck}
												disabled={customerSelectionRequired}
                  />
										)
									})}
									{section.id === 'customer' && filteredCustomerLinkPaths.size === 0 && (
										<p className="px-3 py-2 text-xs text-slate-500">No customer pages match your search.</p>
									)}
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