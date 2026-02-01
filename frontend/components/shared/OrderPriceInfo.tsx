import React from 'react';

interface OrderPriceInfoProps {
  price: Record<string, number | string | React.ReactNode> & { total: number };
  formatCurrency: (amount: number) => string;
}

export function OrderPriceInfo({ price, formatCurrency }: OrderPriceInfoProps) {
  return (
    <div>
      <h3 className="font-semibold text-[#8B0000] text-xs">Price</h3>
      <div className="border-t mt-2 pt-3">
        {Object.entries(price).slice(0, -1).map(([key, value]) => (
          <div key={key} className="flex flex-row gap-6 text-xs mb-1">
            <div className="flex items-center font-medium text-gray-600 min-w-[110px] capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}:
            </div>
            <div className="flex items-center text-gray-900 font-normal">{typeof value === 'number' ? formatCurrency(value) : value}</div>
          </div>
        ))}
        <div className="text-[10px] text-gray-500 mt-1">
          Shippingcosts and Taxes will be determined by Custom Saddlery.
        </div>
        <div className="border-t mt-2 pt-2">
          <div className="flex flex-row gap-6 text-xs">
            <div className="flex items-center font-medium text-gray-600 min-w-[110px]">Total:</div>
            <div className="flex items-center text-gray-900 font-semibold">{formatCurrency(price.total)}</div>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">
            Your deposit is non-refundable if your order is canceled.
          </div>
        </div>
      </div>
    </div>
  );
}
