// Shared order processing utilities
import { fetchEntities } from '@/services/api';
import { orderFilterSchema, validateData, sanitizeObject } from '@/schemas/validation';

// Type definitions for order processing
export interface OrderTableRow {
  id: number;
  reference: string;
  seatSize: string;
  customer: string;
  fitter: string;
  factory: string;
  orderStatus: string;
  orderTime: string;
  createdAt: string;
  status: string;
  urgent: boolean;
  seatSizes?: string[];
  name?: string;
  isUrgent?: boolean;
}

export interface HeaderFilters {
  [key: string]: string;
}

// Helper functions from Dashboard and Orders components
export function getCustomerName(order: any): string {
  if (order.customerName) return order.customerName;
  if (order.customer) {
    if (typeof order.customer === 'string') return order.customer;
    if (order.customer.name) return order.customer.name;
    if (order.customer.firstName && order.customer.lastName) {
      return `${order.customer.firstName} ${order.customer.lastName}`;
    }
  }
  return '';
}

export function getFitterName(order: any): string {
  if (order.fitterName) return order.fitterName;
  if (order.fitter) {
    if (typeof order.fitter === 'string') return order.fitter;
    if (order.fitter.name) return order.fitter.name;
    if (order.fitter.firstName && order.fitter.lastName) {
      return `${order.fitter.firstName} ${order.fitter.lastName}`;
    }
  }
  return '';
}

export function getSupplierName(order: any): string {
  if (order.supplierName) return order.supplierName;
  if (order.supplier) {
    if (typeof order.supplier === 'string') return order.supplier;
    if (order.supplier.name) return order.supplier.name;
    if (order.supplier.firstName && order.supplier.lastName) {
      return `${order.supplier.firstName} ${order.supplier.lastName}`;
    }
  }
  return '';
}

// Build comprehensive filters from headerFilters with validation
export function buildOrderFilters(headerFilters: HeaderFilters): Record<string, any> {
  // Sanitize the input first
  const sanitizedFilters = sanitizeObject(headerFilters);
  
  // Validate the filters
  const validation = validateData(orderFilterSchema, sanitizedFilters);
  if (!validation.success) {
    console.warn('Invalid order filters:', validation.errors);
    return {}; // Return empty filters if validation fails
  }
  
  const validFilters = validation.data;
  const filters: Record<string, any> = {};
  
  Object.keys(validFilters).forEach(key => {
    const value = validFilters[key];
    if (value && value !== '') {
      // Map frontend filter keys to API keys if needed
      if (key === 'orderId') {
        filters.orderId = value;
      } else if (key === 'reference') {
        filters.reference = value;
      } else if (key === 'customer') {
        filters.customerName = value;
      } else if (key === 'status') {
        filters.orderStatus = value;
      } else if (key === 'fitter') {
        filters.fitterName = value;
      } else if (key === 'supplier') {
        filters.supplierName = value;
      } else if (key === 'urgent') {
        // Convert string boolean to actual boolean for API Platform BooleanFilter
        if (value === 'true') {
          filters.urgent = true;
        } else if (value === 'false') {
          filters.urgent = false;
        }
        // Don't set filter if empty/undefined to show all records
      } else if (key === 'seatSize') {
        filters.seatSizes = value;
      }
    }
  });
  
  return filters;
}

// Extract seat sizes from order reference
export function extractSeatSizes(order: any): string {
  if (!order) return '';
  
  // Check for seatSizes array first (from hydra response)
  if (Array.isArray(order.seatSizes) && order.seatSizes.length > 0) {
    return order.seatSizes.join(', ');
  }
  
  // Extract from reference if available
  if (order.reference) {
    const match = order.reference.match(/(\d{2}(?:\.5)?)/g);
    if (match && match.length > 0) {
      return match.join(', ');
    }
  }
  
  // Fallback to seatSize property
  if (order.seatSize) {
    if (Array.isArray(order.seatSize)) {
      return order.seatSize.join(', ');
    }
    return String(order.seatSize);
  }
  
  return '';
}

// Extract unique seat sizes from orders array
export function extractDynamicSeatSizes(orders: any[]): string[] {
  const sizes = new Set<string>();
  
  orders.forEach(order => {
    if (Array.isArray(order.seatSizes)) {
      order.seatSizes.forEach((size: any) => sizes.add(String(size)));
    } else if (order.seatSize) {
      sizes.add(String(order.seatSize));
    } else if (order.reference) {
      const match = order.reference.match(/(\d{2}(?:\.5)?)/g);
      if (match) match.forEach((size: string) => sizes.add(size));
    }
  });
  
  return Array.from(sizes).sort();
}

// Process orders for Dashboard display
export function processDashboardOrders(data: any): any[] {
  return (data['hydra:member'] || []).map((order: any) => {
    // Extract and normalize data from the hydra response
    const processedOrder = {
      ...order, // Keep all original API data
      // Add computed fields for compatibility, but don't override existing data
      id: Number(order.id) || 0,
      saddle: order.reference || '',
      date: order.orderTime || order.createdAt || '',
      status: order.orderStatus || order.status || '',
      orderStatus: order.orderStatus || order.status || '',
      orderTime: order.orderTime || order.createdAt || '',
      isUrgent: order.urgent || false,
      // Extract seat sizes from reference or seatSizes array if not already present
      seatSize: order.seatSizes ?
        (Array.isArray(order.seatSizes) ? order.seatSizes.join(', ') : order.seatSizes) :
        extractSeatSizes(order),
      // Only add computed names if the direct fields aren't available
      ...(order.customerName ? {} : { customer: getCustomerName(order) || '' }),
      ...(order.fitterName ? {} : { fitter: getFitterName(order) || '' }),
      ...(order.factoryName || order.supplierName ? {} : { factory: getSupplierName(order) || '' })
    };
    return processedOrder;
  });
}

// Process orders for Orders table display
export function processOrdersTableData(orders: any[]): OrderTableRow[] {
  return (orders || []).map((order: any): OrderTableRow => {
    // Get the customer, fitter, and factory names
    const customerName = getCustomerName(order) || '';
    const fitterName = getFitterName(order) || '';
    const factoryName = getSupplierName(order) || '';

    // Ensure all required fields are present and correctly typed
    return {
      id: Number(order.id) || 0,
      reference: order.reference || '',
      seatSize: order.seatSize || '',
      customer: typeof customerName === 'string' ? customerName : '',
      fitter: typeof fitterName === 'string' ? fitterName : '',
      factory: typeof factoryName === 'string' ? factoryName : '',
      orderStatus: order.orderStatus || '',
      orderTime: order.orderTime || order.createdAt || '',
      createdAt: order.createdAt || '',
      status: order.orderStatus || 'pending',
      urgent: Boolean(order.urgent),
      // Include any additional fields that might be needed
      ...(order.seatSizes && { seatSizes: Array.isArray(order.seatSizes) ? order.seatSizes.map(String) : [] }),
      ...(order.name && { name: order.name }),
      ...(order.isUrgent !== undefined && { isUrgent: Boolean(order.isUrgent) })
    };
  });
}

// Process supplier data for dropdown options
export function processSupplierData(suppliersData: any[]): Array<{label: string, value: string}> {
  return suppliersData.map((supplier: any) => ({
    label: supplier.name || supplier.username || 'Unknown Supplier',
    value: supplier.name || supplier.username || supplier.id
  }));
}

// Fetch complete order data by INTEGER ID
export async function fetchCompleteOrderData(
  order: any,
  setIsLoadingOrderData: (loading: boolean) => void,
  setOrderDataError: (error: string | null) => void
): Promise<any> {
  setIsLoadingOrderData(true);
  setOrderDataError(null);

  try {
    const orderId = Number(order.id) || 0;
    console.log('Fetching complete order data for ID:', orderId);

    if (!orderId) {
      throw new Error('Invalid order ID');
    }

    const result = await fetchEntities({
      entity: 'enriched_orders',
      extraParams: { id: orderId },
      partial: false
    });

    if (result['hydra:member'] && result['hydra:member'].length > 0) {
      console.log('Successfully fetched order:', orderId);
      return result['hydra:member'][0];
    }

    throw new Error(`Order not found with ID: ${orderId}`);

  } catch (error) {
    console.error('Error fetching complete order data:', error);
    setOrderDataError(error instanceof Error ? error.message : 'Failed to load order data');

    // Return the original order data as fallback
    console.log('Falling back to table row data');
    return order;
  } finally {
    setIsLoadingOrderData(false);
  }
}