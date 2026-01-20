import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Warehouse } from '@/services/warehouses';
import { Column } from '@/components/shared/DataTable';
import { TableHeaderFilter } from '../components/shared/TableHeaderFilter';

export type WarehouseHeaderFilters = Record<string, string>;
export type SetWarehouseHeaderFilters = (key: string, value: string) => void;

/**
 * Get status badge styling
 */
function getStatusBadgeStyle(status: string): string {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'suspended':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Render status badge
 */
function renderStatusBadge(status: string) {
  const displayStatus = status || 'unknown';
  return (
    <span 
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeStyle(displayStatus)}`}
    >
      {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
    </span>
  );
}

/**
 * Render enabled/disabled status
 */
function renderEnabledStatus(enabled: boolean) {
  return (
    <span 
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
        enabled 
          ? 'bg-green-100 text-green-800 border-green-300' 
          : 'bg-red-100 text-red-800 border-red-300'
      }`}
    >
      {enabled ? 'Enabled' : 'Disabled'}
    </span>
  );
}

/**
 * Get table columns for warehouses
 */
export function getWarehouseTableColumns({
  onView,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: {
  onView?: (warehouse: Warehouse) => void;
  onEdit?: (warehouse: Warehouse) => void;
  onDelete?: (warehouse: Warehouse) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}): Column<Warehouse>[] {
  const columns: Column<Warehouse>[] = [
    {
      key: 'username',
      title: 'Username',
      render: (value: string) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'name',
      title: 'Name',
      render: (value: string) => value || '-',
    },
    {
      key: 'location',
      title: 'Location',
      render: (value: string) => value || '-',
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => renderStatusBadge(value),
    },
    {
      key: 'enabled',
      title: 'Enabled',
      render: (value: boolean) => renderEnabledStatus(value),
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (value: string) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString();
      },
    },
  ];

  // Add actions column if any action handlers are provided
  if (onView || onEdit || onDelete) {
    columns.push({
      key: 'actions',
      title: 'Actions',
      render: (_, warehouse) => (
        <div className="flex items-center gap-2">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(warehouse)}
              title="View warehouse details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onEdit && canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(warehouse)}
              title="Edit warehouse"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(warehouse)}
              title="Delete warehouse"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    });
  }

  return columns;
}

/**
 * Get filterable warehouse table columns for EntityTable
 */
export function getWarehouseTableColumnsFiltered(headerFilters: WarehouseHeaderFilters, setHeaderFilters: SetWarehouseHeaderFilters) {
  // Status options for filter
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'suspended', label: 'Suspended' },
  ];

  // Enabled options for filter
  const enabledOptions = [
    { value: 'true', label: 'Enabled' },
    { value: 'false', label: 'Disabled' },
  ];

  return [
    {
      key: 'username',
      title: (
        <TableHeaderFilter
          title="Username"
          value={headerFilters.username || ''}
          onFilter={value => setHeaderFilters('username', value)}
          type="text"
          entityType="warehouse"
        />
      ),
      render: (value: string) => (
        <span className="font-medium text-gray-900">{value || '-'}</span>
      ),
    },
    {
      key: 'name',
      title: (
        <TableHeaderFilter
          title="Name"
          value={headerFilters.name || ''}
          onFilter={value => setHeaderFilters('name', value)}
          type="text"
          entityType="warehouse"
        />
      ),
      render: (value: string) => value || '-',
    },
    {
      key: 'location',
      title: (
        <TableHeaderFilter
          title="Location"
          value={headerFilters.location || ''}
          onFilter={value => setHeaderFilters('location', value)}
          type="text"
          entityType="warehouse"
        />
      ),
      render: (value: string) => value || '-',
    },
    {
      key: 'status',
      title: (
        <TableHeaderFilter
          title="Status"
          value={headerFilters.status || ''}
          onFilter={value => setHeaderFilters('status', value)}
          type="enum"
          data={statusOptions.map(s => s.value)}
          entityType="warehouse"
        />
      ),
      render: (value: string) => renderStatusBadge(value),
    },
    {
      key: 'enabled',
      title: (
        <TableHeaderFilter
          title="Enabled"
          value={headerFilters.enabled || ''}
          onFilter={value => setHeaderFilters('enabled', value)}
          type="enum"
          data={enabledOptions.map(e => e.value)}
          entityType="warehouse"
        />
      ),
      render: (value: boolean) => renderEnabledStatus(value),
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (value: string) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString();
      },
    },
  ];
}

/**
 * Default columns without actions for EntityTable (legacy)
 */
export function getDefaultWarehouseTableColumns(): Column<Warehouse>[] {
  return [
    {
      key: 'username',
      title: 'Username',
      render: (value: string) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'name',
      title: 'Name',
      render: (value: string) => value || '-',
    },
    {
      key: 'location',
      title: 'Location',
      render: (value: string) => value || '-',
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => renderStatusBadge(value),
    },
    {
      key: 'enabled',
      title: 'Enabled',
      render: (value: boolean) => renderEnabledStatus(value),
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (value: string) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString();
      },
    },
  ];
}