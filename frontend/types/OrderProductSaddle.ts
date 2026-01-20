export interface OrderProductSaddle {
  id: number;
  orderId: number;
  legacyRepair: boolean;
  productSaddle?: {
    id: number;
    serial: string;
    name: string;
    model: string | { name?: string; [key: string]: any };
    [key: string]: any;
  };
  order?: {
    id: number;
    customer?: {
      id: number;
      name: string;
      [key: string]: any;
    };
    fitter?: {
      id: number;
      name: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}