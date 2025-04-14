import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Eye, EyeOff, Pencil, Trash2, Link as LinkIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
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
import { Input } from '@/components/ui/input'

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
    password: 'Password123!', // Using a visible fake password for demo
    notes: ''
  },
  {
    id: '2',
    title: 'Server Admin Password',
    userName: 'Administrator',
    password: 'AdminPasswordSecure',
  },
  {
    id: '3',
    title: 'Tawk.to',
    userName: 'Training.Academy@adv...',
    password: 'TawkPasswordExample',
    url: 'https://tawk.to'
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
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        
        {/* Combined Header Card */}
        <Card className="shadow-sm border border-border/40">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-primary">Password Register</CardTitle>
                <CardDescription className="mt-1 text-xs sm:text-sm">Securely store and manage passwords</CardDescription>
              </div>
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="w-full sm:w-auto h-9 text-xs sm:text-sm"
              >
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="sm:hidden">Add New</span>
                <span className="hidden sm:inline">Add New Password</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title or username..."
                className="w-full pl-10 pr-4 h-9 text-xs sm:text-sm rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card-based layout for mobile, table for larger screens */}
        <div className="block sm:hidden space-y-2">
          {paginatedPasswords.length > 0 ? (
            paginatedPasswords.map((password) => (
              <Card key={password.id} className="overflow-hidden shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-0">
                  {/* Header with Title */}
                  <div className="flex justify-between items-center p-3 bg-slate-50 border-b">
                    <h3 className="font-medium text-sm">{password.title}</h3>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditForm(password)}
                        className="h-7 w-7 rounded-full p-0 text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(password)}
                        className="h-7 w-7 rounded-full p-0 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Password Details */}
                  <div className="divide-y divide-slate-100">
                    {/* Username Row */}
                    <div className="flex items-center p-3">
                      <div className="w-1/3 text-xs text-slate-500">Username</div>
                      <div className="w-2/3 text-xs font-medium truncate">{password.userName}</div>
                    </div>
                    
                    {/* Password Row */}
                    <div className="flex items-center p-3">
                      <div className="w-1/3 text-xs text-slate-500">Password</div>
                      <div className="w-2/3 flex items-center gap-2">
                        <span className="text-xs font-medium font-mono truncate">
                          {visiblePasswords.includes(password.id) ? password.password : '•'.repeat(8)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(password.id)}
                          className="h-6 w-6 rounded-full p-0 text-slate-400"
                        >
                          {visiblePasswords.includes(password.id) 
                            ? <EyeOff className="h-3 w-3" /> 
                            : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    
                    {/* URL Row - if present */}
                    {password.url && (
                      <div className="flex items-center p-3">
                        <div className="w-1/3 text-xs text-slate-500">URL</div>
                        <div className="w-2/3">
                          <a 
                            href={password.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <LinkIcon className="h-3 w-3" />
                            <span className="truncate">Open Link</span>
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {/* Notes Row - if present */}
                    {password.notes && (
                      <div className="p-3">
                        <div className="text-xs text-slate-500 mb-1">Notes</div>
                        <div className="text-xs">{password.notes}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 px-4 bg-white rounded-lg border border-border/40 shadow-sm">
              <p className="text-sm text-slate-500">No passwords found matching your search.</p>
            </div>
          )}
          
          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <div className="py-3 flex flex-col items-center gap-2">
              <div className="text-xs text-slate-500">
                Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredPasswords.length)} of {filteredPasswords.length}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {[
                  ...currentPage > 2 ? [1] : [],
                  ...currentPage > 3 ? [-1] : [],
                  ...Array.from(
                    { length: Math.min(3, totalPages) },
                    (_, i) => Math.min(Math.max(currentPage - 1 + i, 1 + (currentPage > 2 ? 1 : 0) + (currentPage > 3 ? 1 : 0)), totalPages - (currentPage < totalPages - 2 ? 1 : 0) - (currentPage < totalPages - 3 ? 1 : 0))
                  ),
                  ...currentPage < totalPages - 2 ? [-2] : [],
                  ...currentPage < totalPages - 1 ? [totalPages] : []
                ].map((page, i) => 
                  page < 0 ? (
                    <span key={`ellipsis-${i}`} className="h-7 w-7 flex items-center justify-center text-xs text-slate-400">...</span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`h-7 w-7 p-0 ${currentPage === page ? 'bg-primary text-primary-foreground' : ''}`}
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Table Card - Only visible on larger screens */}
        <Card className="hidden sm:block shadow-sm overflow-hidden border border-border/40">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">User Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Password</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">URL</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPasswords.length > 0 ? (
                  paginatedPasswords.map((password) => (
                    <tr key={password.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{password.title}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-slate-500">{password.userName}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500 font-mono">
                            {visiblePasswords.includes(password.id) ? password.password : '•'.repeat(8)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePasswordVisibility(password.id)}
                            className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                          >
                            {visiblePasswords.includes(password.id) 
                              ? <EyeOff className="h-4 w-4" />
                              : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {password.url && (
                          <a 
                            href={password.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            title={password.url}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          >
                            <LinkIcon className="h-3.5 w-3.5" />
                            <span className="text-xs">Link</span>
                          </a>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3">
                        <div className="text-xs text-slate-500 max-w-xs truncate" title={password.notes}>{password.notes}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            onClick={() => openEditForm(password)}
                            className="bg-blue-50 hover:bg-blue-100 border-blue-200 h-8 w-8 sm:w-[70px] flex items-center justify-center gap-1"
                          >
                            <Pencil className="h-4 w-4 text-blue-600" strokeWidth={2} />
                            <span className="hidden sm:inline text-xs text-blue-600">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => openDeleteDialog(password)}
                            className="bg-red-50 hover:bg-red-100 border-red-200 h-8 w-8 sm:w-[70px] flex items-center justify-center gap-1"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" strokeWidth={2} />
                            <span className="hidden sm:inline text-xs text-red-600">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-sm text-slate-500">
                      No passwords found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Desktop Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-slate-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredPasswords.length)} of {filteredPasswords.length}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 p-0 ${currentPage === page ? 'bg-primary text-primary-foreground' : ''}`}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Keep existing Add/Edit Form and Delete Dialog */} 
      <PasswordForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedPassword(null)
        }}
        onSubmit={selectedPassword ? handleEditPassword : handleAddPassword}
        initialData={selectedPassword || undefined}
      />

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
            <AlertDialogAction onClick={handleDeletePassword} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PasswordRegisterPage
