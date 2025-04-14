import React from 'react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PatrolLogFormFieldProps {
  label: string;
  type: 'text' | 'datetime-local' | 'select';
  value: string;
  onChange: (value: string) => void;
  options?: readonly string[] | string[];
  disabled?: boolean;
  placeholder?: string;
}

export const PatrolLogFormField: React.FC<PatrolLogFormFieldProps> = ({
  label,
  type,
  value,
  onChange,
  options = [],
  disabled = false,
  placeholder
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}:</label>
      {type === 'select' ? (
        <Select 
          value={value}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-gray-300"
          disabled={disabled}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}; 