'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchRepairs } from '@/services/orderProductSaddles';
import { OrderProductSaddle } from '@/types/OrderProductSaddle';
import { EntityTable } from '@/components/shared/EntityTable';
import { useTableFilters, usePagination } from '@/hooks';
import { PageHeader } from '@/components/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/utils/logger';

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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getRepairColumns = () => [
  {
    id: 'orderId',
    header: 'Order ID',
    accessor: (item: OrderProductSaddle) => item.orderId,
    sortable: true,
  },
  {
    id: 'saddleSerial',
    header: 'Saddle Serial',
    accessor: (item: OrderProductSaddle) => item.productSaddle?.serial || '-',
    sortable: false,
  },
  {
    id: 'saddleName',
    header: 'Saddle Name',
    accessor: (item: OrderProductSaddle) => getDisplayValue(item.productSaddle?.name),
    sortable: false,
  },
  {
    id: 'saddleModel',
    header: 'Model',
    accessor: (item: OrderProductSaddle) => getDisplayValue(item.productSaddle?.model),
    sortable: false,
  },
  {
    id: 'customer',
    header: 'Customer',
    accessor: (item: OrderProductSaddle) => getDisplayValue(item.order?.customer?.name),
    sortable: false,
  },
  {
    id: 'fitter',
    header: 'Fitter',
    accessor: (item: OrderProductSaddle) => getDisplayValue(item.order?.fitter?.name),
    sortable: false,
  },
  {
    id: 'legacyRepair',
    header: 'Repair Status',
    accessor: (item: OrderProductSaddle) => (
      <Badge variant={item.legacyRepair ? 'destructive' : 'secondary'}>
        {item.legacyRepair ? 'Repair' : 'Normal'}
      </Badge>
    ),
    sortable: false,
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessor: (item: OrderProductSaddle) => formatDate(item.createdAt),
    sortable: true,
  },
];

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<OrderProductSaddle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { filters, updateFilter } = useTableFilters<Record<string, string>>({});
  const { pagination, setTotalItems } = usePagination(10, 1);

  const loadRepairs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchRepairs({
        page: pagination.currentPage,
        partial: false,
        orderBy: 'orderId',
        order: 'desc'
      });

      if (result['hydra:member']) {
        setRepairs(result['hydra:member']);
        setTotalItems(result['hydra:totalItems'] || result['hydra:member'].length);
      } else {
        setRepairs([]);
        setTotalItems(0);
      }
    } catch (err) {
      setError('Failed to load repairs. Please try again.');
      setRepairs([]);
      logger.error('Error loading repairs:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, setTotalItems]);

  useEffect(() => {
    loadRepairs();
  }, [loadRepairs]);

  const handleFilterChange = (key: string, value: string) => {
    updateFilter(key, value);
  };

  const handleViewRepair = (repair: OrderProductSaddle) => {
    logger.log('View repair', repair);
    // Implement view logic if needed
  };

  const handleEditRepair = (repair: OrderProductSaddle) => {
    logger.log('Edit repair', repair);
    // Implement edit logic if needed
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Repairs"
        description="Manage saddle repairs and maintenance requests."
      />


      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-destructive">{error}</div>
          </CardContent>
        </Card>
      )}

      <EntityTable
        entities={repairs}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        columns={getRepairColumns() as any}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        headerFilters={filters}
        onFilterChange={handleFilterChange}
        pagination={pagination ?? undefined}
        loading={loading}
        error={error ?? undefined}
        entityType="order"
        onView={handleViewRepair}
        onEdit={handleEditRepair}
        actionButtons={{
          view: true,
          edit: false,
          delete: false
        }}
      />
    </div>
  );
}