import React from 'react';

interface BooleanFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const BooleanFilter: React.FC<BooleanFilterProps> = ({ value, onChange }) => {
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
      <option value="true">Yes</option>
      <option value="false">No</option>
    </select>
  );
};
