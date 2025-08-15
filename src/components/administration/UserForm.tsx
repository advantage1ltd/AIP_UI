import React, { useState, useMemo } from 'react';
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
  const { availableCustomers, isLoading } = useAvailableCustomers();
  
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

  // Convert availableCustomers to Customer objects for DualListBox
  const availableCustomersForDualList = useMemo(() => {
    return availableCustomers.map(customer => ({
      id: customer.id,
      name: customer.name,
      companyName: customer.name,
      companyNumber: '',
      vatNumber: '',
      status: 'active' as const,
      customerType: 'retail' as const,
      address: {
        building: '',
        street: '',
        village: '',
        town: '',
        county: '',
        postcode: ''
      },
      contact: {
        title: '',
        forename: '',
        surname: '',
        position: '',
        email: '',
        phone: ''
      },
      viewConfig: {
        id: '',
        customerId: customer.id,
        customerType: 'retail' as const,
        enabledPages: [],
        createdAt: '',
        updatedAt: ''
      },
      createdAt: '',
      updatedAt: ''
    }));
  }, [availableCustomers]);

  // Get selected customers for DualListBox
  const selectedCustomersForDualList = useMemo(() => {
    if (!('assignedCustomerIds' in formData)) return [];
    
    return formData.assignedCustomerIds
      .map(customerId => {
        const customer = availableCustomers.find(c => c.id === customerId);
        if (!customer) return null;
        
        return {
          id: customer.id,
          name: customer.name,
          companyName: customer.name,
          companyNumber: '',
          vatNumber: '',
          status: 'active' as const,
          customerType: 'retail' as const,
          address: {
            building: '',
            street: '',
            village: '',
            town: '',
            county: '',
            postcode: ''
          },
          contact: {
            title: '',
            forename: '',
            surname: '',
            position: '',
            email: '',
            phone: ''
          },
          viewConfig: {
            id: '',
            customerId: customer.id,
            customerType: 'retail' as const,
            enabledPages: [],
            createdAt: '',
            updatedAt: ''
          },
          createdAt: '',
          updatedAt: ''
        };
      })
      .filter(Boolean) as any[];
  }, [formData, availableCustomers]);

  // Get available customers (not yet selected) for DualListBox
  const availableCustomersNotSelected = useMemo(() => {
    if (!('assignedCustomerIds' in formData)) return availableCustomersForDualList;
    
    return availableCustomersForDualList.filter(
      customer => !formData.assignedCustomerIds.includes(customer.id)
    );
  }, [availableCustomersForDualList, formData]);

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddCustomer = (customer: any) => {
    if ('assignedCustomerIds' in formData && !formData.assignedCustomerIds.includes(customer.id)) {
      setFormData({
        ...formData,
        assignedCustomerIds: [...formData.assignedCustomerIds, customer.id],
      } as FormState);
    }
  };

  const handleRemoveCustomer = (customer: any) => {
    if ('assignedCustomerIds' in formData) {
      setFormData({
        ...formData,
        assignedCustomerIds: formData.assignedCustomerIds.filter(id => id !== customer.id),
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
    
    console.log('🔄 [UserForm] Form submission started', {
      isEdit: !!initialData,
      userId: initialData?.id,
      formData: {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        assignedCustomerIds: 'assignedCustomerIds' in formData ? formData.assignedCustomerIds : 'N/A'
      }
    });
    
    const { password, ...restData } = formData;
    
    try {
      if (initialData) {
        const updateData = {
          id: initialData.id,
          ...(password ? { password } : {}),
          ...restData,
        } as UpdateUserInput;
        
        console.log('🔄 [UserForm] Submitting update data', updateData);
        onSubmit(updateData);
      } else {
        // For new users, include confirmPassword
        const createData = {
          ...formData,
          confirmPassword: formData.password || '',
        } as CreateUserInput;
        
        console.log('🔄 [UserForm] Submitting create data', createData);
        onSubmit(createData);
      }
      
      console.log('✅ [UserForm] Form submission completed successfully');
    } catch (error) {
      console.error('❌ [UserForm] Form submission failed:', error);
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
          <div>
            <Label htmlFor="password">Password</Label>
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
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleSelectChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue />
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
        </CardContent>
      </Card>

      {/* Customer Assignment Section - Only for Advantage One roles */}
      {!isCustomerRole && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Customer Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Loading customers...</div>
              </div>
            ) : (
              <div className="space-y-4">
                <Label className="text-sm font-medium">Assign customers to this officer</Label>
                <DualListBox
                  available={availableCustomersNotSelected}
                  selected={selectedCustomersForDualList}
                  onAdd={handleAddCustomer}
                  onRemove={handleRemoveCustomer}
                />
                <div className="text-sm text-gray-500">
                  {selectedCustomersForDualList.length} customer(s) assigned
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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