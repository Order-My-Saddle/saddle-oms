import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface FormTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  textareaClassName?: string;
  rows?: number;
}

export function FormTextarea({
  label,
  name,
  value,
  onChange,
  error,
  required,
  placeholder,
  disabled,
  className,
  labelClassName,
  textareaClassName,
  rows = 4,
}: FormTextareaProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        htmlFor={name}
        className={cn(error && "text-red-500", labelClassName)}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={cn(error && "border-red-500", textareaClassName)}
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
