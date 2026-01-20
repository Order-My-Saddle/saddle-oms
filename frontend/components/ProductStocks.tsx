"use client";

import { PageHeader, StatusBadge } from './shared';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { EntityTable } from '@/components/shared/EntityTable';
import { useTableFilters, usePagination } from '@/hooks';
import { getProductStockTableColumns } from '@/utils/productStockTableColumns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export interface ProductStock {
  id: string;
  name: string;
  sku: string;
  stock: number;
  status: string;
}

// Sample data - in a real app, this would come from the API
const sampleProductStocks: ProductStock[] = [
  { id: '1', name: 'Advantage R', sku: 'SKU-001', stock: 12, status: 'Optimal' },
  { id: '2', name: 'Flight X', sku: 'SKU-002', stock: 0, status: 'Out of Stock' },
  { id: '3', name: 'Solo Signature OT', sku: 'SKU-003', stock: 3, status: 'Low Stock' },
];

export default function ProductStocks() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use our new hooks for filters and pagination
  const { filters, updateFilter } = useTableFilters<Record<string, string>>({});
  const { pagination, setTotalItems } = usePagination(10, 1);
  
  // In a real app, we would use useEntityData to fetch from the API
  // For now, we'll use our sample data
  const [productStocks] = useState<ProductStock[]>(sampleProductStocks);
  const loading = false;
  const error = '';
  
  // Set total items for pagination
  useEffect(() => {
    setTotalItems(productStocks.length);
  }, [productStocks, setTotalItems]);
  
  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    updateFilter(key, value);
  };
  
  // Handle view product stock details
  const handleViewProductStock = (productStock: ProductStock) => {
    console.log('View product stock', productStock);
    // Implement view logic
  };
  
  // Handle edit product stock
  const handleEditProductStock = (productStock: ProductStock) => {
    console.log('Edit product stock', productStock);
    // Implement edit logic
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader 
        title="Product Stocks" 
        description="Track stock levels for all products." 
        actions={
          <Button className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Update Stock
          </Button>
        } 
      />

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <EntityTable
        entities={productStocks}
        columns={getProductStockTableColumns(filters, handleFilterChange)}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        headerFilters={filters}
        onFilterChange={handleFilterChange}
        pagination={pagination}
        loading={loading}
        error={error}
        entityType="product"
        onView={handleViewProductStock}
        onEdit={handleEditProductStock}
        actionButtons={{
          view: true,
          edit: true,
          delete: false
        }}
      />
    </div>
  );
}