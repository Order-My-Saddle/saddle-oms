import React from 'react';

interface OrderOptionsProps {
  options: Record<string, any>;
}

export function OrderOptions({ options }: OrderOptionsProps) {
  return (
    <div className="text-xs font-medium text-[#8B0000] mt-4">Options
      <div className="border-t mt-2 pt-3">
        {Object.entries(options).map(([key, value]) => (
          <div key={key} className="flex flex-row gap-6 text-xs mb-1">
            <div className="flex items-center font-medium text-gray-600 min-w-[120px] capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}:
            </div>
            <div className="flex items-center text-gray-900 font-normal">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
