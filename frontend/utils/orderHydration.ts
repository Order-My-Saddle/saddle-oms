export function renderEntity(entity: any, type: 'customer' | 'factory' | 'fitter') {
  if (!entity) return `Unknown ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  if (typeof entity === 'object') {
    if (typeof entity.name === 'string' && entity.name.trim()) return entity.name;
    return `Unknown ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  }
  if (typeof entity === 'string') {
    if (entity.startsWith(`/customers/`)) return 'Unknown Customer';
    if (entity.startsWith(`/factories/`)) return 'Unknown Factory';
    if (entity.startsWith(`/fitters/`)) return 'Unknown Fitter';
    return entity;
  }
  if (typeof entity === 'number') {
    return `Unknown ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  }
  return String(entity);
}

export function getFitterName(order: any) {
  // For enriched orders, use the direct fitterName field first
  if (order.fitterName && typeof order.fitterName === 'string' && order.fitterName.trim()) {
    return order.fitterName;
  }
  // Fallback to nested object or other formats
  return renderEntity(order.fitter, 'fitter');
}

export function getCustomerName(order: any) {
  // For enriched orders, use the direct customerName field first
  if (order.customerName && typeof order.customerName === 'string' && order.customerName.trim()) {
    return order.customerName;
  }
  // Fallback to nested object or other formats
  return renderEntity(order.customer, 'customer');
}

export function getFactoryName(order: any) {
  // For enriched orders, use the direct factoryName field first
  if (order.factoryName && typeof order.factoryName === 'string' && order.factoryName.trim()) {
    return order.factoryName;
  }
  // Fallback to supplierName for backwards compatibility
  if (order.supplierName && typeof order.supplierName === 'string' && order.supplierName.trim()) {
    return order.supplierName;
  }
  // Fallback to nested object or other formats
  return renderEntity(order.factory || order.supplier, 'factory');
}
export function getSeatSize(order: any) {
  const ref = order.reference || '';
  const match = ref.match(/(\d{2}(?:\.5)?)/);
  return match ? match[0] : '';
}
export function getStatus(order: any) {
  return order.orderStatus;
}
export function getUrgent(order: any) {
  return order.urgent === true ? 'true' : order.urgent === false ? 'false' : '';
}
export function getDate(order: any) {
  return order.orderTime || order.createdAt || '';
}
