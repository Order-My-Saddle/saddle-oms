import React from 'react';

interface OrderFitterInfoProps {
  fitter: Record<string, React.ReactNode>;
}

export function OrderFitterInfo({ fitter }: OrderFitterInfoProps) {
  return (
    <div>
      <h3 className="font-semibold text-[#8B0000] text-xs">Fitter information</h3>
      <div className="border-t mt-2 pt-3">
        {Object.entries(fitter).map(([key, value]) => (
          <div key={key} className="flex flex-row gap-6 text-xs mb-1">
            <div className="flex items-center font-medium text-gray-600 min-w-[110px] capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}:
            </div>
            <div className={`flex items-center ${key === 'email' ? 'text-[#8B0000]' : 'text-gray-900'} font-normal`}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
