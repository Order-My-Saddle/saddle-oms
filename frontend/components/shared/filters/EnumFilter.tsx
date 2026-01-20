import React from 'react';

export interface EnumOption {
  label: string;
  value: string;
}

interface EnumFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: EnumOption[];
}

export const EnumFilter: React.FC<EnumFilterProps> = ({ value, onChange, options }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%' }}>
    <option value="">All</option>
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);
