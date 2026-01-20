// Fix: Make this file a valid module and add types for props
"use client";

import React from 'react';

export interface DateRangePickerProps {
  fromDate: Date | undefined;
  setFromDate: (date: Date | undefined) => void;
  toDate: Date | undefined;
  setToDate: (date: Date | undefined) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ fromDate, setFromDate, toDate, setToDate, className = '' }) => {
  return (
    <div className={`flex flex-row items-center gap-2 ${className}`}>
      {/* Date from */}
      <div className="flex items-center border rounded bg-white px-2 mr-2" style={{ height: 32 }}>
        <svg width="16" height="16" fill="currentColor" className="text-gray-500 mr-1" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 3v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1zm2-1v1h10V2H3z"/></svg>
        <input
          type="text"
          className="outline-none bg-transparent text-sm"
          placeholder="Date from"
          value={fromDate ? fromDate.toLocaleDateString() : ''}
          onFocus={e => e.target.type = 'date'}
          onBlur={e => e.target.type = 'text'}
          onChange={e => setFromDate(e.target.value ? new Date(e.target.value) : undefined)}
          style={{ width: 110 }}
        />
      </div>
      {/* Date to */}
      <div className="flex items-center border rounded bg-white px-2 mr-2" style={{ height: 32 }}>
        <svg width="16" height="16" fill="currentColor" className="text-gray-500 mr-1" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 3v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1zm2-1v1h10V2H3z"/></svg>
        <input
          type="text"
          className="outline-none bg-transparent text-sm"
          placeholder="to"
          value={toDate ? toDate.toLocaleDateString() : ''}
          onFocus={e => e.target.type = 'date'}
          onBlur={e => e.target.type = 'text'}
          onChange={e => setToDate(e.target.value ? new Date(e.target.value) : undefined)}
          style={{ width: 110 }}
        />
      </div>
    </div>
  );
};