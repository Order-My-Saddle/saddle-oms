import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

export interface TableHeaderFilterBaseProps {
  title: string;
  type?: 'text' | 'number' | 'date-range';
  value: string;
  onFilter: (value: string) => void;
  inputClassName?: string;
  inputStyle?: React.CSSProperties;
  showApplyClear?: boolean;
}

export function TableHeaderFilterBase({
  title,
  type = 'text',
  value,
  onFilter,
  inputClassName = 'h-7 text-xs',
  inputStyle = { minWidth: 0, width: 90 },
  showApplyClear = true,
}: TableHeaderFilterBaseProps) {
  const [filterValue, setFilterValue] = useState(value || '');

  const handleApply = () => {
    onFilter(filterValue);
  };

  const handleClear = () => {
    setFilterValue('');
    onFilter('');
  };

  return (
    <div className="flex flex-row gap-1 items-center mt-1">
      <Input
        type={type === 'number' ? 'number' : 'text'}
        placeholder={`Filter ${title}`}
        value={filterValue}
        onChange={e => setFilterValue(e.target.value)}
        className={inputClassName}
        style={inputStyle}
      />
      {showApplyClear && (
        <>
          <button
            type="button"
            className="text-xs px-1 text-gray-500 hover:text-red-700"
            onClick={handleClear}
            title="Clear filter"
          >
            ×
          </button>
          <button
            type="button"
            className="text-xs px-1 text-gray-500 hover:text-green-700"
            onClick={handleApply}
            title="Apply filter"
          >
            ✓
          </button>
        </>
      )}
    </div>
  );
}
