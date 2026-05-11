/**
 * User administration list and UserForm dialogs.
 * Flow: Redux paginated fetch → search and role filter → UserDialog create/update → refetch and confirm delete.
 */
import React, { useState, useMemo, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { RootState } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Users, 
  UserCheck, 
  Shield, 
  UserX,
  Search,
  UserPlus,
  Building2,
  Eye,
  Settings,
  Lock,
  KeyRound,
  UserCog,
  Clock,
  FileText
} from 'lucide-react'
import { UserDialog } from '@/components/administration/UserDialog'
import { fetchUsers, createUser, updateUserAsync, deleteUserAsync } from '@/store/features/users/usersSlice'
import { CreateUserInput, UpdateUserInput, User, UserRole } from '@/types/user'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { userService } from '@/services/userService'
import { useAvailableCustomers, findCustomerById } from '@/hooks/useAvailableCustomers'
import { harmonizeRole, roleDisplayName } from '@/utils/roles'

const UserSetup = () => {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'name' | 'email' | 'customer'>('all')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [viewUser, setViewUser] = useState<User | undefined>()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const { availableCustomers } = useAvailableCustomers()
  
  // Create a mapping of customerId to customer name for quick lookup
  const customerNameMap = useMemo(() => {
    const map = new Map<number, string>()
    availableCustomers.forEach(customer => {
      map.set(customer.id, customer.name)
    })
    return map
  }, [availableCustomers])

  const { users, pagination, loading, error } = useAppSelector((state: RootState) => state.users)

  // Server-backed pagination and search through the users Redux slice.
  useEffect(() => {
    dispatch(fetchUsers({
      page: currentPage,
      pageSize,
      searchTerm: searchQuery || undefined
    }))
  }, [dispatch, currentPage, pageSize, searchQuery])

  // Use users directly since backend handles filtering and pagination
  const displayUsers = users

  // Pagination calculations (backend-driven pagination)
  const totalUsers = pagination.totalCount
  const totalPages = Math.max(1, pagination.totalPages || 1)
  const startIndex = totalUsers === 0 ? 0 : (currentPage - 1) * pageSize
  const endIndex = startIndex + users.length

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Keep page in range when total pages change after filtering/deleting.
  useEffect(() => {
    setCurrentPage((prevPage) => Math.min(Math.max(1, prevPage), totalPages))
  }, [totalPages])

  // Dialog mutations close the form and refetch the current page slice.
  const handleCreateUser = async (data: CreateUserInput) => {
    console.log('🔄 [UserSetup] Creating user started', { data })
    
    try {
      const result = await dispatch(createUser(data)).unwrap()
      console.log('✅ [UserSetup] User created successfully', { result })
      
      setShowUserDialog(false)
      await dispatch(fetchUsers({
        page: currentPage,
        pageSize,
        searchTerm: searchQuery || undefined
      }))
      toast({
        title: 'Success',
        description: 'New user has been created successfully.',
      })
    } catch (error) {
      console.error('❌ [UserSetup] User creation failed:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateUser = async (data: UpdateUserInput) => {
    console.log('🔄 [UserSetup] handleUpdateUser called with:', {
      id: data.id,
      customerId: (data as any).customerId,
      customerIdType: typeof (data as any).customerId,
      role: (data as any).role,
      fullData: data
    })
    
    try {
      console.log('🔄 [UserSetup] Dispatching updateUserAsync...')
      const result = await dispatch(updateUserAsync(data)).unwrap()
      console.log('✅ [UserSetup] updateUserAsync completed:', {
        id: result.id,
        customerId: 'customerId' in result ? result.customerId : undefined,
        customerName: (result as any).customerName,
        role: result.role,
        fullResult: result
      })
      
      // Refetch users to ensure we have the latest data including customerName
      console.log('🔄 [UserSetup] Refetching users list...')
      const refetchResult = await dispatch(fetchUsers({
        page: currentPage,
        pageSize,
        searchTerm: searchQuery || undefined
      })).unwrap()
      console.log('✅ [UserSetup] Users list refetched:', {
        count: refetchResult.data.length,
        updatedUser: refetchResult.data.find((u: any) => u.id === data.id)
      })
      
      setShowUserDialog(false)
      setSelectedUser(undefined)
      toast({
        title: 'Success',
        description: 'User has been updated successfully.',
      })
    } catch (error) {
      console.error('❌ [UserSetup] User update failed:', {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        dataThatFailed: data
      })
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteUser = async () => {
    if (selectedUser) {
      try {
        await dispatch(deleteUserAsync(selectedUser.id)).unwrap()
        await dispatch(fetchUsers({
          page: currentPage,
          pageSize,
          searchTerm: searchQuery || undefined
        }))
        setShowDeleteDialog(false)
        setSelectedUser(undefined)
        toast({
          title: 'Success',
          description: 'User has been deleted successfully.',
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete user',
          variant: 'destructive',
        })
      }
    }
  }

  // Show error toast if API request fails
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
    }
  }, [error, toast])

  const openEditDialog = async (user: User) => {
    try {
      const detail = await userService.getUserById(user.id)

      const role = harmonizeRole(((detail as any).role ?? (detail as any).Role) as string) as UserRole
      
      const base = {
        id: (detail as any).id ?? (detail as any).Id,
        username: (detail as any).username ?? (detail as any).Username,
        firstName: (detail as any).firstName ?? (detail as any).FirstName ?? '',
        lastName: (detail as any).lastName ?? (detail as any).LastName ?? '',
        email: (detail as any).email ?? (detail as any).Email,
        role,
        pageAccessRole: harmonizeRole(((detail as any).pageAccessRole ?? (detail as any).PageAccessRole ?? role) as string) as UserRole,
        signature: (detail as any).signature ?? (detail as any).Signature,
        signatureCode: (detail as any).signatureCode ?? (detail as any).SignatureCode,
        jobTitle: (detail as any).jobTitle ?? (detail as any).JobTitle,
        customerId: (detail as any).customerId ?? (detail as any).CustomerId,
        recordIsDeleted: (detail as any).recordIsDeleted ?? (detail as any).RecordIsDeleted ?? false,
        createdAt: (detail as any).createdAt ?? (detail as any).CreatedAt ?? new Date().toISOString(),
        updatedAt: (detail as any).updatedAt ?? (detail as any).UpdatedAt ?? new Date().toISOString(),
        employeeId: (detail as any).employeeId ?? (detail as any).EmployeeId,
        employeeName: (detail as any).employeeName ?? (detail as any).EmployeeName,
      }

      let normalized: User
      if (role === 'customer') {
        // Properly handle customerId - preserve the value from backend
        const rawCustomerId = (detail as any).customerId ?? (detail as any).CustomerId ?? base.customerId
        const customerId = rawCustomerId != null && rawCustomerId !== undefined && rawCustomerId !== '' 
          ? Number(rawCustomerId) 
          : undefined
        // Only set customerId if it's a valid positive number
        normalized = { 
          ...(base as any), 
          role, 
          customerId: customerId != null && !isNaN(customerId) && customerId > 0 ? customerId : undefined
        } as User
      } else {
        const assignedCustomerIds = ((detail as any).assignedCustomerIds ?? (detail as any).AssignedCustomerIds ?? []).map((id: any) => Number(id))
        normalized = { ...(base as any), role, assignedCustomerIds } as User
      }

      setSelectedUser(normalized)
      setShowUserDialog(true)
    } catch (err) {
      console.error('Failed to load user details for edit', err)
    setSelectedUser(user)
    setShowUserDialog(true)
      toast({
        title: 'Warning',
        description: 'Could not load full user details. Some fields may be missing.',
      })
    }
  }

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setShowDeleteDialog(true)
  }

  const handleViewUser = (user: User) => {
    setViewUser(user)
  }

  const handleCloseView = () => setViewUser(undefined)

  // Helper to format role for display (PascalCase)
  const formatRoleForDisplay = (role: UserRole): string => roleDisplayName(role)

  const getStatusColor = (role: UserRole) => {
    switch (role) {
      case 'administrator':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-purple-100 text-purple-800'
      case 'securityofficer':
        return 'bg-green-100 text-green-800'
      case 'customer':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getStatusIcon = (role: UserRole) => {
    switch (role) {
      case 'administrator':
        return <Shield className="h-4 w-4 text-red-600" />
      case 'manager':
        return <UserCheck className="h-4 w-4 text-purple-600" />
      case 'securityofficer':
        return <Users className="h-4 w-4 text-green-600" />
      case 'customer':
        return <Building2 className="h-4 w-4 text-orange-600" />
      default:
        return <UserX className="h-4 w-4 text-gray-600 dark:text-gray-300" />
    }
  }

  // Stats (using all filtered users, not paginated)
  const totalFilteredUsers = displayUsers.length
  const activeStatusList: UserRole[] = [
    'administrator',
    'manager',
    'securityofficer',
    'customer'
  ]
  const activeUsers = displayUsers.filter(u => activeStatusList.includes(u.role)).length
  const adminUsers = displayUsers.filter(u => u.role === 'administrator').length
  const adminPercent = totalFilteredUsers > 0 ? ((adminUsers / totalFilteredUsers) * 100).toFixed(1) : '0.0'
  const officerUsers = displayUsers.filter(u => u.role === 'securityofficer').length

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-gradient-to-br from-slate-50 via-background to-indigo-50/20 dark:from-slate-950 dark:to-indigo-950/20">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 lg:py-8 space-y-3 sm:space-y-4 md:space-y-6">
        {/* Header Section */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/85 flex flex-col lg:flex-row lg:items-center justify-between gap-2 sm:gap-3 md:gap-4">
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              User Management
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Manage your team members and their account permissions here
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2 sm:gap-2">
                <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-full sm:w-[250px] h-8 sm:h-9 text-xs sm:text-sm"
                />
              </div>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-full sm:w-[120px] h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            </div>
            <Button
              onClick={() => setShowUserDialog(true)}
              className="inline-flex h-9 shrink-0 gap-2 whitespace-nowrap px-4 sm:h-10 sm:px-5 text-sm sm:text-base w-full sm:w-auto sm:self-center"
            >
              <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="w-full mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-6 w-full">
            {/* Total Users */}
            <div className="rounded-xl w-full overflow-hidden shadow bg-gradient-to-br from-blue-500 to-blue-700 flex items-stretch min-h-[80px] sm:min-h-[100px]">
              <div className="flex-1 flex flex-col justify-center px-3  sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
                <span className="text-white text-xs sm:text-sm md:text-base font-medium mb-1 leading-tight">Total Users</span>
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-none">{totalFilteredUsers}</span>
                <span className="text-white/80 text-xs mt-1 leading-tight">{activeUsers} active</span>
              </div>
              <div className="flex items-center  pr-2 sm:pr-3 md:pr-6">
                <span className="bg-white/20 rounded-full p-1.5 sm:p-2 md:p-3 flex items-center justify-center">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-white/80" />
                </span>
              </div>
            </div>
            {/* Admin Users */}
            <div className="rounded-xl overflow-hidden shadow bg-gradient-to-br from-purple-500 to-purple-700 flex items-stretch min-h-[80px] sm:min-h-[100px]">
              <div className="flex-1 flex flex-col justify-center px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
                <span className="text-white text-xs sm:text-sm md:text-base font-medium mb-1 leading-tight">Admin Users</span>
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-none">{adminUsers}</span>
                <span className="text-white/80 text-xs mt-1 leading-tight">{adminPercent}% of total</span>
              </div>
              <div className="flex items-center pr-2 sm:pr-3 md:pr-6">
                <span className="bg-white/20 rounded-full p-1.5 sm:p-2 md:p-3 flex items-center justify-center">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-white/80" />
                </span>
              </div>
            </div>
            {/* Advantage One Officer Users */}
            <div className="rounded-xl overflow-hidden shadow bg-gradient-to-br from-green-500 to-green-700 flex items-stretch min-h-[80px] sm:min-h-[100px] sm:col-span-2 lg:col-span-1">
              <div className="flex-1 flex flex-col justify-center px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
                <span className="text-white text-xs sm:text-sm md:text-base font-medium mb-1 leading-tight">Advantage One Officer Users</span>
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-none">{officerUsers}</span>
                <span className="text-white/80 text-xs mt-1 leading-tight">Advantage One Officer</span>
              </div>
              <div className="flex items-center pr-2 sm:pr-3 md:pr-6">
                <span className="bg-white/20 rounded-full p-1.5 sm:p-2 md:p-3 flex items-center justify-center">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-white/80" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table / Mobile Cards */}
        <div className="rounded-2xl border border-border/70 bg-card/95 shadow-sm">
          <div className="space-y-2 p-2 sm:hidden">
            {displayUsers.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <UserX className="h-6 w-6" />
                  <div className="text-sm">No users found</div>
                  <div className="text-xs">Try adjusting your search or filter</div>
                </div>
              </div>
            ) : (
              displayUsers.map((user) => (
                <div key={`mobile-${user.id}`} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {user.firstName || 'Unknown'} {user.lastName || ''}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                    <Badge className={`${getStatusColor(user.role)} flex items-center gap-1 text-[10px]`}>
                      <span className="truncate">{formatRoleForDisplay(user.role)}</span>
                    </Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">Username</p>
                      <p className="truncate font-medium text-slate-700">{user.username}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">Job Title</p>
                      <p className="truncate font-medium text-slate-700">{user.jobTitle || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(user)}
                      className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-blue-200"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(user)}
                      className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewUser(user)}
                      className="h-7 w-7 p-0 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="sr-only">View</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden min-w-full overflow-x-auto sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                  <TableHead className="text-xs sm:text-sm">Name</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Email</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Job Title</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Customer</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Role</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Assigned Customers</TableHead>
                  <TableHead className="w-[120px] sm:w-[160px] text-xs sm:text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayUsers.map((user) => (
                <TableRow key={user.id}>
                    <TableCell className="py-2 sm:py-3">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-xs sm:text-sm">
                        {(user.firstName?.[0] || 'U')}{(user.lastName?.[0] || '')}
                      </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-xs sm:text-sm truncate">{user.firstName || 'Unknown'} {user.lastName || ''}</div>
                          <div className="text-xs text-muted-foreground truncate">{user.username}</div>
                        </div>
                    </div>
                  </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{user.email}</TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                      <div className="text-xs sm:text-sm text-muted-foreground">
                      {user.jobTitle || 'N/A'}
                    </div>
                  </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                      <div className="text-xs sm:text-sm text-muted-foreground">
                      {'customerId' in user && user.customerId 
                        ? ((user as any).customerName || customerNameMap.get(user.customerId) || `Customer ID: ${user.customerId}`)
                        : 'N/A'}
                    </div>
                  </TableCell>
                    <TableCell className="py-2 sm:py-3">
                      <Badge className={`${getStatusColor(user.role)} flex items-center gap-1 sm:gap-1.5 text-xs`}>
                        <span className="hidden sm:inline">{getStatusIcon(user.role)}</span>
                        <span className="truncate">{formatRoleForDisplay(user.role)}</span>
                    </Badge>
                  </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell">{formatRoleForDisplay(user.role)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        <span className="font-medium text-xs sm:text-sm">
                        {'assignedCustomerIds' in user ? user.assignedCustomerIds?.length || 0 : 0}
                      </span>
                      {('assignedCustomerNames' in user && user.assignedCustomerNames && user.assignedCustomerNames.length > 0) && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={user.assignedCustomerNames.join(', ')}>
                          {user.assignedCustomerNames.join(', ')}
                        </div>
                      )}
                    </div>
                  </TableCell>
                    <TableCell className="py-2 sm:py-3">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)} className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-blue-50">
                          <Pencil className="h-3 w-3 sm:h-5 sm:w-5 text-blue-600" />
                      </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(user)} className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-red-50">
                          <Trash2 className="h-3 w-3 sm:h-5 sm:w-5 text-red-600" />
                      </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleViewUser(user)} className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-green-50">
                          <Eye className="h-3 w-3 sm:h-5 sm:w-5 text-green-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {totalFilteredUsers === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <UserX className="h-6 w-6 sm:h-8 sm:w-8" />
                        <div className="text-sm sm:text-base">No users found</div>
                        <div className="text-xs sm:text-sm">Try adjusting your search or filter</div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              {totalFilteredUsers === 0
                ? 'No users found'
                : `Showing ${startIndex + 1} to ${Math.min(endIndex, totalFilteredUsers)} of ${totalFilteredUsers} results`}
            </div>
            <Pagination>
              <PaginationContent className="flex-wrap justify-center sm:justify-end">
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1)
                      }
                    }}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const shouldShow = 
                    page === 1 || 
                    page === totalPages || 
                    Math.abs(page - currentPage) <= 1
                  
                  if (!shouldShow && page !== 2 && page !== totalPages - 1) {
                    if (page === 2 && currentPage > 4) {
                      return (
                        <PaginationItem key={`ellipsis-${page}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    if (page === totalPages - 1 && currentPage < totalPages - 3) {
                      return (
                        <PaginationItem key={`ellipsis-${page}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    return null
                  }
                  
                  return (
                    <PaginationItem key={page} className="hidden sm:inline-flex">
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(page)
                        }}
                        isActive={page === currentPage}
                        className="text-xs sm:text-sm"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                <PaginationItem className="sm:hidden">
                  <span className="px-2 text-xs text-gray-500 dark:text-gray-400">
                    {currentPage} / {totalPages}
                  </span>
                </PaginationItem>
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1)
                      }
                    }}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* User Dialog */}
        <UserDialog
          open={showUserDialog}
          onOpenChange={(open) => {
            setShowUserDialog(open)
            if (!open) {
              setSelectedUser(null)
            }
          }}
          user={selectedUser}
          onSubmit={(data) => {
            if ('id' in data) {
              handleUpdateUser(data as UpdateUserInput)
            } else {
              handleCreateUser(data as CreateUserInput)
            }
          }}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user
                and remove their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeleteUser}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View User Dialog */}
        <Dialog open={!!viewUser} onOpenChange={handleCloseView}>
          <DialogContent className="w-[calc(100%-1.5rem)] sm:w-auto max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>View User</DialogTitle>
              <DialogDescription>All user details (read-only)</DialogDescription>
            </DialogHeader>
            {viewUser && (
              <div className="space-y-6 mt-2">
                {/* Personal Information */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">First Name</div>
                      <div className="font-medium text-base">{viewUser.firstName || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Last Name</div>
                      <div className="font-medium text-base">{viewUser.lastName || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Username</div>
                      <div className="font-medium text-base">{viewUser.username}</div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Email</div>
                      <div className="font-medium text-base">{viewUser.email}</div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Job Title</div>
                      <div className="font-medium text-base">{viewUser.jobTitle || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Customer</div>
                      <div className="font-medium text-base">
                        {'customerId' in viewUser && viewUser.customerId 
                          ? ((viewUser as any).customerName || customerNameMap.get(viewUser.customerId) || `Customer ID: ${viewUser.customerId}`)
                          : 'N/A'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Role and Customer Information */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <UserCog className="h-5 w-5 text-primary" />
                      Role Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Role</div>
                      <div className="font-medium text-base">{formatRoleForDisplay(viewUser.role)}</div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Page Access Role</div>
                      <div className="font-medium text-base">{formatRoleForDisplay(viewUser.pageAccessRole)}</div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Created At</div>
                      <div className="font-medium text-base">{new Date(viewUser.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Last Updated</div>
                      <div className="font-medium text-base">{new Date(viewUser.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Signature and Additional Information */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Signature & Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Signature</div>
                      <div className="font-medium text-base">{viewUser.signature || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Signature Code</div>
                      <div className="font-medium text-base">{viewUser.signatureCode || 'N/A'}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Record Status</div>
                      <div className={`font-medium text-base flex items-center gap-2 ${viewUser.recordIsDeleted ? 'text-red-600' : 'text-green-600'}`}>
                        {viewUser.recordIsDeleted ? (
                          <>
                            <UserX className="h-4 w-4" />
                            Record is Deleted
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4" />
                            Record is Active
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default UserSetup
