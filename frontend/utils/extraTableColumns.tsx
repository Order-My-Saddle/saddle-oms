import { TableHeaderFilter } from '../components/shared/TableHeaderFilter';

export type ExtraHeaderFilters = {
  id?: string;
  name?: string;
  sequence?: string;
  active?: string;
  description?: string;
};

export type SetExtraHeaderFilters = (key: keyof ExtraHeaderFilters, value: string) => void;

const formatPrice = (v: any, symbol: string) => {
  const numValue = typeof v === 'number' ? v : parseFloat(v);
  return !isNaN(numValue) ? `${symbol} ${numValue.toFixed(2)}` : `${symbol} 0.00`;
};

export function getExtraTableColumns(headerFilters: ExtraHeaderFilters, setHeaderFilters: SetExtraHeaderFilters) {
  return [
    {
      key: 'name',
      title: (
        <TableHeaderFilter
          title="EXTRA"
          value={headerFilters.name || ''}
          onFilter={value => setHeaderFilters('name', value)}
          type="text"
          entityType="extra"
        />
      ),
      render: (v: any) => v ?? '',
      maxWidth: '200px',
    },
    {
      key: 'price1',
      title: 'USD',
      render: (v: any) => formatPrice(v, '$'),
      maxWidth: '100px',
    },
    {
      key: 'price2',
      title: 'EUR',
      render: (v: any) => formatPrice(v, '€'),
      maxWidth: '100px',
    },
    {
      key: 'price3',
      title: 'GBP',
      render: (v: any) => formatPrice(v, '£'),
      maxWidth: '100px',
    },
    {
      key: 'price4',
      title: 'CAD',
      render: (v: any) => formatPrice(v, 'C$'),
      maxWidth: '100px',
    },
    {
      key: 'price5',
      title: 'AUD',
      render: (v: any) => formatPrice(v, 'A$'),
      maxWidth: '100px',
    },
    {
      key: 'price6',
      title: 'NOK',
      render: (v: any) => formatPrice(v, 'N€'),
      maxWidth: '100px',
    },
    {
      key: 'price7',
      title: 'DKK',
      render: (v: any) => formatPrice(v, 'D€'),
      maxWidth: '100px',
    },
    {
      key: 'options',
      title: 'OPTIONS',
      render: () => null,
      maxWidth: '150px',
    }
  ];
}
