export interface ProductSaddle {
  id: number;
  serial: string;
  name: string;
  specialNotes?: string;
  stock: number;
  model: string | { name?: string; [key: string]: any };
  preset?: string;
  leatherType: string | { name?: string; [key: string]: any };
  demo: boolean;
  customizableProduct: boolean;
  productHasBeenOrdered: boolean;
  sponsored: boolean;
  createdAt: string;
  optionItems?: OptionItem[];
  [key: string]: any;
}

export interface OptionItem {
  name: string;
  value: string | number;
}