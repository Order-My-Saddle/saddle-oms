import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface SimpleDataTableProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: string;
  children: React.ReactNode;
}

// Reusable DataTable container with sticky header support
export const SimpleDataTable = forwardRef<HTMLDivElement, SimpleDataTableProps>(
  ({ className, height = '60vh', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('w-full overflow-auto border rounded-lg', className)}
      style={{ height, ...props.style }}
      {...props}
    >
      {children}
    </div>
  )
);
SimpleDataTable.displayName = 'SimpleDataTable';
