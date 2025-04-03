import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet'
import { Header } from '../Header'
import { useTheme } from '../theme-provider'
import { Footer } from '../Footer'
import { ThemeToggle } from '../theme-toggle'
import { SidebarNavigation } from '@/components/dashboard/SidebarNavigation'
import { Logo } from './Logo'
import { CreateReportButton } from './CreateReportButton'
import { UserMenu } from './UserMenu'
import { SearchBar } from './SearchBar'
import { motion, AnimatePresence } from 'framer-motion'
import { Cog } from 'lucide-react'

interface LayoutProps {
  children?: React.ReactNode
}

/**
 * Main layout component that provides the application structure
 * Includes sidebar navigation, header, main content area, and footer
 */
const Layout = ({ children }: LayoutProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const { theme } = useTheme()
  const navigate = useNavigate()

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <div className="flex flex-1">
        {/* Desktop Sidebar - hidden on mobile */}
        <aside className="hidden lg:flex w-64 flex-col fixed h-screen bg-[#1A1A1A] text-white border-r border-[#2A2A2A] z-30">
          {/* Logo Section */}
          <div className="h-[var(--header-height)] border-b border-[#2A2A2A] px-6 pt-[27px] flex items-center">
            <Logo />
          </div>

          {/* Create Button */}
          <div className="flex justify-center pt-14 pb-6">
            <CreateReportButton />
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="grid gap-1 p-2">
              <SidebarNavigation
                onNavigate={() => setIsMobileOpen(false)}
                isMobileOpen={isMobileOpen}
                onMobileClose={() => setIsMobileOpen(false)}
              />
            </nav>
          </div>
        </aside>

        {/* Mobile Sidebar - slides in from left */}
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent side="left" className="p-0 bg-[#1A1A1A] text-white border-r border-[#2A2A2A] pb-[20px] w-[280px] sm:w-[320px] max-h-full overflow-y-auto">
            <SheetHeader className="border-b border-[#2A2A2A] px-6 py-4">
              <div className="flex items-center justify-between">
                <Logo onClick={() => setIsMobileOpen(false)} />
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <UserMenu />
                </div>
              </div>
            </SheetHeader>
            <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>

            {/* Mobile Create Button */}
            <div className="flex justify-center pt-6 pb-4 px-4">
              <CreateReportButton fullWidth />
            </div>

            <div className="flex-1 overflow-y-auto pb-24">
              <SidebarNavigation
                onNavigate={() => setIsMobileOpen(false)}
                isMobileOpen={isMobileOpen}
                onMobileClose={() => setIsMobileOpen(false)}
              />
            </div>
            
            {/* Fixed Settings Link for Mobile */}
            <div className="absolute bottom-0 left-0 right-0 py-4 px-6 border-t border-[#2A2A2A] bg-[#1A1A1A] z-50">
              <a 
                href="/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm bg-blue-900 hover:bg-blue-800 text-white font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/settings');
                  setIsMobileOpen(false);
                }}
              >
                <Cog className="h-5 w-5" />
                <span className="text-base">Settings</span>
              </a>
            </div>
          </SheetContent>
        </Sheet>

        {/* Mobile backdrop */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Main Content Area - full width on mobile, adjusted on desktop */}
        <div className="flex-1 flex flex-col w-full lg:ml-64">
          {/* Header */}
          <Header onMobileMenuClick={() => setIsMobileOpen(!isMobileOpen)} />

          {/* Mobile Search */}
          <SearchBar 
            isOpen={false}
            onClose={() => {}}
          />

          {/* Page Content */}
          <main className="flex-1 bg-[#F8F3F1] flex flex-col">
            <div className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
              <div className="grid gap-4 sm:gap-6 md:gap-8">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="h-full"
                  >
                    {children || <Outlet />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </main>
          
          {/* Footer - full width across all screen sizes */}
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default Layout