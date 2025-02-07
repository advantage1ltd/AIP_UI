import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
import { DialogContent } from "@/components/ui/dialog"
import { DialogHeader } from "@/components/ui/dialog"
import { DialogTitle } from "@/components/ui/dialog"
import { DialogDescription } from "@/components/ui/dialog"
import { DialogTrigger } from "@/components/ui/dialog"
import { ContactTable } from "@/components/contacts/ContactTable"
import { ContactForm } from "@/components/contacts/ContactForm"
import { ContactSearchBar } from "@/components/contacts/ContactSearchBar"
import { Contact } from "@/types/contacts"
import { toast } from "@/components/ui/use-toast"
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store/store'
import { addContact, updateContact, deleteContact } from '@/store/features/contactsSlice'
import { v4 as uuidv4 } from 'uuid'

export default function Contacts() {
  const dispatch = useDispatch()
  const contacts = useSelector((state: RootState) => state.contacts.contacts)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [isAddContactOpen, setIsAddContactOpen] = useState(false)

  const handleAddContact = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newContact: Contact = {
      id: uuidv4(),
      name: formData.get("name") as string,
      company: formData.get("company") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      notes: formData.get("notes") as string,
      industry: formData.get("industry") as string,
      region: formData.get("region") as string,
      services: JSON.parse(formData.get("services") as string) || []
    }

    dispatch(addContact(newContact))
    setIsAddContactOpen(false)
    toast({
      title: "Contact Added",
      description: "New contact has been successfully added.",
    })
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
  }

  const handleUpdateContact = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const updatedContact: Contact = {
      ...editingContact!,
      name: formData.get("name") as string,
      company: formData.get("company") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      notes: formData.get("notes") as string,
      industry: formData.get("industry") as string,
      region: formData.get("region") as string,
      services: JSON.parse(formData.get("services") as string) || []
    }

    dispatch(updateContact(updatedContact))
    setEditingContact(null)
    toast({
      title: "Contact Updated",
      description: "Contact has been successfully updated.",
    })
  }

  const handleDeleteContact = (contactId: string) => {
    dispatch(deleteContact(contactId))
    toast({
      title: "Contact Deleted",
      description: "Contact has been successfully deleted.",
    })
  }

  const handleAddFollowup = (contact: Contact) => {
    // Implement follow-up functionality
    toast({
      title: "Follow-up Added",
      description: `Follow-up scheduled for ${contact.name}.`,
    })
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-primary">
              Contacts
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your contacts and follow-ups
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
            onClick={() => setIsAddContactOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Contact
          </Button>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6 flex justify-center">
            <ContactSearchBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <ContactTable 
            contacts={filteredContacts}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            onAddFollowup={handleAddFollowup}
          />
        </Card>
      </div>

      {/* Add Contact Dialog */}
      <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              Add New Contact
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new contact.
            </DialogDescription>
          </DialogHeader>
          <ContactForm onSubmit={handleAddContact} />
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={!!editingContact} onOpenChange={(open) => !open && setEditingContact(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              Edit Contact
            </DialogTitle>
            <DialogDescription>
              Update the contact information below.
            </DialogDescription>
          </DialogHeader>
          {editingContact && (
            <ContactForm 
              onSubmit={handleUpdateContact}
              initialData={editingContact}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
