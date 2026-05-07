import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Footer } from '../Footer'
import { SidebarNavigation } from '@/components/dashboard/SidebarNavigation'
import { Logo } from './Logo'
import { SearchBar } from './SearchBar'
import { motion, AnimatePresence } from 'framer-motion'
import { Cog } from 'lucide-react'
import { Header } from '../Header'

interface LayoutProps {
  children?: React.ReactNode
}

/**
 * Main layout component that provides the application structure
 * Includes sidebar navigation, header, main content area, and footer
 */
export const Layout = ({ children }: LayoutProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-gradient-to-br from-slate-50 via-background to-indigo-50/30 text-foreground dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/20">
      <div className="flex flex-1">
        {/* Desktop Sidebar - hidden on mobile */}
        <aside className="hidden lg:flex w-64 flex-col fixed h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-r border-slate-800/90 z-30 shadow-[8px_0_28px_-18px_rgba(2,6,23,0.85)]">
          {/* Logo Section */}
          <div className="h-[var(--header-height)] border-b border-slate-800/90 px-6 pt-[27px] flex items-center">
            <Logo />
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

        {/* Mobile Sidebar */}
        {isMobileOpen && (
          <aside className="fixed inset-y-0 left-0 z-50 lg:hidden w-64 flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-r border-slate-800/90 shadow-[8px_0_28px_-18px_rgba(2,6,23,0.85)]">
            {/* Logo Section */}
            <div className="h-[var(--header-height)] border-b border-slate-800/90 px-6 pt-[27px] flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1 rounded-md hover:bg-gray-600 transition-colors"
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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
        )}

        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Main Content Area - full width on mobile, adjusted on desktop */}
        <div className="flex-1 flex min-w-0 flex-col w-full lg:ml-64">
          {/* Header */}
          <Header onMobileMenuClick={() => setIsMobileOpen(!isMobileOpen)} />

          {/* Mobile Search */}
          <SearchBar 
            isOpen={false}
            onClose={() => {}}
          />

          {/* Page Content */}
          <main className="flex min-w-0 flex-1 flex-col bg-gradient-to-b from-transparent via-background/60 to-background">
            <div className="flex-1 w-full max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
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

export { Layout as default }