import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { TaskScheduler } from '@/components/dashboard/TaskScheduler'
import { PerformanceGraph } from '@/components/dashboard/PerformanceGraph'

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Metrics */}
        <div className="mb-8">
          <DashboardMetrics />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Task Scheduler */}
          <div className="xl:col-span-2 space-y-8">
            <TaskScheduler />
          </div>

          {/* Right Column - Recent Activity */}
          <div className="space-y-8">
            <RecentActivity />
          </div>
        </div>

        {/* Performance Graph */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="p-6">
              <PerformanceGraph />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage;