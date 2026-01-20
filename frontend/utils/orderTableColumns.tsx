import React from 'react';
import { TableHeaderFilter } from '../components/shared/TableHeaderFilter';
import { orderStatuses } from './orderConstants';
import { StatusBadge } from '../components/shared/StatusBadge';

export type HeaderFilters = Record<string, string>;
export type SetHeaderFilters = (key: string, value: string) => void;

export function getOrderTableColumns(
  headerFilters: HeaderFilters,
  setHeaderFilters: SetHeaderFilters,
  factories: Array<{label: string, value: string}> = [],
  dynamicSeatSizes: string[] = []
) {
  return [
    {
      key: 'id',
      title: (
        <TableHeaderFilter
          title="ID"
          value={headerFilters.id || ''}
          onFilter={value => setHeaderFilters('id', value)}
          type="text"
          entityType="order"
        />
      ),
      render: (_: any, row: any) => row?.id || '-',
    },
    {
      key: 'saddleSpecifications',
      title: (
        <TableHeaderFilter
          title="SADDLE"
          value={headerFilters.saddle || ''}
          onFilter={value => setHeaderFilters('saddle', value)}
          type="text"
          entityType="order"
        />
      ),
      render: (_: any, row: any) => {
        if (row?.saddleSpecifications) {
          const specs = row.saddleSpecifications;
          const parts = [];
          if (specs.brand) parts.push(specs.brand);
          if (specs.model) parts.push(specs.model);
          if (specs.leatherType) parts.push(specs.leatherType);
          if (specs.color) parts.push(specs.color);
          return parts.join(' ') || '-';
        }
        return row?.reference || row?.saddle || '-';
      },
    },
    {
      key: 'seatSize',
      title: (
        <TableHeaderFilter
          title="SEAT SIZE"
          value={headerFilters.seatSize || ''}
          onFilter={value => setHeaderFilters('seatSize', value)}
          type="enum"
          data={dynamicSeatSizes.length > 0 
            ? dynamicSeatSizes.map(size => ({ label: size, value: size }))
            : ['17', '17.5', '18'].map(size => ({ label: size, value: size }))
          }
          entityType="order"
        />
      ),
      render: (_: any, row: any) => {
        if (!row) return '-';
        let seatSizes: string[] = [];

        // First check saddleSpecifications.seatSize from backend
        if (row.saddleSpecifications?.seatSize) {
          if (Array.isArray(row.saddleSpecifications.seatSize)) {
            seatSizes = row.saddleSpecifications.seatSize.map(String);
          } else {
            seatSizes = [String(row.saddleSpecifications.seatSize)];
          }
        }
        // Fallback to legacy fields
        else if (Array.isArray(row.seatSizes) && row.seatSizes.length > 0) {
          seatSizes = row.seatSizes.map(String);
        } else if (row.seatSize) {
          if (Array.isArray(row.seatSize)) {
            seatSizes = row.seatSize.map(String);
          } else {
            seatSizes = [String(row.seatSize)];
          }
        } else if (row.reference) {
          const match = row.reference.match(/(\d{2}(?:\.5)?)/g);
          if (match && match.length > 0) seatSizes = match;
        }

        seatSizes = Array.from(new Set(seatSizes));
        return seatSizes.length > 0 ? seatSizes.join(', ') : '-';
      },
    },
    {
      key: 'customer',
      title: (
        <TableHeaderFilter
          title="CUSTOMER"
          value={headerFilters.customer || ''}
          onFilter={value => setHeaderFilters('customer', value)}
          type="text"
          entityType="order"
        />
      ),
      render: (_: any, row: any) => {
        if (!row) return '-';
        // For enriched orders, use the direct customerName field first
        if (row.customerName && typeof row.customerName === 'string' && row.customerName.trim()) {
          return row.customerName;
        }
        // Fallback to customer object or computed field
        if (row.customer) {
          if (typeof row.customer === 'object') {
            if (row.customer.name) return row.customer.name;
            if (row.customer['@id'] && row.name) return row.name;
            return JSON.stringify(row.customer);
          }
          return String(row.customer);
        }
        if (row.name) return row.name;
        return '-';
      },
    },
    {
      key: 'date',
      title: 'DATE',
      render: (_: any, row: any) => {
        // Backend sends createdAt as the primary date field
        const dateStr = row?.createdAt || row?.orderTime || row?.date || '';
        if (!dateStr) return '-';
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return dateStr;
          return date.toISOString().split('T')[0];
        } catch {
          return dateStr;
        }
      },
    },
    {
      key: 'status',
      title: (
        <TableHeaderFilter
          title="STATUS"
          value={headerFilters.status || ''}
          onFilter={value => setHeaderFilters('status', value)}
          type="enum"
          data={orderStatuses.map(status => ({ label: status, value: status }))}
          entityType="order"
        />
      ),
      render: (_: any, row: any) => row?.status || row?.orderStatus || '-',
    },
    {
      key: 'urgent',
      title: (
        <TableHeaderFilter
          title="URGENT"
          value={headerFilters.urgent || ''}
          onFilter={value => setHeaderFilters('urgent', value)}
          type="urgent"
          entityType="order"
        />
      ),
      render: (val: any, row: any) => {
        // Backend uses isUrgent boolean field
        const urgentValue = row?.isUrgent ?? val ?? row?.urgent;
        if (urgentValue === null || urgentValue === undefined || urgentValue === '') return 'No';
        if (urgentValue === true || urgentValue === 'true' || urgentValue === 'Yes') return 'Yes';
        if (urgentValue === false || urgentValue === 'false' || urgentValue === 'No') return 'No';
        return typeof urgentValue === 'boolean' ? (urgentValue ? 'Yes' : 'No') : String(urgentValue);
      },
    },
    {
      key: 'fitter',
      title: (
        <TableHeaderFilter
          title="FITTER"
          value={headerFilters.fitter || ''}
          onFilter={value => setHeaderFilters('fitter', value)}
          type="text"
          entityType="order"
        />
      ),
      render: (_: any, row: any) => {
        if (!row) return '-';
        // For enriched orders, use the direct fitterName field first
        if (row.fitterName && typeof row.fitterName === 'string' && row.fitterName.trim()) {
          return row.fitterName;
        }
        // Fallback to fitter object or computed field
        if (row.fitter) {
          if (typeof row.fitter === 'object') {
            if (row.fitter.name) return row.fitter.name;
            return JSON.stringify(row.fitter);
          }
          return String(row.fitter);
        }
        if (row.name) return row.name;
        return '-';
      },
    },
    {
      key: 'factory',
      title: (
        <TableHeaderFilter
          title="FACTORY"
          value={headerFilters.factory || ''}
          onFilter={value => setHeaderFilters('factory', value)}
          type="enum"
          data={factories}
          entityType="order"
        />
      ),
      render: (_: any, row: any) => {
        if (!row) return '-';
        // For enriched orders, use the direct factoryName field first
        if (row.factoryName && typeof row.factoryName === 'string' && row.factoryName.trim()) {
          return row.factoryName;
        }
        // Fallback to supplierName for backwards compatibility
        if (row.supplierName && typeof row.supplierName === 'string' && row.supplierName.trim()) {
          return row.supplierName;
        }
        // Fallback to factory/supplier object or computed field
        if (row.factory) {
          if (typeof row.factory === 'object') {
            if (row.factory.name) return row.factory.name;
            return JSON.stringify(row.factory);
          }
          return String(row.factory);
        }
        if (row.supplier) {
          if (typeof row.supplier === 'object') {
            if (row.supplier.name) return row.supplier.name;
            return JSON.stringify(row.supplier);
          }
          return String(row.supplier);
        }
        return '-';
      },
    },
  ];
}
