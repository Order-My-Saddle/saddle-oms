import React from 'react';

interface TextFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const TextFilter: React.FC<TextFilterProps> = ({ value, onChange }) => (
  <input
    type="text"
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{ width: '100%' }}
    placeholder="Filter..."
  />
);
