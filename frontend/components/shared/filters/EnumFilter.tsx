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

export const EnumFilter: React.FC<EnumFilterProps> = ({ value, onChange, options }) => {
  // Ensure value is always a string (never undefined/null)
  const currentValue = value ?? '';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    // Always call onChange, even with empty string for "All"
    onChange(newValue);
  };

  return (
    <select
      value={currentValue}
      onChange={handleChange}
      style={{ width: '100%' }}
      className="w-full p-2 border rounded-md bg-background"
    >
      <option value="">All</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
};
