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
} from '@/types/user';
import { useAvailableCustomers } from '@/hooks/useAvailableCustomers';
import { Users, Eye, EyeOff, Building2, Lock } from 'lucide-react';
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
} & (
  | { role: 'CustomerSiteManager' | 'CustomerHOManager'; customerId: string }
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
    };

    if (initialData?.role === 'CustomerSiteManager' || initialData?.role === 'CustomerHOManager') {
      return {
        ...baseData,
        role: initialData.role,
        customerId: (initialData && 'customerId' in initialData ? initialData.customerId.toString() : ''),
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
          customerId: '',
        } as FormState);
      } else {
        setFormData({
          ...formData,
          role,
          pageAccessRole: role,
          assignedCustomerIds: [],
        } as FormState);
      }
    } else if (name === 'customerId' && (formData.role === 'CustomerSiteManager' || formData.role === 'CustomerHOManager')) {
      setFormData({
        ...formData,
        customerId: value,
      } as FormState);
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
            <Label htmlFor="role">Role</Label>
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

          {isCustomerRole ? (
            <div>
              <Label htmlFor="customerId">Customer</Label>
              <Select
                value={'customerId' in formData ? formData.customerId : ''}
                onValueChange={(value) => handleSelectChange('customerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                                  {availableCustomers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.name}
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label>Assigned Customers</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if ('assignedCustomerIds' in formData) {
                    setFormData({
                      ...formData,
                      assignedCustomerIds: [...formData.assignedCustomerIds, parseInt(value)],
                    } as FormState);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add customer" />
                </SelectTrigger>
                <SelectContent>
                                  {availableCustomers
                  .filter(customer => !('assignedCustomerIds' in formData) || !formData.assignedCustomerIds.includes(customer.id))
                  .map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="mt-2 space-y-2">
              {'assignedCustomerIds' in formData && formData.assignedCustomerIds.map((customerId) => {
                const customer = availableCustomers.find(c => c.id === customerId);
                  return customer ? (
                    <div key={customer.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>{customer.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            assignedCustomerIds: formData.assignedCustomerIds.filter(id => id !== customer.id),
                          } as FormState);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
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