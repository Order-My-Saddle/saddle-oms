import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface FormCheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
}

export function FormCheckbox({
  label,
  name,
  checked,
  onChange,
  error,
  disabled,
  className,
  labelClassName,
}: FormCheckboxProps) {
  return (
    <div className={cn("flex items-start space-x-2", className)}>
      <Checkbox
        id={name}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className={error ? "border-red-500" : ""}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      <div className="grid gap-1.5 leading-none">
        <Label 
          htmlFor={name}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            error && "text-red-500",
            labelClassName
          )}
        >
          {label}
        </Label>
        {error && (
          <p 
            id={`${name}-error`} 
            className="text-red-500 text-xs"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
