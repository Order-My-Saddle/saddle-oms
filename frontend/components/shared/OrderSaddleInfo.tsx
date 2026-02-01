import React from 'react';

interface OrderSaddleInfoProps {
  saddle: Record<string, React.ReactNode>;
}

export function OrderSaddleInfo({ saddle }: OrderSaddleInfoProps) {
  return (
    <div>
      <h3 className="font-semibold text-[#8B0000] text-xs">Saddle information</h3>
      <div className="border-t mt-2 pt-3 space-y-1">
        <div className="flex flex-row gap-6 text-xs">
          <div className="flex flex-col gap-0">
            <div className="flex items-center font-medium text-gray-600 min-w-[120px]">Model:</div>
            <div className="flex items-center font-medium text-gray-600 min-w-[120px]">Leather type:</div>
          </div>
          <div className="flex flex-col gap-0">
            <div className="flex items-center text-gray-900 font-normal">{saddle.model}</div>
            <div className="flex items-center text-gray-900 font-normal">{saddle.leatherType}</div>
          </div>
        </div>
        <div className="text-xs font-medium text-[#8B0000] mt-4">Options</div>
        <div className="border-t mt-2 pt-3">
          {Object.entries(saddle).slice(2).map(([key, value]) => (
            <div key={key} className="flex flex-row gap-6 text-xs mb-1">
              <div className="flex items-center font-medium text-gray-600 min-w-[120px] capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </div>
              <div className="flex items-center text-gray-900 font-normal">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
