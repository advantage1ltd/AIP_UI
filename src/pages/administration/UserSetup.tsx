import React, { useState, useMemo } from 'react'
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
import { addUser, updateUser, deleteUser } from '@/store/features/users/usersSlice'
import { CreateUserInput, UpdateUserInput, User } from '@/types/user'
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

  // Get users from Redux store
  const users = useAppSelector((state: RootState) => state.users)

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
      const email = user.email.toLowerCase()
      const company = user.userCompany.toLowerCase()

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

  const handleCreateUser = (data: CreateUserInput) => {
    dispatch(addUser(data))
    setShowUserDialog(false)
    toast({
      title: 'Success',
      description: 'New user has been created successfully.',
    })
  }

  const handleUpdateUser = (data: UpdateUserInput) => {
    dispatch(updateUser(data))
    setShowUserDialog(false)
    setSelectedUser(undefined)
    toast({
      title: 'Success',
      description: 'User has been updated successfully.',
    })
  }

  const handleDeleteUser = () => {
    if (selectedUser) {
      dispatch(deleteUser(selectedUser.id))
      setShowDeleteDialog(false)
      setSelectedUser(undefined)
      toast({
        title: 'Success',
        description: 'User has been deleted successfully.',
      })
    }
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Administrator':
        return 'bg-red-100 text-red-800'
      case 'Advantage One HO Manager':
        return 'bg-purple-100 text-purple-800'
      case 'Advantage One HO Editor':
        return 'bg-blue-100 text-blue-800'
      case 'Advantage One Officer':
        return 'bg-green-100 text-green-800'
      case 'Customer - Site Manager':
        return 'bg-orange-100 text-orange-800'
      case 'Customer - Head Office Manager':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Administrator':
        return <Shield className="h-4 w-4 text-red-600" />
      case 'Advantage One HO Manager':
        return <UserCheck className="h-4 w-4 text-purple-600" />
      case 'Advantage One HO Editor':
        return <Pencil className="h-4 w-4 text-blue-600" />
      case 'Advantage One Officer':
        return <Users className="h-4 w-4 text-green-600" />
      case 'Customer - Site Manager':
      case 'Customer - Head Office Manager':
        return <Building2 className="h-4 w-4 text-orange-600" />
      default:
        return <UserX className="h-4 w-4 text-gray-600" />
    }
  }

  // Stats
  const totalUsers = filteredUsers.length
  const activeStatusList = [
    'advantage one officer',
    'advantage one ho manager',
    'advantage one ho editor',
    'customer - site manager',
    'customer - head office manager',
    'administrator',
  ]
  const activeUsers = filteredUsers.filter(u => activeStatusList.includes(u.status.toLowerCase())).length
  const adminUsers = filteredUsers.filter(u => u.status.toLowerCase() === 'administrator').length
  const adminPercent = totalUsers > 0 ? ((adminUsers / totalUsers) * 100).toFixed(1) : '0.0'
  const officerUsers = filteredUsers.filter(u => u.status.toLowerCase() === 'advantage one officer').length

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
                    <Badge className={`${getStatusColor(user.status)} flex items-center gap-1.5`}>
                      {getStatusIcon(user.status)}
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.officerType}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-5 w-5 text-gray-500" />
                      <span className="font-medium text-base">{user.assignedCustomers?.length || 0}</span>
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
                      <Building2 className="h-5 w-5 text-primary" />
                      Role & Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Status</div>
                      <div className="font-medium text-base">{viewUser.status}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Officer Type</div>
                      <div className="font-medium text-base">{viewUser.officerType || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">User Company</div>
                      <div className="font-medium text-base">{viewUser.userCompany || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Job Title</div>
                      <div className="font-medium text-base">{viewUser.jobTitle || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Signature</div>
                      <div className="font-medium text-base">{viewUser.signature || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Signature Code</div>
                      <div className="font-medium text-base">{viewUser.signatureCode || '-'}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Assignment */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      Customer Assignment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {viewUser.assignedCustomers && viewUser.assignedCustomers.length > 0 ? (
                        viewUser.assignedCustomers.map((c) => (
                          <span key={c.id} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {c.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No customers assigned</span>
                      )}
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
