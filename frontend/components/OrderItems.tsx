"use client";

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package, Tag, DollarSign } from 'lucide-react';

interface Brand {
  name: string;
}

interface Model {
  brand: Brand;
  name: string;
  discipline: string;
}

interface LeatherType {
  name: string;
}

interface ModelLeatherPriceContainer {
  price: {
    USD: number;
    EUR: number;
    GBP: number;
    CAD: number;
    AUD: number;
    NL_EUR: number;
    DE_EUR: number;
  };
  leatherType: LeatherType;
}

interface Product {
  id: string;
  name: string;
  productId: number;
  model: Model;
  leatherPriceContainer: ModelLeatherPriceContainer;
  stock: number;
  hasBeenOrdered: boolean;
}

interface Order {
  orderId: number;
  name: string;
  orderStatus: string;
  orderTime: string;
  currency: string;
}

interface OrderLine {
  id: string;
  order: Order;
  product: Product;
  priceTradeIn: number | null;
  priceDeposit: number | null;
  priceDiscount: number | null;
  priceFittingEval: number | null;
  priceCallFee: number | null;
  priceGirth: number | null;
  priceAdditionalCosts: number | null;
  priceShipping: number | null;
  priceTax: number | null;
  createdAt: string;
  updatedAt: string;
}

// Sample data based on the API response
const orderLines: OrderLine[] = [
  {
    id: '738b091d-00f8-4d80-85af-fa5698b31b97',
    order: {
      orderId: 43982,
      name: 'Aiken Shop',
      orderStatus: 'ORDERED',
      orderTime: '2025-03-20T15:59:50+00:00',
      currency: 'USD',
    },
    product: {
      id: 'a9a25bac-fc06-4982-8ab0-be82a5b0565d',
      name: 'Aviar Rook 2.0 (K644B) 16 17.5 17 16',
      productId: 43988,
      model: {
        brand: {
          name: 'Aviar'
        },
        name: 'Rook 2.0 (K644B)',
        discipline: 'DRESSAGE'
      },
      leatherPriceContainer: {
        price: {
          USD: 6295,
          EUR: 4795,
          GBP: 4495,
          CAD: 6795,
          AUD: 7395,
          NL_EUR: 4795,
          DE_EUR: 5395
        },
        leatherType: {
          name: 'ASBLV - Aviar SMOOTH Black Vienna'
        }
      },
      stock: 0,
      hasBeenOrdered: false
    },
    priceTradeIn: null,
    priceDeposit: null,
    priceDiscount: null,
    priceFittingEval: null,
    priceCallFee: null,
    priceGirth: null,
    priceAdditionalCosts: null,
    priceShipping: null,
    priceTax: null,
    createdAt: '2025-03-20T15:59:50+00:00',
    updatedAt: '2025-03-20T15:59:50+00:00'
  }
];

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function OrderItems() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Order Items</h2>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search order items..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Details</TableHead>
              <TableHead>Order Info</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderLines.map((line) => (
              <TableRow key={line.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {line.product.model.brand.name} {line.product.model.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Product ID: #{line.product.productId}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Tag className="h-4 w-4" />
                      {line.product.leatherPriceContainer.leatherType.name}
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      {line.product.model.discipline}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">Order #{line.order.orderId}</div>
                    <div className="text-sm text-muted-foreground">
                      {line.order.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(line.order.orderTime)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {formatCurrency(
                        line.product.leatherPriceContainer.price[line.order.currency as keyof typeof line.product.leatherPriceContainer.price],
                        line.order.currency
                      )}
                    </div>
                    {(line.priceDiscount || line.priceShipping || line.priceTax) && (
                      <div className="text-sm text-muted-foreground">
                        {line.priceDiscount && <div>Discount: {formatCurrency(line.priceDiscount, line.order.currency)}</div>}
                        {line.priceShipping && <div>Shipping: {formatCurrency(line.priceShipping, line.order.currency)}</div>}
                        {line.priceTax && <div>Tax: {formatCurrency(line.priceTax, line.order.currency)}</div>}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    line.order.orderStatus === 'ORDERED'
                      ? 'bg-blue-100 text-blue-800'
                      : line.order.orderStatus === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {line.order.orderStatus}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}