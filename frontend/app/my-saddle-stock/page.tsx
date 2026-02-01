'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchMySaddleStock } from '@/services/saddleStock';
import { SaddleStock } from '@/types/SaddleStock';
import { EntityTable } from '@/components/shared/EntityTable';
import { useTableFilters, usePagination } from '@/hooks';
import { PageHeader } from '@/components/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/utils/logger';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

const getDisplayValue = (value: unknown): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return (obj.name as string) || (obj.title as string) || JSON.stringify(value);
  }
  return String(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getSaddleStockColumns = () => [
  {
    id: 'serial',
    header: 'Serial',
    accessor: (item: SaddleStock) => (
      <span className="font-mono">{item.serial}</span>
    ),
    sortable: true,
  },
  {
    id: 'name',
    header: 'Name',
    accessor: (item: SaddleStock) => item.name,
    sortable: true,
  },
  {
    id: 'model',
    header: 'Model',
    accessor: (item: SaddleStock) => getDisplayValue(item.model),
    sortable: false,
  },
  {
    id: 'leatherType',
    header: 'Leather Type',
    accessor: (item: SaddleStock) => getDisplayValue(item.leatherType),
    sortable: false,
  },
  {
    id: 'stock',
    header: 'Stock',
    accessor: (item: SaddleStock) => (
      <Badge variant={item.stock > 5 ? 'default' : item.stock > 0 ? 'secondary' : 'destructive'}>
        {item.stock}
      </Badge>
    ),
    sortable: true,
  },
  {
    id: 'demo',
    header: 'Demo',
    accessor: (item: SaddleStock) => (
      <Badge variant={item.demo ? 'outline' : 'secondary'}>
        {item.demo ? 'Yes' : 'No'}
      </Badge>
    ),
    sortable: false,
  },
  {
    id: 'customizable',
    header: 'Customizable',
    accessor: (item: SaddleStock) => (
      <Badge variant={item.customizableProduct ? 'default' : 'secondary'}>
        {item.customizableProduct ? 'Yes' : 'No'}
      </Badge>
    ),
    sortable: false,
  },
  {
    id: 'ordered',
    header: 'Ordered',
    accessor: (item: SaddleStock) => (
      <Badge variant={item.productHasBeenOrdered ? 'destructive' : 'default'}>
        {item.productHasBeenOrdered ? 'Yes' : 'No'}
      </Badge>
    ),
    sortable: false,
  },
  {
    id: 'sponsored',
    header: 'Sponsored',
    accessor: (item: SaddleStock) => (
      <Badge variant={item.sponsored ? 'outline' : 'secondary'}>
        {item.sponsored ? 'Yes' : 'No'}
      </Badge>
    ),
    sortable: false,
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessor: (item: SaddleStock) => formatDate(item.createdAt),
    sortable: true,
  },
];

export default function MySaddleStockPage() {
  const [saddleStock, setSaddleStock] = useState<SaddleStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { filters, updateFilter } = useTableFilters<Record<string, string>>({});
  const { pagination, setTotalItems } = usePagination(10, 1);

  const loadSaddleStock = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchMySaddleStock({
        page: pagination.currentPage,
        partial: false,
        orderBy: 'productId',
        order: 'desc'
      });

      if (result['hydra:member']) {
        setSaddleStock(result['hydra:member']);
        setTotalItems(result['hydra:totalItems'] || result['hydra:member'].length);
      } else {
        setSaddleStock([]);
        setTotalItems(0);
      }
    } catch (err) {
      setError('Failed to load your saddle stock. Please try again.');
      setSaddleStock([]);
      logger.error('Error loading my saddle stock:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, setTotalItems]);

  useEffect(() => {
    loadSaddleStock();
  }, [loadSaddleStock]);

  const handleFilterChange = (key: string, value: string) => {
    updateFilter(key, value);
  };

  const handleViewSaddle = (saddle: SaddleStock) => {
    logger.log('View saddle', saddle);
    // Implement view logic if needed
  };

  const handleEditSaddle = (saddle: SaddleStock) => {
    logger.log('Edit saddle', saddle);
    // Implement edit logic if needed
  };

  const handleAddStock = () => {
    logger.log('Add new stock');
    // Implement add stock logic
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="My Saddle Stock"
        description="Manage your personal saddle inventory and stock levels."
        actions={
          <Button onClick={handleAddStock} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        }
      />

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search my stock..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-destructive">{error}</div>
          </CardContent>
        </Card>
      )}

      <EntityTable
        entities={saddleStock}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        columns={getSaddleStockColumns() as any}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        headerFilters={filters}
        onFilterChange={handleFilterChange}
        pagination={pagination ?? undefined}
        loading={loading}
        error={error ?? undefined}
        entityType="product"
        onView={handleViewSaddle}
        onEdit={handleEditSaddle}
        actionButtons={{
          view: true,
          edit: true,
          delete: false
        }}
      />
    </div>
  );
}