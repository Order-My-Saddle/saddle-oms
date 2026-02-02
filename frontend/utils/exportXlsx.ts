import * as XLSX from 'xlsx';
import { extractSeatSizes } from './orderProcessing';
import { getCustomerName, getFitterName, getDate, getStatus } from './orderHydration';

function formatExportDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = String(d.getFullYear()).slice(-2);
  return `${month} ${day}, '${year}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportToXlsx(orders: any[]): void {
  const rows = orders.map(order => {
    const brand = order.brand_name || order.brandName || '';
    const model = order.model_name || order.modelName || '';
    const saddle = [brand, model].filter(Boolean).join(' - ');

    return {
      'ID': order.orderId || order.id || '',
      'Brand': brand,
      'Saddle': saddle,
      'Seat Size': extractSeatSizes(order),
      'Customer': getCustomerName(order),
      'Fitter': getFitterName(order),
      'Date': formatExportDate(getDate(order)),
      'Payment': order.paymentStatus || order.payment_status || '',
      'Status': getStatus(order) || '',
      'Options': (() => {
        const opts = order.options || order.order_options || [];
        if (Array.isArray(opts)) {
          return opts.map((o: any) => (typeof o === 'string' ? o : o?.name || o?.label || '')).filter(Boolean).join(', ');
        }
        return '';
      })(),
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Auto-size columns
  const colKeys = Object.keys(rows[0] || {});
  ws['!cols'] = colKeys.map(key => {
    const maxLen = Math.max(
      key.length,
      ...rows.map(r => String((r as Record<string, string>)[key] || '').length)
    );
    return { wch: Math.min(maxLen + 2, 40) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `report-${today}.xlsx`);
}
