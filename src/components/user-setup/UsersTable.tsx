import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Pencil, Trash2, Search, Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { UserDialog } from "./UserDialog"
import { User } from "@/data/users"
import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"

interface UsersTableProps {
  users: User[]
  onCreateUser: (user: Partial<User>) => void
  onUpdateUser: (id: string, user: Partial<User>) => void
  onDeleteUser: (id: string) => void
}

export function UsersTable({ users, onCreateUser, onUpdateUser, onDeleteUser }: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [userToDelete, setUserToDelete] = useState<string | undefined>()
  const itemsPerPage = 10

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase()
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      user.department.toLowerCase().includes(searchLower) ||
      user.status.toLowerCase().includes(searchLower)
    )
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  const handleNewUser = () => {
    setSelectedUser(undefined)
    setIsDialogOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId)
  }

  const handleDialogSubmit = (data: Partial<User>) => {
    if (selectedUser) {
      onUpdateUser(selectedUser.id, data)
    } else {
      onCreateUser(data)
    }
    setIsDialogOpen(false)
  }

  const handleConfirmDelete = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete)
      setUserToDelete(undefined)
    }
  }

  // Function to determine which columns to hide on different screen sizes
  const getResponsiveClasses = (column: string) => {
    switch (column) {
      case 'email':
        return 'hidden md:table-cell'
      case 'department':
        return 'hidden lg:table-cell'
      case 'lastLogin':
        return 'hidden md:table-cell'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-2 md:space-y-4">
      {/* Custom Table Actions - With New Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-1 w-full">
          <div className="relative flex-1 w-full sm:w-[400px]">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
            <Input 
              placeholder="Search users..."
              className="pl-10 h-11 text-base bg-white border-2 border-gray-200 hover:border-gray-300 focus:border-[#324053] focus:ring-2 focus:ring-[#324053]/20 rounded-lg shadow-sm" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <div className="ml-2 flex-shrink-0 hidden md:block">
            <span className="inline-flex h-11 items-center px-3 py-1 text-sm bg-gray-100 rounded-lg">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <Button 
          onClick={handleNewUser} 
          style={{ backgroundColor: '#324053' }} 
          className="w-full sm:w-auto h-11 px-4 sm:px-6 hover:opacity-90 shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      <div className="rounded-lg border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead className={getResponsiveClasses('email')}>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className={getResponsiveClasses('department')}>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className={getResponsiveClasses('lastLogin')}>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id} className="text-sm">
                <TableCell className="font-medium py-2 md:py-4">{user.username}</TableCell>
                <TableCell className={getResponsiveClasses('email')}>{user.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'Admin' 
                      ? 'bg-purple-100 text-purple-700'
                      : user.role === 'Manager'
                      ? 'bg-blue-100 text-blue-700'
                      : user.role === 'Support'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell className={getResponsiveClasses('department')}>{user.department}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className={getResponsiveClasses('lastLogin')}>
                  {format(new Date(user.lastLogin), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell className="text-right">
                  <TooltipProvider>
                    <div className="flex justify-end gap-1 md:gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                            className="h-7 w-7 md:h-8 md:w-8 p-0 hover:bg-blue-50"
                          >
                            <Pencil className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit user</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(user.id)}
                            className="h-7 w-7 md:h-8 md:w-8 p-0 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete user</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
            {paginatedUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination - Always visible with page size info */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-2 sm:px-4 sm:py-4 border-t text-xs sm:text-sm">
          <div className="text-gray-500 mb-2 sm:mb-0">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of{" "}
            {filteredUsers.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 px-2 sm:h-9 sm:px-3"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <div className="text-gray-500 min-w-[80px] text-center">
              Page {currentPage} of {Math.max(totalPages, 1)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 px-2 sm:h-9 sm:px-3"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 sm:ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={selectedUser}
        onSubmit={handleDialogSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(undefined)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}