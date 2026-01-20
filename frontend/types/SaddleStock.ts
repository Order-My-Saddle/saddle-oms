export interface SaddleStock {
  id: number;
  serial: string;
  name: string;
  stock: number;
  stockOwner?: {
    id: string;
    name?: string;
    [key: string]: any;
  };
  model: string | { name?: string; [key: string]: any };
  leatherType?: string | { name?: string; [key: string]: any };
  preset?: string;
  demo: boolean;
  customizableProduct: boolean;
  productHasBeenOrdered: boolean;
  sponsored: boolean;
  createdAt: string;
  optionItems?: Array<{
    name: string;
    value: string | number;
  }>;
  [key: string]: any;
}

export interface SaddleStockSearchResult {
  '@context': string;
  '@id': string;
  '@type': string;
  'hydra:member': SaddleStock[];
  'hydra:totalItems': number;
}