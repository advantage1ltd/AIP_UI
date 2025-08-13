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
  UserRole,
  CustomerUser,
  AdvantageOneUser,
  USER_COMPANIES,
} from '@/types/user';
import { useAvailableCustomers } from '@/hooks/useAvailableCustomers';
import { Users, Eye, EyeOff, Building2, Lock, FileText, Shield, Briefcase, ChevronRight, ChevronLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => void;
  onCancel: () => void;
}

const USER_ROLES: UserRole[] = [
  'AdvantageOneOfficer',
  'AdvantageOneHOOfficer',
  'Administrator',
  'CustomerSiteManager',
  'CustomerHOManager',
];

type FormState = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  pageAccessRole: UserRole;
  signature?: string;
  signatureCode?: string;
  jobTitle?: string;
  userCompany?: string;
  recordIsDeleted?: boolean;
} & (
  | { role: 'CustomerSiteManager' | 'CustomerHOManager' }
  | { role: 'AdvantageOneOfficer' | 'AdvantageOneHOOfficer' | 'Administrator'; assignedCustomerIds: number[] }
);

export const UserForm = ({ initialData, onSubmit, onCancel }: UserFormProps) => {
  const { availableCustomers } = useAvailableCustomers();
  
  const [formData, setFormData] = useState<FormState>(() => {
    const baseData = {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      username: initialData?.username || '',
      email: initialData?.email || '',
      password: '',
      role: initialData?.role || USER_ROLES[0],
      pageAccessRole: initialData?.pageAccessRole || USER_ROLES[0],
      signature: initialData?.signature || '',
      signatureCode: initialData?.signatureCode || '',
      jobTitle: initialData?.jobTitle || '',
      userCompany: initialData?.userCompany || '',
      recordIsDeleted: initialData?.recordIsDeleted || false,
    };

    if (initialData?.role === 'CustomerSiteManager' || initialData?.role === 'CustomerHOManager') {
      return {
        ...baseData,
        role: initialData.role,
      } as FormState;
    } else {
      return {
        ...baseData,
        role: (initialData?.role as 'AdvantageOneOfficer' | 'AdvantageOneHOOfficer' | 'Administrator') || 'AdvantageOneOfficer',
        assignedCustomerIds: (initialData && 'assignedCustomerIds' in initialData ? initialData.assignedCustomerIds || [] : []),
      } as FormState;
    }
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddCustomer = (customerId: number) => {
    if ('assignedCustomerIds' in formData && !formData.assignedCustomerIds.includes(customerId)) {
      setFormData({
        ...formData,
        assignedCustomerIds: [...formData.assignedCustomerIds, customerId],
      } as FormState);
    }
  };

  const handleRemoveCustomer = (customerId: number) => {
    if ('assignedCustomerIds' in formData) {
      setFormData({
        ...formData,
        assignedCustomerIds: formData.assignedCustomerIds.filter(id => id !== customerId),
      } as FormState);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'role') {
      const role = value as UserRole;
      const isCustomerRole = role === 'CustomerSiteManager' || role === 'CustomerHOManager';
      
      if (isCustomerRole) {
        setFormData({
          ...formData,
          role,
          pageAccessRole: role,
        } as FormState);
      } else {
        setFormData({
          ...formData,
          role,
          pageAccessRole: role,
          assignedCustomerIds: [],
        } as FormState);
      }
    } else if (name === 'userCompany') {
      setFormData(prev => ({ ...prev, userCompany: value }));
    }
  };

  const isCustomerRole = formData.role === 'CustomerSiteManager' || formData.role === 'CustomerHOManager';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { password, ...restData } = formData;
    
    if (initialData) {
      onSubmit({
        id: initialData.id,
        ...(password ? { password } : {}),
        ...restData,
      } as UpdateUserInput);
    } else {
      onSubmit(formData as CreateUserInput);
    }
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
            <Label htmlFor="password">
              Password {initialData && '(leave blank to keep unchanged)'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password || ''}
                onChange={handleInputChange}
                required={!initialData}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Information Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Role Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="role">User Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleSelectChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.role === 'AdvantageOneOfficer' ? (
            <div className="md:col-span-2">
              <Label>Customer Assignments</Label>
              <div className="grid grid-cols-5 gap-4 mt-2">
                {/* Available Customers List */}
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Select customers to add to the list on the right</Label>
                  <div className="border rounded-md p-2 h-48 overflow-y-auto bg-gray-50">
                    {availableCustomers
                      .filter(customer => !('assignedCustomerIds' in formData) || !formData.assignedCustomerIds.includes(customer.id))
                      .map((customer) => (
                        <div
                          key={customer.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer rounded text-sm"
                          onClick={() => handleAddCustomer(customer.id)}
                        >
                          {customer.name}
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex flex-col justify-center items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="p-2 h-8 w-8"
                    disabled={true}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="p-2 h-8 w-8"
                    disabled={true}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>

                {/* Assigned Customers List */}
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Customers this officer works at</Label>
                  <div className="border rounded-md p-2 h-48 overflow-y-auto bg-gray-50">
                    {'assignedCustomerIds' in formData && formData.assignedCustomerIds.map((customerId) => {
                      const customer = availableCustomers.find(c => c.id === customerId);
                      return customer ? (
                        <div
                          key={customer.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer rounded text-sm"
                          onClick={() => handleRemoveCustomer(customer.id)}
                        >
                          {customer.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Additional Information Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              value={formData.jobTitle || ''}
              onChange={handleInputChange}
            />
          </div>
          {isCustomerRole && (
            <div>
              <Label htmlFor="userCompany">User Company</Label>
              <Select
                value={formData.userCompany || ''}
                onValueChange={(value) => handleSelectChange('userCompany', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {USER_COMPANIES.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className={isCustomerRole ? "" : "md:col-start-1"}>
            <Label htmlFor="signature">Signature</Label>
            <Input
              id="signature"
              name="signature"
              value={formData.signature || ''}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="signatureCode">Signature Code</Label>
            <Input
              id="signatureCode"
              name="signatureCode"
              value={formData.signatureCode || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recordIsDeleted"
                checked={formData.recordIsDeleted || false}
                onCheckedChange={(checked) => handleCheckboxChange('recordIsDeleted', !!checked)}
              />
              <Label htmlFor="recordIsDeleted">Record is Deleted</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
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