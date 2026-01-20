// Shared constants for Orders/Reports/Dashboard

export const seatSizes = ['17', '17.5', '18'];

// Order status values from backend enum
export const orderStatuses = [
  'pending',
  'UNORDERED',
  'AWAITING_CLIENT_CONFIRMATION',
  'ORDERED',
  'APPROVED',
  'IN_PRODUCTION_P1',
  'IN_PRODUCTION_P2',
  'IN_PRODUCTION_P3',
  'SHIPPED_TO_STOCK_OWNER',
  'SHIPPED_TO_CUSTOMER',
  'ON_HOLD',
  'ON_TRIAL',
  'CHANGED',
  'COMPLETED_SALE'
];

// Legacy statuses for compatibility
export const statuses = ['Ordered', 'In Production P1', 'Approved'];
