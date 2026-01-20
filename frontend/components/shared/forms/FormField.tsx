import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  autoComplete?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required,
  placeholder,
  disabled,
  className,
  labelClassName,
  inputClassName,
  autoComplete,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        htmlFor={name}
        className={cn(error && "text-red-500", labelClassName)}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={cn(error && "border-red-500", inputClassName)}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <p 
          id={`${name}-error`} 
          className="text-red-500 text-sm"
        >
          {error}
        </p>
      )}
    </div>
  );
}
