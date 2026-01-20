import React from 'react';

interface NumberFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const NumberFilter: React.FC<NumberFilterProps> = ({ value, onChange }) => (
  <input
    type="number"
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{ width: '100%' }}
    placeholder="Filter..."
  />
);
