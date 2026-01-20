"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { EditOrder } from './EditOrder';
import { OrderSaddleInfo } from './shared/OrderSaddleInfo';
import { OrderFitterInfo } from './shared/OrderFitterInfo';
import { OrderPriceInfo } from './shared/OrderPriceInfo';
import { OrderOptions } from './shared/OrderOptions';
import { CommentsList } from './shared/CommentsList';
import { generateOrderPDF } from '@/lib/generate-pdf';

interface OrderDetailsProps {
  order: {
    id: string;
    orderId: number;
    status: string;
  };
  onClose: () => void;
}

export function OrderDetails({ order, onClose }: OrderDetailsProps) {
  const [orderStatus, setOrderStatus] = useState(order.status);
  const [comment, setComment] = useState('');
  const [sendTo, setSendTo] = useState('fitter-factory');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [formData, setFormData] = useState({});

  // Mock data based on the image
  const orderData = {
    saddle: {
      model: 'Custom Advantage R',
      leatherType: 'BBL - BUFFALO BLACK - Solid',
      seatSize: '17.5',
      flapLength: '16',
      kneeRoll: 'Custom C1 (Short)',
      frontGusset: 'FRONT Gusset',
      rearGusset: 'Normal Rear Guset (STD)',
      gussetLeather: 'SBL - SMOOTH BLACK',
      panelMaterial: 'WOOL Flocked Panels',
      treeSize: 'Med Wide',
      stirrupBars: 'Normal Dressage Bars (silver Custom w/thumb bit)',
      billets: 'Normal MATCHING Billets',
      seatLeather: 'VBBL - VIENNA BUFFALO BLACK',
      seatOption: 'NORMAL Seat',
      cantleOption: 'NORMAL Cantle',
      skirt: 'BBL - BUFFALO BLACK - Solid',
      kneeRollPadLeather: 'SBL - SMOOTH BLACK',
      flapLeather: 'BBL - BUFFALO BLACK - Solid',
      outerReinforcement: 'NO Flap piece (Buffalo/Memal leather)',
      loops: 'STD - LOOPS',
      panelLeather: 'SBL - SMOOTH BLACK',
      facingFront: 'SBL - SMOOTH BLACK',
      facingBackRear: 'SBL - SMOOTH BLACK',
      gulletLining: 'SBL - SMOOTH BLACK',
      stitchColor: 'Black',
      weltColor: 'Black PATENT'
    },
    fitter: {
      inInventory: 'yes',
      userName: 'aikenshop123',
      fullName: 'Aiken Shop',
      address: '390 Croft Mill Rd',
      zipcode: '29801',
      state: 'South Carolina',
      city: 'Aiken',
      country: 'United States',
      phone: '8036492766',
      cell: '8036463490',
      currency: 'USD',
      email: 'aiken@mysaddle.com'
    },
    price: {
      saddlePrice: 5195.00,
      tradeIn: 0.00,
      deposit: 0.00,
      discount: 0.00,
      fittingEval: 0.00,
      callFee: 0.00,
      girth: 0.00,
      additional: '-',
      shipping: '-',
      tax: '-',
      total: 5195.00
    },
    notes: 'finished - AH Training',
    serialno: 'US5705400070825',
    orderDate: 'April 17, 2025',
    history: [
      {
        date: 'April 17, 2025 | 10:33AM',
        user: 'Adam Whitehouse',
        action: 'Changed the order status to \'In Production P1\''
      },
      {
        date: 'April 17, 2025 | 10:33AM',
        user: 'Adam Whitehouse',
        action: 'Changed the order status to \'Ordered\''
      },
      {
        date: 'April 17, 2025 | 10:33AM',
        user: 'Adam Whitehouse',
        action: 'Ordered the saddle to be added to fitters inventory'
      },
      {
        date: 'April 17, 2025 | 10:33AM',
        user: 'Adam Whitehouse',
        action: 'Created the order.'
      }
    ]
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handlePrintOrder = () => {
    const doc = generateOrderPDF(orderData);
    doc.save(`order-${order.orderId}.pdf`);
  };

  const handleDuplicateOrder = () => {
    const duplicateData = {
      fitter: orderData.fitter.fullName,
      isStock: true,
      isDemo: false,
      isUrgent: false,
      isSponsored: false,
      isRepair: false,
      repairNotes: '',
      brand: 'Custom',
      model: orderData.saddle.model,
      preset: '',
      leatherType: orderData.saddle.leatherType,
      seatSize: orderData.saddle.seatSize,
      flapLength: orderData.saddle.flapLength,
      kneeRoll: orderData.saddle.kneeRoll,
      frontGusset: orderData.saddle.frontGusset,
      rearGusset: orderData.saddle.rearGusset,
      gussetLeather: orderData.saddle.gussetLeather,
      panelMaterial: orderData.saddle.panelMaterial,
      treeSize: orderData.saddle.treeSize,
      stirrupBars: orderData.saddle.stirrupBars,
      billets: orderData.saddle.billets,
      seatLeather: orderData.saddle.seatLeather,
      seatOption: orderData.saddle.seatOption,
      cantleOption: orderData.saddle.cantleOption,
      skirt: orderData.saddle.skirt,
      kneeRollPadLeather: orderData.saddle.kneeRollPadLeather,
      flapLeather: orderData.saddle.flapLeather,
      outerReinforcement: orderData.saddle.outerReinforcement,
      loops: orderData.saddle.loops,
      panelLeather: orderData.saddle.panelLeather,
      facingFront: orderData.saddle.facingFront,
      facingBack: orderData.saddle.facingBackRear,
      gulletLining: orderData.saddle.gulletLining,
      stitchColor: orderData.saddle.stitchColor,
      weltColor: orderData.saddle.weltColor,
      extras: {
        completeReblock: false,
        overflocking: false,
        treeAdjustment: false,
        fittedByFactory: false,
        coveredNylonStirrup: false,
        iconFlexAirGirth: false,
        deluxeGirth: false,
        contourGirth: false,
        thinlineFleece: false,
      },
      specialNotes: orderData.notes,
      price: orderData.price.saddlePrice,
      tradeIn: 0,
      deposit: 0,
      discount: 0,
      fittingEval: 0,
      callFee: 0,
      girth: 0,
      additional: 0,
      shipping: null,
      tax: null,
      customerEmail: '',
      customerName: '',
      customerAddress: '',
      customerCity: '',
      customerZipcode: '',
      customerCountry: '',
      customerReference: '',
      shippingName: '',
      shippingAddress: '',
      shippingCity: '',
      shippingCountry: '',
      shippingZipcode: '',
    };

    setIsDuplicateOpen(true);
    setFormData(duplicateData);
  };

  return (
    <>
      <DialogContent className="max-w-[1200px] h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-4 py-2 border-b bg-[#F5F5F5] flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 rounded-full bg-[#8B0000] text-white flex items-center justify-center text-xs">
              D
            </div>
            <span className="text-base">Order {order.orderId}</span>
            <span className="text-xs font-normal ml-4">
              Order date: {orderData.orderDate}
            </span>
            <span className="ml-auto text-xs">
              Status: {orderStatus}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column - Your order reference & Saddle Information */}
              <div className="space-y-6">
                {/* Your order reference section */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-4">Your order reference</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Your reference</span>
                      <span className="text-gray-900">{orderData.notes}</span>
                    </div>
                  </div>
                </div>

                {/* Saddle information section */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-4">Saddle information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Model:</span>
                      <span className="text-gray-900">{orderData.saddle.model}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Leathertype:</span>
                      <span className="text-gray-900">{orderData.saddle.leatherType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Options</span>
                      <span className="text-gray-900"></span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Seat Size</span>
                      <span className="text-gray-900">{orderData.saddle.seatSize}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Flap Length</span>
                      <span className="text-gray-900">{orderData.saddle.flapLength}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Knee Roll</span>
                      <span className="text-gray-900">{orderData.saddle.kneeRoll}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Front Gusset</span>
                      <span className="text-gray-900">{orderData.saddle.frontGusset}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Rear Gusset</span>
                      <span className="text-gray-900">{orderData.saddle.rearGusset}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Gusset Leather</span>
                      <span className="text-gray-900">{orderData.saddle.gussetLeather}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Panel Material</span>
                      <span className="text-gray-900">{orderData.saddle.panelMaterial}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Tree Size</span>
                      <span className="text-gray-900">{orderData.saddle.treeSize}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Stirrup Bars</span>
                      <span className="text-gray-900">{orderData.saddle.stirrupBars}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Billets</span>
                      <span className="text-gray-900">{orderData.saddle.billets}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Seat Leather</span>
                      <span className="text-gray-900">{orderData.saddle.seatLeather}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">SEAT Option</span>
                      <span className="text-gray-900">{orderData.saddle.seatOption}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">CANTLE Option</span>
                      <span className="text-gray-900">{orderData.saddle.cantleOption}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Skirt</span>
                      <span className="text-gray-900">{orderData.saddle.skirt}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Knee Roll/ Pad Leather</span>
                      <span className="text-gray-900">{orderData.saddle.kneeRollPadLeather}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Flap Leather</span>
                      <span className="text-gray-900">{orderData.saddle.flapLeather}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column - Fitter Information & Customer Information & Order Status */}
              <div className="space-y-6">
                {/* Fitter information section */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-4">Fitter information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">In inventory:</span>
                      <span className="text-gray-900 italic">{orderData.fitter.inInventory}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">User Name:</span>
                      <span className="text-gray-900 italic">{orderData.fitter.userName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Full Name:</span>
                      <span className="text-gray-900 italic">{orderData.fitter.fullName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Address:</span>
                      <span className="text-gray-900 italic">{orderData.fitter.address}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Zipcode:</span>
                      <span className="text-gray-900 italic">{orderData.fitter.zipcode}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">State:</span>
                      <span className="text-gray-900 italic">-</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">City:</span>
                      <span className="text-gray-900 italic">{orderData.fitter.city}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Country:</span>
                      <span className="text-gray-900 italic">{orderData.fitter.country}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Phone:</span>
                      <span className="text-gray-900 italic">{orderData.fitter.phone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Cell:</span>
                      <span className="text-gray-900 italic">-</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Currency:</span>
                      <span className="text-gray-900 italic">{orderData.fitter.currency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Email address:</span>
                      <span className="text-gray-900 italic">{orderData.fitter.email}</span>
                    </div>
                  </div>
                </div>

                {/* Customer information section */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-4">Customer information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Customer:</span>
                      <span className="text-gray-900">{orderData.fitter.fullName}</span>
                    </div>
                    <div className="text-sm text-gray-900">
                      {orderData.fitter.address}<br/>
                      {orderData.fitter.city}, {orderData.fitter.zipcode}<br/>
                      {orderData.fitter.country}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Email address:</span>
                      <span className="text-gray-900 italic">{orderData.fitter.email}</span>
                    </div>
                  </div>
                </div>

                {/* Order Status section */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-4">Order Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-700 text-sm">Order Status:</span>
                      <Select value={orderStatus} onValueChange={setOrderStatus}>
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ordered">Ordered</SelectItem>
                          <SelectItem value="In Production P1">In Production P1</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="destructive" size="sm" className="bg-[#8B0000] h-8 text-xs">
                      Change orderstatus
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column - Price */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-4">Price</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Saddle price:</span>
                    <span className="text-gray-900">{orderData.price.saddlePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Trade in:</span>
                    <span className="text-gray-900">- {orderData.price.tradeIn.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Deposit:</span>
                    <span className="text-gray-900">- {orderData.price.deposit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Discount:</span>
                    <span className="text-gray-900">- {orderData.price.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Fitting/Eval:</span>
                    <span className="text-gray-900">{orderData.price.fittingEval.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Call fee:</span>
                    <span className="text-gray-900">{orderData.price.callFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Girth:</span>
                    <span className="text-gray-900">{orderData.price.girth.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Additional:</span>
                    <span className="text-gray-900">{typeof orderData.price.additional === 'number' ? orderData.price.additional.toFixed(2) : orderData.price.additional}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Shipping:</span>
                    <span className="text-gray-900">{typeof orderData.price.shipping === 'number' ? orderData.price.shipping.toFixed(2) : orderData.price.shipping}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Tax:</span>
                    <span className="text-gray-900">{typeof orderData.price.tax === 'number' ? orderData.price.tax.toFixed(2) : orderData.price.tax}</span>
                  </div>
                  <div className="text-xs text-gray-600 py-2">
                    Shippingcosts and Taxes will be determined by Custom Saddlery.
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total (DE):</span>
                      <span>{orderData.price.total.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      Your deposit is non-refundable if your order is canceled.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="border rounded-lg p-3">
              <div className="flex gap-3 mb-3">
                <Textarea 
                  placeholder="Add your comment here..."
                  className="min-h-[80px] text-xs"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="space-y-2">
                  <Select value={sendTo} onValueChange={setSendTo}>
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                      <SelectValue>
                        {sendTo === 'fitter-factory' && 'Fitter & Factory'}
                        {sendTo === 'fitter' && 'Only Fitter'}
                        {sendTo === 'factory' && 'Only Factory'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fitter-factory">Fitter & Factory</SelectItem>
                      <SelectItem value="fitter">Only Fitter</SelectItem>
                      <SelectItem value="factory">Only Factory</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="destructive" size="sm" className="w-full bg-[#8B0000] h-8 text-xs">
                    Add comment
                  </Button>
                </div>
              </div>

              {/* Comment History */}
              <div className="relative pl-4 border-l-2 border-gray-200">
                {orderData.history.map((entry, index) => (
                  <div key={index} className="mb-2 relative">
                    <div className="absolute -left-[17px] top-2 w-3 h-3 rounded-full bg-gray-200" />
                    <div className="bg-gray-100 rounded-lg p-2">
                      <div className="text-[10px] text-gray-600">{entry.date}</div>
                      <div className="font-medium text-[#8B0000] text-xs">{entry.user}</div>
                      <div className="text-xs">{entry.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="border-t p-2 bg-[#F5F5F5] flex-shrink-0">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => setIsEditOpen(true)}
            >
              Edit order
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={handlePrintOrder}
            >
              Print order
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs">Print label</Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={handleDuplicateOrder}
            >
              Duplicate order
            </Button>
          </div>
        </div>
      </DialogContent>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <EditOrder 
          order={order}
          onClose={() => setIsEditOpen(false)}
        />
      </Dialog>

      <Dialog open={isDuplicateOpen} onOpenChange={setIsDuplicateOpen}>
        <EditOrder 
          order={undefined}
          initialData={formData}
          onClose={() => setIsDuplicateOpen(false)}
        />
      </Dialog>
    </>
  );
}