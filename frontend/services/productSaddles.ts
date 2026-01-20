import { fetchEntities } from './api';
import { ProductSaddle } from '@/types/ProductSaddle';

export interface ProductSaddleSearchResult {
  '@context': string;
  '@id': string;
  '@type': string;
  'hydra:member': ProductSaddle[];
  'hydra:totalItems': number;
}

export async function searchProductSaddles(searchTerm: string): Promise<ProductSaddleSearchResult> {
  if (!searchTerm) {
    return {
      '@context': '',
      '@id': '',
      '@type': '',
      'hydra:member': [],
      'hydra:totalItems': 0
    };
  }

  // Use the pattern from the URL provided: products?$filter=substringof('test',serial) eq true
  // Don't double-encode the filter parameter
  const filter = `substringof('${searchTerm}',serial) eq true`;

  return await fetchEntities({
    entity: 'products',
    extraParams: {
      '$filter': filter
    },
    page: 1,
    partial: false
  }) as ProductSaddleSearchResult;
}

export async function getProductSaddleById(id: string): Promise<ProductSaddle> {
  const result = await fetchEntities({
    entity: `products/${id}`,
    page: 1,
    partial: false
  });

  return result as ProductSaddle;
}