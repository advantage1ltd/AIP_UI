import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DualListBox } from './DualListBox';
import {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserStatus,
  OfficerType,
  Customer,
  AVAILABLE_CUSTOMERS,
} from '@/types/user';
import { Users, Eye, EyeOff, Building2, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => void;
  onCancel: () => void;
}

const USER_STATUS_OPTIONS: UserStatus[] = [
  'Advantage One Officer',
  'Advantage one HO Editor',
  'Advantage One HO Manager',
  'Administrator',
  'Customer - Site Manager',
  'Customer - Head Office Manager',
];

const OFFICER_TYPE_OPTIONS: OfficerType[] = [
  'Retail Officer',
  'Static Officer',
  'Both',
];

const CUSTOMER_COMPANIES = [
  'Central England COOP',
  'Midcounties COOP',
  'Heart Of England COOP',
  'Eastbrook Tewksbury'
] as const;

type CustomerCompany = typeof CUSTOMER_COMPANIES[number];

export const UserForm = ({ initialData, onSubmit, onCancel }: UserFormProps) => {
  const [formData, setFormData] = useState<Partial<User>>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    username: initialData?.username || '',
    email: initialData?.email || '',
    password: '',
    status: initialData?.status || USER_STATUS_OPTIONS[0],
    signature: initialData?.signature || '',
    signatureCode: initialData?.signatureCode || '',
    jobTitle: initialData?.jobTitle || '',
    userCompany: initialData?.userCompany || CUSTOMER_COMPANIES[0],
    officerType: initialData?.officerType || OFFICER_TYPE_OPTIONS[0],
    assignedCustomers: initialData?.assignedCustomers || [],
  });

  const [showPassword, setShowPassword] = useState(false);

  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>(() => 
    AVAILABLE_CUSTOMERS.filter(
      customer => !formData.assignedCustomers?.some(
        assigned => assigned.id === customer.id
      )
    )
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: UserStatus | OfficerType | CustomerCompany | string) => {
    if (name === 'status') {
      const updates: Partial<User> = { status: value as UserStatus };
      
      // Clear assigned customers when switching to a non-officer role
      if (value !== 'Advantage One Officer') {
        updates.assignedCustomers = [];
      }
      
      // Clear company when switching to a non-customer role
      if (!isCustomerRole(value)) {
        updates.userCompany = '';
      }

      setFormData(prev => ({ ...prev, ...updates }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddCustomer = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      assignedCustomers: [...(prev.assignedCustomers || []), customer],
    }));
    setAvailableCustomers(prev => prev.filter(c => c.id !== customer.id));
  };

  const handleRemoveCustomer = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      assignedCustomers: prev.assignedCustomers?.filter(c => c.id !== customer.id) || [],
    }));
    setAvailableCustomers(prev => [...prev, customer]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      onSubmit({
        id: initialData.id,
        ...formData,
      } as UpdateUserInput);
    } else {
      onSubmit(formData as CreateUserInput);
    }
  };

  const isAdvantageOfficer = formData.status === 'Advantage One Officer';
  
  const isCustomerRole = (status: string) => {
    return status === 'Customer - Site Manager' || 
           status === 'Customer - Head Office Manager';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="relative">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                required={!initialData}
                placeholder={initialData ? "Leave blank to keep current password" : "Enter password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
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
            <Label htmlFor="status">User Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {USER_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="signature">Signature</Label>
            <Input
              id="signature"
              name="signature"
              value={formData.signature}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="signatureCode">Signature Code</Label>
            <Input
              id="signatureCode"
              name="signatureCode"
              value={formData.signatureCode}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              required
            />
          </div>
          {isCustomerRole(formData.status) && (
            <div>
              <Label htmlFor="userCompany">User Company</Label>
              <Select
                value={formData.userCompany}
                onValueChange={(value) => handleSelectChange('userCompany', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_COMPANIES.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="officerType">Officer Type</Label>
            <Select
              value={formData.officerType}
              onValueChange={(value) => handleSelectChange('officerType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select officer type" />
              </SelectTrigger>
              <SelectContent>
                {OFFICER_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customer Assignment - Only show for Advantage One Officers */}
      {isAdvantageOfficer && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Customer Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <DualListBox
                available={availableCustomers}
                selected={formData.assignedCustomers || []}
                onAdd={handleAddCustomer}
                onRemove={handleRemoveCustomer}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} User
        </Button>
      </div>
    </form>
  );
}; 