// Service for fetching orders data
import { getEnrichedOrders } from './enrichedOrders';

// Accept filters and pass to getEnrichedOrders
export async function getOrders(params: { page?: number; partial?: boolean; filters?: Record<string, string> } = {}) {
  return getEnrichedOrders(params);
}
