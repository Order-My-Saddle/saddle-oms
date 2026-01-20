import React from 'react';

interface DateRangeFilterProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ from, to, onChange }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    <input
      type="date"
      value={from}
      onChange={e => onChange(e.target.value, to)}
      style={{ width: '50%' }}
      placeholder="From"
    />
    <input
      type="date"
      value={to}
      onChange={e => onChange(from, e.target.value)}
      style={{ width: '50%' }}
      placeholder="To"
    />
  </div>
);
