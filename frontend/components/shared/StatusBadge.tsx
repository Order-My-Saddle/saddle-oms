"use client";

import { cn } from "@/lib/utils";

export type StatusType = 'order' | 'product' | 'customer' | 'fitter' | 'supplier' | 'factory' | 'access-filter-group' | 'country-manager' | 'generic';

export interface StatusConfig {
  className: string;
  label?: string;
}

export interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  customLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Generic status styles as StatusConfig objects
const genericStatusStyles: Record<string, StatusConfig> = {
  'In Stock': { className: 'bg-green-100 text-green-800' },
  'Low Stock': { className: 'bg-yellow-100 text-yellow-800' },
  'Out of Stock': { className: 'bg-red-100 text-red-800' },
  'Optimal': { className: 'bg-green-100 text-green-800' },
  'Ordered': { className: 'bg-blue-100 text-blue-800' },
  'Delivered': { className: 'bg-purple-100 text-purple-800' },
  'Shipped': { className: 'bg-cyan-100 text-cyan-800' },
  'In Production P1': { className: 'bg-orange-100 text-orange-800' },
  'In Production P2': { className: 'bg-orange-200 text-orange-900' },
  'Approved': { className: 'bg-teal-100 text-teal-800' },
};

// Entity-specific status configurations
const STATUS_CONFIGS: Record<StatusType, Record<string, StatusConfig>> = {
  order: {
    'UNORDERED': { className: 'bg-gray-100 text-gray-800', label: 'Unordered' },
    'ORDERED': { className: 'bg-blue-100 text-blue-800', label: 'Ordered' },
    'APPROVED': { className: 'bg-green-100 text-green-800', label: 'Approved' },
    'REJECTED': { className: 'bg-red-100 text-red-800', label: 'Rejected' },
    'IN_PRODUCTION_P1': { className: 'bg-orange-100 text-orange-800', label: 'In Production P1' },
    'IN_PRODUCTION_P2': { className: 'bg-orange-200 text-orange-900', label: 'In Production P2' },
    'IN_PRODUCTION_P3': { className: 'bg-orange-300 text-orange-950', label: 'In Production P3' },
    'SHIPPED_TO_STOCK_OWNER': { className: 'bg-purple-100 text-purple-800', label: 'Shipped to Stock Owner' },
    'SHIPPED_TO_CUSTOMER': { className: 'bg-purple-200 text-purple-900', label: 'Shipped to Customer' },
    'INVENTORY': { className: 'bg-cyan-100 text-cyan-800', label: 'Inventory' },
    'ON_HOLD': { className: 'bg-yellow-100 text-yellow-800', label: 'On Hold' },
    'ON_TRIAL': { className: 'bg-yellow-200 text-yellow-900', label: 'On Trial' },
    'COMPLETED_SALE': { className: 'bg-teal-100 text-teal-800', label: 'Completed Sale' },
    'CANCELLED': { className: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
    'PENDING': { className: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    'IN_PRODUCTION': { className: 'bg-blue-100 text-blue-800', label: 'In Production' },
    'SHIPPED': { className: 'bg-purple-100 text-purple-800', label: 'Shipped' },
    'DELIVERED': { className: 'bg-teal-100 text-teal-800', label: 'Delivered' },
  },
  product: {
    'AVAILABLE': { className: 'bg-green-100 text-green-800' },
    'LOW_STOCK': { className: 'bg-yellow-100 text-yellow-800', label: 'Low Stock' },
    'OUT_OF_STOCK': { className: 'bg-red-100 text-red-800', label: 'Out of Stock' },
    'DISCONTINUED': { className: 'bg-gray-100 text-gray-800' },
  },
  customer: {
    'ACTIVE': { className: 'bg-green-100 text-green-800' },
    'INACTIVE': { className: 'bg-gray-100 text-gray-800' },
    'NEW': { className: 'bg-blue-100 text-blue-800' },
    'VIP': { className: 'bg-purple-100 text-purple-800' },
  },
  fitter: {
    'ACTIVE': { className: 'bg-green-100 text-green-800' },
    'INACTIVE': { className: 'bg-gray-100 text-gray-800' },
    'BUSY': { className: 'bg-yellow-100 text-yellow-800' },
  },
  supplier: {
    'ACTIVE': { className: 'bg-green-100 text-green-800' },
    'INACTIVE': { className: 'bg-gray-100 text-gray-800' },
  },
  factory: {
    'ACTIVE': { className: 'bg-green-100 text-green-800' },
    'INACTIVE': { className: 'bg-gray-100 text-gray-800' },
  },
  'access-filter-group': {
    'ACTIVE': { className: 'bg-green-100 text-green-800' },
    'INACTIVE': { className: 'bg-gray-100 text-gray-800' },
  },
  'country-manager': {
    'ACTIVE': { className: 'bg-green-100 text-green-800' },
    'INACTIVE': { className: 'bg-gray-100 text-gray-800' },
  },
  generic: genericStatusStyles,
};

// Size variations
const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
};

export function StatusBadge({ 
  status, 
  type = 'generic', 
  customLabel,
  size = 'md'
}: StatusBadgeProps) {
  // Get config from the appropriate entity type
  const configs = STATUS_CONFIGS[type] || STATUS_CONFIGS.generic;
  const config = configs[status] || { className: 'bg-gray-100 text-gray-800' };
  
  // Determine the label to display
  const displayLabel = customLabel || config.label || status;
  
  // Determine the size class
  const sizeClass = sizeClasses[size];
  
  return (
    <span
      className={cn(
        "inline-block rounded-full font-semibold",
        sizeClass,
        config.className
      )}
    >
      {displayLabel}
    </span>
  );
}