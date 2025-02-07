import { Sidebar } from '../components/Sidebar/Sidebar'

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4">
        {children}
      </main>
    </div>
  )
} 