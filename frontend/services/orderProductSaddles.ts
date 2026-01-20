import { fetchEntities } from './api';
import { OrderProductSaddle } from '@/types/OrderProductSaddle';

export interface OrderProductSaddleSearchResult {
  '@context': string;
  '@id': string;
  '@type': string;
  'hydra:member': OrderProductSaddle[];
  'hydra:totalItems': number;
}

export async function fetchRepairs({
  page = 1,
  partial = false,
  orderBy = 'orderId',
  order = 'desc'
} = {}): Promise<OrderProductSaddleSearchResult> {
  const filter = 'legacyRepair eq true';

  return await fetchEntities({
    entity: 'order_product_saddles',
    extraParams: {
      '$filter': filter,
      '$orderby': `${orderBy} ${order}`
    },
    page,
    partial
  }) as OrderProductSaddleSearchResult;
}

export async function getOrderProductSaddleById(id: string): Promise<OrderProductSaddle> {
  const result = await fetchEntities({
    entity: `order_product_saddles/${id}`,
    page: 1,
    partial: false
  });

  return result as OrderProductSaddle;
}