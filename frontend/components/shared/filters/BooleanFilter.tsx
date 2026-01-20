import React from 'react';

interface BooleanFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const BooleanFilter: React.FC<BooleanFilterProps> = ({ value, onChange }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%' }}>
    <option value="">All</option>
    <option value="true">Yes</option>
    <option value="false">No</option>
  </select>
);
