/**
 * User create/edit form for UserDialog.
 * Flow: role selection drives employee link vs customer assignments → DualListBox access → parent onSubmit.
 */
import React, { useState, useMemo, useEffect } from 'react';
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
import { EmployeeCombobox } from './EmployeeCombobox';
import {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserRole,
  CustomerUser,
} from '@/types/user';
import { useAvailableCustomers } from '@/hooks/useAvailableCustomers';
import { Users, Eye, EyeOff, Building2, Lock, FileText, Shield, Briefcase, ChevronRight, ChevronLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { employeeService } from '@/services/employeeService';
import { userService } from '@/services/userService';
import { Employee } from '@/types/employee';
import { toast } from 'sonner';
import { roleDisplayName } from '@/utils/roles';
import { logger } from '@/utils/logger';

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => void;
  onCancel: () => void;
}

const USER_ROLES: UserRole[] = ['administrator', 'manager', 'securityofficer', 'customer'];

const isCustomerTenantRole = (role: UserRole): role is 'customer' => role === 'customer';

/** Administrator, manager, security officer: employee link + optional multi-customer assignments. */
const usesStaffEmployeeSection = (role: UserRole): boolean => !isCustomerTenantRole(role);

/** Placeholder items so Radix Select stays controlled (value always matches a SelectItem). */
const SELECT_UNSET_CUSTOMER = '__unset_customer__';

// Helper to format role for display (PascalCase)
const formatRoleForDisplay = (role: UserRole): string => {
  return roleDisplayName(role);
};

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
  customerId?: number;
  recordIsDeleted?: boolean;
  employeeId?: number;
} & (
  | { role: 'customer' }
  | { role: Exclude<UserRole, 'customer'>; assignedCustomerIds: number[] }
);

export const UserForm = ({ initialData, onSubmit, onCancel }: UserFormProps) => {
  const { availableCustomers, isLoading } = useAvailableCustomers();
  
  // Debug logging for initialData
  useEffect(() => {
    if (initialData) {
      logger.debug('🔍 [UserForm] Initial data received:', {
        id: initialData.id,
        username: initialData.username,
        employeeId: (initialData as any).employeeId,
        employeeName: (initialData as any).employeeName,
        role: initialData.role
      });
      logger.debug('🔍 [UserForm] Full initialData object:', initialData);
      logger.debug('🔍 [UserForm] EmployeeId from initialData:', (initialData as any).employeeId);
      logger.debug('🔍 [UserForm] EmployeeName from initialData:', (initialData as any).employeeName);
      
      // Debug customer assignments
      if ('assignedCustomerIds' in initialData) {
        logger.debug('🔍 [UserForm] AssignedCustomerIds:', initialData.assignedCustomerIds);
        logger.debug('🔍 [UserForm] AssignedCustomerIds type:', typeof initialData.assignedCustomerIds);
        logger.debug('🔍 [UserForm] AssignedCustomerIds length:', Array.isArray(initialData.assignedCustomerIds) ? initialData.assignedCustomerIds.length : 'Not an array');
      }
      
      // Debug customerId for customer users
      if (initialData.role === 'customer') {
        logger.debug('🔍 [UserForm] CustomerId from initialData:', (initialData as CustomerUser)?.customerId);
      }
    }
  }, [initialData]);
  
  // Helper function to parse assignedCustomerIds
  const parseAssignedCustomerIds = (customerIds: any): number[] => {
    if (!customerIds) return [];
    if (Array.isArray(customerIds)) return customerIds;
    if (typeof customerIds === 'string') {
      try {
        const parsed = JSON.parse(customerIds);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        logger.error('Error parsing assignedCustomerIds:', error);
        return [];
      }
    }
    return [];
  };

  const [formData, setFormData] = useState<FormState>(() => {
    const baseData = {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      username: initialData?.username || '',
      email: initialData?.email || '',
      password: '',
      role: initialData?.role || USER_ROLES[2],
      pageAccessRole: initialData?.pageAccessRole || USER_ROLES[2],
      signature: initialData?.signature || '',
      signatureCode: initialData?.signatureCode || '',
      jobTitle: initialData?.jobTitle || '',
      customerId: (initialData as CustomerUser)?.customerId ?? undefined,
      recordIsDeleted: initialData?.recordIsDeleted || false,
      employeeId: (initialData as any)?.employeeId ?? undefined,
    };

    logger.debug('🔍 [UserForm] Form data initialization:', {
      initialDataEmployeeId: (initialData as any)?.employeeId,
      baseDataEmployeeId: baseData.employeeId,
      fullBaseData: baseData
    });

    if (initialData?.role === 'customer') {
      return {
        ...baseData,
        role: 'customer',
        customerId: (initialData as CustomerUser)?.customerId ?? undefined,
      } as FormState;
    }

    const assignedCustomerIds = initialData && 'assignedCustomerIds' in initialData
      ? parseAssignedCustomerIds(initialData.assignedCustomerIds)
      : [];

    logger.debug('🔍 [UserForm] Parsed assignedCustomerIds:', assignedCustomerIds);

    return {
      ...baseData,
      role: (initialData?.role ?? USER_ROLES[2]) as Exclude<UserRole, 'customer'>,
      assignedCustomerIds,
    } as FormState;
  });

  const [showPassword, setShowPassword] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  useEffect(() => {
    const shouldLoad = usesStaffEmployeeSection(formData.role);
    if (!shouldLoad) {
      setEmployees([]);
      return;
    }

    const load = async () => {
      setLoadingEmployees(true);
      try {
        // For editing, we need all employees (including the currently linked one)
        // For creating, we only need unlinked employees
        if (initialData) {
          // When editing, get all active employees
          const allEmployees = await employeeService.getActiveEmployees();
          logger.debug('🔍 [UserForm] Loaded all employees for editing:', allEmployees);
          setEmployees(allEmployees);
        } else {
          // When creating, get only unlinked employees
          const unlinked = await userService.getUnlinkedEmployees();
          logger.debug('🔍 [UserForm] Loaded unlinked employees for creating:', unlinked);
          setEmployees(unlinked);
        }
      } catch (err) {
        logger.error('Error loading employees for UserForm:', err);
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };
    load();
  }, [formData.role, initialData]);

  // Convert availableCustomers to Customer objects for DualListBox
  const availableCustomersForDualList = useMemo(() => {
    return availableCustomers.map(customer => ({
      id: String(customer.id),
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
        customerId: String(customer.id),
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
          id: String(customer.id),
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
            customerId: String(customer.id),
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
      customer => !formData.assignedCustomerIds.includes(Number(customer.id))
    );
  }, [availableCustomersForDualList, formData]);

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddCustomer = (customer: any) => {
    if ('assignedCustomerIds' in formData && !formData.assignedCustomerIds.includes(customer.id)) {
      setFormData({
        ...formData,
        assignedCustomerIds: [...formData.assignedCustomerIds, Number(customer.id)],
      } as FormState);
    }
  };

  const handleRemoveCustomer = (customer: any) => {
    if ('assignedCustomerIds' in formData) {
      setFormData({
        ...formData,
        assignedCustomerIds: formData.assignedCustomerIds.filter(id => id !== Number(customer.id)),
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

      setFormData((prev) => {
        const nextTenant = isCustomerTenantRole(role);
        const prevTenant = isCustomerTenantRole(prev.role);
        const nextStaff = usesStaffEmployeeSection(role);
        const prevStaff = usesStaffEmployeeSection(prev.role);

        if (nextTenant) {
          const next = {
            ...prev,
            role,
            pageAccessRole: role,
            employeeId: undefined,
            assignedCustomerIds: undefined,
          } as FormState & { assignedCustomerIds?: number[] };
          delete next.assignedCustomerIds;
          return {
            ...next,
            customerId: undefined,
          } as FormState;
        }

        const assignedIds =
          'assignedCustomerIds' in prev ? [...prev.assignedCustomerIds] : [];

        if (prevTenant) {
          return {
            ...prev,
            role,
            pageAccessRole: role,
            employeeId: undefined,
            customerId: undefined,
            assignedCustomerIds: [],
          } as FormState;
        }

        if (!prevStaff && nextStaff) {
          return {
            ...prev,
            role,
            pageAccessRole: role,
            employeeId: undefined,
            assignedCustomerIds: [],
          } as FormState;
        }

        return {
          ...prev,
          role,
          pageAccessRole: role,
          assignedCustomerIds: assignedIds,
        } as FormState;
      });
    } else if (name === 'customerId') {
      setFormData(prev => ({ ...prev, customerId: value ? parseInt(value) : undefined }));
    }
  };

  const isCustomerRole = formData.role === 'customer';

  const staffEmployeeSection = usesStaffEmployeeSection(formData.role);

  const roleSelectValue = USER_ROLES.includes(formData.role as UserRole)
    ? formData.role
    : USER_ROLES[2];

  const customerSelectValue = useMemo(() => {
    if (isLoading) return 'loading';
    if (availableCustomers.length === 0) return 'no-customers';
    if (
      formData.customerId != null &&
      availableCustomers.some((c) => c.id === formData.customerId)
    ) {
      return String(formData.customerId);
    }
    return SELECT_UNSET_CUSTOMER;
  }, [isLoading, availableCustomers, formData.customerId]);

  // Debug logging for customerId changes
  useEffect(() => {
    if (isCustomerRole) {
      logger.debug('🔍 [UserForm] CustomerId in formData:', formData.customerId);
      logger.debug('🔍 [UserForm] Available customers count:', availableCustomers.length);
      if (formData.customerId) {
        const selectedCustomer = availableCustomers.find(c => c.id === formData.customerId);
        logger.debug('🔍 [UserForm] Selected customer:', selectedCustomer?.name || 'Not found');
      }
    }
  }, [formData.customerId, isCustomerRole, availableCustomers]);

  // Debug logging for employee dropdown
  useEffect(() => {
    if (staffEmployeeSection) {
      logger.debug('🔍 [UserForm] Employee dropdown debug:', {
        formDataEmployeeId: formData.employeeId,
        employeesCount: employees.length,
        employees: employees.map(emp => ({ id: emp.id, name: `${emp.firstName} ${emp.surname}` })),
        hasMatchingEmployee: employees.some(emp => emp.id === formData.employeeId)
      });
    }
  }, [formData.employeeId, employees, staffEmployeeSection]);

  // Staff roles require employee linkage; customer role uses tenant customer selection instead.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate employee requirement for staff-linked roles
    if (staffEmployeeSection && !formData.employeeId) {
      toast.error('Employee selection is required for non-customer users');
      return;
    }
    
    // Validate customerId requirement for customer users
    if (isCustomerRole && !formData.customerId) {
      toast.error('Customer selection is required for customer users');
      return;
    }
    
    logger.debug('🔄 [UserForm] Form submission started', {
      isEdit: !!initialData,
      userId: initialData?.id,
      formData: {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        employeeId: formData.employeeId,
        customerId: formData.customerId,
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
        } as UpdateUserInput & { employeeId?: number; customerId?: number };
        
        // Explicitly ensure customerId is included for customer users
        // Always send customerId for customer roles, even if it's undefined (to allow clearing)
        if (isCustomerRole) {
          (updateData as any).customerId = formData.customerId ?? null;
        } else {
          // For non-customer roles, explicitly set to null to clear any existing customerId
          (updateData as any).customerId = null;
        }
        
        logger.debug('🔄 [UserForm] Submitting update data', updateData);
        logger.debug('🔄 [UserForm] CustomerId in update data:', (updateData as any).customerId);
        logger.debug('🔄 [UserForm] Is customer role:', isCustomerRole);
        onSubmit(updateData);
      } else {
        const createData = {
          ...formData,
          confirmPassword: formData.password || '',
        } as CreateUserInput & { employeeId?: number; customerId?: number };
        
        logger.debug('🔄 [UserForm] Submitting create data', createData);
        onSubmit(createData);
      }
      
      logger.debug('✅ [UserForm] Form submission completed successfully');
    } catch (error) {
      logger.error('❌ [UserForm] Form submission failed:', error);
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
              value={roleSelectValue}
              onValueChange={(value) => handleSelectChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {formatRoleForDisplay(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

                     {/* Employee Selection for staff-linked roles */}
           {staffEmployeeSection && (
             <div className="md:col-span-2">
               <Label htmlFor="employeeId" className={!formData.employeeId ? 'text-red-600' : ''}>
                 Select Employee *
               </Label>
               <EmployeeCombobox
                 id="employeeId"
                 employees={employees}
                 loading={loadingEmployees}
                 value={formData.employeeId}
                 fallbackLabel={(initialData as { employeeName?: string })?.employeeName}
                 onChange={(employeeId) =>
                   setFormData((prev) => ({ ...prev, employeeId }))
                 }
                 invalid={!formData.employeeId}
               />
             </div>
           )}
        </CardContent>
      </Card>

      {/* Customer Assignment Section - staff-linked roles */}
      {staffEmployeeSection && (
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
              <Label htmlFor="customerId" className={!formData.customerId ? 'text-red-600' : ''}>
                Customer *
              </Label>
              <Select
                value={customerSelectValue}
                onValueChange={(value) => {
                  if (value === 'loading' || value === 'no-customers') return;
                  if (value === SELECT_UNSET_CUSTOMER) {
                    setFormData((prev) => ({ ...prev, customerId: undefined }));
                    return;
                  }
                  handleSelectChange('customerId', value);
                }}
                required
              >
                <SelectTrigger className={!formData.customerId ? 'border-red-500' : ''}>
                  <SelectValue placeholder={isLoading ? 'Loading customers...' : 'Select customer'} />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading customers...
                      </div>
                    </SelectItem>
                  ) : availableCustomers.length === 0 ? (
                    <SelectItem value="no-customers" disabled>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        No customers available
                      </div>
                    </SelectItem>
                  ) : (
                    <>
                      <SelectItem value={SELECT_UNSET_CUSTOMER} disabled>
                        Select customer
                      </SelectItem>
                      {availableCustomers.map((customer) => (
                        <SelectItem key={customer.id} value={String(customer.id)}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              {!formData.customerId && (
                <p className="text-xs text-red-600 mt-1">Customer selection is required for customer users</p>
              )}
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

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          {initialData ? 'Update' : 'Create'} User
        </Button>
      </div>
    </form>
  );
}; 