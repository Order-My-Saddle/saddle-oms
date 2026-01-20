# Components

This guide covers the component architecture, design patterns, and development guidelines for building UI components in the OMS frontend.

## 🏗️ Component Architecture

The OMS frontend follows a hierarchical component architecture based on atomic design principles:

```
Pages (app/)
    ↓
Templates (layouts/)
    ↓
Organisms (complex components)
    ↓
Molecules (composite components)
    ↓
Atoms (ui/ components)
```

### Component Categories

**Atoms (ui/)**
- Basic building blocks (Button, Input, Badge)
- No business logic
- Highly reusable
- Styled with variants

**Molecules (shared/)**
- Combinations of atoms
- Simple business logic
- Reusable across features
- Examples: SearchBox, StatusIndicator

**Organisms (feature-specific)**
- Complex components
- Feature-specific logic
- Examples: OrderTable, CustomerForm

**Templates (layouts/)**
- Page layouts
- Navigation structure
- Content organization

**Pages (app/)**
- Complete views
- Data fetching
- Route handling

## 🎨 Design System

### Shadcn/ui Foundation

The component library is built on shadcn/ui, providing:

- **Accessibility**: WCAG 2.1 compliant components
- **Customization**: Tailwind CSS variants
- **Consistency**: Unified design language
- **Type Safety**: Full TypeScript support

### Component Variants

```typescript
// Using class-variance-authority (cva)
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

### Theme Configuration

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
    },
  },
}
```

## 🧱 Core UI Components

### Button Component

```typescript
// components/ui/Button.tsx
import { Slot } from '@radix-ui/react-slot'
import { LoaderIcon } from 'lucide-react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    loadingText,
    children,
    disabled,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
        )}
        {loading ? loadingText || 'Loading...' : children}
      </Comp>
    )
  }
)

Button.displayName = 'Button'
```

### Input Component

```typescript
// components/ui/Input.tsx
import { EyeIcon, EyeOffIcon } from 'lucide-react'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  description?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, description, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={props.id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            type={isPassword && showPassword ? 'text' : type}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus-visible:ring-destructive',
              isPassword && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

### Select Component

```typescript
// components/ui/Select.tsx
import * as SelectPrimitive from '@radix-ui/react-select'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  error?: string
  label?: string
  disabled?: boolean
}

export const Select = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectProps
>(({ options, value, onValueChange, placeholder, error, label, disabled }, ref) => (
  <div className="space-y-2">
    {label && (
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
    )}

    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus:ring-destructive'
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Content className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
        <SelectPrimitive.Viewport className="p-1">
          {options.map((option) => (
            <SelectPrimitive.Item
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <SelectPrimitive.ItemIndicator>
                  <CheckIcon className="h-4 w-4" />
                </SelectPrimitive.ItemIndicator>
              </span>
              <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
            </SelectPrimitive.Item>
          ))}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Root>

    {error && (
      <p className="text-sm text-destructive">{error}</p>
    )}
  </div>
))

Select.displayName = 'Select'
```

## 🔗 Composite Components

### Entity Table Component

```typescript
// components/shared/EntityTable.tsx
import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'

export interface EntityTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  loading?: boolean
  error?: string
  onRowClick?: (row: TData) => void
  pagination?: {
    pageIndex: number
    pageSize: number
    pageCount: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
  }
  searchable?: boolean
  searchPlaceholder?: string
  className?: string
}

export function EntityTable<TData>({
  data,
  columns,
  loading = false,
  error,
  onRowClick,
  pagination,
  searchable = false,
  searchPlaceholder = 'Search...',
  className,
}: EntityTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination: pagination && {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: !!pagination,
    pageCount: pagination?.pageCount,
  })

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading data</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {searchable && (
        <div className="flex items-center space-x-2">
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <LoaderIcon className="h-6 w-6 animate-spin mx-auto" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : undefined}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <p className="text-muted-foreground">No data available</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
              {Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.length)} of{' '}
              {data.length} entries
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
              disabled={pagination.pageIndex === 0}
            >
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              <p className="text-sm">
                Page {pagination.pageIndex + 1} of {pagination.pageCount}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
              disabled={pagination.pageIndex >= pagination.pageCount - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### Form Field Component

```typescript
// components/shared/FormField.tsx
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>
  name: TName
  label?: string
  description?: string
  required?: boolean
  children: (field: {
    value: any
    onChange: (value: any) => void
    onBlur: () => void
    error?: string
  }) => React.ReactNode
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  required,
  children,
}: FormFieldProps<TFieldValues, TName>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name,
  })

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {children({
        value: field.value,
        onChange: field.onChange,
        onBlur: field.onBlur,
        error: error?.message,
      })}

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

// Usage example
export const CustomerForm = () => {
  const { control, handleSubmit } = useForm<CustomerFormData>()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        control={control}
        name="name"
        label="Customer Name"
        required
      >
        {({ value, onChange, onBlur, error }) => (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            error={error}
            placeholder="Enter customer name"
          />
        )}
      </FormField>

      <FormField
        control={control}
        name="country"
        label="Country"
      >
        {({ value, onChange, error }) => (
          <Select
            value={value}
            onValueChange={onChange}
            options={countryOptions}
            error={error}
            placeholder="Select country"
          />
        )}
      </FormField>
    </form>
  )
}
```

### Status Badge Component

```typescript
// components/shared/StatusBadge.tsx
import { cva, type VariantProps } from 'class-variance-authority'

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      status: {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      },
    },
    defaultVariants: {
      status: 'pending',
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  label?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className,
  ...props
}) => {
  const displayLabel = label || status?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <span
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      {displayLabel}
    </span>
  )
}

// Usage with TypeScript enum
export enum OrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DRAFT = 'draft',
}

export const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => (
  <StatusBadge status={status} />
)
```

## 🎯 Business Components

### Order Card Component

```typescript
// components/orders/OrderCard.tsx
export interface OrderCardProps {
  order: Order
  onView?: (order: Order) => void
  onEdit?: (order: Order) => void
  onDelete?: (order: Order) => void
  className?: string
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onView,
  onEdit,
  onDelete,
  className,
}) => {
  const { hasRole } = useAuth()
  const canEdit = hasRole(['ADMIN', 'SUPERVISOR'])
  const canDelete = hasRole(['ADMIN'])

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Order #{order.orderId}</CardTitle>
          <StatusBadge status={order.status} />
        </div>
        <CardDescription>
          Created {formatDate(order.createdAt)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Customer</p>
            <p>{order.customer.name}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Product</p>
            <p>{order.product.name}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Fitter</p>
            <p>{order.fitter?.name || 'Not assigned'}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Due Date</p>
            <p>{order.dueDate ? formatDate(order.dueDate) : 'Not set'}</p>
          </div>
        </div>

        {order.urgent && (
          <div className="flex items-center space-x-2 text-orange-600">
            <AlertTriangleIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Urgent Order</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex space-x-2 ml-auto">
          <Button variant="outline" size="sm" onClick={() => onView?.(order)}>
            <EyeIcon className="h-4 w-4 mr-1" />
            View
          </Button>

          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit?.(order)}>
              <EditIcon className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}

          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete?.(order)}
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
```

### Search and Filter Component

```typescript
// components/shared/SearchAndFilter.tsx
export interface FilterConfig {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'boolean'
  options?: { label: string; value: string }[]
  placeholder?: string
}

export interface SearchAndFilterProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filters: Record<string, any>
  onFiltersChange: (filters: Record<string, any>) => void
  filterConfig: FilterConfig[]
  searchPlaceholder?: string
  className?: string
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchValue,
  onSearchChange,
  filters,
  onFiltersChange,
  filterConfig,
  searchPlaceholder = 'Search...',
  className,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters }
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const activeFilterCount = Object.keys(filters).length

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-10"
            />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="relative"
        >
          <FilterIcon className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {isFilterOpen && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterConfig.map((config) => (
              <div key={config.key} className="space-y-2">
                <label className="text-sm font-medium">{config.label}</label>

                {config.type === 'text' && (
                  <Input
                    value={filters[config.key] || ''}
                    onChange={(e) => updateFilter(config.key, e.target.value)}
                    placeholder={config.placeholder}
                  />
                )}

                {config.type === 'select' && config.options && (
                  <Select
                    value={filters[config.key] || ''}
                    onValueChange={(value) => updateFilter(config.key, value)}
                    options={[
                      { label: 'All', value: '' },
                      ...config.options,
                    ]}
                  />
                )}

                {config.type === 'boolean' && (
                  <Select
                    value={filters[config.key]?.toString() || ''}
                    onValueChange={(value) =>
                      updateFilter(config.key, value === '' ? null : value === 'true')
                    }
                    options={[
                      { label: 'All', value: '' },
                      { label: 'Yes', value: 'true' },
                      { label: 'No', value: 'false' },
                    ]}
                  />
                )}

                {config.type === 'date' && (
                  <Input
                    type="date"
                    value={filters[config.key] || ''}
                    onChange={(e) => updateFilter(config.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
```

## 📋 Component Development Guidelines

### 1. Component Structure

```typescript
// components/ExampleComponent.tsx
import React from 'react'
import { cn } from '@/utils/cn'
import type { ComponentProps } from '@/types/components'

// Props interface
export interface ExampleComponentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Component-specific props
  title: string
  description?: string
  variant?: 'default' | 'compact'
  // Event handlers
  onAction?: () => void
  // Children and composition
  children?: React.ReactNode
}

// Component implementation
export const ExampleComponent = React.forwardRef<
  HTMLDivElement,
  ExampleComponentProps
>(({
  title,
  description,
  variant = 'default',
  onAction,
  children,
  className,
  ...props
}, ref) => {
  // Component logic here

  return (
    <div
      ref={ref}
      className={cn(
        'base-styles',
        variant === 'compact' && 'compact-styles',
        className
      )}
      {...props}
    >
      {/* Component JSX */}
    </div>
  )
})

ExampleComponent.displayName = 'ExampleComponent'
```

### 2. TypeScript Best Practices

```typescript
// Use discriminated unions for variant props
export type ButtonVariant = 'default' | 'destructive' | 'outline'

// Extend HTML attributes when appropriate
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'default' | 'lg'
  loading?: boolean
}

// Use generic types for reusable components
export interface TableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  onRowSelect?: (row: TData) => void
}

// Use union types for controlled/uncontrolled components
export type SearchProps = {
  // Controlled
  value: string
  onChange: (value: string) => void
} | {
  // Uncontrolled
  defaultValue?: string
  onValueChange?: (value: string) => void
}
```

### 3. Accessibility Guidelines

```typescript
// Include proper ARIA attributes
export const Button = ({ children, loading, ...props }) => (
  <button
    aria-busy={loading}
    aria-disabled={props.disabled || loading}
    {...props}
  >
    {children}
  </button>
)

// Support keyboard navigation
export const DropdownMenu = () => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        closeMenu()
        break
      case 'ArrowDown':
        focusNextItem()
        break
      case 'ArrowUp':
        focusPreviousItem()
        break
    }
  }

  return (
    <div role="menu" onKeyDown={handleKeyDown}>
      {/* Menu items */}
    </div>
  )
}

// Include focus management
export const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus()
    }
  }, [isOpen])

  return isOpen ? (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      {children}
    </div>
  ) : null
}
```

### 4. Performance Optimization

```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  // Expensive rendering logic
  return <div>{/* Rendered content */}</div>
})

// Memoize callback props
export const ParentComponent = () => {
  const handleClick = useCallback(() => {
    // Handle click
  }, [])

  return <ChildComponent onClick={handleClick} />
}

// Use useMemo for computed values
export const DataVisualization = ({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computed: expensiveCalculation(item)
    }))
  }, [data])

  return <Chart data={processedData} />
}
```

### 5. Testing Patterns

```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button Component', () => {
  test('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  test('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('shows loading state', () => {
    render(<Button loading>Submit</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
```

## ⚡ Next Steps

For specific component development:

- **[Forms](./forms.md)** - Form component patterns and validation
- **[State Management](./state-management.md)** - Managing component state with Jotai
- **[API Integration](./api-integration.md)** - Data fetching in components
- **[Testing](./testing.md)** - Component testing strategies