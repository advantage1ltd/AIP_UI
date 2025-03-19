import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { RootState } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  UserX 
} from 'lucide-react'
import { UserDialog } from '@/components/administration/UserDialog'
import { addUser, updateUser, deleteUser } from '@/store/features/users/usersSlice'
import { CreateUserInput, UpdateUserInput } from '@/types/user'
import { useToast } from '@/hooks/use-toast'
import { UserStats } from "@/components/user-setup/UserStats"
import { UsersTable } from "@/components/user-setup/UsersTable"
import { DUMMY_USERS, User } from "@/data/users"

const UserSetup = () => {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [mode, setMode] = useState<'table' | 'new' | 'edit'>('table')
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Get users from Redux store
  const reduxUsers = useAppSelector((state: RootState) => state.users)

  const filteredUsers = reduxUsers.filter(user =>
    (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.department || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getPageTitle = () => {
    switch (mode) {
      case 'new':
        return 'Add New User'
      case 'edit':
        return `Edit User: ${selectedUser?.username}`
      default:
        return 'User Management'
    }
  }

  const handleCreateUser = (data: CreateUserInput) => {
    console.log('Creating user:', data);
    dispatch(addUser(data))
    setMode('table')
    toast({
      title: 'Success',
      description: 'New user has been created successfully.',
    })
  }

  const handleUpdateUser = (data: UpdateUserInput) => {
    console.log('Updating user:', data);
    dispatch(updateUser(data))
    setMode('table')
    setSelectedUser(undefined)
    toast({
      title: 'Success',
      description: 'User has been updated successfully.',
    })
  }

  const handleDeleteUser = () => {
    if (selectedUser) {
      console.log('Deleting user:', selectedUser.id);
      dispatch(deleteUser(selectedUser.id))
      setShowDeleteDialog(false)
      setSelectedUser(undefined)
      toast({
        title: 'Success',
        description: 'User has been deleted successfully.',
      })
    }
  }

  const handleNewUser = () => {
    console.log('Opening new user form');
    setMode('new')
    setSelectedUser(undefined)
  }

  const handleEditUser = (user: User) => {
    console.log('Opening edit form for user:', user);
    setMode('edit')
    setSelectedUser(user)
  }

  const handleCancel = () => {
    console.log('Cancelling form');
    setMode('table')
    setSelectedUser(undefined)
  }

  const openDeleteDialog = (user: User) => {
    console.log('Opening delete dialog for user:', user);
    setSelectedUser(user)
    setShowDeleteDialog(true)
  }

  const [localUsers, setLocalUsers] = useState<User[]>(DUMMY_USERS)

  const handleCreateLocalUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: `u${localUsers.length + 1}`,
      username: userData.username!,
      email: userData.email!,
      role: userData.role!,
      department: userData.department!,
      status: userData.status!,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    setLocalUsers(prev => [...prev, newUser])
    toast({
      title: "User created",
      description: `Successfully created user ${newUser.username}`,
    })
  }

  const handleUpdateLocalUser = (id: string, userData: Partial<User>) => {
    setLocalUsers(prev => prev.map(user => 
      user.id === id 
        ? { ...user, ...userData }
        : user
    ))
    toast({
      title: "User updated",
      description: `Successfully updated user ${userData.username}`,
    })
  }

  const handleDeleteLocalUser = (id: string) => {
    setLocalUsers(prev => prev.filter(user => user.id !== id))
    toast({
      title: "User deleted",
      description: "Successfully deleted user",
      variant: "destructive",
    })
  }

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-gradient-to-br from-indigo-100/80 via-purple-50/80 to-pink-100/80">
      <div className="container mx-auto px-2 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              {getPageTitle()}
            </h1>
            <p className="text-sm md:text-base text-gray-500">Manage your team members and their account permissions here</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="w-full overflow-hidden">
          <UserStats users={localUsers} />
        </div>

        {/* Users Table - Responsive Container */}
        <div className="w-full overflow-x-auto rounded-lg">
          <div className="min-w-[320px]">
            <UsersTable 
              users={localUsers}
              onCreateUser={handleCreateLocalUser}
              onUpdateUser={handleUpdateLocalUser}
              onDeleteUser={handleDeleteLocalUser}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserSetup
