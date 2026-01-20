import { TableHeaderFilter } from '../components/shared/TableHeaderFilter';

export type ExtraHeaderFilters = {
  id?: string;
  name?: string;
  sequence?: string;
  active?: string;
  price?: string;
  description?: string;
};

export type SetExtraHeaderFilters = (key: keyof ExtraHeaderFilters, value: string) => void;

export function getExtraTableColumns(headerFilters: ExtraHeaderFilters, setHeaderFilters: SetExtraHeaderFilters) {
  return [
    {
      key: 'id',
      title: (
        <TableHeaderFilter
          title="ID"
          value={headerFilters.id || ''}
          onFilter={value => setHeaderFilters('id', value)}
          type="text"
          entityType="extra"
        />
      ),
      render: (v: any) => v ?? '',
      maxWidth: '100px',
    },
    {
      key: 'sequence',
      title: (
        <TableHeaderFilter
          title="SEQUENCE"
          value={headerFilters.sequence || ''}
          onFilter={value => setHeaderFilters('sequence', value)}
          type="text"
          entityType="extra"
        />
      ),
      render: (v: any) => v ?? '',
      maxWidth: '120px',
    },
    {
      key: 'name',
      title: (
        <TableHeaderFilter
          title="NAME"
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
      key: 'active',
      title: (
        <TableHeaderFilter
          title="ACTIVE"
          value={headerFilters.active || ''}
          onFilter={value => setHeaderFilters('active', value)}
          type="select"
          entityType="extra"
          options={[
            { value: '', label: 'All' },
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' }
          ]}
        />
      ),
      render: (v: any) => v ? 'Yes' : 'No',
      maxWidth: '100px',
    },
    {
      key: 'price',
      title: (
        <TableHeaderFilter
          title="PRICE"
          value={headerFilters.price || ''}
          onFilter={value => setHeaderFilters('price', value)}
          type="text"
          entityType="extra"
        />
      ),
      render: (v: any) => {
        const numValue = parseFloat(v);
        return !isNaN(numValue) ? `€${numValue.toFixed(2)}` : (v ?? '');
      },
      maxWidth: '120px',
    },
    {
      key: 'description',
      title: (
        <TableHeaderFilter
          title="DESCRIPTION"
          value={headerFilters.description || ''}
          onFilter={value => setHeaderFilters('description', value)}
          type="text"
          entityType="extra"
        />
      ),
      render: (v: any) => v ?? '',
      maxWidth: '300px',
    },
    {
      key: 'options',
      title: 'OPTIONS',
      render: () => (
        <div className="flex space-x-2">
          <button className="btn-primary-sm">Edit</button>
          <button className="btn-primary-sm">Delete</button>
        </div>
      ),
      maxWidth: '150px',
    }
  ];
}