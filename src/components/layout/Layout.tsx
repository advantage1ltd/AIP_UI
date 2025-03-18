import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet'
import { Header } from '../Header'
import { useTheme } from '../theme-provider'
import { Footer } from '../Footer'
import { ThemeToggle } from '../theme-toggle'
import { SidebarNavigation } from '../dashboard/SidebarNavigation'
import { Logo } from './Logo'
import { CreateReportButton } from './CreateReportButton'
import { UserMenu } from './UserMenu'
import { SearchBar } from './SearchBar'

interface LayoutProps {
  children?: React.ReactNode
}

/**
 * Main layout component that provides the application structure
 * Includes sidebar navigation, header, main content area, and footer
 */
function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const { theme } = useTheme()

  // Handler for navigation item clicks in mobile view
  const handleMobileNavigation = () => setIsSidebarOpen(false)

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
              <SidebarNavigation onNavigate={handleMobileNavigation} />
            </nav>
          </div>
        </aside>

        {/* Mobile Sidebar - slides in from left */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="p-0 bg-[#1A1A1A] text-white border-r border-[#2A2A2A] pb-[20px] w-[280px] sm:w-[320px]">
            <SheetHeader className="border-b border-[#2A2A2A] px-6 py-4">
              <div className="flex items-center justify-between">
                <Logo onClick={handleMobileNavigation} />
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <UserMenu />
                </div>
              </div>
            </SheetHeader>
            <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>

            {/* Mobile Create Button */}
            <div className="flex justify-center pt-8 pb-6 px-4">
              <CreateReportButton fullWidth />
            </div>

            <div className="flex-1 overflow-y-auto">
              <SidebarNavigation onNavigate={handleMobileNavigation} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content Area - full width on mobile, adjusted on desktop */}
        <div className="flex-1 flex flex-col w-full lg:ml-64">
          {/* Header */}
          <Header />

          {/* Mobile Search */}
          <SearchBar 
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
          />

          {/* Page Content */}
          <main className="flex-1 bg-[#F8F3F1] flex flex-col">
            <div className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
              <div className="grid gap-4 sm:gap-6 md:gap-8">
                {children || <Outlet />}
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