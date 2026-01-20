import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import React from 'react';
import { cn } from '@/utils/cn';

// Make Column and DataTable generic
export interface Column<T = any> {
  key: keyof T | string;
  title: string | React.ReactNode;
  filter?: {
    type: 'text' | 'list' | 'boolean';
    data?: string[];
  };
  render?: (value: any, row?: T) => React.ReactNode;
  maxWidth?: string;
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  searchTerm?: string;
  renderActions?: (item: T) => React.ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
  };
  loading?: boolean;
  error?: string;
}

export function DataTable<T = any>({
  columns,
  data,
  searchPlaceholder = "Search...",
  onSearch,
  searchTerm = "",
  renderActions,
  pagination,
  loading,
  error,
}: DataTableProps<T>) {
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };
  return (
    <div className="space-y-4">
      {onSearch && (
        <div className={cn("flex", "items-center", "space-x-2", "mb-4")}>
          <div className={cn("relative", "flex-1", "max-w-sm")}>
            <Search className={cn("absolute", "left-2.5", "top-2.5", "h-4", "w-4", "text-muted-foreground")} />
            <Input
              placeholder={searchPlaceholder}
              className={cn("pl-8")}
              value={searchTerm}
              onChange={handleSearchChange}
              aria-invalid={false}
            />
          </div>
        </div>
      )}
      <div className={cn("w-full", "overflow-auto", "border", "rounded-lg")} style={{ maxHeight: (data && data.length > 30) ? 800 : 'none', position: 'relative' }}>
        <table className={cn("min-w-full", "border-separate", "border-spacing-0")}>
          <thead className={cn("bg-gray-100")}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className={cn(
                    'sticky',
                    'top-0',
                    'z-20',
                    'bg-gray-100',
                    'font-semibold',
                    'text-base',
                    'px-4',
                    'py-2',
                    'border-b',
                    'text-left',
                    column.maxWidth && `max-w-[${column.maxWidth}] truncate`
                  )}
                  style={column.maxWidth ? { textOverflow: 'ellipsis', overflow: 'auto' } : {}}
                >
                  {column.title}
                </th>
              ))}
              {renderActions && <th className={cn('sticky', 'top-0', 'z-20', 'bg-gray-100', 'font-semibold', 'text-base', 'px-4', 'py-2', 'border-b', 'text-left')}>OPTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)}>
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)} className={cn("text-red-700")}>
                  {error}
                </td>
              </tr>
            ) : !data || data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)}>
                  No results found
                </td>
              </tr>
            ) : (
              (data || []).map((item, index) => (
                <tr key={index} className={cn(index % 2 === 1 && 'even:bg-gray-50')}>
                  {columns.map((column) => (
                    <td key={column.key as string} className={cn("p-2 border-b", column.maxWidth && `max-w-[${column.maxWidth}] overflow-x-auto whitespace-nowrap`)} style={column.maxWidth ? { textOverflow: 'ellipsis', overflow: 'auto' } : {}}>
                      {column.render
                        ? column.render((item as any)[column.key as keyof T], item)
                        : (item as any)[column.key as keyof T]}
                    </td>
                  ))}
                  {renderActions && <td className="p-2 border-b">{renderActions(item)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {pagination && (
          <div className={cn("flex", "justify-between", "items-center", "mt-4", "text-sm", "text-muted-foreground", "border-t", "bg-white")} style={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            minHeight: 48,
            boxShadow: '0 -2px 8px rgba(0,0,0,0.03)',
          }}>
            <div className={cn("flex", "gap-2")}>
              <Button variant="outline" size="sm" onClick={() => pagination.onPageChange(1)} disabled={pagination.currentPage === 1}>{'<< FIRST'}</Button>
              <Button variant="outline" size="sm" onClick={() => pagination.onPageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>{'< PREVIOUS'}</Button>
            </div>
            <div>
              Displaying results: {(data && data.length > 0) ? (pagination.currentPage - 1) * pagination.itemsPerPage + 1 : 0}-{(pagination.currentPage - 1) * pagination.itemsPerPage + (data?.length || 0)} of {pagination.totalItems}
            </div>
            <div className={cn("flex", "gap-2")}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  pagination.onPageChange(pagination.currentPage + 1);
                }}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                {'NEXT >'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  pagination.onPageChange(pagination.totalPages);
                }}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                {'LAST >>'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}