import { Outlet } from "react-router-dom"
import { Header } from "@/components/Header"
import { SidebarNavigation } from "@/components/dashboard/SidebarNavigation"
import { useTheme } from "@/components/theme-provider"
import { DebugPanel } from './common/DebugPanel'

export function Layout() {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <SidebarNavigation />
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
      {process.env.NODE_ENV === 'development' && <DebugPanel />}
    </div>
  )
} 