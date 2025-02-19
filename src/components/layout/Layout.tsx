import React from 'react'
import { Link } from 'react-router-dom'
import { Bell, Settings as SettingsIcon, LogOut, User, Menu, X, Search, ChevronDown, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '../ui/dropdown-menu'
import { Input } from '../ui/input'
import { SidebarNavigation } from '../dashboard/SidebarNavigation'
import { ThemeToggle } from '../theme-toggle'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet'

interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-[#1A1A1A] text-white border-r border-[#2A2A2A]">
        {/* Logo Section */}
        <div className="h-[var(--header-height)] border-b border-[#2A2A2A] px-6 pt-[27px] flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.ico" alt="AIP Logo" className="h-6 w-6" />
            <span className="font-semibold text-lg">AIP</span>
          </Link>
        </div>

        {/* Create Button */}
        <div className="flex justify-center pt-14 pb-6">
          <Button className="w-[180px] bg-white hover:bg-white/90 text-black flex items-center justify-start gap-2 h-9 px-3 rounded-[20px]" size="default">
            <div className="bg-red-500 rounded-full p-0.5">
              <Plus className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-medium">Create Report</span>
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="grid gap-1 p-2">
            <SidebarNavigation onNavigate={() => setIsSidebarOpen(false)} />
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 bg-[#1A1A1A] text-white border-r border-[#2A2A2A] pb-[20px] w-[280px] sm:w-[320px]">
          <SheetHeader className="border-b border-[#2A2A2A] px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2" onClick={() => setIsSidebarOpen(false)}>
                <img src="/favicon.ico" alt="Logo" className="h-6" />
                <span className="text-lg font-semibold">AIP</span>
              </Link>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/01.png" alt="@davidibanga" />
                        <AvatarFallback>DI</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm leading-none">David Ibanga</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          david.ibanga@example.com
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </SheetHeader>
          <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>

          {/* Mobile Create Button */}
          <div className="flex justify-center pt-8 pb-6 px-4">
            <Button className="w-full bg-white hover:bg-white/90 text-black flex items-center justify-start gap-2 h-9 px-3 rounded-[20px]" size="default">
              <div className="bg-red-500 rounded-full p-0.5">
                <Plus className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-medium">Create Report</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <SidebarNavigation onNavigate={() => setIsSidebarOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen bg-[#F8F3F1] ">
        {/* Header */}
        <header className="sticky top-0 z-20 h-[60px] w-full border-b flex items-center">
          {/* Mobile Layout */}
          <div className="w-full h-full bg-[#1e3a8a] text-white md:hidden">
            <div className="h-full max-w-screen-2xl mx-auto grid grid-cols-[60px_1fr_120px] items-center">
              {/* Left Section */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="h-full w-[60px] rounded-none hover:bg-white/5 text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Center Section */}
              <div className="flex justify-center h-full">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="h-full w-[60px] rounded-none hover:bg-white/5 text-white"
                  aria-label="Toggle search"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>

              {/* Right Section */}
              <div className="flex items-center justify-end h-full">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative h-full w-[60px] rounded-none hover:bg-white/5 text-white"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-3.5 right-3.5 h-4 w-4 rounded-full bg-red-600 text-[10px] font-medium text-white flex items-center justify-center">
                    3
                  </span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-full w-[60px] rounded-none hover:bg-white/5 text-white"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/01.png" alt="@davidibanga" />
                        <AvatarFallback>DI</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm leading-none">David Ibanga</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          david.ibanga@example.com
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex w-full items-center justify-between bg-[#F8F3F1]/95 backdrop-blur supports-[backdrop-filter]:bg-[#F8F3F1]/80">
            <div className="flex items-center h-full">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden h-full px-4 rounded-none hover:bg-black/5"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 flex justify-center px-4">
              <div className="w-full max-w-md">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search" 
                    placeholder="Search..."
                    className="pl-8 w-full bg-white/80 dark:bg-[#1A1A1A]"
                  />
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center h-full">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-full px-4 rounded-none hover:bg-black/5"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-3.5 right-3 h-4 w-4 rounded-full bg-red-600 text-[10px] font-medium text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              <div className="h-full">
                <ThemeToggle />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-full px-4 rounded-none hover:bg-black/5 flex items-center gap-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" alt="@davidibanga" />
                      <AvatarFallback>DI</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm">David Ibanga</span>
                      <span className="text-xs text-muted-foreground">Admin</span>
                    </div>
                    <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none">David Ibanga</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        david.ibanga@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Mobile Search Expanded */}
        {isSearchOpen && (
          <>
            <div className="absolute top-[60px] left-0 right-0 bg-[#F8F3F1] border-b md:hidden z-20">
              <div className="max-w-screen-2xl mx-auto p-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 w-full bg-white/80 dark:bg-[#1A1A1A]"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <div 
              className="fixed inset-0 bg-black/20 z-10 md:hidden"
              onClick={() => setIsSearchOpen(false)}
              aria-hidden="true"
            />
          </>
        )}

        {/* Page Content */}
        <div className="flex-1 relative">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <div className="grid gap-4 sm:gap-6 md:gap-8">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Layout