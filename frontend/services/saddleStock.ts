import { fetchEntities } from './api';
import { SaddleStock, SaddleStockSearchResult } from '@/types/SaddleStock';

const ADMIN_STOCK_OWNER_GUID = '1548921a-b7ed-48cf-a11d-4b6480b12557';

export async function fetchAvailableSaddleStock({
  page = 1,
  partial = false,
  orderBy = 'productId',
  order = 'desc'
} = {}): Promise<SaddleStockSearchResult> {
  const filter = `(stock gt 0) and (stockOwner/id ne guid'${ADMIN_STOCK_OWNER_GUID}')`;

  return await fetchEntities({
    entity: 'products',
    extraParams: {
      '$filter': filter,
      '$orderby': `${orderBy} ${order}`
    },
    page,
    partial
  }) as SaddleStockSearchResult;
}

export async function fetchMySaddleStock({
  page = 1,
  partial = false,
  orderBy = 'productId',
  order = 'desc'
} = {}): Promise<SaddleStockSearchResult> {
  const filter = `(stock gt 0) and (stockOwner/id eq guid'${ADMIN_STOCK_OWNER_GUID}')`;

  return await fetchEntities({
    entity: 'products',
    extraParams: {
      '$filter': filter,
      '$orderby': `${orderBy} ${order}`
    },
    page,
    partial
  }) as SaddleStockSearchResult;
}

export async function getSaddleStockById(id: string): Promise<SaddleStock> {
  const result = await fetchEntities({
    entity: `products/${id}`,
    page: 1,
    partial: false
  });

  return result as SaddleStock;
}