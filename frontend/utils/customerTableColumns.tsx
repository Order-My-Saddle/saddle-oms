import React from 'react';
import { TableHeaderFilter } from '../components/shared/TableHeaderFilter';

export type CustomerHeaderFilters = Record<string, string>;
export type SetCustomerHeaderFilters = (key: string, value: string) => void;
export type CustomerFilterChangeHandler = (key: string, value: string) => void;

export function getCustomerTableColumns(headerFilters: CustomerHeaderFilters, setHeaderFilters: SetCustomerHeaderFilters) {
  return [
    {
      key: 'id',
      title: (
        <TableHeaderFilter
          title="ID"
          value={headerFilters.id || ''}
          onFilter={value => setHeaderFilters('id', value)}
          type="text"
          entityType="customer"
        />
      ),
      render: (v: any) => v ?? '',
      maxWidth: '200px',
    },
    {
      key: 'fitter',
      title: (
        <TableHeaderFilter
          title="FITTER"
          value={headerFilters.fitter || ''}
          onFilter={value => setHeaderFilters('fitter', value)}
          type="text"
          entityType="customer"
        />
      ),
      render: (v: any, row: any) => {
        // Show fitter name from the customer's fitter relationship
        if (!row || !row.fitter) return '';
        // Handle fitter references ($ref) vs full objects
        if (row.fitter.$ref) return '—';
        return row.fitter.name || '';
      },
      maxWidth: '180px',
    },
    {
      key: 'name',
      title: (
        <TableHeaderFilter
          title="NAME"
          value={headerFilters.name || ''}
          onFilter={value => setHeaderFilters('name', value)}
          type="text"
          entityType="customer"
        />
      ),
      render: (v: any, row: any) => {
        // Ensure we always show the customer's name, never "Loading..."
        if (row && row.name) return row.name;
        return v ?? '';
      },
      maxWidth: '200px',
    },
    {
      key: 'country',
      title: (
        <TableHeaderFilter
          title="COUNTRY"
          value={headerFilters.country || ''}
          onFilter={value => setHeaderFilters('country', value)}
          type="text"
          entityType="customer"
        />
      ),
      render: (v: any) => v ?? '',
    },
    {
      key: 'city',
      title: (
        <TableHeaderFilter
          title="CITY"
          value={headerFilters.city || ''}
          onFilter={value => setHeaderFilters('city', value)}
          type="text"
          entityType="customer"
        />
      ),
      render: (v: any) => v ?? '',
    },
    {
      key: 'email',
      title: (
        <TableHeaderFilter
          title="EMAIL"
          value={headerFilters.email || ''}
          onFilter={value => setHeaderFilters('email', value)}
          type="text"
          entityType="customer"
        />
      ),
      render: (v: any) => v ?? '',
    },
  ];
}
