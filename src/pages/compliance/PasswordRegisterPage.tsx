import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Eye, EyeOff, Pencil, Trash2, Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { PasswordForm } from '@/components/compliance/PasswordForm'
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

interface Password {
  id: string
  title: string
  userName: string
  password: string
  url?: string
  notes?: string
}

const sampleData: Password[] = [
  {
    id: '1',
    title: 'Heaven',
    userName: 'heaven-lei.ebanks',
    password: '********',
    notes: ''
  },
  {
    id: '2',
    title: 'Server Admin Password',
    userName: 'Administrator',
    password: '********',
  },
  {
    id: '3',
    title: 'Tawk.to',
    userName: 'Training.Academy@adv...',
    password: '********',
  }
]

const PasswordRegisterPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [passwords, setPasswords] = useState<Password[]>(sampleData)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPassword, setSelectedPassword] = useState<Password | null>(null)
  const [visiblePasswords, setVisiblePasswords] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const handleAddPassword = (data: any) => {
    const newPassword: Password = {
      id: Date.now().toString(),
      ...data,
    }
    setPasswords([...passwords, newPassword])
    setIsFormOpen(false)
  }

  const handleEditPassword = (data: any) => {
    if (!selectedPassword) return
    
    const updatedPasswords = passwords.map(password => 
      password.id === selectedPassword.id 
        ? { ...password, ...data }
        : password
    )
    setPasswords(updatedPasswords)
    setIsFormOpen(false)
    setSelectedPassword(null)
  }

  const handleDeletePassword = () => {
    if (!selectedPassword) return
    
    const updatedPasswords = passwords.filter(password => password.id !== selectedPassword.id)
    setPasswords(updatedPasswords)
    setIsDeleteDialogOpen(false)
    setSelectedPassword(null)
  }

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => 
      prev.includes(id) 
        ? prev.filter(pId => pId !== id)
        : [...prev, id]
    )
  }

  const openEditForm = (password: Password) => {
    setSelectedPassword(password)
    setIsFormOpen(true)
  }

  const openDeleteDialog = (password: Password) => {
    setSelectedPassword(password)
    setIsDeleteDialogOpen(true)
  }

  const filteredPasswords = passwords.filter(password =>
    password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.userName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination calculations
  const totalPages = Math.ceil(filteredPasswords.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedPasswords = filteredPasswords.slice(startIndex, startIndex + pageSize)

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Password Register</h1>
            <p className="text-sm text-gray-500 mt-1">Securely store and manage passwords</p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <span className="hidden sm:inline">Add New Password</span>
            <span className="sm:hidden">Add New</span>
          </Button>
        </div>

        {/* Enhanced Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search passwords..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedPasswords.map((password) => (
                  <tr key={password.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{password.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{password.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {visiblePasswords.includes(password.id) ? password.password : '********'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(password.id)}
                          className="hover:bg-gray-100 rounded-full p-1"
                        >
                          {visiblePasswords.includes(password.id) 
                            ? <EyeOff className="h-4 w-4 text-gray-500" />
                            : <Eye className="h-4 w-4 text-gray-500" />}
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {password.url && (
                        <a 
                          href={password.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <LinkIcon className="h-4 w-4" />
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{password.notes}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditForm(password)}
                          className="hover:bg-gray-100 rounded-full p-1"
                        >
                          <Pencil className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(password)}
                          className="hover:bg-gray-100 rounded-full p-1"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredPasswords.length)} of {filteredPasswords.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 ${currentPage === page ? 'bg-blue-600 text-white' : ''}`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      <PasswordForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedPassword(null)
        }}
        onSubmit={selectedPassword ? handleEditPassword : handleAddPassword}
        initialData={selectedPassword || undefined}
      />

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this password record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePassword}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PasswordRegisterPage
