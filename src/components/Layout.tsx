import { Outlet } from "react-router-dom"
import { Header } from "@/components/Header"
import { SidebarNavigation } from "@/components/dashboard/SidebarNavigation"
import { useTheme } from "@/components/theme-provider"

export function Layout() {
  const { theme } = useTheme();
  
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 shrink-0">
        <SidebarNavigation />
      </aside>
      <div className={`flex flex-col flex-1 overflow-hidden ${theme === "dark" ? "bg-[#121212]" : "bg-[#F5F1E8]"}`}>
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
} 