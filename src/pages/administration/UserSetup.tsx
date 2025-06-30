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
  Clock
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

const UserSetup = () => {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'name' | 'email' | 'company'>('all')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [viewUser, setViewUser] = useState<User | undefined>()

  // Get users and loading state from Redux store
  const { users, loading, error } = useAppSelector((state: RootState) => state.users)

  // Fetch users on mount
  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
      const email = user.email.toLowerCase()
      const company = ('companyId' in user ? user.companyId : '') || ''

      switch (filterType) {
        case 'name':
          return fullName.includes(query)
        case 'email':
          return email.includes(query)
        case 'company':
          return company.includes(query)
      default:
          return fullName.includes(query) || 
                 email.includes(query) || 
                 company.includes(query)
    }
    })
  }, [users, searchQuery, filterType])

  const handleCreateUser = async (data: CreateUserInput) => {
    try {
      await dispatch(createUser(data)).unwrap()
      setShowUserDialog(false)
      toast({
        title: 'Success',
        description: 'New user has been created successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateUser = async (data: UpdateUserInput) => {
    try {
      await dispatch(updateUserAsync(data)).unwrap()
      setShowUserDialog(false)
      setSelectedUser(undefined)
      toast({
        title: 'Success',
        description: 'User has been updated successfully.',
      })
    } catch (error) {
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

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setShowUserDialog(true)
  }

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setShowDeleteDialog(true)
  }

  const handleViewUser = (user: User) => {
    setViewUser(user)
  }

  const handleCloseView = () => setViewUser(undefined)

  const getStatusColor = (role: UserRole) => {
    switch (role) {
      case 'Administrator':
        return 'bg-red-100 text-red-800'
      case 'AdvantageOneHOOfficer':
        return 'bg-purple-100 text-purple-800'
      case 'AdvantageOneOfficer':
        return 'bg-green-100 text-green-800'
      case 'CustomerSiteManager':
        return 'bg-orange-100 text-orange-800'
      case 'CustomerHOManager':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (role: UserRole) => {
    switch (role) {
      case 'Administrator':
        return <Shield className="h-4 w-4 text-red-600" />
      case 'AdvantageOneHOOfficer':
        return <UserCheck className="h-4 w-4 text-purple-600" />
      case 'AdvantageOneOfficer':
        return <Users className="h-4 w-4 text-green-600" />
      case 'CustomerSiteManager':
      case 'CustomerHOManager':
        return <Building2 className="h-4 w-4 text-orange-600" />
      default:
        return <UserX className="h-4 w-4 text-gray-600" />
    }
  }

  // Stats
  const totalUsers = filteredUsers.length
  const activeStatusList = [
    'AdvantageOneOfficer',
    'AdvantageOneHOOfficer',
    'Administrator',
    'CustomerSiteManager',
    'CustomerHOManager'
  ]
  const activeUsers = filteredUsers.filter(u => activeStatusList.includes(u.role)).length
  const adminUsers = filteredUsers.filter(u => u.role === 'Administrator').length
  const adminPercent = totalUsers > 0 ? ((adminUsers / totalUsers) * 100).toFixed(1) : '0.0'
  const officerUsers = filteredUsers.filter(u => u.role === 'AdvantageOneOfficer').length

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-gradient-to-br from-indigo-100/80 via-purple-50/80 to-pink-100/80">
      <div className="container mx-auto px-2 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              User Management
            </h1>
            <p className="text-sm md:text-base text-gray-500">
              Manage your team members and their account permissions here
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 min-w-[240px]"
                />
              </div>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowUserDialog(true)} className="w-full md:w-auto">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Section - full width, modern cards */}
        <div className="w-full mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Total Users */}
            <div className="rounded-xl overflow-hidden shadow bg-gradient-to-br from-blue-500 to-blue-700 flex items-stretch">
              <div className="flex-1 flex flex-col justify-center px-6 py-6">
                <span className="text-white text-base font-medium mb-1">Total Users</span>
                <span className="text-3xl font-bold text-white">{totalUsers}</span>
                <span className="text-white/80 text-sm mt-1">{activeUsers} active</span>
              </div>
              <div className="flex items-center pr-6">
                <span className="bg-white/20 rounded-full p-3 flex items-center justify-center">
                  <Users className="h-7 w-7 text-white/80" />
                </span>
              </div>
            </div>
            {/* Admin Users */}
            <div className="rounded-xl overflow-hidden shadow bg-gradient-to-br from-purple-500 to-purple-700 flex items-stretch">
              <div className="flex-1 flex flex-col justify-center px-6 py-6">
                <span className="text-white text-base font-medium mb-1">Admin Users</span>
                <span className="text-3xl font-bold text-white">{adminUsers}</span>
                <span className="text-white/80 text-sm mt-1">{adminPercent}% of total</span>
              </div>
              <div className="flex items-center pr-6">
                <span className="bg-white/20 rounded-full p-3 flex items-center justify-center">
                  <Shield className="h-7 w-7 text-white/80" />
                </span>
              </div>
            </div>
            {/* Advantage One Officer Users */}
            <div className="rounded-xl overflow-hidden shadow bg-gradient-to-br from-green-500 to-green-700 flex items-stretch">
              <div className="flex-1 flex flex-col justify-center px-6 py-6">
                <span className="text-white text-base font-medium mb-1">Advantage One Officer Users</span>
                <span className="text-3xl font-bold text-white">{officerUsers}</span>
                <span className="text-white/80 text-sm mt-1">Advantage One Officer</span>
              </div>
              <div className="flex items-center pr-6">
                <span className="bg-white/20 rounded-full p-3 flex items-center justify-center">
                  <Users className="h-7 w-7 text-white/80" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-lg border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Officer Type</TableHead>
                <TableHead>Assigned Customers</TableHead>
                <TableHead className="w-[160px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500">{user.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(user.role)} flex items-center gap-1.5`}>
                      {getStatusIcon(user.role)}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-5 w-5 text-gray-500" />
                      <span className="font-medium text-base">
                        {'assignedCustomerIds' in user ? user.assignedCustomerIds?.length || 0 : 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)} className="h-8 w-8 p-0 hover:bg-blue-50">
                        <Pencil className="h-5 w-5 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(user)} className="h-8 w-8 p-0 hover:bg-red-50">
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleViewUser(user)} className="h-8 w-8 p-0 hover:bg-green-50">
                        <Eye className="h-5 w-5 text-green-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <UserX className="h-8 w-8" />
                      <div>No users found</div>
                      <div className="text-sm">Try adjusting your search or filter</div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* User Dialog */}
        <UserDialog
          open={showUserDialog}
          onOpenChange={setShowUserDialog}
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
          <DialogContent className="max-w-2xl">
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
                      <div className="text-xs text-gray-500 mb-1">First Name</div>
                      <div className="font-medium text-base">{viewUser.firstName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Last Name</div>
                      <div className="font-medium text-base">{viewUser.lastName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Username</div>
                      <div className="font-medium text-base">{viewUser.username}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Email</div>
                      <div className="font-medium text-base">{viewUser.email}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Role and Company Information */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <UserCog className="h-5 w-5 text-primary" />
                      Role Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Role</div>
                      <div className="font-medium text-base">{viewUser.role}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Page Access Role</div>
                      <div className="font-medium text-base">{viewUser.pageAccessRole}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Created At</div>
                      <div className="font-medium text-base">{new Date(viewUser.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Last Updated</div>
                      <div className="font-medium text-base">{new Date(viewUser.updatedAt).toLocaleDateString()}</div>
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
