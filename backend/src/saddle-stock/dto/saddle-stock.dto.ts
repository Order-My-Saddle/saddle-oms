export class SaddleStockDto {
  id: number;
  serial: string;
  name: string;
  stock: number;
  stockOwner?: { id: number; name: string };
  model: { name: string };
  leatherType?: { name: string };
  demo: boolean;
  customizableProduct: boolean;
  productHasBeenOrdered: boolean;
  sponsored: boolean;
  createdAt: string;
}
