// Service for fetching dashboard data
import { fetchOrderStatusStats } from './api';

export async function getOrderStatusStats() {
  return fetchOrderStatusStats();
}
