import { fetchEntities } from './api';
import { OrderProductSaddle } from '@/types/OrderProductSaddle';
import { EnrichedOrder } from '@/types/EnrichedOrder';

export interface OrderProductSaddleSearchResult {
  '@context': string;
  '@id': string;
  '@type': string;
  'hydra:member': OrderProductSaddle[];
  'hydra:totalItems': number;
}

export interface RepairsSearchResult {
  '@context': string;
  '@id': string;
  '@type': string;
  'hydra:member': EnrichedOrder[];
  'hydra:totalItems': number;
}

export async function fetchRepairs({
  page = 1,
  partial = false,
  orderBy = 'id',
  order = 'desc' as const
} = {}): Promise<RepairsSearchResult> {
  return await fetchEntities({
    entity: 'enriched_orders',
    extraParams: {
      repair: 'true',
    },
    orderBy,
    order,
    page,
    partial
  }) as RepairsSearchResult;
}

export async function getOrderProductSaddleById(id: string): Promise<OrderProductSaddle> {
  const result = await fetchEntities({
    entity: `order_product_saddles/${id}`,
    page: 1,
    partial: false
  });

  return result as OrderProductSaddle;
}