'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchRepairs } from '@/services/orderProductSaddles';
import { EnrichedOrder } from '@/types/EnrichedOrder';
import { EntityTable } from '@/components/shared/EntityTable';
import { Column } from '@/components/shared/DataTable';
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

// The enriched_orders list endpoint returns snake_case keys from raw SQL.
// Column interface uses: key (for item[key] lookup), title, render.

const getRepairColumns = (): Column<EnrichedOrder>[] => [
  {
    key: 'id',
    title: 'Order ID',
  },
  {
    key: 'customer_name',
    title: 'Customer',
    render: (value: unknown) => getDisplayValue(value),
  },
  {
    key: 'fitter_name',
    title: 'Fitter',
    render: (value: unknown) => getDisplayValue(value),
  },
  {
    key: 'orderStatus',
    title: 'Status',
    render: (value: unknown) => getDisplayValue(value),
  },
  {
    key: 'repair',
    title: 'Repair',
    render: () => (
      <Badge variant="destructive">Repair</Badge>
    ),
  },
  {
    key: 'created_at',
    title: 'Created',
    render: (value: unknown) => value ? formatDate(String(value)) : '-',
  },
];

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<EnrichedOrder[]>([]);
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

  const handleViewRepair = (repair: EnrichedOrder) => {
    logger.log('View repair', repair);
  };

  const handleEditRepair = (repair: EnrichedOrder) => {
    logger.log('Edit repair', repair);
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
        columns={getRepairColumns()}
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